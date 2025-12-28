import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { Permission, ResourcePermission } from '@schema/types';
import { createPermissionService } from '../services/permission.service.js';
import type { PermissionService } from '../services/permission.service.js';

/**
 * Single permission check hook return type
 */
export interface UsePermissionReturn {
  /** Whether user has the permission */
  hasPermission: boolean;
  /** Whether permission check is loading */
  isLoading: boolean;
}

/**
 * Hook for checking a single permission
 * @param apiBaseUrl - Base URL for permission API
 * @param resource - Resource to check
 * @param permission - Permission to check
 * @returns Permission check result
 */
export function usePermission(
  apiBaseUrl: string,
  resource: string,
  permission: Permission
): UsePermissionReturn {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Create permission service
  const permissionService = useMemo<PermissionService>(() => {
    return createPermissionService(apiBaseUrl, () => null);
  }, [apiBaseUrl]);

  // Check permission
  useEffect(() => {
    let cancelled = false;

    const checkPermission = async () => {
      setIsLoading(true);
      try {
        const result = await permissionService.hasPermission(resource, permission);
        if (!cancelled) {
          setHasPermission(result);
        }
      } catch {
        if (!cancelled) {
          setHasPermission(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void checkPermission();

    return () => {
      cancelled = true;
    };
  }, [permissionService, resource, permission]);

  return { hasPermission, isLoading };
}

/**
 * Multiple permissions hook return type
 */
export interface UsePermissionsReturn {
  /** Check if user has permission */
  check: (resource: string, permission: Permission) => boolean;
  /** Whether permissions are loading */
  isLoading: boolean;
  /** All loaded permissions */
  permissions: ResourcePermission;
  /** Refresh permissions */
  refresh: () => Promise<void>;
}

/**
 * Hook for checking multiple permissions
 * @param apiBaseUrl - Base URL for permission API
 * @returns Permission check methods
 */
export function usePermissions(apiBaseUrl: string): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<ResourcePermission>({});
  const [isLoading, setIsLoading] = useState(true);

  // Create permission service
  const permissionServiceRef = useRef<PermissionService | null>(null);
  if (!permissionServiceRef.current) {
    permissionServiceRef.current = createPermissionService(apiBaseUrl, () => null);
  }
  const permissionService = permissionServiceRef.current;

  /**
   * Load all permissions
   */
  const loadPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const perms = await permissionService.getPermissions();
      setPermissions(perms);
    } catch {
      setPermissions({});
    } finally {
      setIsLoading(false);
    }
  }, [permissionService]);

  /**
   * Check if user has permission (synchronous, uses cached data)
   */
  const check = useCallback(
    (resource: string, permission: Permission): boolean => {
      const resourcePerms = permissions[resource];
      if (!resourcePerms) return false;
      return resourcePerms.includes(permission);
    },
    [permissions]
  );

  /**
   * Refresh permissions
   */
  const refresh = useCallback(async () => {
    permissionService.clearCache();
    await loadPermissions();
  }, [permissionService, loadPermissions]);

  // Load permissions on mount
  useEffect(() => {
    void loadPermissions();
  }, [loadPermissions]);

  return {
    check,
    isLoading,
    permissions,
    refresh,
  };
}

/**
 * Hook for requiring a permission (throws if not authorized)
 * @param apiBaseUrl - Base URL for permission API
 * @param resource - Resource to check
 * @param permission - Permission to check
 * @returns Permission check result
 */
export function useRequirePermission(
  apiBaseUrl: string,
  resource: string,
  permission: Permission
): UsePermissionReturn {
  const result = usePermission(apiBaseUrl, resource, permission);

  // Could throw or redirect here if needed
  // For now, just return the result

  return result;
}
