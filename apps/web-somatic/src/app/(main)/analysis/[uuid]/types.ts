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
  gcRatio: number;               // GC比例 (0-1)
  uniformity: number;            // 均一性 (0-1)
  dedupDepth: number;            // 去重深度
  captureEfficiency: number;     // 捕获效率 (0-1)
  predictedGender: 'Male' | 'Female' | 'Unknown';  // 性别预测
  contaminationRate: number;     // 污染比例 (0-1)
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

// ============ Tier临床意义分类 ============
export type TierClassification = 'Tier I' | 'Tier II' | 'Tier III' | 'Tier IV' | 'Unknown';

// ============ SNV/Indel变异 ============
// ============ 变异审核状态 ============
export interface VariantReviewStatus {
  reviewed: boolean;             // 是否已审核
  reported: boolean;             // 是否已回报
  reviewedBy?: string;           // 审核人
  reviewedAt?: string;           // 审核时间
  reportedBy?: string;           // 回报人
  reportedAt?: string;           // 回报时间
}

export interface SNVIndel extends VariantReviewStatus {
  id: string;
  gene: string;                  // 基因名 (HGNC)
  chromosome: string;            // 染色体 (不带chr前缀)
  position: number;              // 位置 (兼容旧字段)
  start: number;                 // 起始位置 (NCCL)
  end: number;                   // 终止位置 (NCCL: SNV时与start相同，Insertion时为-1表示"-")
  ref: string;                   // 参考碱基 (Insertion时为"-")
  alt: string;                   // 变异碱基 (Deletion时为"-")
  variantType: 'SNV' | 'Insertion' | 'Deletion' | 'Complex';
  zygosity: 'Heterozygous' | 'Homozygous' | 'Hemizygous';
  alleleFrequency: number;       // 等位基因频率 (VAF)
  depth: number;                 // 覆盖深度
  acmgClassification: ACMGClassification;
  clinicalSignificance: TierClassification;  // 临床意义 (Tier分类)
  transcript: string;            // 转录本 (含版本号，如 NM_005228.5)
  hgvsc: string;                 // cDNA变化 (cHGVS)
  hgvsp: string;                 // 蛋白质变化 (pHGVS)
  consequence: string;           // 变异后果 (Consequence)
  affectedExon?: string;         // 受影响外显子 (如 "19/27")
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
  project?: string;              // 项目名称
  institution?: string;          // 送检单位
  cancerType?: string;           // 癌种
}

// ============ CNV变异(片段级别) ============
export interface CNVSegment extends VariantReviewStatus {
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
export interface CNVExon extends VariantReviewStatus {
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

export interface STR extends VariantReviewStatus {
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

export interface MitochondrialVariant extends VariantReviewStatus {
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

export interface UPDRegion extends VariantReviewStatus {
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
export type TabType = 'sample-info' | 'qc' | 'snv-indel' | 'hotspot' | 'chemotherapy' | 'germline' | 'cnv-gene' | 'cnv-exon' | 'cnv-chrom' | 'fusion' | 'neoantigen' | 'biomarkers' | 'report';

export interface TabConfig {
  id: TabType;
  label: string;
}

export const TAB_CONFIGS: TabConfig[] = [
  { id: 'sample-info', label: '样本信息' },
  { id: 'qc', label: '质控结果' },
  { id: 'snv-indel', label: 'SNV/InDel' },
  { id: 'hotspot', label: 'Hotspot' },
  { id: 'germline', label: '胚系位点' },
  { id: 'chemotherapy', label: '化疗位点' },
  { id: 'cnv-gene', label: 'CNV(Gene)' },
  { id: 'cnv-exon', label: 'CNV(Exon)' },
  { id: 'cnv-chrom', label: 'CNV(Chrom)' },
  { id: 'fusion', label: 'Fusion' },
  { id: 'neoantigen', label: '新抗原' },
  { id: 'biomarkers', label: '其他检出' },
  { id: 'report', label: '报告生成' },
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


// ============ ClinGen CNV 致病性评估 ============

/**
 * ClinGen CNV 致病性分类
 * 基于 ACMG/ClinGen CNV 解读技术标准
 */
export type ClinGenClassification = 
  | 'Pathogenic'        // ≥ 0.99
  | 'Likely_Pathogenic' // 0.90 ~ 0.98
  | 'VUS'               // -0.89 ~ 0.89
  | 'Likely_Benign'     // -0.90 ~ -0.98
  | 'Benign';           // ≤ -0.99

/**
 * ClinGen 分类阈值常量
 */
export const CLINGEN_THRESHOLDS = {
  PATHOGENIC: 0.99,
  LIKELY_PATHOGENIC: 0.90,
  LIKELY_BENIGN: -0.90,
  BENIGN: -0.99,
} as const;

// ============ Section 1: 基因组内容初始评估 ============

/**
 * Section 1 Loss 证据标准
 */
export type Section1LossOption = '1A' | '1B';

export interface Section1LossCriteria {
  selected: Section1LossOption | null;
}

/**
 * Section 1 Gain 证据标准 (与Loss相同)
 */
export type Section1GainOption = '1A' | '1B';

export interface Section1GainCriteria {
  selected: Section1GainOption | null;
}

// ============ Section 2: HI/TS 基因/区域重叠 ============

/**
 * Section 2 Loss HI重叠选项
 */
export type Section2LossHIOption = 
  | '2A'    // 完全重叠已建立HI基因/区域 (1.0)
  | '2B'    // 部分重叠已建立HI区域 (0)
  | '2C-1'  // 部分重叠HI基因5'端，涉及编码序列 (0.90, range: 0.45-1.00)
  | '2C-2'  // 部分重叠HI基因5'端，仅涉及5'UTR (0, range: 0-0.45)
  | '2D-1'  // 部分重叠HI基因3'端，仅涉及3'UTR (0)
  | '2D-2'  // 部分重叠HI基因3'端，仅涉及最后外显子，有已知致病变异 (0.90, range: 0.45-0.90)
  | '2D-3'  // 部分重叠HI基因3'端，仅涉及最后外显子，无已知致病变异 (0.30, range: 0-0.45)
  | '2D-4'  // 部分重叠HI基因3'端，涉及其他外显子 (0.90, range: 0.45-1.00)
  | '2E';   // 两个断点在同一基因内 (参考PVS1)

/**
 * Section 2 Loss 良性区域重叠选项
 */
export type Section2LossBenignOption = 
  | '2F'    // 完全包含在已建立良性CNV区域内 (-1.0)
  | '2G';   // 重叠良性CNV但包含额外基因组物质 (0)

/**
 * Section 2 Loss HI预测器选项
 */
export type Section2LossHIPredictorOption = '2H'; // 多个HI预测器建议至少一个基因是HI (0.15)

export interface Section2LossCriteria {
  hiOverlap: {
    selected: Section2LossHIOption | null;
    score: number;
  };
  benignOverlap: {
    selected: Section2LossBenignOption | null;
    score: number;
  };
  hiPredictor: {
    selected: Section2LossHIPredictorOption | null;
  };
}

/**
 * Section 2 Gain TS重叠选项
 */
export type Section2GainTSOption = 
  | '2A'    // 完全重叠已建立TS基因/区域 (1.0)
  | '2B';   // 部分重叠已建立TS区域 (0)

/**
 * Section 2 Gain 良性区域重叠选项
 */
export type Section2GainBenignOption = 
  | '2C'    // 与已建立良性CNV基因内容相同 (-1.0)
  | '2D'    // 小于已建立良性CNV，断点不中断蛋白编码基因 (-1.0)
  | '2E'    // 小于已建立良性CNV，断点可能中断蛋白编码基因 (0)
  | '2F'    // 大于已建立良性CNV，不包含额外蛋白编码基因 (-0.90, range: 0 to -1.00)
  | '2G';   // 重叠良性CNV但包含额外基因组物质 (0)

/**
 * Section 2 Gain HI基因重叠选项
 */
export type Section2GainHIOption = 
  | '2H'    // HI基因完全包含在CNV内 (0)
  | '2I'    // 两个断点在同一基因内 (参考PVS1)
  | '2J'    // 一个断点在已建立HI基因内，表型不一致或未知 (0)
  | '2K'    // 一个断点在已建立HI基因内，表型高度特异且一致 (0.45)
  | '2L';   // 断点在无临床意义基因内 (0)

export interface Section2GainCriteria {
  tsOverlap: {
    selected: Section2GainTSOption | null;
    score: number;
  };
  benignOverlap: {
    selected: Section2GainBenignOption | null;
    score: number;
  };
  hiOverlap: {
    selected: Section2GainHIOption | null;
    score: number;
  };
}

// ============ Section 3: 基因数量评估 ============

export interface Section3Criteria {
  geneCount: number;
}

// ============ Section 4: 文献和数据库证据 ============

/**
 * Section 4 De Novo 证据
 */
export interface Section4DeNovoCriteria {
  // 4A: 高度特异且独特的表型
  '4A': { confirmedCount: number; assumedCount: number };
  // 4B: 高度特异但不独特的表型
  '4B': { confirmedCount: number; assumedCount: number };
  // 4C: 一致但不高度特异的表型
  '4C': { confirmedCount: number; assumedCount: number };
  // 4D: 不一致的表型
  '4D': { count: number; score: number };
}

/**
 * Section 4 未知遗传证据
 */
export interface Section4UnknownInheritanceCriteria {
  // 4E: 高度特异表型，遗传未知
  '4E': { count: number };
}

/**
 * Section 4 分离证据
 */
export interface Section4SegregationCriteria {
  // 4F: 3+受累家属，LOD ≥ 2
  '4F': number;
  // 4G: 2个受累家属
  '4G': number;
  // 4H: 1个受累家属
  '4H': number;
}

/**
 * Section 4 非分离证据
 */
export interface Section4NonSegregationCriteria {
  // 4I: 未在受累家属中发现
  '4I': { familyCount: number; score: number };
  // 4J: 在未受累家属中发现（特异表型）
  '4J': { familyCount: number; score: number };
  // 4K: 在未受累家属中发现（非特异表型）
  '4K': { familyCount: number; score: number };
}

/**
 * Section 4 病例对照证据
 */
export interface Section4CaseControlCriteria {
  // 4L: 病例中显著增加（特异表型）
  '4L': { studyCount: number; score: number };
  // 4M: 病例中显著增加（非特异表型）
  '4M': { studyCount: number; score: number };
  // 4N: 病例与对照无显著差异
  '4N': { studyCount: number; score: number };
  // 4O: 与常见人群变异重叠
  '4O': { score: number };
}

export interface Section4Criteria {
  deNovo: Section4DeNovoCriteria;
  unknownInheritance: Section4UnknownInheritanceCriteria;
  segregation: Section4SegregationCriteria;
  nonSegregation: Section4NonSegregationCriteria;
  caseControl: Section4CaseControlCriteria;
}

// ============ Section 5: 遗传模式/家族史 ============

/**
 * Section 5 De Novo 选项
 */
export type Section5DeNovoOption = '5A'; // 使用Section 4的de novo评分

/**
 * Section 5 遗传选项
 */
export type Section5InheritedOption = 
  | '5B'    // 特异表型，无家族史，遗传自未受累父母 (-0.30, range: 0 to -0.45)
  | '5C'    // 非特异表型，无家族史，遗传自未受累父母 (-0.15, range: 0 to -0.30)
  | '5D';   // CNV与家族中一致表型分离 (使用Section 4分离评分)

/**
 * Section 5 非分离选项
 */
export type Section5NonSegregationOption = '5E'; // 使用Section 4的非分离评分

/**
 * Section 5 其他选项
 */
export type Section5OtherOption = 
  | '5F'    // 遗传信息不可用或无信息 (0)
  | '5G'    // 遗传信息不可用，非特异表型与类似病例一致 (0.10, range: 0 to 0.15)
  | '5H';   // 遗传信息不可用，高度特异表型与类似病例一致 (0.30, range: 0 to 0.30)

export interface Section5Criteria {
  deNovo: {
    selected: Section5DeNovoOption | null;
    score: number;
  };
  inherited: {
    selected: Section5InheritedOption | null;
    score: number;
  };
  nonSegregation: {
    selected: Section5NonSegregationOption | null;
    score: number;
  };
  other: {
    selected: Section5OtherOption | null;
    score: number;
  };
}

// ============ 完整评估数据模型 ============

/**
 * Loss 评估标准
 */
export interface LossAssessmentCriteria {
  section1: Section1LossCriteria;
  section2: Section2LossCriteria;
  section3: Section3Criteria;
  section4: Section4Criteria;
  section5: Section5Criteria;
}

/**
 * Gain 评估标准
 */
export interface GainAssessmentCriteria {
  section1: Section1GainCriteria;
  section2: Section2GainCriteria;
  section3: Section3Criteria;
  section4: Section4Criteria;
  section5: Section5Criteria;
}

/**
 * 各部分评分结果
 */
export interface SectionScores {
  section1: number;
  section2: number;
  section3: number;
  section4: number;
  section5: number;
}

/**
 * CNV 致病性评估完整数据模型
 */
export interface CNVAssessment {
  id: string;
  cnvId: string;
  cnvType: 'Amplification' | 'Deletion';
  
  // 各部分证据选择
  criteria: LossAssessmentCriteria | GainAssessmentCriteria;
  
  // 计算结果
  sectionScores: SectionScores;
  totalScore: number;
  classification: ClinGenClassification;
  
  // 元数据
  isAutoCalculated: boolean;
  isUserModified: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * 评分结果
 */
export interface ScoreResult {
  sectionScores: SectionScores;
  totalScore: number;
  classification: ClinGenClassification;
}

// ============ 默认值工厂函数 ============

/**
 * 创建默认的 Section 4 标准
 */
export function createDefaultSection4Criteria(): Section4Criteria {
  return {
    deNovo: {
      '4A': { confirmedCount: 0, assumedCount: 0 },
      '4B': { confirmedCount: 0, assumedCount: 0 },
      '4C': { confirmedCount: 0, assumedCount: 0 },
      '4D': { count: 0, score: 0 },
    },
    unknownInheritance: {
      '4E': { count: 0 },
    },
    segregation: {
      '4F': 0,
      '4G': 0,
      '4H': 0,
    },
    nonSegregation: {
      '4I': { familyCount: 0, score: 0 },
      '4J': { familyCount: 0, score: 0 },
      '4K': { familyCount: 0, score: 0 },
    },
    caseControl: {
      '4L': { studyCount: 0, score: 0 },
      '4M': { studyCount: 0, score: 0 },
      '4N': { studyCount: 0, score: 0 },
      '4O': { score: 0 },
    },
  };
}

/**
 * 创建默认的 Section 5 标准
 */
export function createDefaultSection5Criteria(): Section5Criteria {
  return {
    deNovo: { selected: null, score: 0 },
    inherited: { selected: null, score: 0 },
    nonSegregation: { selected: null, score: 0 },
    other: { selected: null, score: 0 },
  };
}

/**
 * 创建默认的 Loss 评估标准
 */
export function createDefaultLossAssessmentCriteria(): LossAssessmentCriteria {
  return {
    section1: { selected: null },
    section2: {
      hiOverlap: { selected: null, score: 0 },
      benignOverlap: { selected: null, score: 0 },
      hiPredictor: { selected: null },
    },
    section3: { geneCount: 0 },
    section4: createDefaultSection4Criteria(),
    section5: createDefaultSection5Criteria(),
  };
}

/**
 * 创建默认的 Gain 评估标准
 */
export function createDefaultGainAssessmentCriteria(): GainAssessmentCriteria {
  return {
    section1: { selected: null },
    section2: {
      tsOverlap: { selected: null, score: 0 },
      benignOverlap: { selected: null, score: 0 },
      hiOverlap: { selected: null, score: 0 },
    },
    section3: { geneCount: 0 },
    section4: createDefaultSection4Criteria(),
    section5: createDefaultSection5Criteria(),
  };
}

/**
 * 创建默认的评分结果
 */
export function createDefaultSectionScores(): SectionScores {
  return {
    section1: 0,
    section2: 0,
    section3: 0,
    section4: 0,
    section5: 0,
  };
}
