'use client';

import * as React from 'react';
import { DataTable, Input, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search } from 'lucide-react';
import type { HistoryUPDRegion, KnowledgeTableFilterState, PaginatedResult, UPDType, ParentOfOrigin } from '../types';
import { DEFAULT_KNOWLEDGE_FILTER_STATE } from '../types';
import { getHistoryUPDRegions } from '../mock-data';

interface UPDHistoryTabProps {
  filterState?: KnowledgeTableFilterState;
  onFilterChange?: (state: KnowledgeTableFilterState) => void;
}

// UPD类型配置
const UPD_TYPE_CONFIG: Record<UPDType, { label: string; variant: 'info' | 'warning' }> = {
  Isodisomy: { label: '同二体', variant: 'warning' },
  Heterodisomy: { label: '异二体', variant: 'info' },
};

// 来源亲本配置
const PARENT_CONFIG: Record<ParentOfOrigin, { label: string }> = {
  Maternal: { label: '母源' },
  Paternal: { label: '父源' },
  Unknown: { label: '未知' },
};

export function UPDHistoryTab({
  filterState: externalFilterState,
  onFilterChange
}: UPDHistoryTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<KnowledgeTableFilterState>(DEFAULT_KNOWLEDGE_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<HistoryUPDRegion> | null>(null);
  const [loading, setLoading] = React.useState(true);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  // 加载数据
  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getHistoryUPDRegions(filterState);
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

  // 格式化位置
  const formatPosition = (pos: number) => {
    if (pos >= 1000000) {
      return `${(pos / 1000000).toFixed(2)}Mb`;
    }
    if (pos >= 1000) {
      return `${(pos / 1000).toFixed(1)}kb`;
    }
    return `${pos}bp`;
  };

  // 列定义
  const columns: Column<HistoryUPDRegion>[] = [
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
      id: 'chromosome',
      header: '染色体',
      accessor: 'chromosome',
      width: 80,
      align: 'center',
      sortable: true,
    },
    {
      id: 'region',
      header: '区域',
      accessor: (row) => `${formatPosition(row.startPosition)} - ${formatPosition(row.endPosition)}`,
      width: 180,
      align: 'center',
    },
    {
      id: 'length',
      header: '长度',
      accessor: (row) => formatPosition(row.length),
      width: 100,
      align: 'center',
      sortable: true,
    },
    {
      id: 'type',
      header: '类型',
      accessor: (row) => {
        const config = UPD_TYPE_CONFIG[row.type];
        return <Tag variant={config.variant} className="justify-center">{config.label}</Tag>;
      },
      width: 80,
      align: 'center',
      sortable: true,
    },
    {
      id: 'parentOfOrigin',
      header: '来源亲本',
      accessor: (row) => {
        if (!row.parentOfOrigin) return '-';
        const config = PARENT_CONFIG[row.parentOfOrigin];
        return config.label;
      },
      width: 80,
      align: 'center',
    },
    {
      id: 'genes',
      header: '涉及基因',
      accessor: (row) => row.genes.join(', '),
      width: 200,
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
              placeholder="搜索染色体、基因..."
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
          暂无UPD历史检出位点数据
        </div>
      )}
    </div>
  );
}