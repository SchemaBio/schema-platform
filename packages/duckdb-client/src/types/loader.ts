/**
 * Data Loader Types
 */

/**
 * Supported data formats
 */
export type DataFormat = 'parquet' | 'csv' | 'json';

/**
 * Column data type
 */
export type ColumnType =
  | 'BOOLEAN'
  | 'TINYINT'
  | 'SMALLINT'
  | 'INTEGER'
  | 'BIGINT'
  | 'FLOAT'
  | 'DOUBLE'
  | 'VARCHAR'
  | 'DATE'
  | 'TIMESTAMP'
  | 'BLOB'
  | 'UUID';

/**
 * Parquet loading options
 */
export interface ParquetOptions {
  /** Specific columns to load (loads all if not specified) */
  columns?: string[];

  /** Row groups to load (loads all if not specified) */
  rowGroups?: number[];

  /** Enable parallel loading */
  parallel?: boolean;
}

/**
 * CSV loading options
 */
export interface CSVOptions {
  /** Column delimiter (default: ',') */
  delimiter?: string;

  /** Has header row (default: true) */
  header?: boolean;

  /** Column types mapping */
  types?: Record<string, ColumnType>;

  /** Number of rows to skip at the beginning */
  skipRows?: number;

  /** Quote character (default: '"') */
  quote?: string;

  /** Escape character (default: '"') */
  escape?: string;

  /** Null string representation (default: '') */
  nullStr?: string;

  /** Date format string */
  dateFormat?: string;

  /** Timestamp format string */
  timestampFormat?: string;

  /** Maximum number of rows to load */
  maxRows?: number;

  /** Sample size for type inference */
  sampleSize?: number;

  /** Force specific columns to be loaded */
  forceColumns?: string[];

  /** Ignore errors and continue loading */
  ignoreErrors?: boolean;
}

/**
 * JSON loading options
 */
export interface JSONOptions {
  /** JSON path to the data array (e.g., '$.data', '$.results[*]') */
  path?: string;

  /** Flatten nested objects */
  flatten?: boolean;

  /** Maximum nesting depth for flattening */
  maxDepth?: number;

  /** Column types mapping */
  types?: Record<string, ColumnType>;

  /** Maximum number of records to load */
  maxRecords?: number;

  /** Ignore parsing errors */
  ignoreErrors?: boolean;
}

/**
 * Table schema definition
 */
export interface TableSchema {
  /** Table name */
  name: string;

  /** Column definitions */
  columns: ColumnDefinition[];

  /** Primary key columns */
  primaryKey?: string[];

  /** Indexes */
  indexes?: IndexDefinition[];
}

/**
 * Column definition
 */
export interface ColumnDefinition {
  /** Column name */
  name: string;

  /** Column type */
  type: ColumnType;

  /** Is nullable (default: true) */
  nullable?: boolean;

  /** Default value */
  defaultValue?: unknown;

  /** Column description */
  description?: string;
}

/**
 * Index definition
 */
export interface IndexDefinition {
  /** Index name */
  name: string;

  /** Indexed columns */
  columns: string[];

  /** Is unique index */
  unique?: boolean;
}

/**
 * Data load result
 */
export interface LoadResult {
  /** Table name */
  tableName: string;

  /** Number of rows loaded */
  rowCount: number;

  /** Number of columns */
  columnCount: number;

  /** Column metadata */
  columns: ColumnMetadata[];

  /** Load duration in milliseconds */
  duration: number;

  /** Warnings during load */
  warnings?: string[];

  /** Bytes loaded */
  bytesLoaded?: number;
}

/**
 * Column metadata from loaded data
 */
export interface ColumnMetadata {
  /** Column name */
  name: string;

  /** Inferred or specified type */
  type: ColumnType;

  /** Is nullable */
  nullable: boolean;

  /** Number of null values */
  nullCount?: number;

  /** Number of distinct values (if computed) */
  distinctCount?: number;
}

/**
 * Schema validation result
 */
export interface ValidationResult {
  /** Is valid */
  valid: boolean;

  /** Validation errors */
  errors: ValidationError[];

  /** Validation warnings */
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Error type */
  type: 'missing_column' | 'type_mismatch' | 'null_violation' | 'constraint_violation';

  /** Column name */
  column: string;

  /** Error message */
  message: string;

  /** Row number (if applicable) */
  rowNumber?: number;

  /** Expected value/type */
  expected?: string;

  /** Actual value/type */
  actual?: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  /** Warning type */
  type: 'extra_column' | 'type_coercion' | 'truncation';

  /** Column name */
  column: string;

  /** Warning message */
  message: string;
}

/**
 * Data source (for browser loading)
 */
export interface DataSource {
  /** Source type */
  type: 'url' | 'buffer' | 'file';

  /** URL (for 'url' type) */
  url?: string;

  /** ArrayBuffer (for 'buffer' type) */
  buffer?: ArrayBuffer;

  /** File object (for 'file' type) */
  file?: File;

  /** Data format */
  format: DataFormat;
}
