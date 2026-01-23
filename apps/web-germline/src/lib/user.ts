import { api } from './api';
import type {
  User,
  UserCreateRequest,
  UserUpdateRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
} from '@/types/user';
import type { PaginatedResponse, QueryParams } from '@/types/common';

export const userApi = {
  // 获取用户列表
  list: (params?: QueryParams) =>
    api.get<{ data: PaginatedResponse<User> }>('/v1/users', { params: params as Record<string, string> }),

  // 获取单个用户
  get: (id: string) =>
    api.get<{ data: User }>(`/v1/users/${id}`),

  // 获取当前用户
  me: () =>
    api.get<{ data: User }>('/v1/users/me'),

  // 创建用户
  create: (data: UserCreateRequest) =>
    api.post<{ data: User }>('/v1/users', data),

  // 更新用户
  update: (id: string, data: UserUpdateRequest) =>
    api.put<{ data: User }>(`/v1/users/${id}`, data),

  // 删除用户
  delete: (id: string) =>
    api.delete(`/v1/users/${id}`),
};
