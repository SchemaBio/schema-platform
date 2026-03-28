import type { Pedigree, PedigreeListItem, PedigreeMember } from './types';

// 生成UUID的辅助函数
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Mock 家系列表（使用UUID）
export const mockPedigreeList: PedigreeListItem[] = [
  {
    id: 'f1a2b3c4-d5e6-7890-abcd-ef1234567890',
    internalId: 'FAM-001',
    sampleIds: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f678-90ab-cdef-123456789012'],
    sampleInternalIds: ['INT-001', 'INT-002'],
    probandSampleId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    probandSampleInternalId: 'INT-001',
    probandIndex: 0,
    batch: 'BATCH-2024-001',
    clinicalDiagnosis: '遗传性心肌病待查',
    remark: '家系中有明确的心血管疾病遗传史',
    createdAt: '2024-12-15 10:30:00',
    updatedAt: '2024-12-25 14:22:00',
  },
  {
    id: 'f2b3c4d5-e6f7-8901-bcde-f23456789012',
    internalId: 'FAM-002',
    sampleIds: ['c3d4e5f6-7890-abcd-ef12-345678901234'],
    sampleInternalIds: ['INT-003'],
    probandSampleId: 'c3d4e5f6-7890-abcd-ef12-345678901234',
    probandSampleInternalId: 'INT-003',
    probandIndex: 0,
    batch: 'BATCH-2024-002',
    clinicalDiagnosis: '智力发育迟缓',
    remark: '',
    createdAt: '2024-12-18 09:15:00',
    updatedAt: '2024-12-22 16:40:00',
  },
  {
    id: 'f3c4d5e6-f789-0123-cdef-345678901234',
    internalId: 'FAM-003',
    sampleIds: ['e5f67890-abcd-ef12-3456-789012345678'],
    sampleInternalIds: ['INT-005'],
    probandSampleId: 'e5f67890-abcd-ef12-3456-789012345678',
    probandSampleInternalId: 'INT-005',
    probandIndex: 0,
    batch: 'BATCH-2024-003',
    clinicalDiagnosis: '肥厚型心肌病',
    remark: '待补充家系信息',
    createdAt: '2024-12-20 11:45:00',
    updatedAt: '2024-12-24 08:30:00',
  },
];

// Mock 家系详情
const mockPedigrees: Record<string, Pedigree> = {
  'f1a2b3c4-d5e6-7890-abcd-ef1234567890': {
    id: 'f1a2b3c4-d5e6-7890-abcd-ef1234567890',
    internalId: 'FAM-001',
    probandId: 'm1a2b3c4-d5e6-7890-abcd-ef1234567890',
    probandSampleId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    clinicalDiagnosis: '遗传性心肌病待查',
    batch: 'BATCH-2024-001',
    remark: '家系中有明确的心血管疾病遗传史',
    createdAt: '2024-12-15 10:30:00',
    updatedAt: '2024-12-25 14:22:00',
    note: '家系中有明确的心血管疾病遗传史，建议进行全外显子组测序',
    members: [
      // 第-2代（祖父母）
      {
        id: 'm5a6b7c8-d9e0-1234-abcd-ef5678901234',
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
        id: 'm6b7c8d9-e0f1-2345-bcde-f67890123456',
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
        id: 'm2a3b4c5-d6e7-8901-abcd-ef2345678901',
        sampleId: 'b2c3d4e5-f678-90ab-cdef-123456789012',
        name: '父亲',
        gender: 'male',
        birthYear: 1968,
        relation: 'father',
        affectedStatus: 'affected',
        phenotypes: ['心肌病', '心律不齐'],
        fatherId: 'm5a6b7c8-d9e0-1234-abcd-ef5678901234',
        motherId: 'm6b7c8d9-e0f1-2345-bcde-f67890123456',
        spouseIds: ['m3b4c5d6-e7f8-9012-cdef-012345678912'],
        generation: -1,
        position: 0,
      },
      {
        id: 'm3b4c5d6-e7f8-9012-cdef-012345678912',
        name: '母亲',
        gender: 'female',
        birthYear: 1970,
        relation: 'mother',
        affectedStatus: 'unaffected',
        spouseIds: ['m2a3b4c5-d6e7-8901-abcd-ef2345678901'],
        generation: -1,
        position: 1,
      },
      // 第0代（先证者及兄弟姐妹）
      {
        id: 'm1a2b3c4-d5e6-7890-abcd-ef1234567890',
        sampleId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: '先证者',
        gender: 'male',
        birthYear: 1996,
        relation: 'proband',
        affectedStatus: 'affected',
        phenotypes: ['心悸', '胸闷', '运动后气短'],
        fatherId: 'm2a3b4c5-d6e7-8901-abcd-ef2345678901',
        motherId: 'm3b4c5d6-e7f8-9012-cdef-012345678912',
        generation: 0,
        position: 0,
      },
      {
        id: 'm4c5d6e7-f890-1234-def0-123456789012',
        name: '妹妹',
        gender: 'female',
        birthYear: 1999,
        relation: 'sibling',
        affectedStatus: 'carrier',
        fatherId: 'm2a3b4c5-d6e7-8901-abcd-ef2345678901',
        motherId: 'm3b4c5d6-e7f8-9012-cdef-012345678912',
        generation: 0,
        position: 1,
      },
    ],
  },
  'f2b3c4d5-e6f7-8901-bcde-f23456789012': {
    id: 'f2b3c4d5-e6f7-8901-bcde-f23456789012',
    internalId: 'FAM-002',
    probandId: 'm1b2c3d4-e5f6-7890-bcde-f12345678901',
    probandSampleId: 'c3d4e5f6-7890-abcd-ef12-345678901234',
    clinicalDiagnosis: '智力发育迟缓',
    batch: 'BATCH-2024-002',
    remark: '',
    createdAt: '2024-12-18 09:15:00',
    updatedAt: '2024-12-22 16:40:00',
    members: [
      {
        id: 'm2b3c4d5-e6f7-8901-bcde-f23456789012',
        name: '父亲',
        gender: 'male',
        birthYear: 1985,
        relation: 'father',
        affectedStatus: 'unaffected',
        spouseIds: ['m3c4d5e6-f789-0123-cdef-345678901234'],
        generation: -1,
        position: 0,
      },
      {
        id: 'm3c4d5e6-f789-0123-cdef-345678901234',
        name: '母亲',
        gender: 'female',
        birthYear: 1988,
        relation: 'mother',
        affectedStatus: 'carrier',
        spouseIds: ['m2b3c4d5-e6f7-8901-bcde-f23456789012'],
        generation: -1,
        position: 1,
      },
      {
        id: 'm1b2c3d4-e5f6-7890-bcde-f12345678901',
        sampleId: 'c3d4e5f6-7890-abcd-ef12-345678901234',
        name: '先证者',
        gender: 'male',
        birthYear: 2019,
        relation: 'proband',
        affectedStatus: 'affected',
        phenotypes: ['语言发育迟缓', '运动发育迟缓'],
        fatherId: 'm2b3c4d5-e6f7-8901-bcde-f23456789012',
        motherId: 'm3c4d5e6-f789-0123-cdef-345678901234',
        generation: 0,
        position: 0,
      },
      {
        id: 'm4d5e6f7-8901-2345-def0-456789012345',
        name: '弟弟',
        gender: 'male',
        birthYear: 2022,
        relation: 'sibling',
        affectedStatus: 'unaffected',
        fatherId: 'm2b3c4d5-e6f7-8901-bcde-f23456789012',
        motherId: 'm3c4d5e6-f789-0123-cdef-345678901234',
        generation: 0,
        position: 1,
      },
    ],
  },
  'f3c4d5e6-f789-0123-cdef-345678901234': {
    id: 'f3c4d5e6-f789-0123-cdef-345678901234',
    internalId: 'FAM-003',
    probandId: 'm1c2d3e4-f567-8901-cdef-123456789012',
    probandSampleId: 'e5f67890-abcd-ef12-3456-789012345678',
    clinicalDiagnosis: '肥厚型心肌病',
    batch: 'BATCH-2024-003',
    remark: '待补充家系信息',
    createdAt: '2024-12-20 11:45:00',
    updatedAt: '2024-12-24 08:30:00',
    members: [
      {
        id: 'm2c3d4e5-f678-9012-cdef-234567890123',
        name: '父亲',
        gender: 'male',
        birthYear: 1980,
        relation: 'father',
        affectedStatus: 'unaffected',
        spouseIds: ['m3d4e5f6-7890-1234-def0-345678901234'],
        generation: -1,
        position: 0,
      },
      {
        id: 'm3d4e5f6-7890-1234-def0-345678901234',
        name: '母亲',
        gender: 'female',
        birthYear: 1982,
        relation: 'mother',
        affectedStatus: 'carrier',
        spouseIds: ['m2c3d4e5-f678-9012-cdef-234567890123'],
        generation: -1,
        position: 1,
      },
      {
        id: 'm1c2d3e4-f567-8901-cdef-123456789012',
        sampleId: 'e5f67890-abcd-ef12-3456-789012345678',
        name: '先证者',
        gender: 'male',
        birthYear: 2015,
        relation: 'proband',
        affectedStatus: 'affected',
        phenotypes: ['听力损失', '语言发育迟缓'],
        fatherId: 'm2c3d4e5-f678-9012-cdef-234567890123',
        motherId: 'm3d4e5f6-7890-1234-def0-345678901234',
        generation: 0,
        position: 0,
      },
    ],
  },
};

// 获取家系详情
export async function getPedigreeDetail(pedigreeId: string): Promise<Pedigree | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockPedigrees[pedigreeId] || null;
}

// 生成新的家系UUID
export function generatePedigreeUUID(): string {
  return generateUUID();
}

// 生成新的成员UUID
export function generateMemberUUID(): string {
  return generateUUID();
}

// 获取可用于添加到家系的样本列表（从 /samples 导入）
export async function getAvailableSamples(): Promise<{ id: string; internalId: string; gender: 'male' | 'female' | 'unknown' }[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  // 从 samples mock-data 导入
  const { mockSamples } = await import('../mock-data');
  return mockSamples.map((s: { id: string; internalId: string; gender: 'male' | 'female' | 'unknown' }) => ({
    id: s.id,
    internalId: s.internalId,
    gender: s.gender,
  }));
}