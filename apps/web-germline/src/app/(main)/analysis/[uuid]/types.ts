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
  // 扩展注释信息
  rsId?: string;                 // dbSNP ID
  clinvarId?: string;            // ClinVar ID
  clinvarSignificance?: string;  // ClinVar 临床意义
  gnomadAF?: number;             // gnomAD 人群频率
  gnomadEasAF?: number;          // gnomAD 东亚人群频率
  exacAF?: number;               // ExAC 人群频率
  siftScore?: number;            // SIFT 评分
  siftPrediction?: string;       // SIFT 预测
  polyphenScore?: number;        // PolyPhen-2 评分
  polyphenPrediction?: string;   // PolyPhen-2 预测
  caddScore?: number;            // CADD 评分
  revelScore?: number;           // REVEL 评分
  spliceAI?: number;             // SpliceAI 评分
  acmgCriteria?: string[];       // ACMG 证据项
  pubmedIds?: string[];          // PubMed 文献 ID
  omimId?: string;               // OMIM ID
  diseaseAssociation?: string;   // 疾病关联
  inheritanceMode?: string;      // 遗传模式
}

// ============ 样本信息 ============
export interface SampleInfo {
  sampleId: string;
  sampleName: string;
  gender: 'Male' | 'Female' | 'Unknown';
  age?: number;
  clinicalDiagnosis?: string;
  phenotypes?: string[];
  familyHistory?: string;
  sampleType: string;
  collectionDate: string;
  receivedDate: string;
  reportDate?: string;
}

// ============ CNV变异(片段级别) ============
export interface CNVSegment {
  id: string;
  chromosome: string;
  startPosition: number;
  endPosition: number;
  length: number;
  type: 'Amplification' | 'Deletion';
  copyNumber: number;
  genes: string[];
  confidence: number;
}

// ============ CNV变异(外显子级别) ============
export interface CNVExon {
  id: string;
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

// ============ 动态突变（STR） ============
export type STRStatus = 'Normal' | 'Premutation' | 'FullMutation';

export interface STR {
  id: string;
  gene: string;
  transcript: string;            // 转录本
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
export type TabType = 'sample-info' | 'qc' | 'snv-indel' | 'cnv-segment' | 'cnv-exon' | 'str' | 'mt' | 'upd';

export interface TabConfig {
  id: TabType;
  label: string;
}

export const TAB_CONFIGS: TabConfig[] = [
  { id: 'sample-info', label: '样本信息' },
  { id: 'qc', label: '质控结果' },
  { id: 'snv-indel', label: 'SNV/Indel检出表' },
  { id: 'cnv-segment', label: 'CNV检出表(片段)' },
  { id: 'cnv-exon', label: 'CNV检出表(外显子)' },
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
  geneListId?: string;  // 基因列表过滤
}

export const DEFAULT_FILTER_STATE: TableFilterState = {
  searchQuery: '',
  filters: {},
  page: 1,
  pageSize: 20,
  geneListId: undefined,
};

// ============ 分页结果 ============
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
