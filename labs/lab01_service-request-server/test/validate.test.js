import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateRequestInput } from '../src/validate.js';

const validInput = {
  name: 'Ali Khan',
  category: 'IT Support',
  description: 'Projector not working',
  priority: 'High',
  date: '2026-10-14',
};

test('validates and trims the required string fields', () => {
  const result = validateRequestInput({
    ...validInput,
    name: '  Ali Khan  ',
    description: '  Projector not working  ',
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.value, {
    name: 'Ali Khan',
    category: 'IT Support',
    description: 'Projector not working',
    priority: 'High',
    date: '2026-10-14',
    status: 'Open',
  });
});

test('rejects non-object bodies', () => {
  for (const input of [null, [], 'request', 42]) {
    const result = validateRequestInput(input);
    assert.equal(result.valid, false);
    assert.deepEqual(result.errors, ['Request body must be a JSON object']);
  }
});

test('collects multiple validation errors', () => {
  const result = validateRequestInput({
    name: '',
    category: 'Other',
    description: '',
    priority: 'Urgent',
  });

  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 4);
});

test('enforces string length limits', () => {
  const result = validateRequestInput({
    ...validInput,
    name: 'x'.repeat(101),
    description: 'x'.repeat(1001),
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('name')));
  assert.ok(result.errors.some((error) => error.includes('description')));
});

test('enforces the allowed categories and priorities', () => {
  const result = validateRequestInput({ ...validInput, category: 'Other', priority: 'Urgent' });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('category')));
  assert.ok(result.errors.some((error) => error.includes('priority')));
});

test('requires a valid calendar date in YYYY-MM-DD format', () => {
  for (const date of ['2026-02-29', '2026-13-01', '14-10-2026']) {
    const result = validateRequestInput({ ...validInput, date });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.includes('date')));
  }
});

test('defaults a missing date to YYYY-MM-DD', () => {
  const withoutDate = { ...validInput };
  delete withoutDate.date;
  const result = validateRequestInput(withoutDate);

  assert.equal(result.valid, true);
  assert.match(result.value.date, /^\d{4}-\d{2}-\d{2}$/);
});

test('keeps only approved fields and sets status to Open', () => {
  const result = validateRequestInput({
    ...validInput,
    id: 'REQ-999',
    status: 'Closed',
    extra: true,
  });

  assert.equal(result.valid, true);
  assert.deepEqual(Object.keys(result.value), [
    'name',
    'category',
    'description',
    'priority',
    'date',
    'status',
  ]);
  assert.equal(result.value.status, 'Open');
});
