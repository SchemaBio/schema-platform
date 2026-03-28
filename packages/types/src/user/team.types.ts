/**
 * Organization status
 */
export enum OrgStatus {
  /** Active organization */
  ACTIVE = 'ACTIVE',
  /** Suspended organization */
  SUSPENDED = 'SUSPENDED',
}

/**
 * Organization subscription plan
 */
export enum OrgPlan {
  /** Self-hosted deployment */
  SELF_HOSTED = 'SELF_HOSTED',
  /** Free tier */
  FREE = 'FREE',
  /** Professional tier */
  PRO = 'PRO',
  /** Enterprise tier */
  ENTERPRISE = 'ENTERPRISE',
}

/**
 * Organization entity representing a tenant
 */
export interface Organization {
  /** Unique organization identifier */
  id: string;
  /** Organization display name */
  name: string;
  /** URL-friendly identifier */
  slug: string;
  /** Organization description */
  description?: string;
  /** Organization status */
  status: OrgStatus;
  /** Subscription plan */
  plan: OrgPlan;
  /** Maximum number of users (-1 = unlimited) */
  maxUsers: number;
  /** ISO 8601 timestamp when the organization was created */
  createdAt: string;
  /** ISO 8601 timestamp when the organization was last updated */
  updatedAt: string;
}

/**
 * Organization membership record
 */
export interface OrgMember {
  /** User ID */
  userId: string;
  /** Organization ID */
  orgId: string;
  /** Member's role within the organization */
  orgRole: OrgRole;
  /** ISO 8601 timestamp when the user joined */
  joinedAt: string;
  /** User name (optional, populated when fetching members) */
  userName?: string;
  /** User email (optional, populated when fetching members) */
  userEmail?: string;
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