/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  /** Items for the current page */
  items: T[];
  /** Total number of items */
  total: number;
  /** Current page number (1-based) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

/**
 * Default page size
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Maximum page size
 */
export const MAX_PAGE_SIZE = 100;

/**
 * Paginate an array of items
 * @param items - Array of items to paginate
 * @param page - Page number (1-based)
 * @param pageSize - Number of items per page
 * @returns Paginated result
 */
export function paginateResults<T>(
  items: T[],
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): PaginatedResult<T> {
  // Normalize page and pageSize
  const normalizedPage = Math.max(1, Math.floor(page));
  const normalizedPageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(pageSize))
  );

  const total = items.length;
  const totalPages = Math.ceil(total / normalizedPageSize);

  // Calculate start and end indices
  const startIndex = (normalizedPage - 1) * normalizedPageSize;
  const endIndex = Math.min(startIndex + normalizedPageSize, total);

  // Get items for the current page
  const pageItems = items.slice(startIndex, endIndex);

  return {
    items: pageItems,
    total,
    page: normalizedPage,
    pageSize: normalizedPageSize,
    totalPages,
    hasNextPage: normalizedPage < totalPages,
    hasPreviousPage: normalizedPage > 1,
  };
}

/**
 * Calculate pagination metadata without slicing items
 * @param total - Total number of items
 * @param page - Page number (1-based)
 * @param pageSize - Number of items per page
 * @returns Pagination metadata
 */
export function calculatePagination(
  total: number,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): Omit<PaginatedResult<never>, 'items'> {
  const normalizedPage = Math.max(1, Math.floor(page));
  const normalizedPageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(pageSize))
  );

  const totalPages = Math.ceil(total / normalizedPageSize);

  return {
    total,
    page: normalizedPage,
    pageSize: normalizedPageSize,
    totalPages,
    hasNextPage: normalizedPage < totalPages,
    hasPreviousPage: normalizedPage > 1,
  };
}

/**
 * Get offset for database queries
 * @param page - Page number (1-based)
 * @param pageSize - Number of items per page
 * @returns Offset value
 */
export function getOffset(
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): number {
  const normalizedPage = Math.max(1, Math.floor(page));
  const normalizedPageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(pageSize))
  );

  return (normalizedPage - 1) * normalizedPageSize;
}

/**
 * Get limit for database queries
 * @param pageSize - Number of items per page
 * @returns Limit value
 */
export function getLimit(pageSize: number = DEFAULT_PAGE_SIZE): number {
  return Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize)));
}
