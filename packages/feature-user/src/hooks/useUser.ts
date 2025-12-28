import { useState, useCallback, useMemo } from 'react';
import type { User } from '@schema/types';
import type { UpdateUserRequest, ChangePasswordRequest } from '../types.js';
import { useAuthContext } from '../providers/AuthContext.js';
import { createUserService } from '../services/user.service.js';
import type { UserService } from '../services/user.service.js';

/**
 * User hook return type
 */
export interface UseUserReturn {
  /** Current user */
  user: User | null;
  /** Update user profile */
  updateProfile: (data: UpdateUserRequest) => Promise<void>;
  /** Change user password */
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  /** Whether an update is in progress */
  isUpdating: boolean;
  /** Last error */
  error: Error | null;
}

/**
 * Hook for user profile operations
 * @param apiBaseUrl - Base URL for user API
 * @returns User state and methods
 */
export function useUser(apiBaseUrl: string): UseUserReturn {
  const { user } = useAuthContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create user service
  const userService = useMemo<UserService>(() => {
    return createUserService(apiBaseUrl, () => null); // Token will be handled by interceptor
  }, [apiBaseUrl]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (data: UpdateUserRequest) => {
      if (!user) {
        throw new Error('No user logged in');
      }

      setIsUpdating(true);
      setError(null);

      try {
        await userService.updateUser(user.id, data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update profile');
        setError(error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [user, userService]
  );

  /**
   * Change user password
   */
  const changePassword = useCallback(
    async (data: ChangePasswordRequest) => {
      if (!user) {
        throw new Error('No user logged in');
      }

      setIsUpdating(true);
      setError(null);

      try {
        await userService.changePassword(user.id, data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to change password');
        setError(error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [user, userService]
  );

  return {
    user,
    updateProfile,
    changePassword,
    isUpdating,
    error,
  };
}
