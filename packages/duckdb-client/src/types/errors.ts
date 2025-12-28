/**
 * Error Types
 */

/**
 * Error codes
 */
export enum ErrorCode {
  /** Connection failed */
  CONNECTION_FAILED = 'CONNECTION_FAILED',

  /** Query syntax error */
  QUERY_SYNTAX_ERROR = 'QUERY_SYNTAX_ERROR',

  /** Query execution timeout */
  QUERY_TIMEOUT = 'QUERY_TIMEOUT',

  /** Type mismatch error */
  TYPE_MISMATCH = 'TYPE_MISMATCH',

  /** Out of memory error */
  OUT_OF_MEMORY = 'OUT_OF_MEMORY',

  /** Data loading failed */
  DATA_LOAD_FAILED = 'DATA_LOAD_FAILED',

  /** Schema validation failed */
  SCHEMA_VALIDATION_FAILED = 'SCHEMA_VALIDATION_FAILED',

  /** Result transformation failed */
  TRANSFORMATION_FAILED = 'TRANSFORMATION_FAILED',

  /** Resource exhausted */
  RESOURCE_EXHAUSTED = 'RESOURCE_EXHAUSTED',

  /** Invalid configuration */
  INVALID_CONFIG = 'INVALID_CONFIG',

  /** Table not found */
  TABLE_NOT_FOUND = 'TABLE_NOT_FOUND',

  /** Column not found */
  COLUMN_NOT_FOUND = 'COLUMN_NOT_FOUND',

  /** Query cancelled */
  QUERY_CANCELLED = 'QUERY_CANCELLED',

  /** WASM initialization failed */
  WASM_INIT_FAILED = 'WASM_INIT_FAILED',

  /** File not found */
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',

  /** Permission denied */
  PERMISSION_DENIED = 'PERMISSION_DENIED',

  /** Unknown error */
  UNKNOWN = 'UNKNOWN',
}

/**
 * Base DuckDB error class
 */
export class DuckDBError extends Error {
  /** Error code */
  public readonly code: ErrorCode;

  /** Additional error details */
  public readonly details?: Record<string, unknown>;

  /** Original error (if wrapped) */
  public readonly cause?: Error;

  constructor(
    message: string,
    code: ErrorCode,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message);
    this.name = 'DuckDBError';
    this.code = code;
    this.details = details;
    this.cause = cause;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DuckDBError);
    }
  }

  /**
   * Convert to JSON for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      stack: this.stack,
    };
  }
}

/**
 * Connection error
 */
export class ConnectionError extends DuckDBError {
  constructor(
    message: string,
    public readonly retryCount?: number,
    cause?: Error
  ) {
    super(message, ErrorCode.CONNECTION_FAILED, { retryCount }, cause);
    this.name = 'ConnectionError';
  }
}

/**
 * Query syntax error
 */
export class QuerySyntaxError extends DuckDBError {
  /** The SQL that caused the error */
  public readonly sql: string;

  /** Position in the SQL where error occurred */
  public readonly position?: number;

  /** Suggested fix */
  public readonly suggestion?: string;

  constructor(
    message: string,
    sql: string,
    position?: number,
    suggestion?: string,
    cause?: Error
  ) {
    super(message, ErrorCode.QUERY_SYNTAX_ERROR, { sql, position, suggestion }, cause);
    this.name = 'QuerySyntaxError';
    this.sql = sql;
    this.position = position;
    this.suggestion = suggestion;
  }
}

/**
 * Query timeout error
 */
export class QueryTimeoutError extends DuckDBError {
  /** Query that timed out */
  public readonly sql: string;

  /** Timeout duration in milliseconds */
  public readonly timeout: number;

  constructor(sql: string, timeout: number) {
    super(`Query timed out after ${timeout}ms`, ErrorCode.QUERY_TIMEOUT, { sql, timeout });
    this.name = 'QueryTimeoutError';
    this.sql = sql;
    this.timeout = timeout;
  }
}

/**
 * Type mismatch error
 */
export class TypeMismatchError extends DuckDBError {
  /** Column name */
  public readonly column: string;

  /** Expected type */
  public readonly expectedType: string;

  /** Actual type */
  public readonly actualType: string;

  constructor(column: string, expectedType: string, actualType: string) {
    super(
      `Type mismatch for column "${column}": expected ${expectedType}, got ${actualType}`,
      ErrorCode.TYPE_MISMATCH,
      { column, expectedType, actualType }
    );
    this.name = 'TypeMismatchError';
    this.column = column;
    this.expectedType = expectedType;
    this.actualType = actualType;
  }
}

/**
 * Out of memory error
 */
export class OutOfMemoryError extends DuckDBError {
  /** Current memory usage in bytes */
  public readonly currentUsage: number;

  /** Memory limit in bytes */
  public readonly limit: number;

  constructor(currentUsage: number, limit: number) {
    super(
      `Out of memory: using ${formatBytes(currentUsage)} of ${formatBytes(limit)} limit`,
      ErrorCode.OUT_OF_MEMORY,
      { currentUsage, limit }
    );
    this.name = 'OutOfMemoryError';
    this.currentUsage = currentUsage;
    this.limit = limit;
  }
}

/**
 * Data load error
 */
export class DataLoadError extends DuckDBError {
  /** Data source */
  public readonly source: string;

  /** Row number where error occurred */
  public readonly rowNumber?: number;

  /** Column name where error occurred */
  public readonly columnName?: string;

  constructor(
    message: string,
    source: string,
    rowNumber?: number,
    columnName?: string,
    cause?: Error
  ) {
    super(message, ErrorCode.DATA_LOAD_FAILED, { source, rowNumber, columnName }, cause);
    this.name = 'DataLoadError';
    this.source = source;
    this.rowNumber = rowNumber;
    this.columnName = columnName;
  }
}

/**
 * Schema validation error
 */
export class SchemaValidationError extends DuckDBError {
  /** Validation errors */
  public readonly validationErrors: Array<{
    type: string;
    column: string;
    message: string;
    rowNumber?: number;
  }>;

  constructor(
    validationErrors: Array<{
      type: string;
      column: string;
      message: string;
      rowNumber?: number;
    }>
  ) {
    const message = `Schema validation failed: ${validationErrors.length} error(s)`;
    super(message, ErrorCode.SCHEMA_VALIDATION_FAILED, { validationErrors });
    this.name = 'SchemaValidationError';
    this.validationErrors = validationErrors;
  }
}

/**
 * Transformation error
 */
export class TransformationError extends DuckDBError {
  /** Row index where error occurred */
  public readonly rowIndex?: number;

  /** Field name where error occurred */
  public readonly fieldName?: string;

  constructor(message: string, rowIndex?: number, fieldName?: string, cause?: Error) {
    super(message, ErrorCode.TRANSFORMATION_FAILED, { rowIndex, fieldName }, cause);
    this.name = 'TransformationError';
    this.rowIndex = rowIndex;
    this.fieldName = fieldName;
  }
}

/**
 * WASM initialization error
 */
export class WASMInitError extends DuckDBError {
  constructor(message: string, cause?: Error) {
    super(message, ErrorCode.WASM_INIT_FAILED, undefined, cause);
    this.name = 'WASMInitError';
  }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let value = bytes;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Check if an error is a DuckDB error
 */
export function isDuckDBError(error: unknown): error is DuckDBError {
  return error instanceof DuckDBError;
}

/**
 * Wrap an unknown error as a DuckDB error
 */
export function wrapError(error: unknown, defaultCode: ErrorCode = ErrorCode.UNKNOWN): DuckDBError {
  if (isDuckDBError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new DuckDBError(error.message, defaultCode, undefined, error);
  }

  return new DuckDBError(String(error), defaultCode);
}
