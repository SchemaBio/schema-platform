/**
 * User roles in the system
 */
export enum UserRole {
  /** System administrator with full access */
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
  /** User role determining permissions */
  role: UserRole;
  /** Team ID the user belongs to (null if not in a team) */
  teamId: string | null;
  /** ISO 8601 timestamp when the user was created */
  createdAt: string;
  /** ISO 8601 timestamp when the user was last updated */
  updatedAt: string;
}
