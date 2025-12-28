/**
 * Standard API error response structure
 */
export interface ApiError {
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Discriminated union type for API responses
 * @template T - The type of data in successful responses
 */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };
