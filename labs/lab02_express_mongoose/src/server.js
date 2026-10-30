import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { getConfig } from './config.js';

let config;

try {
  config = getConfig();
} catch (error) {
  console.error(`Configuration error: ${error.message}`);
  process.exitCode = 1;
}

if (config) {
  mongoose
    .connect(config.mongoUri)
    .then(() => {
      app.listen(config.port, () => {
        console.log(`Listening on http://localhost:${config.port}`);
      });
    })
    .catch((error) => {
      console.error(`MongoDB connection failed: ${error.message}`);
      process.exitCode = 1;
    });
}
