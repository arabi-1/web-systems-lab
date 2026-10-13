import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import path from 'node:path';

export function createStore(filePath) {
  let queue = Promise.resolve();

  async function readAll() {
    try {
      return JSON.parse(await readFile(filePath, 'utf8'));
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw err;
    }
  }

  async function writeAll(records) {
    await mkdir(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.tmp`;
    await writeFile(tmp, JSON.stringify(records, null, 2) + '\n', 'utf8');
    await rename(tmp, filePath);
  }

  function nextId(records) {
    const max = records.reduce((highest, r) => Math.max(highest, Number(r.id.slice(4))), 100);
    return `REQ-${max + 1}`;
  }

  async function findById(id) {
    const records = await readAll();
    return records.find((r) => r.id === id) ?? null;
  }

  function add(fields) {
    const job = queue.then(async () => {
      const records = await readAll();
      const record = { id: nextId(records), ...fields };
      records.push(record);
      await writeAll(records);
      return record;
    });
    queue = job.catch(() => {});
    return job;
  }

  return { readAll, findById, add };
}
