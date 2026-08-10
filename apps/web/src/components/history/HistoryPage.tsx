'use client';

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, TrashIcon, DocumentDuplicateIcon, EyeIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { CalculatorResults } from '../calculator/CalculatorResults';
import { CalculatorBreakdown } from '../calculator/CalculatorBreakdown';
import type { CalculationRecord } from '@/shared';

interface HistoryPageProps {}

export function HistoryPage() {
  const { t } = useTranslation();
  const [calculations, setCalculations] = useState<CalculationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [marketplaceFilter, setMarketplaceFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'netProfit'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCalculation, setSelectedCalculation] = useState<CalculationRecord | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true,
  });

  const fetchCalculations = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });
      if (marketplaceFilter !== 'all') params.append('marketplace', marketplaceFilter);
      if (modeFilter !== 'all') params.append('mode', modeFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await api.get(`/calculations?${params.toString()}`);
      setCalculations(response.data.data.items);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Gagal memuat riwayat');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalculations();
  }, [page, marketplaceFilter, modeFilter, sortBy, sortOrder, searchQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm(t('history.deleteConfirm'))) return;
    try {
      await api.delete(`/calculations/${id}`);
      toast.success(t('notifications.calculationDeleted'));
      fetchCalculations();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Gagal menghapus');
    }
  };

  const handleDuplicate = async (calculation: CalculationRecord) => {
    try {
      await api.post(`/calculations/${calculation.id}/duplicate`);
      toast.success('Perhitungan diduplikat');
      fetchCalculations();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Gagal menduplikat');
    }
  };

  const handleView = (calculation: CalculationRecord) => {
    setSelectedCalculation(calculation);
    setShowDetail(true);
  };

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatIDR = (num: number) => `Rp${num.toLocaleString('id-ID')}`;

  const getMarketplaceColor = (mp: string) => {
    const colors: Record<string, string> = {
      tokopedia: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      shopee: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      lazada: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      tiktok: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    };
    return colors[mp] || 'bg-slate-100 text-slate-700';
  };

  const getMarketplaceSolidColor = (mp: string) => {
    const solid: Record<string, string> = {
      tokopedia: '#00A651',
      shopee: '#EE4D2D',
      lazada: '#FF6B00',
      tiktok: '#0a0a0a',
    };
    return solid[mp] || '#6366F1';
  };

  const getModeLabel = (mode: string) => mode === 'marketplace' ? t('calculator.inputs.modeMarketplace') : t('calculator.inputs.modeLive');

  const filteredCalculations = calculations.filter(c => {
    if (searchQuery && !c.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container-main py-6 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">{t('history.title')}</h1>
          <p className="page-subtitle">Kelola dan lihat riwayat perhitungan keuntungan Anda</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.search')}
              className="input pl-10"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={marketplaceFilter}
              onChange={(e) => setMarketplaceFilter(e.target.value)}
              className="input w-auto"
            >
              <option value="all">{t('history.allMarketplaces')}</option>
              <option value="tokopedia">Tokopedia</option>
              <option value="shopee">Shopee</option>
              <option value="lazada">Lazada</option>
              <option value="tiktok">TikTok Shop</option>
            </select>

            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="input w-auto"
            >
              <option value="all">{t('history.allModes')}</option>
              <option value="marketplace">{t('calculator.inputs.modeMarketplace')}</option>
              <option value="live">{t('calculator.inputs.modeLive')}</option>
            </select>

            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split(':');
                setSortBy(newSortBy as any);
                setSortOrder(newSortOrder as any);
              }}
              className="input w-auto"
            >
              <option value="createdAt:desc">{t('history.newest')}</option>
              <option value="createdAt:asc">{t('history.oldest')}</option>
              <option value="netProfit:desc">{t('history.highestProfit')}</option>
              <option value="netProfit:asc">{t('history.lowestProfit')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calculations List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCalculations.length === 0 ? (
        <div className="card p-12 text-center">
          <MagnifyingGlassIcon className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">{t('history.empty')}</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{t('history.noResults')}</p>
          <a href="/calculator" className="btn-primary inline-flex">
            <CalculatorIcon className="h-5 w-5" />
            <span>Buat Perhitungan Baru</span>
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filteredCalculations.map(calculation => (
              <div key={calculation.id} className="card p-4 hover:shadow-card-hover transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: getMarketplaceSolidColor(calculation.marketplace) }}>
                      <CalculatorIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {calculation.name || 'Perhitungan Tanpa Nama'}
                        </h3>
                        <span className={clsx('badge px-2 py-0.5 text-xs', getMarketplaceColor(calculation.marketplace))}>
                          {calculation.marketplace}
                        </span>
                        <span className="badge badge-neutral">{getModeLabel(calculation.mode)}</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {formatDate(calculation.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:ml-4">
                    <div className="text-right hidden sm:block min-w-[140px]">
                      <p className={clsx('font-bold text-lg', (calculation.results?.netProfit ?? 0) >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400')}>
                        {(calculation.results?.netProfit ?? 0) >= 0 ? '+' : ''}{formatIDR(calculation.results?.netProfit ?? 0)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {(calculation.results?.netProfitPercent ?? 0).toFixed(1)}% margin
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(calculation)}
                        className="btn-ghost btn-sm p-2"
                        aria-label="Lihat detail"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(calculation)}
                        className="btn-ghost btn-sm p-2"
                        aria-label="Duplikat"
                      >
                        <DocumentDuplicateIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(calculation.id)}
                        className="btn-ghost btn-sm p-2 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                        aria-label="Hapus"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-outline btn-sm"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="px-4 text-sm text-slate-600 dark:text-slate-400">
                Halaman {page} dari {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-outline btn-sm"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {showDetail && selectedCalculation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowDetail(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedCalculation.name || 'Detail Perhitungan'}</h3>
              <button onClick={() => setShowDetail(false)} className="btn-ghost p-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-6">
              <CalculatorResults
                mode="marketplace"
                title={t('calculator.marketplacePrice')}
                data={selectedCalculation.results}
                isCalculating={false}
              />
              <CalculatorBreakdown
                data={selectedCalculation.results?.breakdown ?? []}
                mode="marketplace"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
