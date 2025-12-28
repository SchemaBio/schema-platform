import type { User } from '@schema/types';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  PasswordValidationResult,
  EmailValidationResult,
} from '../types.js';
import { ValidationError } from '../types.js';
import { validateEmailFormat, validatePassword } from '../utils/validation.js';

/**
 * User service interface
 */
export interface UserService {
  getCurrentUser(): Promise<User>;
  createUser(data: CreateUserRequest): Promise<User>;
  updateUser(userId: string, data: UpdateUserRequest): Promise<User>;
  changePassword(userId: string, data: ChangePasswordRequest): Promise<void>;
  validateEmail(email: string): Promise<EmailValidationResult>;
  validatePasswordFormat(password: string): PasswordValidationResult;
}

/**
 * Create user service instance
 */
export function createUserService(baseUrl: string, getAccessToken: () => string | null): UserService {
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
   * Get current user profile
   */
  async function getCurrentUser(): Promise<User> {
    const response = await fetch(`${baseUrl}/users/me`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return response.json() as Promise<User>;
  }

  /**
   * Create new user (admin only)
   */
  async function createUser(data: CreateUserRequest): Promise<User> {
    // Validate email format
    const emailValidation = validateEmailFormat(data.email);
    if (!emailValidation.valid) {
      throw new ValidationError('Invalid email', 'email', [emailValidation.error || 'Invalid email format']);
    }

    // Validate password
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      throw new ValidationError('Invalid password', 'password', passwordValidation.errors);
    }

    const response = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (error.field) {
        throw new ValidationError(error.message || 'Validation failed', error.field, error.details || []);
      }
      throw new Error(error.message || 'Failed to create user');
    }

    return response.json() as Promise<User>;
  }

  /**
   * Update user profile
   */
  async function updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
    // Validate email if provided
    if (data.email) {
      const emailValidation = validateEmailFormat(data.email);
      if (!emailValidation.valid) {
        throw new ValidationError('Invalid email', 'email', [emailValidation.error || 'Invalid email format']);
      }
    }

    const response = await fetch(`${baseUrl}/users/${userId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (error.field) {
        throw new ValidationError(error.message || 'Validation failed', error.field, error.details || []);
      }
      throw new Error(error.message || 'Failed to update user');
    }

    return response.json() as Promise<User>;
  }

  /**
   * Change user password
   */
  async function changePassword(userId: string, data: ChangePasswordRequest): Promise<void> {
    // Validate new password
    const passwordValidation = validatePassword(data.newPassword);
    if (!passwordValidation.valid) {
      throw new ValidationError('Invalid password', 'newPassword', passwordValidation.errors);
    }

    const response = await fetch(`${baseUrl}/users/${userId}/password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (error.code === 'INVALID_CURRENT_PASSWORD') {
        throw new ValidationError('Current password is incorrect', 'currentPassword', ['Current password is incorrect']);
      }
      throw new Error(error.message || 'Failed to change password');
    }
  }

  /**
   * Validate email format and uniqueness
   */
  async function validateEmailFn(email: string): Promise<EmailValidationResult> {
    // First check format
    const formatValidation = validateEmailFormat(email);
    if (!formatValidation.valid) {
      return formatValidation;
    }

    // Then check uniqueness via API
    try {
      const response = await fetch(`${baseUrl}/users/check-email?email=${encodeURIComponent(email)}`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        return { valid: false, error: 'Failed to validate email' };
      }

      const result = await response.json();
      if (result.exists) {
        return { valid: false, error: 'Email is already in use' };
      }

      return { valid: true };
    } catch {
      return { valid: false, error: 'Failed to validate email' };
    }
  }

  /**
   * Validate password format (local validation only)
   */
  function validatePasswordFormat(password: string): PasswordValidationResult {
    return validatePassword(password);
  }

  return {
    getCurrentUser,
    createUser,
    updateUser,
    changePassword,
    validateEmail: validateEmailFn,
    validatePasswordFormat,
  };
}
