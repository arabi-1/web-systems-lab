import http from 'node:http';

const ID_PATTERN = /^REQ-\d+$/;

export function sendJson(res, status, body, headers = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    ...headers,
  });
  res.end(payload);
}

async function route(req, res, store) {
  const { pathname } = new URL(req.url, 'http://localhost');
  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] !== 'requests' || segments.length > 2) {
    return sendJson(res, 404, { error: 'Not found' });
  }

  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' }, { Allow: 'GET' });
  }

  if (segments.length === 1) {
    return sendJson(res, 200, await store.readAll());
  }

  const id = segments[1];
  if (!ID_PATTERN.test(id)) {
    return sendJson(res, 400, { error: `Invalid request id: ${id}` });
  }

  const record = await store.findById(id);
  if (!record) {
    return sendJson(res, 404, { error: `Request ${id} not found` });
  }
  return sendJson(res, 200, record);
}

export function createServer({ store } = {}) {
  return http.createServer(async (req, res) => {
    try {
      await route(req, res, store);
    } catch (err) {
      console.error(err);
      sendJson(res, 500, { error: 'Internal server error' });
    }
  });
}
