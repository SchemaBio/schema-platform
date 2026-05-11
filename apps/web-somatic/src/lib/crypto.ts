/**
 * Client-side password hashing using SHA-256.
 *
 * WARNING: This is NOT enabled by default. The backend currently expects
 * plaintext passwords (hashed server-side with bcrypt). Enabling client-side
 * hashing requires BACKEND changes to hash the incoming value before bcrypt
 * comparison.
 *
 * To enable, set NEXT_PUBLIC_PASSWORD_HASH_ENABLED=true in .env and update
 * the backend to apply the same SHA-256 transform before bcrypt verify.
 */

const HASH_ENABLED = process.env.NEXT_PUBLIC_PASSWORD_HASH_ENABLED === 'true';

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string, email: string): Promise<string> {
  if (!HASH_ENABLED) return password;
  return sha256(password + email);
}

// ── AES-GCM encryption for sensitive localStorage data (AI API key) ──

const KEY_PASSPHRASE = 'schema-platform-local-protection-v1';
const KEY_SALT = new Uint8Array([
  0x73, 0x63, 0x68, 0x65, 0x6d, 0x61, 0x2d, 0x61,
  0x65, 0x73, 0x2d, 0x73, 0x61, 0x6c, 0x74, 0x30,
]);

async function deriveKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(KEY_PASSPHRASE),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: KEY_SALT,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a plaintext string for secure localStorage storage.
 * Returns base64-encoded "iv:ciphertext" string.
 */
export async function encryptStorageValue(plaintext: string): Promise<string> {
  const key = await deriveKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );
  const ivBase64 = btoa(String.fromCharCode(...Array.from(iv)));
  const ctBase64 = btoa(String.fromCharCode(...Array.from(new Uint8Array(ciphertext))));
  return `${ivBase64}:${ctBase64}`;
}

/**
 * Decrypt a value encrypted with encryptStorageValue().
 * Returns plaintext string.
 */
export async function decryptStorageValue(encrypted: string): Promise<string> {
  const key = await deriveKey();
  const [ivBase64, ctBase64] = encrypted.split(':');
  const iv = new Uint8Array(atob(ivBase64).split('').map((c) => c.charCodeAt(0)));
  const ciphertext = new Uint8Array(atob(ctBase64).split('').map((c) => c.charCodeAt(0)));
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}
