/**
 * ACMG/AMP variant classification for germline variants
 * Based on Richards et al. 2015 guidelines
 */
export enum ACMGClassification {
  /** Pathogenic - disease-causing */
  PATHOGENIC = 'PATHOGENIC',
  /** Likely pathogenic - probably disease-causing */
  LIKELY_PATHOGENIC = 'LIKELY_PATHOGENIC',
  /** Variant of uncertain significance */
  VUS = 'VUS',
  /** Likely benign - probably not disease-causing */
  LIKELY_BENIGN = 'LIKELY_BENIGN',
  /** Benign - not disease-causing */
  BENIGN = 'BENIGN',
}

/**
 * Evidence strength levels for ACMG criteria
 */
export enum ACMGEvidenceStrength {
  /** Very strong evidence (e.g., PVS1) */
  VERY_STRONG = 'VERY_STRONG',
  /** Strong evidence (e.g., PS1-PS4) */
  STRONG = 'STRONG',
  /** Moderate evidence (e.g., PM1-PM6) */
  MODERATE = 'MODERATE',
  /** Supporting evidence (e.g., PP1-PP5) */
  SUPPORTING = 'SUPPORTING',
}

/**
 * Individual ACMG evidence item
 */
export interface ACMGEvidence {
  /** Evidence code (e.g., 'PVS1', 'PS1', 'PM2', 'PP3') */
  code: string;
  /** Evidence strength level */
  strength: ACMGEvidenceStrength;
  /** Human-readable description of the evidence */
  description: string;
  /** Whether this evidence is selected/applicable */
  selected: boolean;
}
