'use client';

import * as React from 'react';
import { DataTable, Tag, Input } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { SangerValidation, SangerStatus, SangerResult, TableFilterState, PaginatedResult } from '../types';
import { DEFAULT_FILTER_STATE } from '../types';
import { getSangerValidations } from '../mock-data';

interface SangerTabProps {
  taskId: string;
  filterState?: TableFilterState;
  onFilterChange?: (state: TableFilterState) => void;
}

// Sanger状态配置
const SANGER_STATUS_CONFIG: Record<SangerStatus, { label: string; variant: 'neutral' | 'info' | 'success' | 'danger' }> = {
  Pending: { label: '待验证', variant: 'neutral' },
  InProgress: { label: '进行中', variant: 'info' },
  Completed: { label: '已完成', variant: 'success' },
  Failed: { label: '失败', variant: 'danger' },
};

// Sanger结果配置
const SANGER_RESULT_CONFIG: Record<NonNullable<SangerResult>, { label: string; variant: 'success' | 'danger' | 'warning' }> = {
  Confirmed: { label: '已确认', variant: 'success' },
  NotConfirmed: { label: '未确认', variant: 'danger' },
  Inconclusive: { label: '不确定', variant: 'warning' },
};

export function SangerTab({
  taskId,
  filterState: externalFilterState,
  onFilterChange
}: SangerTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<TableFilterState>(DEFAULT_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<SangerValidation> | null>(null);
  const [loading, setLoading] = React.useState(true);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getSangerValidations(taskId, filterState);
      setResult(data);
      setLoading(false);
    }
    loadData();
  }, [taskId, filterState]);

  const handleSearch = React.useCallback((query: string) => {
    setFilterState({ ...filterState, searchQuery: query, page: 1 });
  }, [filterState, setFilterState]);

  const handleSortChange = React.useCallback((column: string, direction: 'asc' | 'desc' | null) => {
    setFilterState({
      ...filterState,
      sortColumn: direction ? column : undefined,
      sortDirection: direction ?? undefined,
    });
  }, [filterState, setFilterState]);

  const handleStatusFilter = React.useCallback((status: string) => {
    const newFilters = { ...filterState.filters };
    if (status) {
      newFilters.status = status;
    } else {
      delete newFilters.status;
    }
    setFilterState({ ...filterState, filters: newFilters, page: 1 });
  }, [filterState, setFilterState]);

  const handleResultFilter = React.useCallback((result: string) => {
    const newFilters = { ...filterState.filters };
    if (result) {
      newFilters.result = result;
    } else {
      delete newFilters.result;
    }
    setFilterState({ ...filterState, filters: newFilters, page: 1 });
  }, [filterState, setFilterState]);

  // 统计数据
  const stats = React.useMemo(() => {
    if (!result?.data) return { pending: 0, inProgress: 0, completed: 0, confirmed: 0 };
    return {
      pending: result.data.filter(v => v.status === 'Pending').length,
      inProgress: result.data.filter(v => v.status === 'InProgress').length,
      completed: result.data.filter(v => v.status === 'Completed').length,
      confirmed: result.data.filter(v => v.result === 'Confirmed').length,
    };
  }, [result?.data]);

  const columns: Column<SangerValidation>[] = [
    {
      id: 'status',
      header: '状态',
      accessor: (row) => {
        const config = SANGER_STATUS_CONFIG[row.status];
        return <Tag variant={config.variant}>{config.label}</Tag>;
      },
      width: 90,
      sortable: true,
    },
    {
      id: 'result',
      header: '结果',
      accessor: (row) => {
        if (!row.result) return <span className="text-fg-muted">-</span>;
        const config = SANGER_RESULT_CONFIG[row.result];
        return <Tag variant={config.variant}>{config.label}</Tag>;
      },
      width: 90,
      sortable: true,
    },
    {
      id: 'gene',
      header: '基因',
      accessor: 'gene',
      width: 100,
      sortable: true,
    },
    {
      id: 'hgvsc',
      header: 'cDNA变化',
      accessor: 'hgvsc',
      width: 160,
    },
    {
      id: 'hgvsp',
      header: '蛋白质变化',
      accessor: (row) => row.hgvsp || '-',
      width: 160,
    },
    {
      id: 'zygosity',
      header: '合子性',
      accessor: (row) => {
        const labels: Record<string, string> = {
          Heterozygous: '杂合',
          Homozygous: '纯合',
          Hemizygous: '半合',
        };
        return labels[row.zygosity] || row.zygosity;
      },
      width: 80,
    },
    {
      id: 'chromosome',
      header: '染色体',
      accessor: 'chromosome',
      width: 80,
      sortable: true,
    },
    {
      id: 'position',
      header: '位置',
      accessor: (row) => row.position,
      width: 100,
      sortable: true,
    },
    {
      id: 'requestedBy',
      header: '申请人',
      accessor: 'requestedBy',
      width: 80,
    },
    {
      id: 'requestedAt',
      header: '申请时间',
      accessor: 'requestedAt',
      width: 140,
    },
    {
      id: 'completedAt',
      header: '完成时间',
      accessor: (row) => row.completedAt || '-',
      width: 140,
    },
  ];

  const totalPages = result ? Math.ceil(result.total / result.pageSize) : 0;

  return (
    <div>
      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="flex items-center gap-3 px-4 py-3 bg-canvas-subtle rounded-lg border border-border">
          <Clock className="w-5 h-5 text-fg-muted" />
          <div>
            <div className="text-xs text-fg-muted">待验证</div>
            <div className="text-lg font-semibold text-fg-default">{stats.pending}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 bg-accent-subtle rounded-lg border border-accent-muted">
          <AlertCircle className="w-5 h-5 text-accent-fg" />
          <div>
            <div className="text-xs text-fg-muted">进行中</div>
            <div className="text-lg font-semibold text-accent-fg">{stats.inProgress}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 bg-success-subtle rounded-lg border border-success-muted">
          <CheckCircle className="w-5 h-5 text-success-fg" />
          <div>
            <div className="text-xs text-fg-muted">已完成</div>
            <div className="text-lg font-semibold text-success-fg">{stats.completed}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 bg-success-subtle rounded-lg border border-success-muted">
          <CheckCircle className="w-5 h-5 text-success-fg" />
          <div>
            <div className="text-xs text-fg-muted">已确认</div>
            <div className="text-lg font-semibold text-success-fg">{stats.confirmed}</div>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Input
              placeholder="搜索基因/变异..."
              value={filterState.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              leftElement={<Search className="w-4 h-4" />}
            />
          </div>

          <select
            value={(filterState.filters.status as string) || ''}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border-default rounded-md bg-canvas-default text-fg-default"
          >
            <option value="">全部状态</option>
            <option value="Pending">待验证</option>
            <option value="InProgress">进行中</option>
            <option value="Completed">已完成</option>
            <option value="Failed">失败</option>
          </select>

          <select
            value={(filterState.filters.result as string) || ''}
            onChange={(e) => handleResultFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border-default rounded-md bg-canvas-default text-fg-default"
          >
            <option value="">全部结果</option>
            <option value="Confirmed">已确认</option>
            <option value="NotConfirmed">未确认</option>
            <option value="Inconclusive">不确定</option>
          </select>
        </div>

        <div className="text-sm text-fg-muted">
          共 {result?.total ?? 0} 条验证记录
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-emphasis" />
        </div>
      ) : result && result.data.length > 0 ? (
        <>
          <DataTable
            data={result.data}
            columns={columns}
            rowKey="id"
            striped
            density="compact"
            sortColumn={filterState.sortColumn}
            sortDirection={filterState.sortDirection}
            onSortChange={handleSortChange}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-fg-muted">
                第 {filterState.page} / {totalPages} 页
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterState({ ...filterState, page: filterState.page - 1 })}
                  disabled={filterState.page <= 1}
                  className="px-3 py-1 text-sm border border-border-default rounded hover:bg-canvas-subtle disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  onClick={() => setFilterState({ ...filterState, page: filterState.page + 1 })}
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
        <div className="text-center py-12 text-fg-muted">
          暂无Sanger验证记录
        </div>
      )}
    </div>
  );
}
