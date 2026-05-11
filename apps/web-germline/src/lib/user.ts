import { api } from './api';
import type {
  User,
  UserCreateRequest,
  UserUpdateRequest,
} from '@/types/user';
import type { PaginatedResponse, QueryParams } from '@/types/common';

interface BackendPaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface BackendUser {
  id: string;
  email: string;
  name: string;
  system_role: string;
  primary_org_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function mapUser(u: BackendUser): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    systemRole: u.system_role as 'SUPER_ADMIN' | 'USER',
    primaryOrgId: u.primary_org_id,
    isActive: u.is_active,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
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

export const userApi = {
  list: async (params?: QueryParams): Promise<PaginatedResponse<User>> => {
    const data = await api.get<BackendPaginatedData<BackendUser>>('/v1/users', {
      params: params as Record<string, string>,
    });
    return mapPaginated(data, mapUser);
  },

  get: async (id: string): Promise<User> => {
    const data = await api.get<BackendUser>(`/v1/users/${id}`);
    return mapUser(data);
  },

  me: async (): Promise<User> => {
    const data = await api.get<BackendUser>('/v1/auth/me');
    return mapUser(data);
  },

  create: async (data: UserCreateRequest): Promise<User> => {
    const result = await api.post<BackendUser>('/v1/users', data);
    return mapUser(result);
  },

  update: async (id: string, data: UserUpdateRequest): Promise<User> => {
    const result = await api.put<BackendUser>(`/v1/users/${id}`, data);
    return mapUser(result);
  },

  delete: (id: string) => api.delete(`/v1/users/${id}`),
};
