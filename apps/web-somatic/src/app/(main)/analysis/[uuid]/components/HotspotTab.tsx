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

// 突变类型 (NCCL规范)
type VariantType = 'SNV' | 'Insertion' | 'Deletion' | 'Complex';

// 突变后果 (NCCL规范)
type Consequence = 
  | 'Synonymous_substitution'    // 同义突变
  | 'Missense_substitution'      // 错义突变
  | 'Nonsense_substitution'      // 无义突变
  | 'Inframe_insertion'          // 框内插入
  | 'Frameshift_insertion'       // 移码插入
  | 'Inframe_deletion'           // 框内删除
  | 'Frameshift_deletion'        // 移码删除
  | 'Complex_mutation'           // 复杂突变
  | 'Splice_Site_mutation'       // 剪接点改变
  | 'Other';                     // 其他

// 热点突变类型 (NCCL规范)
interface Hotspot {
  id: string;
  // 基因组位置信息
  chr: string;                   // 染色体 (不带chr前缀)
  start: number;                 // 起始位置
  end: number;                   // 终止位置 (SNV时与start相同，Insertion时为"-")
  ref: string;                   // 参考碱基 (Insertion时为"-")
  alt: string;                   // 变异碱基 (Deletion时为"-")
  // 基因与转录本信息
  gene: string;                  // HGNC基因名
  type: VariantType;             // 突变类型
  transcript: string;            // ClinVar参考转录本 (含版本号)
  cHGVS: string;                 // cDNA变化 (HGVS规则)
  pHGVS: string;                 // 蛋白质变化 (HGVS规则，可缩写)
  // 检测信息
  vaf: number;                   // VAF (0-1)
  depth: number;                 // 覆盖深度
  consequence: Consequence;      // 突变后果
  affectedExon: string;          // 受影响外显子 (如 "19/27")
  // 临床意义
  hotspotType: 'Oncogenic' | 'Resistance' | 'Sensitizing';
  clinicalSignificance: 'Tier I' | 'Tier II' | 'Tier III' | 'Unknown';
  drugAssociation: string[];
  cancerType: string[];
  cosmicId?: string;
  oncokbLevel?: string;
  pubmedIds?: string[];
  clinicalTrials?: string[];
  // 状态
  reviewed: boolean;
  reported: boolean;
}

interface HotspotTabProps {
  taskId: string;
  filterState?: TableFilterState;
  onFilterChange?: (state: TableFilterState) => void;
}

// Mock数据 - 常见肿瘤热点突变 (NCCL规范)
const mockHotspots: Hotspot[] = [
  { 
    id: '1', 
    chr: '7', start: 55259515, end: 55259515, ref: 'T', alt: 'G',
    gene: 'EGFR', type: 'SNV', transcript: 'NM_005228.5', 
    cHGVS: 'c.2573T>G', pHGVS: 'p.L858R',
    vaf: 0.35, depth: 1250, consequence: 'Missense_substitution', affectedExon: '21/28',
    hotspotType: 'Sensitizing', clinicalSignificance: 'Tier I', 
    drugAssociation: ['Gefitinib', 'Erlotinib', 'Osimertinib'], cancerType: ['NSCLC'],
    cosmicId: 'COSM6224', oncokbLevel: 'Level 1', pubmedIds: ['15118073', '15329413'],
    clinicalTrials: ['NCT02296125', 'NCT03778229'],
    reviewed: true, reported: true 
  },
  { 
    id: '2', 
    chr: '7', start: 55249071, end: 55249071, ref: 'C', alt: 'T',
    gene: 'EGFR', type: 'SNV', transcript: 'NM_005228.5', 
    cHGVS: 'c.2369C>T', pHGVS: 'p.T790M',
    vaf: 0.2312, depth: 980, consequence: 'Missense_substitution', affectedExon: '19/28',
    hotspotType: 'Resistance', clinicalSignificance: 'Tier I', 
    drugAssociation: ['Osimertinib'], cancerType: ['NSCLC'],
    cosmicId: 'COSM6240', oncokbLevel: 'Level 1', pubmedIds: ['15737014', '25923549'],
    reviewed: true, reported: false 
  },
  { 
    id: '3', 
    chr: '7', start: 55242467, end: 55242484, ref: 'AATTAAGAGAAGCAACAT', alt: '-',
    gene: 'EGFR', type: 'Deletion', transcript: 'NM_005228.5', 
    cHGVS: 'c.2237_2254del18', pHGVS: 'p.E746_S752delinsA',
    vaf: 0.2312, depth: 1100, consequence: 'Inframe_deletion', affectedExon: '19/28',
    hotspotType: 'Sensitizing', clinicalSignificance: 'Tier I', 
    drugAssociation: ['Gefitinib', 'Erlotinib', 'Osimertinib', 'Afatinib'], cancerType: ['NSCLC'],
    cosmicId: 'COSM6223', oncokbLevel: 'Level 1', pubmedIds: ['15118073'],
    reviewed: false, reported: false 
  },
  { 
    id: '4', 
    chr: '7', start: 55249010, end: -1, ref: '-', alt: 'GTT',  // NCCL: Insertion的end为"-"，用-1表示
    gene: 'EGFR', type: 'Insertion', transcript: 'NM_005228.5', 
    cHGVS: 'c.2308_2309insGTT', pHGVS: 'p.D770delinsGY',
    vaf: 0.18, depth: 920, consequence: 'Inframe_insertion', affectedExon: '20/28',
    hotspotType: 'Resistance', clinicalSignificance: 'Tier I', 
    drugAssociation: ['Poziotinib', 'Mobocertinib'], cancerType: ['NSCLC'],
    cosmicId: 'COSM12376', oncokbLevel: 'Level 2', pubmedIds: ['23371856'],
    reviewed: false, reported: false 
  },
  { 
    id: '5', 
    chr: '12', start: 25398284, end: 25398284, ref: 'G', alt: 'A',
    gene: 'KRAS', type: 'SNV', transcript: 'NM_004985.5', 
    cHGVS: 'c.35G>A', pHGVS: 'p.G12D',
    vaf: 0.28, depth: 1560, consequence: 'Missense_substitution', affectedExon: '2/6',
    hotspotType: 'Oncogenic', clinicalSignificance: 'Tier I', 
    drugAssociation: ['Sotorasib (G12C only)'], cancerType: ['PDAC', 'CRC', 'NSCLC'],
    cosmicId: 'COSM521', oncokbLevel: 'Level 3A', pubmedIds: ['23288408'],
    reviewed: false, reported: false 
  },
  { 
    id: '6', 
    chr: '7', start: 140453136, end: 140453136, ref: 'A', alt: 'T',
    gene: 'BRAF', type: 'SNV', transcript: 'NM_004333.6', 
    cHGVS: 'c.1799T>A', pHGVS: 'p.V600E',
    vaf: 0.42, depth: 890, consequence: 'Missense_substitution', affectedExon: '15/18',
    hotspotType: 'Oncogenic', clinicalSignificance: 'Tier I', 
    drugAssociation: ['Vemurafenib', 'Dabrafenib', 'Encorafenib'], cancerType: ['Melanoma', 'CRC', 'NSCLC'],
    cosmicId: 'COSM476', oncokbLevel: 'Level 1', pubmedIds: ['12068308', '20818844'],
    clinicalTrials: ['NCT01909453'],
    reviewed: false, reported: false 
  },
  { 
    id: '7', 
    chr: '3', start: 178952085, end: 178952085, ref: 'A', alt: 'G',
    gene: 'PIK3CA', type: 'SNV', transcript: 'NM_006218.4', 
    cHGVS: 'c.3140A>G', pHGVS: 'p.H1047R',
    vaf: 0.18, depth: 1120, consequence: 'Missense_substitution', affectedExon: '21/21',
    hotspotType: 'Oncogenic', clinicalSignificance: 'Tier I', 
    drugAssociation: ['Alpelisib'], cancerType: ['Breast'],
    cosmicId: 'COSM775', oncokbLevel: 'Level 1', pubmedIds: ['15016963', '31091374'],
    reviewed: false, reported: false 
  },
  { 
    id: '8', 
    chr: '9', start: 36923458, end: 36923459, ref: 'GG', alt: 'AT',
    gene: 'PAX5', type: 'Complex', transcript: 'NM_016734.3', 
    cHGVS: 'c.803_804delinsTA', pHGVS: 'p.A268D',
    vaf: 0.2312, depth: 850, consequence: 'Missense_substitution', affectedExon: '7/10',
    hotspotType: 'Oncogenic', clinicalSignificance: 'Tier II', 
    drugAssociation: [], cancerType: ['B-ALL'],
    cosmicId: 'COSM1234567',
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
      item.pHGVS.toLowerCase().includes(query) ||
      item.cHGVS.toLowerCase().includes(query) ||
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

  // 获取突变类型标签
  const getTypeVariant = (type: VariantType): 'info' | 'warning' | 'danger' | 'success' => {
    switch (type) {
      case 'SNV': return 'info';
      case 'Insertion': return 'success';
      case 'Deletion': return 'danger';
      case 'Complex': return 'warning';
      default: return 'info';
    }
  };

  // 获取突变后果显示文本
  const getConsequenceLabel = (consequence: Consequence): string => {
    const labels: Record<Consequence, string> = {
      'Synonymous_substitution': '同义突变',
      'Missense_substitution': '错义突变',
      'Nonsense_substitution': '无义突变',
      'Inframe_insertion': '框内插入',
      'Frameshift_insertion': '移码插入',
      'Inframe_deletion': '框内删除',
      'Frameshift_deletion': '移码删除',
      'Complex_mutation': '复杂突变',
      'Splice_Site_mutation': '剪接突变',
      'Other': '其他',
    };
    return labels[consequence] || consequence;
  };

  // 列定义 (NCCL规范)
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
      id: 'chr',
      header: 'Chr',
      accessor: 'chr',
      width: 50,
    },
    {
      id: 'start',
      header: 'Start',
      accessor: (row) => (
        <PositionLink
          chromosome={`chr${row.chr}`}
          position={row.start}
          label={String(row.start)}
          onClick={handleOpenIGV}
        />
      ),
      width: 100,
    },
    {
      id: 'end',
      header: 'End',
      accessor: (row) => row.type === 'Insertion' ? '-' : String(row.end),
      width: 100,
    },
    {
      id: 'ref',
      header: 'Ref',
      accessor: (row) => (
        <span className="font-mono text-xs" title={row.ref}>
          {row.ref.length > 8 ? `${row.ref.substring(0, 8)}...` : row.ref}
        </span>
      ),
      width: 80,
    },
    {
      id: 'alt',
      header: 'Alt',
      accessor: (row) => (
        <span className="font-mono text-xs" title={row.alt}>
          {row.alt.length > 8 ? `${row.alt.substring(0, 8)}...` : row.alt}
        </span>
      ),
      width: 80,
    },
    {
      id: 'gene',
      header: 'Gene',
      accessor: 'gene',
      width: 70,
      sortable: true,
    },
    {
      id: 'type',
      header: 'Type',
      accessor: (row) => (
        <Tag variant={getTypeVariant(row.type)}>
          {row.type}
        </Tag>
      ),
      width: 90,
    },
    {
      id: 'transcript',
      header: 'Transcript',
      accessor: 'transcript',
      width: 120,
    },
    {
      id: 'cHGVS',
      header: 'cHGVS',
      accessor: 'cHGVS',
      width: 140,
    },
    {
      id: 'pHGVS',
      header: 'pHGVS',
      accessor: 'pHGVS',
      width: 120,
    },
    {
      id: 'vaf',
      header: 'VAF%',
      accessor: (row) => `${(row.vaf * 100).toFixed(2)}`,
      width: 70,
      sortable: true,
    },
    {
      id: 'consequence',
      header: 'Consequence',
      accessor: (row) => (
        <span title={row.consequence}>
          {getConsequenceLabel(row.consequence)}
        </span>
      ),
      width: 100,
    },
    {
      id: 'affectedExon',
      header: 'Affected_Exon',
      accessor: 'affectedExon',
      width: 100,
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
