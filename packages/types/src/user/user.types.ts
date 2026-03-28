/**
 * System-level roles
 */
export enum SystemRole {
  /** Platform super admin with full access across all organizations */
  SUPER_ADMIN = 'SUPER_ADMIN',
  /** Regular user */
  USER = 'USER',
}

/**
 * Organization-level roles
 */
export enum OrgRole {
  /** Organization owner with full control */
  OWNER = 'OWNER',
  /** Organization admin */
  ADMIN = 'ADMIN',
  /** Medical doctor with clinical access */
  DOCTOR = 'DOCTOR',
  /** Data analyst with analysis access */
  ANALYST = 'ANALYST',
  /** Read-only viewer */
  VIEWER = 'VIEWER',
}

/**
 * User entity representing a system user
 */
export interface User {
  /** Unique user identifier */
  id: string;
  /** User email address (unique) */
  email: string;
  /** User display name */
  name: string;
  /** User system-level role */
  systemRole: SystemRole;
  /** Primary organization ID */
  primaryOrgId?: string;
  /** Whether the user account is active */
  isActive: boolean;
  /** ISO 8601 timestamp when the user was created */
  createdAt: string;
  /** ISO 8601 timestamp when the user was last updated */
  updatedAt: string;
}

/**
 * Organization membership info for a user
 */
export interface UserOrganizationInfo {
  /** Organization ID */
  id: string;
  /** Organization name */
  name: string;
  /** Organization slug (URL identifier) */
  slug: string;
  /** Organization description */
  description?: string;
  /** User's role in this organization */
  orgRole: OrgRole;
  /** ISO 8601 timestamp when the user joined */
  joinedAt: string;
}