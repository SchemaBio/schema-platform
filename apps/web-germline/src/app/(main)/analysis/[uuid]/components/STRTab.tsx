'use client';

import * as React from 'react';
import { DataTable, Tag, Input } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, ListFilter } from 'lucide-react';
import type { STR, STRStatus, TableFilterState, PaginatedResult } from '../types';
import { DEFAULT_FILTER_STATE } from '../types';
import { getSTRs, getGeneLists, type GeneListOption } from '../mock-data';

interface STRTabProps {
  taskId: string;
  filterState?: TableFilterState;
  onFilterChange?: (state: TableFilterState) => void;
}

// STR状态颜色配置
const STR_STATUS_CONFIG: Record<STRStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  Normal: { label: '正常', variant: 'success' },
  Premutation: { label: '前突变', variant: 'warning' },
  FullMutation: { label: '全突变', variant: 'danger' },
};

export function STRTab({ 
  taskId, 
  filterState: externalFilterState,
  onFilterChange 
}: STRTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<TableFilterState>(DEFAULT_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<STR> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [geneLists, setGeneLists] = React.useState<GeneListOption[]>([]);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  // 加载基因列表
  React.useEffect(() => {
    async function loadGeneLists() {
      const lists = await getGeneLists();
      setGeneLists(lists);
    }
    loadGeneLists();
  }, []);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getSTRs(taskId, filterState);
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

  const handleGeneListFilter = React.useCallback((geneListId: string) => {
    setFilterState({ 
      ...filterState, 
      geneListId: geneListId || undefined, 
      page: 1 
    });
  }, [filterState, setFilterState]);

  const selectedGeneList = React.useMemo(() => {
    if (!filterState.geneListId) return null;
    return geneLists.find(list => list.id === filterState.geneListId);
  }, [filterState.geneListId, geneLists]);

  const columns: Column<STR>[] = [
    {
      id: 'gene',
      header: '基因',
      accessor: 'gene',
      width: 100,
      sortable: true,
    },
    {
      id: 'transcript',
      header: '转录本',
      accessor: 'transcript',
      width: 130,
    },
    {
      id: 'locus',
      header: '位点',
      accessor: 'locus',
      width: 100,
      sortable: true,
    },
    {
      id: 'repeatUnit',
      header: '重复单元',
      accessor: 'repeatUnit',
      width: 100,
    },
    {
      id: 'repeatCount',
      header: '重复次数',
      accessor: (row) => row.repeatCount,
      width: 100,
      sortable: true,
    },
    {
      id: 'normalRange',
      header: '正常范围',
      accessor: (row) => `${row.normalRangeMin}-${row.normalRangeMax}`,
      width: 100,
    },
    {
      id: 'status',
      header: '状态',
      accessor: (row) => {
        const config = STR_STATUS_CONFIG[row.status];
        return <Tag variant={config.variant}>{config.label}</Tag>;
      },
      width: 100,
      sortable: true,
    },
  ];

  const totalPages = result ? Math.ceil(result.total / result.pageSize) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Input
              placeholder="搜索基因、位点..."
              value={filterState.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              leftElement={<Search className="w-4 h-4" />}
            />
          </div>

          {/* 基因列表筛选 */}
          <div className="relative">
            <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted pointer-events-none" />
            <select
              value={filterState.geneListId || ''}
              onChange={(e) => handleGeneListFilter(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm border border-border-default rounded-md bg-canvas-default text-fg-default min-w-[180px] appearance-none cursor-pointer"
            >
              <option value="">全部基因</option>
              {geneLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name} ({list.geneCount})
                </option>
              ))}
            </select>
          </div>

          <select
            value={(filterState.filters.status as string) || ''}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border-default rounded-md bg-canvas-default text-fg-default"
          >
            <option value="">全部状态</option>
            {Object.entries(STR_STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-sm text-fg-muted">
          {selectedGeneList && (
            <span className="text-accent-fg">
              已筛选: {selectedGeneList.name}
            </span>
          )}
          <span>共 {result?.total ?? 0} 条动态突变</span>
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
          暂无动态突变数据
        </div>
      )}
    </div>
  );
}
