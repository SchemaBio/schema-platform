// 样本相关类型定义

export type SampleStatus = 'pending' | 'matched' | 'analyzing' | 'completed';
export type Gender = 'male' | 'female' | 'unknown';
export type SampleType = '全血' | '唾液' | 'DNA' | '组织' | '其他';

export interface Sample {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  birthDate: string;
  sampleType: SampleType;
  pedigreeId: string;
  pedigreeName: string;
  dataCount: number;
  status: SampleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SampleDetail extends Sample {
  // 基本信息
  idCard?: string;
  phone?: string;
  ethnicity?: string;
  
  // 临床诊断信息
  clinicalDiagnosis: {
    mainDiagnosis: string;
    symptoms: string[];
    onsetAge?: string;
    diseaseHistory?: string;
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
}

export interface OpenTab {
  id: string;
  sampleId: string;
  name: string;
}

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
