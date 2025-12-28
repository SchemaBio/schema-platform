/**
 * Result Transformer for DuckDB
 */

import type { QueryResult } from '../types/query.js';
import { TransformationError } from '../types/errors.js';

/**
 * Configuration for result transformation
 */
export interface TransformConfig<T> {
  /** Field mappings (source -> target) */
  fieldMappings?: Record<string, keyof T>;

  /** Field transformers */
  transformers?: Partial<Record<keyof T, (value: unknown) => unknown>>;

  /** How to handle null values */
  nullHandling?: 'keep' | 'remove' | 'default';

  /** Default values for null fields */
  defaults?: Partial<T>;

  /** Whether to include unmapped fields */
  includeUnmapped?: boolean;
}

/**
 * Result transformer for converting query results to application types
 */
export class ResultTransformer<T> {
  private readonly config: TransformConfig<T>;

  constructor(config: TransformConfig<T> = {}) {
    this.config = {
      nullHandling: 'keep',
      includeUnmapped: true,
      ...config,
    };
  }

  /**
   * Transform a single row
   */
  transformRow(row: Record<string, unknown>, rowIndex?: number): T {
    try {
      const result: Record<string, unknown> = {};

      // Apply field mappings
      if (this.config.fieldMappings) {
        for (const [source, target] of Object.entries(this.config.fieldMappings)) {
          const value = row[source];
          result[target as string] = this.processValue(value, target as keyof T);
        }
      }

      // Include unmapped fields
      if (this.config.includeUnmapped) {
        const mappedSources = new Set(Object.keys(this.config.fieldMappings ?? {}));
        for (const [key, value] of Object.entries(row)) {
          if (!mappedSources.has(key) && !(key in result)) {
            result[key] = this.processValue(value, key as keyof T);
          }
        }
      }

      // If no mappings, just process all fields
      if (!this.config.fieldMappings) {
        for (const [key, value] of Object.entries(row)) {
          result[key] = this.processValue(value, key as keyof T);
        }
      }

      return result as T;
    } catch (error) {
      throw new TransformationError(
        `Failed to transform row: ${error instanceof Error ? error.message : String(error)}`,
        rowIndex,
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Transform all rows
   */
  transformAll(rows: Record<string, unknown>[]): T[] {
    return rows.map((row, index) => this.transformRow(row, index));
  }

  /**
   * Transform a query result
   */
  transformResult(result: QueryResult<Record<string, unknown>>): QueryResult<T> {
    return {
      ...result,
      rows: this.transformAll(result.rows),
    };
  }

  /**
   * Create an async iterator for streaming results
   */
  async *stream(
    rows: AsyncIterable<Record<string, unknown>>
  ): AsyncIterableIterator<T> {
    let index = 0;
    for await (const row of rows) {
      yield this.transformRow(row, index++);
    }
  }

  /**
   * Process a single value
   */
  private processValue(value: unknown, field: keyof T): unknown {
    // Handle null values
    if (value === null || value === undefined) {
      switch (this.config.nullHandling) {
        case 'remove':
          return undefined;
        case 'default':
          return this.config.defaults?.[field];
        default:
          return null;
      }
    }

    // Apply transformer if defined
    const transformer = this.config.transformers?.[field];
    if (transformer) {
      return transformer(value);
    }

    return value;
  }
}

/**
 * Create a result transformer
 */
export function createTransformer<T>(config?: TransformConfig<T>): ResultTransformer<T> {
  return new ResultTransformer<T>(config);
}

/**
 * Common transformers
 */
export const Transformers = {
  /** Convert to string */
  toString: (value: unknown): string => String(value ?? ''),

  /** Convert to number */
  toNumber: (value: unknown): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  },

  /** Convert to boolean */
  toBoolean: (value: unknown): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    return Boolean(value);
  },

  /** Convert to Date */
  toDate: (value: unknown): Date | null => {
    if (value === null || value === undefined) return null;
    if (value instanceof Date) return value;
    const date = new Date(value as string | number);
    return isNaN(date.getTime()) ? null : date;
  },

  /** Parse JSON string */
  parseJSON: <T>(value: unknown): T | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'object') return value as T;
    try {
      return JSON.parse(String(value)) as T;
    } catch {
      return null;
    }
  },

  /** Convert BigInt to number */
  bigIntToNumber: (value: unknown): number => {
    if (typeof value === 'bigint') {
      return Number(value);
    }
    return Number(value ?? 0);
  },
};
