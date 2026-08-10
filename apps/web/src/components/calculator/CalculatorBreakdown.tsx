'use client';

import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, ChevronUpIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import React from 'react';
import type { FeeBreakdownItem } from '@/shared';

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
    if (item.type === 'income') return 'text-primary-300';
    if (item.type === 'expense') return 'text-red-400';
    if (item.type === 'total') return 'text-slate-100 font-bold';
    return 'text-slate-300';
  };

  const getItemBg = (item: FeeBreakdownItem) => {
    if (item.type === 'income') return 'bg-primary-500/10 border-primary-500/20';
    if (item.type === 'expense') return 'bg-red-500/5 border-red-500/10';
    if (item.type === 'total') return 'bg-[#0a0e0a]/40 border-primary-500/20';
    return 'border-transparent';
  };

  const renderItem = (item: FeeBreakdownItem, index: number, indent = 0) => {
    const itemId = `${mode}-${index}-${item.label}`;
    const isCollapsed = collapsedItems.has(itemId);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={itemId} className="group">
        <div
          className={clsx(
            'flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors hover:border-primary-500/30',
            indent > 0 && 'pl-8 bg-[#0a0e0a]/30',
            !indent && getItemBg(item)
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
                className="flex-shrink-0 p-1 rounded hover:bg-primary-900/20 text-slate-400 hover:text-primary-400 transition-colors"
                aria-label={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronUpIcon className="h-4 w-4" />}
             </button>
            )}

            <span className={clsx('truncate', indent > 0 ? 'font-normal' : 'font-medium', getItemColor(item))}>
              {item.label}
          </span>

            {item.tooltip && (
              <button
                className="flex-shrink-0 p-1 text-slate-500 hover:text-primary-400 transition-colors"
                aria-label={item.tooltip}
                title={item.tooltip}
              >
                <InformationCircleIcon className="h-4 w-4" />
             </button>
            )}
        </div>

          <div className={clsx('font-mono tabular-nums font-semibold', getItemColor(item))}>
            {item.amount >= 0 ? '+' : '\u2212'}{formatIDR(item.amount)}
        </div>
      </div>

        {hasChildren && !isCollapsed && (
          <div className="mt-1 space-y-1 border-l-2 border-primary-500/30 pl-2 ml-4">
            {item.children!.map((child, childIndex) => renderItem(child, childIndex, indent + 1))}
        </div>
        )}
    </div>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary-900/30 bg-[#121812]/60 backdrop-blur-sm">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

      {/* Header */}
      <div className="px-5 py-4 border-b border-primary-900/20">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <InformationCircleIcon className="h-5 w-5 text-primary-500" />
            {mode === 'marketplace' ? 'Rincian Biaya Marketplace' : 'Rincian Biaya Live Selling'}
        </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-primary-400 rounded-lg hover:bg-primary-900/20 transition-colors"
          >
            {isExpanded ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
            <span>{isExpanded ? t('calculator.hideDetails') : t('calculator.showDetails')}</span>
        </button>
      </div>
    </div>

      {/* Breakdown Items */}
      {isExpanded && (
        <div className="p-5 space-y-1.5 animate-in">
          {data.map((item, index) => renderItem(item, index))}
      </div>
      )}

      {/* View Live Details Button */}
      {mode === 'marketplace' && (
        <div className="px-5 py-3 border-t border-primary-900/20">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-primary-400 hover:bg-primary-900/20 rounded-lg transition-colors border border-primary-900/30 hover:border-primary-500/50">
            <InformationCircleIcon className="h-5 w-5" />
            {t('calculator.viewLiveDetails')}
        </button>
      </div>
      )}
  </div>
  );
}
