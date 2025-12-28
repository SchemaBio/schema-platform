/**
 * Patient gender
 */
export enum Gender {
  /** Male */
  MALE = 'MALE',
  /** Female */
  FEMALE = 'FEMALE',
  /** Unknown or not specified */
  UNKNOWN = 'UNKNOWN',
}

/**
 * Patient entity representing a patient in the system
 */
export interface Patient {
  /** Unique patient identifier */
  id: string;
  /** Patient name */
  name: string;
  /** Patient gender */
  gender: Gender;
  /** Patient birth date in ISO 8601 format (YYYY-MM-DD) */
  birthDate: string;
  /** Array of HPO (Human Phenotype Ontology) term IDs */
  phenotypes: string[];
}
