/**
 * Application Configuration
 * All environment variables with validation and defaults
 */

import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Cookies
  COOKIE_SECRET: z.string().min(32),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z.coerce.boolean().default(true),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // DeepL Translation
  DEEPL_API_KEY: z.string().optional(),
  DEEPL_API_URL: z.string().url().default('https://api-free.deepl.com/v2'),

  // OAuth - Google
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),

  // OAuth - GitHub
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_CALLBACK_URL: z.string().url().optional(),

  // Frontend URL (for email links, etc.)
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // Rate limiting
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW: z.string().default('1 minute'),

  // File upload
  MAX_FILE_SIZE: z.coerce.number().default(5 * 1024 * 1024), // 5MB

  // Encryption (for sensitive data)
  ENCRYPTION_KEY: z.string().length(32).optional(),
});

const env = envSchema.parse(process.env);

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST,
  logLevel: env.LOG_LEVEL,

  database: {
    url: env.DATABASE_URL,
  },

  redis: {
    url: env.REDIS_URL,
  },

  jwt: {
    secret: env.JWT_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  cookie: {
    secret: env.COOKIE_SECRET,
    domain: env.COOKIE_DOMAIN,
    secure: env.COOKIE_SECURE,
  },

  cors: {
    origin: env.CORS_ORIGIN.split(',').map(s => s.trim()),
  },

  deepl: {
    apiKey: env.DEEPL_API_KEY,
    apiUrl: env.DEEPL_API_URL,
  },

  oauth: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackUrl: env.GOOGLE_CALLBACK_URL,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      callbackUrl: env.GITHUB_CALLBACK_URL,
    },
  },

  frontendUrl: env.FRONTEND_URL,

  rateLimit: {
    max: env.RATE_LIMIT_MAX,
    window: env.RATE_LIMIT_WINDOW,
  },

  maxFileSize: env.MAX_FILE_SIZE,

  encryptionKey: env.ENCRYPTION_KEY,
};

export type Config = typeof config;