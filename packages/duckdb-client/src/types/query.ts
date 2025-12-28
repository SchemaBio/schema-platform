/**
 * Query Builder Types
 */

/**
 * SQL comparison operators
 */
export type ComparisonOperator =
  | '='
  | '!='
  | '<>'
  | '>'
  | '<'
  | '>='
  | '<='
  | 'LIKE'
  | 'ILIKE'
  | 'NOT LIKE'
  | 'NOT ILIKE';

/**
 * SQL null operators
 */
export type NullOperator = 'IS NULL' | 'IS NOT NULL';

/**
 * All supported operators
 */
export type Operator = ComparisonOperator | NullOperator;

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Join type
 */
export type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' | 'CROSS';

/**
 * Join condition
 */
export interface JoinCondition {
  /** Left table column */
  leftColumn: string;

  /** Right table column */
  rightColumn: string;

  /** Join type (default: INNER) */
  type?: JoinType;
}

/**
 * Where clause condition
 */
export interface WhereCondition {
  /** Column name */
  column: string;

  /** Operator */
  operator: Operator;

  /** Value (undefined for null operators) */
  value?: unknown;

  /** Logical connector to previous condition */
  connector?: 'AND' | 'OR';
}

/**
 * Order by clause
 */
export interface OrderByClause {
  /** Column name */
  column: string;

  /** Sort direction */
  direction: SortDirection;
}

/**
 * Query result
 */
export interface QueryResult<T> {
  /** Result rows */
  rows: T[];

  /** Total count (if available from COUNT query) */
  total?: number;

  /** Execution time in milliseconds */
  executionTime: number;

  /** Number of rows affected (for INSERT/UPDATE/DELETE) */
  rowsAffected?: number;

  /** Column metadata */
  columns?: ColumnMetadata[];
}

/**
 * Column metadata
 */
export interface ColumnMetadata {
  /** Column name */
  name: string;

  /** Column type */
  type: string;

  /** Is nullable */
  nullable: boolean;
}

/**
 * Aggregate function type
 */
export type AggregateFunction = 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'MEDIAN' | 'STDDEV' | 'VARIANCE';

/**
 * Aggregate expression
 */
export interface AggregateExpression {
  /** Function name */
  function: AggregateFunction;

  /** Column name (use '*' for COUNT(*)) */
  column: string;

  /** Alias for the result */
  alias?: string;

  /** DISTINCT modifier */
  distinct?: boolean;
}

/**
 * Raw SQL fragment (for advanced use cases)
 */
export interface RawSQL {
  /** SQL string */
  sql: string;

  /** Parameter values */
  params?: unknown[];
}

/**
 * Query builder state (internal)
 */
export interface QueryBuilderState {
  /** Table name */
  table: string;

  /** Selected columns */
  columns: string[];

  /** Where conditions */
  where: WhereCondition[];

  /** Join clauses */
  joins: Array<{
    table: string;
    condition: JoinCondition;
  }>;

  /** Order by clauses */
  orderBy: OrderByClause[];

  /** Group by columns */
  groupBy: string[];

  /** Having conditions */
  having: WhereCondition[];

  /** Limit value */
  limit?: number;

  /** Offset value */
  offset?: number;

  /** Aggregate expressions */
  aggregates: AggregateExpression[];
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page: number;

  /** Items per page */
  pageSize: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> extends QueryResult<T> {
  /** Current page number */
  page: number;

  /** Items per page */
  pageSize: number;

  /** Total number of pages */
  totalPages: number;

  /** Has next page */
  hasNextPage: boolean;

  /** Has previous page */
  hasPreviousPage: boolean;
}
