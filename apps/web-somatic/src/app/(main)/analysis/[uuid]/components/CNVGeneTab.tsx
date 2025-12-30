'use client';

import * as React from 'react';
import { DataTable, Tag, Input } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, ListFilter } from 'lucide-react';
import type { TableFilterState, PaginatedResult } from '../types';
import { DEFAULT_FILTER_STATE } from '../types';
import { getGeneLists, type GeneListOption } from '../mock-data';
import { ReviewCheckbox, ReportCheckbox, ReviewColumnHeader, ReportColumnHeader } from './ReviewCheckboxes';
import { CNVGeneDetailPanel } from './CNVGeneDetailPanel';

// 外显子CNV数据
interface ExonCNV {
  exon: string;
  copyNumber: number;
  log2Ratio: number;
}

// 基因水平CNV类型
interface CNVGene {
  id: string;
  gene: string;
  transcript: string;
  chromosome: string;
  type: 'Amplification' | 'Deletion';
  copyNumber: number;
  logRatio: number;
  bafDeviation: number;
  relatedCancers: string[];
  exonData: ExonCNV[];
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
  { 
    id: '1', 
    gene: 'EGFR', 
    transcript: 'NM_005228.5',
    chromosome: 'chr7', 
    type: 'Amplification', 
    copyNumber: 8, 
    logRatio: 2.0, 
    bafDeviation: 0.35,
    relatedCancers: ['非小细胞肺癌', '胶质母细胞瘤', '结直肠癌'],
    exonData: [
      { exon: 'Exon 1', copyNumber: 8, log2Ratio: 2.0 },
      { exon: 'Exon 2', copyNumber: 8, log2Ratio: 1.95 },
      { exon: 'Exon 3', copyNumber: 9, log2Ratio: 2.17 },
      { exon: 'Exon 4', copyNumber: 8, log2Ratio: 2.0 },
      { exon: 'Exon 5', copyNumber: 7, log2Ratio: 1.81 },
      { exon: 'Exon 18', copyNumber: 8, log2Ratio: 2.0 },
      { exon: 'Exon 19', copyNumber: 9, log2Ratio: 2.17 },
      { exon: 'Exon 20', copyNumber: 8, log2Ratio: 2.0 },
      { exon: 'Exon 21', copyNumber: 8, log2Ratio: 1.95 },
    ],
    reviewed: false, 
    reported: false 
  },
  { 
    id: '2', 
    gene: 'MET', 
    transcript: 'NM_000245.4',
    chromosome: 'chr7', 
    type: 'Amplification', 
    copyNumber: 6, 
    logRatio: 1.58, 
    bafDeviation: 0.28,
    relatedCancers: ['非小细胞肺癌', '胃癌', '肝细胞癌'],
    exonData: [
      { exon: 'Exon 1', copyNumber: 6, log2Ratio: 1.58 },
      { exon: 'Exon 2', copyNumber: 6, log2Ratio: 1.55 },
      { exon: 'Exon 14', copyNumber: 7, log2Ratio: 1.81 },
      { exon: 'Exon 15', copyNumber: 6, log2Ratio: 1.58 },
      { exon: 'Exon 16', copyNumber: 6, log2Ratio: 1.55 },
    ],
    reviewed: false, 
    reported: false 
  },
  { 
    id: '3', 
    gene: 'ERBB2', 
    transcript: 'NM_004448.4',
    chromosome: 'chr17', 
    type: 'Amplification', 
    copyNumber: 12, 
    logRatio: 2.58, 
    bafDeviation: 0.42,
    relatedCancers: ['乳腺癌', '胃癌', '卵巢癌'],
    exonData: [
      { exon: 'Exon 1', copyNumber: 12, log2Ratio: 2.58 },
      { exon: 'Exon 2', copyNumber: 11, log2Ratio: 2.46 },
      { exon: 'Exon 3', copyNumber: 12, log2Ratio: 2.58 },
      { exon: 'Exon 4', copyNumber: 13, log2Ratio: 2.70 },
      { exon: 'Exon 5', copyNumber: 12, log2Ratio: 2.58 },
    ],
    reviewed: true, 
    reported: true 
  },
  { 
    id: '4', 
    gene: 'CDKN2A', 
    transcript: 'NM_000077.5',
    chromosome: 'chr9', 
    type: 'Deletion', 
    copyNumber: 0, 
    logRatio: -3.0, 
    bafDeviation: 0.50,
    relatedCancers: ['黑色素瘤', '胰腺癌', '胶质母细胞瘤'],
    exonData: [
      { exon: 'Exon 1', copyNumber: 0, log2Ratio: -3.0 },
      { exon: 'Exon 2', copyNumber: 0, log2Ratio: -3.0 },
      { exon: 'Exon 3', copyNumber: 0, log2Ratio: -3.0 },
    ],
    reviewed: true, 
    reported: false 
  },
  { 
    id: '5', 
    gene: 'PTEN', 
    transcript: 'NM_000314.8',
    chromosome: 'chr10', 
    type: 'Deletion', 
    copyNumber: 1, 
    logRatio: -1.0, 
    bafDeviation: 0.25,
    relatedCancers: ['前列腺癌', '子宫内膜癌', '胶质母细胞瘤'],
    exonData: [
      { exon: 'Exon 1', copyNumber: 1, log2Ratio: -1.0 },
      { exon: 'Exon 2', copyNumber: 1, log2Ratio: -0.95 },
      { exon: 'Exon 3', copyNumber: 1, log2Ratio: -1.0 },
      { exon: 'Exon 4', copyNumber: 2, log2Ratio: 0.0 },
      { exon: 'Exon 5', copyNumber: 1, log2Ratio: -1.0 },
      { exon: 'Exon 6', copyNumber: 1, log2Ratio: -0.95 },
      { exon: 'Exon 7', copyNumber: 1, log2Ratio: -1.0 },
      { exon: 'Exon 8', copyNumber: 1, log2Ratio: -1.05 },
      { exon: 'Exon 9', copyNumber: 1, log2Ratio: -1.0 },
    ],
    reviewed: false, 
    reported: false 
  },
  { 
    id: '6', 
    gene: 'MYC', 
    transcript: 'NM_002467.6',
    chromosome: 'chr8', 
    type: 'Amplification', 
    copyNumber: 10, 
    logRatio: 2.32, 
    bafDeviation: 0.38,
    relatedCancers: ['伯基特淋巴瘤', '乳腺癌', '卵巢癌'],
    exonData: [
      { exon: 'Exon 1', copyNumber: 10, log2Ratio: 2.32 },
      { exon: 'Exon 2', copyNumber: 10, log2Ratio: 2.30 },
      { exon: 'Exon 3', copyNumber: 11, log2Ratio: 2.46 },
    ],
    reviewed: false, 
    reported: false 
  },
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

  // 详情面板状态
  const [selectedVariant, setSelectedVariant] = React.useState<CNVGene | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = React.useState(false);

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  // 点击行打开详情面板
  const handleRowClick = React.useCallback((variant: CNVGene) => {
    setSelectedVariant(variant);
    setDetailPanelOpen(true);
  }, []);

  // 关闭详情面板
  const handleCloseDetailPanel = React.useCallback(() => {
    setDetailPanelOpen(false);
  }, []);

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
      width: 80,
      sortable: true,
    },
    {
      id: 'transcript',
      header: '转录本',
      accessor: (row) => (
        <span className="font-mono text-xs">{row.transcript}</span>
      ),
      width: 120,
    },
    {
      id: 'chromosome',
      header: '染色体',
      accessor: 'chromosome',
      width: 70,
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
      width: 70,
      sortable: true,
    },
    {
      id: 'logRatio',
      header: 'Log2 Ratio',
      accessor: (row) => row.logRatio.toFixed(2),
      width: 90,
      sortable: true,
    },
    {
      id: 'bafDeviation',
      header: 'BAF偏移',
      accessor: (row) => `${(row.bafDeviation * 100).toFixed(1)}%`,
      width: 80,
    },
    {
      id: 'relatedCancers',
      header: '相关癌种',
      accessor: (row) => (
        <span className="text-xs whitespace-pre-wrap">
          {row.relatedCancers.slice(0, 2).join('、')}
          {row.relatedCancers.length > 2 && '...'}
        </span>
      ),
      width: 150,
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
          onRowClick={handleRowClick}
        />
      ) : (
        <div className="text-center py-12 text-fg-muted">
          暂无基因水平CNV数据
        </div>
      )}

      {/* CNV详情面板 */}
      <CNVGeneDetailPanel
        variant={selectedVariant}
        isOpen={detailPanelOpen}
        onClose={handleCloseDetailPanel}
      />
    </div>
  );
}
