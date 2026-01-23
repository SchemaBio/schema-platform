import { api } from './api';
import type {
  GeneList,
  GeneListCreateRequest,
  GeneListUpdateRequest,
} from '@/types/geneList';
import type { PaginatedResponse, QueryParams } from '@/types/common';

export const geneListApi = {
  // 获取基因列表
  list: (params?: QueryParams) =>
    api.get<{ data: PaginatedResponse<GeneList> }>('/v1/gene-lists', {
      params: params as Record<string, string>,
    }),

  // 获取单个基因列表
  get: (id: string) =>
    api.get<{ data: GeneList }>(`/v1/gene-lists/${id}`),

  // 创建基因列表
  create: (data: GeneListCreateRequest) =>
    api.post<{ data: GeneList }>('/v1/gene-lists', data),

  // 更新基因列表
  update: (id: string, data: GeneListUpdateRequest) =>
    api.put<{ data: GeneList }>(`/v1/gene-lists/${id}`, data),

  // 删除基因列表
  delete: (id: string) =>
    api.delete(`/v1/gene-lists/${id}`),
};
