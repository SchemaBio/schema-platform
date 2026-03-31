'use client';

import * as React from 'react';
import { DataTable, Input, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search } from 'lucide-react';
import type { HistoryMEI, KnowledgeTableFilterState, PaginatedResult, MEIType } from '../types';
import { DEFAULT_KNOWLEDGE_FILTER_STATE } from '../types';
import { getHistoryMEIs, ACMG_CONFIG } from '../mock-data';

interface MEIHistoryTabProps {
  filterState?: KnowledgeTableFilterState;
  onFilterChange?: (state: KnowledgeTableFilterState) => void;
}

// MEI类型配置
const MEI_TYPE_CONFIG: Record<MEIType, { label: string; variant: 'info' | 'warning' | 'neutral' }> = {
  LINE1: { label: 'LINE1', variant: 'info' },
  Alu: { label: 'Alu', variant: 'warning' },
  SVA: { label: 'SVA', variant: 'neutral' },
  Unknown: { label: '未知', variant: 'neutral' },
};

export function MEIHistoryTab({
  filterState: externalFilterState,
  onFilterChange
}: MEIHistoryTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<KnowledgeTableFilterState>(DEFAULT_KNOWLEDGE_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<HistoryMEI> | null>(null);
  const [loading, setLoading] = React.useState(true);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  // 加载数据
  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getHistoryMEIs(filterState);
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
  const columns: Column<HistoryMEI>[] = [
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
      id: 'gene',
      header: '基因',
      accessor: 'gene',
      width: 100,
      align: 'center',
      sortable: true,
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
      id: 'position',
      header: '位置',
      accessor: 'position',
      width: 100,
      align: 'center',
      sortable: true,
    },
    {
      id: 'meiType',
      header: 'MEI类型',
      accessor: (row) => {
        const config = MEI_TYPE_CONFIG[row.meiType];
        return <Tag variant={config.variant} className="justify-center">{config.label}</Tag>;
      },
      width: 80,
      align: 'center',
      sortable: true,
    },
    {
      id: 'strand',
      header: '链方向',
      accessor: 'strand',
      width: 60,
      align: 'center',
    },
    {
      id: 'length',
      header: '长度',
      accessor: (row) => `${row.length}bp`,
      width: 80,
      align: 'center',
      sortable: true,
    },
    {
      id: 'impact',
      header: '影响',
      accessor: (row) => row.impact || '-',
      width: 80,
      align: 'center',
    },
    {
      id: 'zygosity',
      header: '杂合性',
      accessor: (row) => {
        const labels = { Heterozygous: '杂合', Homozygous: '纯合', Hemizygous: '半合' };
        return labels[row.zygosity];
      },
      width: 80,
      align: 'center',
      sortable: true,
    },
    {
      id: 'acmgClassification',
      header: 'ACMG分类',
      accessor: (row) => {
        if (!row.acmgClassification) return '-';
        const config = ACMG_CONFIG[row.acmgClassification];
        return <Tag variant={config.variant} className="w-20 justify-center">{config.label}</Tag>;
      },
      width: 100,
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
              placeholder="搜索基因、染色体..."
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
          暂无MEI历史检出位点数据
        </div>
      )}
    </div>
  );
}