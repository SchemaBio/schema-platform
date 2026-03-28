import type { Pedigree, PedigreeListItem, PedigreeMember } from './types';

// Mock 家系列表
export const mockPedigreeList: PedigreeListItem[] = [
  {
    id: 'FAM001',
    name: 'FAM001',
    memberCount: 6,
    sampledCount: 3,
    sampleIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f678-90ab-cdef-123456789012'],
    probandSampleId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    probandInternalId: 'INT-001',
    disease: '遗传性心肌病',
    createdAt: '2024-12-15',
    updatedAt: '2024-12-25',
  },
  {
    id: 'FAM002',
    name: 'FAM002',
    memberCount: 4,
    sampledCount: 2,
    sampleIds: ['c3d4e5f6-7890-abcd-ef12-345678901234'],
    probandSampleId: 'c3d4e5f6-7890-abcd-ef12-345678901234',
    probandInternalId: 'INT-003',
    disease: '智力发育迟缓',
    createdAt: '2024-12-18',
    updatedAt: '2024-12-22',
  },
  {
    id: 'FAM003',
    name: 'FAM003',
    memberCount: 3,
    sampledCount: 1,
    sampleIds: ['e5f67890-abcd-ef12-3456-789012345678'],
    probandSampleId: 'e5f67890-abcd-ef12-3456-789012345678',
    probandInternalId: 'INT-005',
    disease: '遗传性耳聋',
    createdAt: '2024-12-20',
    updatedAt: '2024-12-24',
  },
];

// Mock 家系详情
const mockPedigrees: Record<string, Pedigree> = {
  'FAM001': {
    id: 'FAM001',
    name: 'FAM001',
    probandId: 'M001',
    disease: '遗传性心肌病',
    createdAt: '2024-12-15',
    updatedAt: '2024-12-25',
    note: '家系中有明确的心血管疾病遗传史，建议进行全外显子组测序',
    members: [
      // 第-2代（祖父母）
      {
        id: 'M005',
        name: '祖父',
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
        name: '祖母',
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
        sampleId: 'b2c3d4e5-f678-90ab-cdef-123456789012',
        name: '父亲',
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
        name: '母亲',
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
        sampleId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: '先证者',
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
        name: '妹妹',
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
    name: 'FAM002',
    probandId: 'M101',
    disease: '智力发育迟缓',
    createdAt: '2024-12-18',
    updatedAt: '2024-12-22',
    members: [
      {
        id: 'M102',
        name: '父亲',
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
        name: '母亲',
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
        sampleId: 'c3d4e5f6-7890-abcd-ef12-345678901234',
        name: '先证者',
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
        name: '弟弟',
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
export async function getAvailableSamples(): Promise<{ id: string; internalId: string; gender: 'male' | 'female' | 'unknown' }[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [
    { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', internalId: 'INT-001', gender: 'male' },
    { id: 'b2c3d4e5-f678-90ab-cdef-123456789012', internalId: 'INT-002', gender: 'male' },
    { id: 'c3d4e5f6-7890-abcd-ef12-345678901234', internalId: 'INT-003', gender: 'male' },
    { id: 'd4e5f678-90ab-cdef-1234-567890123456', internalId: 'INT-004', gender: 'female' },
    { id: 'e5f67890-abcd-ef12-3456-789012345678', internalId: 'INT-005', gender: 'male' },
  ];
}
