// System-level roles
export type SystemRole = 'SUPER_ADMIN' | 'USER';

// Organization-level roles
export type OrgRole = 'OWNER' | 'ADMIN' | 'DOCTOR' | 'ANALYST' | 'VIEWER';

// 用户信息
export interface User {
  id: string;
  email: string;
  name: string;
  systemRole: SystemRole;
  primaryOrgId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Organization info for user
export interface UserOrganizationInfo {
  id: string;
  name: string;
  slug: string;
  description?: string;
  orgRole: OrgRole;
  joinedAt: string;
}

// 创建用户请求
export interface UserCreateRequest {
  email: string;
  name: string;
  password: string;
  systemRole?: SystemRole;
  primaryOrgId?: string;
}

// 更新用户请求
export interface UserUpdateRequest {
  name?: string;
  systemRole?: SystemRole;
  primaryOrgId?: string;
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