/**
 * Types of genomic samples
 */
export enum SampleType {
  /** Germline sample for hereditary disease analysis */
  GERMLINE = 'GERMLINE',
  /** Somatic sample for tumor analysis */
  SOMATIC = 'SOMATIC',
  /** Paired tumor-normal samples */
  TUMOR_NORMAL_PAIR = 'TUMOR_NORMAL_PAIR',
}

/**
 * Sample processing status
 */
export enum SampleStatus {
  /** Sample uploaded, awaiting processing */
  PENDING = 'PENDING',
  /** Sample currently being processed */
  PROCESSING = 'PROCESSING',
  /** Processing completed successfully */
  COMPLETED = 'COMPLETED',
  /** Processing failed */
  FAILED = 'FAILED',
}

/**
 * Sample entity representing a genomic sample
 */
export interface Sample {
  /** Unique sample identifier */
  id: string;
  /** Sample display name */
  name: string;
  /** Associated patient ID */
  patientId: string;
  /** Type of genomic sample */
  sampleType: SampleType;
  /** Current processing status */
  status: SampleStatus;
  /** Batch ID if part of a batch (null if standalone) */
  batchId: string | null;
  /** ISO 8601 timestamp when the sample was created */
  createdAt: string;
  /** ISO 8601 timestamp when the sample was last updated */
  updatedAt: string;
}
