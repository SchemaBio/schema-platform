import type { Patient, PaginatedResponse } from '@schema/types';
import type {
  PatientQueryParams,
  CreatePatientRequest,
  UpdatePatientRequest,
} from '../types.js';
import {
  PatientNotFoundError,
  PatientHasSamplesError,
  ValidationError,
} from '../types.js';
import { validatePatientData } from '../utils/validation.js';

/**
 * Patient service configuration
 */
export interface PatientServiceConfig {
  /** Base URL for the API */
  baseUrl: string;
}

/**
 * Patient service interface
 */
export interface PatientService {
  /** Get paginated list of patients */
  getPatients(params?: PatientQueryParams): Promise<PaginatedResponse<Patient>>;
  /** Get a single patient by ID */
  getPatient(id: string): Promise<Patient>;
  /** Create a new patient */
  createPatient(data: CreatePatientRequest): Promise<Patient>;
  /** Update an existing patient */
  updatePatient(id: string, data: UpdatePatientRequest): Promise<Patient>;
  /** Delete a patient */
  deletePatient(id: string): Promise<void>;
  /** Add phenotypes to a patient */
  addPhenotypes(patientId: string, hpoTerms: string[]): Promise<Patient>;
  /** Remove phenotypes from a patient */
  removePhenotypes(patientId: string, hpoTerms: string[]): Promise<Patient>;
  /** Search patients by query */
  searchPatients(query: string): Promise<Patient[]>;
}

/**
 * Create a patient service instance
 * @param config - Service configuration
 * @returns Patient service instance
 */
export function createPatientService(config: PatientServiceConfig): PatientService {
  const { baseUrl } = config;

  /**
   * Build query string from params
   */
  function buildQueryString(params: PatientQueryParams): string {
    const searchParams = new URLSearchParams();

    if (params.page !== undefined) {
      searchParams.set('page', String(params.page));
    }
    if (params.pageSize !== undefined) {
      searchParams.set('pageSize', String(params.pageSize));
    }
    if (params.search) {
      searchParams.set('search', params.search);
    }
    if (params.gender) {
      searchParams.set('gender', params.gender);
    }
    if (params.sortBy) {
      searchParams.set('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      searchParams.set('sortOrder', params.sortOrder);
    }

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Handle API response
   */
  async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 404) {
        const data = await response.json().catch(() => ({}));
        throw new PatientNotFoundError(data.id || 'unknown');
      }
      if (response.status === 409) {
        const data = await response.json().catch(() => ({}));
        throw new PatientHasSamplesError(data.id || 'unknown');
      }
      if (response.status === 400) {
        const data = await response.json().catch(() => ({}));
        throw new ValidationError(data.fields || { _: 'Validation failed' });
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get paginated list of patients
   */
  async function getPatients(
    params: PatientQueryParams = {}
  ): Promise<PaginatedResponse<Patient>> {
    const queryString = buildQueryString(params);
    const response = await fetch(`${baseUrl}/patients${queryString}`);
    return handleResponse<PaginatedResponse<Patient>>(response);
  }

  /**
   * Get a single patient by ID
   */
  async function getPatient(id: string): Promise<Patient> {
    const response = await fetch(`${baseUrl}/patients/${id}`);
    return handleResponse<Patient>(response);
  }

  /**
   * Create a new patient
   */
  async function createPatient(data: CreatePatientRequest): Promise<Patient> {
    // Validate request
    const validation = validatePatientData(data);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    const response = await fetch(`${baseUrl}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Patient>(response);
  }

  /**
   * Update an existing patient
   */
  async function updatePatient(
    id: string,
    data: UpdatePatientRequest
  ): Promise<Patient> {
    const response = await fetch(`${baseUrl}/patients/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Patient>(response);
  }

  /**
   * Delete a patient
   */
  async function deletePatient(id: string): Promise<void> {
    const response = await fetch(`${baseUrl}/patients/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      await handleResponse<void>(response);
    }
  }

  /**
   * Add phenotypes to a patient
   */
  async function addPhenotypes(
    patientId: string,
    hpoTerms: string[]
  ): Promise<Patient> {
    const response = await fetch(`${baseUrl}/patients/${patientId}/phenotypes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hpoTerms }),
    });
    return handleResponse<Patient>(response);
  }

  /**
   * Remove phenotypes from a patient
   */
  async function removePhenotypes(
    patientId: string,
    hpoTerms: string[]
  ): Promise<Patient> {
    const response = await fetch(`${baseUrl}/patients/${patientId}/phenotypes`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hpoTerms }),
    });
    return handleResponse<Patient>(response);
  }

  /**
   * Search patients by query
   */
  async function searchPatients(query: string): Promise<Patient[]> {
    const response = await fetch(
      `${baseUrl}/patients/search?q=${encodeURIComponent(query)}`
    );
    return handleResponse<Patient[]>(response);
  }

  return {
    getPatients,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient,
    addPhenotypes,
    removePhenotypes,
    searchPatients,
  };
}
