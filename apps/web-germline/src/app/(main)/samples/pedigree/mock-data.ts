import type { Pedigree, PedigreeListItem, PedigreeMember } from './types';

// Mock 家系列表
export const mockPedigreeList: PedigreeListItem[] = [
  {
    id: 'FAM001',
    name: '张氏家系',
    memberCount: 6,
    sampledCount: 3,
    sampleIds: ['S2024120001', 'S2024120002', 'S2024120006'],
    probandSampleId: 'S2024120001',
    probandName: '张三',
    disease: '遗传性心肌病',
    createdAt: '2024-12-15',
    updatedAt: '2024-12-25',
  },
  {
    id: 'FAM002',
    name: '王氏家系',
    memberCount: 4,
    sampledCount: 2,
    sampleIds: ['S2024120003', 'S2024120007'],
    probandSampleId: 'S2024120003',
    probandName: '王五',
    disease: '智力发育迟缓',
    createdAt: '2024-12-18',
    updatedAt: '2024-12-22',
  },
  {
    id: 'FAM003',
    name: '孙氏家系',
    memberCount: 3,
    sampledCount: 1,
    sampleIds: ['S2024120005'],
    probandSampleId: 'S2024120005',
    probandName: '孙七',
    disease: '遗传性耳聋',
    createdAt: '2024-12-20',
    updatedAt: '2024-12-24',
  },
];

// Mock 家系详情
const mockPedigrees: Record<string, Pedigree> = {
  'FAM001': {
    id: 'FAM001',
    name: '张氏家系',
    probandId: 'M001',
    disease: '遗传性心肌病',
    createdAt: '2024-12-15',
    updatedAt: '2024-12-25',
    note: '家系中有明确的心血管疾病遗传史，建议进行全外显子组测序',
    members: [
      // 第-2代（祖父母）
      {
        id: 'M005',
        name: '张祖父',
        gender: 'male',
        birthYear: 1940,
        isDeceased: true,
        deceasedYear: 2010,
        relation: 'grandfather_paternal',
        affectedStatus: 'affected',
        phenotypes: ['猝死'],
        generation: -2,
        position: 0,
      },
      {
        id: 'M006',
        name: '张祖母',
        gender: 'female',
        birthYear: 1942,
        relation: 'grandmother_paternal',
        affectedStatus: 'unaffected',
        generation: -2,
        position: 1,
      },
      // 第-1代（父母）
      {
        id: 'M002',
        sampleId: 'S2024120002',
        name: '张父',
        gender: 'male',
        birthYear: 1968,
        relation: 'father',
        affectedStatus: 'affected',
        phenotypes: ['心肌病', '心律不齐'],
        fatherId: 'M005',
        motherId: 'M006',
        spouseIds: ['M003'],
        generation: -1,
        position: 0,
      },
      {
        id: 'M003',
        name: '张母',
        gender: 'female',
        birthYear: 1970,
        relation: 'mother',
        affectedStatus: 'unaffected',
        spouseIds: ['M002'],
        generation: -1,
        position: 1,
      },
      // 第0代（先证者及兄弟姐妹）
      {
        id: 'M001',
        sampleId: 'S2024120001',
        name: '张三',
        gender: 'male',
        birthYear: 1996,
        relation: 'proband',
        affectedStatus: 'affected',
        phenotypes: ['心悸', '胸闷', '运动后气短'],
        fatherId: 'M002',
        motherId: 'M003',
        generation: 0,
        position: 0,
      },
      {
        id: 'M004',
        sampleId: 'S2024120006',
        name: '张妹',
        gender: 'female',
        birthYear: 1999,
        relation: 'sibling',
        affectedStatus: 'carrier',
        fatherId: 'M002',
        motherId: 'M003',
        generation: 0,
        position: 1,
      },
    ],
  },
  'FAM002': {
    id: 'FAM002',
    name: '王氏家系',
    probandId: 'M101',
    disease: '智力发育迟缓',
    createdAt: '2024-12-18',
    updatedAt: '2024-12-22',
    members: [
      {
        id: 'M102',
        name: '王父',
        gender: 'male',
        birthYear: 1985,
        relation: 'father',
        affectedStatus: 'unaffected',
        spouseIds: ['M103'],
        generation: -1,
        position: 0,
      },
      {
        id: 'M103',
        sampleId: 'S2024120007',
        name: '王母',
        gender: 'female',
        birthYear: 1988,
        relation: 'mother',
        affectedStatus: 'carrier',
        spouseIds: ['M102'],
        generation: -1,
        position: 1,
      },
      {
        id: 'M101',
        sampleId: 'S2024120003',
        name: '王五',
        gender: 'male',
        birthYear: 2019,
        relation: 'proband',
        affectedStatus: 'affected',
        phenotypes: ['语言发育迟缓', '运动发育迟缓'],
        fatherId: 'M102',
        motherId: 'M103',
        generation: 0,
        position: 0,
      },
      {
        id: 'M104',
        name: '王弟',
        gender: 'male',
        birthYear: 2022,
        relation: 'sibling',
        affectedStatus: 'unaffected',
        fatherId: 'M102',
        motherId: 'M103',
        generation: 0,
        position: 1,
      },
    ],
  },
};

// 获取家系详情
export async function getPedigreeDetail(pedigreeId: string): Promise<Pedigree | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockPedigrees[pedigreeId] || null;
}

// 获取可用于添加到家系的样本列表
export async function getAvailableSamples(): Promise<{ id: string; name: string; gender: 'male' | 'female' | 'unknown' }[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [
    { id: 'S2024120001', name: '张三', gender: 'male' },
    { id: 'S2024120002', name: '李四', gender: 'female' },
    { id: 'S2024120003', name: '王五', gender: 'male' },
    { id: 'S2024120004', name: '赵六', gender: 'female' },
    { id: 'S2024120005', name: '孙七', gender: 'male' },
  ];
}
