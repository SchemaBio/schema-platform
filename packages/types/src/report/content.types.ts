import type { ACMGClassification } from '../variant/acmg.types.js';
import type { AMPTier } from '../variant/amp.types.js';

/**
 * A variant selected for inclusion in a report
 */
export interface SelectedVariant {
  /** Reference to the variant ID */
  variantId: string;
  /** Classification (ACMG for germline, AMP tier for somatic) */
  classification: ACMGClassification | AMPTier;
  /** Clinical interpretation text */
  interpretation: string;
}

/**
 * Report content structure
 */
export interface ReportContent {
  /** Variants selected for the report */
  selectedVariants: SelectedVariant[];
  /** Overall clinical interpretation */
  interpretation: string;
  /** Clinical recommendations */
  recommendations: string[];
}
