import type { ReportContent } from './content.types.js';

/**
 * Types of analysis reports
 */
export enum ReportType {
  /** Germline variant analysis report */
  GERMLINE_ANALYSIS = 'GERMLINE_ANALYSIS',
  /** Somatic variant analysis report */
  SOMATIC_ANALYSIS = 'SOMATIC_ANALYSIS',
  /** Pharmacogenomics report */
  PHARMACOGENOMICS = 'PHARMACOGENOMICS',
}

/**
 * Report workflow status
 */
export enum ReportStatus {
  /** Report is being drafted */
  DRAFT = 'DRAFT',
  /** Report submitted for review */
  PENDING_REVIEW = 'PENDING_REVIEW',
  /** Report approved by reviewer */
  APPROVED = 'APPROVED',
  /** Report published and finalized */
  PUBLISHED = 'PUBLISHED',
}

/**
 * Report entity representing an analysis report
 */
export interface Report {
  /** Unique report identifier */
  id: string;
  /** Associated sample ID */
  sampleId: string;
  /** Type of analysis report */
  type: ReportType;
  /** Current workflow status */
  status: ReportStatus;
  /** Report content including variants and interpretation */
  content: ReportContent;
  /** ISO 8601 timestamp when the report was created */
  createdAt: string;
  /** ISO 8601 timestamp when the report was last updated */
  updatedAt: string;
}
