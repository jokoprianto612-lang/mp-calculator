'use client';

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, CheckCircleIcon, DocumentDuplicateIcon, StarIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Preset } from '@/shared';
import { CalculatorForm } from '../calculator/CalculatorForm';

interface PresetsPageProps {}

const presetSchema = z.object({
  name: z.string().min(1, 'Nama preset wajib diisi').max(100),
  marketplace: z.enum(['tokopedia', 'shopee', 'lazada', 'tiktok']),
  inputs: z.any(),
  isDefault: z.boolean().default(false),
});

type PresetFormData = z.infer<typeof presetSchema>;

export function PresetsPage() {
  const { t } = useTranslation();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true,
  });

  const fetchPresets = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/presets');
      setPresets(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Gagal memuat preset');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  const handleCreate = async (data: PresetFormData) => {
    try {
      const response = await api.post('/presets', data);
      toast.success(t('notifications.presetSaved'));
      setShowModal(false);
      setEditingPreset(null);
      fetchPresets();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Gagal membuat preset');
    }
  };

  const handleUpdate = async (id: string, data: Partial<PresetFormData>) => {
    try {
      await api.patch(`/presets/${id}`, data);
      toast.success(t('notifications.presetSaved'));
      setShowModal(false);
      setEditingPreset(null);
      fetchPresets();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Gagal mengupdate preset');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('presets.deleteConfirm'))) return;
    try {
      await api.delete(`/presets/${id}`);
      toast.success(t('notifications.presetDeleted'));
      fetchPresets();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Gagal menghapus preset');
    }
  };

  const handleUsePreset = (preset: Preset) => {
    // This would populate the calculator form with preset values
    // For now, we'll just show a toast
    toast.success(`Preset "${preset.name}" siap digunakan`);
    // Navigate to calculator with preset data
    // In a real app, you'd use the router to navigate and pass data
  };

  const openCreateModal = () => {
    setEditingPreset(null);
    setShowModal(true);
  };

  const openEditModal = (preset: Preset) => {
    setEditingPreset(preset);
    setShowModal(true);
  };

  const getMarketplaceColor = (mp: string) => {
    const colors: Record<string, string> = {
      tokopedia: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      shopee: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      lazada: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      tiktok: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    };
    return colors[mp] || 'bg-slate-100 text-slate-700';
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="container-main py-6 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">{t('presets.title')}</h1>
          <p className="page-subtitle">Simpan dan kelola template perhitungan untuk digunakan kembali</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <PlusIcon className="h-5 w-5" />
          <span>{t('presets.createNew')}</span>
        </button>
      </div>

      {/* Presets List */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
              <div className="flex gap-2">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex-1" />
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : presets.length === 0 ? (
        <div className="card p-12 text-center">
          <DocumentDuplicateIcon className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">{t('presets.empty')}</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Buat preset pertama Anda untuk mempercepat perhitungan berulang</p>
          <button onClick={openCreateModal} className="btn-primary">
            <PlusIcon className="h-5 w-5" />
            <span>{t('presets.createNew')}</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map(preset => (
            <div key={preset.id} className="card p-5 hover:shadow-card-hover transition-shadow relative">
              {preset.isDefault && (
                <div className="absolute top-3 right-3">
                  <span className="badge badge-primary flex items-center gap-1">
                    <StarIcon className="h-3 w-3" />
                    {t('presets.defaultBadge')}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1 truncate">{preset.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={clsx('badge px-2 py-0.5 text-xs', getMarketplaceColor(preset.marketplace))}>
                    {preset.marketplace}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(preset.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUsePreset(preset)}
                  className="btn-primary flex-1 text-sm"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                  {t('presets.use')}
                </button>
                <button
                  onClick={() => openEditModal(preset)}
                  className="btn-outline btn-sm p-2"
                  aria-label="Edit preset"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(preset.id)}
                  className="btn-ghost btn-sm p-2 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                  aria-label="Hapus preset"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => { setShowModal(false); setEditingPreset(null); }}>
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editingPreset ? 'Edit Preset' : t('presets.createNew')}
              </h3>
              <button onClick={() => { setShowModal(false); setEditingPreset(null); }} className="btn-ghost p-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <PresetForm
              initialData={editingPreset}
              onSubmit={editingPreset ? (data) => handleUpdate(editingPreset.id, data) : handleCreate}
              onClose={() => { setShowModal(false); setEditingPreset(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PresetForm({ initialData, onSubmit, onClose }: { 
  initialData: Preset | null; 
  onSubmit: (data: PresetFormData) => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PresetFormData>({
    resolver: zodResolver(presetSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      marketplace: initialData.marketplace,
      inputs: initialData.inputs,
      isDefault: initialData.isDefault,
    } : {
      name: '',
      marketplace: 'tokopedia',
      inputs: {},
      isDefault: false,
    },
  });

  const asyncHandleSubmit = async (data: PresetFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(asyncHandleSubmit)} className="p-5 space-y-5">
      <div className="form-group">
        <label htmlFor="presetName" className="label">{t('presets.name')}</label>
        <input
          {...register('name')}
          id="presetName"
          type="text"
          className={clsx('input', errors.name && 'input-error')}
          placeholder="Contoh: Tokopedia Elektronik Standard"
        />
        {errors.name && <p className="form-error">{errors.name.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="presetMarketplace" className="label">{t('calculator.inputs.marketplace')}</label>
        <select
          {...register('marketplace')}
          id="presetMarketplace"
          className={clsx('input', errors.marketplace && 'input-error')}
        >
          <option value="tokopedia">Tokopedia</option>
          <option value="shopee">Shopee</option>
          <option value="lazada">Lazada</option>
          <option value="tiktok">TikTok Shop</option>
        </select>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            {...register('isDefault')}
            type="checkbox"
            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">{t('presets.setAsDefault')}</span>
        </label>
        <p className="form-hint mt-1">Hanya satu preset default per marketplace</p>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <label className="label mb-3">{t('calculator.inputs.category')} & Parameter Lainnya</label>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg text-sm text-slate-600 dark:text-slate-400">
          <p>Preset akan menyimpan semua parameter dari form kalkulator saat ini.</p>
          <p className="mt-1">Silakan buka halaman <a href="/calculator" className="text-primary-600 hover:underline">{t('nav.calculator')}</a>, atur parameter yang diinginkan, lalu kembali ke sini untuk menyimpan sebagai preset.</p>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>
          {isSubmitting ? t('common.loading') : (initialData ? t('common.save') : t('presets.createNew'))}
        </button>
      </div>
    </form>
  );
}

import { useState } from 'react';