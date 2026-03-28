import type { Sample, SampleDetail } from './types';

// Mock 样本列表数据 (using UUID format)
export const mockSamples: Sample[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    internalId: 'INT-001',
    gender: 'male',
    sampleType: '全血',
    batch: 'BATCH-2024-001',
    clinicalDiagnosis: '遗传性心肌病待查',
    hpoTerms: [
      { id: 'HP:0001635', name: '充血性心力衰竭' },
      { id: 'HP:0001962', name: '心悸' },
    ],
    matchedPair: {
      r1Path: '/data/sequencing/2024/SEQ-001_R1.fastq.gz',
      r2Path: '/data/sequencing/2024/SEQ-001_R2.fastq.gz',
    },
    remark: '家系样本，先证者',
    createdAt: '2024-12-20 10:30:45',
    updatedAt: '2024-12-25 14:22:30',
  },
  {
    id: 'b2c3d4e5-f678-90ab-cdef-123456789012',
    internalId: 'INT-002',
    gender: 'male',
    sampleType: '唾液',
    batch: 'BATCH-2024-001',
    clinicalDiagnosis: '智力发育迟缓',
    hpoTerms: [
      { id: 'HP:0001249', name: '智力障碍' },
      { id: 'HP:0001263', name: '发育迟缓' },
    ],
    matchedPair: null,
    remark: '',
    createdAt: '2024-12-21 09:15:20',
    updatedAt: '2024-12-21 09:15:20',
  },
  {
    id: 'c3d4e5f6-7890-abcd-ef12-345678901234',
    internalId: 'INT-003',
    gender: 'male',
    sampleType: '全血',
    batch: 'BATCH-2024-002',
    clinicalDiagnosis: '疑似遗传代谢病',
    hpoTerms: [],
    matchedPair: null,
    remark: '待补充临床信息',
    createdAt: '2024-12-22 11:45:00',
    updatedAt: '2024-12-22 11:45:00',
  },
  {
    id: 'd4e5f678-90ab-cdef-1234-567890123456',
    internalId: 'INT-004',
    gender: 'female',
    sampleType: 'DNA',
    batch: 'BATCH-2024-002',
    clinicalDiagnosis: '家族性乳腺癌',
    hpoTerms: [
      { id: 'HP:0003002', name: '乳腺癌' },
    ],
    matchedPair: {
      r1Path: '/data/sequencing/2024/SEQ-003_R1.fastq.gz',
      r2Path: '/data/sequencing/2024/SEQ-003_R2.fastq.gz',
    },
    remark: 'BRCA1/2检测',
    createdAt: '2024-12-23 08:30:15',
    updatedAt: '2024-12-24 16:40:50',
  },
  {
    id: 'e5f67890-abcd-ef12-3456-789012345678',
    internalId: 'INT-005',
    gender: 'male',
    sampleType: '组织',
    batch: 'BATCH-2024-003',
    clinicalDiagnosis: '肥厚型心肌病',
    hpoTerms: [
      { id: 'HP:0001639', name: '肥厚型心肌病' },
    ],
    matchedPair: {
      r1Path: '/data/sequencing/2024/SEQ-006_R1.fastq.gz',
      r2Path: '/data/sequencing/2024/SEQ-006_R2.fastq.gz',
    },
    remark: '心肌组织样本',
    createdAt: '2024-12-24 13:20:35',
    updatedAt: '2024-12-28 09:10:00',
  },
];

// Mock 样本详情数据
const mockSampleDetails: Record<string, SampleDetail> = {
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890': {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    internalId: 'INT-001',
    gender: 'male',
    sampleType: '全血',
    batch: 'BATCH-2024-001',
    clinicalDiagnosis: {
      mainDiagnosis: '遗传性心肌病待查',
      symptoms: ['心悸', '胸闷', '运动后气短'],
      hpoTerms: [
        { id: 'HP:0001635', name: '充血性心力衰竭' },
        { id: 'HP:0001962', name: '心悸' },
        { id: 'HP:0002094', name: '呼吸困难' },
      ],
      onsetAge: '25岁',
      diseaseHistory: '患者于3年前开始出现活动后心悸、胸闷症状，近期加重。',
    },
    matchedPair: {
      r1Path: '/data/sequencing/2024/SEQ-001_R1.fastq.gz',
      r2Path: '/data/sequencing/2024/SEQ-001_R2.fastq.gz',
    },
    remark: '家系样本，先证者',
    submissionInfo: {
      submissionDate: '2024-12-20',
      sampleCollectionDate: '2024-12-19',
      sampleReceiveDate: '2024-12-20',
      sampleQuality: 'good',
    },
    projectInfo: {
      projectId: 'PRJ2024001',
      projectName: '遗传性心血管疾病基因检测',
      testItems: ['全外显子组测序', '拷贝数变异分析'],
      panel: '心血管疾病Panel',
      turnaroundDays: 15,
      priority: 'normal',
    },
    familyHistory: {
      hasHistory: true,
      affectedMembers: [
        { relation: '父亲', condition: '心肌病', onsetAge: '45岁' },
        { relation: '祖父', condition: '猝死', onsetAge: '50岁' },
      ],
      pedigreeNote: '家系中有明确的心血管疾病遗传史',
    },
    analysisTasks: [
      { id: 'task-001-a1b2', name: 'WES分析', status: 'completed', createdAt: '2024-12-20' },
      { id: 'task-002-b2c3', name: 'CNV分析', status: 'completed', createdAt: '2024-12-21' },
    ],
    createdAt: '2024-12-20 10:30:45',
    updatedAt: '2024-12-25 14:22:30',
  },
  'b2c3d4e5-f678-90ab-cdef-123456789012': {
    id: 'b2c3d4e5-f678-90ab-cdef-123456789012',
    internalId: 'INT-002',
    gender: 'male',
    sampleType: '唾液',
    batch: 'BATCH-2024-001',
    clinicalDiagnosis: {
      mainDiagnosis: '智力发育迟缓',
      symptoms: ['语言发育迟缓', '运动发育迟缓'],
      hpoTerms: [
        { id: 'HP:0001249', name: '智力障碍' },
        { id: 'HP:0001263', name: '发育迟缓' },
      ],
      onsetAge: '2岁',
      diseaseHistory: '患儿2岁时发现语言发育明显落后于同龄儿童。',
    },
    matchedPair: null,
    remark: '',
    submissionInfo: {
      submissionDate: '2024-12-21',
      sampleCollectionDate: '2024-12-20',
      sampleReceiveDate: '2024-12-21',
      sampleQuality: 'good',
    },
    projectInfo: {
      projectId: 'PRJ2024002',
      projectName: '神经发育障碍基因检测',
      testItems: ['全外显子组测序'],
      turnaroundDays: 20,
      priority: 'urgent',
    },
    familyHistory: {
      hasHistory: false,
    },
    analysisTasks: [
      { id: 'task-003-c3d4', name: 'WES分析', status: 'running', createdAt: '2024-12-21' },
    ],
    createdAt: '2024-12-21 09:15:20',
    updatedAt: '2024-12-21 09:15:20',
  },
};

// 获取样本详情
export async function getSampleDetail(sampleId: string): Promise<SampleDetail | null> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));

  // 如果有详细数据则返回，否则基于列表数据生成默认详情
  if (mockSampleDetails[sampleId]) {
    return mockSampleDetails[sampleId];
  }

  const sample = mockSamples.find(s => s.id === sampleId);
  if (!sample) return null;

  // 生成默认详情
  return {
    ...sample,
    clinicalDiagnosis: {
      mainDiagnosis: '待补充',
      symptoms: [],
    },
    submissionInfo: {
      submissionDate: sample.createdAt.split(' ')[0],
      sampleCollectionDate: sample.createdAt.split(' ')[0],
      sampleReceiveDate: sample.createdAt.split(' ')[0],
      sampleQuality: 'good',
    },
    projectInfo: {
      projectId: '-',
      projectName: '待分配',
      testItems: [],
      turnaroundDays: 15,
      priority: 'normal',
    },
    familyHistory: {
      hasHistory: false,
    },
    analysisTasks: [],
  };
}