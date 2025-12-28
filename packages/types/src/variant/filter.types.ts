import type { ACMGClassification } from './acmg.types.js';
import type { AMPTier } from './amp.types.js';

/**
 * Filter criteria for variant queries
 */
export interface VariantFilter {
  /** Filter by gene symbols */
  genes?: string[];
  /** Maximum population allele frequency threshold */
  maxFrequency?: number;
  /** Filter by variant consequences */
  consequences?: string[];
  /** Filter by ACMG classifications (germline) */
  acmgClassifications?: ACMGClassification[];
  /** Filter by AMP tiers (somatic) */
  ampTiers?: AMPTier[];
  /** Minimum CADD score threshold */
  minCadd?: number;
  /** Whether to include VUS variants */
  includeVus?: boolean;
}
