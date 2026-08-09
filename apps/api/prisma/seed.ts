/**
 * Database Seed Script
 */

import { prisma } from '../lib/prisma';
import { hashPassword } from '../lib/password';
import { DEFAULT_FEE_CONFIGS } from '@mp-calculator/shared';

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default marketplace fee configurations
  for (const [marketplace, config] of Object.entries(DEFAULT_FEE_CONFIGS)) {
    await prisma.marketplaceFeeConfig.upsert({
      where: { marketplace },
      update: {
        version: config.version,
        config: config as any,
        effectiveFrom: config.effectiveFrom,
      },
      create: {
        marketplace,
        version: config.version,
        config: config as any,
        effectiveFrom: config.effectiveFrom,
      },
    });
    console.log(`  ✓ Fee config for ${marketplace}`);
  }

  // Create demo user (only in development)
  if (process.env.NODE_ENV === 'development') {
    const demoEmail = 'demo@mpcalculator.app';
    const existingDemo = await prisma.user.findUnique({ where: { email: demoEmail } });
    
    if (!existingDemo) {
      const passwordHash = await hashPassword('demo123456');
      const demoUser = await prisma.user.create({
        data: {
          email: demoEmail,
          passwordHash,
          name: 'Demo User',
          provider: 'email',
          locale: 'id',
          theme: 'system',
        },
      });
      console.log(`  ✓ Demo user created: ${demoEmail}`);

      // Create sample calculations for demo user
      await createSampleCalculations(demoUser.id);
    } else {
      console.log(`  ✓ Demo user already exists`);
    }
  }

  console.log('✅ Database seed completed!');
}

async function createSampleCalculations(userId: string) {
  const sampleCalculations = [
    {
      name: 'Tokopedia - Elektronik',
      marketplace: 'tokopedia',
      mode: 'marketplace',
      inputs: {
        marketplace: 'tokopedia',
        mode: 'marketplace',
        category: 'electronics',
        hpp: 150000,
        targetMargin: 20,
        sellerVoucher: 0,
        platformVoucher: 0,
        isMallSeller: false,
        useAds: true,
        adBudget: 22500,
        useAms: true,
        weight: 0.5,
        originCity: 'Jakarta',
        destinationCity: 'Surabaya',
        packingCost: 5000,
        freeShippingProgram: 'xtra',
        promoProgram: 'promo-xtra',
      },
    },
    {
      name: 'Shopee - Fashion Live',
      marketplace: 'shopee',
      mode: 'live',
      inputs: {
        marketplace: 'shopee',
        mode: 'live',
        category: 'fashion',
        hpp: 80000,
        targetMargin: 25,
        sellerVoucher: 5000,
        platformVoucher: 0,
        isMallSeller: true,
        useAds: true,
        adBudget: 15000,
        useAms: false,
        weight: 0.3,
        originCity: 'Bandung',
        destinationCity: 'Medan',
        packingCost: 3000,
        freeShippingProgram: 'freeship',
        promoProgram: 'shopee-promo',
        liveDiscountPercent: 20,
        liveAdBudget: 10000,
      },
    },
  ];

  for (const calc of sampleCalculations) {
    // We'll just create the record with empty results for now
    // The actual calculation would be done when accessed
    await prisma.calculation.create({
      data: {
        userId,
        name: calc.name,
        marketplace: calc.marketplace,
        mode: calc.mode,
        inputs: calc.inputs,
        results: {},
        breakdown: [],
      },
    });
    console.log(`  ✓ Sample calculation: ${calc.name}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });