const MAX_BODY_SIZE = 100 * 1024;

export class PayloadTooLargeError extends Error {}

export async function readBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    size += chunk.length;
    if (size > MAX_BODY_SIZE) {
      throw new PayloadTooLargeError();
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
}
