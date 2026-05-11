import { api } from './api';

interface ParquetColumn {
  name: string;
  type: string;
}

interface ParquetTableInfo {
  name: string;
  path: string;
  total_rows: number;
}

export interface ParquetPageResult {
  table: string;
  columns: ParquetColumn[];
  rows: Record<string, unknown>[];
  total_rows: number;
  offset: number;
  limit: number;
}

export interface ParquetTableListResult {
  task_id: string;
  tables: ParquetTableInfo[];
}

export const parquetApi = {
  /** List available parquet tables for a task */
  listTables: (taskId: string) =>
    api.get<ParquetTableListResult>(`/v1/tasks/${taskId}/parquet`),

  /** Read a page of rows from a specific parquet table */
  getRows: (taskId: string, table: string, offset = 0, limit = 100) =>
    api.get<ParquetPageResult>(`/v1/tasks/${taskId}/parquet/${table}/rows`, {
      params: {
        offset: String(offset),
        limit: String(limit),
      },
    }),
};
