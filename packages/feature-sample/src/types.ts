import type {
  Sample,
  SampleType,
  SampleStatus,
  Batch,
  Patient,
  Gender,
  PaginatedResponse,
} from '@schema/types';

// Re-export types from @schema/types for convenience
export type {
  Sample,
  SampleType,
  SampleStatus,
  Batch,
  Patient,
  Gender,
  PaginatedResponse,
};

// ============================================================================
// Quality Control Report
// ============================================================================

/**
 * Quality control report for a sample
 */
export interface QCReport {
  /** Sample ID this report belongs to */
  sampleId: string;
  /** Average sequencing depth */
  sequencingDepth: number;
  /** Percentage of target regions covered */
  coverage: number;
  /** Percentage of bases with Q30 or higher quality */
  q30Percentage: number;
  /** Total number of reads */
  totalReads: number;
  /** Number of mapped reads */
  mappedReads: number;
  /** Duplicate read rate (0-1) */
  duplicateRate: number;
  /** ISO 8601 timestamp when the report was created */
  createdAt: string;
}

// ============================================================================
// Analysis Status
// ============================================================================

/**
 * Analysis pipeline stages
 */
export type AnalysisStage =
  | 'QUEUED'
  | 'ALIGNMENT'
  | 'VARIANT_CALLING'
  | 'ANNOTATION'
  | 'COMPLETED'
  | 'FAILED';

/**
 * Analysis status for a sample
 */
export interface AnalysisStatus {
  /** Sample ID this status belongs to */
  sampleId: string;
  /** Current analysis stage */
  stage: AnalysisStage;
  /** Progress percentage (0-100) */
  progress: number;
  /** ISO 8601 timestamp when analysis started */
  startedAt?: string;
  /** ISO 8601 timestamp when analysis completed */
  completedAt?: string;
  /** Error message if analysis failed */
  errorMessage?: string;
}

// ============================================================================
// Extended Sample Types
// ============================================================================

/**
 * Sample with all related entities
 */
export interface SampleWithRelations extends Sample {
  /** Associated patient */
  patient?: Patient;
  /** Associated batch */
  batch?: Batch;
  /** Quality control report */
  qcReport?: QCReport;
  /** Paired sample (for TUMOR_NORMAL_PAIR) */
  pairedSample?: Sample;
  /** Analysis status */
  analysisStatus?: AnalysisStatus;
}

// ============================================================================
// Request Types
// ============================================================================

/**
 * Query parameters for listing samples
 */
export interface SampleQueryParams {
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Search query string */
  search?: string;
  /** Filter by sample type */
  sampleType?: SampleType;
  /** Filter by status */
  status?: SampleStatus;
  /** Filter by batch ID */
  batchId?: string;
  /** Filter by patient ID */
  patientId?: string;
  /** Sort field */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Filter samples created after this date */
  createdAfter?: string;
  /** Filter samples created before this date */
  createdBefore?: string;
}

/**
 * Request to create a new sample
 */
export interface CreateSampleRequest {
  /** Sample name */
  name: string;
  /** Patient ID */
  patientId: string;
  /** Sample type */
  sampleType: SampleType;
  /** Batch ID (optional) */
  batchId?: string;
  /** Paired sample ID (required for TUMOR_NORMAL_PAIR) */
  pairedSampleId?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Request to update a sample
 */
export interface UpdateSampleRequest {
  /** New sample name */
  name?: string;
  /** Updated metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Query parameters for listing batches
 */
export interface BatchQueryParams {
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Filter by status */
  status?: SampleStatus;
  /** Sort field */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Request to create a new batch
 */
export interface CreateBatchRequest {
  /** Batch name */
  name: string;
  /** Initial sample IDs */
  sampleIds?: string[];
}

/**
 * Request to update a batch
 */
export interface UpdateBatchRequest {
  /** New batch name */
  name?: string;
}

/**
 * Query parameters for listing patients
 */
export interface PatientQueryParams {
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Search query string */
  search?: string;
  /** Filter by gender */
  gender?: Gender;
  /** Sort field */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Request to create a new patient
 */
export interface CreatePatientRequest {
  /** Patient name */
  name: string;
  /** Patient gender */
  gender: Gender;
  /** Birth date in ISO 8601 format (YYYY-MM-DD) */
  birthDate: string;
  /** HPO term IDs */
  phenotypes?: string[];
}

/**
 * Request to update a patient
 */
export interface UpdatePatientRequest {
  /** New patient name */
  name?: string;
  /** New gender */
  gender?: Gender;
  /** New birth date */
  birthDate?: string;
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Sample filter options for UI
 */
export interface SampleFilters {
  /** Search query */
  search?: string;
  /** Filter by sample type */
  sampleType?: SampleType;
  /** Filter by status */
  status?: SampleStatus;
  /** Filter by batch ID */
  batchId?: string;
  /** Filter samples created after this date */
  createdAfter?: string;
  /** Filter samples created before this date */
  createdBefore?: string;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Error thrown when a sample is not found
 */
export class SampleNotFoundError extends Error {
  constructor(id: string) {
    super(`Sample not found: ${id}`);
    this.name = 'SampleNotFoundError';
  }
}

/**
 * Error thrown when trying to modify a processing sample
 */
export class SampleProcessingError extends Error {
  constructor(id: string, operation: string) {
    super(`Cannot ${operation} sample ${id}: sample is currently processing`);
    this.name = 'SampleProcessingError';
  }
}

/**
 * Error thrown when a batch is not found
 */
export class BatchNotFoundError extends Error {
  constructor(id: string) {
    super(`Batch not found: ${id}`);
    this.name = 'BatchNotFoundError';
  }
}

/**
 * Error thrown when a patient is not found
 */
export class PatientNotFoundError extends Error {
  constructor(id: string) {
    super(`Patient not found: ${id}`);
    this.name = 'PatientNotFoundError';
  }
}

/**
 * Error thrown when trying to delete a patient with associated samples
 */
export class PatientHasSamplesError extends Error {
  constructor(id: string) {
    super(`Cannot delete patient ${id}: patient has associated samples`);
    this.name = 'PatientHasSamplesError';
  }
}

/**
 * Validation error with field-specific messages
 */
export class ValidationError extends Error {
  constructor(public fields: Record<string, string>) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}
