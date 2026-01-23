// 用户角色
export type UserRole = 'ADMIN' | 'DOCTOR' | 'ANALYST' | 'VIEWER';

// 用户信息
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  teamId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 创建用户请求
export interface UserCreateRequest {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}

// 更新用户请求
export interface UserUpdateRequest {
  name?: string;
  role?: UserRole;
}

// 修改密码请求
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// 重置密码请求
export interface ResetPasswordRequest {
  newPassword: string;
}
