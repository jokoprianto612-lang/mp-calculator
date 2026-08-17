'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useCalculatorStore } from '../../stores/calculatorStore';
import { CalculatorIcon, ShoppingBagIcon, TruckIcon, TagIcon, CreditCardIcon, BuildingOfficeIcon, SparklesIcon, ScaleIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import React from 'react';

const calculatorSchema = z.object({
  marketplace: z.enum(['tokopedia', 'shopee', 'lazada', 'tiktok']),
  mode: z.enum(['marketplace', 'live']),
  category: z.string().min(1, 'Kategori wajib dipilih'),
  hpp: z.preprocess((v) => (typeof v === 'number' && Number.isNaN(v)) ? 0 : v, z.number().min(1, 'HPP minimal 1')),
  targetMargin: z.preprocess((v) => (typeof v === 'number' && Number.isNaN(v)) ? undefined : v, z.number().min(-100).max(1000).optional()),
  sellingPrice: z.preprocess((v) => (typeof v === 'number' && Number.isNaN(v)) ? undefined : v, z.number().nonnegative().optional()),
  sellerVoucher: z.preprocess((v) => (typeof v === 'number' && Number.isNaN(v)) ? 0 : v, z.number().min(0).default(0)),
  platformVoucher: z.preprocess((v) => (typeof v === 'number' && Number.isNaN(v)) ? 0 : v, z.number().min(0).default(0)),
  isMallSeller: z.boolean().default(false),
  useAds: z.boolean().default(false),
  adBudget: z.preprocess((v) => (typeof v === 'number' && Number.isNaN(v)) ? 0 : v, z.number().min(0).default(0)),
  useAms: z.boolean().default(false),
  weight: z.preprocess((v) => (typeof v === 'number' && Number.isNaN(v)) ? 0 : v, z.number().min(0).default(0)),
  originCity: z.string().min(1, 'Kota asal wajib diisi'),
  destinationCity: z.string().min(1, 'Kota tujuan wajib diisi'),
  packingCost: z.preprocess((v) => (typeof v === 'number' && Number.isNaN(v)) ? 0 : v, z.number().min(0).default(0)),
  freeShippingProgram: z.string().optional(),
  promoProgram: z.string().optional(),
  liveDiscountPercent: z.preprocess((v) => (typeof v === 'number' && Number.isNaN(v)) ? 20 : v, z.number().min(0).max(100).default(20)),
  liveAdBudget: z.preprocess((v) => (typeof v === 'number' && Number.isNaN(v)) ? 0 : v, z.number().min(0).default(0)),
  livePackingCost: z.preprocess((v) => (typeof v === 'number' && Number.isNaN(v)) ? 0 : v, z.number().min(0).default(0)),
}).refine(
  (data) => {
    const hasSP = typeof data.sellingPrice === 'number' && data.sellingPrice > 0;
    const hasTM = typeof data.targetMargin === 'number' && data.targetMargin > 0;
    return hasSP || hasTM;
  },
  { message: 'Harus mengisi Harga Jual atau Target Margin', path: ['targetMargin'] }
).refine(
  (data) => {
    const hasSP = typeof data.sellingPrice === 'number' && data.sellingPrice > 0;
    const hasTM = typeof data.targetMargin === 'number' && data.targetMargin > 0;
    return !(hasSP && hasTM);
  },
  { message: 'Hanya isi salah satu: Harga Jual atau Target Margin', path: ['sellingPrice'] }
);

type CalculatorFormData = z.infer<typeof calculatorSchema>;

const MARKETPLACES = [
  { value: 'tokopedia', color: '#00A651' },
  { value: 'shopee', color: '#EE4D2D' },
  { value: 'lazada', color: '#FF6B00' },
  { value: 'tiktok', color: '#000000' },
];

const CATEGORIES = [
  { value: 'electronics' },
  { value: 'fashion' },
  { value: 'home' },
  { value: 'beauty' },
  { value: 'health' },
  { value: 'sports' },
  { value: 'automotive' },
  { value: 'books' },
  { value: 'toys' },
  { value: 'food' },
];

const FREE_SHIPPING_PROGRAMS: Record<string, string[]> = {
  tokopedia: ['xtra', 'spesial'],
  shopee: ['freeship', 'freeship-plus'],
  lazada: ['lazada-freeship', 'lazada-freeship-plus'],
  tiktok: ['tiktok-freeship', 'live-freeship'],
};

const PROMO_PROGRAMS: Record<string, string[]> = {
  tokopedia: ['promo-xtra', 'flash-sale'],
  shopee: ['shopee-promo', 'mall-promo'],
  lazada: ['lazada-promo', 'mall-promo'],
  tiktok: ['live-promo', 'shop-promo'],
};

export function CalculatorForm() {
  const { t } = useTranslation();
  const { inputs, setInputs, calculate, isCalculating } = useCalculatorStore();
  // marketplace di-watch via watch() di useForm di bawah

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CalculatorFormData>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: { ...inputs, liveDiscountPercent: inputs.liveDiscountPercent ?? 20, liveAdBudget: inputs.liveAdBudget ?? 0, livePackingCost: inputs.livePackingCost ?? 0 },
    mode: 'onSubmit',
  });

  const mode = watch('mode');
  const useAds = watch('useAds');
  const useAms = watch('useAms');
  const isMallSeller = watch('isMallSeller');
  const sellingPrice = watch('sellingPrice');
  const targetMargin = watch('targetMargin');
  const hpp = watch('hpp');
  const marketplace = watch('marketplace') || inputs.marketplace;

  const handleSubmitForm = (data: CalculatorFormData) => {
    setInputs(data);
    calculate();
  };
  const handleInvalid = (errs: any) => {
    console.warn('[CalculatorForm] validation failed', errs);
  };

  const handleMarketplaceChange = (value: string) => {
    setValue('marketplace', value as any);
    setValue('freeShippingProgram', '');
    setValue('promoProgram', '');
    setInputs({ ...inputs, marketplace: value as any, freeShippingProgram: undefined, promoProgram: undefined });
  };

  const handleModeChange = (value: 'marketplace' | 'live') => {
    setValue('mode', value);
    setInputs({ ...inputs, mode: value });
  };

  const formatNumber = (num: number) => `Rp${num.toLocaleString('id-ID')}`;

  return (
    <form onSubmit={handleSubmit(handleSubmitForm, handleInvalid)} className="relative overflow-hidden rounded-xl border border-primary-500 bg-black p-5 space-y-6 shadow-[0_0_30px_rgba(118,185,0,0.25)]">
      {/* Marketplace & Mode */}
      <div className="space-y-4">
        <div>
          <label className="label">{t('calculator.inputs.marketplace')}</label>
          <div className="grid grid-cols-2 gap-2">
            {MARKETPLACES.map(mp => (
              <button
                key={mp.value}
                type="button"
                onClick={() => handleMarketplaceChange(mp.value)}
                className={clsx(
                  'relative p-3 rounded-lg border-2 transition-all text-left',
                  inputs.marketplace === mp.value
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-primary-900/30 hover:border-primary-700/50'
                )}
                style={inputs.marketplace === mp.value ? { borderColor: mp.color, backgroundColor: `${mp.color}1A` } : undefined}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: mp.color }}>
                    <ShoppingBagIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium text-sm text-slate-900 dark:text-white">{t(`marketplaces.${mp.value}`)}</span>
                </div>
                {inputs.marketplace === mp.value && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: mp.color }}>
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">{t('calculator.inputs.mode')}</label>
          <div className="flex gap-2">
            {[
              { value: 'marketplace', label: t('calculator.inputs.modeMarketplace'), icon: BuildingOfficeIcon },
              { value: 'live', label: t('calculator.inputs.modeLive'), icon: SparklesIcon },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleModeChange(opt.value as any)}
                className={clsx(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all',
                  mode === opt.value
                    ? 'border-primary-500 bg-primary-500/15 text-primary-300'
                    : 'border-primary-900/30 hover:border-primary-700/50'
                )}
              >
                <opt.icon className="h-5 w-5" />
                <span className="font-medium text-sm">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="form-group">
        <label htmlFor="category" className="label">
          <TagIcon className="h-5 w-5 inline-block mr-1" />
          {t('calculator.inputs.category')}
        </label>
        <select
          {...register('category')}
          id="category"
          className={clsx('input', errors.category && 'input-error')}
        >
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{t(`categories.${cat.value}`)}</option>
          ))}
        </select>
        {errors.category && <p className="form-error">{errors.category.message}</p>}
      </div>

      {/* Core Pricing */}
      <div className="border-t border-primary-900/20 pt-5 space-y-4">
        <h3 className="text-xs font-semibold text-primary-400 uppercase tracking-wider flex items-center gap-2">
          <CalculatorIcon className="h-5 w-5 text-primary-500" />
          Harga & Margin
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="form-group">
            <label htmlFor="hpp" className="label">
              <ScaleIcon className="h-5 w-5 inline-block mr-1" />
              {t('calculator.inputs.hpp')}
            </label>
            <input
              {...register('hpp', { valueAsNumber: true })}
              id="hpp"
              type="number"
              min="1"
              step="1000"
              className={clsx('input', errors.hpp && 'input-error')}
              placeholder="150000"
            />
            {errors.hpp && <p className="form-error">{errors.hpp.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="targetMargin" className="label">
              <ScaleIcon className="h-5 w-5 inline-block mr-1" />
              {t('calculator.inputs.targetMargin')}
            </label>
            <input
              {...register('targetMargin', { valueAsNumber: true })}
              id="targetMargin"
              type="number"
              min="-100"
              max="1000"
              step="0.1"
              className={clsx('input', errors.targetMargin && 'input-error', sellingPrice && 'bg-[#0a0e0a]/40')}
              placeholder="20"
              disabled={!!sellingPrice}
            />
            {errors.targetMargin && <p className="form-error">{errors.targetMargin.message}</p>}
            <p className="form-hint">{t('calculator.inputs.targetMargin')}: otomatis hitung harga jual</p>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="sellingPrice" className="label">
            <CalculatorIcon className="h-5 w-5 inline-block mr-1" />
            {t('calculator.inputs.sellingPrice')}
          </label>
          <input
            {...register('sellingPrice', { valueAsNumber: true })}
            id="sellingPrice"
            type="number"
            min="1"
            step="1000"
            className={clsx('input', errors.sellingPrice && 'input-error', targetMargin && 'bg-[#0a0e0a]/40')}
            placeholder="250000"
            disabled={!!targetMargin}
          />
          {errors.sellingPrice && <p className="form-error">{errors.sellingPrice.message}</p>}
          <p className="form-hint">{t('calculator.inputs.sellingPrice')}: gunakan ini ATAU target margin di atas</p>
        </div>
      </div>

      {/* Vouchers */}
      <div className="border-t border-primary-900/20 pt-5 space-y-4">
        <h3 className="text-xs font-semibold text-primary-400 uppercase tracking-wider flex items-center gap-2">
          <CreditCardIcon className="h-5 w-5 text-primary-500" />
          Voucher & Diskon
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="form-group">
            <label htmlFor="sellerVoucher" className="label">{t('calculator.inputs.sellerVoucher')}</label>
            <input
              {...register('sellerVoucher', { valueAsNumber: true })}
              id="sellerVoucher"
              type="number"
              min="0"
              step="1000"
              className="input"
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="platformVoucher" className="label">{t('calculator.inputs.platformVoucher')}</label>
            <input
              {...register('platformVoucher', { valueAsNumber: true })}
              id="platformVoucher"
              type="number"
              min="0"
              step="1000"
              className="input"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Seller Settings */}
      <div className="border-t border-primary-900/20 pt-5 space-y-4">
        <h3 className="text-xs font-semibold text-primary-400 uppercase tracking-wider flex items-center gap-2">
          <BuildingOfficeIcon className="h-5 w-5 text-primary-500" />
          Pengaturan Penjual
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register('isMallSeller')}
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-slate-300">{t('calculator.inputs.isMallSeller')}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register('useAms')}
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-slate-300">{t('calculator.inputs.useAms')}</span>
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="adBudget" className="label">{t('calculator.inputs.adBudget')}</label>
          <input
            {...register('adBudget', { valueAsNumber: true })}
            id="adBudget"
            type="number"
            min="0"
            step="1000"
            className={clsx('input', !useAds && 'bg-[#0a0e0a]/40')}
            placeholder="0"
            disabled={!useAds}
          />
        </div>

        {mode === 'live' && (
          <div className="form-group">
            <label htmlFor="liveAdBudget" className="label">{t('calculator.inputs.liveAdBudget')}</label>
            <input
              {...register('liveAdBudget', { valueAsNumber: true })}
              id="liveAdBudget"
              type="number"
              min="0"
              step="1000"
              className="input"
              placeholder="0"
            />
          </div>
        )}
      </div>

      {/* Shipping & Logistics */}
      <div className="border-t border-primary-900/20 pt-5 space-y-4">
        <h3 className="text-xs font-semibold text-primary-400 uppercase tracking-wider flex items-center gap-2">
          <TruckIcon className="h-5 w-5 text-primary-500" />
          Pengiriman & Logistik
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="form-group">
            <label htmlFor="weight" className="label">{t('calculator.inputs.weight')}</label>
            <input
              {...register('weight', { valueAsNumber: true })}
              id="weight"
              type="number"
              min="0"
              step="0.1"
              className="input"
              placeholder="0.5"
            />
          </div>
          <div className="form-group">
            <label htmlFor="originCity" className="label">{t('calculator.inputs.originCity')}</label>
            <input
              {...register('originCity')}
              id="originCity"
              type="text"
              className="input"
              placeholder="Jakarta"
            />
          </div>
          <div className="form-group">
            <label htmlFor="destinationCity" className="label">{t('calculator.inputs.destinationCity')}</label>
            <input
              {...register('destinationCity')}
              id="destinationCity"
              type="text"
              className="input"
              placeholder="Surabaya"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="form-group">
            <label htmlFor="freeShippingProgram" className="label">{t('calculator.inputs.freeShippingProgram')}</label>
            <select
              {...register('freeShippingProgram')}
              id="freeShippingProgram"
              className="input"
            >
              <option value="">{t('common.optional')}</option>
              {FREE_SHIPPING_PROGRAMS[marketplace]?.map(key => (
                <option key={key} value={key}>{t(`freeShippingPrograms.${key}`)}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="promoProgram" className="label">{t('calculator.inputs.promoProgram')}</label>
            <select
              {...register('promoProgram')}
              id="promoProgram"
              className="input"
            >
              <option value="">{t('common.optional')}</option>
              {PROMO_PROGRAMS[marketplace]?.map(key => (
                <option key={key} value={key}>{t(`promoPrograms.${key}`)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Packing Cost */}
      <div className="border-t border-primary-900/20 pt-5 space-y-4">
        <h3 className="text-xs font-semibold text-primary-400 uppercase tracking-wider flex items-center gap-2">
          <ScaleIcon className="h-5 w-5 text-primary-500" />
          Biaya Tambahan
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="form-group">
            <label htmlFor="packingCost" className="label">{t('calculator.inputs.packingCost')}</label>
            <input
              {...register('packingCost', { valueAsNumber: true })}
              id="packingCost"
              type="number"
              min="0"
              step="1000"
              className="input"
              placeholder="5000"
            />
          </div>

          {mode === 'live' && (
            <div className="form-group">
              <label htmlFor="livePackingCost" className="label">{t('calculator.inputs.livePackingCost')}</label>
              <input
                {...register('livePackingCost', { valueAsNumber: true })}
                id="livePackingCost"
                type="number"
                min="0"
                step="1000"
                className="input"
                placeholder="0"
              />
            </div>
          )}

          {mode === 'live' && (
            <div className="form-group sm:col-span-2">
              <label htmlFor="liveDiscountPercent" className="label">{t('calculator.inputs.liveDiscountPercent')}</label>
              <input
                {...register('liveDiscountPercent', { valueAsNumber: true })}
                id="liveDiscountPercent"
                type="number"
                min="0"
                max="100"
                step="1"
                className="input"
                placeholder="20"
              />
              <p className="form-hint">{t('calculator.discountHelper')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Calculate Button */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <button
          type="submit"
          className="relative w-full py-3.5 text-base font-semibold rounded-lg bg-primary-500 hover:bg-primary-400 text-[#0a0e0a] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(118,185,0,0.25)] hover:shadow-[0_0_40px_rgba(118,185,0,0.4)]"
          disabled={isCalculating}
        >
          {isCalculating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('common.loading')}
            </>
          ) : (
            <>
              <CalculatorIcon className="h-6 w-6" />
              <span>{t('calculator.calculate')}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
