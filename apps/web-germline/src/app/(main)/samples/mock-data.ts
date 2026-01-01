import type { Sample, SampleDetail } from './types';

// Mock 样本列表数据
export const mockSamples: Sample[] = [
  {
    id: 'S2024120001',
    internalId: 'INT-001',
    name: '张三',
    gender: 'male',
    age: 28,
    birthDate: '1996-05-15',
    sampleType: '全血',
    pedigreeId: 'FAM001',
    pedigreeName: '张氏家系',
    hospital: '北京协和医院',
    testProject: '全外显子组测序',
    dataCount: 2,
    status: 'completed',
    createdAt: '2024-12-20',
    updatedAt: '2024-12-25',
  },
  {
    id: 'S2024120002',
    internalId: 'INT-002',
    name: '李四',
    gender: 'female',
    age: 35,
    birthDate: '1989-08-22',
    sampleType: '唾液',
    pedigreeId: 'FAM001',
    pedigreeName: '张氏家系',
    hospital: '上海儿童医学中心',
    testProject: '神经发育障碍Panel',
    dataCount: 1,
    status: 'analyzing',
    createdAt: '2024-12-21',
    updatedAt: '2024-12-21',
  },
  {
    id: 'S2024120003',
    internalId: 'INT-003',
    name: '王五',
    gender: 'male',
    age: 5,
    birthDate: '2019-03-10',
    sampleType: '全血',
    pedigreeId: 'FAM002',
    pedigreeName: '王氏家系',
    hospital: '广州妇女儿童医院',
    testProject: '遗传代谢病Panel',
    dataCount: 0,
    status: 'pending',
    createdAt: '2024-12-22',
    updatedAt: '2024-12-22',
  },
  {
    id: 'S2024120004',
    internalId: 'INT-004',
    name: '赵六',
    gender: 'female',
    age: 42,
    birthDate: '1982-11-30',
    sampleType: 'DNA',
    pedigreeId: '-',
    pedigreeName: '-',
    hospital: '浙江大学附属第一医院',
    testProject: '遗传性肿瘤Panel',
    dataCount: 3,
    status: 'matched',
    createdAt: '2024-12-23',
    updatedAt: '2024-12-24',
  },
  {
    id: 'S2024120005',
    internalId: 'INT-005',
    name: '孙七',
    gender: 'male',
    age: 18,
    birthDate: '2006-07-08',
    sampleType: '组织',
    pedigreeId: 'FAM003',
    pedigreeName: '孙氏家系',
    hospital: '中山大学附属第一医院',
    testProject: '心血管疾病Panel',
    dataCount: 1,
    status: 'completed',
    createdAt: '2024-12-24',
    updatedAt: '2024-12-28',
  },
];

// Mock 样本详情数据
const mockSampleDetails: Record<string, SampleDetail> = {
  'S2024120001': {
    ...mockSamples[0],
    idCard: '110***********1234',
    phone: '138****5678',
    ethnicity: '汉族',
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
    submissionInfo: {
      hospital: '北京协和医院',
      department: '心内科',
      doctor: '王医生',
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
      { id: 'a1b2c3d4', name: 'WES分析', status: 'completed', createdAt: '2024-12-20' },
      { id: 'b2c3d4e5', name: 'CNV分析', status: 'completed', createdAt: '2024-12-21' },
    ],
  },
  'S2024120002': {
    ...mockSamples[1],
    ethnicity: '汉族',
    clinicalDiagnosis: {
      mainDiagnosis: '智力发育迟缓',
      symptoms: ['语言发育迟缓', '运动发育迟缓'],
      onsetAge: '2岁',
      diseaseHistory: '患儿2岁时发现语言发育明显落后于同龄儿童。',
    },
    submissionInfo: {
      hospital: '上海儿童医学中心',
      department: '神经内科',
      doctor: '李医生',
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
      { id: 'c3d4e5f6', name: 'WES分析', status: 'running', createdAt: '2024-12-21' },
    ],
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
      hospital: '待补充',
      department: '待补充',
      doctor: '待补充',
      submissionDate: sample.createdAt,
      sampleCollectionDate: sample.createdAt,
      sampleReceiveDate: sample.createdAt,
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
