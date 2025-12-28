import type { UserRole } from './user.types.js';

/**
 * Team entity representing a group of users
 */
export interface Team {
  /** Unique team identifier */
  id: string;
  /** Team display name */
  name: string;
  /** Team description */
  description: string;
  /** User ID of the team owner */
  ownerId: string;
  /** ISO 8601 timestamp when the team was created */
  createdAt: string;
}

/**
 * Team membership record
 */
export interface TeamMember {
  /** User ID of the team member */
  userId: string;
  /** Team ID */
  teamId: string;
  /** Member's role within the team */
  role: UserRole;
  /** ISO 8601 timestamp when the user joined the team */
  joinedAt: string;
}

/**
 * Permission types for resource access control
 */
export enum Permission {
  /** Read access */
  READ = 'READ',
  /** Write/modify access */
  WRITE = 'WRITE',
  /** Delete access */
  DELETE = 'DELETE',
  /** Full administrative access */
  ADMIN = 'ADMIN',
}

/**
 * Mapping of resource names to their allowed permissions
 */
export type ResourcePermission = Record<string, Permission[]>;
