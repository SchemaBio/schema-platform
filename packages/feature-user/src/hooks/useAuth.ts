import type { User } from '@schema/types';
import { useAuthContext } from '../providers/AuthContext.js';

/**
 * Auth hook return type
 */
export interface UseAuthReturn {
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
}

/**
 * Hook for authentication operations
 * @returns Auth state and methods
 */
export function useAuth(): UseAuthReturn {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthContext();

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
