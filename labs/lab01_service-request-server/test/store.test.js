import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createStore } from '../src/store.js';

async function tempStore(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'lab01-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'data', 'requests.json');
  return { file, store: createStore(file) };
}

const sample = {
  name: 'Ali Khan',
  category: 'IT Support',
  description: 'Projector not working in room 12',
  priority: 'High',
  date: '2026-10-14',
  status: 'Open',
};

test('readAll returns an empty list when the file does not exist', async (t) => {
  const { store } = await tempStore(t);
  assert.deepEqual(await store.readAll(), []);
});

test('add assigns sequential ids and persists across store instances', async (t) => {
  const { file, store } = await tempStore(t);

  const first = await store.add(sample);
  const second = await store.add(sample);

  assert.equal(first.id, 'REQ-101');
  assert.equal(second.id, 'REQ-102');
  assert.equal((await createStore(file).readAll()).length, 2);
});

test('concurrent adds do not lose records', async (t) => {
  const { store } = await tempStore(t);

  await Promise.all(Array.from({ length: 10 }, () => store.add(sample)));

  const records = await store.readAll();
  assert.equal(records.length, 10);
  assert.equal(new Set(records.map((r) => r.id)).size, 10);
});

test('findById returns the record, or null when missing', async (t) => {
  const { store } = await tempStore(t);
  const created = await store.add(sample);

  assert.deepEqual(await store.findById(created.id), created);
  assert.equal(await store.findById('REQ-999'), null);
});
