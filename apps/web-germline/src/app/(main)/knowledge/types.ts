/**
 * 知识中心 - 历史检出位点汇总类型定义
 */

// ============ ACMG分类 ============
export type ACMGClassification =
  | 'Pathogenic'
  | 'Likely_Pathogenic'
  | 'VUS'
  | 'Likely_Benign'
  | 'Benign';

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

// ============ SNP/Indel分组位点 ============
export interface GroupedSNVIndel {
  groupId: string;
  gene: string;
  hgvsc: string;
  hgvsp: string;
  transcript: string;
  acmgClassification: ACMGClassification;
  consequence: string;
  rsId?: string;
  clinvarId?: string;
  gnomadAF?: number;
  detectionCount: number;
  firstDetectedAt: string;
  lastDetectedAt: string;
  records: DetectionRecord[];
}

// ============ CNV片段分组位点 ============
export interface GroupedCNVSegment {
  groupId: string;
  chromosome: string;
  startPosition: number;
  endPosition: number;
  length: number;
  type: 'Amplification' | 'Deletion';
  copyNumber: number;
  genes: string[];
  confidence: number;
  detectionCount: number;
  firstDetectedAt: string;
  lastDetectedAt: string;
  records: DetectionRecord[];
}

// ============ CNV外显子分组位点 ============
export interface GroupedCNVExon {
  groupId: string;
  gene: string;
  transcript: string;
  exon: string;
  chromosome: string;
  startPosition: number;
  endPosition: number;
  type: 'Amplification' | 'Deletion';
  copyNumber: number;
  ratio: number;
  confidence: number;
  detectionCount: number;
  firstDetectedAt: string;
  lastDetectedAt: string;
  records: DetectionRecord[];
}

// ============ STR分组位点 ============
export type STRStatus = 'Normal' | 'Premutation' | 'FullMutation';

export interface GroupedSTR {
  groupId: string;
  gene: string;
  transcript: string;
  locus: string;
  repeatUnit: string;
  normalRangeMin: number;
  normalRangeMax: number;
  status: STRStatus;
  minRepeatCount: number;        // 最小重复次数
  maxRepeatCount: number;        // 最大重复次数
  detectionCount: number;
  firstDetectedAt: string;
  lastDetectedAt: string;
  records: DetectionRecord[];
}

// ============ MEI分组位点 ============
export type MEIType = 'LINE1' | 'Alu' | 'SVA' | 'Unknown';

export interface GroupedMEI {
  groupId: string;
  chromosome: string;
  position: number;
  gene: string;
  meiType: MEIType;
  strand: '+' | '-';
  length: number;
  impact?: string;
  acmgClassification?: ACMGClassification;
  detectionCount: number;
  firstDetectedAt: string;
  lastDetectedAt: string;
  records: DetectionRecord[];
}

// ============ 线粒体变异分组位点 ============
export type MitochondrialPathogenicity =
  | 'Pathogenic'
  | 'Likely_Pathogenic'
  | 'VUS'
  | 'Likely_Benign'
  | 'Benign';

export interface GroupedMTVariant {
  groupId: string;
  position: number;
  ref: string;
  alt: string;
  gene: string;
  pathogenicity: MitochondrialPathogenicity;
  associatedDisease: string;
  haplogroup?: string;
  minHeteroplasmy: number;       // 最小异质性
  maxHeteroplasmy: number;       // 最大异质性
  detectionCount: number;
  firstDetectedAt: string;
  lastDetectedAt: string;
  records: DetectionRecord[];
}

// ============ UPD分组位点 ============
export type UPDType = 'Isodisomy' | 'Heterodisomy';
export type ParentOfOrigin = 'Maternal' | 'Paternal' | 'Unknown';

export interface GroupedUPDRegion {
  groupId: string;
  chromosome: string;
  startPosition: number;
  endPosition: number;
  length: number;
  type: UPDType;
  genes: string[];
  parentOfOrigin?: ParentOfOrigin;
  detectionCount: number;
  firstDetectedAt: string;
  lastDetectedAt: string;
  records: DetectionRecord[];
}

// ============ 标签页类型 ============
export type KnowledgeTabType =
  | 'snv-indel'
  | 'cnv-segment'
  | 'cnv-exon'
  | 'str'
  | 'mei'
  | 'mt'
  | 'upd';

export interface KnowledgeTabConfig {
  id: KnowledgeTabType;
  label: string;
}

export const KNOWLEDGE_TAB_CONFIGS: KnowledgeTabConfig[] = [
  { id: 'snv-indel', label: 'SNP/InDel' },
  { id: 'cnv-segment', label: 'CNV(Region)' },
  { id: 'cnv-exon', label: 'CNV(Exon)' },
  { id: 'str', label: '动态突变' },
  { id: 'mei', label: 'MEI' },
  { id: 'mt', label: '线粒体' },
  { id: 'upd', label: 'UPD' },
];

// ============ 表格筛选状态 ============
export interface KnowledgeTableFilterState {
  searchQuery: string;
  filters: Record<string, string | string[]>;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export const DEFAULT_KNOWLEDGE_FILTER_STATE: KnowledgeTableFilterState = {
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