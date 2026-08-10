/**
 * Shared TypeScript types for MP Calculator
 */

// Marketplace types
export type Marketplace = 'tokopedia' | 'shopee' | 'lazada' | 'tiktok';
export type CalculationMode = 'marketplace' | 'live';
export type Language = 'id' | 'en' | 'zh' | 'ja' | 'ko';

// Fee configuration
export interface MarketplaceFeeConfig {
  marketplace: Marketplace;
  version: number;
  platformCommissionRate: number;        // e.g., 0.025 = 2.5%
  dynamicCommissionRates: Record<string, number>; // category -> rate
  dynamicCommissionCap?: number;         // cap per item for dynamic commission (e.g. 650000)
  mallServiceRate: number;               // e.g., 0.01 = 1%
  mallPaymentFeeRate?: number;           // e.g., 0.018 = 1.8% (mall payment fee)
  mallPaymentFeeCap?: number;            // e.g., 50000 cap
  orderProcessingFee: number;            // fixed amount per order
  logisticsFeeConfig: LogisticsFeeConfig;
  amsCommissionRate: number;             // e.g., 0.03 = 3%
  taxRate: number;                       // PPh 22 = 0.005 = 0.5%
  freeShippingPrograms: FreeShippingProgram[];
  promoPrograms: PromoProgram[];
  effectiveFrom: Date;
  effectiveUntil?: Date;
}

export interface LogisticsFeeConfig {
  baseFee: number;
  perKgFee: number;
  perKmFee?: number;
  freeShippingThreshold?: number;
}

export interface FreeShippingProgram {
  id: string;
  name: string;
  description: string;
  feeRate: number;        // percentage of net sale
  minOrderValue?: number;
  maxDiscount?: number;
}

export interface PromoProgram {
  id: string;
  name: string;
  description: string;
  feeRate: number;        // percentage of net sale
  minOrderValue?: number;
}

// Calculation inputs
export interface CalculationInputs {
  marketplace: Marketplace;
  mode: CalculationMode;
  category: string;
  hpp: number;                    // Harga Pokok Penjualan (Cost of Goods)
  targetMargin?: number;          // Target profit margin %
  sellingPrice?: number;          // If provided, calculate margin
  sellerVoucher: number;          // Voucher from seller
  platformVoucher: number;        // Voucher from platform
  isMallSeller: boolean;
  useAds: boolean;
  adBudget: number;               // Biaya Iklan
  useAms: boolean;
  weight: number;                 // in kg
  dimensions?: { l: number; w: number; h: number }; // in cm
  originCity: string;
  destinationCity: string;
  packingCost: number;
  freeShippingProgram?: string;   // program ID
  promoProgram?: string;          // program ID
}

export interface LiveSellingInputs extends CalculationInputs {
  liveDiscountPercent: number;    // Discount from marketplace price
  liveAdBudget?: number;          // Additional ad budget for live
  livePackingCost?: number;       // Additional packing for live
}

// Calculation results
export interface CalculationResult {
  marketplacePrice: number;
  livePrice?: number;
  netSale: number;
  marketplaceDeduction: number;
  marketplaceDeductionPercent: number;
  sellerCost: number;
  sellerCostPercent: number;
  netProfit: number;
  netProfitPercent: number;
  breakdown: FeeBreakdownItem[];
  liveBreakdown?: FeeBreakdownItem[];
}

export interface FeeBreakdownItem {
  label: string;
  amount: number;
  type: 'income' | 'expense' | 'neutral' | 'total';
  indent?: number;
  children?: FeeBreakdownItem[];
  tooltip?: string;
  isCollapsed?: boolean;
}

// API types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  provider: 'email' | 'google' | 'github';
  providerId?: string;
  locale: Language;
  theme: 'light' | 'dark' | 'system';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  sub: string;        // user id
  email: string;
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
}

// Calculation record
export interface CalculationRecord {
  id: string;
  userId: string;
  name?: string;
  marketplace: Marketplace;
  mode: CalculationMode;
  inputs: CalculationInputs;
  results: CalculationResult;
  createdAt: Date;
  updatedAt: Date;
}

// Preset
export interface Preset {
  id: string;
  userId: string;
  name: string;
  marketplace: Marketplace;
  inputs: CalculationInputs;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Translation
export interface TranslationRequest {
  text: string | string[];
  targetLang: Language;
  sourceLang?: Language;
  preserveFormatting?: boolean;
}

export interface TranslationResponse {
  translations: Array<{
    text: string;
    detectedSourceLanguage: Language;
  }>;
}

export interface SupportedLanguage {
  code: Language;
  name: string;
  nativeName: string;
}

// WebSocket events
export interface WSEvents {
  'calculation:progress': { calculationId: string; progress: number };
  'calculation:complete': { calculationId: string; result: CalculationResult };
  'calculation:error': { calculationId: string; error: ApiError };
  'notification': { userId: string; type: string; payload: unknown };
}
