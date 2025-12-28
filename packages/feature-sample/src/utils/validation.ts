import { Gender } from '@schema/types';
import type { CreateSampleRequest, CreatePatientRequest } from '../types.js';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate sample name
 * @param name - Sample name to validate
 * @returns Validation result
 */
export function validateSampleName(name: string | undefined | null): ValidationResult {
  const errors: Record<string, string> = {};

  if (!name || name.trim().length === 0) {
    errors.name = 'Sample name is required';
  } else if (name.trim().length < 2) {
    errors.name = 'Sample name must be at least 2 characters';
  } else if (name.trim().length > 255) {
    errors.name = 'Sample name must be at most 255 characters';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate date format (ISO 8601: YYYY-MM-DD)
 * @param date - Date string to validate
 * @returns Validation result
 */
export function validateDateFormat(date: string | undefined | null): ValidationResult {
  const errors: Record<string, string> = {};

  if (!date) {
    errors.date = 'Date is required';
    return { valid: false, errors };
  }

  // Check format: YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    errors.date = 'Date must be in YYYY-MM-DD format';
    return { valid: false, errors };
  }

  // Check if it's a valid date
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    errors.date = 'Invalid date';
    return { valid: false, errors };
  }

  // Check if the date components match (to catch invalid dates like 2024-02-30)
  const [year, month, day] = date.split('-').map(Number);
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    errors.date = 'Invalid date';
    return { valid: false, errors };
  }

  return { valid: true, errors: {} };
}

/**
 * Validate patient data
 * @param data - Patient data to validate
 * @returns Validation result
 */
export function validatePatientData(
  data: Partial<CreatePatientRequest>
): ValidationResult {
  const errors: Record<string, string> = {};

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Patient name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Patient name must be at least 2 characters';
  }

  // Gender validation
  const validGenders: Gender[] = [Gender.MALE, Gender.FEMALE, Gender.UNKNOWN];
  if (!data.gender) {
    errors.gender = 'Gender is required';
  } else if (!validGenders.includes(data.gender)) {
    errors.gender = 'Invalid gender value';
  }

  // Birth date validation
  if (!data.birthDate) {
    errors.birthDate = 'Birth date is required';
  } else {
    const dateValidation = validateDateFormat(data.birthDate);
    if (!dateValidation.valid) {
      errors.birthDate = dateValidation.errors.date || 'Invalid birth date';
    } else {
      // Check if birth date is not in the future
      const birthDate = new Date(data.birthDate);
      if (birthDate > new Date()) {
        errors.birthDate = 'Birth date cannot be in the future';
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate sample creation request
 * @param data - Sample creation data to validate
 * @returns Validation result
 */
export function validateCreateSampleRequest(
  data: Partial<CreateSampleRequest>
): ValidationResult {
  const errors: Record<string, string> = {};

  // Name validation
  const nameValidation = validateSampleName(data.name);
  if (!nameValidation.valid) {
    Object.assign(errors, nameValidation.errors);
  }

  // Sample type validation
  const validTypes = ['GERMLINE', 'SOMATIC', 'TUMOR_NORMAL_PAIR'];
  if (!data.sampleType) {
    errors.sampleType = 'Sample type is required';
  } else if (!validTypes.includes(data.sampleType)) {
    errors.sampleType = 'Invalid sample type';
  }

  // Patient ID validation
  if (!data.patientId || data.patientId.trim().length === 0) {
    errors.patientId = 'Patient is required';
  }

  // Paired sample validation for TUMOR_NORMAL_PAIR
  if (data.sampleType === 'TUMOR_NORMAL_PAIR') {
    if (!data.pairedSampleId || data.pairedSampleId.trim().length === 0) {
      errors.pairedSampleId = 'Paired sample is required for tumor-normal pair';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
