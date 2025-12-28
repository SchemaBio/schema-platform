/**
 * AMP/ASCO/CAP tier classification for somatic variants
 * Based on Li et al. 2017 guidelines
 */
export enum AMPTier {
  /** Tier I - Variants with strong clinical significance */
  TIER_1 = 'TIER_1',
  /** Tier II - Variants with potential clinical significance */
  TIER_2 = 'TIER_2',
  /** Tier III - Variants of unknown clinical significance */
  TIER_3 = 'TIER_3',
  /** Tier IV - Benign or likely benign variants */
  TIER_4 = 'TIER_4',
}

/**
 * Evidence levels for therapeutic actionability
 */
export enum EvidenceLevel {
  /** Level A - FDA-approved therapy or included in professional guidelines */
  A = 'A',
  /** Level B - Well-powered studies with consensus */
  B = 'B',
  /** Level C - FDA-approved for different tumor type or case studies */
  C = 'C',
  /** Level D - Preclinical or case studies without consensus */
  D = 'D',
}
