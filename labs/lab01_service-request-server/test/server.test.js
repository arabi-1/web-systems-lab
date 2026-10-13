import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createServer } from '../src/server.js';
import { createStore } from '../src/store.js';

const sample = {
  name: 'Ali Khan',
  category: 'IT Support',
  description: 'Projector not working in room 12',
  priority: 'High',
  date: '2026-10-14',
  status: 'Open',
};

async function startServer(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'lab01-'));
  const store = createStore(path.join(dir, 'requests.json'));
  const server = createServer({ store });
  await new Promise((resolve) => server.listen(0, resolve));
  t.after(async () => {
    server.close();
    await rm(dir, { recursive: true, force: true });
  });
  return { store, base: `http://127.0.0.1:${server.address().port}` };
}

test('unknown routes return a JSON 404', async (t) => {
  const { base } = await startServer(t);
  const res = await fetch(`${base}/nope`);

  assert.equal(res.status, 404);
  assert.match(res.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await res.json(), { error: 'Not found' });
});

test('GET /requests returns an empty list, then the stored requests', async (t) => {
  const { base, store } = await startServer(t);

  assert.deepEqual(await (await fetch(`${base}/requests`)).json(), []);

  const created = await store.add(sample);
  const res = await fetch(`${base}/requests`);

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), [created]);
});

test('GET /requests/:id returns the matching request', async (t) => {
  const { base, store } = await startServer(t);
  const created = await store.add(sample);

  const res = await fetch(`${base}/requests/${created.id}`);

  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), created);
});

test('GET /requests/:id returns 404 for an id that does not exist', async (t) => {
  const { base } = await startServer(t);
  const res = await fetch(`${base}/requests/REQ-999`);

  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { error: 'Request REQ-999 not found' });
});

test('GET /requests/:id returns 400 for a malformed id', async (t) => {
  const { base } = await startServer(t);
  const res = await fetch(`${base}/requests/abc`);

  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: 'Invalid request id: abc' });
});

test('unsupported methods return 405 with an Allow header', async (t) => {
  const { base } = await startServer(t);
  const res = await fetch(`${base}/requests`, { method: 'DELETE' });

  assert.equal(res.status, 405);
  assert.equal(res.headers.get('allow'), 'GET');
});
