/**
 * Result Exporter for DuckDB
 */

import type { QueryResult } from '../types/query.js';

/**
 * Export options
 */
export interface ExportOptions {
  /** Include header row (for CSV) */
  includeHeader?: boolean;

  /** Column delimiter (for CSV) */
  delimiter?: string;

  /** Pretty print (for JSON) */
  prettyPrint?: boolean;

  /** Columns to export (exports all if not specified) */
  columns?: string[];
}

/**
 * Result exporter for converting query results to various formats
 */
export class ResultExporter {
  /**
   * Export to CSV string
   */
  toCSV<T extends Record<string, unknown>>(
    result: QueryResult<T>,
    options: ExportOptions = {}
  ): string {
    const { includeHeader = true, delimiter = ',', columns } = options;

    if (result.rows.length === 0) {
      return '';
    }

    const lines: string[] = [];

    // Determine columns to export
    const exportColumns = columns ?? Object.keys(result.rows[0]);

    // Add header
    if (includeHeader) {
      lines.push(exportColumns.map((c) => this.escapeCSV(c, delimiter)).join(delimiter));
    }

    // Add data rows
    for (const row of result.rows) {
      const values = exportColumns.map((col) => {
        const value = row[col];
        return this.escapeCSV(this.formatValue(value), delimiter);
      });
      lines.push(values.join(delimiter));
    }

    return lines.join('\n');
  }

  /**
   * Export to JSON string
   */
  toJSON<T extends Record<string, unknown>>(
    result: QueryResult<T>,
    options: ExportOptions = {}
  ): string {
    const { prettyPrint = false, columns } = options;

    let data: T[] = result.rows;

    // Filter columns if specified
    if (columns) {
      data = result.rows.map((row) => {
        const filtered: Record<string, unknown> = {};
        for (const col of columns) {
          if (col in row) {
            filtered[col] = row[col];
          }
        }
        return filtered as T;
      });
    }

    return prettyPrint ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  }

  /**
   * Export to JSON Lines format
   */
  toJSONLines<T extends Record<string, unknown>>(
    result: QueryResult<T>,
    options: ExportOptions = {}
  ): string {
    const { columns } = options;

    const lines: string[] = [];

    for (const row of result.rows) {
      let data: Record<string, unknown> = row;

      // Filter columns if specified
      if (columns) {
        data = {};
        for (const col of columns) {
          if (col in row) {
            data[col] = row[col];
          }
        }
      }

      lines.push(JSON.stringify(data));
    }

    return lines.join('\n');
  }

  /**
   * Export to array of arrays (for spreadsheet-like formats)
   */
  toArrays<T extends Record<string, unknown>>(
    result: QueryResult<T>,
    options: ExportOptions = {}
  ): unknown[][] {
    const { includeHeader = true, columns } = options;

    if (result.rows.length === 0) {
      return [];
    }

    const arrays: unknown[][] = [];

    // Determine columns to export
    const exportColumns = columns ?? Object.keys(result.rows[0]);

    // Add header
    if (includeHeader) {
      arrays.push(exportColumns);
    }

    // Add data rows
    for (const row of result.rows) {
      arrays.push(exportColumns.map((col) => row[col]));
    }

    return arrays;
  }

  /**
   * Create a Blob for download (browser)
   */
  toBlob<T extends Record<string, unknown>>(
    result: QueryResult<T>,
    format: 'csv' | 'json' | 'jsonl',
    options: ExportOptions = {}
  ): Blob {
    let content: string;
    let mimeType: string;

    switch (format) {
      case 'csv':
        content = this.toCSV(result, options);
        mimeType = 'text/csv;charset=utf-8';
        break;
      case 'json':
        content = this.toJSON(result, options);
        mimeType = 'application/json;charset=utf-8';
        break;
      case 'jsonl':
        content = this.toJSONLines(result, options);
        mimeType = 'application/x-ndjson;charset=utf-8';
        break;
    }

    return new Blob([content], { type: mimeType });
  }

  /**
   * Escape a value for CSV
   */
  private escapeCSV(value: string, delimiter: string): string {
    // Check if escaping is needed
    if (
      value.includes(delimiter) ||
      value.includes('"') ||
      value.includes('\n') ||
      value.includes('\r')
    ) {
      // Escape double quotes and wrap in quotes
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Format a value for export
   */
  private formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }
}

/**
 * Create a result exporter
 */
export function createExporter(): ResultExporter {
  return new ResultExporter();
}
