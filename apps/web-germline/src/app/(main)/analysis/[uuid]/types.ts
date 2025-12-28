/**
 * 分析结果详情页类型定义
 */

// ============ 任务状态 ============
export type AnalysisStatus = 'queued' | 'running' | 'completed' | 'failed' | 'pending_interpretation';

// ============ 分析任务详情 ============
export interface AnalysisTaskDetail {
  id: string;                    // UUID
  name: string;                  // 任务名称
  sampleId: string;              // 样本ID
  sampleName: string;            // 样本名称（患者姓名脱敏）
  pipeline: string;              // 分析流程名称
  pipelineVersion: string;       // 流程版本
  status: AnalysisStatus;        // 任务状态
  createdAt: string;             // 创建时间
  createdBy: string;             // 创建者
  completedAt?: string;          // 完成时间
}

// ============ 质控结果 ============
export interface QCResult {
  totalReads: number;            // 总读数
  mappedReads: number;           // 比对读数
  mappingRate: number;           // 比对率 (0-1)
  averageDepth: number;          // 平均覆盖深度
  targetCoverage: number;        // 目标区域覆盖率 (0-1)
  duplicateRate: number;         // 重复率 (0-1)
  q30Rate: number;               // Q30比例 (0-1)
  insertSize: number;            // 插入片段大小
}

export type QCMetricKey = keyof QCResult;

export interface QCThreshold {
  metric: QCMetricKey;
  warningMin?: number;
  warningMax?: number;
  errorMin?: number;
  errorMax?: number;
}

export type QCStatus = 'success' | 'warning' | 'danger';

// ============ ACMG分类 ============
export type ACMGClassification = 
  | 'Pathogenic' 
  | 'Likely_Pathogenic' 
  | 'VUS' 
  | 'Likely_Benign' 
  | 'Benign';

// ============ SNV/Indel变异 ============
export interface SNVIndel {
  id: string;
  gene: string;                  // 基因名
  chromosome: string;            // 染色体
  position: number;              // 位置
  ref: string;                   // 参考碱基
  alt: string;                   // 变异碱基
  variantType: 'SNV' | 'Insertion' | 'Deletion';
  zygosity: 'Heterozygous' | 'Homozygous' | 'Hemizygous';
  alleleFrequency: number;       // 等位基因频率
  depth: number;                 // 覆盖深度
  acmgClassification: ACMGClassification;
  transcript: string;            // 转录本
  hgvsc: string;                 // cDNA变化
  hgvsp: string;                 // 蛋白质变化
  consequence: string;           // 变异后果
}

// ============ CNV变异 ============
export interface CNV {
  id: string;
  chromosome: string;
  startPosition: number;
  endPosition: number;
  length: number;
  type: 'Amplification' | 'Deletion';
  copyNumber: number;
  genes: string[];               // 涉及基因列表
  confidence: number;            // 置信度
}

// ============ 动态突变（STR） ============
export type STRStatus = 'Normal' | 'Premutation' | 'FullMutation';

export interface STR {
  id: string;
  gene: string;
  locus: string;                 // 位点名称
  repeatUnit: string;            // 重复单元
  repeatCount: number;           // 重复次数
  normalRangeMin: number;        // 正常范围下限
  normalRangeMax: number;        // 正常范围上限
  status: STRStatus;
}

// ============ 线粒体变异 ============
export type MitochondrialPathogenicity = 
  | 'Pathogenic' 
  | 'Likely_Pathogenic' 
  | 'VUS' 
  | 'Likely_Benign' 
  | 'Benign';

export interface MitochondrialVariant {
  id: string;
  position: number;
  ref: string;
  alt: string;
  gene: string;
  heteroplasmy: number;          // 异质性比例 (0-1)
  pathogenicity: MitochondrialPathogenicity;
  associatedDisease: string;     // 关联疾病
  haplogroup?: string;           // 单倍群
}

// ============ UPD区域 ============
export type UPDType = 'Isodisomy' | 'Heterodisomy';
export type ParentOfOrigin = 'Maternal' | 'Paternal' | 'Unknown';

export interface UPDRegion {
  id: string;
  chromosome: string;
  startPosition: number;
  endPosition: number;
  length: number;
  type: UPDType;
  genes: string[];               // 涉及基因
  parentOfOrigin?: ParentOfOrigin;
}

// ============ 标签页类型 ============
export type TabType = 'qc' | 'snv-indel' | 'cnv' | 'str' | 'mt' | 'upd';

export interface TabConfig {
  id: TabType;
  label: string;
}

export const TAB_CONFIGS: TabConfig[] = [
  { id: 'qc', label: '质控结果' },
  { id: 'snv-indel', label: 'SNV/Indel检出表' },
  { id: 'cnv', label: 'CNV检出表' },
  { id: 'str', label: '动态突变检出表' },
  { id: 'mt', label: '线粒体检出表' },
  { id: 'upd', label: 'UPD检出表' },
];

// ============ 表格筛选状态 ============
export interface TableFilterState {
  searchQuery: string;
  filters: Record<string, string | string[]>;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export const DEFAULT_FILTER_STATE: TableFilterState = {
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
