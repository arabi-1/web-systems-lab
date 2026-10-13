import http from 'node:http';
import { readBody, PayloadTooLargeError } from './body.js';
import { validateRequestInput } from './validate.js';

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

  if (segments.length === 1) {
    if (req.method === 'GET') {
      return sendJson(res, 200, await store.readAll());
    }
    if (req.method === 'POST') {
      return createRequest(req, res, store);
    }
    return sendJson(res, 405, { error: 'Method not allowed' }, { Allow: 'GET, POST' });
  }

  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' }, { Allow: 'GET' });
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

async function createRequest(req, res, store) {
  const contentType = req.headers['content-type']?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    return sendJson(res, 415, { error: 'Content-Type must be application/json' });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    if (err instanceof PayloadTooLargeError) {
      const response = sendJson(res, 413, { error: 'Payload too large' }, { Connection: 'close' });
      req.resume();
      return response;
    }
    throw err;
  }

  let input;
  try {
    input = JSON.parse(body);
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON' });
  }

  const result = validateRequestInput(input);
  if (!result.valid) {
    return sendJson(res, 400, { error: 'Validation failed', details: result.errors });
  }

  const record = await store.add(result.value);
  return sendJson(res, 201, record, { Location: `/requests/${record.id}` });
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
