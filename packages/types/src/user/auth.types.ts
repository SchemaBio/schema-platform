import type { User } from './user.types.js';

/**
 * Authentication token pair for JWT-based auth
 */
export interface AuthToken {
  /** JWT access token for API requests */
  accessToken: string;
  /** Refresh token for obtaining new access tokens */
  refreshToken: string;
  /** ISO 8601 timestamp when the access token expires */
  expiresAt: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  /** User email address */
  email: string;
  /** User password */
  password: string;
}

/**
 * Login response containing tokens and user info
 */
export interface LoginResponse extends AuthToken {
  /** Authenticated user information */
  user: User;
}
