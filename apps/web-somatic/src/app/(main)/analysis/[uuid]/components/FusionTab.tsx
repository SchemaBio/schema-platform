'use client';

import * as React from 'react';
import { DataTable, Tag, Input } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search } from 'lucide-react';
import type { TableFilterState, PaginatedResult } from '../types';
import { DEFAULT_FILTER_STATE } from '../types';
import { ReviewCheckbox, ReportCheckbox, ReviewColumnHeader, ReportColumnHeader } from './ReviewCheckboxes';

// 基因融合类型
interface Fusion {
  id: string;
  gene5: string;
  gene3: string;
  breakpoint5: string;
  breakpoint3: string;
  fusionType: 'In-frame' | 'Out-of-frame' | 'Unknown';
  readCount: number;
  splitReads: number;
  spanningReads: number;
  clinicalSignificance: 'Tier I' | 'Tier II' | 'Tier III' | 'Unknown';
  reviewed: boolean;
  reported: boolean;
}

interface FusionTabProps {
  taskId: string;
  filterState?: TableFilterState;
  onFilterChange?: (state: TableFilterState) => void;
}

// Mock数据
const mockFusions: Fusion[] = [
  { id: '1', gene5: 'EML4', gene3: 'ALK', breakpoint5: 'chr2:42472827', breakpoint3: 'chr2:29446394', fusionType: 'In-frame', readCount: 156, splitReads: 89, spanningReads: 67, clinicalSignificance: 'Tier I', reviewed: true, reported: true },
  { id: '2', gene5: 'TMPRSS2', gene3: 'ERG', breakpoint5: 'chr21:41498119', breakpoint3: 'chr21:38445621', fusionType: 'In-frame', readCount: 234, splitReads: 145, spanningReads: 89, clinicalSignificance: 'Tier I', reviewed: true, reported: false },
  { id: '3', gene5: 'BCR', gene3: 'ABL1', breakpoint5: 'chr22:23632600', breakpoint3: 'chr9:130854064', fusionType: 'In-frame', readCount: 312, splitReads: 198, spanningReads: 114, clinicalSignificance: 'Tier I', reviewed: false, reported: false },
  { id: '4', gene5: 'KIF5B', gene3: 'RET', breakpoint5: 'chr10:32306071', breakpoint3: 'chr10:43612032', fusionType: 'In-frame', readCount: 78, splitReads: 45, spanningReads: 33, clinicalSignificance: 'Tier II', reviewed: false, reported: false },
  { id: '5', gene5: 'CD74', gene3: 'ROS1', breakpoint5: 'chr5:149784243', breakpoint3: 'chr6:117645578', fusionType: 'In-frame', readCount: 92, splitReads: 56, spanningReads: 36, clinicalSignificance: 'Tier I', reviewed: false, reported: false },
];

async function getFusions(_taskId: string, filterState: TableFilterState): Promise<PaginatedResult<Fusion>> {
  await new Promise(resolve => setTimeout(resolve, 300));
  let data = [...mockFusions];
  
  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    data = data.filter(item => item.gene5.toLowerCase().includes(query) || item.gene3.toLowerCase().includes(query));
  }
  
  if (filterState.filters.significance) {
    data = data.filter(item => item.clinicalSignificance === filterState.filters.significance);
  }
  
  return { data, total: data.length, page: filterState.page, pageSize: filterState.pageSize };
}

export function FusionTab({ 
  taskId, 
  filterState: externalFilterState, 
  onFilterChange 
}: FusionTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<TableFilterState>(DEFAULT_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<Fusion> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [reviewStatus, setReviewStatus] = React.useState<Record<string, { reviewed: boolean; reported: boolean }>>({});

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  // 加载数据
  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getFusions(taskId, filterState);
      setResult(data);
      setLoading(false);
    }
    loadData();
  }, [taskId, filterState]);

  const handleSearch = React.useCallback((query: string) => {
    setFilterState({ ...filterState, searchQuery: query, page: 1 });
  }, [filterState, setFilterState]);

  const handleSignificanceFilter = React.useCallback((significance: string) => {
    const newFilters = { ...filterState.filters };
    if (significance) {
      newFilters.significance = significance;
    } else {
      delete newFilters.significance;
    }
    setFilterState({ ...filterState, filters: newFilters, page: 1 });
  }, [filterState, setFilterState]);

  const handleReviewChange = React.useCallback((id: string, checked: boolean) => {
    setReviewStatus(prev => ({
      ...prev,
      [id]: { ...prev[id], reviewed: checked, reported: prev[id]?.reported ?? false }
    }));
  }, []);

  const handleReportChange = React.useCallback((id: string, checked: boolean) => {
    setReviewStatus(prev => ({
      ...prev,
      [id]: { reviewed: prev[id]?.reviewed ?? false, reported: checked }
    }));
  }, []);

  const getReviewState = React.useCallback((variant: Fusion) => {
    return reviewStatus[variant.id] ?? { reviewed: variant.reviewed, reported: variant.reported };
  }, [reviewStatus]);

  const getTierVariant = (tier: string): 'danger' | 'warning' | 'info' | 'success' => {
    switch (tier) {
      case 'Tier I': return 'danger';
      case 'Tier II': return 'warning';
      case 'Tier III': return 'info';
      default: return 'info';
    }
  };

  // 列定义
  const columns: Column<Fusion>[] = [
    {
      id: 'reviewed',
      header: <ReviewColumnHeader />,
      accessor: (row) => {
        const state = getReviewState(row);
        return (
          <ReviewCheckbox
            checked={state.reviewed}
            onChange={(checked) => handleReviewChange(row.id, checked)}
          />
        );
      },
      width: 60,
    },
    {
      id: 'reported',
      header: <ReportColumnHeader />,
      accessor: (row) => {
        const state = getReviewState(row);
        return (
          <ReportCheckbox
            checked={state.reported}
            onChange={(checked) => handleReportChange(row.id, checked)}
          />
        );
      },
      width: 60,
    },
    {
      id: 'fusion',
      header: '融合基因',
      accessor: (row) => <span className="font-medium">{row.gene5}::{row.gene3}</span>,
      width: 150,
    },
    {
      id: 'breakpoint5',
      header: "5'断点",
      accessor: 'breakpoint5',
      width: 140,
    },
    {
      id: 'breakpoint3',
      header: "3'断点",
      accessor: 'breakpoint3',
      width: 140,
    },
    {
      id: 'fusionType',
      header: '融合类型',
      accessor: (row) => (
        <Tag variant={row.fusionType === 'In-frame' ? 'success' : 'warning'}>
          {row.fusionType}
        </Tag>
      ),
      width: 100,
    },
    {
      id: 'readCount',
      header: '支持读数',
      accessor: (row) => row.readCount,
      width: 90,
      sortable: true,
    },
    {
      id: 'splitReads',
      header: 'Split Reads',
      accessor: (row) => row.splitReads,
      width: 100,
    },
    {
      id: 'spanningReads',
      header: 'Spanning',
      accessor: (row) => row.spanningReads,
      width: 90,
    },
    {
      id: 'clinicalSignificance',
      header: '临床意义',
      accessor: (row) => (
        <Tag variant={getTierVariant(row.clinicalSignificance)}>
          {row.clinicalSignificance}
        </Tag>
      ),
      width: 100,
    },
  ];

  return (
    <div>
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* 搜索框 */}
          <div className="w-64">
            <Input
              placeholder="搜索基因..."
              value={filterState.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              leftElement={<Search className="w-4 h-4" />}
            />
          </div>

          {/* 临床意义筛选 */}
          <select
            value={(filterState.filters.significance as string) || ''}
            onChange={(e) => handleSignificanceFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border-default rounded-md bg-canvas-default text-fg-default"
          >
            <option value="">全部等级</option>
            <option value="Tier I">Tier I</option>
            <option value="Tier II">Tier II</option>
            <option value="Tier III">Tier III</option>
          </select>
        </div>

        {/* 统计信息 */}
        <div className="text-sm text-fg-muted">
          共 {result?.total ?? 0} 个融合基因
        </div>
      </div>

      {/* 数据表格 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-emphasis" />
        </div>
      ) : result && result.data.length > 0 ? (
        <DataTable
          data={result.data}
          columns={columns}
          rowKey="id"
          striped
          density="compact"
        />
      ) : (
        <div className="text-center py-12 text-fg-muted">
          暂无融合基因数据
        </div>
      )}
    </div>
  );
}
