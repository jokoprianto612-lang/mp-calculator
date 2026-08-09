/**
 * Fastify Application Entry Point
 */

import Fastify from 'fastify';
import { config } from './config';
import { registerPlugins } from './plugins';
import { registerRoutes } from './routes';
import { setupErrorHandler } from './utils/errors';

async function buildApp() {
  const app = Fastify({
    logger: config.logLevel !== 'silent' ? {
      level: config.logLevel,
      transport: config.nodeEnv === 'development' ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' }
      } : undefined,
    } : false,
    ajv: { customOptions: { removeAdditional: 'all' } },
  });

  // Register plugins
  await registerPlugins(app);

  // Register routes
  await registerRoutes(app);

  // Setup error handler
  setupErrorHandler(app);

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  return app;
}

async function start() {
  const app = await buildApp();
  
  try {
    await app.listen({ port: config.port, host: config.host });
    app.log.info(`Server listening on ${config.host}:${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  const app = await buildApp();
  await app.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  const app = await buildApp();
  await app.close();
  process.exit(0);
});

if (require.main === module) {
  start();
}

export { buildApp };