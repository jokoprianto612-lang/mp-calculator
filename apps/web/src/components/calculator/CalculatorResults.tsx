'use client';

import { useTranslation } from 'react-i18next';
import { PencilIcon, EyeIcon, EyeSlashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
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

  if (!data && !isCalculating) {
    return (
      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Klik tombol Hitung untuk melihat hasil</p>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8 text-center">
          <ArrowPathIcon className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Belum ada perhitungan</p>
        </div>
      </div>
    );
  }

  if (isCalculating) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  const isProfit = (data.netProfit ?? 0) >= 0;
  const profitColor = isProfit ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400';
  const profitBg = isProfit ? 'bg-success-50 dark:bg-success-900/20' : 'bg-danger-50 dark:bg-danger-900/20';
  const profitBorder = isProfit ? 'border-success-200 dark:border-success-800' : 'border-danger-200 dark:border-danger-800';

  const formatIDR = (num: number) => `Rp${num.toLocaleString('id-ID')}`;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className={clsx('p-5', mode === 'marketplace' ? 'bg-primary-500' : 'bg-slate-50 dark:bg-slate-800')}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className={clsx('font-semibold', mode === 'marketplace' ? 'text-white' : 'text-slate-900 dark:text-white')}>
              {title}
            </h3>
            {mode === 'live' && data.vsStorePercent && (
              <p className={clsx('text-sm mt-1', mode === 'marketplace' ? 'text-primary-100' : 'text-slate-500 dark:text-slate-400')}>
                {data.vsStorePercent > 0 ? '+' : ''}{data.vsStorePercent.toFixed(0)}% {t('calculator.vsStorePrice')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  mode === 'marketplace'
                    ? 'text-primary-100 hover:text-white hover:bg-primary-400/20'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                )}
                aria-label="Edit harga"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            )}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  mode === 'marketplace'
                    ? 'text-primary-100 hover:text-white hover:bg-primary-400/20'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                )}
                aria-label="Hitung ulang"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => setShowPrice(!showPrice)}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                mode === 'marketplace'
                  ? 'text-primary-100 hover:text-white hover:bg-primary-400/20'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              )}
              aria-label={showPrice ? 'Sembunyikan harga' : 'Tampilkan harga'}
            >
              {showPrice ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Price Display */}
      <div className="p-5">
        <div className={clsx('relative', !showPrice && 'opacity-50')}>
          {showPrice ? (
            <>
              <div className={clsx(
                'text-center py-6 rounded-xl border-2 border-dashed',
                mode === 'marketplace'
                  ? 'border-white/30 bg-white/10'
                  : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
              )}>
                <p className={clsx('text-4xl sm:text-5xl lg:text-6xl font-bold', mode === 'marketplace' ? 'text-white' : 'text-slate-900 dark:text-white')}>
                  {data.sellingPrice || data.marketplacePrice || data.livePrice ? formatIDR(data.sellingPrice || data.marketplacePrice || data.livePrice) : '-'}
                 </p>
                {data.netSale && data.netSale !== (data.sellingPrice || data.marketplacePrice || data.livePrice) && (
                  <p className={clsx('text-sm mt-1', mode === 'marketplace' ? 'text-primary-100' : 'text-slate-500 dark:text-slate-400')}>
                    Net Sale: {formatIDR(data.netSale)}
                   </p>
                )}
              </div>

              {/* Profit Indicator */}
              <div className={clsx('mt-4 px-4 py-3 rounded-xl text-center', profitBg, profitBorder)}>
                <p className={clsx('text-lg font-bold', profitColor)}>
                  {isProfit ? '+' : ''}{formatIDR(data.netProfit ?? 0)} ({(data.netProfitPercent ?? 0).toFixed(1)}%)
                 </p>
                <p className={clsx('text-sm mt-1', mode === 'marketplace' ? 'text-primary-100' : 'text-slate-500 dark:text-slate-400')}>
                  {t('calculator.netProfit')}
                 </p>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse mb-4" />
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
