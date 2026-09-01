/**
 * Mobile number normalization and validation.
 * Existing users may have a null phone; new registrations require a valid unique number.
 */

export function normalizePhone(phone) {
  if (phone === undefined || phone === null) return '';
  const trimmed = String(phone).trim();
  if (!trimmed) return '';
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';
  return hasPlus ? `+${digits}` : digits;
}

export function formatStoredPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (String(phone).trim().startsWith('+')) return `+${digits}`;
  return `+${digits}`;
}

export function phoneUniqueKey(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

export function isValidPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return true;
  if (digits.length === 12 && digits.startsWith('91') && /^[6-9]\d{9}$/.test(digits.slice(2))) return true;
  if (digits.length >= 10 && digits.length <= 15) return true;
  return false;
}
