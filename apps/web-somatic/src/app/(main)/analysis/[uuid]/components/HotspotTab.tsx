'use client';

import * as React from 'react';
import { DataTable, Tag, Input } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, ListFilter } from 'lucide-react';
import type { TableFilterState, PaginatedResult } from '../types';
import { DEFAULT_FILTER_STATE } from '../types';
import { getGeneLists, type GeneListOption } from '../mock-data';
import { ReviewCheckbox, ReportCheckbox, ReviewColumnHeader, ReportColumnHeader } from './ReviewCheckboxes';
import { HotspotDetailPanel } from './HotspotDetailPanel';
import { IGVViewer, PositionLink } from './IGVViewer';

// 热点突变类型
interface Hotspot {
  id: string;
  gene: string;
  mutation: string;
  chromosome: string;
  position: number;
  ref: string;
  alt: string;
  transcript: string;
  hgvsc: string;
  hgvsp: string;
  vaf: number;
  depth: number;
  hotspotType: 'Oncogenic' | 'Resistance' | 'Sensitizing';
  clinicalSignificance: 'Tier I' | 'Tier II' | 'Tier III' | 'Unknown';
  drugAssociation: string[];
  cancerType: string[];
  cosmicId?: string;
  oncokbLevel?: string;
  pubmedIds?: string[];
  clinicalTrials?: string[];
  reviewed: boolean;
  reported: boolean;
}

interface HotspotTabProps {
  taskId: string;
  filterState?: TableFilterState;
  onFilterChange?: (state: TableFilterState) => void;
}

// Mock数据 - 常见肿瘤热点突变
const mockHotspots: Hotspot[] = [
  { 
    id: '1', gene: 'EGFR', mutation: 'L858R', chromosome: 'chr7', position: 55259515, ref: 'T', alt: 'G', 
    transcript: 'NM_005228.5', hgvsc: 'c.2573T>G', hgvsp: 'p.Leu858Arg',
    vaf: 0.35, depth: 1250, hotspotType: 'Sensitizing', clinicalSignificance: 'Tier I', 
    drugAssociation: ['Gefitinib', 'Erlotinib', 'Osimertinib'], cancerType: ['NSCLC'],
    cosmicId: 'COSM6224', oncokbLevel: 'Level 1', pubmedIds: ['15118073', '15329413'],
    clinicalTrials: ['NCT02296125', 'NCT03778229'],
    reviewed: true, reported: true 
  },
  { 
    id: '2', gene: 'EGFR', mutation: 'T790M', chromosome: 'chr7', position: 55249071, ref: 'C', alt: 'T', 
    transcript: 'NM_005228.5', hgvsc: 'c.2369C>T', hgvsp: 'p.Thr790Met',
    vaf: 0.12, depth: 980, hotspotType: 'Resistance', clinicalSignificance: 'Tier I', 
    drugAssociation: ['Osimertinib'], cancerType: ['NSCLC'],
    cosmicId: 'COSM6240', oncokbLevel: 'Level 1', pubmedIds: ['15737014', '25923549'],
    reviewed: true, reported: false 
  },
  { 
    id: '3', gene: 'KRAS', mutation: 'G12D', chromosome: 'chr12', position: 25398284, ref: 'G', alt: 'A', 
    transcript: 'NM_004985.5', hgvsc: 'c.35G>A', hgvsp: 'p.Gly12Asp',
    vaf: 0.28, depth: 1560, hotspotType: 'Oncogenic', clinicalSignificance: 'Tier I', 
    drugAssociation: ['Sotorasib (G12C only)'], cancerType: ['PDAC', 'CRC', 'NSCLC'],
    cosmicId: 'COSM521', oncokbLevel: 'Level 3A', pubmedIds: ['23288408'],
    reviewed: false, reported: false 
  },
  { 
    id: '4', gene: 'BRAF', mutation: 'V600E', chromosome: 'chr7', position: 140453136, ref: 'A', alt: 'T', 
    transcript: 'NM_004333.6', hgvsc: 'c.1799T>A', hgvsp: 'p.Val600Glu',
    vaf: 0.42, depth: 890, hotspotType: 'Oncogenic', clinicalSignificance: 'Tier I', 
    drugAssociation: ['Vemurafenib', 'Dabrafenib', 'Encorafenib'], cancerType: ['Melanoma', 'CRC', 'NSCLC'],
    cosmicId: 'COSM476', oncokbLevel: 'Level 1', pubmedIds: ['12068308', '20818844'],
    clinicalTrials: ['NCT01909453'],
    reviewed: false, reported: false 
  },
  { 
    id: '5', gene: 'PIK3CA', mutation: 'H1047R', chromosome: 'chr3', position: 178952085, ref: 'A', alt: 'G', 
    transcript: 'NM_006218.4', hgvsc: 'c.3140A>G', hgvsp: 'p.His1047Arg',
    vaf: 0.18, depth: 1120, hotspotType: 'Oncogenic', clinicalSignificance: 'Tier I', 
    drugAssociation: ['Alpelisib'], cancerType: ['Breast'],
    cosmicId: 'COSM775', oncokbLevel: 'Level 1', pubmedIds: ['15016963', '31091374'],
    reviewed: false, reported: false 
  },
  { 
    id: '6', gene: 'NRAS', mutation: 'Q61K', chromosome: 'chr1', position: 115256529, ref: 'C', alt: 'A', 
    transcript: 'NM_002524.5', hgvsc: 'c.181C>A', hgvsp: 'p.Gln61Lys',
    vaf: 0.22, depth: 750, hotspotType: 'Oncogenic', clinicalSignificance: 'Tier II', 
    drugAssociation: [], cancerType: ['Melanoma', 'AML'],
    cosmicId: 'COSM580', oncokbLevel: 'Level 3B',
    reviewed: false, reported: false 
  },
  { 
    id: '7', gene: 'ALK', mutation: 'F1174L', chromosome: 'chr2', position: 29443695, ref: 'G', alt: 'T', 
    transcript: 'NM_004304.5', hgvsc: 'c.3522G>T', hgvsp: 'p.Phe1174Leu',
    vaf: 0.31, depth: 680, hotspotType: 'Resistance', clinicalSignificance: 'Tier I', 
    drugAssociation: ['Lorlatinib'], cancerType: ['Neuroblastoma', 'NSCLC'],
    cosmicId: 'COSM28055', oncokbLevel: 'Level R2', pubmedIds: ['21030459'],
    reviewed: false, reported: false 
  },
];

async function getHotspots(_taskId: string, filterState: TableFilterState): Promise<PaginatedResult<Hotspot>> {
  await new Promise(resolve => setTimeout(resolve, 300));
  let data = [...mockHotspots];
  
  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    data = data.filter(item => 
      item.gene.toLowerCase().includes(query) || 
      item.mutation.toLowerCase().includes(query) ||
      item.drugAssociation.some(d => d.toLowerCase().includes(query))
    );
  }
  
  if (filterState.filters.hotspotType) {
    data = data.filter(item => item.hotspotType === filterState.filters.hotspotType);
  }

  if (filterState.filters.significance) {
    data = data.filter(item => item.clinicalSignificance === filterState.filters.significance);
  }
  
  return { data, total: data.length, page: filterState.page, pageSize: filterState.pageSize };
}

export function HotspotTab({ 
  taskId, 
  filterState: externalFilterState, 
  onFilterChange 
}: HotspotTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<TableFilterState>(DEFAULT_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<Hotspot> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [geneLists, setGeneLists] = React.useState<GeneListOption[]>([]);
  const [reviewStatus, setReviewStatus] = React.useState<Record<string, { reviewed: boolean; reported: boolean }>>({});

  // 详情面板状态
  const [selectedHotspot, setSelectedHotspot] = React.useState<Hotspot | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = React.useState(false);

  // IGV 查看器状态
  const [igvState, setIgvState] = React.useState<{
    isOpen: boolean;
    chromosome: string;
    position: number;
  }>({ isOpen: false, chromosome: '', position: 0 });

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  // 打开 IGV 查看器
  const handleOpenIGV = React.useCallback((chromosome: string, position: number) => {
    setIgvState({ isOpen: true, chromosome, position });
  }, []);

  // 关闭 IGV 查看器
  const handleCloseIGV = React.useCallback(() => {
    setIgvState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // 点击行打开详情面板
  const handleRowClick = React.useCallback((hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
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
      const data = await getHotspots(taskId, filterState);
      setResult(data);
      setLoading(false);
    }
    loadData();
  }, [taskId, filterState]);

  const handleSearch = React.useCallback((query: string) => {
    setFilterState({ ...filterState, searchQuery: query, page: 1 });
  }, [filterState, setFilterState]);

  const handleGeneListFilter = React.useCallback((geneListId: string) => {
    setFilterState({ ...filterState, geneListId: geneListId || undefined, page: 1 });
  }, [filterState, setFilterState]);

  const handleHotspotTypeFilter = React.useCallback((type: string) => {
    const newFilters = { ...filterState.filters };
    if (type) {
      newFilters.hotspotType = type;
    } else {
      delete newFilters.hotspotType;
    }
    setFilterState({ ...filterState, filters: newFilters, page: 1 });
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

  const getReviewState = React.useCallback((variant: Hotspot) => {
    return reviewStatus[variant.id] ?? { reviewed: variant.reviewed, reported: variant.reported };
  }, [reviewStatus]);

  const getHotspotTypeVariant = (type: string): 'danger' | 'warning' | 'success' => {
    switch (type) {
      case 'Oncogenic': return 'danger';
      case 'Resistance': return 'warning';
      case 'Sensitizing': return 'success';
      default: return 'warning';
    }
  };

  const getTierVariant = (tier: string): 'danger' | 'warning' | 'info' => {
    switch (tier) {
      case 'Tier I': return 'danger';
      case 'Tier II': return 'warning';
      default: return 'info';
    }
  };

  // 获取当前选中的基因列表信息
  const selectedGeneList = React.useMemo(() => {
    if (!filterState.geneListId) return null;
    return geneLists.find(list => list.id === filterState.geneListId);
  }, [filterState.geneListId, geneLists]);

  // 列定义
  const columns: Column<Hotspot>[] = [
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
      accessor: (row) => <span className="font-medium">{row.mutation}</span>,
      width: 80,
    },
    {
      id: 'position',
      header: '位置',
      accessor: (row) => (
        <PositionLink
          chromosome={row.chromosome}
          position={row.position}
          onClick={handleOpenIGV}
        />
      ),
      width: 140,
    },
    {
      id: 'change',
      header: '碱基变化',
      accessor: (row) => `${row.ref}>${row.alt}`,
      width: 80,
    },
    {
      id: 'transcript',
      header: '转录本',
      accessor: 'transcript',
      width: 120,
    },
    {
      id: 'hgvsp',
      header: '蛋白质变化',
      accessor: 'hgvsp',
      width: 120,
    },
    {
      id: 'vaf',
      header: 'VAF',
      accessor: (row) => `${(row.vaf * 100).toFixed(1)}%`,
      width: 70,
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
      id: 'hotspotType',
      header: '热点类型',
      accessor: (row) => (
        <Tag variant={getHotspotTypeVariant(row.hotspotType)}>
          {row.hotspotType === 'Oncogenic' ? '致癌' : row.hotspotType === 'Resistance' ? '耐药' : '敏感'}
        </Tag>
      ),
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
              placeholder="搜索基因/突变/药物..."
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

          {/* 热点类型筛选 */}
          <select
            value={(filterState.filters.hotspotType as string) || ''}
            onChange={(e) => handleHotspotTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border-default rounded-md bg-canvas-default text-fg-default"
          >
            <option value="">全部类型</option>
            <option value="Oncogenic">致癌突变</option>
            <option value="Resistance">耐药突变</option>
            <option value="Sensitizing">敏感突变</option>
          </select>

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
        <div className="flex items-center gap-4 text-sm text-fg-muted">
          {selectedGeneList && (
            <span className="text-accent-fg">
              已筛选: {selectedGeneList.name}
            </span>
          )}
          <span>共 {result?.total ?? 0} 个热点突变</span>
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
          暂无热点突变数据
        </div>
      )}

      {/* IGV 查看器 */}
      <IGVViewer
        chromosome={igvState.chromosome}
        position={igvState.position}
        isOpen={igvState.isOpen}
        onClose={handleCloseIGV}
      />

      {/* 热点突变详情面板 */}
      <HotspotDetailPanel
        hotspot={selectedHotspot}
        isOpen={detailPanelOpen}
        onClose={handleCloseDetailPanel}
        onOpenIGV={handleOpenIGV}
      />
    </div>
  );
}
