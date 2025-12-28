import type { User, AuthToken } from '@schema/types';
import {
  storeAuthData,
  getStoredAuthData,
  clearStoredAuth,
  updateStoredTokens,
} from '../utils/storage.js';
import { isValidToken } from '../utils/token.js';

/**
 * Authentication state
 */
export interface AuthState {
  /** Current authenticated user */
  user: User | null;
  /** Current auth tokens */
  tokens: AuthToken | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is loading */
  isLoading: boolean;
}

/**
 * Auth state listener
 */
export type AuthStateListener = (state: AuthState) => void;

/**
 * Auth store interface
 */
export interface AuthStore {
  getState(): AuthState;
  setAuth(user: User, tokens: AuthToken): void;
  clearAuth(): void;
  updateTokens(tokens: AuthToken): void;
  restoreSession(): Promise<boolean>;
  subscribe(listener: AuthStateListener): () => void;
  setLoading(isLoading: boolean): void;
}

/**
 * Create initial auth state
 */
function createInitialState(): AuthState {
  return {
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
  };
}

/**
 * Create auth store instance
 */
export function createAuthStore(): AuthStore {
  let state: AuthState = createInitialState();
  const listeners = new Set<AuthStateListener>();

  /**
   * Notify all listeners of state change
   */
  function notifyListeners(): void {
    listeners.forEach((listener) => listener(state));
  }

  /**
   * Update state and notify listeners
   */
  function setState(newState: Partial<AuthState>): void {
    state = { ...state, ...newState };
    notifyListeners();
  }

  /**
   * Get current auth state
   */
  function getState(): AuthState {
    return state;
  }

  /**
   * Set auth state after successful login
   */
  function setAuth(user: User, tokens: AuthToken): void {
    // Store in localStorage
    storeAuthData({ user, tokens });

    // Update state
    setState({
      user,
      tokens,
      isAuthenticated: true,
      isLoading: false,
    });
  }

  /**
   * Clear auth state on logout
   */
  function clearAuth(): void {
    // Clear localStorage
    clearStoredAuth();

    // Reset state
    setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }

  /**
   * Update tokens after refresh
   */
  function updateTokens(tokens: AuthToken): void {
    // Update localStorage
    updateStoredTokens(tokens);

    // Update state
    setState({ tokens });
  }

  /**
   * Restore session from localStorage
   * @returns true if session was restored successfully
   */
  async function restoreSession(): Promise<boolean> {
    setState({ isLoading: true });

    try {
      const storedData = getStoredAuthData();

      if (!storedData) {
        setState({ isLoading: false });
        return false;
      }

      const { user, tokens } = storedData;

      // Check if tokens are valid
      if (!isValidToken(tokens)) {
        // Tokens are expired, clear storage
        clearStoredAuth();
        setState({ isLoading: false });
        return false;
      }

      // Restore session
      setState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch {
      clearStoredAuth();
      setState({ isLoading: false });
      return false;
    }
  }

  /**
   * Subscribe to state changes
   * @returns Unsubscribe function
   */
  function subscribe(listener: AuthStateListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  /**
   * Set loading state
   */
  function setLoading(isLoading: boolean): void {
    setState({ isLoading });
  }

  return {
    getState,
    setAuth,
    clearAuth,
    updateTokens,
    restoreSession,
    subscribe,
    setLoading,
  };
}

/**
 * Singleton auth store instance
 */
let authStoreInstance: AuthStore | null = null;

/**
 * Get or create singleton auth store
 */
export function getAuthStore(): AuthStore {
  if (!authStoreInstance) {
    authStoreInstance = createAuthStore();
  }
  return authStoreInstance;
}

/**
 * Reset auth store (for testing)
 */
export function resetAuthStore(): void {
  authStoreInstance = null;
}
