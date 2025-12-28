/**
 * Genomic variant representing a DNA sequence change
 */
export interface Variant {
  /** Chromosome (e.g., 'chr1', 'chrX') */
  chromosome: string;
  /** Genomic position (1-based) */
  position: number;
  /** Reference allele */
  ref: string;
  /** Alternate allele */
  alt: string;
  /** Gene symbol (e.g., 'BRCA1') */
  gene: string;
  /** Transcript ID (e.g., 'NM_007294.4') */
  transcript: string;
  /** Variant consequence (e.g., 'missense_variant', 'frameshift_variant') */
  consequence: string;
}

/**
 * Population allele frequencies from various databases
 */
export interface PopulationFrequency {
  /** gnomAD global allele frequency */
  gnomadAF: number | null;
  /** gnomAD East Asian allele frequency */
  gnomadEastAsianAF: number | null;
  /** 1000 Genomes allele frequency */
  thousandGenomesAF: number | null;
  /** Local database allele frequency */
  localAF: number | null;
}

/**
 * Functional impact predictions from various tools
 */
export interface FunctionalPrediction {
  /** SIFT prediction (e.g., 'deleterious', 'tolerated') */
  sift: string | null;
  /** PolyPhen-2 prediction (e.g., 'probably_damaging', 'benign') */
  polyphen: string | null;
  /** CADD phred-scaled score */
  cadd: number | null;
  /** REVEL score (0-1) */
  revel: number | null;
}

/**
 * Conservation scores indicating evolutionary constraint
 */
export interface ConservationScore {
  /** PhyloP conservation score */
  phyloP: number | null;
  /** GERP++ rejected substitutions score */
  gerp: number | null;
}

/**
 * Complete variant annotation with all associated data
 */
export interface VariantAnnotation {
  /** The variant being annotated */
  variant: Variant;
  /** Population frequency data */
  populationFrequency: PopulationFrequency;
  /** Functional prediction scores */
  functionalPrediction: FunctionalPrediction;
  /** Conservation scores */
  conservationScore: ConservationScore;
  /** ClinVar clinical significance */
  clinvarSignificance: string | null;
  /** SpliceAI delta score (max of all splice effects) */
  spliceAI: number | null;
}
