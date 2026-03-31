'use client';

import * as React from 'react';
import { DataTable, Input, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search } from 'lucide-react';
import type { HistoryMTVariant, KnowledgeTableFilterState, PaginatedResult, MitochondrialPathogenicity } from '../types';
import { DEFAULT_KNOWLEDGE_FILTER_STATE } from '../types';
import { getHistoryMTVariants } from '../mock-data';

interface MTHistoryTabProps {
  filterState?: KnowledgeTableFilterState;
  onFilterChange?: (state: KnowledgeTableFilterState) => void;
}

// 线粒体致病性配置
const MT_PATHOGENICITY_CONFIG: Record<MitochondrialPathogenicity, { label: string; variant: 'danger' | 'warning' | 'neutral' | 'info' | 'success' }> = {
  Pathogenic: { label: '致病', variant: 'danger' },
  Likely_Pathogenic: { label: '可能致病', variant: 'warning' },
  VUS: { label: '意义未明', variant: 'neutral' },
  Likely_Benign: { label: '可能良性', variant: 'info' },
  Benign: { label: '良性', variant: 'success' },
};

export function MTHistoryTab({
  filterState: externalFilterState,
  onFilterChange
}: MTHistoryTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<KnowledgeTableFilterState>(DEFAULT_KNOWLEDGE_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<HistoryMTVariant> | null>(null);
  const [loading, setLoading] = React.useState(true);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  // 加载数据
  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getHistoryMTVariants(filterState);
      setResult(data);
      setLoading(false);
    }
    loadData();
  }, [filterState]);

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

  // 列定义
  const columns: Column<HistoryMTVariant>[] = [
    {
      id: 'pipeline',
      header: '流程',
      accessor: (row) => `${row.pipeline} ${row.pipelineVersion}`,
      width: 140,
      align: 'center',
    },
    {
      id: 'taskId',
      header: '任务ID',
      accessor: (row) => row.taskId.slice(0, 8),
      width: 100,
      align: 'center',
    },
    {
      id: 'internalId',
      header: '样本编号',
      accessor: 'internalId',
      width: 100,
      align: 'center',
    },
    {
      id: 'position',
      header: '位置',
      accessor: 'position',
      width: 80,
      align: 'center',
      sortable: true,
    },
    {
      id: 'change',
      header: 'REF>ALT',
      accessor: (row) => `${row.ref}>${row.alt}`,
      width: 80,
      align: 'center',
    },
    {
      id: 'gene',
      header: '基因',
      accessor: 'gene',
      width: 100,
      align: 'center',
      sortable: true,
    },
    {
      id: 'heteroplasmy',
      header: '异质性',
      accessor: (row) => `${(row.heteroplasmy * 100).toFixed(1)}%`,
      width: 80,
      align: 'center',
      sortable: true,
    },
    {
      id: 'pathogenicity',
      header: '致病性',
      accessor: (row) => {
        const config = MT_PATHOGENICITY_CONFIG[row.pathogenicity];
        return <Tag variant={config.variant} className="w-20 justify-center">{config.label}</Tag>;
      },
      width: 100,
      align: 'center',
      sortable: true,
    },
    {
      id: 'associatedDisease',
      header: '关联疾病',
      accessor: 'associatedDisease',
      width: 180,
      align: 'center',
    },
    {
      id: 'haplogroup',
      header: '单倍群',
      accessor: (row) => row.haplogroup || '-',
      width: 80,
      align: 'center',
    },
    {
      id: 'reviewedBy',
      header: '审核人',
      accessor: 'reviewedBy',
      width: 80,
      align: 'center',
    },
    {
      id: 'reviewedAt',
      header: '审核时间',
      accessor: 'reviewedAt',
      width: 140,
      align: 'center',
      sortable: true,
    },
    {
      id: 'detectionCount',
      header: '检出次数',
      accessor: 'detectionCount',
      width: 80,
      align: 'center',
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
              placeholder="搜索基因、疾病..."
              value={filterState.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              leftElement={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center gap-4 text-sm text-fg-muted">
          <span>共 {result?.total ?? 0} 条历史检出位点</span>
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
            rowKey="historyId"
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
          暂无线粒体变异历史检出位点数据
        </div>
      )}
    </div>
  );
}