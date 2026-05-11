import { api, setAuthTokens, clearAuthTokens } from './api';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
    RefreshTokenResponse,
} from '@/types/auth';
import type { Organization } from '@/types/user';

interface BackendLoginData {
  user: {
    id: string;
    email: string;
    name: string;
    system_role: string;
    primary_org_id?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    org_role: string;
    joined_at: string;
  }>;
  current_org?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    org_role: string;
    joined_at: string;
  };
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

function mapLoginResponse(data: BackendLoginData): LoginResponse {
  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      systemRole: data.user.system_role as 'SUPER_ADMIN' | 'USER',
      primaryOrgId: data.user.primary_org_id,
      isActive: data.user.is_active,
      createdAt: data.user.created_at,
      updatedAt: data.user.updated_at,
    },
    organizations: data.organizations.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      description: org.description,
      orgRole: org.org_role as 'OWNER' | 'ADMIN' | 'DOCTOR' | 'ANALYST' | 'VIEWER',
      joinedAt: org.joined_at,
    })),
    currentOrg: data.current_org
      ? {
          id: data.current_org.id,
          name: data.current_org.name,
          slug: data.current_org.slug,
          description: data.current_org.description,
          orgRole: data.current_org.org_role as 'OWNER' | 'ADMIN' | 'DOCTOR' | 'ANALYST' | 'VIEWER',
          joinedAt: data.current_org.joined_at,
        }
      : undefined,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
  };
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const backendData = await api.post<BackendLoginData>(
      '/v1/auth/login',
      data
    );
    const response = mapLoginResponse(backendData);
    setAuthTokens(response.accessToken, response.refreshToken);
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
    const backendData = await api.post<{
      access_token: string;
      refresh_token: string;
      expires_at: string;
    }>('/v1/auth/refresh', { refresh_token: data.refreshToken });
    const response: RefreshTokenResponse = {
      accessToken: backendData.access_token,
      refreshToken: backendData.refresh_token,
      expiresAt: backendData.expires_at,
    };
    setAuthTokens(response.accessToken, response.refreshToken);
    return response;
  },

  switchOrganization: async (orgId: string): Promise<Organization> => {
    const backendData = await api.post<{
      id: string;
      name: string;
      slug: string;
      description?: string;
      org_role: string;
      joined_at: string;
    }>('/v1/orgs/switch', { org_id: orgId });
    return {
      id: backendData.id,
      name: backendData.name,
      slug: backendData.slug,
      description: backendData.description,
    };
  },

  getUserOrganizations: async (): Promise<{ organizations: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    orgRole: string;
    joinedAt: string;
  }> }> => {
    const backendData = await api.get<{ organizations: Array<{
      id: string;
      name: string;
      slug: string;
      description?: string;
      org_role: string;
      joined_at: string;
    }> }>('/v1/orgs');
    return {
      organizations: backendData.organizations.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        description: org.description,
        orgRole: org.org_role as 'OWNER' | 'ADMIN' | 'DOCTOR' | 'ANALYST' | 'VIEWER',
        joinedAt: org.joined_at,
      })),
    };
  },
};
