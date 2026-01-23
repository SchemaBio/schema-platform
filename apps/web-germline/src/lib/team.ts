import { api } from './api';
import type {
  Team,
  TeamCreateRequest,
  TeamUpdateRequest,
  TeamMember,
  TeamMemberRequest,
} from '@/types/team';
import type { PaginatedResponse, QueryParams } from '@/types/common';

export const teamApi = {
  // 获取团队列表
  list: (params?: QueryParams) =>
    api.get<{ data: PaginatedResponse<Team> }>('/v1/teams', {
      params: params as Record<string, string>,
    }),

  // 获取单个团队
  get: (id: string) =>
    api.get<{ data: Team }>(`/v1/teams/${id}`),

  // 创建团队
  create: (data: TeamCreateRequest) =>
    api.post<{ data: Team }>('/v1/teams', data),

  // 更新团队
  update: (id: string, data: TeamUpdateRequest) =>
    api.put<{ data: Team }>(`/v1/teams/${id}`, data),

  // 删除团队
  delete: (id: string) =>
    api.delete(`/v1/teams/${id}`),
};
