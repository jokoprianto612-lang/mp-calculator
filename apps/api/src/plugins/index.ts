/**
 * Register all Fastify plugins
 */

import fp from 'fastify-plugin';
import { config } from '../config';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export async function registerPlugins(app: any) {
  // Sensible defaults
  await app.register(import('@fastify/sensible'));

  // Helmet for security headers
  await app.register(import('@fastify/helmet'), {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:'],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"],
      },
    },
  });

  // CORS
  await app.register(import('@fastify/cors'), {
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Cookie parsing
  await app.register(import('@fastify/cookie'), {
    secret: config.cookie.secret,
    hook: 'onRequest',
    parseOptions: {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: 'lax',
      domain: config.cookie.domain,
    },
  });

  // JWT
  await app.register(import('@fastify/jwt'), {
    secret: config.jwt.secret,
    cookie: {
      cookieName: 'access_token',
      signed: false,
    },
    sign: {
      expiresIn: config.jwt.accessExpiresIn,
    },
  });

  // Rate limiting
  await app.register(import('@fastify/rate-limit'), {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.window,
    allowList: ['127.0.0.1', '::1'],
    redis: redis,
    keyGenerator: (req) => req.ip,
    errorMessage: 'Too many requests, please try again later',
  });

  // Swagger/OpenAPI
  await app.register(import('@fastify/swagger'), {
    openapi: {
      info: {
        title: 'MP Calculator API',
        description: 'Marketplace Profit Calculator with Translation API',
        version: '1.0.0',
      },
      servers: [
        { url: `http://localhost:${config.port}`, description: 'Development' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          cookieAuth: { type: 'apiKey', in: 'cookie', name: 'access_token' },
        },
      },
      security: [{ bearerAuth: [], cookieAuth: [] }],
    },
  });

  await app.register(import('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
    staticCSP: true,
  });

  // Prisma and Redis decorators
  app.decorate('prisma', prisma);
  app.decorate('redis', redis);

  // Auth hook
  app.addHook('onRequest', async (request: any, reply: any) => {
    // Try to get user from JWT cookie
    const token = request.cookies?.access_token;
    if (token) {
      try {
        const decoded = await app.jwt.verify(token);
        request.user = await prisma.user.findUnique({ where: { id: decoded.sub } });
      } catch {
        // Invalid token, continue without user
      }
    }
  });

  // Request ID for tracing
  app.addHook('onRequest', async (request: any) => {
    request.id = request.headers['x-request-id'] || crypto.randomUUID();
  });

  // Audit logging hook
  app.addHook('onResponse', async (request: any, reply: any) => {
    if (request.user && request.routeOptions.url !== '/health') {
      await prisma.auditLog.create({
        data: {
          userId: request.user.id,
          action: `${request.method} ${request.routeOptions.url}`,
          entity: 'api',
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        },
      }).catch(() => {}); // Don't fail request on audit log error
    }
  });
}

export default fp(registerPlugins, { name: 'plugins' });