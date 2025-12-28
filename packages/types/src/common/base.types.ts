/**
 * Base entity interface with common fields for all entities
 */
export interface BaseEntity {
  /** Unique identifier */
  id: string;
  /** ISO 8601 timestamp when the entity was created */
  createdAt: string;
  /** ISO 8601 timestamp when the entity was last updated */
  updatedAt: string;
}

/**
 * Timestamp fields for entities that track creation and update times
 */
export interface Timestamp {
  /** ISO 8601 timestamp when the entity was created */
  createdAt: string;
  /** ISO 8601 timestamp when the entity was last updated */
  updatedAt: string;
}
