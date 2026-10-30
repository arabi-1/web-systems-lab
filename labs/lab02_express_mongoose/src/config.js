export function getConfig(env = process.env) {
  const port = Number(env.PORT || 3000);
  const mongoUri = env.MONGODB_URI?.trim();

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  if (!mongoUri) {
    throw new Error('MONGODB_URI is required');
  }

  return { port, mongoUri };
}
