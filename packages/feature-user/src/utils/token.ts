/**
 * Default threshold for token refresh (5 minutes before expiry)
 */
const DEFAULT_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * Parse ISO 8601 expiry timestamp to Date
 * @param expiresAt - ISO 8601 timestamp string
 * @returns Date object or null if invalid
 */
export function parseTokenExpiry(expiresAt: string): Date | null {
  if (!expiresAt) return null;

  try {
    const date = new Date(expiresAt);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}

/**
 * Check if token has expired
 * @param expiresAt - ISO 8601 expiry timestamp
 * @returns true if token is expired
 */
export function isTokenExpired(expiresAt: string): boolean {
  const expiry = parseTokenExpiry(expiresAt);
  if (!expiry) return true; // Treat invalid expiry as expired

  return Date.now() >= expiry.getTime();
}

/**
 * Check if token is about to expire (within threshold)
 * @param expiresAt - ISO 8601 expiry timestamp
 * @param thresholdMs - Milliseconds before expiry to consider "expiring"
 * @returns true if token is expiring soon
 */
export function isTokenExpiring(
  expiresAt: string,
  thresholdMs: number = DEFAULT_REFRESH_THRESHOLD_MS
): boolean {
  const expiry = parseTokenExpiry(expiresAt);
  if (!expiry) return true; // Treat invalid expiry as expiring

  const expiryTime = expiry.getTime();
  const now = Date.now();

  // Already expired
  if (now >= expiryTime) return true;

  // Within threshold
  return now >= expiryTime - thresholdMs;
}

/**
 * Get time remaining until token expires
 * @param expiresAt - ISO 8601 expiry timestamp
 * @returns Milliseconds until expiry, or 0 if expired/invalid
 */
export function getTokenTimeRemaining(expiresAt: string): number {
  const expiry = parseTokenExpiry(expiresAt);
  if (!expiry) return 0;

  const remaining = expiry.getTime() - Date.now();
  return Math.max(0, remaining);
}

/**
 * Calculate when to schedule token refresh
 * @param expiresAt - ISO 8601 expiry timestamp
 * @param thresholdMs - Milliseconds before expiry to refresh
 * @returns Milliseconds until refresh should occur, or 0 if should refresh now
 */
export function getRefreshDelay(
  expiresAt: string,
  thresholdMs: number = DEFAULT_REFRESH_THRESHOLD_MS
): number {
  const remaining = getTokenTimeRemaining(expiresAt);
  if (remaining === 0) return 0;

  const delay = remaining - thresholdMs;
  return Math.max(0, delay);
}

/**
 * Check if token is valid (not expired and has required fields)
 * @param token - Token object with expiresAt field
 * @returns true if token is valid
 */
export function isValidToken(token: { expiresAt: string } | null | undefined): boolean {
  if (!token || !token.expiresAt) return false;
  return !isTokenExpired(token.expiresAt);
}
