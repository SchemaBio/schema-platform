import { STORAGE_KEYS } from './storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const tokens = localStorage.getItem(STORAGE_KEYS.TOKENS);
    if (tokens) {
      const parsed = JSON.parse(tokens);
      return parsed.accessToken || null;
    }
  } catch {}
  return null;
}

function setAuthTokens(accessToken: string, refreshToken: string, expiresAt?: string) {
  localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify({
    accessToken,
    refreshToken,
    expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }));
}

function clearAuthTokens() {
  localStorage.removeItem(STORAGE_KEYS.TOKENS);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.ORGANIZATIONS);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_ORG);
}

export { ApiError, getAuthToken, setAuthTokens, clearAuthTokens };

// Refresh lock: prevents concurrent token refresh calls
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  // If already refreshing, wait for that promise
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const tokensStr = localStorage.getItem(STORAGE_KEYS.TOKENS);
      if (!tokensStr) return false;

      const tokens = JSON.parse(tokensStr);
      if (!tokens.refreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: tokens.refreshToken }),
      });

      if (!response.ok) {
        clearAuthTokens();
        return false;
      }

      const json = await response.json();
      const data = json?.data ?? json;
      setAuthTokens(data.access_token, data.refresh_token, data.expires_at);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...init } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...init.headers,
  };

  const token = getAuthToken();
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  // Auto-refresh on 401 (skip for auth endpoints to avoid loops)
  if (response.status === 401 && !endpoint.startsWith('/v1/auth/')) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry with new token
      const newToken = getAuthToken();
      if (newToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
      }
      const retryResponse = await fetch(url, { ...init, headers });
      if (!retryResponse.ok) {
        const retryData = await retryResponse.json().catch(() => null);
        throw new ApiError(retryResponse.status, retryResponse.statusText, retryData);
      }
      if (retryResponse.status === 204) return undefined as T;
      const retryJson = await retryResponse.json();
      return retryJson?.data ?? retryJson;
    }
    // Refresh failed — trigger logout by dispatching event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('schema:auth-expired'));
    }
    throw new ApiError(401, 'Unauthorized', { error: 'Token expired and refresh failed' });
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(response.status, response.statusText, data);
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  const json = await response.json();
  // Backend wraps all responses as { data: T }
  return json?.data ?? json;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
