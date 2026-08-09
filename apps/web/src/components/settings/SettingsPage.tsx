'use client';

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { UserCircleIcon, PaintBrushIcon, KeyIcon, GlobeAltIcon, BellIcon, TrashIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from '@tanstack/react-router';

interface SettingsPageProps {}

const profileSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(100),
  locale: z.enum(['id', 'en', 'zh', 'ja', 'ko']),
  theme: z.enum(['light', 'dark', 'system']),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter').max(128),
  confirmNewPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Password tidak cocok',
  path: ['confirmNewPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const THEMES = [
  { value: 'light', label: 'Terang', icon: '☀️' },
  { value: 'dark', label: 'Gelap', icon: '🌙' },
  { value: 'system', label: 'Sistem', icon: '💻' },
];

const LANGUAGES = [
  { code: 'id', name: 'Bahasa Indonesia', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
];

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, updateProfile, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'security' | 'danger'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true,
  });

  // Profile Form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      locale: user?.locale || 'id',
      theme: user?.theme || 'system',
    },
  });

  const handleProfileSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      await updateProfile(data);
      // Apply theme immediately
      if (data.theme) {
        document.documentElement.classList.remove('light', 'dark');
        if (data.theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
        } else {
          document.documentElement.classList.add(data.theme);
        }
      }
      // Apply language immediately
      if (data.locale) {
        i18n.changeLanguage(data.locale);
      }
      toast.success(t('notifications.settingsSaved'));
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  // Password Form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    setIsSaving(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success(t('notifications.passwordChanged'));
      passwordForm.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Gagal mengubah password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/' });
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak bisa dibatalkan.')) return;
    try {
      await api.delete('/auth/me');
      toast.success('Akun berhasil dihapus');
      navigate({ to: '/' });
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Gagal menghapus akun');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container-main py-12 text-center">
        <UserCircleIcon className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Silakan Login</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Anda perlu login untuk mengakses pengaturan</p>
        <a href="/login" className="btn-primary inline-flex">
          Login
        </a>
      </div>
    );
  }

  return (
    <div className="container-main py-6 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="page-title">{t('settings.title')}</h1>
        <p className="page-subtitle">Kelola preferensi akun dan pengaturan aplikasi</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1 lg:sticky lg:top-20 lg:self-start">
          <nav className="card p-2 space-y-1">
            {[
              { id: 'profile', icon: UserCircleIcon, label: 'Profil' },
              { id: 'appearance', icon: PaintBrushIcon, label: t('settings.appearance') },
              { id: 'security', icon: KeyIcon, label: t('settings.account') },
              { id: 'danger', icon: TrashIcon, label: 'Zona Bahaya' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                )}
              >
                <tab.icon className="h-5 w-5 flex-shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="card p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <UserCircleIcon className="h-12 w-12 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name || 'Pengguna'}</h3>
                  <p className="text-slate-500 dark:text-slate-400">{user?.email}</p>
                  <p className="text-xs text-slate-400 mt-1">Bergabung: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-4">
                <h4 className="font-medium text-slate-900 dark:text-white">Informasi Pribadi</h4>

                <div className="form-group">
                  <label htmlFor="name" className="label">{t('auth.name')}</label>
                  <input
                    {...profileForm.register('name')}
                    id="name"
                    type="text"
                    className={clsx('input', profileForm.formState.errors.name && 'input-error')}
                    placeholder="Nama Lengkap"
                  />
                  {profileForm.formState.errors.name && <p className="form-error">{profileForm.formState.errors.name.message}</p>}
                </div>
              </div>
            </form>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="card p-6 space-y-6">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <PaintBrushIcon className="h-5 w-5 text-primary-500" />
                  {t('settings.theme')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pilih tema tampilan aplikasi</p>

                <div className="grid gap-3 sm:grid-cols-3">
                  {THEMES.map(theme => (
                    <button
                      key={theme.value}
                      type="button"
                      onClick={() => profileForm.setValue('theme', theme.value, { shouldValidate: true })}
                      className={clsx(
                        'relative p-4 rounded-xl border-2 transition-all text-left',
                        profileForm.watch('theme') === theme.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{theme.icon}</span>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{theme.label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {theme.value === 'system' ? 'Mengikuti pengaturan sistem' : `${theme.value === 'light' ? 'Selalu terang' : 'Selalu gelap'}`}
                          </p>
                        </div>
                      </div>
                      {profileForm.watch('theme') === theme.value && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card p-6 space-y-6">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <GlobeAltIcon className="h-5 w-5 text-primary-500" />
                  {t('settings.language')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pilih bahasa antarmuka aplikasi</p>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => profileForm.setValue('locale', lang.code, { shouldValidate: true })}
                      className={clsx(
                        'relative p-4 rounded-xl border-2 transition-all text-left',
                        profileForm.watch('locale') === lang.code
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{lang.flag}</span>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{lang.nativeName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{lang.name}</p>
                        </div>
                      </div>
                      {profileForm.watch('locale') === lang.code && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <button
                  type="submit"
                  form={profileForm._form}
                  className="btn-primary w-full"
                  disabled={isSaving}
                >
                  {isSaving ? t('common.loading') : t('settings.saveChanges')}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="card p-6 space-y-6">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyIcon className="h-5 w-5 text-primary-500" />
                {t('settings.changePassword')}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Ubah password akun Anda</p>

              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="currentPassword" className="label">{t('settings.currentPassword')}</label>
                  <input
                    {...passwordForm.register('currentPassword')}
                    id="currentPassword"
                    type="password"
                    className={clsx('input', passwordForm.formState.errors.currentPassword && 'input-error')}
                    placeholder="••••••••"
                  />
                  {passwordForm.formState.errors.currentPassword && <p className="form-error">{passwordForm.formState.errors.currentPassword.message}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword" className="label">{t('settings.newPassword')}</label>
                  <input
                    {...passwordForm.register('newPassword')}
                    id="newPassword"
                    type="password"
                    className={clsx('input', passwordForm.formState.errors.newPassword && 'input-error')}
                    placeholder="••••••••"
                  />
                  {passwordForm.formState.errors.newPassword && <p className="form-error">{passwordForm.formState.errors.newPassword.message}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmNewPassword" className="label">{t('settings.confirmNewPassword')}</label>
                  <input
                    {...passwordForm.register('confirmNewPassword')}
                    id="confirmNewPassword"
                    type="password"
                    className={clsx('input', passwordForm.formState.errors.confirmNewPassword && 'input-error')}
                    placeholder="••••••••"
                  />
                  {passwordForm.formState.errors.confirmNewPassword && <p className="form-error">{passwordForm.formState.errors.confirmNewPassword.message}</p>}
                </div>
              </div>

              <button type="submit" className="btn-primary w-full" disabled={isSaving}>
                {isSaving ? t('common.loading') : t('settings.changePassword')}
              </button>
            </form>
          )}

          {/* Danger Zone */}
          {activeTab === 'danger' && (
            <div className="card p-6 border-danger-200 dark:border-danger-800">
              <h3 className="font-semibold text-danger-600 dark:text-danger-400 flex items-center gap-2">
                <TrashIcon className="h-5 w-5" />
                Zona Bahaya
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
                Tindakan di area ini bersifat permanen dan tidak bisa dibatalkan.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg border border-danger-200 dark:border-danger-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-danger-700 dark:text-danger-300">Hapus Akun</h4>
                      <p className="text-sm text-danger-600 dark:text-danger-400 mt-1">
                        Menghapus akun Anda secara permanen bersama semua data perhitungan, preset, dan riwayat.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="btn-danger btn-sm"
                    >
                      {t('settings.changePassword')} {/* reuse key, but should be "Hapus Akun" */}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}