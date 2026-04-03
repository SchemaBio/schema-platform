/**
 * 历史检出 - 类型定义
 */

// ============ Tier分类 ============
export type TierClassification = 'Tier I' | 'Tier II' | 'Tier III' | 'Tier IV' | 'Unknown';

// ============ 通用检出记录 ============
export interface DetectionRecord {
  recordId: string;              // 记录唯一ID
  taskId: string;                // 任务UUID
  taskName: string;              // 任务名称
  pipeline: string;              // 流程名称
  pipelineVersion: string;       // 流程版本
  sampleId: string;              // 样本UUID
  internalId: string;            // 内部编号
  reviewedAt: string;            // 审核时间
  reviewedBy: string;            // 审核人
}

// ============ SNV/InDel分组位点 ============
export interface GroupedSNVIndel {
  groupId: string;
  gene: string;
  hgvsc: string;
  hgvsp: string;
  transcript: string;
  clinicalSignificance: TierClassification;
  consequence: string;
  alleleFrequency: number;
  rsId?: string;
  clinvarId?: string;
  gnomadAF?: number;
  detectionCount: number;
  firstDetectedAt: string;
  lastDetectedAt: string;
  records: DetectionRecord[];
}

// ============ Hotspot分组位点 ============
export interface GroupedHotspot {
  groupId: string;
  gene: string;
  mutation: string;              // 突变描述（如 L858R, 19-del）
  transcript: string;
  clinicalSignificance: TierClassification;
  alleleFrequency: number;
  detectionCount: number;
  firstDetectedAt: string;
  lastDetectedAt: string;
  records: DetectionRecord[];
}

// ============ CNV Gene分组位点 ============
export interface GroupedCNVGene {
  groupId: string;
  gene: string;
  type: 'Amplification' | 'Deletion';
  copyNumber: number;
  confidence: number;
  detectionCount: number;
  firstDetectedAt: string;
  lastDetectedAt: string;
  records: DetectionRecord[];
}

// ============ CNV Exon分组位点 ============
export interface GroupedCNVExon {
  groupId: string;
  gene: string;
  transcript: string;
  exon: string;
  type: 'Amplification' | 'Deletion';
  copyNumber: number;
  ratio: number;
  confidence: number;
  detectionCount: number;
  firstDetectedAt: string;
  lastDetectedAt: string;
  records: DetectionRecord[];
}

// ============ CNV Chromosome分组位点 ============
export interface GroupedCNVChrom {
  groupId: string;
  chromosome: string;
  startPosition: number;
  endPosition: number;
  length: number;
  type: 'Amplification' | 'Deletion';
  genes: string[];
  confidence: number;
  detectionCount: number;
  firstDetectedAt: string;
  lastDetectedAt: string;
  records: DetectionRecord[];
}

// ============ Fusion分组位点 ============
export interface GroupedFusion {
  groupId: string;
  geneA: string;                 // 5'端基因
  geneB: string;                 // 3'端基因
  fusionTranscript: string;      // 融合转录本
  clinicalSignificance: TierClassification;
  supportingReads: number;
  detectionCount: number;
  firstDetectedAt: string;
  lastDetectedAt: string;
  records: DetectionRecord[];
}

// ============ 标签页类型 ============
export type HistoryTabType =
  | 'snv-indel'
  | 'hotspot'
  | 'cnv-gene'
  | 'cnv-exon'
  | 'cnv-chrom'
  | 'fusion';

export interface HistoryTabConfig {
  id: HistoryTabType;
  label: string;
}

export const HISTORY_TAB_CONFIGS: HistoryTabConfig[] = [
  { id: 'snv-indel', label: 'SNV/InDel' },
  { id: 'hotspot', label: 'Hotspot' },
  { id: 'cnv-gene', label: 'CNV(Gene)' },
  { id: 'cnv-exon', label: 'CNV(Exon)' },
  { id: 'cnv-chrom', label: 'CNV(Chrom)' },
  { id: 'fusion', label: 'Fusion' },
];

// ============ 表格筛选状态 ============
export interface HistoryTableFilterState {
  searchQuery: string;
  filters: Record<string, string | string[]>;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export const DEFAULT_HISTORY_FILTER_STATE: HistoryTableFilterState = {
  searchQuery: '',
  filters: {},
  page: 1,
  pageSize: 20,
};

// ============ 分页结果 ============
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}