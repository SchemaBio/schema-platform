import type { SampleStatus } from './sample.types.js';

/**
 * Batch entity representing a group of samples processed together
 */
export interface Batch {
  /** Unique batch identifier */
  id: string;
  /** Batch display name */
  name: string;
  /** Array of sample IDs in this batch */
  sampleIds: string[];
  /** ISO 8601 timestamp when the batch was created */
  createdAt: string;
  /** Overall batch processing status */
  status: SampleStatus;
}
