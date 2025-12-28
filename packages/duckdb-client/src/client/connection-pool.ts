/**
 * Connection Pool for DuckDB
 */

import type { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import type { ConnectionStats, ConnectionInfo, ConnectionState } from '../types/config.js';
import { ConnectionError } from '../types/errors.js';

/**
 * Pooled connection wrapper
 */
interface PooledConnection {
  /** Connection ID */
  id: string;
  /** Underlying DuckDB connection */
  connection: AsyncDuckDBConnection;
  /** Connection state */
  state: ConnectionState;
  /** Creation timestamp */
  createdAt: Date;
  /** Last used timestamp */
  lastUsedAt: Date;
  /** Number of queries executed */
  queryCount: number;
}

/**
 * Connection pool configuration
 */
export interface ConnectionPoolConfig {
  /** Maximum number of connections */
  maxConnections: number;
  /** Connection idle timeout in milliseconds */
  idleTimeout?: number;
  /** Connection factory function */
  connectionFactory: () => Promise<AsyncDuckDBConnection>;
}

/**
 * Connection pool for managing DuckDB connections
 */
export class ConnectionPool {
  private readonly config: ConnectionPoolConfig;
  private readonly connections: Map<string, PooledConnection> = new Map();
  private readonly waitQueue: Array<{
    resolve: (conn: PooledConnection) => void;
    reject: (err: Error) => void;
  }> = [];
  private connectionCounter = 0;
  private totalQueries = 0;
  private totalQueryTime = 0;
  private peakMemoryUsage = 0;
  private isDisposed = false;

  constructor(config: ConnectionPoolConfig) {
    this.config = {
      idleTimeout: 60000, // 1 minute default
      ...config,
    };
  }

  /**
   * Acquire a connection from the pool
   */
  async acquire(): Promise<PooledConnection> {
    if (this.isDisposed) {
      throw new ConnectionError('Connection pool is disposed');
    }

    // Try to find an idle connection
    for (const conn of this.connections.values()) {
      if (conn.state === 'idle') {
        conn.state = 'busy';
        conn.lastUsedAt = new Date();
        return conn;
      }
    }

    // Create a new connection if under limit
    if (this.connections.size < this.config.maxConnections) {
      return this.createConnection();
    }

    // Wait for a connection to become available
    return new Promise((resolve, reject) => {
      this.waitQueue.push({ resolve, reject });
    });
  }

  /**
   * Release a connection back to the pool
   */
  release(connection: PooledConnection): void {
    if (this.isDisposed) {
      // Close the connection if pool is disposed
      void connection.connection.close();
      this.connections.delete(connection.id);
      return;
    }

    connection.state = 'idle';
    connection.lastUsedAt = new Date();

    // Check if anyone is waiting for a connection
    const waiter = this.waitQueue.shift();
    if (waiter) {
      connection.state = 'busy';
      waiter.resolve(connection);
    }
  }

  /**
   * Execute a function with a connection from the pool
   */
  async withConnection<T>(fn: (conn: AsyncDuckDBConnection) => Promise<T>): Promise<T> {
    const pooledConn = await this.acquire();
    const startTime = Date.now();

    try {
      const result = await fn(pooledConn.connection);
      pooledConn.queryCount++;
      this.totalQueries++;
      this.totalQueryTime += Date.now() - startTime;
      return result;
    } finally {
      this.release(pooledConn);
    }
  }

  /**
   * Get connection statistics
   */
  getStats(): ConnectionStats {
    let activeConnections = 0;
    let idleConnections = 0;

    for (const conn of this.connections.values()) {
      if (conn.state === 'busy') {
        activeConnections++;
      } else if (conn.state === 'idle') {
        idleConnections++;
      }
    }

    return {
      totalConnections: this.connections.size,
      activeConnections,
      idleConnections,
      totalQueries: this.totalQueries,
      avgQueryTime: this.totalQueries > 0 ? this.totalQueryTime / this.totalQueries : 0,
      peakMemoryUsage: this.peakMemoryUsage,
      currentMemoryUsage: 0, // Will be updated by client
    };
  }

  /**
   * Get information about all connections
   */
  getConnectionInfo(): ConnectionInfo[] {
    return Array.from(this.connections.values()).map((conn) => ({
      id: conn.id,
      state: conn.state,
      createdAt: conn.createdAt,
      lastUsedAt: conn.lastUsedAt,
      queryCount: conn.queryCount,
    }));
  }

  /**
   * Update peak memory usage
   */
  updateMemoryUsage(bytes: number): void {
    if (bytes > this.peakMemoryUsage) {
      this.peakMemoryUsage = bytes;
    }
  }

  /**
   * Dispose the connection pool and close all connections
   */
  async dispose(): Promise<void> {
    this.isDisposed = true;

    // Reject all waiting requests
    for (const waiter of this.waitQueue) {
      waiter.reject(new ConnectionError('Connection pool is being disposed'));
    }
    this.waitQueue.length = 0;

    // Close all connections
    const closePromises: Promise<void>[] = [];
    for (const conn of this.connections.values()) {
      conn.state = 'closed';
      closePromises.push(conn.connection.close());
    }

    await Promise.all(closePromises);
    this.connections.clear();
  }

  /**
   * Create a new connection
   */
  private async createConnection(): Promise<PooledConnection> {
    const id = `conn_${++this.connectionCounter}`;
    const connection = await this.config.connectionFactory();
    const now = new Date();

    const pooledConn: PooledConnection = {
      id,
      connection,
      state: 'busy',
      createdAt: now,
      lastUsedAt: now,
      queryCount: 0,
    };

    this.connections.set(id, pooledConn);
    return pooledConn;
  }

  /**
   * Check if pool is disposed
   */
  get disposed(): boolean {
    return this.isDisposed;
  }

  /**
   * Get current pool size
   */
  get size(): number {
    return this.connections.size;
  }
}
