// 用户信息
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'DOCTOR' | 'ANALYST' | 'VIEWER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 登录请求
export interface LoginRequest {
  email: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// 刷新 Token 请求
export interface RefreshTokenRequest {
  refreshToken: string;
}

// 刷新 Token 响应
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
