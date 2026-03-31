'use client';

import * as React from 'react';
import { Input } from '@schema/ui-kit';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';
import type { DetectionRecord, HistoryTableFilterState, PaginatedResult } from '../types';

interface ExpandableTableProps<T> {
  data: PaginatedResult<T> | null;
  loading: boolean;
  filterState: HistoryTableFilterState;
  onSearch: (query: string) => void;
  onPageChange: (page: number) => void;
  searchPlaceholder?: string;
  statsLabel?: string;
  columns: ColumnDef<T>[];
  getGroupId: (row: T) => string;
  getRecords: (row: T) => DetectionRecord[];
  emptyMessage: string;
}

interface ColumnDef<T> {
  id: string;
  header: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  accessor: (row: T) => React.ReactNode;
}

export function ExpandableTable<T>({
  data,
  loading,
  filterState,
  onSearch,
  onPageChange,
  searchPlaceholder = '搜索...',
  statsLabel = '条记录',
  columns,
  getGroupId,
  getRecords,
  emptyMessage,
}: ExpandableTableProps<T>) {
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());

  const toggleRowExpand = React.useCallback((groupId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  const renderExpandedRow = (row: T) => {
    const groupId = getGroupId(row);
    if (!expandedRows.has(groupId)) return null;
    const records = getRecords(row);

    return (
      <tr key={`${groupId}-detail`} className="bg-canvas-subtle">
        <td colSpan={columns.length + 1} className="p-0">
          <div className="p-4 border-t border-border-default">
            <div className="text-sm font-medium text-fg-default mb-3">检出记录详情</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-default">
                    <th className="px-3 py-2 text-left text-fg-muted font-medium">任务ID</th>
                    <th className="px-3 py-2 text-left text-fg-muted font-medium">样本编号</th>
                    <th className="px-3 py-2 text-left text-fg-muted font-medium">流程名称</th>
                    <th className="px-3 py-2 text-left text-fg-muted font-medium">审核人</th>
                    <th className="px-3 py-2 text-left text-fg-muted font-medium">审核时间</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr
                      key={record.recordId}
                      className={index < records.length - 1 ? 'border-b border-border-subtle' : ''}
                    >
                      <td className="px-3 py-2 font-mono text-xs">{record.taskId.slice(0, 8)}</td>
                      <td className="px-3 py-2">{record.internalId}</td>
                      <td className="px-3 py-2">{record.pipeline} {record.pipelineVersion}</td>
                      <td className="px-3 py-2">{record.reviewedBy}</td>
                      <td className="px-3 py-2">{record.reviewedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div>
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-64">
          <Input
            placeholder={searchPlaceholder}
            value={filterState.searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-fg-muted">
          <span>共 {data?.total ?? 0} {statsLabel}</span>
          {data && data.data.length > 0 && (
            <span>
              （总检出 {data.data.reduce((sum, item) => sum + getRecords(item).length, 0)} 次）
            </span>
          )}
        </div>
      </div>

      {/* 数据表格 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-emphasis" />
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="border border-border-default rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-canvas-subtle">
                <tr>
                  <th className="px-2 py-2.5 text-sm font-medium text-fg-muted w-10" style={{ textAlign: 'center' }}>
                    {}
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      className="px-3 py-2.5 text-sm font-medium text-fg-muted"
                      style={{ width: col.width, textAlign: col.align || 'left' }}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.data.map((row) => {
                  const groupId = getGroupId(row);
                  return (
                    <React.Fragment key={groupId}>
                      <tr
                        className="border-b border-border-default hover:bg-canvas-subtle cursor-pointer"
                        onClick={() => toggleRowExpand(groupId)}
                      >
                        <td className="px-2 py-2 text-center">
                          <button className="p-1 hover:bg-canvas-inset rounded">
                            {expandedRows.has(groupId) ? (
                              <ChevronDown className="w-4 h-4 text-fg-muted" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-fg-muted" />
                            )}
                          </button>
                        </td>
                        {columns.map((col) => (
                          <td
                            key={col.id}
                            className="px-3 py-2 text-sm"
                            style={{ textAlign: col.align || 'left' }}
                          >
                            {col.accessor(row)}
                          </td>
                        ))}
                      </tr>
                      {renderExpandedRow(row)}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-fg-muted">
                第 {filterState.page} / {totalPages} 页
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(filterState.page - 1)}
                  disabled={filterState.page <= 1}
                  className="px-3 py-1 text-sm border border-border-default rounded hover:bg-canvas-subtle disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  onClick={() => onPageChange(filterState.page + 1)}
                  disabled={filterState.page >= totalPages}
                  className="px-3 py-1 text-sm border border-border-default rounded hover:bg-canvas-subtle disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-fg-muted">{emptyMessage}</div>
      )}
    </div>
  );
}