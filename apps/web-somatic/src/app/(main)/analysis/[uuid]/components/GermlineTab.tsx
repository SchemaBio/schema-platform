'use client';

import * as React from 'react';
import { DataTable, Tag, Input } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, ListFilter } from 'lucide-react';
import type { TableFilterState, PaginatedResult, ACMGClassification } from '../types';
import { DEFAULT_FILTER_STATE } from '../types';
import { ACMG_CONFIG, getGeneLists, type GeneListOption } from '../mock-data';
import { ReviewCheckbox, ReportCheckbox, ReviewColumnHeader, ReportColumnHeader } from './ReviewCheckboxes';
import { IGVViewer, PositionLink } from './IGVViewer';

// 突变类型 (NCCL规范)
type VariantType = 'SNV' | 'Insertion' | 'Deletion' | 'Complex';

// 突变后果 (NCCL规范)
type Consequence = 
  | 'Synonymous_substitution'
  | 'Missense_substitution'
  | 'Nonsense_substitution'
  | 'Inframe_insertion'
  | 'Frameshift_insertion'
  | 'Inframe_deletion'
  | 'Frameshift_deletion'
  | 'Complex_mutation'
  | 'Splice_Site_mutation'
  | 'Other';

// 胚系变异
interface GermlineVariant {
  id: string;
  // 基因组位置 (NCCL规范)
  chr: string;
  start: number;
  end: number;
  ref: string;
  alt: string;
  // 基因与转录本
  gene: string;
  type: VariantType;
  transcript: string;
  cHGVS: string;
  pHGVS: string;
  consequence: Consequence;
  affectedExon: string;
  // 检测信息
  vaf: number;
  depth: number;
  zygosity: 'Heterozygous' | 'Homozygous' | 'Hemizygous';
  // ACMG分类
  acmgClassification: ACMGClassification;
  acmgCriteria: string[];
  // 临床意义
  diseaseAssociation: string;
  inheritanceMode: string;
  // 数据库注释
  rsId?: string;
  clinvarId?: string;
  clinvarSignificance?: string;
  gnomadAF?: number;
  // 状态
  reviewed: boolean;
  reported: boolean;
}

interface GermlineTabProps {
  taskId: string;
  filterState?: TableFilterState;
  onFilterChange?: (state: TableFilterState) => void;
}

// Mock数据 - 胚系变异（遗传性肿瘤易感基因）
const mockGermlineVariants: GermlineVariant[] = [
  {
    id: 'germ-001',
    chr: '17', start: 43094464, end: 43094464, ref: 'G', alt: 'A',
    gene: 'BRCA1', type: 'SNV', transcript: 'NM_007294.4',
    cHGVS: 'c.5266G>A', pHGVS: 'p.G1756R',
    consequence: 'Missense_substitution', affectedExon: '18/24',
    vaf: 0.48, depth: 320, zygosity: 'Heterozygous',
    acmgClassification: 'Pathogenic',
    acmgCriteria: ['PVS1', 'PM2', 'PP3', 'PP5'],
    diseaseAssociation: '遗传性乳腺癌-卵巢癌综合征',
    inheritanceMode: 'AD',
    rsId: 'rs80357906', clinvarId: 'VCV000017661',
    clinvarSignificance: 'Pathogenic', gnomadAF: 0.00002,
    reviewed: true, reported: true,
  },
  {
    id: 'germ-002',
    chr: '13', start: 32914438, end: 32914438, ref: 'T', alt: 'G',
    gene: 'BRCA2', type: 'SNV', transcript: 'NM_000059.4',
    cHGVS: 'c.5946delT', pHGVS: 'p.S1982Rfs*22',
    consequence: 'Frameshift_deletion', affectedExon: '11/27',
    vaf: 0.51, depth: 280, zygosity: 'Heterozygous',
    acmgClassification: 'Pathogenic',
    acmgCriteria: ['PVS1', 'PM2', 'PP5'],
    diseaseAssociation: '遗传性乳腺癌-卵巢癌综合征',
    inheritanceMode: 'AD',
    rsId: 'rs80359550', clinvarId: 'VCV000051065',
    clinvarSignificance: 'Pathogenic', gnomadAF: 0.00001,
    reviewed: true, reported: false,
  },
  {
    id: 'germ-003',
    chr: '17', start: 7577538, end: 7577538, ref: 'C', alt: 'T',
    gene: 'TP53', type: 'SNV', transcript: 'NM_000546.6',
    cHGVS: 'c.743G>A', pHGVS: 'p.R248Q',
    consequence: 'Missense_substitution', affectedExon: '7/11',
    vaf: 0.49, depth: 350, zygosity: 'Heterozygous',
    acmgClassification: 'Pathogenic',
    acmgCriteria: ['PS1', 'PM1', 'PM2', 'PP3'],
    diseaseAssociation: 'Li-Fraumeni综合征',
    inheritanceMode: 'AD',
    rsId: 'rs28934576', clinvarId: 'VCV000012356',
    clinvarSignificance: 'Pathogenic', gnomadAF: 0.000008,
    reviewed: false, reported: false,
  },
  {
    id: 'germ-004',
    chr: '3', start: 37053568, end: 37053568, ref: 'A', alt: 'G',
    gene: 'MLH1', type: 'SNV', transcript: 'NM_000249.4',
    cHGVS: 'c.655A>G', pHGVS: 'p.I219V',
    consequence: 'Missense_substitution', affectedExon: '8/19',
    vaf: 0.52, depth: 290, zygosity: 'Heterozygous',
    acmgClassification: 'VUS',
    acmgCriteria: ['PM2', 'PP3'],
    diseaseAssociation: 'Lynch综合征',
    inheritanceMode: 'AD',
    gnomadAF: 0.0015,
    reviewed: false, reported: false,
  },
  {
    id: 'germ-005',
    chr: '2', start: 47702181, end: 47702181, ref: 'G', alt: 'A',
    gene: 'MSH2', type: 'SNV', transcript: 'NM_000251.3',
    cHGVS: 'c.942+3A>T', pHGVS: '-',
    consequence: 'Splice_Site_mutation', affectedExon: '5/16',
    vaf: 0.47, depth: 310, zygosity: 'Heterozygous',
    acmgClassification: 'Likely_Pathogenic',
    acmgCriteria: ['PVS1', 'PM2'],
    diseaseAssociation: 'Lynch综合征',
    inheritanceMode: 'AD',
    clinvarId: 'VCV000089953',
    clinvarSignificance: 'Likely pathogenic', gnomadAF: 0.00001,
    reviewed: false, reported: false,
  },
  {
    id: 'germ-006',
    chr: '10', start: 89692905, end: 89692905, ref: 'C', alt: 'T',
    gene: 'PTEN', type: 'SNV', transcript: 'NM_000314.8',
    cHGVS: 'c.388C>T', pHGVS: 'p.R130*',
    consequence: 'Nonsense_substitution', affectedExon: '5/9',
    vaf: 0.50, depth: 340, zygosity: 'Heterozygous',
    acmgClassification: 'Pathogenic',
    acmgCriteria: ['PVS1', 'PM2', 'PP5'],
    diseaseAssociation: 'Cowden综合征',
    inheritanceMode: 'AD',
    rsId: 'rs121909219', clinvarId: 'VCV000013318',
    clinvarSignificance: 'Pathogenic', gnomadAF: 0.000001,
    reviewed: false, reported: false,
  },
  {
    id: 'germ-007',
    chr: '11', start: 108175462, end: 108175462, ref: 'G', alt: 'A',
    gene: 'ATM', type: 'SNV', transcript: 'NM_000051.4',
    cHGVS: 'c.7271T>G', pHGVS: 'p.V2424G',
    consequence: 'Missense_substitution', affectedExon: '50/63',
    vaf: 0.48, depth: 260, zygosity: 'Heterozygous',
    acmgClassification: 'Likely_Pathogenic',
    acmgCriteria: ['PS1', 'PM2', 'PP3'],
    diseaseAssociation: '乳腺癌易感性',
    inheritanceMode: 'AD',
    rsId: 'rs28904921', clinvarId: 'VCV000128144',
    clinvarSignificance: 'Likely pathogenic', gnomadAF: 0.0001,
    reviewed: false, reported: false,
  },
  {
    id: 'germ-008',
    chr: '16', start: 23614872, end: 23614872, ref: 'T', alt: 'C',
    gene: 'PALB2', type: 'SNV', transcript: 'NM_024675.4',
    cHGVS: 'c.3113G>A', pHGVS: 'p.W1038*',
    consequence: 'Nonsense_substitution', affectedExon: '9/13',
    vaf: 0.46, depth: 300, zygosity: 'Heterozygous',
    acmgClassification: 'Pathogenic',
    acmgCriteria: ['PVS1', 'PM2', 'PP5'],
    diseaseAssociation: '乳腺癌/胰腺癌易感性',
    inheritanceMode: 'AD',
    rsId: 'rs180177102', clinvarId: 'VCV000128166',
    clinvarSignificance: 'Pathogenic', gnomadAF: 0.00002,
    reviewed: false, reported: false,
  },
];

async function getGermlineVariants(_taskId: string, filterState: TableFilterState): Promise<PaginatedResult<GermlineVariant>> {
  await new Promise(resolve => setTimeout(resolve, 300));
  let data = [...mockGermlineVariants];
  
  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    data = data.filter(item => 
      item.gene.toLowerCase().includes(query) || 
      item.pHGVS.toLowerCase().includes(query) ||
      item.cHGVS.toLowerCase().includes(query) ||
      item.diseaseAssociation.toLowerCase().includes(query)
    );
  }
  
  if (filterState.filters.acmgClassification) {
    data = data.filter(item => item.acmgClassification === filterState.filters.acmgClassification);
  }
  
  return { data, total: data.length, page: filterState.page, pageSize: filterState.pageSize };
}

export function GermlineTab({ 
  taskId, 
  filterState: externalFilterState, 
  onFilterChange 
}: GermlineTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<TableFilterState>(DEFAULT_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<GermlineVariant> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [geneLists, setGeneLists] = React.useState<GeneListOption[]>([]);
  const [reviewStatus, setReviewStatus] = React.useState<Record<string, { reviewed: boolean; reported: boolean }>>({});

  // IGV 查看器状态
  const [igvState, setIgvState] = React.useState<{
    isOpen: boolean;
    chromosome: string;
    position: number;
  }>({ isOpen: false, chromosome: '', position: 0 });

  const filterState = externalFilterState ?? internalFilterState;
  const setFilterState = onFilterChange ?? setInternalFilterState;

  const handleOpenIGV = React.useCallback((chromosome: string, position: number) => {
    setIgvState({ isOpen: true, chromosome, position });
  }, []);

  const handleCloseIGV = React.useCallback(() => {
    setIgvState(prev => ({ ...prev, isOpen: false }));
  }, []);

  React.useEffect(() => {
    async function loadGeneLists() {
      const lists = await getGeneLists();
      setGeneLists(lists);
    }
    loadGeneLists();
  }, []);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getGermlineVariants(taskId, filterState);
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

  const handleACMGFilter = React.useCallback((classification: string) => {
    const newFilters = { ...filterState.filters };
    if (classification) {
      newFilters.acmgClassification = classification;
    } else {
      delete newFilters.acmgClassification;
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

  const getReviewState = React.useCallback((variant: GermlineVariant) => {
    return reviewStatus[variant.id] ?? { reviewed: variant.reviewed, reported: variant.reported };
  }, [reviewStatus]);

  const getTypeVariant = (type: VariantType): 'info' | 'warning' | 'danger' | 'success' => {
    switch (type) {
      case 'SNV': return 'info';
      case 'Insertion': return 'success';
      case 'Deletion': return 'danger';
      case 'Complex': return 'warning';
      default: return 'info';
    }
  };

  const columns: Column<GermlineVariant>[] = [
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
    { id: 'chr', header: 'Chr', accessor: 'chr', width: 50 },
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
      accessor: (row) => row.type === 'Insertion' || row.end < 0 ? '-' : String(row.end),
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
    { id: 'gene', header: 'Gene', accessor: 'gene', width: 70 },
    {
      id: 'type',
      header: 'Type',
      accessor: (row) => <Tag variant={getTypeVariant(row.type)}>{row.type}</Tag>,
      width: 90,
    },
    { id: 'transcript', header: 'Transcript', accessor: 'transcript', width: 120 },
    { id: 'cHGVS', header: 'cHGVS', accessor: 'cHGVS', width: 140 },
    { id: 'pHGVS', header: 'pHGVS', accessor: 'pHGVS', width: 120 },
    {
      id: 'vaf',
      header: 'VAF%',
      accessor: (row) => `${(row.vaf * 100).toFixed(2)}`,
      width: 70,
    },
    { id: 'consequence', header: 'Consequence', accessor: 'consequence', width: 100 },
    { id: 'affectedExon', header: 'Affected_Exon', accessor: 'affectedExon', width: 100 },
    {
      id: 'acmgClassification',
      header: '临床意义',
      accessor: (row) => {
        const config = ACMG_CONFIG[row.acmgClassification];
        return <Tag variant={config.variant}>{config.label}</Tag>;
      },
      width: 90,
    },
    { id: 'diseaseAssociation', header: '疾病关联', accessor: 'diseaseAssociation', width: 150 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Input
              placeholder="搜索基因/突变/疾病..."
              value={filterState.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              leftElement={<Search className="w-4 h-4" />}
            />
          </div>
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
          <select
            value={(filterState.filters.acmgClassification as string) || ''}
            onChange={(e) => handleACMGFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border-default rounded-md bg-canvas-default text-fg-default"
          >
            <option value="">全部ACMG分类</option>
            {Object.entries(ACMG_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-fg-muted">
          共 {result?.total ?? 0} 个胚系变异
        </div>
      </div>

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
          暂无胚系变异数据
        </div>
      )}

      <IGVViewer
        chromosome={igvState.chromosome}
        position={igvState.position}
        isOpen={igvState.isOpen}
        onClose={handleCloseIGV}
      />
    </div>
  );
}
