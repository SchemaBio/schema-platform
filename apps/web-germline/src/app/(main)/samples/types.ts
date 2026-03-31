// 样本相关类型定义

export type Gender = 'male' | 'female' | 'unknown';
export type SampleType = '全血' | '唾液' | 'DNA' | '组织' | '其他';

// 匹配数据结构（双端测序数据）
export interface MatchedPair {
  r1Path: string;  // R1文件路径
  r2Path: string;  // R2文件路径
}

export interface Sample {
  id: string;
  internalId: string;  // 内部编号
  gender: Gender;
  age?: number;  // 年龄
  sampleType: SampleType;
  batch: string;  // 批次
  clinicalDiagnosis: string;  // 临床诊断（简要）
  hpoTerms: { id: string; name: string }[];  // HPO术语
  matchedPair: MatchedPair | null;  // 匹配的双端数据（每组只能匹配一组）
  remark: string;  // 备注
  createdAt: string;
  updatedAt: string;
}

export interface SampleDetail {
  // 基本信息
  id: string;
  internalId: string;
  gender: Gender;
  age?: number;  // 年龄
  sampleType: SampleType;
  batch: string;
  matchedPair: MatchedPair | null;
  remark: string;

  // 临床诊断信息
  clinicalDiagnosis: {
    mainDiagnosis: string;
    symptoms: string[];
    hpoTerms?: { id: string; name: string }[];  // HPO术语
    onsetAge?: string;
    diseaseHistory?: string;
  };

  // 送检信息
  submissionInfo: {
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

  // 家族史
  familyHistory: {
    hasHistory: boolean;
    affectedMembers?: {
      relation: string;
      condition: string;
      onsetAge?: string;
    }[];
    pedigreeNote?: string;
  };

  // 关联分析任务
  analysisTasks: {
    id: string;
    name: string;
    status: string;
    createdAt: string;
  }[];

  createdAt: string;
  updatedAt: string;
}

export interface OpenTab {
  id: string;
  sampleId: string;
  name: string;
}

export const GENDER_CONFIG: Record<Gender, { label: string; color: string }> = {
  male: { label: '男', color: 'text-blue-600' },
  female: { label: '女', color: 'text-pink-600' },
  unknown: { label: '未知', color: 'text-gray-500' },
};
