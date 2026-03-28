import { api, setAuthTokens, clearAuthTokens } from './api';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  SwitchOrganizationRequest,
} from '@/types/auth';
import type { Organization } from '@/types/user';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(
      '/v1/auth/login',
      data
    );
    const { accessToken, refreshToken } = response;
    setAuthTokens(accessToken, refreshToken);
    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/v1/auth/logout');
    } finally {
      clearAuthTokens();
    }
  },

  refreshToken: async (
    data: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>(
      '/v1/auth/refresh',
      data
    );
    const { accessToken, refreshToken } = response;
    setAuthTokens(accessToken, refreshToken);
    return response;
  },

  switchOrganization: async (orgId: string): Promise<Organization> => {
    const data: SwitchOrganizationRequest = { orgId };
    const response = await api.post<Organization>(
      '/v1/orgs/switch',
      data
    );
    return response;
  },

  getUserOrganizations: async (): Promise<{ organizations: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    orgRole: string;
    joinedAt: string;
  }> }> => {
    const response = await api.get<{ organizations: Array<{
      id: string;
      name: string;
      slug: string;
      description?: string;
      orgRole: string;
      joinedAt: string;
    }> }>('/v1/orgs');
    return response;
  },
};