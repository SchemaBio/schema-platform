import { useContext, useCallback, useEffect, useState } from 'react';
import type { Batch } from '@schema/types';
import { SampleContext } from '../providers/SampleContext.js';
import type { CreateBatchRequest, UpdateBatchRequest } from '../types.js';
import type { SampleState } from '../stores/sample.store.js';

/**
 * Return type for useBatches hook
 */
export interface UseBatchesReturn {
  /** List of batches */
  batches: Batch[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;

  // Actions
  /** Fetch all batches */
  fetchBatches: () => Promise<void>;
  /** Create a new batch */
  createBatch: (data: CreateBatchRequest) => Promise<Batch>;
  /** Update a batch */
  updateBatch: (id: string, data: UpdateBatchRequest) => Promise<Batch>;
  /** Delete a batch */
  deleteBatch: (id: string) => Promise<void>;
  /** Add samples to a batch */
  addSamplesToBatch: (batchId: string, sampleIds: string[]) => Promise<void>;
  /** Remove samples from a batch */
  removeSamplesFromBatch: (batchId: string, sampleIds: string[]) => Promise<void>;
}

/**
 * Hook for managing batches
 */
export function useBatches(): UseBatchesReturn {
  const context = useContext(SampleContext);
  if (!context) {
    throw new Error('useBatches must be used within a SampleProvider');
  }

  const { batchService, store } = context;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [storeState, setStoreState] = useState<SampleState>(store.getState());

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = store.subscribe(setStoreState);
    return unsubscribe;
  }, [store]);

  // Fetch batches
  const fetchBatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await batchService.getBatches();
      store.setBatches(response.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch batches'));
    } finally {
      setIsLoading(false);
    }
  }, [batchService, store]);

  // Create batch
  const createBatch = useCallback(
    async (data: CreateBatchRequest): Promise<Batch> => {
      setError(null);

      try {
        const batch = await batchService.createBatch(data);
        store.addBatch(batch);
        return batch;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create batch');
        setError(error);
        throw error;
      }
    },
    [batchService, store]
  );

  // Update batch
  const updateBatch = useCallback(
    async (id: string, data: UpdateBatchRequest): Promise<Batch> => {
      setError(null);

      // Optimistic update
      const snapshot = store.createSnapshot();
      store.updateBatch(id, data);

      try {
        const batch = await batchService.updateBatch(id, data);
        store.updateBatch(id, batch);
        return batch;
      } catch (err) {
        // Rollback
        store.restoreSnapshot(snapshot);
        const error = err instanceof Error ? err : new Error('Failed to update batch');
        setError(error);
        throw error;
      }
    },
    [batchService, store]
  );

  // Delete batch
  const deleteBatch = useCallback(
    async (id: string): Promise<void> => {
      setError(null);

      // Optimistic update
      const snapshot = store.createSnapshot();
      store.removeBatch(id);

      try {
        await batchService.deleteBatch(id);
      } catch (err) {
        // Rollback
        store.restoreSnapshot(snapshot);
        const error = err instanceof Error ? err : new Error('Failed to delete batch');
        setError(error);
        throw error;
      }
    },
    [batchService, store]
  );

  // Add samples to batch
  const addSamplesToBatch = useCallback(
    async (batchId: string, sampleIds: string[]): Promise<void> => {
      setError(null);

      try {
        const batch = await batchService.addSamplesToBatch(batchId, sampleIds);
        store.updateBatch(batchId, batch);

        // Update samples' batchId
        sampleIds.forEach((sampleId) => {
          store.updateSample(sampleId, { batchId });
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to add samples to batch');
        setError(error);
        throw error;
      }
    },
    [batchService, store]
  );

  // Remove samples from batch
  const removeSamplesFromBatch = useCallback(
    async (batchId: string, sampleIds: string[]): Promise<void> => {
      setError(null);

      try {
        const batch = await batchService.removeSamplesFromBatch(batchId, sampleIds);
        store.updateBatch(batchId, batch);

        // Update samples' batchId
        sampleIds.forEach((sampleId) => {
          store.updateSample(sampleId, { batchId: null });
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to remove samples from batch');
        setError(error);
        throw error;
      }
    },
    [batchService, store]
  );

  // Get batches from store
  const batches = Array.from(storeState.batches.values());

  return {
    batches,
    isLoading,
    error,
    fetchBatches,
    createBatch,
    updateBatch,
    deleteBatch,
    addSamplesToBatch,
    removeSamplesFromBatch,
  };
}
