/**
 * Type-safe Query Builder
 */

import type {
  Operator,
  SortDirection,
  JoinCondition,
  JoinType,
  QueryResult,
  AggregateFunction,
  QueryBuilderState,
  PaginatedResult,
} from '../types/query.js';
import type { DuckDBClient } from '../client/duckdb-client.js';

/**
 * Query builder for constructing type-safe SQL queries
 */
export class QueryBuilder<T = Record<string, unknown>> {
  private readonly client: DuckDBClient;
  private readonly state: QueryBuilderState;

  constructor(client: DuckDBClient, table: string) {
    this.client = client;
    this.state = {
      table,
      columns: [],
      where: [],
      joins: [],
      orderBy: [],
      groupBy: [],
      having: [],
      aggregates: [],
    };
  }

  /**
   * Select specific columns
   */
  select<K extends keyof T>(...columns: K[]): QueryBuilder<Pick<T, K>> {
    this.state.columns = columns as string[];
    return this as unknown as QueryBuilder<Pick<T, K>>;
  }

  /**
   * Select all columns
   */
  selectAll(): QueryBuilder<T> {
    this.state.columns = ['*'];
    return this;
  }

  /**
   * Add a WHERE condition
   */
  where<K extends keyof T>(column: K, operator: Operator, value?: unknown): QueryBuilder<T> {
    this.state.where.push({
      column: column as string,
      operator,
      value,
      connector: this.state.where.length > 0 ? 'AND' : undefined,
    });
    return this;
  }

  /**
   * Add an AND condition
   */
  and<K extends keyof T>(column: K, operator: Operator, value?: unknown): QueryBuilder<T> {
    this.state.where.push({
      column: column as string,
      operator,
      value,
      connector: 'AND',
    });
    return this;
  }

  /**
   * Add an OR condition
   */
  or<K extends keyof T>(column: K, operator: Operator, value?: unknown): QueryBuilder<T> {
    this.state.where.push({
      column: column as string,
      operator,
      value,
      connector: 'OR',
    });
    return this;
  }

  /**
   * Add a WHERE IN condition
   */
  whereIn<K extends keyof T>(column: K, values: unknown[]): QueryBuilder<T> {
    if (values.length === 0) {
      // Empty IN clause - always false
      this.state.where.push({
        column: '1',
        operator: '=',
        value: 0,
        connector: this.state.where.length > 0 ? 'AND' : undefined,
      });
    } else {
      const placeholders = values.map((_, i) => `$${this.getParamIndex() + i}`).join(', ');
      this.state.where.push({
        column: `${String(column)} IN (${placeholders})` as string,
        operator: '=' as Operator, // Dummy, will be handled specially
        value: values,
        connector: this.state.where.length > 0 ? 'AND' : undefined,
      });
    }
    return this;
  }

  /**
   * Add a WHERE BETWEEN condition
   */
  whereBetween<K extends keyof T>(column: K, min: unknown, max: unknown): QueryBuilder<T> {
    this.state.where.push({
      column: column as string,
      operator: '>=',
      value: min,
      connector: this.state.where.length > 0 ? 'AND' : undefined,
    });
    this.state.where.push({
      column: column as string,
      operator: '<=',
      value: max,
      connector: 'AND',
    });
    return this;
  }

  /**
   * Add a WHERE IS NULL condition
   */
  whereNull<K extends keyof T>(column: K): QueryBuilder<T> {
    return this.where(column, 'IS NULL');
  }

  /**
   * Add a WHERE IS NOT NULL condition
   */
  whereNotNull<K extends keyof T>(column: K): QueryBuilder<T> {
    return this.where(column, 'IS NOT NULL');
  }

  /**
   * Add a LIKE condition
   */
  whereLike<K extends keyof T>(column: K, pattern: string): QueryBuilder<T> {
    return this.where(column, 'LIKE', pattern);
  }

  /**
   * Add a case-insensitive LIKE condition
   */
  whereILike<K extends keyof T>(column: K, pattern: string): QueryBuilder<T> {
    return this.where(column, 'ILIKE', pattern);
  }

  /**
   * Join another table
   */
  join<U>(
    table: string,
    condition: JoinCondition,
    type: JoinType = 'INNER'
  ): QueryBuilder<T & U> {
    this.state.joins.push({
      table,
      condition: { ...condition, type },
    });
    return this as unknown as QueryBuilder<T & U>;
  }

  /**
   * Left join another table
   */
  leftJoin<U>(table: string, condition: JoinCondition): QueryBuilder<T & U> {
    return this.join<U>(table, condition, 'LEFT');
  }

  /**
   * Right join another table
   */
  rightJoin<U>(table: string, condition: JoinCondition): QueryBuilder<T & U> {
    return this.join<U>(table, condition, 'RIGHT');
  }

  /**
   * Order by a column
   */
  orderBy<K extends keyof T>(column: K, direction: SortDirection = 'asc'): QueryBuilder<T> {
    this.state.orderBy.push({
      column: column as string,
      direction,
    });
    return this;
  }

  /**
   * Limit the number of results
   */
  limit(count: number): QueryBuilder<T> {
    this.state.limit = count;
    return this;
  }

  /**
   * Offset the results
   */
  offset(count: number): QueryBuilder<T> {
    this.state.offset = count;
    return this;
  }

  /**
   * Group by columns
   */
  groupBy<K extends keyof T>(...columns: K[]): QueryBuilder<T> {
    this.state.groupBy = columns as string[];
    return this;
  }

  /**
   * Add a HAVING condition
   */
  having<K extends keyof T>(column: K, operator: Operator, value?: unknown): QueryBuilder<T> {
    this.state.having.push({
      column: column as string,
      operator,
      value,
      connector: this.state.having.length > 0 ? 'AND' : undefined,
    });
    return this;
  }

  /**
   * Add an aggregate function
   */
  aggregate(
    fn: AggregateFunction,
    column: string,
    alias?: string,
    distinct = false
  ): QueryBuilder<T> {
    this.state.aggregates.push({
      function: fn,
      column,
      alias,
      distinct,
    });
    return this;
  }

  /**
   * Add COUNT aggregate
   */
  count(column = '*', alias = 'count'): QueryBuilder<T> {
    return this.aggregate('COUNT', column, alias);
  }

  /**
   * Add SUM aggregate
   */
  sum(column: string, alias?: string): QueryBuilder<T> {
    return this.aggregate('SUM', column, alias ?? `sum_${column}`);
  }

  /**
   * Add AVG aggregate
   */
  avg(column: string, alias?: string): QueryBuilder<T> {
    return this.aggregate('AVG', column, alias ?? `avg_${column}`);
  }

  /**
   * Add MIN aggregate
   */
  min(column: string, alias?: string): QueryBuilder<T> {
    return this.aggregate('MIN', column, alias ?? `min_${column}`);
  }

  /**
   * Add MAX aggregate
   */
  max(column: string, alias?: string): QueryBuilder<T> {
    return this.aggregate('MAX', column, alias ?? `max_${column}`);
  }

  /**
   * Execute the query and return results
   */
  async execute(): Promise<QueryResult<T>> {
    const { sql, params } = this.build();
    return this.client.execute<T>(sql, params);
  }

  /**
   * Execute and return the count
   */
  async getCount(): Promise<number> {
    const countBuilder = new QueryBuilder<{ count: number }>(this.client, this.state.table);
    countBuilder.state.where = [...this.state.where];
    countBuilder.state.joins = [...this.state.joins];
    countBuilder.count();

    const result = await countBuilder.execute();
    return result.rows[0]?.count ?? 0;
  }

  /**
   * Execute and return the first result
   */
  async first(): Promise<T | null> {
    this.limit(1);
    const result = await this.execute();
    return result.rows[0] ?? null;
  }

  /**
   * Execute with pagination
   */
  async paginate(page: number, pageSize: number): Promise<PaginatedResult<T>> {
    // Get total count
    const total = await this.getCount();

    // Get paginated results
    this.limit(pageSize);
    this.offset((page - 1) * pageSize);
    const result = await this.execute();

    const totalPages = Math.ceil(total / pageSize);

    return {
      ...result,
      total,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Get the generated SQL
   */
  toSQL(): string {
    return this.build().sql;
  }

  /**
   * Get the generated SQL with parameters
   */
  build(): { sql: string; params: unknown[] } {
    const params: unknown[] = [];
    let paramIndex = 1;

    // SELECT clause
    let sql = 'SELECT ';

    if (this.state.aggregates.length > 0) {
      const aggParts = this.state.aggregates.map((agg) => {
        const distinct = agg.distinct ? 'DISTINCT ' : '';
        const alias = agg.alias ? ` AS ${this.escapeIdentifier(agg.alias)}` : '';
        return `${agg.function}(${distinct}${agg.column === '*' ? '*' : this.escapeIdentifier(agg.column)})${alias}`;
      });

      if (this.state.groupBy.length > 0) {
        const groupCols = this.state.groupBy.map((c) => this.escapeIdentifier(c));
        sql += [...groupCols, ...aggParts].join(', ');
      } else {
        sql += aggParts.join(', ');
      }
    } else if (this.state.columns.length > 0) {
      sql += this.state.columns
        .map((c) => (c === '*' ? '*' : this.escapeIdentifier(c)))
        .join(', ');
    } else {
      sql += '*';
    }

    // FROM clause
    sql += ` FROM ${this.escapeIdentifier(this.state.table)}`;

    // JOIN clauses
    for (const join of this.state.joins) {
      const joinType = join.condition.type ?? 'INNER';
      sql += ` ${joinType} JOIN ${this.escapeIdentifier(join.table)}`;
      sql += ` ON ${this.escapeIdentifier(this.state.table)}.${this.escapeIdentifier(join.condition.leftColumn)}`;
      sql += ` = ${this.escapeIdentifier(join.table)}.${this.escapeIdentifier(join.condition.rightColumn)}`;
    }

    // WHERE clause
    if (this.state.where.length > 0) {
      sql += ' WHERE ';
      const whereParts: string[] = [];

      for (const cond of this.state.where) {
        let part = '';

        if (cond.connector && whereParts.length > 0) {
          part += `${cond.connector} `;
        }

        // Handle special IN clause
        if (cond.column.includes(' IN (')) {
          part += cond.column;
          if (Array.isArray(cond.value)) {
            params.push(...cond.value);
          }
        } else if (cond.operator === 'IS NULL' || cond.operator === 'IS NOT NULL') {
          part += `${this.escapeIdentifier(cond.column)} ${cond.operator}`;
        } else {
          part += `${this.escapeIdentifier(cond.column)} ${cond.operator} $${paramIndex++}`;
          params.push(cond.value);
        }

        whereParts.push(part);
      }

      sql += whereParts.join(' ');
    }

    // GROUP BY clause
    if (this.state.groupBy.length > 0) {
      sql += ' GROUP BY ' + this.state.groupBy.map((c) => this.escapeIdentifier(c)).join(', ');
    }

    // HAVING clause
    if (this.state.having.length > 0) {
      sql += ' HAVING ';
      const havingParts: string[] = [];

      for (const cond of this.state.having) {
        let part = '';

        if (cond.connector && havingParts.length > 0) {
          part += `${cond.connector} `;
        }

        if (cond.operator === 'IS NULL' || cond.operator === 'IS NOT NULL') {
          part += `${this.escapeIdentifier(cond.column)} ${cond.operator}`;
        } else {
          part += `${this.escapeIdentifier(cond.column)} ${cond.operator} $${paramIndex++}`;
          params.push(cond.value);
        }

        havingParts.push(part);
      }

      sql += havingParts.join(' ');
    }

    // ORDER BY clause
    if (this.state.orderBy.length > 0) {
      sql += ' ORDER BY ';
      sql += this.state.orderBy
        .map((o) => `${this.escapeIdentifier(o.column)} ${o.direction.toUpperCase()}`)
        .join(', ');
    }

    // LIMIT clause
    if (this.state.limit !== undefined) {
      sql += ` LIMIT ${this.state.limit}`;
    }

    // OFFSET clause
    if (this.state.offset !== undefined) {
      sql += ` OFFSET ${this.state.offset}`;
    }

    return { sql, params };
  }

  /**
   * Clone the query builder
   */
  clone(): QueryBuilder<T> {
    const cloned = new QueryBuilder<T>(this.client, this.state.table);
    cloned.state.columns = [...this.state.columns];
    cloned.state.where = [...this.state.where];
    cloned.state.joins = [...this.state.joins];
    cloned.state.orderBy = [...this.state.orderBy];
    cloned.state.groupBy = [...this.state.groupBy];
    cloned.state.having = [...this.state.having];
    cloned.state.aggregates = [...this.state.aggregates];
    cloned.state.limit = this.state.limit;
    cloned.state.offset = this.state.offset;
    return cloned;
  }

  /**
   * Escape an identifier (table/column name)
   */
  private escapeIdentifier(name: string): string {
    // Simple escaping - wrap in double quotes if contains special chars
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      return name;
    }
    return `"${name.replace(/"/g, '""')}"`;
  }

  /**
   * Get current parameter index
   */
  private getParamIndex(): number {
    let count = 1;
    for (const cond of this.state.where) {
      if (cond.operator !== 'IS NULL' && cond.operator !== 'IS NOT NULL') {
        if (Array.isArray(cond.value)) {
          count += cond.value.length;
        } else {
          count++;
        }
      }
    }
    return count;
  }
}

/**
 * Create a query builder for a table
 */
export function createQueryBuilder<T = Record<string, unknown>>(
  client: DuckDBClient,
  table: string
): QueryBuilder<T> {
  return new QueryBuilder<T>(client, table);
}
