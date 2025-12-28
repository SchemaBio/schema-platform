/**
 * Type exports for @schema/duckdb-client
 */

// Configuration types
export type {
  DatabaseMode,
  DuckDBClientConfig,
  LogLevel,
  ConnectionStats,
  ConnectionState,
  ConnectionInfo,
} from './config.js';
export { DEFAULT_CONFIG } from './config.js';

// Query types
export type {
  ComparisonOperator,
  NullOperator,
  Operator,
  SortDirection,
  JoinType,
  JoinCondition,
  WhereCondition,
  OrderByClause,
  QueryResult,
  ColumnMetadata,
  AggregateFunction,
  AggregateExpression,
  RawSQL,
  QueryBuilderState,
  PaginationParams,
  PaginatedResult,
} from './query.js';

// Variant types
export type {
  Variant,
  RegionQueryParams,
  GeneQueryParams,
  VariantQueryParams,
  VariantFilter,
  CombinedFilter,
} from './variant.js';
export { VariantType, ClinicalSignificance } from './variant.js';

// Loader types
export type {
  DataFormat,
  ColumnType,
  ParquetOptions,
  CSVOptions,
  JSONOptions,
  TableSchema,
  ColumnDefinition,
  IndexDefinition,
  LoadResult,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  DataSource,
} from './loader.js';
export type { ColumnMetadata as LoaderColumnMetadata } from './loader.js';

// Statistics types
export type {
  VariantStatistics,
  NumericStats,
  StatisticsParams,
  HistogramParams,
  HistogramResult,
  HistogramBin,
  CompareParams,
  ComparisonResult,
  GroupStats,
  OverlapAnalysis,
  FieldComparison,
  CrossTabParams,
  CrossTabResult,
} from './statistics.js';

// Error types
export {
  ErrorCode,
  DuckDBError,
  ConnectionError,
  QuerySyntaxError,
  QueryTimeoutError,
  TypeMismatchError,
  OutOfMemoryError,
  DataLoadError,
  SchemaValidationError,
  TransformationError,
  WASMInitError,
  isDuckDBError,
  wrapError,
} from './errors.js';
