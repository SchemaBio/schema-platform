'use client';

import * as React from 'react';
import { DataTable, Tag, Input } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search } from 'lucide-react';
import type { SNVIndel, TableFilterState, PaginatedResult, ACMGClassification } from '../types';
import { DEFAULT_FILTER_STATE } from '../types';
import { getSNVIndels, ACMG_CONFIG } from '../mock-data';

interface SNVIndelTabProps {
  taskId: string;
  filterState?: TableFilterState;
  onFilterChange?: (state: TableFilterState) => void;
}

export function SNVIndelTab({ 
  taskId, 
  filterState: externalFilterState,
  onFilterChange 
}: SNVIndelTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<TableFilterState>(DEFAULT_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<SNVIndel> | null>(null);
  const [loading, setLoading] = React.useState(true);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  // 加载数据
  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getSNVIndels(taskId, filterState);
      setResult(data);
      setLoading(false);
    }
    loadData();
  }, [taskId, filterState]);

  // 处理搜索
  const handleSearch = React.useCallback((query: string) => {
    setFilterState({ ...filterState, searchQuery: query, page: 1 });
  }, [filterState, setFilterState]);

  // 处理排序
  const handleSortChange = React.useCallback((column: string, direction: 'asc' | 'desc' | null) => {
    setFilterState({
      ...filterState,
      sortColumn: direction ? column : undefined,
      sortDirection: direction ?? undefined,
    });
  }, [filterState, setFilterState]);

  // 处理ACMG筛选
  const handleACMGFilter = React.useCallback((classification: ACMGClassification | '') => {
    const newFilters = { ...filterState.filters };
    if (classification) {
      newFilters.acmgClassification = classification;
    } else {
      delete newFilters.acmgClassification;
    }
    setFilterState({ ...filterState, filters: newFilters, page: 1 });
  }, [filterState, setFilterState]);

  // 列定义
  const columns: Column<SNVIndel>[] = [
    {
      id: 'gene',
      header: '基因',
      accessor: 'gene',
      width: 100,
      sortable: true,
    },
    {
      id: 'position',
      header: '变异位置',
      accessor: (row) => `${row.chromosome}:${row.position.toLocaleString()}`,
      width: 150,
      sortable: true,
    },
    {
      id: 'change',
      header: '参考/变异',
      accessor: (row) => `${row.ref}>${row.alt}`,
      width: 100,
    },
    {
      id: 'variantType',
      header: '变异类型',
      accessor: (row) => {
        const typeLabels = { SNV: 'SNV', Insertion: '插入', Deletion: '缺失' };
        return typeLabels[row.variantType];
      },
      width: 80,
    },
    {
      id: 'zygosity',
      header: '杂合性',
      accessor: (row) => {
        const labels = { Heterozygous: '杂合', Homozygous: '纯合', Hemizygous: '半合' };
        return labels[row.zygosity];
      },
      width: 80,
    },
    {
      id: 'alleleFrequency',
      header: '频率',
      accessor: (row) => `${(row.alleleFrequency * 100).toFixed(1)}%`,
      width: 80,
      sortable: true,
    },
    {
      id: 'depth',
      header: '深度',
      accessor: (row) => `${row.depth}X`,
      width: 70,
      sortable: true,
    },
    {
      id: 'acmgClassification',
      header: 'ACMG分类',
      accessor: (row) => {
        const config = ACMG_CONFIG[row.acmgClassification];
        return <Tag variant={config.variant}>{config.label}</Tag>;
      },
      width: 100,
      sortable: true,
    },
    {
      id: 'hgvsc',
      header: 'cDNA变化',
      accessor: 'hgvsc',
      width: 150,
    },
    {
      id: 'hgvsp',
      header: '蛋白质变化',
      accessor: 'hgvsp',
      width: 150,
    },
  ];

  // 分页信息
  const totalPages = result ? Math.ceil(result.total / result.pageSize) : 0;

  return (
    <div>
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* 搜索框 */}
          <div className="w-64">
            <Input
              placeholder="搜索基因、位置..."
              value={filterState.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              leftElement={<Search className="w-4 h-4" />}
            />
          </div>

          {/* ACMG筛选 */}
          <select
            value={(filterState.filters.acmgClassification as string) || ''}
            onChange={(e) => handleACMGFilter(e.target.value as ACMGClassification | '')}
            className="px-3 py-1.5 text-sm border border-border-default rounded-md bg-canvas-default text-fg-default"
          >
            <option value="">全部ACMG分类</option>
            {Object.entries(ACMG_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        {/* 统计信息 */}
        <div className="text-sm text-fg-muted">
          共 {result?.total ?? 0} 条变异
        </div>
      </div>

      {/* 数据表格 */}
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

          {/* 分页 */}
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
          暂无SNV/Indel变异数据
        </div>
      )}
    </div>
  );
}
