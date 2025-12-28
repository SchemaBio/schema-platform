/**
 * Sort order for paginated queries
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Request parameters for paginated API endpoints
 */
export interface PaginatedRequest {
  /** Page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Field name to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: SortOrder;
}

/**
 * Response wrapper for paginated data
 * @template T - The type of items in the response
 */
export interface PaginatedResponse<T> {
  /** Array of items for the current page */
  items: T[];
  /** Total number of items across all pages */
  total: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
}
