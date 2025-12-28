import { useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { SampleContext } from './SampleContext.js';
import type { SampleContextValue } from './SampleContext.js';
import { createSampleService } from '../services/sample.service.js';
import type { SampleService } from '../services/sample.service.js';
import { createBatchService } from '../services/batch.service.js';
import type { BatchService } from '../services/batch.service.js';
import { createPatientService } from '../services/patient.service.js';
import type { PatientService } from '../services/patient.service.js';
import { createSampleStore } from '../stores/sample.store.js';
import type { SampleStore } from '../stores/sample.store.js';

/**
 * Sample provider props
 */
export interface SampleProviderProps {
  /** Child components */
  children: ReactNode;
  /** Base URL for the API */
  apiBaseUrl: string;
}

/**
 * Sample provider component
 *
 * Provides sample, batch, and patient services along with the sample store
 * to all child components.
 */
export function SampleProvider({
  children,
  apiBaseUrl,
}: SampleProviderProps): JSX.Element {
  // Create services and store (only once)
  const sampleServiceRef = useRef<SampleService | null>(null);
  const batchServiceRef = useRef<BatchService | null>(null);
  const patientServiceRef = useRef<PatientService | null>(null);
  const storeRef = useRef<SampleStore | null>(null);

  if (!sampleServiceRef.current) {
    sampleServiceRef.current = createSampleService({ baseUrl: apiBaseUrl });
  }
  if (!batchServiceRef.current) {
    batchServiceRef.current = createBatchService({ baseUrl: apiBaseUrl });
  }
  if (!patientServiceRef.current) {
    patientServiceRef.current = createPatientService({ baseUrl: apiBaseUrl });
  }
  if (!storeRef.current) {
    storeRef.current = createSampleStore();
  }

  // Memoize context value
  const contextValue = useMemo<SampleContextValue>(
    () => ({
      sampleService: sampleServiceRef.current!,
      batchService: batchServiceRef.current!,
      patientService: patientServiceRef.current!,
      store: storeRef.current!,
    }),
    []
  );

  return (
    <SampleContext.Provider value={contextValue}>
      {children}
    </SampleContext.Provider>
  );
}
