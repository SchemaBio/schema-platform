// 关系类型
export type RelationType =
  | 'proband'
  | 'father'
  | 'mother'
  | 'sibling'
  | 'child'
  | 'spouse'
  | 'grandfather_paternal'
  | 'grandmother_paternal'
  | 'grandfather_maternal'
  | 'grandmother_maternal'
  | 'uncle'
  | 'aunt'
  | 'cousin'
  | 'other';

// 患病状态
export type AffectedStatus = 'affected' | 'unaffected' | 'unknown' | 'carrier';

// 性别
export type Gender = 'male' | 'female' | 'unknown';

// 家系成员
export interface PedigreeMember {
  id: string;
  pedigreeId: string;
  sampleId?: string;
  name: string;
  gender: Gender;
  birthYear?: number;
  isDeceased: boolean;
  deceasedYear?: number;
  relation: RelationType;
  affectedStatus: AffectedStatus;
  phenotypes?: Record<string, unknown>;
  fatherId?: string;
  motherId?: string;
  generation: number;
  position: number;
  hasSample: boolean;
  createdAt: string;
  updatedAt: string;
}

// 家系信息
export interface Pedigree {
  id: string;
  name: string;
  disease?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

// 家系详情
export interface PedigreeDetail {
  id: string;
  name: string;
  disease?: string;
  note?: string;
  probandMemberId?: string;
  members: PedigreeMember[];
  createdAt: string;
  updatedAt: string;
}

// 创建家系请求
export interface PedigreeCreateRequest {
  name: string;
  disease?: string;
  note?: string;
}

// 更新家系请求
export interface PedigreeUpdateRequest {
  name?: string;
  disease?: string;
  note?: string;
}

// 创建家系成员请求
export interface PedigreeMemberCreateRequest {
  name: string;
  gender: Gender;
  birthYear?: number;
  isDeceased: boolean;
  deceasedYear?: number;
  relation: RelationType;
  affectedStatus: AffectedStatus;
  phenotypes?: Record<string, unknown>;
  fatherId?: string;
  motherId?: string;
  generation: number;
  position: number;
  sampleId?: string;
}

// 更新家系成员请求
export interface PedigreeMemberUpdateRequest {
  name?: string;
  gender?: Gender;
  birthYear?: number;
  isDeceased?: boolean;
  deceasedYear?: number;
  relation?: RelationType;
  affectedStatus?: AffectedStatus;
  phenotypes?: Record<string, unknown>;
  fatherId?: string;
  motherId?: string;
  generation?: number;
  position?: number;
  sampleId?: string;
}
