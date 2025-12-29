'use client';

import * as React from 'react';
import { DataTable, Tag, Input } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search } from 'lucide-react';
import type { TableFilterState, PaginatedResult } from '../types';
import { DEFAULT_FILTER_STATE } from '../types';
import { ReviewCheckbox, ReportCheckbox, ReviewColumnHeader, ReportColumnHeader } from './ReviewCheckboxes';
import { IGVViewer, PositionLink } from './IGVViewer';

// 化疗药物代谢相关基因型
type GenotypeResult = 'Normal' | 'Intermediate' | 'Poor' | 'Rapid' | 'Unknown';

// 化疗位点检测结果
interface ChemotherapySite {
  id: string;
  // 基因组位置 (NCCL规范)
  chr: string;
  start: number;
  end: number;
  ref: string;
  alt: string;
  // 基因与转录本
  gene: string;
  transcript: string;
  cHGVS: string;
  pHGVS: string;
  // 基因型
  rsId: string;
  genotype: string;              // 如 "CC", "CT", "TT"
  genotypeResult: GenotypeResult;
  // 药物相关
  drug: string;                  // 相关药物
  drugCategory: string;          // 药物类别
  recommendation: string;        // 用药建议
  evidenceLevel: 'Level 1A' | 'Level 1B' | 'Level 2A' | 'Level 2B' | 'Level 3' | 'Level 4';
  // 检测信息
  vaf: number;
  depth: number;
  // 状态
  reviewed: boolean;
  reported: boolean;
}

interface ChemotherapyTabProps {
  taskId: string;
  filterState?: TableFilterState;
  onFilterChange?: (state: TableFilterState) => void;
}

// Mock数据 - 化疗药物代谢相关位点
const mockChemotherapySites: ChemotherapySite[] = [
  {
    id: 'chemo-001',
    chr: '10', start: 96541616, end: 96541616, ref: 'A', alt: 'G',
    gene: 'CYP2C19', transcript: 'NM_000769.4',
    cHGVS: 'c.681G>A', pHGVS: 'p.P227P',
    rsId: 'rs4244285', genotype: 'GA', genotypeResult: 'Intermediate',
    drug: '氯吡格雷', drugCategory: '抗血小板药物',
    recommendation: '中间代谢型，建议考虑替代药物或增加剂量',
    evidenceLevel: 'Level 1A',
    vaf: 0.48, depth: 1200,
    reviewed: true, reported: true,
  },
  {
    id: 'chemo-002',
    chr: '10', start: 96522463, end: 96522463, ref: 'G', alt: 'A',
    gene: 'CYP2C19', transcript: 'NM_000769.4',
    cHGVS: 'c.636G>A', pHGVS: 'p.W212*',
    rsId: 'rs4986893', genotype: 'GG', genotypeResult: 'Normal',
    drug: '奥美拉唑', drugCategory: '质子泵抑制剂',
    recommendation: '正常代谢型，标准剂量',
    evidenceLevel: 'Level 1A',
    vaf: 0.0, depth: 1150,
    reviewed: false, reported: false,
  },
  {
    id: 'chemo-003',
    chr: '19', start: 15990431, end: 15990431, ref: 'C', alt: 'T',
    gene: 'CYP2B6', transcript: 'NM_000767.5',
    cHGVS: 'c.516G>T', pHGVS: 'p.Q172H',
    rsId: 'rs3745274', genotype: 'CT', genotypeResult: 'Intermediate',
    drug: '环磷酰胺', drugCategory: '烷化剂',
    recommendation: '中间代谢型，监测药物浓度',
    evidenceLevel: 'Level 2A',
    vaf: 0.52, depth: 980,
    reviewed: false, reported: false,
  },
  {
    id: 'chemo-004',
    chr: '1', start: 97915614, end: 97915614, ref: 'C', alt: 'T',
    gene: 'DPYD', transcript: 'NM_000110.4',
    cHGVS: 'c.1905+1G>A', pHGVS: '-',
    rsId: 'rs3918290', genotype: 'CC', genotypeResult: 'Normal',
    drug: '5-氟尿嘧啶', drugCategory: '抗代谢药',
    recommendation: '正常代谢型，标准剂量',
    evidenceLevel: 'Level 1A',
    vaf: 0.0, depth: 1350,
    reviewed: false, reported: false,
  },
  {
    id: 'chemo-005',
    chr: '1', start: 97981343, end: 97981343, ref: 'T', alt: 'C',
    gene: 'DPYD', transcript: 'NM_000110.4',
    cHGVS: 'c.2846A>T', pHGVS: 'p.D949V',
    rsId: 'rs67376798', genotype: 'TT', genotypeResult: 'Normal',
    drug: '卡培他滨', drugCategory: '抗代谢药',
    recommendation: '正常代谢型，标准剂量',
    evidenceLevel: 'Level 1A',
    vaf: 0.0, depth: 1280,
    reviewed: false, reported: false,
  },
  {
    id: 'chemo-006',
    chr: '6', start: 18130918, end: 18130918, ref: 'T', alt: 'C',
    gene: 'TPMT', transcript: 'NM_000367.5',
    cHGVS: 'c.460G>A', pHGVS: 'p.A154T',
    rsId: 'rs1800460', genotype: 'TC', genotypeResult: 'Intermediate',
    drug: '6-巯基嘌呤', drugCategory: '抗代谢药',
    recommendation: '中间代谢型，建议减量50%',
    evidenceLevel: 'Level 1A',
    vaf: 0.51, depth: 1100,
    reviewed: true, reported: false,
  },
  {
    id: 'chemo-007',
    chr: '7', start: 99361466, end: 99361466, ref: 'G', alt: 'A',
    gene: 'CYP3A5', transcript: 'NM_000777.5',
    cHGVS: 'c.6986A>G', pHGVS: '-',
    rsId: 'rs776746', genotype: 'AA', genotypeResult: 'Poor',
    drug: '他克莫司', drugCategory: '免疫抑制剂',
    recommendation: '慢代谢型，建议减量',
    evidenceLevel: 'Level 1A',
    vaf: 1.0, depth: 1050,
    reviewed: false, reported: false,
  },
  {
    id: 'chemo-008',
    chr: '12', start: 21178615, end: 21178615, ref: 'T', alt: 'C',
    gene: 'SLCO1B1', transcript: 'NM_006446.5',
    cHGVS: 'c.521T>C', pHGVS: 'p.V174A',
    rsId: 'rs4149056', genotype: 'TC', genotypeResult: 'Intermediate',
    drug: '辛伐他汀', drugCategory: '他汀类',
    recommendation: '中间风险，建议使用低剂量或替代药物',
    evidenceLevel: 'Level 1A',
    vaf: 0.49, depth: 1180,
    reviewed: false, reported: false,
  },
];

async function getChemotherapySites(_taskId: string, filterState: TableFilterState): Promise<PaginatedResult<ChemotherapySite>> {
  await new Promise(resolve => setTimeout(resolve, 300));
  let data = [...mockChemotherapySites];
  
  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    data = data.filter(item => 
      item.gene.toLowerCase().includes(query) || 
      item.drug.toLowerCase().includes(query) ||
      item.rsId.toLowerCase().includes(query)
    );
  }
  
  if (filterState.filters.genotypeResult) {
    data = data.filter(item => item.genotypeResult === filterState.filters.genotypeResult);
  }
  
  return { data, total: data.length, page: filterState.page, pageSize: filterState.pageSize };
}

export function ChemotherapyTab({ 
  taskId, 
  filterState: externalFilterState, 
  onFilterChange 
}: ChemotherapyTabProps) {
  const [internalFilterState, setInternalFilterState] = React.useState<TableFilterState>(DEFAULT_FILTER_STATE);
  const [result, setResult] = React.useState<PaginatedResult<ChemotherapySite> | null>(null);
  const [loading, setLoading] = React.useState(true);
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
    async function loadData() {
      setLoading(true);
      const data = await getChemotherapySites(taskId, filterState);
      setResult(data);
      setLoading(false);
    }
    loadData();
  }, [taskId, filterState]);

  const handleSearch = React.useCallback((query: string) => {
    setFilterState({ ...filterState, searchQuery: query, page: 1 });
  }, [filterState, setFilterState]);

  const handleGenotypeFilter = React.useCallback((result: string) => {
    const newFilters = { ...filterState.filters };
    if (result) {
      newFilters.genotypeResult = result;
    } else {
      delete newFilters.genotypeResult;
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

  const getReviewState = React.useCallback((site: ChemotherapySite) => {
    return reviewStatus[site.id] ?? { reviewed: site.reviewed, reported: site.reported };
  }, [reviewStatus]);

  const getGenotypeVariant = (result: GenotypeResult): 'success' | 'warning' | 'danger' | 'info' => {
    switch (result) {
      case 'Normal': return 'success';
      case 'Intermediate': return 'warning';
      case 'Poor': return 'danger';
      case 'Rapid': return 'info';
      default: return 'info';
    }
  };

  const getGenotypeLabel = (result: GenotypeResult): string => {
    switch (result) {
      case 'Normal': return '正常代谢';
      case 'Intermediate': return '中间代谢';
      case 'Poor': return '慢代谢';
      case 'Rapid': return '快代谢';
      default: return '未知';
    }
  };

  const columns: Column<ChemotherapySite>[] = [
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
    { id: 'gene', header: 'Gene', accessor: 'gene', width: 80 },
    { id: 'rsId', header: 'rsID', accessor: 'rsId', width: 100 },
    {
      id: 'start',
      header: 'Position',
      accessor: (row) => (
        <PositionLink
          chromosome={`chr${row.chr}`}
          position={row.start}
          label={`${row.chr}:${row.start}`}
          onClick={handleOpenIGV}
        />
      ),
      width: 120,
    },
    { id: 'genotype', header: 'Genotype', accessor: 'genotype', width: 80 },
    {
      id: 'genotypeResult',
      header: '代谢类型',
      accessor: (row) => (
        <Tag variant={getGenotypeVariant(row.genotypeResult)}>
          {getGenotypeLabel(row.genotypeResult)}
        </Tag>
      ),
      width: 100,
    },
    { id: 'drug', header: '相关药物', accessor: 'drug', width: 100 },
    { id: 'drugCategory', header: '药物类别', accessor: 'drugCategory', width: 100 },
    {
      id: 'evidenceLevel',
      header: '证据等级',
      accessor: (row) => (
        <Tag variant={row.evidenceLevel.includes('1') ? 'danger' : row.evidenceLevel.includes('2') ? 'warning' : 'info'}>
          {row.evidenceLevel}
        </Tag>
      ),
      width: 90,
    },
    { id: 'recommendation', header: '用药建议', accessor: 'recommendation', width: 200 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Input
              placeholder="搜索基因/药物/rsID..."
              value={filterState.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              leftElement={<Search className="w-4 h-4" />}
            />
          </div>
          <select
            value={(filterState.filters.genotypeResult as string) || ''}
            onChange={(e) => handleGenotypeFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border-default rounded-md bg-canvas-default text-fg-default"
          >
            <option value="">全部代谢类型</option>
            <option value="Normal">正常代谢</option>
            <option value="Intermediate">中间代谢</option>
            <option value="Poor">慢代谢</option>
            <option value="Rapid">快代谢</option>
          </select>
        </div>
        <div className="text-sm text-fg-muted">
          共 {result?.total ?? 0} 个化疗位点
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
          暂无化疗位点数据
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
