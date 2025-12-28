import { createContext } from 'react';
import type { SampleService } from '../services/sample.service.js';
import type { BatchService } from '../services/batch.service.js';
import type { PatientService } from '../services/patient.service.js';
import type { SampleStore } from '../stores/sample.store.js';

/**
 * Sample context value
 */
export interface SampleContextValue {
  /** Sample service instance */
  sampleService: SampleService;
  /** Batch service instance */
  batchService: BatchService;
  /** Patient service instance */
  patientService: PatientService;
  /** Sample store instance */
  store: SampleStore;
}

/**
 * Sample context
 */
export const SampleContext = createContext<SampleContextValue | null>(null);

/**
 * Sample context display name for debugging
 */
SampleContext.displayName = 'SampleContext';
