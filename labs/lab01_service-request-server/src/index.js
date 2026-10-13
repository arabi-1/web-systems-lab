import { fileURLToPath } from 'node:url';
import { createServer } from './server.js';
import { createStore } from './store.js';

const port = Number(process.env.PORT) || 3000;
const dataFile =
  process.env.DATA_FILE || fileURLToPath(new URL('../data/requests.json', import.meta.url));

createServer({ store: createStore(dataFile) }).listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
