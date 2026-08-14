import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t } = useTranslation();
  return (
    <div className="container-main py-12 max-w-3xl">
      <h1 className="page-title mb-6">{t('footer.privacy', 'Kebijakan Privasi')}</h1>
      <div className="card p-6 space-y-4 text-slate-300">
        <p>OkongzINC menghormati privasi Anda. Kami hanya menyimpan data yang diperlukan untuk operasional kalkulator dan tidak membagikan data pribadi ke pihak ketiga</p>
        <p>Data tersimpan di perangkat lokal (localStorage) dan akun VPS (jika login). Tidak ada tracking analitik pihak ketiga</p>
        <p>Untuk pertanyaan, hubungi melalui halaman Kontak</p>
     </div>
   </div>
  );
}