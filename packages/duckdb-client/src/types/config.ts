/**
 * DuckDB Client Configuration Types
 */

/**
 * Database mode
 */
export type DatabaseMode = 'memory' | 'file';

/**
 * DuckDB client configuration
 */
export interface DuckDBClientConfig {
  /** Database mode: 'memory' for in-memory, 'file' for file-based */
  mode: DatabaseMode;

  /** File path for file-based database (required when mode is 'file') */
  path?: string;

  /** Maximum number of connections in the pool (default: 4) */
  maxConnections?: number;

  /** Query timeout in milliseconds (default: 30000) */
  queryTimeout?: number;

  /** Memory limit in bytes for WASM environment */
  memoryLimit?: number;

  /** Enable query plan caching (default: true) */
  enableCache?: boolean;

  /** Enable logging (default: false) */
  enableLogging?: boolean;

  /** Custom logger function */
  logger?: (level: LogLevel, message: string, data?: unknown) => void;
}

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Connection statistics
 */
export interface ConnectionStats {
  /** Total number of connections created */
  totalConnections: number;

  /** Number of active connections */
  activeConnections: number;

  /** Number of idle connections */
  idleConnections: number;

  /** Total number of queries executed */
  totalQueries: number;

  /** Average query execution time in milliseconds */
  avgQueryTime: number;

  /** Peak memory usage in bytes */
  peakMemoryUsage: number;

  /** Current memory usage in bytes */
  currentMemoryUsage: number;
}

/**
 * Connection state
 */
export type ConnectionState = 'idle' | 'busy' | 'closed';

/**
 * Connection info
 */
export interface ConnectionInfo {
  /** Connection ID */
  id: string;

  /** Connection state */
  state: ConnectionState;

  /** Creation timestamp */
  createdAt: Date;

  /** Last used timestamp */
  lastUsedAt: Date;

  /** Number of queries executed on this connection */
  queryCount: number;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Required<Omit<DuckDBClientConfig, 'path' | 'logger'>> = {
  mode: 'memory',
  maxConnections: 4,
  queryTimeout: 30000,
  memoryLimit: 512 * 1024 * 1024, // 512MB
  enableCache: true,
  enableLogging: false,
};
