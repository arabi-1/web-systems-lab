import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getConfig } from '../src/config.js';

test('getConfig defaults PORT to 3000', () => {
  assert.deepEqual(getConfig({ MONGODB_URI: 'mongodb://localhost/test' }), {
    port: 3000,
    mongoUri: 'mongodb://localhost/test',
  });
});

test('getConfig parses a valid PORT', () => {
  assert.equal(getConfig({ PORT: '4500', MONGODB_URI: 'mongodb://localhost/test' }).port, 4500);
});

test('getConfig defaults an empty PORT to 3000', () => {
  assert.equal(getConfig({ PORT: '', MONGODB_URI: 'mongodb://localhost/test' }).port, 3000);
});

test('getConfig throws when MONGODB_URI is missing', () => {
  assert.throws(() => getConfig({}), {
    message: 'MONGODB_URI is required',
  });
});

test('getConfig throws when MONGODB_URI is whitespace-only', () => {
  assert.throws(() => getConfig({ MONGODB_URI: '   \t' }), {
    message: 'MONGODB_URI is required',
  });
});

test('getConfig throws for invalid PORT values', () => {
  for (const port of ['0', '70000', 'abc']) {
    assert.throws(() => getConfig({ PORT: port, MONGODB_URI: 'mongodb://localhost/test' }), {
      message: 'PORT must be an integer between 1 and 65535',
    });
  }
});

test('getConfig trims the MongoDB URI', () => {
  assert.equal(
    getConfig({
      MONGODB_URI: '  mongodb://localhost/test  ',
    }).mongoUri,
    'mongodb://localhost/test',
  );
});
