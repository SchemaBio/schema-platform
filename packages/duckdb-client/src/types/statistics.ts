/**
 * Statistics and Aggregation Types
 */

import type { VariantType, ClinicalSignificance } from './variant.js';

/**
 * Variant statistics summary
 */
export interface VariantStatistics {
  /** Total number of variants */
  totalCount: number;

  /** Count by variant type */
  byType: Record<VariantType, number>;

  /** Count by chromosome */
  byChromosome: Record<string, number>;

  /** Count by clinical significance */
  byClinicalSignificance: Record<ClinicalSignificance, number>;

  /** Population frequency statistics */
  frequencyStats: NumericStats;

  /** Quality score statistics */
  qualityStats?: NumericStats;

  /** Depth statistics */
  depthStats?: NumericStats;

  /** CADD score statistics */
  caddStats?: NumericStats;

  /** REVEL score statistics */
  revelStats?: NumericStats;
}

/**
 * Numeric statistics
 */
export interface NumericStats {
  /** Minimum value */
  min: number;

  /** Maximum value */
  max: number;

  /** Mean value */
  mean: number;

  /** Median value */
  median: number;

  /** Standard deviation */
  stddev?: number;

  /** 25th percentile */
  q1?: number;

  /** 75th percentile */
  q3?: number;

  /** Number of non-null values */
  count: number;

  /** Number of null values */
  nullCount: number;
}

/**
 * Statistics query parameters
 */
export interface StatisticsParams {
  /** Filter by sample IDs */
  sampleIds?: string[];

  /** Filter by variant types */
  variantTypes?: VariantType[];

  /** Filter by chromosomes */
  chromosomes?: string[];

  /** Include frequency statistics */
  includeFrequencyStats?: boolean;

  /** Include quality statistics */
  includeQualityStats?: boolean;

  /** Include depth statistics */
  includeDepthStats?: boolean;

  /** Include score statistics */
  includeScoreStats?: boolean;
}

/**
 * Histogram parameters
 */
export interface HistogramParams {
  /** Field to create histogram for */
  field: string;

  /** Number of bins (default: 20) */
  bins?: number;

  /** Minimum value (auto-detected if not specified) */
  min?: number;

  /** Maximum value (auto-detected if not specified) */
  max?: number;

  /** Filter by sample IDs */
  sampleIds?: string[];

  /** Additional filters */
  filters?: Record<string, unknown>;
}

/**
 * Histogram result
 */
export interface HistogramResult {
  /** Histogram bins */
  bins: HistogramBin[];

  /** Minimum value in data */
  min: number;

  /** Maximum value in data */
  max: number;

  /** Bin width */
  binWidth: number;

  /** Total count */
  totalCount: number;

  /** Field name */
  field: string;
}

/**
 * Histogram bin
 */
export interface HistogramBin {
  /** Bin start value (inclusive) */
  start: number;

  /** Bin end value (exclusive) */
  end: number;

  /** Count of values in this bin */
  count: number;

  /** Percentage of total */
  percentage: number;
}

/**
 * Group comparison parameters
 */
export interface CompareParams {
  /** First group sample IDs */
  group1: string[];

  /** Second group sample IDs */
  group2: string[];

  /** Group 1 label */
  group1Label?: string;

  /** Group 2 label */
  group2Label?: string;

  /** Fields to compare */
  compareFields?: string[];

  /** Include variant overlap analysis */
  includeOverlap?: boolean;
}

/**
 * Group comparison result
 */
export interface ComparisonResult {
  /** Group 1 statistics */
  group1Stats: GroupStats;

  /** Group 2 statistics */
  group2Stats: GroupStats;

  /** Variant overlap analysis */
  overlap?: OverlapAnalysis;

  /** Field comparisons */
  fieldComparisons: FieldComparison[];
}

/**
 * Group statistics
 */
export interface GroupStats {
  /** Group label */
  label: string;

  /** Sample IDs in group */
  sampleIds: string[];

  /** Total variant count */
  totalVariants: number;

  /** Unique variant count */
  uniqueVariants: number;

  /** Average variants per sample */
  avgVariantsPerSample: number;

  /** Variant type distribution */
  typeDistribution: Record<VariantType, number>;
}

/**
 * Variant overlap analysis
 */
export interface OverlapAnalysis {
  /** Variants only in group 1 */
  group1Only: number;

  /** Variants only in group 2 */
  group2Only: number;

  /** Variants in both groups */
  shared: number;

  /** Jaccard similarity index */
  jaccardIndex: number;

  /** Overlap percentage (shared / total unique) */
  overlapPercentage: number;
}

/**
 * Field comparison
 */
export interface FieldComparison {
  /** Field name */
  field: string;

  /** Group 1 statistics */
  group1: NumericStats;

  /** Group 2 statistics */
  group2: NumericStats;

  /** Difference in means */
  meanDifference: number;

  /** P-value (if statistical test performed) */
  pValue?: number;
}

/**
 * Cross-tabulation parameters
 */
export interface CrossTabParams {
  /** Row field */
  rowField: string;

  /** Column field */
  columnField: string;

  /** Filter by sample IDs */
  sampleIds?: string[];

  /** Include row/column totals */
  includeTotals?: boolean;
}

/**
 * Cross-tabulation result
 */
export interface CrossTabResult {
  /** Row labels */
  rowLabels: string[];

  /** Column labels */
  columnLabels: string[];

  /** Data matrix (rows x columns) */
  data: number[][];

  /** Row totals */
  rowTotals?: number[];

  /** Column totals */
  columnTotals?: number[];

  /** Grand total */
  grandTotal: number;
}
