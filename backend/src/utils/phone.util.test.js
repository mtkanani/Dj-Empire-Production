import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidPhone, formatStoredPhone, phoneUniqueKey } from './phone.util.js';

test('accepts Indian 10-digit mobiles', () => {
  assert.equal(isValidPhone('9876543210'), true);
  assert.equal(isValidPhone('+91 98765 43210'), true);
  assert.equal(isValidPhone('12345'), false);
  assert.equal(isValidPhone(''), false);
});

test('normalizes unique keys for duplicate detection', () => {
  assert.equal(phoneUniqueKey('9876543210'), phoneUniqueKey('+919876543210'));
  assert.equal(formatStoredPhone('9876543210'), '+919876543210');
});
