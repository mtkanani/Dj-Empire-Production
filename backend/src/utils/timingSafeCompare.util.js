import crypto from 'crypto';

/**
 * Constant-time comparison of two hex-encoded digests.
 *
 * A plain `===` on a signature leaks how many leading bytes matched through
 * timing, which lets an attacker recover a valid signature byte by byte.
 */
export function timingSafeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}
