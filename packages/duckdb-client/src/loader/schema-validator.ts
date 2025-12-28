/**
 * Schema Validator for DuckDB
 */

import type { AsyncDuckDB } from '@duckdb/duckdb-wasm';
import type {
  TableSchema,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ColumnType,
} from '../types/loader.js';

/**
 * Schema validator for validating table data against expected schema
 */
export class SchemaValidator {
  private readonly db: AsyncDuckDB;

  constructor(db: AsyncDuckDB) {
    this.db = db;
  }

  /**
   * Validate a table against a schema
   */
  async validateSchema(tableName: string, schema: TableSchema): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const conn = await this.db.connect();

    try {
      // Get actual table schema
      const actualColumns = await this.getTableColumns(conn, tableName);
      const actualColumnMap = new Map(actualColumns.map((c) => [c.name.toLowerCase(), c]));

      // Check for missing columns
      for (const expectedCol of schema.columns) {
        const actualCol = actualColumnMap.get(expectedCol.name.toLowerCase());

        if (!actualCol) {
          errors.push({
            type: 'missing_column',
            column: expectedCol.name,
            message: `Column "${expectedCol.name}" is missing from table`,
            expected: expectedCol.type,
          });
          continue;
        }

        // Check type compatibility
        if (!this.isTypeCompatible(expectedCol.type, actualCol.type)) {
          errors.push({
            type: 'type_mismatch',
            column: expectedCol.name,
            message: `Column "${expectedCol.name}" has incompatible type`,
            expected: expectedCol.type,
            actual: actualCol.type,
          });
        } else if (expectedCol.type !== actualCol.type) {
          warnings.push({
            type: 'type_coercion',
            column: expectedCol.name,
            message: `Column "${expectedCol.name}" type will be coerced from ${actualCol.type} to ${expectedCol.type}`,
          });
        }

        // Check nullable constraint
        if (expectedCol.nullable === false && actualCol.nullable) {
          // Check for actual null values
          const nullCount = await this.countNulls(conn, tableName, expectedCol.name);
          if (nullCount > 0) {
            errors.push({
              type: 'null_violation',
              column: expectedCol.name,
              message: `Column "${expectedCol.name}" contains ${nullCount} null values but is marked as non-nullable`,
            });
          }
        }

        // Remove from map to track extra columns
        actualColumnMap.delete(expectedCol.name.toLowerCase());
      }

      // Check for extra columns
      for (const [name] of actualColumnMap) {
        warnings.push({
          type: 'extra_column',
          column: name,
          message: `Column "${name}" exists in table but not in schema`,
        });
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } finally {
      await conn.close();
    }
  }

  /**
   * Get table columns
   */
  private async getTableColumns(
    conn: Awaited<ReturnType<AsyncDuckDB['connect']>>,
    tableName: string
  ): Promise<Array<{ name: string; type: string; nullable: boolean }>> {
    const result = await conn.query(`DESCRIBE "${tableName}"`);
    const columns: Array<{ name: string; type: string; nullable: boolean }> = [];

    for (const row of result) {
      const r = row as Record<string, unknown>;
      columns.push({
        name: String(r.column_name ?? r.name ?? ''),
        type: String(r.column_type ?? r.type ?? 'VARCHAR'),
        nullable: r.null !== 'NO',
      });
    }

    return columns;
  }

  /**
   * Count null values in a column
   */
  private async countNulls(
    conn: Awaited<ReturnType<AsyncDuckDB['connect']>>,
    tableName: string,
    columnName: string
  ): Promise<number> {
    const result = await conn.query(
      `SELECT COUNT(*) as count FROM "${tableName}" WHERE "${columnName}" IS NULL`
    );
    const row = result.toArray()[0] as Record<string, unknown>;
    return Number(row?.count ?? 0);
  }

  /**
   * Check if types are compatible
   */
  private isTypeCompatible(expected: ColumnType, actual: string): boolean {
    const normalizedActual = actual.toUpperCase();

    // Direct match
    if (normalizedActual === expected) {
      return true;
    }

    // Type compatibility mappings
    const compatibilityMap: Record<ColumnType, string[]> = {
      BOOLEAN: ['BOOL', 'BOOLEAN'],
      TINYINT: ['TINYINT', 'INT1'],
      SMALLINT: ['SMALLINT', 'INT2', 'SHORT'],
      INTEGER: ['INTEGER', 'INT', 'INT4', 'SIGNED'],
      BIGINT: ['BIGINT', 'INT8', 'LONG'],
      FLOAT: ['FLOAT', 'FLOAT4', 'REAL'],
      DOUBLE: ['DOUBLE', 'FLOAT8', 'NUMERIC', 'DECIMAL'],
      VARCHAR: ['VARCHAR', 'STRING', 'TEXT', 'CHAR', 'BPCHAR'],
      DATE: ['DATE'],
      TIMESTAMP: ['TIMESTAMP', 'DATETIME', 'TIMESTAMPTZ'],
      BLOB: ['BLOB', 'BYTEA', 'BINARY', 'VARBINARY'],
      UUID: ['UUID'],
    };

    const compatibleTypes = compatibilityMap[expected];
    if (compatibleTypes) {
      return compatibleTypes.some((t) => normalizedActual.startsWith(t));
    }

    return false;
  }
}
