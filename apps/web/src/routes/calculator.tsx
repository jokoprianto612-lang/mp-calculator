import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { useTranslation } from 'react-i18next';
import { CalculatorForm } from '../components/calculator/CalculatorForm';
import { CalculatorResults } from '../components/calculator/CalculatorResults';
import { CalculatorBreakdown } from '../components/calculator/CalculatorBreakdown';
import { useCalculatorStore } from '../stores/calculatorStore';

export const calculatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calculator',
  component: CalculatorPage,
});

function CalculatorPage() {
  const { t } = useTranslation();
  const { marketplacePrice, livePrice, isCalculating } = useCalculatorStore();

  return (
    <div className="container-main py-6 lg:py-10">
      {/* Page Header - NVIDIA style */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-500">MP Calculator</span>
          <span className="text-xs font-medium text-slate-500">v1.0</span>
       </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">
          {t('calculator.title')}
       </h1>
        <p className="text-slate-400 max-w-2xl">
          {t('calculator.subtitle')}
       </p>
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

          {/* Fee Breakdown Grid - NVIDIA style with green accents */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative overflow-hidden rounded-xl border border-primary-900/30 bg-[#121812]/60 backdrop-blur-sm p-5 hover:border-primary-500/40 transition-colors">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-400 mb-3">
                {t('calculator.marketplaceDeduction')}
             </h3>
              <p className="text-3xl font-bold text-slate-100">
                {marketplacePrice?.marketplaceDeductionPercent?.toFixed(1) ?? '-'}%
             </p>
              <p className="text-sm text-slate-400 mt-1">
                {marketplacePrice?.marketplaceDeduction
                  ? `Rp${marketplacePrice.marketplaceDeduction.toLocaleString('id-ID')} ${t('calculator.fromNetSale')}`
                  : '-'}
             </p>
           </div>
            <div className="relative overflow-hidden rounded-xl border border-primary-900/30 bg-[#121812]/60 backdrop-blur-sm p-5 hover:border-primary-500/40 transition-colors">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary-400 mb-3">
                {t('calculator.sellerCost')}
             </h3>
              <p className="text-3xl font-bold text-slate-100">
                {marketplacePrice?.sellerCostPercent?.toFixed(1) ?? '-'}%
             </p>
              <p className="text-sm text-slate-400 mt-1">
                {marketplacePrice?.sellerCost
                  ? `Rp${marketplacePrice.sellerCost.toLocaleString('id-ID')} ${t('calculator.fromNetSale')}`
                  : '-'}
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
