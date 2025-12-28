import { useContext, useCallback, useEffect, useState } from 'react';
import type { Batch, Patient } from '@schema/types';
import { SampleContext } from '../providers/SampleContext.js';
import type { SampleWithRelations, UpdateSampleRequest } from '../types.js';

/**
 * Return type for useSample hook
 */
export interface UseSampleReturn {
  /** Sample with relations */
  sample: SampleWithRelations | null;
  /** Associated patient */
  patient: Patient | null;
  /** Associated batch */
  batch: Batch | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;

  // Actions
  /** Update the sample */
  updateSample: (data: UpdateSampleRequest) => Promise<SampleWithRelations>;
  /** Delete the sample */
  deleteSample: () => Promise<void>;
  /** Refetch the sample */
  refetch: () => Promise<void>;
}

/**
 * Hook for managing a single sample
 */
export function useSample(id: string): UseSampleReturn {
  const context = useContext(SampleContext);
  if (!context) {
    throw new Error('useSample must be used within a SampleProvider');
  }

  const { sampleService, store } = context;

  const [sample, setSample] = useState<SampleWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch sample
  const fetchSample = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await sampleService.getSample(id);
      setSample(data);

      // Cache in store
      store.addSample(data);
      if (data.patient) {
        store.addPatient(data.patient);
      }
      if (data.batch) {
        store.addBatch(data.batch);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch sample'));
    } finally {
      setIsLoading(false);
    }
  }, [id, sampleService, store]);

  // Fetch on mount and when ID changes
  useEffect(() => {
    void fetchSample();
  }, [fetchSample]);

  // Update sample
  const updateSample = useCallback(
    async (data: UpdateSampleRequest): Promise<SampleWithRelations> => {
      setError(null);

      // Optimistic update
      const previousSample = sample;
      if (sample) {
        setSample({ ...sample, ...data });
      }

      try {
        const updated = await sampleService.updateSample(id, data);
        const fullSample = await sampleService.getSample(id);
        setSample(fullSample);
        store.updateSample(id, updated);
        return fullSample;
      } catch (err) {
        // Rollback
        setSample(previousSample);
        const error = err instanceof Error ? err : new Error('Failed to update sample');
        setError(error);
        throw error;
      }
    },
    [id, sample, sampleService, store]
  );

  // Delete sample
  const deleteSample = useCallback(async (): Promise<void> => {
    setError(null);

    try {
      await sampleService.deleteSample(id);
      store.removeSample(id);
      setSample(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete sample');
      setError(error);
      throw error;
    }
  }, [id, sampleService, store]);

  return {
    sample,
    patient: sample?.patient ?? null,
    batch: sample?.batch ?? null,
    isLoading,
    error,
    updateSample,
    deleteSample,
    refetch: fetchSample,
  };
}
