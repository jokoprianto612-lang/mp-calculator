'use client';

import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, ChevronUpIcon, MinusIcon, PlusIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import React from 'react';
import type { FeeBreakdownItem } from '@mp-calculator/shared';

interface CalculatorBreakdownProps {
  data: FeeBreakdownItem[];
  mode: 'marketplace' | 'live';
}

export function CalculatorBreakdown({ data, mode }: CalculatorBreakdownProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [collapsedItems, setCollapsedItems] = React.useState<Set<string>>(new Set());

  if (!data || data.length === 0) {
    return null;
  }

  const formatIDR = (num: number) => {
    const abs = Math.abs(num);
    return `Rp${abs.toLocaleString('id-ID')}`;
  };

  const getItemColor = (item: FeeBreakdownItem) => {
    if (item.type === 'income') return 'text-success-600 dark:text-success-400';
    if (item.type === 'expense') return 'text-danger-600 dark:text-danger-400';
    if (item.type === 'total') return 'text-slate-900 dark:text-white font-bold';
    return 'text-slate-600 dark:text-slate-400';
  };

  const getItemBg = (item: FeeBreakdownItem) => {
    if (item.type === 'income') return 'bg-success-50 dark:bg-success-900/20';
    if (item.type === 'expense') return 'bg-danger-50 dark:bg-danger-900/20';
    if (item.type === 'total') return 'bg-slate-50 dark:bg-slate-800/50';
    return 'transparent';
  };

  const renderItem = (item: FeeBreakdownItem, index: number, indent = 0) => {
    const itemId = `${mode}-${index}-${item.label}`;
    const isCollapsed = collapsedItems.has(itemId);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={itemId} className="group">
        <div
          className={clsx(
            'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
            indent > 0 && 'pl-8',
            getItemBg(item)
          )}
        >
          <div className={clsx('flex-1 min-w-0 flex items-center gap-2', indent > 0 && 'text-sm')}>
            {hasChildren && (
              <button
                onClick={() => setCollapsedItems(prev => {
                  const next = new Set(prev);
                  if (isCollapsed) next.delete(itemId); else next.add(itemId);
                  return next;
                })}
                className="flex-shrink-0 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronUpIcon className="h-4 w-4" />}
              </button>
            )}

            <span className="truncate font-medium" style={{ color: getItemColor(item) }}>
              {item.label}
            </span>

            {item.tooltip && (
              <button
                className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                aria-label={item.tooltip}
              >
                <InformationCircleIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className={clsx('font-mono tabular-nums font-semibold', getItemColor(item))}>
            {item.amount >= 0 ? '+' : '−'}{formatIDR(item.amount)}
          </div>
        </div>

        {hasChildren && !isCollapsed && (
          <div className="mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
            {item.children!.map((child, childIndex) => renderItem(child, childIndex, indent + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <InformationCircleIcon className="h-5 w-5 text-primary-500" />
            {mode === 'marketplace' ? 'Rincian Biaya Marketplace' : 'Rincian Biaya Live Selling'}
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
            <span>{isExpanded ? t('calculator.hideDetails') : t('calculator.showDetails')}</span>
          </button>
        </div>
      </div>

      {/* Breakdown Items */}
      {isExpanded && (
        <div className="p-5 space-y-1 animate-in">
          {data.map((item, index) => renderItem(item, index))}
        </div>
      )}

      {/* View Live Details Button (for marketplace mode) */}
      {mode === 'marketplace' && (
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
            <InformationCircleIcon className="h-5 w-5" />
            {t('calculator.viewLiveDetails')}
          </button>
        </div>
      )}
    </div>
  );
}