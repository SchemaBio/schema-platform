'use client';

import * as React from 'react';
import { DataTable, Tag, Input } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search } from 'lucide-react';
import type { CNV, TableFilterState, PaginatedResult } from '../types';
import { DEFAULT_FILTER_STATE } from '../types';
import { getCNVs } from '../mock-data';

interface CNVTabProps {
  taskId: string;
  filterState?: TableFilterState;
  onFilterChange?: (state: TableFilterState) => void;
}

export function CNVTab({ 
  taskId, 
  filterState: externalFilterState,
  onFilterChange 
}: CNVTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<TableFilterState>(DEFAULT_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<CNV> | null>(null);
  const [loading, setLoading] = React.useState(true);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getCNVs(taskId, filterState);
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

  const handleTypeFilter = React.useCallback((type: string) => {
    const newFilters = { ...filterState.filters };
    if (type) {
      newFilters.type = type;
    } else {
      delete newFilters.type;
    }
    setFilterState({ ...filterState, filters: newFilters, page: 1 });
  }, [filterState, setFilterState]);

  const columns: Column<CNV>[] = [
    {
      id: 'chromosome',
      header: '染色体',
      accessor: 'chromosome',
      width: 80,
      sortable: true,
    },
    {
      id: 'startPosition',
      header: '起始位置',
      accessor: (row) => row.startPosition.toLocaleString(),
      width: 120,
      sortable: true,
    },
    {
      id: 'endPosition',
      header: '终止位置',
      accessor: (row) => row.endPosition.toLocaleString(),
      width: 120,
    },
    {
      id: 'length',
      header: '长度',
      accessor: (row) => {
        if (row.length >= 1000000) return `${(row.length / 1000000).toFixed(2)}Mb`;
        if (row.length >= 1000) return `${(row.length / 1000).toFixed(1)}kb`;
        return `${row.length}bp`;
      },
      width: 100,
      sortable: true,
    },
    {
      id: 'type',
      header: '类型',
      accessor: (row) => {
        const isAmp = row.type === 'Amplification';
        return (
          <Tag variant={isAmp ? 'danger' : 'info'}>
            {isAmp ? '扩增' : '缺失'}
          </Tag>
        );
      },
      width: 80,
      sortable: true,
    },
    {
      id: 'copyNumber',
      header: '拷贝数',
      accessor: (row) => row.copyNumber,
      width: 80,
      sortable: true,
    },
    {
      id: 'genes',
      header: '涉及基因',
      accessor: (row) => row.genes.join(', '),
      width: 200,
    },
    {
      id: 'confidence',
      header: '置信度',
      accessor: (row) => `${(row.confidence * 100).toFixed(0)}%`,
      width: 80,
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
              placeholder="搜索染色体..."
              value={filterState.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              leftElement={<Search className="w-4 h-4" />}
            />
          </div>

          <select
            value={(filterState.filters.type as string) || ''}
            onChange={(e) => handleTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border-default rounded-md bg-canvas-default text-fg-default"
          >
            <option value="">全部类型</option>
            <option value="Amplification">扩增</option>
            <option value="Deletion">缺失</option>
          </select>
        </div>

        <div className="text-sm text-fg-muted">
          共 {result?.total ?? 0} 条CNV
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
          暂无CNV变异数据
        </div>
      )}
    </div>
  );
}
