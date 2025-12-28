/**
 * Variant Data Types
 */

/**
 * Variant type enumeration
 */
export enum VariantType {
  /** Single nucleotide variant */
  SNV = 'SNV',
  /** Insertion */
  INSERTION = 'INSERTION',
  /** Deletion */
  DELETION = 'DELETION',
  /** Insertion/Deletion */
  INDEL = 'INDEL',
  /** Copy number variation */
  CNV = 'CNV',
  /** Structural variant */
  SV = 'SV',
}

/**
 * Clinical significance classification
 */
export enum ClinicalSignificance {
  /** Pathogenic */
  PATHOGENIC = 'PATHOGENIC',
  /** Likely pathogenic */
  LIKELY_PATHOGENIC = 'LIKELY_PATHOGENIC',
  /** Uncertain significance */
  UNCERTAIN = 'UNCERTAIN',
  /** Likely benign */
  LIKELY_BENIGN = 'LIKELY_BENIGN',
  /** Benign */
  BENIGN = 'BENIGN',
}

/**
 * Variant data structure
 */
export interface Variant {
  /** Unique variant identifier */
  id: string;

  /** Chromosome (e.g., 'chr1', '1', 'X') */
  chromosome: string;

  /** Genomic position (1-based) */
  position: number;

  /** Reference allele */
  reference: string;

  /** Alternate allele */
  alternate: string;

  /** Variant type */
  variantType: VariantType;

  /** Gene symbol (e.g., 'BRCA1') */
  gene?: string;

  /** Ensembl gene ID (e.g., 'ENSG00000012048') */
  ensemblGeneId?: string;

  /** Transcript ID */
  transcript?: string;

  /** Variant consequence (e.g., 'missense_variant') */
  consequence?: string;

  /** Clinical significance */
  clinicalSignificance?: ClinicalSignificance;

  /** Population frequency (0-1) */
  populationFrequency?: number;

  /** CADD score */
  caddScore?: number;

  /** REVEL score */
  revelScore?: number;

  /** Sample ID */
  sampleId: string;

  /** Genotype (e.g., '0/1', '1/1') */
  genotype?: string;

  /** Variant quality score */
  quality?: number;

  /** Read depth */
  depth?: number;

  /** Allele depth (ref, alt) */
  alleleDepth?: [number, number];

  /** ClinVar ID */
  clinvarId?: string;

  /** dbSNP ID */
  dbsnpId?: string;

  /** HGVS notation */
  hgvs?: string;

  /** Additional annotations */
  annotations?: Record<string, unknown>;
}

/**
 * Region query parameters
 */
export interface RegionQueryParams {
  /** Chromosome */
  chromosome: string;

  /** Start position (1-based, inclusive) */
  start: number;

  /** End position (1-based, inclusive) */
  end: number;

  /** Filter by sample IDs */
  sampleIds?: string[];
}

/**
 * Gene query parameters
 */
export interface GeneQueryParams {
  /** Gene symbol */
  geneSymbol?: string;

  /** Ensembl gene ID */
  ensemblId?: string;

  /** Filter by sample IDs */
  sampleIds?: string[];
}

/**
 * Variant query parameters
 */
export interface VariantQueryParams {
  /** Genomic region filter */
  region?: RegionQueryParams;

  /** Gene filter */
  gene?: GeneQueryParams;

  /** Variant type filter */
  variantTypes?: VariantType[];

  /** Clinical significance filter */
  clinicalSignificance?: ClinicalSignificance[];

  /** Maximum population frequency (0-1) */
  maxPopulationFrequency?: number;

  /** Minimum population frequency (0-1) */
  minPopulationFrequency?: number;

  /** Minimum CADD score */
  minCaddScore?: number;

  /** Maximum CADD score */
  maxCaddScore?: number;

  /** Minimum REVEL score */
  minRevelScore?: number;

  /** Maximum REVEL score */
  maxRevelScore?: number;

  /** Minimum quality score */
  minQuality?: number;

  /** Minimum read depth */
  minDepth?: number;

  /** Filter by sample IDs */
  sampleIds?: string[];

  /** Filter by genotypes */
  genotypes?: string[];

  /** Filter by consequences */
  consequences?: string[];

  /** Page number (1-based) */
  page?: number;

  /** Items per page */
  pageSize?: number;

  /** Sort by field */
  sortBy?: keyof Variant;

  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Variant filter (for combining multiple conditions)
 */
export interface VariantFilter {
  /** Filter field */
  field: keyof Variant;

  /** Filter operator */
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'notIn' | 'between' | 'like';

  /** Filter value */
  value: unknown;
}

/**
 * Combined filter with logical operators
 */
export interface CombinedFilter {
  /** Logical operator */
  operator: 'AND' | 'OR';

  /** Filters to combine */
  filters: Array<VariantFilter | CombinedFilter>;
}
