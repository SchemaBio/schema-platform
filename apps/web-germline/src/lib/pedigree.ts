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

export const pedigreeApi = {
  // 获取家系列表
  list: (params?: QueryParams) =>
    api.get<{ data: PaginatedResponse<Pedigree> }>('/v1/pedigrees', {
      params: params as Record<string, string>,
    }),

  // 获取单个家系详情
  get: (id: string) =>
    api.get<{ data: PedigreeDetail }>(`/v1/pedigrees/${id}`),

  // 创建家系
  create: (data: PedigreeCreateRequest) =>
    api.post<{ data: Pedigree }>('/v1/pedigrees', data),

  // 更新家系
  update: (id: string, data: PedigreeUpdateRequest) =>
    api.put<{ data: Pedigree }>(`/v1/pedigrees/${id}`, data),

  // 删除家系
  delete: (id: string) =>
    api.delete(`/v1/pedigrees/${id}`),

  // 设置先证者
  setProband: (pedigreeId: string, memberId: string) =>
    api.put<{ data: PedigreeDetail }>(`/v1/pedigrees/${pedigreeId}/proband/${memberId}`, {}),
};

export const pedigreeMemberApi = {
  // 获取家系成员列表
  list: (pedigreeId: string) =>
    api.get<{ data: PedigreeMember[] }>(`/v1/pedigrees/${pedigreeId}/members`),

  // 获取单个成员
  get: (pedigreeId: string, memberId: string) =>
    api.get<{ data: PedigreeMember }>(`/v1/pedigrees/${pedigreeId}/members/${memberId}`),

  // 创建成员
  create: (pedigreeId: string, data: PedigreeMemberCreateRequest) =>
    api.post<{ data: PedigreeMember }>(`/v1/pedigrees/${pedigreeId}/members`, data),

  // 更新成员
  update: (pedigreeId: string, memberId: string, data: PedigreeMemberUpdateRequest) =>
    api.put<{ data: PedigreeMember }>(`/v1/pedigrees/${pedigreeId}/members/${memberId}`, data),

  // 删除成员
  delete: (pedigreeId: string, memberId: string) =>
    api.delete(`/v1/pedigrees/${pedigreeId}/members/${memberId}`),
};
