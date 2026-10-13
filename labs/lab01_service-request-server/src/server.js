import http from 'node:http';

export function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

export function createServer() {
  return http.createServer((req, res) => {
    sendJson(res, 404, { error: 'Not found' });
  });
}
