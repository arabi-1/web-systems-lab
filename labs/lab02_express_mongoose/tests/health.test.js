import assert from 'node:assert/strict';
import { test } from 'node:test';
import request from 'supertest';
import app from '../src/app.js';

test('GET /health returns an OK status', async () => {
  const response = await request(app).get('/health');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok' });
});

test('unknown routes return a JSON 404', async () => {
  const response = await request(app).get('/nope');

  assert.equal(response.status, 404);
  assert.match(response.headers['content-type'], /application\/json/);
  assert.deepEqual(response.body, { error: 'Not found' });
});
