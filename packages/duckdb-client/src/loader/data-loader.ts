/**
 * Data Loader for DuckDB
 */

import type { AsyncDuckDB } from '@duckdb/duckdb-wasm';
import type {
  DataFormat,
  ParquetOptions,
  CSVOptions,
  JSONOptions,
  LoadResult,
  ColumnMetadata,
} from '../types/loader.js';
import { DataLoadError } from '../types/errors.js';

/**
 * Data loader for importing data into DuckDB
 */
export class DataLoader {
  private readonly db: AsyncDuckDB;

  constructor(db: AsyncDuckDB) {
    this.db = db;
  }

  /**
   * Load data from a Parquet file
   */
  async loadParquet(
    path: string,
    tableName: string,
    options: ParquetOptions = {}
  ): Promise<LoadResult> {
    const startTime = Date.now();

    try {
      const conn = await this.db.connect();

      // Build column selection
      let columnClause = '*';
      if (options.columns && options.columns.length > 0) {
        columnClause = options.columns.map((c) => `"${c}"`).join(', ');
      }

      // Create table from Parquet
      const sql = `CREATE TABLE "${tableName}" AS SELECT ${columnClause} FROM read_parquet('${path}')`;
      await conn.query(sql);

      // Get table info
      const info = await this.getTableInfo(conn, tableName);
      await conn.close();

      return {
        tableName,
        rowCount: info.rowCount,
        columnCount: info.columns.length,
        columns: info.columns,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      throw new DataLoadError(
        `Failed to load Parquet file: ${error instanceof Error ? error.message : String(error)}`,
        path,
        undefined,
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Load data from a CSV file
   */
  async loadCSV(
    path: string,
    tableName: string,
    options: CSVOptions = {}
  ): Promise<LoadResult> {
    const startTime = Date.now();

    try {
      const conn = await this.db.connect();

      // Build CSV options
      const csvOptions: string[] = [];
      if (options.delimiter) csvOptions.push(`delim='${options.delimiter}'`);
      if (options.header !== undefined) csvOptions.push(`header=${options.header}`);
      if (options.quote) csvOptions.push(`quote='${options.quote}'`);
      if (options.escape) csvOptions.push(`escape='${options.escape}'`);
      if (options.nullStr) csvOptions.push(`nullstr='${options.nullStr}'`);
      if (options.skipRows) csvOptions.push(`skip=${options.skipRows}`);
      if (options.maxRows) csvOptions.push(`max_line_size=${options.maxRows}`);
      if (options.sampleSize) csvOptions.push(`sample_size=${options.sampleSize}`);
      if (options.ignoreErrors) csvOptions.push('ignore_errors=true');

      const optionsStr = csvOptions.length > 0 ? `, ${csvOptions.join(', ')}` : '';

      // Create table from CSV
      const sql = `CREATE TABLE "${tableName}" AS SELECT * FROM read_csv_auto('${path}'${optionsStr})`;
      await conn.query(sql);

      // Get table info
      const info = await this.getTableInfo(conn, tableName);
      await conn.close();

      return {
        tableName,
        rowCount: info.rowCount,
        columnCount: info.columns.length,
        columns: info.columns,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      throw new DataLoadError(
        `Failed to load CSV file: ${error instanceof Error ? error.message : String(error)}`,
        path,
        undefined,
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Load data from a JSON file
   */
  async loadJSON(
    path: string,
    tableName: string,
    options: JSONOptions = {}
  ): Promise<LoadResult> {
    const startTime = Date.now();

    try {
      const conn = await this.db.connect();

      // Build JSON options
      const jsonOptions: string[] = [];
      if (options.maxDepth) jsonOptions.push(`maximum_depth=${options.maxDepth}`);
      if (options.ignoreErrors) jsonOptions.push('ignore_errors=true');

      const optionsStr = jsonOptions.length > 0 ? `, ${jsonOptions.join(', ')}` : '';

      // Create table from JSON
      const sql = `CREATE TABLE "${tableName}" AS SELECT * FROM read_json_auto('${path}'${optionsStr})`;
      await conn.query(sql);

      // Get table info
      const info = await this.getTableInfo(conn, tableName);
      await conn.close();

      return {
        tableName,
        rowCount: info.rowCount,
        columnCount: info.columns.length,
        columns: info.columns,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      throw new DataLoadError(
        `Failed to load JSON file: ${error instanceof Error ? error.message : String(error)}`,
        path,
        undefined,
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Load data from a URL (browser)
   */
  async loadFromURL(
    url: string,
    format: DataFormat,
    tableName: string
  ): Promise<LoadResult> {
    switch (format) {
      case 'parquet':
        return this.loadParquet(url, tableName);
      case 'csv':
        return this.loadCSV(url, tableName);
      case 'json':
        return this.loadJSON(url, tableName);
      default:
        throw new DataLoadError(`Unsupported format: ${format}`, url);
    }
  }

  /**
   * Load data from an ArrayBuffer (browser)
   */
  async loadFromBuffer(
    buffer: ArrayBuffer,
    format: DataFormat,
    tableName: string
  ): Promise<LoadResult> {
    const startTime = Date.now();

    try {
      // Register the buffer as a file
      const fileName = `${tableName}.${format}`;
      await this.db.registerFileBuffer(fileName, new Uint8Array(buffer));

      // Load based on format
      let result: LoadResult;
      switch (format) {
        case 'parquet':
          result = await this.loadParquet(fileName, tableName);
          break;
        case 'csv':
          result = await this.loadCSV(fileName, tableName);
          break;
        case 'json':
          result = await this.loadJSON(fileName, tableName);
          break;
        default:
          throw new DataLoadError(`Unsupported format: ${format}`, 'buffer');
      }

      result.duration = Date.now() - startTime;
      result.bytesLoaded = buffer.byteLength;
      return result;
    } catch (error) {
      if (error instanceof DataLoadError) throw error;
      throw new DataLoadError(
        `Failed to load from buffer: ${error instanceof Error ? error.message : String(error)}`,
        'buffer',
        undefined,
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Drop a table
   */
  async dropTable(tableName: string): Promise<void> {
    const conn = await this.db.connect();
    try {
      await conn.query(`DROP TABLE IF EXISTS "${tableName}"`);
    } finally {
      await conn.close();
    }
  }

  /**
   * Check if a table exists
   */
  async tableExists(tableName: string): Promise<boolean> {
    const conn = await this.db.connect();
    try {
      const result = await conn.query(
        `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = '${tableName}'`
      );
      const row = result.toArray()[0];
      const count = (row as Record<string, unknown> | undefined)?.count;
      return count !== undefined && Number(count) > 0;
    } finally {
      await conn.close();
    }
  }

  /**
   * Get table information
   */
  private async getTableInfo(
    conn: Awaited<ReturnType<AsyncDuckDB['connect']>>,
    tableName: string
  ): Promise<{ rowCount: number; columns: ColumnMetadata[] }> {
    // Get row count
    const countResult = await conn.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
    const countRow = countResult.toArray()[0] as Record<string, unknown>;
    const rowCount = Number(countRow?.count ?? 0);

    // Get column info
    const columnsResult = await conn.query(`DESCRIBE "${tableName}"`);
    const columns: ColumnMetadata[] = [];

    for (const row of columnsResult) {
      const r = row as Record<string, unknown>;
      columns.push({
        name: String(r.column_name ?? r.name ?? ''),
        type: String(r.column_type ?? r.type ?? 'VARCHAR') as ColumnMetadata['type'],
        nullable: r.null !== 'NO',
      });
    }

    return { rowCount, columns };
  }
}
