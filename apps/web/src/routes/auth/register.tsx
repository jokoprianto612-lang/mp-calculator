import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../stores/authStore';
import { CalculatorIcon, EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, UserIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';
import React from 'react';

const registerSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(100),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter').max(128),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export const registerRoute = createFileRoute('/auth/register')({
  component: RegisterPage,
});

export function RegisterPage() {
  const { t } = useTranslation();
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Akun berhasil dibuat!');
      navigate({ to: '/calculator' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mendaftar');
    }
  };

  const passwordRequirements = [
    { label: 'Minimal 8 karakter', met: password.length >= 8 },
    { label: 'Huruf besar', met: /[A-Z]/.test(password) },
    { label: 'Huruf kecil', met: /[a-z]/.test(password) },
    { label: 'Angka', met: /[0-9]/.test(password) },
    { label: 'Karakter khusus', met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary-600 dark:text-primary-400 mb-6">
            <CalculatorIcon className="h-10 w-10" />
            <span>MP Calculator</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {t('auth.register')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t('auth.noAccount')} <Link to="/login" className="text-primary-600 hover:underline font-medium">{t('auth.signIn')}</Link>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
          <div className="form-group">
            <label htmlFor="name" className="label">
              <UserIcon className="h-5 w-5 inline-block mr-1" />
              {t('auth.name')}
            </label>
            <input
              {...register('name')}
              id="name"
              type="text"
              autoComplete="name"
              className={clsx('input', errors.name && 'input-error')}
              placeholder="Nama Lengkap"
              disabled={isLoading}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="label">
              <EnvelopeIcon className="h-5 w-5 inline-block mr-1" />
              {t('auth.email')}
            </label>
            <input
              {...register('email')}
              id="email"
              type="email"
              autoComplete="email"
              className={clsx('input', errors.email && 'input-error')}
              placeholder="anda@email.com"
              disabled={isLoading}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="label">
              <LockClosedIcon className="h-5 w-5 inline-block mr-1" />
              {t('auth.password')}
            </label>
            <div className="relative">
              <input
                {...register('password')}
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={clsx('input pr-12', errors.password && 'input-error')}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
           
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-3 space-y-2">
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'h-full transition-all duration-300',
                      password.length < 8 ? 'w-1/5 bg-danger-500' :
                      password.length < 12 ? 'w-2/5 bg-amber-500' :
                      password.length < 16 ? 'w-3/5 bg-amber-500' :
                      'w-full bg-success-500'
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className={clsx('flex items-center gap-1.5', req.met ? 'text-success-600' : 'text-slate-400')}>
                      <CheckCircleIcon className={clsx('h-3.5 w-3.5 flex-shrink-0', req.met ? 'text-success-500' : 'text-slate-300')} />
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="label">
              <LockClosedIcon className="h-5 w-5 inline-block mr-1" />
              {t('auth.confirmPassword')}
            </label>
            <input
              {...register('confirmPassword')}
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={clsx('input', errors.confirmPassword && 'input-error')}
              placeholder="••••••••"
              disabled={isLoading}
            />
            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('common.loading')}
              </>
            ) : (
              t('auth.signUp')
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">{t('auth.or')}</span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="btn-outline flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>{t('auth.withGoogle')}</span>
          </button>
          <button
            type="button"
            className="btn-outline flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            <span>{t('auth.withGitHub')}</span>
          </button>
        </div>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Dengan mendaftar, Anda menyetujui <a href="#" className="text-primary-600 hover:underline">Syarat & Ketentuan</a> dan <a href="#" className="text-primary-600 hover:underline">Kebijakan Privasi</a> kami.
        </p>
      </div>
    </div>
  );
}