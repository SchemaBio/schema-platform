'use client';

import * as React from 'react';
import { DataTable, Tag, Input } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search } from 'lucide-react';
import type { TableFilterState, PaginatedResult } from '../types';
import { DEFAULT_FILTER_STATE } from '../types';
import { ReviewCheckbox, ReportCheckbox, ReviewColumnHeader, ReportColumnHeader } from './ReviewCheckboxes';

// 新抗原类型
interface Neoantigen {
  id: string;
  gene: string;
  mutation: string;
  peptide: string;
  hlaAllele: string;
  bindingAffinity: number; // nM
  percentileRank: number;
  bindingLevel: 'Strong' | 'Weak' | 'None';
  reviewed: boolean;
  reported: boolean;
}

interface NeoantigenTabProps {
  taskId: string;
  filterState?: TableFilterState;
  onFilterChange?: (state: TableFilterState) => void;
}

// Mock数据
const mockNeoantigens: Neoantigen[] = [
  { id: '1', gene: 'KRAS', mutation: 'G12D', peptide: 'KLVVVGADGV', hlaAllele: 'HLA-A*02:01', bindingAffinity: 45.2, percentileRank: 0.12, bindingLevel: 'Strong', reviewed: true, reported: true },
  { id: '2', gene: 'TP53', mutation: 'R175H', peptide: 'HMTEVVRHC', hlaAllele: 'HLA-A*02:01', bindingAffinity: 89.5, percentileRank: 0.35, bindingLevel: 'Strong', reviewed: false, reported: false },
  { id: '3', gene: 'EGFR', mutation: 'L858R', peptide: 'KITDFGRAK', hlaAllele: 'HLA-A*11:01', bindingAffinity: 156.3, percentileRank: 0.78, bindingLevel: 'Weak', reviewed: false, reported: false },
  { id: '4', gene: 'BRAF', mutation: 'V600E', peptide: 'LATEKSRWS', hlaAllele: 'HLA-B*07:02', bindingAffinity: 234.8, percentileRank: 1.2, bindingLevel: 'Weak', reviewed: false, reported: false },
  { id: '5', gene: 'PIK3CA', mutation: 'H1047R', peptide: 'RHGGWTTKM', hlaAllele: 'HLA-A*24:02', bindingAffinity: 67.1, percentileRank: 0.25, bindingLevel: 'Strong', reviewed: true, reported: false },
];

async function getNeoantigens(_taskId: string, filterState: TableFilterState): Promise<PaginatedResult<Neoantigen>> {
  await new Promise(resolve => setTimeout(resolve, 300));
  let data = [...mockNeoantigens];
  
  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    data = data.filter(item => item.gene.toLowerCase().includes(query) || item.peptide.toLowerCase().includes(query));
  }
  
  if (filterState.filters.bindingLevel) {
    data = data.filter(item => item.bindingLevel === filterState.filters.bindingLevel);
  }
  
  return { data, total: data.length, page: filterState.page, pageSize: filterState.pageSize };
}

export function NeoantigenTab({ 
  taskId, 
  filterState: externalFilterState, 
  onFilterChange 
}: NeoantigenTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<TableFilterState>(DEFAULT_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<Neoantigen> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [reviewStatus, setReviewStatus] = React.useState<Record<string, { reviewed: boolean; reported: boolean }>>({});

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  // 加载数据
  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getNeoantigens(taskId, filterState);
      setResult(data);
      setLoading(false);
    }
    loadData();
  }, [taskId, filterState]);

  const handleSearch = React.useCallback((query: string) => {
    setFilterState({ ...filterState, searchQuery: query, page: 1 });
  }, [filterState, setFilterState]);

  const handleBindingLevelFilter = React.useCallback((level: string) => {
    const newFilters = { ...filterState.filters };
    if (level) {
      newFilters.bindingLevel = level;
    } else {
      delete newFilters.bindingLevel;
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

  const getReviewState = React.useCallback((variant: Neoantigen) => {
    return reviewStatus[variant.id] ?? { reviewed: variant.reviewed, reported: variant.reported };
  }, [reviewStatus]);

  const getBindingVariant = (level: string): 'success' | 'warning' | 'info' => {
    switch (level) {
      case 'Strong': return 'success';
      case 'Weak': return 'warning';
      default: return 'info';
    }
  };

  // 列定义
  const columns: Column<Neoantigen>[] = [
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
      width: 80,
      sortable: true,
    },
    {
      id: 'mutation',
      header: '突变',
      accessor: 'mutation',
      width: 80,
    },
    {
      id: 'peptide',
      header: '肽段序列',
      accessor: (row) => <span className="font-mono text-xs">{row.peptide}</span>,
      width: 120,
    },
    {
      id: 'hlaAllele',
      header: 'HLA等位基因',
      accessor: 'hlaAllele',
      width: 120,
    },
    {
      id: 'bindingAffinity',
      header: '亲和力(nM)',
      accessor: (row) => row.bindingAffinity.toFixed(1),
      width: 100,
      sortable: true,
    },
    {
      id: 'percentileRank',
      header: '%Rank',
      accessor: (row) => row.percentileRank.toFixed(2),
      width: 80,
      sortable: true,
    },
    {
      id: 'bindingLevel',
      header: '结合强度',
      accessor: (row) => (
        <Tag variant={getBindingVariant(row.bindingLevel)}>
          {row.bindingLevel === 'Strong' ? '强结合' : row.bindingLevel === 'Weak' ? '弱结合' : '无结合'}
        </Tag>
      ),
      width: 90,
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
              placeholder="搜索基因/肽段..."
              value={filterState.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              leftElement={<Search className="w-4 h-4" />}
            />
          </div>

          {/* 结合强度筛选 */}
          <select
            value={(filterState.filters.bindingLevel as string) || ''}
            onChange={(e) => handleBindingLevelFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border-default rounded-md bg-canvas-default text-fg-default"
          >
            <option value="">全部结合强度</option>
            <option value="Strong">强结合</option>
            <option value="Weak">弱结合</option>
          </select>
        </div>

        {/* 统计信息 */}
        <div className="text-sm text-fg-muted">
          共 {result?.total ?? 0} 个新抗原
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
          暂无新抗原数据
        </div>
      )}
    </div>
  );
}
