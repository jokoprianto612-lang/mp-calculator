import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { EnvelopeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export const Route = createFileRoute('/contact')({
  component: ContactPage,
});

function ContactPage() {
  const { t } = useTranslation();
  return (
    <div className="container-main py-12 max-w-2xl">
      <h1 className="page-title mb-6">{t('footer.contact', 'Kontak')}</h1>
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <EnvelopeIcon className="h-5 w-5 text-primary-500" />
          <span className="text-slate-300">support@okongzinc.app</span>
       </div>
        <div className="flex items-center gap-3">
          <GlobeAltIcon className="h-5 w-5 text-primary-500" />
          <span className="text-slate-300">okongzinc.app</span>
       </div>
     </div>
   </div>
  );
}
