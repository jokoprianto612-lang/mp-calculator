import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/terms')({
  component: TermsPage,
});

function TermsPage() {
  const { t } = useTranslation();
  return (
    <div className="container-main py-12 max-w-3xl">
      <h1 className="page-title mb-6">{t('footer.terms', 'Syarat & Ketentuan')}</h1>
      <div className="card p-6 space-y-4 text-slate-300">
        <p>OkongzINC disediakan secara gratis untuk membantu penjual marketplace menghitung profit dan fee</p>
        <p>Perhitungan berdasarkan tarif publik dari seller center masing-masing marketplace. Tarif aktual dapat berubah sewaktu-waktu — selalu verifikasi di sumber resmi</p>
        <p>Kami tidak bertanggung jawab atas kerugian akibat keputusan bisnis yang diambil berdasarkan kalkulasi ini. Gunakan sebagai alat bantu, bukan pengganti riset</p>
     </div>
   </div>
  );
}