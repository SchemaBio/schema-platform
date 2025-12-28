import type { Permission, ResourcePermission } from '@schema/types';
import { AuthorizationError } from '../types.js';

/**
 * Permission check request
 */
export interface PermissionCheck {
  resource: string;
  permission: Permission;
}

/**
 * Permission service interface
 */
export interface PermissionService {
  hasPermission(resource: string, permission: Permission): Promise<boolean>;
  hasPermissions(checks: PermissionCheck[]): Promise<boolean[]>;
  getPermissions(): Promise<ResourcePermission>;
  clearCache(): void;
}

/**
 * Cache entry with expiration
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Default cache TTL (5 minutes)
 */
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Create permission service instance
 */
export function createPermissionService(
  baseUrl: string,
  getAccessToken: () => string | null,
  cacheTtl: number = DEFAULT_CACHE_TTL
): PermissionService {
  // Permission cache
  let permissionCache: CacheEntry<ResourcePermission> | null = null;

  /**
   * Get authorization headers
   */
  function getHeaders(): HeadersInit {
    const token = getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * Check if cache is valid
   */
  function isCacheValid(): boolean {
    return permissionCache !== null && Date.now() < permissionCache.expiresAt;
  }

  /**
   * Get all permissions for current user (with caching)
   */
  async function getPermissions(): Promise<ResourcePermission> {
    // Return cached permissions if valid
    if (isCacheValid() && permissionCache) {
      return permissionCache.value;
    }

    const response = await fetch(`${baseUrl}/permissions/me`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch permissions');
    }

    const permissions = (await response.json()) as ResourcePermission;

    // Cache the result
    permissionCache = {
      value: permissions,
      expiresAt: Date.now() + cacheTtl,
    };

    return permissions;
  }

  /**
   * Check if user has permission for resource
   */
  async function hasPermission(resource: string, permission: Permission): Promise<boolean> {
    try {
      const permissions = await getPermissions();
      const resourcePermissions = permissions[resource];

      if (!resourcePermissions) {
        return false;
      }

      return resourcePermissions.includes(permission);
    } catch {
      return false;
    }
  }

  /**
   * Check multiple permissions at once
   */
  async function hasPermissions(checks: PermissionCheck[]): Promise<boolean[]> {
    try {
      const permissions = await getPermissions();

      return checks.map(({ resource, permission }) => {
        const resourcePermissions = permissions[resource];
        if (!resourcePermissions) {
          return false;
        }
        return resourcePermissions.includes(permission);
      });
    } catch {
      return checks.map(() => false);
    }
  }

  /**
   * Clear permission cache
   */
  function clearCache(): void {
    permissionCache = null;
  }

  return {
    hasPermission,
    hasPermissions,
    getPermissions,
    clearCache,
  };
}

/**
 * Assert user has permission, throw if not
 */
export async function assertPermission(
  permissionService: PermissionService,
  resource: string,
  permission: Permission
): Promise<void> {
  const hasAccess = await permissionService.hasPermission(resource, permission);
  if (!hasAccess) {
    throw new AuthorizationError(`Permission denied for ${resource}`, resource, permission);
  }
}
