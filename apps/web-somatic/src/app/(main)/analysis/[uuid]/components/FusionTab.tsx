'use client';

import * as React from 'react';
import { DataTable, Tag, Input } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, X, ExternalLink, Dna, FileText, Database, Activity } from 'lucide-react';
import type { TableFilterState, PaginatedResult } from '../types';
import { DEFAULT_FILTER_STATE } from '../types';
import { ReviewCheckbox, ReportCheckbox, ReviewColumnHeader, ReportColumnHeader } from './ReviewCheckboxes';
import { IGVViewer, PositionLink } from './IGVViewer';

// 基因融合类型 (DNA检测)
interface Fusion {
  id: string;
  gene5: string;
  gene3: string;
  transcript5: string;
  transcript3: string;
  fusionType: 'Inversion' | 'Translocation';
  // 断裂点信息
  breakpoint5: string;
  breakpoint3: string;
  breakRegion5: string; // 实际断裂区域 (如 Intron 13)
  breakRegion3: string;
  affectedExon5: string; // 预计受影响外显子
  affectedExon3: string;
  // 测序质量
  vaf: number;
  depth: number;
  altReads: number;
  splitReads: number;
  spanningReads: number;
  // 临床意义
  clinicalSignificance: 'Tier I' | 'Tier II' | 'Tier III' | 'Unknown';
  relatedCancers: string[];
  targetedDrugs: string[];
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
  { 
    id: '1', 
    gene5: 'EML4', gene3: 'ALK', 
    transcript5: 'NM_019063.4', transcript3: 'NM_004304.5',
    fusionType: 'Inversion',
    breakpoint5: 'chr2:42472827', breakpoint3: 'chr2:29446394', 
    breakRegion5: 'Intron 13', breakRegion3: 'Intron 19',
    affectedExon5: 'Exon 13', affectedExon3: 'Exon 20',
    vaf: 0.15, depth: 850, altReads: 128,
    splitReads: 89, spanningReads: 39, 
    clinicalSignificance: 'Tier I',
    relatedCancers: ['非小细胞肺癌'],
    targetedDrugs: ['克唑替尼', '阿来替尼', '布格替尼'],
    reviewed: true, reported: true 
  },
  { 
    id: '2', 
    gene5: 'TMPRSS2', gene3: 'ERG', 
    transcript5: 'NM_005656.4', transcript3: 'NM_004449.5',
    fusionType: 'Translocation',
    breakpoint5: 'chr21:41498119', breakpoint3: 'chr21:38445621', 
    breakRegion5: 'Intron 1', breakRegion3: 'Intron 3',
    affectedExon5: 'Exon 1', affectedExon3: 'Exon 4',
    vaf: 0.22, depth: 920, altReads: 202,
    splitReads: 145, spanningReads: 57, 
    clinicalSignificance: 'Tier I',
    relatedCancers: ['前列腺癌'],
    targetedDrugs: [],
    reviewed: true, reported: false 
  },
  { 
    id: '3', 
    gene5: 'BCR', gene3: 'ABL1', 
    transcript5: 'NM_004327.4', transcript3: 'NM_007313.3',
    fusionType: 'Translocation',
    breakpoint5: 'chr22:23632600', breakpoint3: 'chr9:130854064', 
    breakRegion5: 'Intron 13', breakRegion3: 'Intron 1',
    affectedExon5: 'Exon 13', affectedExon3: 'Exon 2',
    vaf: 0.35, depth: 780, altReads: 273,
    splitReads: 198, spanningReads: 75, 
    clinicalSignificance: 'Tier I',
    relatedCancers: ['慢性粒细胞白血病', '急性淋巴细胞白血病'],
    targetedDrugs: ['伊马替尼', '达沙替尼', '尼洛替尼'],
    reviewed: false, reported: false 
  },
  { 
    id: '4', 
    gene5: 'KIF5B', gene3: 'RET', 
    transcript5: 'NM_004521.3', transcript3: 'NM_020975.6',
    fusionType: 'Inversion',
    breakpoint5: 'chr10:32306071', breakpoint3: 'chr10:43612032', 
    breakRegion5: 'Intron 15', breakRegion3: 'Intron 11',
    affectedExon5: 'Exon 15', affectedExon3: 'Exon 12',
    vaf: 0.08, depth: 650, altReads: 52,
    splitReads: 45, spanningReads: 7, 
    clinicalSignificance: 'Tier II',
    relatedCancers: ['非小细胞肺癌', '甲状腺癌'],
    targetedDrugs: ['塞尔帕替尼', '普拉替尼'],
    reviewed: false, reported: false 
  },
  { 
    id: '5', 
    gene5: 'CD74', gene3: 'ROS1', 
    transcript5: 'NM_004355.3', transcript3: 'NM_002944.2',
    fusionType: 'Translocation',
    breakpoint5: 'chr5:149784243', breakpoint3: 'chr6:117645578', 
    breakRegion5: 'Intron 6', breakRegion3: 'Intron 33',
    affectedExon5: 'Exon 6', affectedExon3: 'Exon 34',
    vaf: 0.12, depth: 720, altReads: 86,
    splitReads: 56, spanningReads: 30, 
    clinicalSignificance: 'Tier I',
    relatedCancers: ['非小细胞肺癌'],
    targetedDrugs: ['克唑替尼', '恩曲替尼'],
    reviewed: false, reported: false 
  },
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

  // 详情面板状态
  const [selectedFusion, setSelectedFusion] = React.useState<Fusion | null>(null);
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
  const handleRowClick = React.useCallback((fusion: Fusion) => {
    setSelectedFusion(fusion);
    setDetailPanelOpen(true);
  }, []);

  // 关闭详情面板
  const handleCloseDetailPanel = React.useCallback(() => {
    setDetailPanelOpen(false);
  }, []);

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
      width: 50,
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
      width: 50,
    },
    {
      id: 'fusionType',
      header: '融合类型',
      accessor: (row) => (
        <Tag variant={row.fusionType === 'Inversion' ? 'info' : 'warning'}>
          {row.fusionType}
        </Tag>
      ),
      width: 100,
    },
    {
      id: 'gene5',
      header: "5'基因",
      accessor: (row) => <span className="font-medium">{row.gene5}</span>,
      width: 80,
    },
    {
      id: 'gene3',
      header: "3'基因",
      accessor: (row) => <span className="font-medium">{row.gene3}</span>,
      width: 80,
    },
    {
      id: 'transcript5',
      header: "5'转录本",
      accessor: (row) => <span className="font-mono text-xs">{row.transcript5}</span>,
      width: 120,
    },
    {
      id: 'transcript3',
      header: "3'转录本",
      accessor: (row) => <span className="font-mono text-xs">{row.transcript3}</span>,
      width: 120,
    },
    {
      id: 'breakpoint5',
      header: "5'断点坐标",
      accessor: (row) => {
        const match = row.breakpoint5.match(/^(chr\w+):(\d+)$/);
        if (match) {
          return <PositionLink chromosome={match[1]} position={parseInt(match[2], 10)} onClick={handleOpenIGV} />;
        }
        return <span className="font-mono text-xs">{row.breakpoint5}</span>;
      },
      width: 130,
    },
    {
      id: 'breakpoint3',
      header: "3'断点坐标",
      accessor: (row) => {
        const match = row.breakpoint3.match(/^(chr\w+):(\d+)$/);
        if (match) {
          return <PositionLink chromosome={match[1]} position={parseInt(match[2], 10)} onClick={handleOpenIGV} />;
        }
        return <span className="font-mono text-xs">{row.breakpoint3}</span>;
      },
      width: 130,
    },
    {
      id: 'breakRegion5',
      header: "5'断裂区域",
      accessor: (row) => <span className="text-xs">{row.breakRegion5}</span>,
      width: 90,
    },
    {
      id: 'breakRegion3',
      header: "3'断裂区域",
      accessor: (row) => <span className="text-xs">{row.breakRegion3}</span>,
      width: 90,
    },
    {
      id: 'affectedExon5',
      header: "5'受影响外显子",
      accessor: (row) => <span className="text-xs">{row.affectedExon5}</span>,
      width: 110,
    },
    {
      id: 'affectedExon3',
      header: "3'受影响外显子",
      accessor: (row) => <span className="text-xs">{row.affectedExon3}</span>,
      width: 110,
    },
    {
      id: 'vaf',
      header: 'VAF%',
      accessor: (row) => `${(row.vaf * 100).toFixed(2)}`,
      width: 65,
    },
    {
      id: 'depth',
      header: 'Depth',
      accessor: (row) => row.depth,
      width: 65,
      sortable: true,
    },
    {
      id: 'altReads',
      header: 'Alt',
      accessor: (row) => row.altReads,
      width: 55,
    },
    {
      id: 'clinicalSignificance',
      header: 'Tier',
      accessor: (row) => (
        <Tag variant={getTierVariant(row.clinicalSignificance)}>
          {row.clinicalSignificance}
        </Tag>
      ),
      width: 75,
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
          onRowClick={handleRowClick}
        />
      ) : (
        <div className="text-center py-12 text-fg-muted">
          暂无融合基因数据
        </div>
      )}

      {/* 融合详情面板 */}
      <FusionDetailPanel
        fusion={selectedFusion}
        isOpen={detailPanelOpen}
        onClose={handleCloseDetailPanel}
      />

      {/* IGV 查看器 */}
      <IGVViewer
        isOpen={igvState.isOpen}
        chromosome={igvState.chromosome}
        position={igvState.position}
        onClose={handleCloseIGV}
      />
    </div>
  );
}

// 信息项组件
function InfoItem({ label, value, link, mono }: { label: string; value?: React.ReactNode; link?: string; mono?: boolean }) {
  if (value === undefined || value === null || value === '' || value === '-') {
    return (
      <div className="flex justify-between py-1.5 border-b border-border-subtle last:border-0">
        <span className="text-fg-muted text-xs">{label}</span>
        <span className="text-fg-subtle text-xs">-</span>
      </div>
    );
  }
  return (
    <div className="flex justify-between py-1.5 border-b border-border-subtle last:border-0 gap-2">
      <span className="text-fg-muted text-xs shrink-0">{label}</span>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-accent-fg text-xs hover:underline flex items-center gap-1 text-right">
          {value}<ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      ) : (
        <span className={`text-fg-default text-xs text-right break-all ${mono ? 'font-mono' : ''}`}>{value}</span>
      )}
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2 mt-4 first:mt-0">
      <Icon className="w-3.5 h-3.5 text-fg-muted" />
      <h4 className="text-xs font-medium text-fg-default">{title}</h4>
    </div>
  );
}

interface FusionDetailPanelProps {
  fusion: Fusion | null;
  isOpen: boolean;
  onClose: () => void;
}

function FusionDetailPanel({ fusion, isOpen, onClose }: FusionDetailPanelProps) {
  if (!isOpen || !fusion) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      
      <div className="fixed right-0 top-0 h-full w-[450px] bg-white dark:bg-[#0d1117] border-l border-border shadow-xl z-50 flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-canvas-subtle">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-fg-default">{fusion.gene5}::{fusion.gene3}</span>
            <Tag variant={fusion.fusionType === 'Inversion' ? 'info' : 'warning'}>
              {fusion.fusionType}
            </Tag>
          </div>
          <button onClick={onClose} className="p-1 text-fg-muted hover:text-fg-default rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* 融合信息 */}
          <SectionTitle icon={Dna} title="融合信息" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="5'基因" value={fusion.gene5} />
            <InfoItem label="5'转录本" value={fusion.transcript5} mono />
            <InfoItem label="3'基因" value={fusion.gene3} />
            <InfoItem label="3'转录本" value={fusion.transcript3} mono />
            <InfoItem label="融合类型" value={
              <Tag variant={fusion.fusionType === 'Inversion' ? 'info' : 'warning'}>
                {fusion.fusionType}
              </Tag>
            } />
          </div>

          {/* 断裂点信息 */}
          <SectionTitle icon={Activity} title="断裂点信息" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="5'断点" value={fusion.breakpoint5} mono />
            <InfoItem label="5'断裂区域" value={fusion.breakRegion5} />
            <InfoItem label="5'受影响外显子" value={fusion.affectedExon5} />
            <InfoItem label="3'断点" value={fusion.breakpoint3} mono />
            <InfoItem label="3'断裂区域" value={fusion.breakRegion3} />
            <InfoItem label="3'受影响外显子" value={fusion.affectedExon3} />
          </div>

          {/* 测序质量 */}
          <SectionTitle icon={FileText} title="测序质量" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="VAF" value={`${(fusion.vaf * 100).toFixed(2)}%`} />
            <InfoItem label="Depth" value={`${fusion.depth}X`} />
            <InfoItem label="Alt Reads" value={fusion.altReads.toString()} />
            <InfoItem label="Split Reads" value={fusion.splitReads.toString()} />
            <InfoItem label="Spanning Reads" value={fusion.spanningReads.toString()} />
          </div>

          {/* 临床意义 */}
          <SectionTitle icon={FileText} title="临床意义" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem label="Tier分类" value={
              <Tag variant={fusion.clinicalSignificance === 'Tier I' ? 'danger' : fusion.clinicalSignificance === 'Tier II' ? 'warning' : 'info'}>
                {fusion.clinicalSignificance}
              </Tag>
            } />
          </div>

          {/* 相关癌种 */}
          <SectionTitle icon={FileText} title="相关癌种" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            {fusion.relatedCancers.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {fusion.relatedCancers.map((cancer, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs bg-canvas-inset rounded">{cancer}</span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-fg-muted">暂无相关癌种信息</span>
            )}
          </div>

          {/* 靶向药物 */}
          <SectionTitle icon={FileText} title="靶向药物" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            {fusion.targetedDrugs.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {fusion.targetedDrugs.map((drug, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs bg-success-subtle text-success-fg rounded">{drug}</span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-fg-muted">暂无靶向药物信息</span>
            )}
          </div>

          {/* 外部数据库 */}
          <SectionTitle icon={Database} title="外部数据库" />
          <div className="bg-canvas-subtle rounded-md p-2.5">
            <InfoItem 
              label="OncoKB" 
              value="查看"
              link={`https://www.oncokb.org/gene/${fusion.gene5}/${fusion.gene5}-${fusion.gene3}%20Fusion`}
            />
            <InfoItem 
              label="COSMIC" 
              value="查看"
              link={`https://cancer.sanger.ac.uk/cosmic/fusion/summary?fid=${fusion.gene5}_${fusion.gene3}`}
            />
          </div>
        </div>

        {/* 底部 */}
        <div className="border-t border-border p-3 bg-canvas-subtle">
          <button onClick={onClose} className="w-full px-3 py-1.5 text-xs border border-border rounded-md hover:bg-canvas-inset">
            关闭
          </button>
        </div>
      </div>
    </>
  );
}
