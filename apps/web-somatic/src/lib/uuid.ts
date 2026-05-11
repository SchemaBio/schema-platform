/**
 * Cryptographically secure UUID v4 generator
 * Uses Web Crypto API via crypto.randomUUID()
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * UUID v4 format validation
 * Matches: xxxxxxxx-xxxx-4xxx-[89ab]xxx-xxxxxxxxxxxx
 */
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUID(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}
