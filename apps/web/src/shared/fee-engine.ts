/**
 * Marketplace Fee Calculation Engine
 * Core business logic for calculating fees, profits, and breakdowns
 */

import { Decimal } from 'decimal.js';
import type {
  Marketplace,
  CalculationMode,
  CalculationInputs,
  LiveSellingInputs,
  CalculationResult,
  FeeBreakdownItem,
  MarketplaceFeeConfig,
  LogisticsFeeConfig,
  FreeShippingProgram,
  PromoProgram,
} from './types';

// Set Decimal precision for currency calculations
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

// Default marketplace fee configurations (Indonesian marketplaces)
export const DEFAULT_FEE_CONFIGS: Record<Marketplace, MarketplaceFeeConfig> = {
  tokopedia: {
    marketplace: 'tokopedia',
    version: 1,
    platformCommissionRate: 0.025,      // 2.5%
    dynamicCommissionRates: {
      'electronics': 0.035,
      'fashion': 0.045,
      'home': 0.03,
      'beauty': 0.04,
      'health': 0.03,
      'sports': 0.035,
      'automotive': 0.025,
      'books': 0.02,
      'toys': 0.04,
      'food': 0.02,
      'default': 0.03,
    },
    mallServiceRate: 0.01,              // 1%
    orderProcessingFee: 1250,           // Rp1,250 per order
    logisticsFeeConfig: {
      baseFee: 5000,
      perKgFee: 2500,
      perKmFee: 100,
      freeShippingThreshold: 150000,
    },
    amsCommissionRate: 0.03,            // 3%
    taxRate: 0.005,                     // 0.5% PPh 22
    freeShippingPrograms: [
      { id: 'xtra', name: 'Gratis Ongkir XTRA', description: 'Free shipping for eligible products', feeRate: 0.015, minOrderValue: 50000 },
      { id: 'spesial', name: 'Gratis Ongkir Spesial', description: 'Special free shipping program', feeRate: 0.02, minOrderValue: 100000 },
    ],
    promoPrograms: [
      { id: 'promo-xtra', name: 'Promo Xtra', description: 'Promotional discount program', feeRate: 0.01, minOrderValue: 50000 },
      { id: 'flash-sale', name: 'Flash Sale', description: 'Limited time discount', feeRate: 0.015, minOrderValue: 0 },
    ],
    effectiveFrom: new Date('2024-01-01'),
  },
  shopee: {
    marketplace: 'shopee',
    version: 1,
    platformCommissionRate: 0.03,       // 3%
    dynamicCommissionRates: {
      'electronics': 0.04,
      'fashion': 0.05,
      'home': 0.035,
      'beauty': 0.045,
      'health': 0.035,
      'sports': 0.04,
      'automotive': 0.03,
      'books': 0.025,
      'toys': 0.045,
      'food': 0.025,
      'default': 0.035,
    },
    mallServiceRate: 0.015,             // 1.5%
    orderProcessingFee: 1500,           // Rp1,500 per order
    logisticsFeeConfig: {
      baseFee: 4000,
      perKgFee: 3000,
      perKmFee: 120,
      freeShippingThreshold: 100000,
    },
    amsCommissionRate: 0.04,            // 4%
    taxRate: 0.005,                     // 0.5% PPh 22
    freeShippingPrograms: [
      { id: 'freeship', name: 'Gratis Ongkir', description: 'Shopee free shipping', feeRate: 0.012, minOrderValue: 40000 },
      { id: 'freeship-plus', name: 'Gratis Ongkir Plus', description: 'Extended free shipping', feeRate: 0.018, minOrderValue: 80000 },
    ],
    promoPrograms: [
      { id: 'shopee-promo', name: 'Shopee Promo', description: 'Platform promotional discount', feeRate: 0.012, minOrderValue: 30000 },
      { id: 'mall-promo', name: 'Mall Promo', description: 'Mall seller promotion', feeRate: 0.015, minOrderValue: 50000 },
    ],
    effectiveFrom: new Date('2024-01-01'),
  },
  lazada: {
    marketplace: 'lazada',
    version: 1,
    platformCommissionRate: 0.02,       // 2%
    dynamicCommissionRates: {
      'electronics': 0.03,
      'fashion': 0.04,
      'home': 0.025,
      'beauty': 0.035,
      'health': 0.025,
      'sports': 0.03,
      'automotive': 0.02,
      'books': 0.015,
      'toys': 0.035,
      'food': 0.02,
      'default': 0.025,
    },
    mallServiceRate: 0.008,             // 0.8%
    orderProcessingFee: 1000,           // Rp1,000 per order
    logisticsFeeConfig: {
      baseFee: 6000,
      perKgFee: 2000,
      perKmFee: 80,
      freeShippingThreshold: 200000,
    },
    amsCommissionRate: 0.025,           // 2.5%
    taxRate: 0.005,                     // 0.5% PPh 22
    freeShippingPrograms: [
      { id: 'lazada-freeship', name: 'Lazada Free Shipping', description: 'Standard free shipping', feeRate: 0.01, minOrderValue: 75000 },
      { id: 'lazada-freeship-plus', name: 'Lazada Free Shipping Plus', description: 'Extended free shipping', feeRate: 0.015, minOrderValue: 150000 },
    ],
    promoPrograms: [
      { id: 'lazada-promo', name: 'Lazada Promo', description: 'Platform promotion', feeRate: 0.008, minOrderValue: 50000 },
      { id: 'mall-promo', name: 'Mall Promo', description: 'Mall seller promotion', feeRate: 0.01, minOrderValue: 100000 },
    ],
    effectiveFrom: new Date('2024-01-01'),
  },
  tiktok: {
    marketplace: 'tiktok',
    version: 1,
    platformCommissionRate: 0.015,      // 1.5% (promotional rate)
    dynamicCommissionRates: {
      'electronics': 0.025,
      'fashion': 0.035,
      'home': 0.02,
      'beauty': 0.03,
      'health': 0.02,
      'sports': 0.025,
      'automotive': 0.015,
      'books': 0.01,
      'toys': 0.03,
      'food': 0.015,
      'default': 0.02,
    },
    mallServiceRate: 0.005,             // 0.5%
    orderProcessingFee: 500,            // Rp500 per order
    logisticsFeeConfig: {
      baseFee: 3000,
      perKgFee: 1500,
      perKmFee: 50,
      freeShippingThreshold: 50000,
    },
    amsCommissionRate: 0.05,            // 5% (higher for TikTok ads)
    taxRate: 0.005,                     // 0.5% PPh 22
    freeShippingPrograms: [
      { id: 'tiktok-freeship', name: 'TikTok Free Shipping', description: 'TikTok Shop free shipping', feeRate: 0.008, minOrderValue: 30000 },
      { id: 'live-freeship', name: 'Live Free Shipping', description: 'Free shipping during live', feeRate: 0.012, minOrderValue: 50000 },
    ],
    promoPrograms: [
      { id: 'live-promo', name: 'Live Promo', description: 'Live streaming promotion', feeRate: 0.01, minOrderValue: 0 },
      { id: 'shop-promo', name: 'Shop Promo', description: 'Shop-wide promotion', feeRate: 0.015, minOrderValue: 50000 },
    ],
    effectiveFrom: new Date('2024-01-01'),
  },
};

/**
 * Calculate logistics fee based on weight, distance, and configuration
 */
export function calculateLogisticsFee(
  weight: number,
  config: LogisticsFeeConfig,
  distanceKm?: number
): Decimal {
  let fee = new Decimal(config.baseFee);
  fee = fee.plus(new Decimal(weight).times(config.perKgFee));
  
  if (distanceKm && config.perKmFee) {
    fee = fee.plus(new Decimal(distanceKm).times(config.perKmFee));
  }
  
  return fee;
}

/**
 * Get dynamic commission rate for a category
 */
export function getDynamicCommissionRate(config: MarketplaceFeeConfig, category: string): number {
  return config.dynamicCommissionRates[category] ?? config.dynamicCommissionRates.default ?? 0.03;
}

/**
 * Calculate free shipping fee
 */
export function calculateFreeShippingFee(
  netSale: Decimal,
  program: FreeShippingProgram | undefined,
  config: MarketplaceFeeConfig
): Decimal {
  if (!program) return new Decimal(0);
  
  const programConfig = config.freeShippingPrograms.find(p => p.id === program.id);
  if (!programConfig) return new Decimal(0);
  
  // Check minimum order value
  if (programConfig.minOrderValue && netSale.lessThan(programConfig.minOrderValue)) {
    return new Decimal(0);
  }
  
  let fee = netSale.times(programConfig.feeRate);
  
  // Apply max discount if specified
  if (programConfig.maxDiscount) {
    const maxDiscount = new Decimal(programConfig.maxDiscount);
    if (fee.greaterThan(maxDiscount)) {
      fee = maxDiscount;
    }
  }
  
  return fee;
}

/**
 * Calculate promo fee
 */
export function calculatePromoFee(
  netSale: Decimal,
  program: PromoProgram | undefined,
  config: MarketplaceFeeConfig
): Decimal {
  if (!program) return new Decimal(0);
  
  const programConfig = config.promoPrograms.find(p => p.id === program.id);
  if (!programConfig) return new Decimal(0);
  
  if (programConfig.minOrderValue && netSale.lessThan(programConfig.minOrderValue)) {
    return new Decimal(0);
  }
  
  return netSale.times(programConfig.feeRate);
}

/**
 * Main calculation function for marketplace price
 */
export function calculateMarketplacePrice(inputs: CalculationInputs, feeConfig?: MarketplaceFeeConfig): CalculationResult {
  const config = feeConfig ?? DEFAULT_FEE_CONFIGS[inputs.marketplace];
  const dynamicRate = getDynamicCommissionRate(config, inputs.category);
  
  // Start with selling price (either provided or calculated from target margin)
  let sellingPrice: Decimal;
  
  if (inputs.sellingPrice) {
    sellingPrice = new Decimal(inputs.sellingPrice);
  } else if (inputs.targetMargin !== undefined) {
    // Calculate selling price from target margin
    // This requires iterative calculation since fees depend on selling price
    sellingPrice = calculateSellingPriceFromMargin(inputs, config, dynamicRate);
  } else {
    throw new Error('Either sellingPrice or targetMargin must be provided');
  }
  
  // Calculate all fees
  const result = computeFees(sellingPrice, inputs, config, dynamicRate);
  
  return {
    marketplacePrice: sellingPrice.toNumber(),
    ...result,
  };
}

/**
 * Calculate live selling price (with discount from marketplace price)
 */
export function calculateLivePrice(
  marketplacePrice: number,
  inputs: LiveSellingInputs,
  feeConfig?: MarketplaceFeeConfig
): CalculationResult {
  const config = feeConfig ?? DEFAULT_FEE_CONFIGS[inputs.marketplace];
  const dynamicRate = getDynamicCommissionRate(config, inputs.category);
  
  // Live price is marketplace price minus discount
  const liveDiscount = new Decimal(inputs.liveDiscountPercent).div(100);
  const livePrice = new Decimal(marketplacePrice).times(new Decimal(1).minus(liveDiscount));
  
  // Use live-specific inputs if provided
  const liveInputs: CalculationInputs = {
    ...inputs,
    sellingPrice: livePrice.toNumber(),
    adBudget: inputs.liveAdBudget ?? inputs.adBudget,
    packingCost: inputs.livePackingCost ?? inputs.packingCost,
  };
  
  const result = computeFees(livePrice, liveInputs, config, dynamicRate);
  
  return {
    marketplacePrice,
    livePrice: livePrice.toNumber(),
    ...result,
  };
}

/**
 * Iteratively calculate selling price to achieve target margin
 */
function calculateSellingPriceFromMargin(
  inputs: CalculationInputs,
  config: MarketplaceFeeConfig,
  dynamicRate: number
): Decimal {
  const hpp = new Decimal(inputs.hpp);
  const targetMargin = new Decimal(inputs.targetMargin ?? 0).div(100);
  const sellerVoucher = new Decimal(inputs.sellerVoucher);
  const platformVoucher = new Decimal(inputs.platformVoucher);
  const adBudget = new Decimal(inputs.adBudget);
  const packingCost = new Decimal(inputs.packingCost);
  
  // Initial guess: HPP / (1 - targetMargin - estimated fees)
  let estimatedFeeRate = config.platformCommissionRate + dynamicRate;
  if (inputs.isMallSeller) estimatedFeeRate += config.mallServiceRate;
  estimatedFeeRate += config.amsCommissionRate + config.taxRate;
  
  let sellingPrice = hpp.div(new Decimal(1).minus(targetMargin).minus(estimatedFeeRate));
  
  // Iterate to converge
  for (let i = 0; i < 20; i++) {
    const testResult = computeFees(sellingPrice, inputs, config, dynamicRate);
    const actualMargin = testResult.netProfitPercent / 100;
    
    const diff = actualMargin - targetMargin;
    if (Math.abs(diff) < 0.0001) break; // Converged
    
    // Adjust price
    const adjustment = diff > 0 ? -0.01 : 0.01;
    sellingPrice = sellingPrice.times(new Decimal(1).plus(adjustment));
  }
  
  return sellingPrice;
}

/**
 * Core fee computation logic
 */
function computeFees(
  sellingPrice: Decimal,
  inputs: CalculationInputs,
  config: MarketplaceFeeConfig,
  dynamicRate: number
): Omit<CalculationResult, 'marketplacePrice' | 'livePrice'> {
  const hpp = new Decimal(inputs.hpp);
  const sellerVoucher = new Decimal(inputs.sellerVoucher);
  const platformVoucher = new Decimal(inputs.platformVoucher);
  const adBudget = new Decimal(inputs.adBudget);
  const packingCost = new Decimal(inputs.packingCost);
  
  // Net Sale = Selling Price - Seller Voucher - Platform Voucher
  const netSale = sellingPrice.minus(sellerVoucher).minus(platformVoucher);
  if (netSale.lessThan(0)) throw new Error('Vouchers cannot exceed selling price');
  
  // Platform Commission Fee
  const platformFee = netSale.times(config.platformCommissionRate);
  
  // Dynamic Commission Fee
  const dynamicFee = netSale.times(dynamicRate);
  
  // Mall Service Fee (if mall seller)
  const mallFee = inputs.isMallSeller ? netSale.times(config.mallServiceRate) : new Decimal(0);
  
  // Order Processing Fee
  const processingFee = new Decimal(config.orderProcessingFee);
  
  // Logistics Fee
  const logisticsFee = calculateLogisticsFee(inputs.weight, config.logisticsFeeConfig);
  
  // AMS Commission Fee
  const amsFee = inputs.useAms ? netSale.times(config.amsCommissionRate) : new Decimal(0);
  
  // Advertising Fee
  const adFee = adBudget;
  
  // Free Shipping Fee
  const freeShippingProgram = config.freeShippingPrograms.find(p => p.id === inputs.freeShippingProgram);
  const freeShippingFee = calculateFreeShippingFee(netSale, freeShippingProgram, config);
  
  // Promo Fee
  const promoProgram = config.promoPrograms.find(p => p.id === inputs.promoProgram);
  const promoFee = calculatePromoFee(netSale, promoProgram, config);
  
  // Tax (PPh 22)
  const taxFee = netSale.times(config.taxRate);
  
  // Total Marketplace Deductions (fees charged by marketplace)
  const marketplaceDeduction = platformFee
    .plus(dynamicFee)
    .plus(mallFee)
    .plus(processingFee)
    .plus(logisticsFee)
    .plus(amsFee)
    .plus(freeShippingFee)
    .plus(promoFee)
    .plus(taxFee);
  
  // Seller Costs (costs borne by seller)
  const sellerCost = hpp
    .plus(packingCost)
    .plus(adFee)
    .plus(sellerVoucher)
    .plus(promoFee); // Promo is often seller-borne
  
  // Net Profit
  const netProfit = netSale.minus(marketplaceDeduction).minus(hpp).minus(packingCost).minus(adFee);
  
  // Percentages
  const marketplaceDeductionPercent = marketplaceDeduction.div(netSale).times(100);
  const sellerCostPercent = sellerCost.div(netSale).times(100);
  const netProfitPercent = netProfit.div(netSale).times(100);
  
  // Build breakdown
  const breakdown = buildBreakdown({
    sellingPrice,
    netSale,
    sellerVoucher,
    platformVoucher,
    hpp,
    platformFee,
    dynamicFee,
    mallFee,
    processingFee,
    logisticsFee,
    amsFee,
    adFee,
    freeShippingFee,
    promoFee,
    taxFee,
    packingCost,
    marketplaceDeduction,
    sellerCost,
    netProfit,
    inputs,
    config,
    freeShippingProgram,
    promoProgram,
  });
  
  return {
    netSale: netSale.toNumber(),
    marketplaceDeduction: marketplaceDeduction.toNumber(),
    marketplaceDeductionPercent: marketplaceDeductionPercent.toNumber(),
    sellerCost: sellerCost.toNumber(),
    sellerCostPercent: sellerCostPercent.toNumber(),
    netProfit: netProfit.toNumber(),
    netProfitPercent: netProfitPercent.toNumber(),
    breakdown,
  };
}

/**
 * Build detailed fee breakdown for display
 */
interface BreakdownData {
  sellingPrice: Decimal;
  netSale: Decimal;
  sellerVoucher: Decimal;
  platformVoucher: Decimal;
  hpp: Decimal;
  platformFee: Decimal;
  dynamicFee: Decimal;
  mallFee: Decimal;
  processingFee: Decimal;
  logisticsFee: Decimal;
  amsFee: Decimal;
  adFee: Decimal;
  freeShippingFee: Decimal;
  promoFee: Decimal;
  taxFee: Decimal;
  packingCost: Decimal;
  marketplaceDeduction: Decimal;
  sellerCost: Decimal;
  netProfit: Decimal;
  inputs: CalculationInputs;
  config: MarketplaceFeeConfig;
  freeShippingProgram: FreeShippingProgram | undefined;
  promoProgram: PromoProgram | undefined;
}

function buildBreakdown(data: BreakdownData): FeeBreakdownItem[] {
  const {
    sellingPrice,
    netSale,
    sellerVoucher,
    platformVoucher,
    hpp,
    platformFee,
    dynamicFee,
    mallFee,
    processingFee,
    logisticsFee,
    amsFee,
    adFee,
    freeShippingFee,
    promoFee,
    taxFee,
    packingCost,
    marketplaceDeduction,
    sellerCost,
    netProfit,
    inputs,
    config,
    freeShippingProgram,
    promoProgram,
  } = data;
  
  const items: FeeBreakdownItem[] = [
    {
      label: 'Harga Jual Marketplace',
      amount: sellingPrice.toNumber(),
      type: 'income',
      tooltip: 'Harga jual yang ditampilkan di marketplace',
    },
  ];
  
  // Seller voucher
  if (sellerVoucher.greaterThan(0)) {
    items.push({
      label: 'Voucher Penjual',
      amount: sellerVoucher.neg().toNumber(),
      type: 'expense',
      tooltip: 'Diskon/voucher yang diberikan oleh penjual',
    });
  }
  
  // Platform voucher
  if (platformVoucher.greaterThan(0)) {
    items.push({
      label: 'Voucher Platform',
      amount: platformVoucher.neg().toNumber(),
      type: 'expense',
      tooltip: 'Diskon/voucher yang diberikan oleh platform',
    });
  }
  
  // Net Sale
  items.push({
    label: 'Net Sale',
    amount: netSale.toNumber(),
    type: 'total',
    tooltip: 'Harga jual bersih setelah dikurangi voucher',
  });
  
  // HPP
  items.push({
    label: 'Harga Modal (HPP)',
    amount: hpp.neg().toNumber(),
    type: 'expense',
    tooltip: 'Harga pokok penjualan / cost of goods sold',
  });
  
  // Platform Fee
  items.push({
    label: 'Biaya Komisi Platform',
    amount: platformFee.neg().toNumber(),
    type: 'expense',
    tooltip: `Komisi platform ${(config.platformCommissionRate * 100).toFixed(2)}% dari Net Sale`,
  });
  
  // Dynamic Fee
  const dynamicRate = getDynamicCommissionRate(config, inputs.category);
  items.push({
    label: 'Biaya Komisi Dinamis',
    amount: dynamicFee.neg().toNumber(),
    type: 'expense',
    tooltip: `Komisi dinamis kategori ${inputs.category}: ${(dynamicRate * 100).toFixed(2)}% dari Net Sale`,
  });
  
  // Mall Fee
  if (mallFee.greaterThan(0)) {
    items.push({
      label: 'Biaya Layanan Mall',
      amount: mallFee.neg().toNumber(),
      type: 'expense',
      tooltip: `Biaya layanan mall ${(config.mallServiceRate * 100).toFixed(2)}% dari Net Sale`,
    });
  }
  
  // Processing Fee
  items.push({
    label: 'Biaya Pemrosesan Pesanan',
    amount: processingFee.neg().toNumber(),
    type: 'expense',
    tooltip: `Biaya tetap pemrosesan pesanan: Rp${config.orderProcessingFee.toLocaleString('id-ID')}`,
  });
  
  // Logistics Fee
  items.push({
    label: 'Biaya Layanan Logistik',
    amount: logisticsFee.neg().toNumber(),
    type: 'expense',
    tooltip: `Biaya logistik berdasarkan berat ${inputs.weight}kg`,
  });
  
  // AMS Fee
  if (amsFee.greaterThan(0)) {
    items.push({
      label: 'Biaya Komisi AMS',
      amount: amsFee.neg().toNumber(),
      type: 'expense',
      tooltip: `Komisi AMS (Advertising Management System) ${(config.amsCommissionRate * 100).toFixed(2)}% dari Net Sale`,
    });
  }
  
  // Ad Fee
  if (adFee.greaterThan(0)) {
    items.push({
      label: 'Biaya Iklan',
      amount: adFee.neg().toNumber(),
      type: 'expense',
      tooltip: 'Anggaran iklan yang ditetapkan oleh penjual',
    });
  }
  
  // Free Shipping Fee
  if (freeShippingFee.greaterThan(0)) {
    const programName = freeShippingProgram?.name ?? 'Gratis Ongkir';
    items.push({
      label: `Biaya ${programName}`,
      amount: freeShippingFee.neg().toNumber(),
      type: 'expense',
      tooltip: `Biaya program gratis ongkir ${(freeShippingProgram?.feeRate ?? 0) * 100}% dari Net Sale`,
    });
  }
  
  // Promo Fee
  if (promoFee.greaterThan(0)) {
    const programName = promoProgram?.name ?? 'Promo';
    items.push({
      label: `Biaya ${programName}`,
      amount: promoFee.neg().toNumber(),
      type: 'expense',
      tooltip: `Biaya program promo ${(promoProgram?.feeRate ?? 0) * 100}% dari Net Sale`,
    });
  }
  
  // Tax
  items.push({
    label: 'Pajak (PPh 22)',
    amount: taxFee.neg().toNumber(),
    type: 'expense',
    tooltip: `PPh 22 sebesar ${(config.taxRate * 100).toFixed(2)}% dari Net Sale`,
    children: [
      {
        label: `PPh 22 (${(config.taxRate * 100).toFixed(2)}%)`,
        amount: taxFee.neg().toNumber(),
        type: 'expense',
        indent: 1,
      },
    ],
    isCollapsed: true,
  });
  
  // Packing Cost
  if (packingCost.greaterThan(0)) {
    items.push({
      label: 'Biaya Packing',
      amount: packingCost.neg().toNumber(),
      type: 'expense',
      tooltip: 'Biaya kemasan/dus/pelindung barang',
    });
  }
  
  // Net Profit
  items.push({
    label: 'Untung Bersih',
    amount: netProfit.toNumber(),
    type: netProfit.greaterThanOrEqualTo(0) ? 'income' : 'expense',
    tooltip: 'Keuntungan bersih setelah semua biaya',
  });
  
  return items;
}

/**
 * Get fee configuration for a marketplace (can be overridden by database)
 */
export function getFeeConfig(marketplace: Marketplace): MarketplaceFeeConfig {
  return DEFAULT_FEE_CONFIGS[marketplace];
}

/**
 * Format currency for Indonesian Rupiah
 */

/**
 * Format percentage
 */

/**
 * Validate calculation inputs
 */
export function validateInputs(inputs: CalculationInputs): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (inputs.hpp <= 0) errors.push('HPP harus lebih dari 0');
  if (inputs.weight < 0) errors.push('Berat tidak boleh negatif');
  if (inputs.sellerVoucher < 0) errors.push('Voucher penjual tidak boleh negatif');
  if (inputs.platformVoucher < 0) errors.push('Voucher platform tidak boleh negatif');
  if (inputs.adBudget < 0) errors.push('Budget iklan tidak boleh negatif');
  if (inputs.packingCost < 0) errors.push('Biaya packing tidak boleh negatif');
  if (inputs.targetMargin !== undefined && (inputs.targetMargin < -100 || inputs.targetMargin > 1000)) {
    errors.push('Target margin harus antara -100% dan 1000%');
  }
  if (inputs.sellingPrice !== undefined && inputs.sellingPrice <= 0) {
    errors.push('Harga jual harus lebih dari 0');
  }
  if (inputs.sellingPrice !== undefined && inputs.targetMargin !== undefined) {
    errors.push('Hanya boleh mengisi salah satu: sellingPrice atau targetMargin');
  }
  if (!inputs.sellingPrice && inputs.targetMargin === undefined) {
    errors.push('Harus mengisi sellingPrice atau targetMargin');
  }
  
  return { valid: errors.length === 0, errors };
}