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
  /** Report released and finalized */
  RELEASED = 'RELEASED',
}

/**
 * Source type of the report
 */
export enum ReportSourceType {
  /** Auto-generated from analysis */
  GENERATED = 'generated',
  /** Manually uploaded */
  UPLOADED = 'uploaded',
}

/**
 * Report template entity
 */
export interface ReportTemplate {
  /** Unique template identifier */
  id: string;
  /** Organization ID */
  orgId: string;
  /** Template name */
  name: string;
  /** Template description */
  description?: string;
  /** Template file path */
  templatePath?: string;
  /** Whether template is active */
  isActive: boolean;
}

/**
 * Report entity representing an analysis report
 */
export interface Report {
  /** Unique report identifier (UUID) */
  id: string;
  /** Organization ID */
  orgId: string;
  /** Associated task ID */
  taskId: string;
  /** Template ID if generated */
  templateId?: string;
  /** Report title */
  title: string;
  /** Current workflow status */
  status: ReportStatus;
  /** File path */
  filePath?: string;
  /** File name */
  fileName?: string;
  /** File type (pdf, docx) */
  fileType?: string;
  /** Source type (generated or uploaded) */
  reportType: ReportSourceType;
  /** User ID who created the report */
  createdBy: string;
  /** User ID who reviewed the report */
  reviewedBy?: string;
  /** User ID who approved the report */
  approvedBy?: string;
  /** User ID who released the report */
  releasedBy?: string;
  /** Review timestamp */
  reviewedAt?: string;
  /** Approval timestamp */
  approvedAt?: string;
  /** Release timestamp */
  releasedAt?: string;
  /** ISO 8601 timestamp when the report was created */
  createdAt: string;
  /** ISO 8601 timestamp when the report was last updated */
  updatedAt: string;
}

/**
 * Request to create a new report
 */
export interface CreateReportRequest {
  /** Report title */
  title: string;
  /** Template ID for generated reports */
  templateId?: string;
}

/**
 * Request to update report status
 */
export interface UpdateReportStatusRequest {
  /** New status */
  status: ReportStatus;
}
