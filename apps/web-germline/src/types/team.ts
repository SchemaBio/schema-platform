import type { UserRole, User } from './user';

// 团队信息
export interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// 创建团队请求
export interface TeamCreateRequest {
  name: string;
  description?: string;
}

// 更新团队请求
export interface TeamUpdateRequest {
  name?: string;
  description?: string;
}

// 团队成员
export interface TeamMember {
  userId: string;
  teamId: string;
  role: UserRole;
  joinedAt: string;
  user?: User;
}

// 添加成员请求
export interface TeamMemberRequest {
  userId: string;
  role: UserRole;
}
