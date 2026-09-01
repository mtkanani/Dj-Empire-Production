import { formatStoredPhone, isValidPhone } from './phone.util.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmailIdentifier(value) {
  return EMAIL_PATTERN.test(String(value || '').trim());
}

export function normalizeLoginIdentifier(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return { kind: null, value: '' };
  if (isEmailIdentifier(trimmed)) {
    return { kind: 'email', value: trimmed.toLowerCase() };
  }
  return { kind: 'phone', value: formatStoredPhone(trimmed) };
}

export function duplicateKeyMessage(error) {
  const target = error?.meta?.target;
  const fields = Array.isArray(target) ? target.join(' ') : String(target || '');
  if (fields.toLowerCase().includes('email')) {
    return 'An account with this email already exists.';
  }
  if (fields.toLowerCase().includes('phone') || fields.toLowerCase().includes('mobile')) {
    return 'An account with this mobile number already exists.';
  }
  return 'An account with this email or mobile number already exists.';
}

export function isPrismaUniqueError(error) {
  return error?.code === 'P2002';
}

export { isValidPhone };
