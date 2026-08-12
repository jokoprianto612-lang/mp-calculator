/**
 * Register all API routes
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/auth';
import { calculationService } from '../services/calculation';
import { presetService } from '../services/preset';
import { translationService } from '../services/translation';
import { 
  RegisterSchema, 
  LoginSchema, 
  RefreshTokenSchema,
  CreateCalculationSchema,
  UpdateCalculationSchema,
  CalculationQuerySchema,
  CreatePresetSchema,
  UpdatePresetSchema,
  TranslateSchema,
  UpdateUserSettingsSchema,
  ChangePasswordSchema,
} from '@mp-calculator/shared';

export async function registerRoutes(app: FastifyInstance) {
  // Auth routes
  app.post('/api/v1/auth/register', {
    schema: { body: RegisterSchema },
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
        keyGenerator: (req: any) => `${req.ip}:${req.body?.email ?? 'unknown'}`,
      },
    },
  }, async (request: any, reply: any) => {
    const result = await authService.register(request.body as any);
    reply.setCookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 15 * 60,
    });
    reply.setCookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });
    return { success: true, data: result };
  });

  app.post('/api/v1/auth/login', {
    schema: { body: LoginSchema },
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
        keyGenerator: (req: any) => `${req.ip}:${req.body?.email ?? 'unknown'}`,
      },
    },
  }, async (request: any, reply: any) => {
    const result = await authService.login(request.body as any);
    reply.setCookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 15 * 60,
    });
    reply.setCookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });
    return { success: true, data: result };
  });

  app.post('/api/v1/auth/refresh', {
    schema: { body: RefreshTokenSchema },
  }, async (request: any, reply: any) => {
    const refreshToken = request.body.refreshToken || request.cookies?.['refresh_token'];
    if (!refreshToken) throw new Error('Refresh token required');
    
    const tokens = await authService.refreshToken(refreshToken);
    reply.setCookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 15 * 60,
    });
    reply.setCookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });
    return { success: true, data: tokens };
  });

  app.post('/api/v1/auth/logout', async (request: any, reply: any) => {
    if (request.user) {
      const refreshToken = request.cookies?.['refresh_token'];
      await authService.logout((request.user as any).id, refreshToken);
    }
    reply.clearCookie('access_token');
    reply.clearCookie('refresh_token');
    return { success: true };
  });

  app.get('/api/v1/auth/me', async (request) => {
    if (!request.user) throw new Error('Not authenticated');
    return { success: true, data: request.user };
  });

  app.patch('/api/v1/auth/me', {
    schema: { body: UpdateUserSettingsSchema },
  }, async (request) => {
    if (!request.user) throw new Error('Not authenticated');
    const user = await authService.updateProfile((request.user as any).id, request.body as any);
    return { success: true, data: user };
  });

  app.post('/api/v1/auth/change-password', {
    schema: { body: ChangePasswordSchema },
  }, async (request) => {
    if (!request.user) throw new Error('Not authenticated');
    await authService.changePassword((request.user as any).id, (request.body as any).currentPassword, (request.body as any).newPassword);
    return { success: true };
  });

  // OAuth routes (placeholder)
  app.get('/api/v1/auth/oauth/:provider', async (request: any, reply: any) => {
    const { provider } = request.params as { provider: 'google' | 'github' };
    // Redirect to OAuth provider
    return reply.redirect(`https://example.com/oauth/${provider}`);
  });

  app.get('/api/v1/auth/oauth/:provider/callback', async (request: any, reply: any) => {
    // Handle OAuth callback
    return { success: false, error: 'OAuth not implemented' };
  });

  // Calculation routes
  app.post('/api/v1/calculations', {
    schema: { body: CreateCalculationSchema },
  }, async (request) => {
    const calculation = await calculationService.saveCalculation((request.user as any).id, request.body as any);
    return { success: true, data: calculation };
  });

  app.get('/api/v1/calculations', {
    schema: { querystring: CalculationQuerySchema },
  }, async (request) => {
    const result = await calculationService.getCalculations((request.user as any).id, request.query as any);
    return { success: true, data: result };
  });

  app.get('/api/v1/calculations/:id', {
      }, async (request) => {
    const { id } = request.params as { id: string };
    const calculation = await calculationService.getCalculation((request.user as any).id, id);
    if (!calculation) throw new Error('Calculation not found');
    return { success: true, data: calculation };
  });

  app.patch('/api/v1/calculations/:id', {
    schema: { body: UpdateCalculationSchema },
  }, async (request) => {
    const { id } = request.params as { id: string };
    const calculation = await calculationService.updateCalculation((request.user as any).id, id, request.body as any);
    return { success: true, data: calculation };
  });

  app.delete('/api/v1/calculations/:id', {
      }, async (request) => {
    const { id } = request.params as { id: string };
    await calculationService.deleteCalculation((request.user as any).id, id);
    return { success: true };
  });

  app.post('/api/v1/calculations/:id/duplicate', {
      }, async (request) => {
    const { id } = request.params as { id: string };
    const calculation = await calculationService.duplicateCalculation((request.user as any).id, id);
    return { success: true, data: calculation };
  });

  // Quick calculation without saving (for real-time preview)
  app.post('/api/v1/calculations/preview', async (request) => {
    // Allow unauthenticated preview calculations
    const result = await calculationService.calculate(request.body as any);
    return { success: true, data: result };
  });

  // Preset routes
  app.post('/api/v1/presets', {
    schema: { body: CreatePresetSchema },
  }, async (request) => {
    const preset = await presetService.createPreset((request.user as any).id, request.body as any);
    return { success: true, data: preset };
  });

  app.get('/api/v1/presets', {
      }, async (request) => {
    const { marketplace } = request.query as { marketplace?: string };
    const presets = await presetService.getPresets((request.user as any).id, marketplace);
    return { success: true, data: presets };
  });

  app.get('/api/v1/presets/:id', {
      }, async (request) => {
    const { id } = request.params as { id: string };
    const preset = await presetService.getPreset((request.user as any).id, id);
    if (!preset) throw new Error('Preset not found');
    return { success: true, data: preset };
  });

  app.patch('/api/v1/presets/:id', {
    schema: { body: UpdatePresetSchema },
  }, async (request) => {
    const { id } = request.params as { id: string };
    const preset = await presetService.updatePreset((request.user as any).id, id, request.body as any);
    return { success: true, data: preset };
  });

  app.delete('/api/v1/presets/:id', {
      }, async (request) => {
    const { id } = request.params as { id: string };
    await presetService.deletePreset((request.user as any).id, id);
    return { success: true };
  });

  // Translation routes
  app.post('/api/v1/translate', {
    schema: { body: TranslateSchema },
  }, async (request) => {
    const result = await translationService.translate(request.body as any);
    return { success: true, data: result };
  });

  app.get('/api/v1/translate/languages', async () => {
    const languages = await translationService.getSupportedLanguages();
    return { success: true, data: languages };
  });

  // Marketplace routes
  app.get('/api/v1/marketplaces', async () => {
    const marketplaces = await calculationService.getMarketplaces();
    return { success: true, data: marketplaces };
  });

  app.get('/api/v1/marketplaces/:marketplace/fees', async (request) => {
    const { marketplace } = request.params as { marketplace: string };
    const fees = await calculationService.getMarketplaceFees(marketplace as any);
    return { success: true, data: fees };
  });

  // Admin routes (protected by admin check)
  app.post('/api/v1/admin/marketplaces/:marketplace/fees', {
      }, async (request) => {
    const { marketplace } = request.params as { marketplace: string };
    const config = await calculationService.updateMarketplaceFees(marketplace as any, request.body as any, (request.user as any).id);
    return { success: true, data: config };
  });
}

async function requireAdmin(request: any, _reply: any) {
  if (!request.user) throw new Error('Not authenticated');
  // In a real app, check for admin role
  // if (request.user.isAdmin !== true) throw new Error('Admin required');
}