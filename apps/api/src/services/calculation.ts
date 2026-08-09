/**
 * Calculation Service
 * Handles marketplace profit calculations using the shared fee engine
 */

import { prisma } from '../lib/prisma';
import { 
  calculateMarketplacePrice, 
  calculateLivePrice, 
  getFeeConfig,
  validateInputs,
  formatIDR,
  formatPercent,
} from '@mp-calculator/shared';
import type { 
  CalculationInputs, 
  LiveSellingInputs, 
  CalculationResult,
  Marketplace,
  CalculationMode,
} from '@mp-calculator/shared';
import type { CreateCalculationInput, UpdateCalculationInput, CalculationQueryInput } from '@mp-calculator/shared';

export class CalculationService {
  /**
   * Perform a marketplace calculation
   */
  async calculate(inputs: CalculationInputs): Promise<CalculationResult> {
    // Validate inputs
    const validation = validateInputs(inputs);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Get fee config (from database or defaults)
    const feeConfig = await this.getFeeConfig(inputs.marketplace);
    
    // Calculate
    const result = calculateMarketplacePrice(inputs, feeConfig);
    
    return result;
  }

  /**
   * Perform a live selling calculation
   */
  async calculateLive(marketplacePrice: number, inputs: LiveSellingInputs): Promise<CalculationResult> {
    // Validate base inputs
    const validation = validateInputs(inputs);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Get fee config
    const feeConfig = await this.getFeeConfig(inputs.marketplace);
    
    // Calculate live price
    const result = calculateLivePrice(marketplacePrice, inputs, feeConfig);
    
    return result;
  }

  /**
   * Save a calculation record
   */
  async saveCalculation(userId: string, data: CreateCalculationInput) {
    const result = await this.calculate(data.inputs);
    const liveResult = data.inputs.mode === 'live' 
      ? await this.calculateLive(result.marketplacePrice, data.inputs as LiveSellingInputs)
      : null;

    return prisma.calculation.create({
      data: {
        userId,
        name: data.name,
        marketplace: data.inputs.marketplace,
        mode: data.inputs.mode,
        inputs: data.inputs,
        results: liveResult ?? result,
        breakdown: liveResult?.breakdown ?? result.breakdown,
      },
    });
  }

  /**
   * Get user's calculations with pagination
   */
  async getCalculations(userId: string, query: CalculationQueryInput) {
    const { page = 1, limit = 20, marketplace, mode, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    const where: any = { userId };
    if (marketplace) where.marketplace = marketplace;
    if (mode) where.mode = mode;

    const [items, total] = await Promise.all([
      prisma.calculation.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.calculation.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single calculation by ID
   */
  async getCalculation(userId: string, id: string) {
    return prisma.calculation.findFirst({
      where: { id, userId },
    });
  }

  /**
   * Update a calculation
   */
  async updateCalculation(userId: string, id: string, data: UpdateCalculationInput) {
    const existing = await prisma.calculation.findFirst({ where: { id, userId } });
    if (!existing) throw new Error('Calculation not found');

    // Merge inputs
    const mergedInputs = { ...existing.inputs, ...data.inputs } as CalculationInputs;
    
    // Recalculate
    const result = await this.calculate(mergedInputs);
    const liveResult = mergedInputs.mode === 'live'
      ? await this.calculateLive(result.marketplacePrice, mergedInputs as LiveSellingInputs)
      : null;

    return prisma.calculation.update({
      where: { id },
      data: {
        name: data.name ?? existing.name,
        inputs: mergedInputs,
        results: liveResult ?? result,
        breakdown: liveResult?.breakdown ?? result.breakdown,
      },
    });
  }

  /**
   * Delete a calculation
   */
  async deleteCalculation(userId: string, id: string) {
    return prisma.calculation.deleteMany({ where: { id, userId } });
  }

  /**
   * Duplicate a calculation
   */
  async duplicateCalculation(userId: string, id: string) {
    const existing = await prisma.calculation.findFirst({ where: { id, userId } });
    if (!existing) throw new Error('Calculation not found');

    return prisma.calculation.create({
      data: {
        userId,
        name: `${existing.name || 'Calculation'} (Copy)`,
        marketplace: existing.marketplace,
        mode: existing.mode,
        inputs: existing.inputs,
        results: existing.results,
        breakdown: existing.breakdown,
      },
    });
  }

  /**
   * Get fee configuration for a marketplace
   */
  private async getFeeConfig(marketplace: Marketplace) {
    const dbConfig = await prisma.marketplaceFeeConfig.findUnique({
      where: { marketplace },
    });

    if (dbConfig) {
      return dbConfig.config as any; // Type matches MarketplaceFeeConfig
    }

    return getFeeConfig(marketplace);
  }

  /**
   * Get available marketplaces
   */
  async getMarketplaces() {
    const dbConfigs = await prisma.marketplaceFeeConfig.findMany();
    const dbMarketplaces = dbConfigs.map(c => c.marketplace);
    
    // Include default marketplaces not in DB
    const allMarketplaces = ['tokopedia', 'shopee', 'lazada', 'tiktok'] as Marketplace[];
    
    return allMarketplaces.map(m => ({
      id: m,
      name: m.charAt(0).toUpperCase() + m.slice(1),
      hasCustomConfig: dbMarketplaces.includes(m),
    }));
  }

  /**
   * Get fee structure for a marketplace
   */
  async getMarketplaceFees(marketplace: Marketplace) {
    const config = await this.getFeeConfig(marketplace);
    return config;
  }

  /**
   * Update marketplace fee config (admin)
   */
  async updateMarketplaceFees(marketplace: Marketplace, config: any, userId: string) {
    // Archive old config
    await prisma.marketplaceFeeConfig.updateMany({
      where: { marketplace, effectiveUntil: null },
      data: { effectiveUntil: new Date() },
    });

    // Create new config
    return prisma.marketplaceFeeConfig.create({
      data: {
        marketplace,
        version: 1, // In practice, increment from latest
        config,
        effectiveFrom: new Date(),
      },
    });
  }
}

export const calculationService = new CalculationService();