import type { Permission } from '@schema/types';

/**
 * Authentication error with error code
 */
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error for permission denied
 */
export class AuthorizationError extends Error {
  constructor(
    message: string,
    public resource: string,
    public permission: Permission
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Validation error with field-specific details
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public details: string[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Token expired error
 */
export class TokenExpiredError extends Error {
  constructor() {
    super('Token has expired');
    this.name = 'TokenExpiredError';
  }
}

/**
 * Create user request payload
 */
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  teamId?: string;
}

/**
 * Update user request payload
 */
export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

/**
 * Change password request payload
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Create team request payload
 */
export interface CreateTeamRequest {
  name: string;
  description?: string;
}

/**
 * Update team request payload
 */
export interface UpdateTeamRequest {
  name?: string;
  description?: string;
}

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Email validation result
 */
export interface EmailValidationResult {
  valid: boolean;
  error?: string;
}
