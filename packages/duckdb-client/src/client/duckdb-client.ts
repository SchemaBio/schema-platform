/**
 * DuckDB Client
 */

import * as duckdb from '@duckdb/duckdb-wasm';
import type { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import type { DuckDBClientConfig, ConnectionStats, LogLevel } from '../types/config.js';
import { DEFAULT_CONFIG } from '../types/config.js';
import type { QueryResult, ColumnMetadata } from '../types/query.js';
import {
  ConnectionError,
  QuerySyntaxError,
  QueryTimeoutError,
  OutOfMemoryError,
  wrapError,
  ErrorCode,
} from '../types/errors.js';
import { ConnectionPool } from './connection-pool.js';

/**
 * DuckDB client for executing queries
 */
export class DuckDBClient {
  private readonly config: Required<Omit<DuckDBClientConfig, 'path' | 'logger'>> & {
    path?: string;
    logger?: (level: LogLevel, message: string, data?: unknown) => void;
  };
  private db: AsyncDuckDB | null = null;
  private pool: ConnectionPool | null = null;
  private initialized = false;

  constructor(config: DuckDBClientConfig = { mode: 'memory' }) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Initialize the DuckDB client
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.log('info', 'Initializing DuckDB client', { config: this.config });

    try {
      await this.initializeWithRetry();
      this.initialized = true;
      this.log('info', 'DuckDB client initialized successfully');
    } catch (error) {
      this.log('error', 'Failed to initialize DuckDB client', { error });
      throw wrapError(error, ErrorCode.CONNECTION_FAILED);
    }
  }

  /**
   * Execute a raw SQL query
   */
  async execute<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    this.ensureInitialized();

    const startTime = Date.now();
    this.log('debug', 'Executing query', { sql, params });

    try {
      const result = await this.executeWithTimeout(sql, params);
      const executionTime = Date.now() - startTime;

      this.log('debug', 'Query completed', { executionTime, rowCount: result.rows.length });

      return {
        ...result,
        executionTime,
      } as QueryResult<T>;
    } catch (error) {
      this.log('error', 'Query failed', { sql, error });
      throw this.handleQueryError(error, sql);
    }
  }

  /**
   * Execute a query and return a single row
   */
  async executeOne<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
  ): Promise<T | null> {
    const result = await this.execute<T>(sql, params);
    return result.rows[0] ?? null;
  }

  /**
   * Execute a query and return the count
   */
  async executeCount(sql: string, params?: unknown[]): Promise<number> {
    const result = await this.execute<{ count: number }>(sql, params);
    return result.rows[0]?.count ?? 0;
  }

  /**
   * Get connection statistics
   */
  getStats(): ConnectionStats {
    if (!this.pool) {
      return {
        totalConnections: 0,
        activeConnections: 0,
        idleConnections: 0,
        totalQueries: 0,
        avgQueryTime: 0,
        peakMemoryUsage: 0,
        currentMemoryUsage: 0,
      };
    }

    return this.pool.getStats();
  }

  /**
   * Check if client is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get the underlying DuckDB instance
   */
  getDatabase(): AsyncDuckDB | null {
    return this.db;
  }

  /**
   * Dispose the client and release all resources
   */
  async dispose(): Promise<void> {
    this.log('info', 'Disposing DuckDB client');

    if (this.pool) {
      await this.pool.dispose();
      this.pool = null;
    }

    if (this.db) {
      await this.db.terminate();
      this.db = null;
    }

    this.initialized = false;
    this.log('info', 'DuckDB client disposed');
  }

  /**
   * Initialize with retry logic
   */
  private async initializeWithRetry(maxRetries = 3): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.doInitialize();
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.log('warn', `Initialization attempt ${attempt} failed`, { error: lastError });

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 100;
          await this.sleep(delay);
        }
      }
    }

    throw new ConnectionError(
      `Failed to initialize after ${maxRetries} attempts: ${lastError?.message}`,
      maxRetries,
      lastError ?? undefined
    );
  }

  /**
   * Perform actual initialization
   */
  private async doInitialize(): Promise<void> {
    // Select appropriate bundle based on environment
    const bundle = await this.selectBundle();

    // Instantiate DuckDB
    const worker = new Worker(bundle.mainWorker!);
    const logger = new duckdb.ConsoleLogger();
    this.db = new duckdb.AsyncDuckDB(logger, worker);

    await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);

    // Open database
    if (this.config.mode === 'file' && this.config.path) {
      await this.db.open({
        path: this.config.path,
        query: {
          castBigIntToDouble: true,
        },
      });
    } else {
      await this.db.open({
        query: {
          castBigIntToDouble: true,
        },
      });
    }

    // Create connection pool
    this.pool = new ConnectionPool({
      maxConnections: this.config.maxConnections,
      connectionFactory: () => this.createConnection(),
    });
  }

  /**
   * Select the appropriate DuckDB bundle
   */
  private async selectBundle(): Promise<duckdb.DuckDBBundle> {
    const bundles = duckdb.getJsDelivrBundles();

    // Select best bundle for current environment
    const bundle = await duckdb.selectBundle(bundles);

    if (!bundle.mainWorker) {
      throw new Error('No suitable DuckDB bundle found for this environment');
    }

    return bundle;
  }

  /**
   * Create a new database connection
   */
  private async createConnection(): Promise<AsyncDuckDBConnection> {
    if (!this.db) {
      throw new ConnectionError('Database not initialized');
    }

    return this.db.connect();
  }

  /**
   * Execute query with timeout
   */
  private async executeWithTimeout(
    sql: string,
    params?: unknown[]
  ): Promise<{ rows: Record<string, unknown>[]; columns: ColumnMetadata[]; rowsAffected?: number }> {
    if (!this.pool) {
      throw new ConnectionError('Connection pool not initialized');
    }

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new QueryTimeoutError(sql, this.config.queryTimeout));
      }, this.config.queryTimeout);
    });

    const queryPromise = this.pool.withConnection(async (conn) => {
      let result;
      if (params && params.length > 0) {
        const stmt = await conn.prepare(sql);
        result = await stmt.query(...params);
        await stmt.close();
      } else {
        result = await conn.query(sql);
      }

      // Convert Arrow table to array of objects
      const rows: Record<string, unknown>[] = [];
      const columns: ColumnMetadata[] = [];

      // Get column metadata
      for (let i = 0; i < result.numCols; i++) {
        const field = result.schema.fields[i];
        columns.push({
          name: field.name,
          type: field.type.toString(),
          nullable: field.nullable,
        });
      }

      // Convert rows
      for (const row of result) {
        const obj: Record<string, unknown> = {};
        for (const col of columns) {
          obj[col.name] = row[col.name];
        }
        rows.push(obj);
      }

      return { rows, columns };
    });

    return Promise.race([queryPromise, timeoutPromise]);
  }

  /**
   * Handle query errors
   */
  private handleQueryError(error: unknown, sql: string): Error {
    if (error instanceof QueryTimeoutError) {
      return error;
    }

    const message = error instanceof Error ? error.message : String(error);

    // Check for syntax errors
    if (message.includes('Parser Error') || message.includes('syntax error')) {
      return new QuerySyntaxError(message, sql);
    }

    // Check for out of memory
    if (message.includes('out of memory') || message.includes('OutOfMemory')) {
      return new OutOfMemoryError(0, this.config.memoryLimit);
    }

    return wrapError(error, ErrorCode.UNKNOWN);
  }

  /**
   * Ensure client is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new ConnectionError('DuckDB client not initialized. Call initialize() first.');
    }
  }

  /**
   * Log a message
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.config.enableLogging) {
      return;
    }

    if (this.config.logger) {
      this.config.logger(level, message, data);
    } else {
      const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
      logFn(`[DuckDB] ${level.toUpperCase()}: ${message}`, data ?? '');
    }
  }

  /**
   * Sleep for a given duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
