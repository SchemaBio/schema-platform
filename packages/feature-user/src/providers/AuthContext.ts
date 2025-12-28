import { createContext, useContext } from 'react';
import type { User } from '@schema/types';

/**
 * Auth context value interface
 */
export interface AuthContextValue {
  /** Current authenticated user */
  user: User | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is loading */
  isLoading: boolean;
  /** Login with email and password */
  login: (email: string, password: string) => Promise<void>;
  /** Logout current user */
  logout: () => Promise<void>;
  /** Manually refresh session */
  refreshSession: () => Promise<void>;
}

/**
 * Auth context with default values
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Hook to access auth context
 * @throws Error if used outside AuthProvider
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
