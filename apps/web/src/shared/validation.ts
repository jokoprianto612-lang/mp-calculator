/**
 * Zod validation schemas for API inputs
 */

import { z } from 'zod';
import type { Marketplace, CalculationMode, Language } from './types';

// Base enums
export const MarketplaceSchema = z.enum(['tokopedia', 'shopee', 'lazada', 'tiktok']);
export const CalculationModeSchema = z.enum(['marketplace', 'live']);
export const LanguageSchema = z.enum(['id', 'en', 'zh', 'ja', 'ko']);
export const ThemeSchema = z.enum(['light', 'dark', 'system']);

// Calculation inputs (base for extend/partial; refined version adds cross-field validation)
export const CalculationInputsBaseSchema = z.object({
  marketplace: MarketplaceSchema,
  mode: CalculationModeSchema,
  category: z.string().min(1, 'Kategori wajib diisi'),
  hpp: z.number().positive('HPP harus lebih dari 0'),
  targetMargin: z.number().min(-100).max(1000).optional(),
  sellingPrice: z.number().positive().optional(),
  sellerVoucher: z.number().min(0).default(0),
  platformVoucher: z.number().min(0).default(0),
  isMallSeller: z.boolean().default(false),
  useAds: z.boolean().default(false),
  adBudget: z.number().min(0).default(0),
  useAms: z.boolean().default(false),
  weight: z.number().min(0).default(0),
  dimensions: z.object({
    l: z.number().min(0),
    w: z.number().min(0),
    h: z.number().min(0),
  }).optional(),
  originCity: z.string().min(1, 'Kota asal wajib diisi'),
  destinationCity: z.string().min(1, 'Kota tujuan wajib diisi'),
  packingCost: z.number().min(0).default(0),
  freeShippingProgram: z.string().optional(),
  promoProgram: z.string().optional(),
});

export const CalculationInputsSchema = CalculationInputsBaseSchema.refine(
  (data) => data.sellingPrice !== undefined || data.targetMargin !== undefined,
  { message: 'Harus mengisi sellingPrice atau targetMargin', path: ['sellingPrice'] }
).refine(
  (data) => !(data.sellingPrice !== undefined && data.targetMargin !== undefined),
  { message: 'Hanya boleh mengisi salah satu: sellingPrice atau targetMargin', path: ['targetMargin'] }
);

export const LiveSellingInputsSchema = CalculationInputsBaseSchema.extend({
  liveDiscountPercent: z.number().min(0).max(100),
  liveAdBudget: z.number().min(0).optional(),
  livePackingCost: z.number().min(0).optional(),
});

// Auth schemas
export const RegisterSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter').max(128),
  name: z.string().min(1).max(100).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
  rememberMe: z.boolean().default(false),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const OAuthCallbackSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
  provider: z.enum(['google', 'github']),
});

// Calculation record schemas
export const CreateCalculationSchema = z.object({
  name: z.string().max(200).optional(),
  inputs: CalculationInputsSchema,
});

export const UpdateCalculationSchema = z.object({
  name: z.string().max(200).optional(),
  inputs: CalculationInputsBaseSchema.partial().optional(),
});

export const CalculationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  marketplace: MarketplaceSchema.optional(),
  mode: CalculationModeSchema.optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'netProfit']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Preset schemas
export const CreatePresetSchema = z.object({
  name: z.string().min(1).max(100),
  marketplace: MarketplaceSchema,
  inputs: CalculationInputsSchema,
  isDefault: z.boolean().default(false),
});

export const UpdatePresetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  inputs: CalculationInputsBaseSchema.partial().optional(),
  isDefault: z.boolean().optional(),
});

// Translation schemas
export const TranslateSchema = z.object({
  text: z.union([z.string().min(1), z.array(z.string()).min(1)]),
  targetLang: LanguageSchema,
  sourceLang: LanguageSchema.optional(),
  preserveFormatting: z.boolean().default(false),
});

// User settings
export const UpdateUserSettingsSchema = z.object({
  name: z.string().max(100).optional(),
  avatar: z.string().url().optional(),
  locale: LanguageSchema.optional(),
  theme: ThemeSchema.optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
}).refine(
  (data) => data.currentPassword !== data.newPassword,
  { message: 'Password baru harus berbeda dari password lama', path: ['newPassword'] }
);

// Marketplace fee config (admin)
export const MarketplaceFeeConfigSchema = z.object({
  marketplace: MarketplaceSchema,
  version: z.number().int().positive(),
  platformCommissionRate: z.number().min(0).max(1),
  dynamicCommissionRates: z.record(z.string(), z.number().min(0).max(1)),
  mallServiceRate: z.number().min(0).max(1),
  orderProcessingFee: z.number().min(0),
  logisticsFeeConfig: z.object({
    baseFee: z.number().min(0),
    perKgFee: z.number().min(0),
    perKmFee: z.number().min(0).optional(),
    freeShippingThreshold: z.number().min(0).optional(),
  }),
  amsCommissionRate: z.number().min(0).max(1),
  taxRate: z.number().min(0).max(1),
  freeShippingPrograms: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    feeRate: z.number().min(0).max(1),
    minOrderValue: z.number().min(0).optional(),
    maxDiscount: z.number().min(0).optional(),
  })),
  promoPrograms: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    feeRate: z.number().min(0).max(1),
    minOrderValue: z.number().min(0).optional(),
  })),
  effectiveFrom: z.date(),
  effectiveUntil: z.date().optional(),
});

// Type exports
export type CalculationInputsInput = z.infer<typeof CalculationInputsSchema>;
export type LiveSellingInputsInput = z.infer<typeof LiveSellingInputsSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type OAuthCallbackInput = z.infer<typeof OAuthCallbackSchema>;
export type CreateCalculationInput = z.infer<typeof CreateCalculationSchema>;
export type UpdateCalculationInput = z.infer<typeof UpdateCalculationSchema>;
export type CalculationQueryInput = z.infer<typeof CalculationQuerySchema>;
export type CreatePresetInput = z.infer<typeof CreatePresetSchema>;
export type UpdatePresetInput = z.infer<typeof UpdatePresetSchema>;
export type TranslateInput = z.infer<typeof TranslateSchema>;
export type UpdateUserSettingsInput = z.infer<typeof UpdateUserSettingsSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type MarketplaceFeeConfigInput = z.infer<typeof MarketplaceFeeConfigSchema>;