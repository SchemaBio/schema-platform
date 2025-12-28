import type { Batch, PaginatedResponse } from '@schema/types';
import type {
  BatchQueryParams,
  CreateBatchRequest,
  UpdateBatchRequest,
} from '../types.js';
import { BatchNotFoundError, ValidationError } from '../types.js';

/**
 * Batch service configuration
 */
export interface BatchServiceConfig {
  /** Base URL for the API */
  baseUrl: string;
}

/**
 * Batch service interface
 */
export interface BatchService {
  /** Get paginated list of batches */
  getBatches(params?: BatchQueryParams): Promise<PaginatedResponse<Batch>>;
  /** Get a single batch by ID */
  getBatch(id: string): Promise<Batch>;
  /** Create a new batch */
  createBatch(data: CreateBatchRequest): Promise<Batch>;
  /** Update an existing batch */
  updateBatch(id: string, data: UpdateBatchRequest): Promise<Batch>;
  /** Delete a batch */
  deleteBatch(id: string): Promise<void>;
  /** Add samples to a batch */
  addSamplesToBatch(batchId: string, sampleIds: string[]): Promise<Batch>;
  /** Remove samples from a batch */
  removeSamplesFromBatch(batchId: string, sampleIds: string[]): Promise<Batch>;
}

/**
 * Create a batch service instance
 * @param config - Service configuration
 * @returns Batch service instance
 */
export function createBatchService(config: BatchServiceConfig): BatchService {
  const { baseUrl } = config;

  /**
   * Build query string from params
   */
  function buildQueryString(params: BatchQueryParams): string {
    const searchParams = new URLSearchParams();

    if (params.page !== undefined) {
      searchParams.set('page', String(params.page));
    }
    if (params.pageSize !== undefined) {
      searchParams.set('pageSize', String(params.pageSize));
    }
    if (params.status) {
      searchParams.set('status', params.status);
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
        throw new BatchNotFoundError(data.id || 'unknown');
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
   * Get paginated list of batches
   */
  async function getBatches(
    params: BatchQueryParams = {}
  ): Promise<PaginatedResponse<Batch>> {
    const queryString = buildQueryString(params);
    const response = await fetch(`${baseUrl}/batches${queryString}`);
    return handleResponse<PaginatedResponse<Batch>>(response);
  }

  /**
   * Get a single batch by ID
   */
  async function getBatch(id: string): Promise<Batch> {
    const response = await fetch(`${baseUrl}/batches/${id}`);
    return handleResponse<Batch>(response);
  }

  /**
   * Create a new batch
   */
  async function createBatch(data: CreateBatchRequest): Promise<Batch> {
    // Validate request
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError({ name: 'Batch name is required' });
    }

    const response = await fetch(`${baseUrl}/batches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Batch>(response);
  }

  /**
   * Update an existing batch
   */
  async function updateBatch(
    id: string,
    data: UpdateBatchRequest
  ): Promise<Batch> {
    const response = await fetch(`${baseUrl}/batches/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Batch>(response);
  }

  /**
   * Delete a batch
   */
  async function deleteBatch(id: string): Promise<void> {
    const response = await fetch(`${baseUrl}/batches/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      await handleResponse<void>(response);
    }
  }

  /**
   * Add samples to a batch
   */
  async function addSamplesToBatch(
    batchId: string,
    sampleIds: string[]
  ): Promise<Batch> {
    const response = await fetch(`${baseUrl}/batches/${batchId}/samples`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sampleIds }),
    });
    return handleResponse<Batch>(response);
  }

  /**
   * Remove samples from a batch
   */
  async function removeSamplesFromBatch(
    batchId: string,
    sampleIds: string[]
  ): Promise<Batch> {
    const response = await fetch(`${baseUrl}/batches/${batchId}/samples`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sampleIds }),
    });
    return handleResponse<Batch>(response);
  }

  return {
    getBatches,
    getBatch,
    createBatch,
    updateBatch,
    deleteBatch,
    addSamplesToBatch,
    removeSamplesFromBatch,
  };
}
