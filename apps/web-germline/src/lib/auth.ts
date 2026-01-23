import { api, setAuthTokens, clearAuthTokens } from './api';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@/types/auth';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<{ data: LoginResponse }>(
      '/v1/auth/login',
      data
    );
    const { accessToken, refreshToken } = response.data;
    setAuthTokens(accessToken, refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
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
    const response = await api.post<{ data: RefreshTokenResponse }>(
      '/v1/auth/refresh',
      data
    );
    const { accessToken, refreshToken } = response.data;
    setAuthTokens(accessToken, refreshToken);
    return response.data;
  },
};
