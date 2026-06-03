import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SEPARATOR = ':';

/**
 * Get the encryption key buffer from environment.
 * Must be a 32-byte (64 hex char) string.
 */
const getKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
  return Buffer.from(key, 'hex');
};

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a string in the format: iv:authTag:ciphertext (all hex-encoded).
 * Returns empty string for empty/null input.
 */
export const encrypt = (plaintext) => {
  if (!plaintext || plaintext.length === 0) return '';

  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}${SEPARATOR}${authTag}${SEPARATOR}${encrypted}`;
};

/**
 * Decrypt an encrypted string (iv:authTag:ciphertext format) using AES-256-GCM.
 * Returns the original plaintext.
 * Returns empty string for empty/null input.
 */
export const decrypt = (encryptedString) => {
  if (!encryptedString || encryptedString.length === 0) return '';

  const parts = encryptedString.split(SEPARATOR);
  if (parts.length !== 3) {
    // Not encrypted (plaintext fallback for unmigrated data)
    return encryptedString;
  }

  const [ivHex, authTagHex, ciphertext] = parts;

  // Validate hex lengths to avoid false positives on plaintext containing colons
  if (ivHex.length !== IV_LENGTH * 2 || authTagHex.length !== AUTH_TAG_LENGTH * 2) {
    return encryptedString;
  }

  try {
    const key = getKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    // If decryption fails, return the original string (unmigrated plaintext)
    return encryptedString;
  }
};

/**
 * Check whether a string is already in encrypted format (iv:tag:cipher).
 */
export const isEncrypted = (value) => {
  if (!value || typeof value !== 'string') return false;
  const parts = value.split(SEPARATOR);
  if (parts.length !== 3) return false;
  return parts[0].length === IV_LENGTH * 2 && parts[1].length === AUTH_TAG_LENGTH * 2;
};

/**
 * Deterministic SHA-256 hash for lookup fields (e.g. email).
 * Always produces the same hash for the same input, enabling DB queries.
 */
export const hashForLookup = (value) => {
  if (!value) return '';
  return crypto
    .createHash('sha256')
    .update(value.toLowerCase().trim())
    .digest('hex');
};
