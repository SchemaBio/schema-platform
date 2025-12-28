import type { AuthToken, User } from '@schema/types';

/**
 * Storage keys for auth data
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'schema_access_token',
  REFRESH_TOKEN: 'schema_refresh_token',
  TOKEN_EXPIRY: 'schema_token_expiry',
  USER: 'schema_user',
} as const;

/**
 * Stored auth data structure
 */
export interface StoredAuthData {
  tokens: AuthToken;
  user: User;
}

/**
 * Check if localStorage is available
 */
function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely get item from localStorage
 */
function safeGetItem(key: string): string | null {
  if (!isStorageAvailable()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safely set item in localStorage
 */
function safeSetItem(key: string, value: string): boolean {
  if (!isStorageAvailable()) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely remove item from localStorage
 */
function safeRemoveItem(key: string): boolean {
  if (!isStorageAvailable()) return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Store authentication tokens in localStorage
 * @param tokens - Auth tokens to store
 */
export function storeTokens(tokens: AuthToken): void {
  safeSetItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
  safeSetItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  safeSetItem(STORAGE_KEYS.TOKEN_EXPIRY, tokens.expiresAt);
}

/**
 * Retrieve stored authentication tokens
 * @returns Stored tokens or null if not found
 */
export function getStoredTokens(): AuthToken | null {
  const accessToken = safeGetItem(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = safeGetItem(STORAGE_KEYS.REFRESH_TOKEN);
  const expiresAt = safeGetItem(STORAGE_KEYS.TOKEN_EXPIRY);

  if (!accessToken || !refreshToken || !expiresAt) {
    return null;
  }

  return { accessToken, refreshToken, expiresAt };
}

/**
 * Store user data in localStorage
 * @param user - User data to store
 */
export function storeUser(user: User): void {
  safeSetItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

/**
 * Retrieve stored user data
 * @returns Stored user or null if not found
 */
export function getStoredUser(): User | null {
  const userData = safeGetItem(STORAGE_KEYS.USER);
  if (!userData) return null;

  try {
    return JSON.parse(userData) as User;
  } catch {
    return null;
  }
}

/**
 * Store complete auth data (tokens + user)
 * @param data - Auth data to store
 */
export function storeAuthData(data: StoredAuthData): void {
  storeTokens(data.tokens);
  storeUser(data.user);
}

/**
 * Retrieve complete stored auth data
 * @returns Stored auth data or null if incomplete
 */
export function getStoredAuthData(): StoredAuthData | null {
  const tokens = getStoredTokens();
  const user = getStoredUser();

  if (!tokens || !user) {
    return null;
  }

  return { tokens, user };
}

/**
 * Clear all stored authentication data
 */
export function clearStoredAuth(): void {
  safeRemoveItem(STORAGE_KEYS.ACCESS_TOKEN);
  safeRemoveItem(STORAGE_KEYS.REFRESH_TOKEN);
  safeRemoveItem(STORAGE_KEYS.TOKEN_EXPIRY);
  safeRemoveItem(STORAGE_KEYS.USER);
}

/**
 * Update only the tokens (used after refresh)
 * @param tokens - New tokens to store
 */
export function updateStoredTokens(tokens: AuthToken): void {
  storeTokens(tokens);
}
