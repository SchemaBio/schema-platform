import { api } from './api';
import type {
  Pedigree,
  PedigreeDetail,
  PedigreeCreateRequest,
  PedigreeUpdateRequest,
  PedigreeMember,
  PedigreeMemberCreateRequest,
  PedigreeMemberUpdateRequest,
} from '@/types/pedigree';
import type { PaginatedResponse, QueryParams } from '@/types/common';

interface BackendPaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface BackendPedigree {
  id: string;
  name: string;
  disease?: string;
  note?: string;
  member_count?: number;
  proband_member_id?: string;
  created_at: string;
  updated_at: string;
}

interface BackendPedigreeMember {
  id: string;
  pedigree_id: string;
  sample_id?: string;
  name: string;
  gender: string;
  birth_year?: number;
  is_deceased: boolean;
  deceased_year?: number;
  relation: string;
  affected_status: string;
  phenotypes?: Record<string, unknown>;
  father_id?: string;
  mother_id?: string;
  generation: number;
  position: number;
  has_sample: boolean;
  created_at: string;
  updated_at: string;
}

interface BackendPedigreeDetail {
  id: string;
  name: string;
  disease?: string;
  note?: string;
  proband_member_id?: string;
  members: BackendPedigreeMember[];
  created_at: string;
  updated_at: string;
}

function mapMember(m: BackendPedigreeMember): PedigreeMember {
  return {
    id: m.id,
    pedigreeId: m.pedigree_id,
    sampleId: m.sample_id,
    name: m.name,
    gender: m.gender as PedigreeMember['gender'],
    birthYear: m.birth_year,
    isDeceased: m.is_deceased,
    deceasedYear: m.deceased_year,
    relation: m.relation as PedigreeMember['relation'],
    affectedStatus: m.affected_status as PedigreeMember['affectedStatus'],
    phenotypes: m.phenotypes,
    fatherId: m.father_id,
    motherId: m.mother_id,
    generation: m.generation,
    position: m.position,
    hasSample: m.has_sample,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
  };
}

function mapPedigree(p: BackendPedigree): Pedigree {
  return {
    id: p.id,
    name: p.name,
    disease: p.disease,
    memberCount: p.member_count ?? 0,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

function mapPedigreeDetail(d: BackendPedigreeDetail): PedigreeDetail {
  return {
    id: d.id,
    name: d.name,
    disease: d.disease,
    note: d.note,
    probandMemberId: d.proband_member_id,
    members: d.members.map(mapMember),
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

function mapPaginated<T, U>(data: BackendPaginatedData<T>, mapper: (item: T) => U): PaginatedResponse<U> {
  return {
    items: data.items.map(mapper),
    total: data.total,
    page: data.page,
    pageSize: data.page_size,
    totalPages: data.total_pages,
  };
}

export const pedigreeApi = {
  list: async (params?: QueryParams): Promise<PaginatedResponse<Pedigree>> => {
    const data = await api.get<BackendPaginatedData<BackendPedigree>>('/v1/pedigrees', {
      params: params as Record<string, string>,
    });
    return mapPaginated(data, mapPedigree);
  },

  get: async (id: string): Promise<PedigreeDetail> => {
    const data = await api.get<BackendPedigreeDetail>(`/v1/pedigrees/${id}`);
    return mapPedigreeDetail(data);
  },

  create: async (data: PedigreeCreateRequest): Promise<Pedigree> => {
    const result = await api.post<BackendPedigree>('/v1/pedigrees', data);
    return mapPedigree(result);
  },

  update: async (id: string, data: PedigreeUpdateRequest): Promise<Pedigree> => {
    const result = await api.put<BackendPedigree>(`/v1/pedigrees/${id}`, data);
    return mapPedigree(result);
  },

  delete: (id: string) => api.delete(`/v1/pedigrees/${id}`),

  setProband: async (pedigreeId: string, memberId: string): Promise<PedigreeDetail> => {
    const data = await api.put<BackendPedigreeDetail>(`/v1/pedigrees/${pedigreeId}/proband/${memberId}`, {});
    return mapPedigreeDetail(data);
  },
};

export const pedigreeMemberApi = {
  list: async (pedigreeId: string): Promise<PedigreeMember[]> => {
    const data = await api.get<BackendPedigreeMember[]>(`/v1/pedigrees/${pedigreeId}/members`);
    return data.map(mapMember);
  },

  get: async (pedigreeId: string, memberId: string): Promise<PedigreeMember> => {
    const data = await api.get<BackendPedigreeMember>(`/v1/pedigrees/${pedigreeId}/members/${memberId}`);
    return mapMember(data);
  },

  create: async (pedigreeId: string, data: PedigreeMemberCreateRequest): Promise<PedigreeMember> => {
    const payload = {
      ...data,
      birth_year: data.birthYear,
      is_deceased: data.isDeceased,
      deceased_year: data.deceasedYear,
      affected_status: data.affectedStatus,
      father_id: data.fatherId,
      mother_id: data.motherId,
      sample_id: data.sampleId,
    };
    // Remove camelCase fields
    delete (payload as any).birthYear;
    delete (payload as any).isDeceased;
    delete (payload as any).deceasedYear;
    delete (payload as any).affectedStatus;
    delete (payload as any).fatherId;
    delete (payload as any).motherId;
    delete (payload as any).sampleId;
    const result = await api.post<BackendPedigreeMember>(`/v1/pedigrees/${pedigreeId}/members`, payload);
    return mapMember(result);
  },

  update: async (pedigreeId: string, memberId: string, data: PedigreeMemberUpdateRequest): Promise<PedigreeMember> => {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.gender !== undefined) payload.gender = data.gender;
    if (data.birthYear !== undefined) payload.birth_year = data.birthYear;
    if (data.isDeceased !== undefined) payload.is_deceased = data.isDeceased;
    if (data.deceasedYear !== undefined) payload.deceased_year = data.deceasedYear;
    if (data.relation !== undefined) payload.relation = data.relation;
    if (data.affectedStatus !== undefined) payload.affected_status = data.affectedStatus;
    if (data.phenotypes !== undefined) payload.phenotypes = data.phenotypes;
    if (data.fatherId !== undefined) payload.father_id = data.fatherId;
    if (data.motherId !== undefined) payload.mother_id = data.motherId;
    if (data.generation !== undefined) payload.generation = data.generation;
    if (data.position !== undefined) payload.position = data.position;
    if (data.sampleId !== undefined) payload.sample_id = data.sampleId;
    const result = await api.put<BackendPedigreeMember>(`/v1/pedigrees/${pedigreeId}/members/${memberId}`, payload);
    return mapMember(result);
  },

  delete: (pedigreeId: string, memberId: string) =>
    api.delete(`/v1/pedigrees/${pedigreeId}/members/${memberId}`),
};
