import type { Sample, SampleDetail } from './types';

// Mock 样本列表数据
export const mockSamples: Sample[] = [
  {
    id: 'S2024120001',
    internalId: 'XH-2024-001',
    name: '张三',
    gender: 'male',
    age: 58,
    birthDate: '1966-05-15',
    sampleType: 'FFPE',
    nucleicAcidType: 'DNA',
    tumorType: '肺癌',
    dataCount: 2,
    status: 'completed',
    createdAt: '2024-12-20',
    updatedAt: '2024-12-25',
    hospital: '北京协和医院',
    testItems: '肺癌168基因Panel',
  },
  {
    id: 'S2024120002',
    internalId: 'XH-2024-002',
    name: '李四',
    gender: 'female',
    age: 45,
    birthDate: '1979-08-22',
    sampleType: '新鲜组织',
    nucleicAcidType: 'DNA',
    tumorType: '乳腺癌',
    pairedSampleId: 'S2024120002-N',
    dataCount: 1,
    status: 'analyzing',
    createdAt: '2024-12-21',
    updatedAt: '2024-12-21',
    hospital: '上海肿瘤医院',
    testItems: '乳腺癌56基因Panel',
  },
  {
    id: 'S2024120003',
    internalId: 'GZ-2024-088',
    name: '王五',
    gender: 'male',
    age: 62,
    birthDate: '1962-03-10',
    sampleType: 'cfDNA',
    nucleicAcidType: 'DNA',
    tumorType: '结直肠癌',
    dataCount: 0,
    status: 'pending',
    createdAt: '2024-12-22',
    updatedAt: '2024-12-22',
    hospital: '广州中山医院',
    testItems: '结直肠癌Panel',
  },
  {
    id: 'S2024120004',
    internalId: 'ZJ-2024-156',
    name: '赵六',
    gender: 'female',
    age: 52,
    birthDate: '1972-11-30',
    sampleType: 'FFPE',
    nucleicAcidType: 'RNA',
    tumorType: '卵巢癌',
    dataCount: 3,
    status: 'matched',
    createdAt: '2024-12-23',
    updatedAt: '2024-12-24',
    hospital: '浙江省肿瘤医院',
    testItems: '妇科肿瘤Panel',
  },
  {
    id: 'S2024120005',
    internalId: 'SC-2024-203',
    name: '孙七',
    gender: 'male',
    age: 48,
    birthDate: '1976-07-08',
    sampleType: '新鲜组织',
    nucleicAcidType: 'DNA',
    tumorType: '胃癌',
    pairedSampleId: 'S2024120005-N',
    dataCount: 1,
    status: 'completed',
    createdAt: '2024-12-24',
    updatedAt: '2024-12-28',
    hospital: '四川华西医院',
    testItems: '消化道肿瘤Panel',
  },
];

// Mock 样本详情数据
const mockSampleDetails: Record<string, SampleDetail> = {
  'S2024120001': {
    ...mockSamples[0],
    idCard: '110***********1234',
    phone: '138****5678',
    tumorInfo: {
      tumorType: '肺癌',
      pathologyType: '腺癌',
      clinicalStage: 'III',
      tnmStage: { t: 'T2', n: 'N1', m: 'M0' },
      tumorPurity: 60,
    },
    sourceInfo: {
      sampleSource: 'primary',
      samplingMethod: 'biopsy',
      isPaired: false,
      samplingDate: '2024-12-18',
      samplingLocation: '右肺上叶',
    },
    treatmentInfo: {
      hasPriorTreatment: true,
      priorTreatments: [
        { type: 'chemotherapy', detail: '培美曲塞+顺铂 4周期', date: '2024-06' },
      ],
      currentMedication: '无',
      isResistant: true,
      isRecurrent: false,
    },
    testRequirement: {
      testPurpose: 'resistance',
      focusGenes: ['EGFR', 'ALK', 'ROS1', 'KRAS'],
      clinicalQuestion: '一线化疗后进展，寻找靶向治疗机会',
    },
    submissionInfo: {
      hospital: '北京协和医院',
      department: '肿瘤内科',
      doctor: '王医生',
      submissionDate: '2024-12-20',
      sampleCollectionDate: '2024-12-18',
      sampleReceiveDate: '2024-12-20',
      sampleQuality: 'good',
    },
    projectInfo: {
      projectId: 'PRJ2024001',
      projectName: '肺癌靶向用药基因检测',
      testItems: ['全外显子组测序', 'TMB分析', 'MSI检测'],
      panel: '肺癌168基因Panel',
      turnaroundDays: 7,
      priority: 'urgent',
    },
    analysisTasks: [
      { id: 'a1b2c3d4', name: 'S2024120001', status: 'completed', createdAt: '2024-12-20' },
    ],
    heImages: [
      {
        id: 'he-001',
        url: 'https://placehold.co/800x600/e8d5e8/333?text=HE+Lung+10x',
        thumbnail: 'https://placehold.co/200x150/e8d5e8/333?text=HE+10x',
        description: '肺腺癌 HE 染色 10x',
        uploadedAt: '2024-12-20',
      },
      {
        id: 'he-002',
        url: 'https://placehold.co/800x600/d5e8e8/333?text=HE+Lung+40x',
        thumbnail: 'https://placehold.co/200x150/d5e8e8/333?text=HE+40x',
        description: '肺腺癌 HE 染色 40x',
        uploadedAt: '2024-12-20',
      },
    ],
  },
  'S2024120002': {
    ...mockSamples[1],
    tumorInfo: {
      tumorType: '乳腺癌',
      pathologyType: '浸润性导管癌',
      clinicalStage: 'II',
      tnmStage: { t: 'T2', n: 'N0', m: 'M0' },
      tumorPurity: 75,
    },
    sourceInfo: {
      sampleSource: 'primary',
      samplingMethod: 'surgery',
      isPaired: true,
      pairedSampleId: 'S2024120002-N',
      samplingDate: '2024-12-19',
      samplingLocation: '左乳外上象限',
    },
    treatmentInfo: {
      hasPriorTreatment: false,
      isResistant: false,
      isRecurrent: false,
    },
    testRequirement: {
      testPurpose: 'initial',
      focusGenes: ['BRCA1', 'BRCA2', 'HER2', 'PIK3CA'],
      clinicalQuestion: '初诊乳腺癌，评估靶向治疗及内分泌治疗敏感性',
    },
    submissionInfo: {
      hospital: '上海肿瘤医院',
      department: '乳腺外科',
      doctor: '李医生',
      submissionDate: '2024-12-21',
      sampleCollectionDate: '2024-12-19',
      sampleReceiveDate: '2024-12-21',
      sampleQuality: 'good',
    },
    projectInfo: {
      projectId: 'PRJ2024002',
      projectName: '乳腺癌精准诊疗基因检测',
      testItems: ['全外显子组测序', 'HRD检测'],
      panel: '乳腺癌56基因Panel',
      turnaroundDays: 10,
      priority: 'normal',
    },
    analysisTasks: [
      { id: 'c3d4e5f6', name: 'S2024120002', status: 'running', createdAt: '2024-12-21' },
    ],
    heImages: [
      {
        id: 'he-003',
        url: 'https://placehold.co/800x600/e8e8d5/333?text=HE+Breast',
        thumbnail: 'https://placehold.co/200x150/e8e8d5/333?text=HE+Breast',
        description: '乳腺浸润性导管癌 HE 染色',
        uploadedAt: '2024-12-21',
      },
    ],
  },
};

// 获取样本详情
export async function getSampleDetail(sampleId: string): Promise<SampleDetail | null> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 如果有详细数据则返回
  if (mockSampleDetails[sampleId]) {
    return mockSampleDetails[sampleId];
  }
  
  const sample = mockSamples.find(s => s.id === sampleId);
  if (!sample) return null;
  
  // 生成默认详情
  return {
    ...sample,
    tumorInfo: {
      tumorType: sample.tumorType,
    },
    sourceInfo: {
      sampleSource: 'primary',
      samplingMethod: 'biopsy',
      isPaired: !!sample.pairedSampleId,
      pairedSampleId: sample.pairedSampleId,
    },
    treatmentInfo: {
      hasPriorTreatment: false,
    },
    testRequirement: {
      testPurpose: 'initial',
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
      turnaroundDays: 10,
      priority: 'normal',
    },
    analysisTasks: [],
    heImages: [],
  };
}
