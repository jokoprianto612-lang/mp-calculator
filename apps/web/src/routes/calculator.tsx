import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { CalculatorForm } from '../components/calculator/CalculatorForm';
import { CalculatorResults } from '../components/calculator/CalculatorResults';
import { CalculatorBreakdown } from '../components/calculator/CalculatorBreakdown';
import { useCalculatorStore } from '../stores/calculatorStore';

export const calculatorRoute = createFileRoute('/calculator/')({
  component: CalculatorPage,
});

function CalculatorPage() {
  const { t } = useTranslation();
  const { marketplacePrice, livePrice, isCalculating, lastCalculated } = useCalculatorStore();

  return (
    <div className="container-main py-6 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="page-title">{t('calculator.title')}</h1>
        <p className="page-subtitle">{t('calculator.subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Calculator Form - Left Side */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 lg:self-start">
          <CalculatorForm />
        </div>

        {/* Results - Right Side */}
        <div className="lg:col-span-7 space-y-6">
          {/* Marketplace Price Card */}
          <CalculatorResults 
            mode="marketplace" 
            title={t('calculator.marketplacePrice')}
            data={marketplacePrice}
            isCalculating={isCalculating}
          />

          {/* Live Price Card */}
          <CalculatorResults 
            mode="live" 
            title={t('calculator.livePrice')}
            data={livePrice}
            isCalculating={isCalculating}
          />

          {/* Fee Breakdown Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-4">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{t('calculator.marketplaceDeduction')}</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {marketplacePrice?.marketplaceDeductionPercent?.toFixed(1) ?? '-'}%
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {marketplacePrice?.marketplaceDeduction ? `Rp${marketplacePrice.marketplaceDeduction.toLocaleString('id-ID')} ${t('calculator.fromNetSale')}` : '-'}
              </p>
            </div>
            <div className="card p-4">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{t('calculator.sellerCost')}</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {marketplacePrice?.sellerCostPercent?.toFixed(1) ?? '-'}%
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {marketplacePrice?.sellerCost ? `Rp${marketplacePrice.sellerCost.toLocaleString('id-ID')} ${t('calculator.fromNetSale')}` : '-'}
              </p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <CalculatorBreakdown 
            data={marketplacePrice?.breakdown ?? []}
            mode="marketplace"
          />
        </div>
      </div>
    </div>
  );
}