import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLoginIdentifier, isEmailIdentifier } from './authIdentifier.util.js';

test('classifies email vs mobile identifiers', () => {
  assert.equal(isEmailIdentifier('User@Example.com'), true);
  assert.equal(isEmailIdentifier('9876543210'), false);
  assert.deepEqual(normalizeLoginIdentifier('  User@Example.com  '), { kind: 'email', value: 'user@example.com' });
  assert.equal(normalizeLoginIdentifier('9876543210').kind, 'phone');
  assert.equal(normalizeLoginIdentifier('9876543210').value, '+919876543210');
});
