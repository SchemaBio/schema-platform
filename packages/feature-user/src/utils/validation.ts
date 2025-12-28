import type { PasswordValidationResult, EmailValidationResult } from '../types.js';

/**
 * RFC 5322 compliant email regex pattern
 * Simplified version that covers most common email formats
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Minimum password length requirement
 */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Validate email format according to RFC 5322
 * @param email - Email string to validate
 * @returns Validation result with error message if invalid
 */
export function validateEmailFormat(email: string): EmailValidationResult {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' };
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length > 254) {
    return { valid: false, error: 'Email is too long (max 254 characters)' };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Check local part length (before @)
  const localPart = trimmedEmail.split('@')[0];
  if (localPart && localPart.length > 64) {
    return { valid: false, error: 'Email local part is too long (max 64 characters)' };
  }

  return { valid: true };
}

/**
 * Validate password meets security requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 *
 * @param password - Password string to validate
 * @returns Validation result with list of errors
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password) {
    return { valid: false, errors: ['Password is required'] };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if password meets all security requirements
 * @param password - Password to check
 * @returns true if password is valid
 */
export function isValidPassword(password: string): boolean {
  return validatePassword(password).valid;
}

/**
 * Check if email format is valid
 * @param email - Email to check
 * @returns true if email format is valid
 */
export function isValidEmail(email: string): boolean {
  return validateEmailFormat(email).valid;
}
