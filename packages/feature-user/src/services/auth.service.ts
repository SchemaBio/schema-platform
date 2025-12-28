import type { LoginRequest, LoginResponse, AuthToken } from '@schema/types';
import { AuthenticationError } from '../types.js';
import { isTokenExpiring } from '../utils/token.js';

/**
 * Auth service configuration
 */
export interface AuthServiceConfig {
  /** Base URL for auth API endpoints */
  baseUrl: string;
  /** Milliseconds before expiry to trigger refresh (default: 5 minutes) */
  tokenRefreshThreshold?: number;
}

/**
 * Auth service interface
 */
export interface AuthService {
  login(credentials: LoginRequest): Promise<LoginResponse>;
  logout(): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthToken>;
  isTokenExpiring(expiresAt: string, threshold?: number): boolean;
}

/**
 * Default refresh threshold (5 minutes)
 */
const DEFAULT_REFRESH_THRESHOLD = 5 * 60 * 1000;

/**
 * Create auth service instance
 */
export function createAuthService(config: AuthServiceConfig): AuthService {
  const { baseUrl, tokenRefreshThreshold = DEFAULT_REFRESH_THRESHOLD } = config;

  // Refresh lock to prevent concurrent refresh calls
  let refreshPromise: Promise<AuthToken> | null = null;

  /**
   * Authenticate user with credentials
   */
  async function login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new AuthenticationError(
        error.message || 'Invalid credentials',
        error.code || 'INVALID_CREDENTIALS'
      );
    }

    return response.json() as Promise<LoginResponse>;
  }

  /**
   * Invalidate current session
   */
  async function logout(): Promise<void> {
    try {
      await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore logout errors - we'll clear local state anyway
    }
  }

  /**
   * Refresh access token using refresh token
   * Uses lock to prevent concurrent refresh calls
   */
  async function refreshTokenFn(refreshToken: string): Promise<AuthToken> {
    // If refresh is already in progress, wait for it
    if (refreshPromise) {
      return refreshPromise;
    }

    // Start new refresh
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new AuthenticationError(
            error.message || 'Token refresh failed',
            error.code || 'REFRESH_FAILED'
          );
        }

        return response.json() as Promise<AuthToken>;
      } finally {
        // Clear lock after completion
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  /**
   * Check if token is about to expire
   */
  function checkTokenExpiring(expiresAt: string, threshold?: number): boolean {
    return isTokenExpiring(expiresAt, threshold ?? tokenRefreshThreshold);
  }

  return {
    login,
    logout,
    refreshToken: refreshTokenFn,
    isTokenExpiring: checkTokenExpiring,
  };
}
