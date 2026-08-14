import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full card p-8 text-center">
        <EnvelopeIcon className="h-12 w-12 mx-auto text-primary-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-100 mb-3">{t('auth.forgotPassword', 'Lupa Password')}</h1>
        <p className="text-slate-400 mb-6">{t('auth.forgotPasswordDesc', 'Fitur reset password — segera hadir. Sementara itu, hubungi support.')}</p>
        <Link to="/auth/login" className="btn-primary">{t('auth.backToLogin', 'Kembali ke Login')}</Link>
     </div>
   </div>
  );
}