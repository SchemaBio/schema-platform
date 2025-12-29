'use client';

import * as React from 'react';
import { DataTable, Tag, Input } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search } from 'lucide-react';
import type { TableFilterState, PaginatedResult } from '../types';
import { DEFAULT_FILTER_STATE } from '../types';
import { ReviewCheckbox, ReportCheckbox, ReviewColumnHeader, ReportColumnHeader } from './ReviewCheckboxes';

// 染色体臂水平CNV类型
interface CNVChrom {
  id: string;
  chromosome: string;
  arm: 'p' | 'q';
  type: 'Gain' | 'Loss';
  copyNumber: number;
  logRatio: number;
  size: number; // bp
  reviewed: boolean;
  reported: boolean;
}

interface CNVChromTabProps {
  taskId: string;
  filterState?: TableFilterState;
  onFilterChange?: (state: TableFilterState) => void;
}

// Mock数据
const mockCNVChroms: CNVChrom[] = [
  { id: '1', chromosome: 'chr1', arm: 'q', type: 'Gain', copyNumber: 3, logRatio: 0.58, size: 125000000, reviewed: false, reported: false },
  { id: '2', chromosome: 'chr7', arm: 'p', type: 'Gain', copyNumber: 4, logRatio: 1.0, size: 58000000, reviewed: true, reported: true },
  { id: '3', chromosome: 'chr8', arm: 'q', type: 'Gain', copyNumber: 3, logRatio: 0.58, size: 98000000, reviewed: false, reported: false },
  { id: '4', chromosome: 'chr9', arm: 'p', type: 'Loss', copyNumber: 1, logRatio: -1.0, size: 47000000, reviewed: true, reported: false },
  { id: '5', chromosome: 'chr17', arm: 'p', type: 'Loss', copyNumber: 1, logRatio: -1.0, size: 22000000, reviewed: false, reported: false },
  { id: '6', chromosome: 'chr20', arm: 'q', type: 'Gain', copyNumber: 3, logRatio: 0.58, size: 30000000, reviewed: false, reported: false },
];

async function getCNVChroms(_taskId: string, filterState: TableFilterState): Promise<PaginatedResult<CNVChrom>> {
  await new Promise(resolve => setTimeout(resolve, 300));
  let data = [...mockCNVChroms];
  
  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    data = data.filter(item => item.chromosome.toLowerCase().includes(query));
  }
  
  if (filterState.filters.type) {
    data = data.filter(item => item.type === filterState.filters.type);
  }
  
  return { data, total: data.length, page: filterState.page, pageSize: filterState.pageSize };
}

export function CNVChromTab({ 
  taskId, 
  filterState: externalFilterState, 
  onFilterChange 
}: CNVChromTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<TableFilterState>(DEFAULT_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<CNVChrom> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [reviewStatus, setReviewStatus] = React.useState<Record<string, { reviewed: boolean; reported: boolean }>>({});

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  // 加载数据
  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getCNVChroms(taskId, filterState);
      setResult(data);
      setLoading(false);
    }
    loadData();
  }, [taskId, filterState]);

  const handleSearch = React.useCallback((query: string) => {
    setFilterState({ ...filterState, searchQuery: query, page: 1 });
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

  const getReviewState = React.useCallback((variant: CNVChrom) => {
    return reviewStatus[variant.id] ?? { reviewed: variant.reviewed, reported: variant.reported };
  }, [reviewStatus]);

  const formatSize = (size: number) => {
    if (size >= 1000000) return `${(size / 1000000).toFixed(1)} Mb`;
    if (size >= 1000) return `${(size / 1000).toFixed(1)} kb`;
    return `${size} bp`;
  };

  // 列定义
  const columns: Column<CNVChrom>[] = [
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
      id: 'region',
      header: '染色体臂',
      accessor: (row) => `${row.chromosome}${row.arm}`,
      width: 100,
      sortable: true,
    },
    {
      id: 'type',
      header: '类型',
      accessor: (row) => (
        <Tag variant={row.type === 'Gain' ? 'danger' : 'info'}>
          {row.type === 'Gain' ? '获得' : '丢失'}
        </Tag>
      ),
      width: 80,
    },
    {
      id: 'copyNumber',
      header: '拷贝数',
      accessor: (row) => row.copyNumber,
      width: 80,
      sortable: true,
    },
    {
      id: 'logRatio',
      header: 'Log2 Ratio',
      accessor: (row) => row.logRatio.toFixed(2),
      width: 100,
      sortable: true,
    },
    {
      id: 'size',
      header: '大小',
      accessor: (row) => formatSize(row.size),
      width: 100,
      sortable: true,
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
              placeholder="搜索染色体..."
              value={filterState.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              leftElement={<Search className="w-4 h-4" />}
            />
          </div>

          {/* 类型筛选 */}
          <select
            value={(filterState.filters.type as string) || ''}
            onChange={(e) => handleTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border-default rounded-md bg-canvas-default text-fg-default"
          >
            <option value="">全部类型</option>
            <option value="Gain">获得</option>
            <option value="Loss">丢失</option>
          </select>
        </div>

        {/* 统计信息 */}
        <div className="text-sm text-fg-muted">
          共 {result?.total ?? 0} 个染色体臂CNV
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
          暂无染色体臂水平CNV数据
        </div>
      )}
    </div>
  );
}
