/**
 * Preset Service
 * Manages user calculation presets/templates
 */

import { prisma } from '../lib/prisma';
import type { CreatePresetInput, UpdatePresetInput } from '@mp-calculator/shared';

export class PresetService {
  /**
   * Create a new preset
   */
  async createPreset(userId: string, data: CreatePresetInput) {
    // If this is default, unset other defaults
    if (data.isDefault) {
      await prisma.preset.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.preset.create({
      data: {
        userId,
        name: data.name,
        marketplace: data.marketplace,
        inputs: data.inputs,
        isDefault: data.isDefault ?? false,
      },
    });
  }

  /**
   * Get user's presets
   */
  async getPresets(userId: string, marketplace?: string) {
    const where: any = { userId };
    if (marketplace) where.marketplace = marketplace;

    return prisma.preset.findMany({
      where,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Get a single preset
   */
  async getPreset(userId: string, id: string) {
    return prisma.preset.findFirst({ where: { id, userId } });
  }

  /**
   * Update a preset
   */
  async updatePreset(userId: string, id: string, data: UpdatePresetInput) {
    const existing = await prisma.preset.findFirst({ where: { id, userId } });
    if (!existing) throw new Error('Preset not found');

    // If setting as default, unset others
    if (data.isDefault && !existing.isDefault) {
      await prisma.preset.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.preset.update({
      where: { id },
      data: {
        name: data.name as string,
        inputs: data.inputs ? ({ ...(existing.inputs as object), ...data.inputs } as any) : (existing.inputs as any),
        isDefault: data.isDefault ?? existing.isDefault,
      },
    });
  }

  /**
   * Delete a preset
   */
  async deletePreset(userId: string, id: string) {
    return prisma.preset.deleteMany({ where: { id, userId } });
  }

  /**
   * Get default preset for a marketplace
   */
  async getDefaultPreset(userId: string, marketplace: string) {
    return prisma.preset.findFirst({
      where: { userId, marketplace, isDefault: true },
    });
  }
}

export const presetService = new PresetService();