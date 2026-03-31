/**
 * 知识中心 - 历史检出位点汇总类型定义
 */

// ============ 来源信息接口 ============
export interface VariantSourceInfo {
  taskId: string;              // 任务UUID
  taskName: string;            // 任务名称
  pipeline: string;            // 流程名称
  pipelineVersion: string;     // 流程版本
  sampleId: string;            // 样本UUID
  internalId: string;          // 内部编号
  reviewedAt: string;          // 审核时间
  reviewedBy: string;          // 审核人
}

// ============ 历史检出位点基础接口 ============
export interface HistoryVariantBase extends VariantSourceInfo {
  historyId: string;           // 历史记录唯一ID
  firstDetectedAt: string;     // 首次检出时间
  lastDetectedAt: string;      // 最后检出时间
  detectionCount: number;      // 检出次数
}

// ============ ACMG分类 ============
export type ACMGClassification =
  | 'Pathogenic'
  | 'Likely_Pathogenic'
  | 'VUS'
  | 'Likely_Benign'
  | 'Benign';

// ============ SNV/Indel单次检出记录 ============
export interface SNVIndelDetectionRecord {
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

// ============ SNV/Indel分组位点（按基因-HGVSc-HGVSp去重） ============
export interface GroupedSNVIndel {
  groupId: string;               // 分组唯一ID（基因-HGVSc-HGVSp）
  gene: string;                  // 基因名
  hgvsc: string;                 // cDNA变化
  hgvsp: string;                 // 蛋白质变化
  transcript: string;            // 转录本
  acmgClassification: ACMGClassification;
  consequence: string;           // 变异后果
  rsId?: string;                 // dbSNP ID
  clinvarId?: string;            // ClinVar ID
  gnomadAF?: number;             // gnomAD 人群频率
  detectionCount: number;        // 总检出次数
  firstDetectedAt: string;       // 首次检出时间
  lastDetectedAt: string;        // 最后检出时间
  records: SNVIndelDetectionRecord[];  // 检出记录列表
}

// ============ CNV历史检出位点(片段级别) ============
export interface HistoryCNVSegment extends HistoryVariantBase {
  chromosome: string;
  startPosition: number;
  endPosition: number;
  length: number;
  type: 'Amplification' | 'Deletion';
  copyNumber: number;
  genes: string[];
  confidence: number;
}

// ============ CNV历史检出位点(外显子级别) ============
export interface HistoryCNVExon extends HistoryVariantBase {
  gene: string;
  transcript: string;            // 转录本
  exon: string;
  chromosome: string;
  startPosition: number;
  endPosition: number;
  type: 'Amplification' | 'Deletion';
  copyNumber: number;
  ratio: number;
  confidence: number;
}

// ============ 动态突变（STR）历史检出位点 ============
export type STRStatus = 'Normal' | 'Premutation' | 'FullMutation';

export interface HistorySTR extends HistoryVariantBase {
  gene: string;
  transcript: string;            // 转录本
  locus: string;                 // 位点名称
  repeatUnit: string;            // 重复单元
  repeatCount: number;           // 重复次数
  normalRangeMin: number;        // 正常范围下限
  normalRangeMax: number;        // 正常范围上限
  status: STRStatus;
}

// ============ MEI (移动元件插入) 历史检出位点 ============
export type MEIType = 'LINE1' | 'Alu' | 'SVA' | 'Unknown';
export type MEIInsertionType = 'insertion' | 'deletion' | 'complex';

export interface HistoryMEI extends HistoryVariantBase {
  chromosome: string;            // 染色体
  position: number;              // 插入位置
  meiType: MEIType;              // MEI类型
  insertionType: MEIInsertionType; // 插入类型
  strand: '+' | '-';             // 链方向
  length: number;                // 插入长度
  gene: string;                  // 所在基因
  transcript?: string;           // 转录本
  impact?: string;               // 影响
  zygosity: 'Heterozygous' | 'Homozygous' | 'Hemizygous';
  supportingReads: number;       // 支持读数
  totalReads: number;            // 总读数
  frequency?: number;            // 人群频率
  acmgClassification?: ACMGClassification;
}

// ============ 线粒体变异历史检出位点 ============
export type MitochondrialPathogenicity =
  | 'Pathogenic'
  | 'Likely_Pathogenic'
  | 'VUS'
  | 'Likely_Benign'
  | 'Benign';

export interface HistoryMTVariant extends HistoryVariantBase {
  position: number;
  ref: string;
  alt: string;
  gene: string;
  heteroplasmy: number;          // 异质性比例 (0-1)
  pathogenicity: MitochondrialPathogenicity;
  associatedDisease: string;     // 关联疾病
  haplogroup?: string;           // 单倍群
}

// ============ UPD区域历史检出位点 ============
export type UPDType = 'Isodisomy' | 'Heterodisomy';
export type ParentOfOrigin = 'Maternal' | 'Paternal' | 'Unknown';

export interface HistoryUPDRegion extends HistoryVariantBase {
  chromosome: string;
  startPosition: number;
  endPosition: number;
  length: number;
  type: UPDType;
  genes: string[];               // 涉及基因
  parentOfOrigin?: ParentOfOrigin;
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