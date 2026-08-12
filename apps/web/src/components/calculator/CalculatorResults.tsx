'use client';

import { useTranslation } from 'react-i18next';
import { EyeIcon, EyeSlashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import React from 'react';

interface CalculatorResultsProps {
  mode: 'marketplace' | 'live';
  title: string;
  data: any;
  isCalculating: boolean;
  onEdit?: () => void;
  onRefresh?: () => void;
}

export function CalculatorResults({ mode, title, data, isCalculating, onEdit, onRefresh }: CalculatorResultsProps) {
  const { t } = useTranslation();
  const [showPrice, setShowPrice] = React.useState(true);

  const isMarketplace = mode === 'marketplace';

  if (!data && !isCalculating) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-primary-900/30 bg-[#121812]/60 backdrop-blur-sm p-6">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
            <p className="text-sm text-slate-400">{t('calculator.emptyHint')}</p>
         </div>
       </div>
        <div className="bg-[#0a0e0a]/60 rounded-xl p-8 text-center border border-primary-900/20">
          <ArrowPathIcon className="h-12 w-12 mx-auto text-primary-700/50 mb-3" />
          <p className="text-slate-400">{t('calculator.emptyState')}</p>
       </div>
     </div>
    );
  }

  if (isCalculating) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-primary-900/30 bg-[#121812]/60 backdrop-blur-sm p-6 animate-pulse">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-20 bg-[#0a0e0a]/60 rounded-xl border border-primary-900/20" />
          <div className="h-8 bg-[#0a0e0a]/60 rounded w-3/4 border border-primary-900/20" />
          <div className="h-6 bg-[#0a0e0a]/60 rounded w-1/2 border border-primary-900/20" />
       </div>
     </div>
    );
  }

  const isProfit = (data.netProfit ?? 0) >= 0;
  const formatIDR = (num: number) => `Rp${num.toLocaleString('id-ID')}`;

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary-900/30 bg-[#121812]/60 backdrop-blur-sm">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

      {/* Header */}
      <div className="px-5 py-4 border-b border-primary-900/20 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isMarketplace ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-semibold uppercase tracking-wider bg-primary-500/20 text-primary-300 border border-primary-500/30">
                {t('calculator.modeBadge.marketplace')}
            </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {t('calculator.modeBadge.live')}
            </span>
            )}
         </div>
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          {!isMarketplace && data.vsStorePercent && (
            <p className="text-xs mt-1 text-slate-400 font-mono">
              {data.vsStorePercent > 0 ? '+' : ''}{data.vsStorePercent.toFixed(0)}% {t('calculator.vsStorePrice')}
           </p>
          )}
       </div>
        <div className="flex items-center gap-1">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg text-slate-400 hover:text-primary-400 hover:bg-primary-900/20 transition-colors"
              aria-label={t('calculator.refreshLabel')}
            >
              <ArrowPathIcon className="h-5 w-5" />
           </button>
          )}
          <button
            onClick={() => setShowPrice(!showPrice)}
            className="p-2 rounded-lg text-slate-400 hover:text-primary-400 hover:bg-primary-900/20 transition-colors"
            aria-label={showPrice ? t('calculator.hidePrice') : t('calculator.showPrice')}
          >
            {showPrice ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
         </button>
       </div>
     </div>

      {/* Price Display */}
      <div className="p-5">
        <div className={clsx('relative', !showPrice && 'opacity-50')}>
          {showPrice ? (
            <>
              <div className={clsx(
                'text-center py-8 rounded-xl border-2 border-dashed relative overflow-hidden',
                isMarketplace
                  ? 'border-primary-500/40 bg-gradient-to-br from-primary-900/30 to-primary-900/10'
                  : 'border-purple-500/40 bg-gradient-to-br from-purple-900/30 to-purple-900/10'
              )}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(118,185,0,0.08),_transparent_70%)]" />
                <p className={clsx('relative text-4xl sm:text-5xl lg:text-6xl font-bold font-mono tracking-tight',
                  isMarketplace ? 'text-primary-300' : 'text-purple-300')}>
                  {data.sellingPrice || data.marketplacePrice || data.livePrice
                    ? formatIDR(data.sellingPrice || data.marketplacePrice || data.livePrice)
                    : '-'}
               </p>
                {data.netSale && data.netSale !== (data.sellingPrice || data.marketplacePrice || data.livePrice) && (
                  <p className="relative text-sm mt-2 text-slate-400">
                    {t('calculator.netSalePrefix')} <span className="font-mono text-slate-300">{formatIDR(data.netSale)}</span>
                 </p>
                )}
             </div>

              {/* Profit Indicator */}
              <div className={clsx(
                'mt-4 px-4 py-3 rounded-xl text-center border',
                isProfit
                  ? 'bg-primary-500/10 border-primary-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              )}>
                <p className={clsx(
                  'text-lg font-bold font-mono',
                  isProfit ? 'text-primary-300' : 'text-red-400'
                )}>
                  {isProfit ? '+' : ''}{formatIDR(data.netProfit ?? 0)} ({(data.netProfitPercent ?? 0).toFixed(1)}%)
               </p>
                <p className="text-xs mt-1 text-slate-400 uppercase tracking-wider">
                  {t('calculator.netProfit')}
               </p>
             </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="h-16 bg-[#0a0e0a]/60 rounded-xl border border-primary-900/20 animate-pulse mb-4" />
              <div className="h-8 bg-[#0a0e0a]/60 rounded w-1/2 mx-auto border border-primary-900/20 animate-pulse" />
           </div>
          )}
       </div>
     </div>
   </div>
  );
}
