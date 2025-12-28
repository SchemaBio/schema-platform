import type { Sample, PaginatedResponse } from '@schema/types';
import type {
  SampleQueryParams,
  CreateSampleRequest,
  UpdateSampleRequest,
  SampleWithRelations,
} from '../types.js';
import {
  SampleNotFoundError,
  SampleProcessingError,
  ValidationError,
} from '../types.js';
import { validateCreateSampleRequest } from '../utils/validation.js';

/**
 * Sample service configuration
 */
export interface SampleServiceConfig {
  /** Base URL for the API */
  baseUrl: string;
}

/**
 * Sample service interface
 */
export interface SampleService {
  /** Get paginated list of samples */
  getSamples(params?: SampleQueryParams): Promise<PaginatedResponse<Sample>>;
  /** Get a single sample by ID */
  getSample(id: string): Promise<SampleWithRelations>;
  /** Create a new sample */
  createSample(data: CreateSampleRequest): Promise<Sample>;
  /** Update an existing sample */
  updateSample(id: string, data: UpdateSampleRequest): Promise<Sample>;
  /** Delete a sample */
  deleteSample(id: string): Promise<void>;
  /** Delete multiple samples */
  deleteSamples(ids: string[]): Promise<void>;
  /** Search samples by query */
  searchSamples(query: string): Promise<Sample[]>;
}

/**
 * Create a sample service instance
 * @param config - Service configuration
 * @returns Sample service instance
 */
export function createSampleService(config: SampleServiceConfig): SampleService {
  const { baseUrl } = config;

  /**
   * Build query string from params
   */
  function buildQueryString(params: SampleQueryParams): string {
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
    if (params.sampleType) {
      searchParams.set('sampleType', params.sampleType);
    }
    if (params.status) {
      searchParams.set('status', params.status);
    }
    if (params.batchId) {
      searchParams.set('batchId', params.batchId);
    }
    if (params.patientId) {
      searchParams.set('patientId', params.patientId);
    }
    if (params.sortBy) {
      searchParams.set('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      searchParams.set('sortOrder', params.sortOrder);
    }
    if (params.createdAfter) {
      searchParams.set('createdAfter', params.createdAfter);
    }
    if (params.createdBefore) {
      searchParams.set('createdBefore', params.createdBefore);
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
        throw new SampleNotFoundError(data.id || 'unknown');
      }
      if (response.status === 409) {
        const data = await response.json().catch(() => ({}));
        throw new SampleProcessingError(data.id || 'unknown', data.operation || 'modify');
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
   * Get paginated list of samples
   */
  async function getSamples(
    params: SampleQueryParams = {}
  ): Promise<PaginatedResponse<Sample>> {
    const queryString = buildQueryString(params);
    const response = await fetch(`${baseUrl}/samples${queryString}`);
    return handleResponse<PaginatedResponse<Sample>>(response);
  }

  /**
   * Get a single sample by ID with relations
   */
  async function getSample(id: string): Promise<SampleWithRelations> {
    const response = await fetch(`${baseUrl}/samples/${id}?include=patient,batch,qcReport`);
    return handleResponse<SampleWithRelations>(response);
  }

  /**
   * Create a new sample
   */
  async function createSample(data: CreateSampleRequest): Promise<Sample> {
    // Validate request
    const validation = validateCreateSampleRequest(data);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    const response = await fetch(`${baseUrl}/samples`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Sample>(response);
  }

  /**
   * Update an existing sample
   */
  async function updateSample(
    id: string,
    data: UpdateSampleRequest
  ): Promise<Sample> {
    const response = await fetch(`${baseUrl}/samples/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Sample>(response);
  }

  /**
   * Delete a sample
   */
  async function deleteSample(id: string): Promise<void> {
    const response = await fetch(`${baseUrl}/samples/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      await handleResponse<void>(response);
    }
  }

  /**
   * Delete multiple samples
   */
  async function deleteSamples(ids: string[]): Promise<void> {
    const response = await fetch(`${baseUrl}/samples/batch-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) {
      await handleResponse<void>(response);
    }
  }

  /**
   * Search samples by query
   */
  async function searchSamples(query: string): Promise<Sample[]> {
    const response = await fetch(
      `${baseUrl}/samples/search?q=${encodeURIComponent(query)}`
    );
    return handleResponse<Sample[]>(response);
  }

  return {
    getSamples,
    getSample,
    createSample,
    updateSample,
    deleteSample,
    deleteSamples,
    searchSamples,
  };
}
