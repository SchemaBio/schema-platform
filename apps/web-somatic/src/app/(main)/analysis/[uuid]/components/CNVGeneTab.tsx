'use client';

import * as React from 'react';
import { DataTable, Tag, Input } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, ListFilter } from 'lucide-react';
import type { TableFilterState, PaginatedResult } from '../types';
import { DEFAULT_FILTER_STATE } from '../types';
import { getGeneLists, type GeneListOption } from '../mock-data';
import { ReviewCheckbox, ReportCheckbox, ReviewColumnHeader, ReportColumnHeader } from './ReviewCheckboxes';

// 基因水平CNV类型
interface CNVGene {
  id: string;
  gene: string;
  chromosome: string;
  startPosition: number;
  endPosition: number;
  type: 'Amplification' | 'Deletion';
  copyNumber: number;
  logRatio: number;
  reviewed: boolean;
  reported: boolean;
}

interface CNVGeneTabProps {
  taskId: string;
  filterState?: TableFilterState;
  onFilterChange?: (state: TableFilterState) => void;
}

// Mock数据
const mockCNVGenes: CNVGene[] = [
  { id: '1', gene: 'EGFR', chromosome: 'chr7', startPosition: 55019017, endPosition: 55211628, type: 'Amplification', copyNumber: 8, logRatio: 2.0, reviewed: false, reported: false },
  { id: '2', gene: 'MET', chromosome: 'chr7', startPosition: 116672196, endPosition: 116798386, type: 'Amplification', copyNumber: 6, logRatio: 1.58, reviewed: false, reported: false },
  { id: '3', gene: 'ERBB2', chromosome: 'chr17', startPosition: 39687914, endPosition: 39730426, type: 'Amplification', copyNumber: 12, logRatio: 2.58, reviewed: true, reported: true },
  { id: '4', gene: 'CDKN2A', chromosome: 'chr9', startPosition: 21967751, endPosition: 21995300, type: 'Deletion', copyNumber: 0, logRatio: -3.0, reviewed: true, reported: false },
  { id: '5', gene: 'PTEN', chromosome: 'chr10', startPosition: 87863113, endPosition: 87971930, type: 'Deletion', copyNumber: 1, logRatio: -1.0, reviewed: false, reported: false },
  { id: '6', gene: 'MYC', chromosome: 'chr8', startPosition: 127735434, endPosition: 127742951, type: 'Amplification', copyNumber: 10, logRatio: 2.32, reviewed: false, reported: false },
];

async function getCNVGenes(_taskId: string, filterState: TableFilterState): Promise<PaginatedResult<CNVGene>> {
  await new Promise(resolve => setTimeout(resolve, 300));
  let data = [...mockCNVGenes];
  
  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    data = data.filter(item => item.gene.toLowerCase().includes(query) || item.chromosome.toLowerCase().includes(query));
  }
  
  if (filterState.filters.type) {
    data = data.filter(item => item.type === filterState.filters.type);
  }
  
  return { data, total: data.length, page: filterState.page, pageSize: filterState.pageSize };
}

export function CNVGeneTab({ 
  taskId, 
  filterState: externalFilterState, 
  onFilterChange 
}: CNVGeneTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<TableFilterState>(DEFAULT_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<CNVGene> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [geneLists, setGeneLists] = React.useState<GeneListOption[]>([]);
  const [reviewStatus, setReviewStatus] = React.useState<Record<string, { reviewed: boolean; reported: boolean }>>({});

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

  // 加载数据
  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getCNVGenes(taskId, filterState);
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

  const handleGeneListFilter = React.useCallback((geneListId: string) => {
    setFilterState({ ...filterState, geneListId: geneListId || undefined, page: 1 });
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

  const getReviewState = React.useCallback((variant: CNVGene) => {
    return reviewStatus[variant.id] ?? { reviewed: variant.reviewed, reported: variant.reported };
  }, [reviewStatus]);

  // 列定义
  const columns: Column<CNVGene>[] = [
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
      id: 'gene',
      header: '基因',
      accessor: 'gene',
      width: 100,
      sortable: true,
    },
    {
      id: 'chromosome',
      header: '染色体',
      accessor: 'chromosome',
      width: 80,
    },
    {
      id: 'type',
      header: '类型',
      accessor: (row) => (
        <Tag variant={row.type === 'Amplification' ? 'danger' : 'info'}>
          {row.type === 'Amplification' ? '扩增' : '缺失'}
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
      id: 'position',
      header: '位置',
      accessor: (row) => `${row.startPosition.toLocaleString()}-${row.endPosition.toLocaleString()}`,
      width: 200,
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

          {/* 类型筛选 */}
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

        {/* 统计信息 */}
        <div className="text-sm text-fg-muted">
          共 {result?.total ?? 0} 个基因CNV
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
          暂无基因水平CNV数据
        </div>
      )}
    </div>
  );
}
