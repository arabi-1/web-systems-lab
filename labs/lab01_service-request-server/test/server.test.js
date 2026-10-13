import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.js';

test('unknown routes return a JSON 404', async (t) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  t.after(() => server.close());

  const { port } = server.address();
  const res = await fetch(`http://127.0.0.1:${port}/nope`);

  assert.equal(res.status, 404);
  assert.match(res.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await res.json(), { error: 'Not found' });
});
