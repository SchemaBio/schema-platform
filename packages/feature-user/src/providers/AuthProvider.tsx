import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthToken } from '@schema/types';
import { AuthContext } from './AuthContext.js';
import type { AuthContextValue } from './AuthContext.js';
import { createAuthService } from '../services/auth.service.js';
import type { AuthService } from '../services/auth.service.js';
import { createAuthStore } from '../stores/auth.store.js';
import type { AuthStore, AuthState } from '../stores/auth.store.js';
import { isTokenExpiring, getRefreshDelay } from '../utils/token.js';

/**
 * Auth provider props
 */
export interface AuthProviderProps {
  /** Child components */
  children: ReactNode;
  /** Base URL for auth API */
  apiBaseUrl: string;
  /** Callback for auth errors */
  onAuthError?: (error: Error) => void;
  /** Callback for logout (e.g., redirect) */
  onLogout?: () => void;
}

/**
 * Auth provider component
 */
export function AuthProvider({
  children,
  apiBaseUrl,
  onAuthError,
  onLogout,
}: AuthProviderProps): JSX.Element {
  // Create services and store
  const authServiceRef = useRef<AuthService | null>(null);
  const authStoreRef = useRef<AuthStore | null>(null);

  if (!authServiceRef.current) {
    authServiceRef.current = createAuthService({ baseUrl: apiBaseUrl });
  }
  if (!authStoreRef.current) {
    authStoreRef.current = createAuthStore();
  }

  const authService = authServiceRef.current;
  const authStore = authStoreRef.current;

  // State from store
  const [state, setState] = useState<AuthState>(authStore.getState());

  // Refresh timer ref
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Clear refresh timer
   */
  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  /**
   * Schedule token refresh
   */
  const scheduleRefresh = useCallback(
    (tokens: AuthToken) => {
      clearRefreshTimer();

      const delay = getRefreshDelay(tokens.expiresAt);
      if (delay <= 0) {
        // Refresh immediately
        void refreshSession();
        return;
      }

      refreshTimerRef.current = setTimeout(() => {
        void refreshSession();
      }, delay);
    },
    [clearRefreshTimer]
  );

  /**
   * Refresh session using refresh token
   */
  const refreshSession = useCallback(async () => {
    const currentState = authStore.getState();
    if (!currentState.tokens?.refreshToken) {
      return;
    }

    try {
      const newTokens = await authService.refreshToken(currentState.tokens.refreshToken);
      authStore.updateTokens(newTokens);
      scheduleRefresh(newTokens);
    } catch (error) {
      // Refresh failed, logout
      authStore.clearAuth();
      clearRefreshTimer();
      onAuthError?.(error instanceof Error ? error : new Error('Token refresh failed'));
      onLogout?.();
    }
  }, [authService, authStore, scheduleRefresh, clearRefreshTimer, onAuthError, onLogout]);

  /**
   * Login with credentials
   */
  const login = useCallback(
    async (email: string, password: string) => {
      authStore.setLoading(true);

      try {
        const response = await authService.login({ email, password });
        authStore.setAuth(response.user, {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresAt: response.expiresAt,
        });
        scheduleRefresh({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresAt: response.expiresAt,
        });
      } catch (error) {
        authStore.setLoading(false);
        throw error;
      }
    },
    [authService, authStore, scheduleRefresh]
  );

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    clearRefreshTimer();

    try {
      await authService.logout();
    } catch {
      // Ignore logout errors
    }

    authStore.clearAuth();
    onLogout?.();
  }, [authService, authStore, clearRefreshTimer, onLogout]);

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = authStore.subscribe(setState);
    return unsubscribe;
  }, [authStore]);

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      const restored = await authStore.restoreSession();
      if (restored) {
        const currentState = authStore.getState();
        if (currentState.tokens) {
          // Check if token needs refresh
          if (isTokenExpiring(currentState.tokens.expiresAt)) {
            await refreshSession();
          } else {
            scheduleRefresh(currentState.tokens);
          }
        }
      }
    };

    void restore();

    return () => {
      clearRefreshTimer();
    };
  }, [authStore, refreshSession, scheduleRefresh, clearRefreshTimer]);

  // Context value
  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      login,
      logout,
      refreshSession,
    }),
    [state.user, state.isAuthenticated, state.isLoading, login, logout, refreshSession]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
