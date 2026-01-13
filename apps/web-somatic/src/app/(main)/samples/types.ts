// 肿瘤样本相关类型定义

export type SampleStatus = 'pending' | 'matched' | 'analyzing' | 'completed';
export type Gender = 'male' | 'female' | 'unknown';

// 核酸类型
export type NucleicAcidType = 'DNA' | 'RNA';

// 样本类型（肿瘤特异）
export type SampleType = 'FFPE' | '新鲜组织' | '全血' | 'cfDNA' | '胸腹水' | '骨髓' | '其他';

// 样本来源
export type SampleSource = 'primary' | 'metastasis' | 'ctDNA' | 'other';

// 取样方式
export type SamplingMethod = 'surgery' | 'biopsy' | 'liquid' | 'other';

// 检测目的
export type TestPurpose = 'initial' | 'resistance' | 'recurrence' | 'mrd' | 'other';

// 临床分期
export type ClinicalStage = 'I' | 'II' | 'III' | 'IV' | 'unknown';

// HE 染色图片
export interface HEImageInfo {
  id: string;
  url: string;
  thumbnail: string;
  description: string;
  uploadedAt: string;
}

export interface Sample {
  id: string;
  // 内部编号（用户自定义）
  internalId: string;
  name: string;
  gender: Gender;
  age: number;
  birthDate: string;
  sampleType: SampleType;
  // 核酸类型
  nucleicAcidType: NucleicAcidType;
  // 肿瘤类型/原发部位
  tumorType: string;
  // 配对样本编号（如有）
  pairedSampleId?: string;
  dataCount: number;
  status: SampleStatus;
  createdAt: string;
  updatedAt: string;
  // 送检单位
  hospital: string;
  // 送检项目
  testItems: string;
}

export interface SampleDetail extends Sample {
  // 基本信息
  idCard?: string;
  patientCode?: string;  // 患者唯一编号（身份证或自定义编号）
  phone?: string;
  
  // 肿瘤信息
  tumorInfo: {
    tumorType: string;           // 肿瘤类型/原发部位
    pathologyType?: string;      // 病理分型
    clinicalStage?: ClinicalStage; // 临床分期
    tnmStage?: {                 // TNM 分期
      t?: string;
      n?: string;
      m?: string;
    };
    tumorPurity?: number;        // 肿瘤细胞含量 (%)
  };
  
  // 样本来源信息
  sourceInfo: {
    sampleSource: SampleSource;  // 样本来源（原发灶/转移灶/ctDNA）
    samplingMethod: SamplingMethod; // 取样方式
    isPaired: boolean;           // 是否为配对样本
    pairedSampleId?: string;     // 对照样本编号
    samplingDate?: string;       // 取样日期
    samplingLocation?: string;   // 取样部位
  };
  
  // 治疗信息
  treatmentInfo: {
    hasPriorTreatment: boolean;  // 是否有既往治疗
    priorTreatments?: {
      type: 'surgery' | 'radiation' | 'chemotherapy' | 'targeted' | 'immunotherapy' | 'other';
      detail?: string;
      date?: string;
    }[];
    currentMedication?: string;  // 当前用药
    isResistant?: boolean;       // 是否为耐药样本
    isRecurrent?: boolean;       // 是否为复发样本
  };
  
  // 检测需求
  testRequirement: {
    testPurpose: TestPurpose;    // 检测目的
    focusGenes?: string[];       // 重点关注基因
    focusPathways?: string[];    // 重点关注通路
    clinicalQuestion?: string;   // 临床问题
  };
  
  // 送检信息
  submissionInfo: {
    hospital: string;
    department: string;
    doctor: string;
    submissionDate: string;
    sampleCollectionDate: string;
    sampleReceiveDate: string;
    sampleQuality: 'good' | 'acceptable' | 'poor';
  };
  
  // 项目信息
  projectInfo: {
    projectId: string;
    projectName: string;
    testItems: string[];
    panel?: string;
    turnaroundDays: number;
    priority: 'normal' | 'urgent';
  };
  
  // 关联分析任务
  analysisTasks: {
    id: string;
    name: string;
    status: string;
    createdAt: string;
  }[];
  
  // HE 染色图片
  heImages?: HEImageInfo[];

  // 关联样本列表（同一患者的其他样本）
  relatedSamples?: RelatedSample[];
}

/**
 * 关联样本信息（同一患者的其他样本）
 */
export interface RelatedSample {
  id: string;
  internalId: string;
  sampleType: SampleType;
  tumorType: string;
  createdAt: string;
  status: SampleStatus;
}

export interface OpenTab {
  id: string;
  sampleId: string;
  name: string;
}

// 配置常量
export const STATUS_CONFIG: Record<SampleStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  pending: { label: '待匹配', variant: 'neutral' },
  matched: { label: '已匹配', variant: 'info' },
  analyzing: { label: '分析中', variant: 'warning' },
  completed: { label: '已完成', variant: 'success' },
};

export const GENDER_CONFIG: Record<Gender, { label: string; color: string }> = {
  male: { label: '男', color: 'text-blue-600' },
  female: { label: '女', color: 'text-pink-600' },
  unknown: { label: '未知', color: 'text-gray-500' },
};

export const SAMPLE_TYPE_OPTIONS = [
  { value: 'FFPE', label: 'FFPE（石蜡包埋）' },
  { value: '新鲜组织', label: '新鲜组织' },
  { value: '全血', label: '全血' },
  { value: 'cfDNA', label: 'cfDNA（游离DNA）' },
  { value: '胸腹水', label: '胸腹水' },
  { value: '骨髓', label: '骨髓' },
  { value: '其他', label: '其他' },
];

export const NUCLEIC_ACID_TYPE_OPTIONS = [
  { value: 'DNA', label: 'DNA' },
  { value: 'RNA', label: 'RNA' },
];

export const SAMPLE_SOURCE_OPTIONS = [
  { value: 'primary', label: '原发灶' },
  { value: 'metastasis', label: '转移灶' },
  { value: 'ctDNA', label: '循环肿瘤DNA' },
  { value: 'other', label: '其他' },
];

export const SAMPLING_METHOD_OPTIONS = [
  { value: 'surgery', label: '手术切除' },
  { value: 'biopsy', label: '穿刺活检' },
  { value: 'liquid', label: '液体活检' },
  { value: 'other', label: '其他' },
];

export const TEST_PURPOSE_OPTIONS = [
  { value: 'initial', label: '初诊用药指导' },
  { value: 'resistance', label: '耐药分析' },
  { value: 'recurrence', label: '复发监测' },
  { value: 'mrd', label: 'MRD监测' },
  { value: 'other', label: '其他' },
];

export const CLINICAL_STAGE_OPTIONS = [
  { value: 'I', label: 'I 期' },
  { value: 'II', label: 'II 期' },
  { value: 'III', label: 'III 期' },
  { value: 'IV', label: 'IV 期' },
  { value: 'unknown', label: '未知' },
];

export const TREATMENT_TYPE_OPTIONS = [
  { value: 'surgery', label: '手术' },
  { value: 'radiation', label: '放疗' },
  { value: 'chemotherapy', label: '化疗' },
  { value: 'targeted', label: '靶向治疗' },
  { value: 'immunotherapy', label: '免疫治疗' },
  { value: 'other', label: '其他' },
];

// 常见肿瘤类型（实体瘤）
export const TUMOR_TYPE_OPTIONS = [
  { value: '肺癌', label: '肺癌' },
  { value: '乳腺癌', label: '乳腺癌' },
  { value: '结直肠癌', label: '结直肠癌' },
  { value: '胃癌', label: '胃癌' },
  { value: '肝癌', label: '肝癌' },
  { value: '胰腺癌', label: '胰腺癌' },
  { value: '卵巢癌', label: '卵巢癌' },
  { value: '前列腺癌', label: '前列腺癌' },
  { value: '甲状腺癌', label: '甲状腺癌' },
  { value: '肾癌', label: '肾癌' },
  { value: '膀胱癌', label: '膀胱癌' },
  { value: '食管癌', label: '食管癌' },
  { value: '宫颈癌', label: '宫颈癌' },
  { value: '子宫内膜癌', label: '子宫内膜癌' },
  { value: '黑色素瘤', label: '黑色素瘤' },
  { value: '脑胶质瘤', label: '脑胶质瘤' },
  { value: '其他', label: '其他' },
];

// 肿瘤类型对应的图标映射
export const TUMOR_TYPE_ICONS: Record<string, string> = {
  '肺癌': '🫁',
  '乳腺癌': '🎀',
  '结直肠癌': '🔴',
  '胃癌': '🟠',
  '肝癌': '🟤',
  '胰腺癌': '🟡',
  '卵巢癌': '🟣',
  '前列腺癌': '🔵',
  '甲状腺癌': '🦋',
  '肾癌': '🫘',
  '膀胱癌': '💧',
  '食管癌': '🔶',
  '宫颈癌': '🌸',
  '子宫内膜癌': '🌺',
  '黑色素瘤': '⬛',
  '脑胶质瘤': '🧠',
  '其他': '🔘',
};
