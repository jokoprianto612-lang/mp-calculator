import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { UserIcon } from '@heroicons/react/24/outline';

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useTranslation();
  return (
    <div className="container-main py-12">
      <div className="max-w-2xl mx-auto text-center">
        <UserIcon className="h-16 w-16 mx-auto text-primary-500 mb-4" />
        <h1 className="page-title mb-4">{t('profile.title', 'Profil')}</h1>
        <p className="page-subtitle mb-8">{t('profile.subtitle', 'Halaman profil — segera hadir.')}</p>
        <Link to="/" className="btn-primary">{t('common.back', 'Kembali')}</Link>
     </div>
   </div>
  );
}