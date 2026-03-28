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
  /** Sample matched with sequencing data */
  MATCHED = 'MATCHED',
  /** Sample currently being analyzed */
  ANALYZING = 'ANALYZING',
  /** Processing completed successfully */
  COMPLETED = 'COMPLETED',
  /** Processing failed */
  FAILED = 'FAILED',
}

/**
 * Sample entity representing a genomic sample
 */
export interface Sample {
  /** Unique sample identifier (UUID) */
  id: string;
  /** Organization ID */
  orgId: string;
  /** Internal sample ID */
  internalId?: string;
  /** Sample display name */
  name: string;
  /** Gender of the patient */
  gender?: string;
  /** Age of the patient */
  age?: number;
  /** Birth date */
  birthDate?: string;
  /** Type of genomic sample */
  sampleType: SampleType;
  /** Current processing status */
  status: SampleStatus;
  /** Associated hospital */
  hospital?: string;
  /** Test items */
  testItems?: string;
  /** Batch ID if part of a batch (null if standalone) */
  batchId: string | null;
  /** Parent sample ID for redo samples */
  parentSampleId?: string;
  /** Reason for redo */
  redoReason?: string;
  /** ISO 8601 timestamp when the sample was created */
  createdAt: string;
  /** ISO 8601 timestamp when the sample was last updated */
  updatedAt: string;
}

/**
 * Sample matching data for sequencing
 */
export interface SampleMatchingData {
  /** Sequencing ID */
  sequencingId: string;
  /** Run ID */
  runId: string;
  /** Lane ID */
  laneId: string;
  /** Data size */
  dataSize: string;
  /** File type */
  fileType: string;
  /** Match status */
  matchStatus: 'matched' | 'unmatched' | 'available';
  /** Match timestamp */
  matchedAt?: string;
}
