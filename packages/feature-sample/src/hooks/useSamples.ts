import { useContext, useCallback, useEffect, useState } from 'react';
import type { Sample } from '@schema/types';
import { SampleContext } from '../providers/SampleContext.js';
import type { SampleQueryParams, CreateSampleRequest, SampleFilters } from '../types.js';
import type { SampleState } from '../stores/sample.store.js';

/**
 * Options for useSamples hook
 */
export interface UseSamplesOptions {
  /** Initial page number */
  page?: number;
  /** Items per page */
  pageSize?: number;
  /** Initial filters */
  filters?: SampleFilters;
  /** Whether to fetch on mount */
  autoFetch?: boolean;
}

/**
 * Return type for useSamples hook
 */
export interface UseSamplesReturn {
  /** List of samples */
  samples: Sample[];
  /** Total count */
  total: number;
  /** Current page */
  page: number;
  /** Page size */
  pageSize: number;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;

  // Actions
  /** Fetch samples with params */
  fetchSamples: (params?: SampleQueryParams) => Promise<void>;
  /** Create a new sample */
  createSample: (data: CreateSampleRequest) => Promise<Sample>;
  /** Delete a sample */
  deleteSample: (id: string) => Promise<void>;
  /** Delete multiple samples */
  deleteSamples: (ids: string[]) => Promise<void>;
  /** Refresh current list */
  refresh: () => Promise<void>;

  // Selection
  /** Selected sample IDs */
  selectedIds: string[];
  /** Select a sample */
  selectSample: (id: string) => void;
  /** Deselect a sample */
  deselectSample: (id: string) => void;
  /** Select all samples */
  selectAll: () => void;
  /** Deselect all samples */
  deselectAll: () => void;

  // Pagination
  /** Set current page */
  setPage: (page: number) => void;
  /** Set page size */
  setPageSize: (pageSize: number) => void;
}

/**
 * Hook for managing sample list
 */
export function useSamples(options: UseSamplesOptions = {}): UseSamplesReturn {
  const {
    page: initialPage = 1,
    pageSize: initialPageSize = 20,
    filters: initialFilters,
    autoFetch = true,
  } = options;

  const context = useContext(SampleContext);
  if (!context) {
    throw new Error('useSamples must be used within a SampleProvider');
  }

  const { sampleService, store } = context;

  // Local state for current query params
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentPageSize, setCurrentPageSize] = useState(initialPageSize);
  const [_currentFilters, _setCurrentFilters] = useState<SampleFilters | undefined>(initialFilters);

  // Store state
  const [storeState, setStoreState] = useState<SampleState>(store.getState());

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = store.subscribe(setStoreState);
    return unsubscribe;
  }, [store]);

  // Fetch samples
  const fetchSamples = useCallback(
    async (params?: SampleQueryParams) => {
      store.setLoading(true);
      store.setError(null);

      try {
        const queryParams: SampleQueryParams = {
          page: params?.page ?? currentPage,
          pageSize: params?.pageSize ?? currentPageSize,
          ...params,
        };

        const response = await sampleService.getSamples(queryParams);
        store.setSamples(
          response.items,
          response.total,
          queryParams.page ?? 1,
          queryParams.pageSize ?? 20
        );

        // Update local state if params changed
        if (params?.page !== undefined) setCurrentPage(params.page);
        if (params?.pageSize !== undefined) setCurrentPageSize(params.pageSize);
      } catch (error) {
        store.setError(error instanceof Error ? error : new Error('Failed to fetch samples'));
      } finally {
        store.setLoading(false);
      }
    },
    [sampleService, store, currentPage, currentPageSize]
  );

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      void fetchSamples();
    }
  }, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Create sample
  const createSample = useCallback(
    async (data: CreateSampleRequest): Promise<Sample> => {
      store.setCreating(true);
      store.setError(null);

      try {
        const sample = await sampleService.createSample(data);
        store.addSample(sample);
        return sample;
      } catch (error) {
        store.setError(error instanceof Error ? error : new Error('Failed to create sample'));
        throw error;
      } finally {
        store.setCreating(false);
      }
    },
    [sampleService, store]
  );

  // Delete sample
  const deleteSample = useCallback(
    async (id: string): Promise<void> => {
      store.setDeleting(true);
      store.setError(null);

      // Optimistic update
      const snapshot = store.createSnapshot();
      store.removeSample(id);

      try {
        await sampleService.deleteSample(id);
      } catch (error) {
        // Rollback on error
        store.restoreSnapshot(snapshot);
        store.setError(error instanceof Error ? error : new Error('Failed to delete sample'));
        throw error;
      } finally {
        store.setDeleting(false);
      }
    },
    [sampleService, store]
  );

  // Delete multiple samples
  const deleteSamples = useCallback(
    async (ids: string[]): Promise<void> => {
      store.setDeleting(true);
      store.setError(null);

      // Optimistic update
      const snapshot = store.createSnapshot();
      ids.forEach((id) => store.removeSample(id));

      try {
        await sampleService.deleteSamples(ids);
      } catch (error) {
        // Rollback on error
        store.restoreSnapshot(snapshot);
        store.setError(error instanceof Error ? error : new Error('Failed to delete samples'));
        throw error;
      } finally {
        store.setDeleting(false);
      }
    },
    [sampleService, store]
  );

  // Refresh
  const refresh = useCallback(() => fetchSamples(), [fetchSamples]);

  // Pagination
  const setPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
      void fetchSamples({ page });
    },
    [fetchSamples]
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      setCurrentPageSize(pageSize);
      setCurrentPage(1);
      void fetchSamples({ page: 1, pageSize });
    },
    [fetchSamples]
  );

  // Get samples from store
  const samples = storeState.sampleList.ids
    .map((id) => storeState.samples.get(id))
    .filter((s): s is Sample => s !== undefined);

  return {
    samples,
    total: storeState.sampleList.total,
    page: storeState.sampleList.page,
    pageSize: storeState.sampleList.pageSize,
    isLoading: storeState.isLoading,
    error: storeState.error,

    fetchSamples,
    createSample,
    deleteSample,
    deleteSamples,
    refresh,

    selectedIds: Array.from(storeState.selectedIds),
    selectSample: store.selectSample,
    deselectSample: store.deselectSample,
    selectAll: store.selectAll,
    deselectAll: store.deselectAll,

    setPage,
    setPageSize,
  };
}
