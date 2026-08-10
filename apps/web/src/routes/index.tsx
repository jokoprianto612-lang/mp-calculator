import { Link, createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { useTranslation } from 'react-i18next';
import { CalculatorIcon, ArrowRightIcon, CheckCircleIcon, GlobeAltIcon, SparklesIcon, BoltIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

function HomePage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: CalculatorIcon,
      title: t('calculator.title'),
      description: 'Hitung harga jual, margin keuntungan, dan rincian biaya marketplace secara real-time untuk Tokopedia, Shopee, Lazada, dan TikTok Shop.',
    },
    {
      icon: BoltIcon,
      title: 'Dual Mode Calculation',
      description: 'Dukungan perhitungan untuk Harga Jual Marketplace (toko) dan Harga Jual Live (live selling) dengan diskon otomatis.',
    },
    {
      icon: GlobeAltIcon,
      title: t('translation.title'),
      description: 'Fitur terjemahan terintegrasi dengan DeepL API untuk mendukung 5 bahasa: Indonesia, English, 中文, 日本語, 한국어.',
    },
    {
      icon: ChartBarIcon,
      title: 'Akurat & Terpercaya',
      description: 'Fee structure terupdate untuk marketplace Indonesia dengan konfigurasi kategori, program gratis ongkir, promo, dan pajak PPh 22.',
    },
  ];

  return (
    <div>
      {/* Hero Section - NVIDIA style */}
      <section className="relative py-24 sm:py-32">
        <div className="container-main">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/15 text-primary-300 border border-primary-500/30 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
             </span>
              <span>Versi 1.0 - Production Ready</span>
           </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-slate-100">{t('app.name')}</span>
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
                {t('app.tagline')}
             </span>
           </h1>

            <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Kalkulator keuntungan marketplace terlengkap untuk penjual e-commerce Indonesia.
              Hitung harga jual optimal, lihat rincian biaya transparan, dan terjemahkan konten ke 5 bahasa.
           </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/calculator"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold rounded-lg bg-primary-500 hover:bg-primary-400 text-[#0a0e0a] transition-all duration-150 shadow-[0_0_30px_rgba(118,185,0,0.3)] hover:shadow-[0_0_50px_rgba(118,185,0,0.5)]"
              >
                <CalculatorIcon className="h-5 w-5" />
                <span>{t('calculator.calculate')}</span>
                <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
             </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold rounded-lg bg-transparent border-2 border-primary-500/40 text-primary-300 hover:bg-primary-500/10 hover:border-primary-500 transition-all"
              >
                {t('nav.register')}
             </Link>
           </div>

            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-400">
              {['4 Marketplace', 'Real-time Calculation', '5 Bahasa', 'Data Aman & Privat'].map((label) => (
                <div key={label} className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-primary-500" />
                  <span>{label}</span>
               </div>
              ))}
           </div>
         </div>
       </div>

        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
       </div>
     </section>

      {/* Features Section */}
      <section className="relative py-20 sm:py-28">
        <div className="container-main">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary-500 mb-3">Fitur Unggulan</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
              Built for Indonesian Sellers
           </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Dirancang khusus untuk kebutuhan penjual e-commerce Indonesia dengan akurasi tinggi dan UX yang intuitif
           </p>
         </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl border border-primary-900/30 bg-[#121812]/60 backdrop-blur-sm p-6 hover:border-primary-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(118,185,0,0.1)]"
              >
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-lg bg-primary-500/15 border border-primary-500/30 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary-500/20 transition-all">
                  <feature.icon className="h-6 w-6 text-primary-400" />
               </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
             </div>
            ))}
         </div>
       </div>
     </section>

      {/* Calculator Preview Section */}
      <section className="relative py-20 sm:py-28">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary-500 mb-3">Preview</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">Pratinjau Kalkulator</h2>
              <p className="text-lg text-slate-400">Antarmuka yang bersih, responsif, dan mudah digunakan di desktop maupun mobile</p>
           </div>

            <div className="relative overflow-hidden rounded-xl border border-primary-900/30 bg-[#121812]/60 backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

              <div className="px-5 py-4 border-b border-primary-900/20 flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-semibold uppercase tracking-wider bg-primary-500/20 text-primary-300 border border-primary-500/30 mb-2">
                    Marketplace
                 </span>
                  <h3 className="text-base font-semibold text-slate-100">{t('calculator.marketplacePrice')}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Termasuk rincian biaya lengkap</p>
               </div>
             </div>

              <div className="p-5 space-y-5">
                <div className="text-center py-8 rounded-xl border-2 border-dashed border-primary-500/40 bg-gradient-to-br from-primary-900/30 to-primary-900/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(118,185,0,0.08),_transparent_70%)]" />
                  <p className="relative text-4xl sm:text-5xl font-bold font-mono tracking-tight text-primary-300">Rp250.000</p>
                  <p className="relative text-sm mt-2 text-slate-400">
                    Untung bersih <span className="text-primary-300 font-mono">+Rp13.096</span> (5.2%)
                 </p>
               </div>

                <div className="border-2 border-dashed border-purple-500/40 bg-gradient-to-br from-purple-900/20 to-purple-900/5 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-1.5">
                        Live Selling
                     </span>
                      <h3 className="text-sm font-semibold text-slate-200">{t('calculator.livePrice')}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">-24% dari harga toko</p>
                   </div>
                 </div>
                  <div className="text-center py-3">
                    <p className="text-2xl font-bold font-mono text-purple-300">Rp191.000</p>
                    <p className="text-xs text-primary-400 mt-1 font-mono">Untung +Rp386 (0.2%)</p>
                 </div>
               </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="relative overflow-hidden rounded-xl border border-primary-900/30 bg-[#0a0e0a]/40 p-4">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
                    <h4 className="text-2xs font-semibold uppercase tracking-wider text-primary-400 mb-2">{t('calculator.marketplaceDeduction')}</h4>
                    <p className="text-2xl font-bold text-slate-100">25.8%</p>
                    <p className="text-xs text-slate-400 mt-1">Rp64.404 {t('calculator.fromNetSale')}</p>
                 </div>
                  <div className="relative overflow-hidden rounded-xl border border-primary-900/30 bg-[#0a0e0a]/40 p-4">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
                    <h4 className="text-2xs font-semibold uppercase tracking-wider text-primary-400 mb-2">{t('calculator.sellerCost')}</h4>
                    <p className="text-2xl font-bold text-slate-100">69.0%</p>
                    <p className="text-xs text-slate-400 mt-1">Rp172.500 {t('calculator.fromNetSale')}</p>
                 </div>
               </div>

                <div className="text-center pt-2">
                  <Link
                    to="/calculator"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-primary-500 hover:bg-primary-400 text-[#0a0e0a] transition-all shadow-[0_0_20px_rgba(118,185,0,0.25)]"
                  >
                    <CalculatorIcon className="h-5 w-5" />
                    <span>{t('calculator.title')}</span>
                 </Link>
               </div>
             </div>
           </div>
         </div>
       </div>
     </section>

      {/* Final CTA */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-[#0a0e0a] to-primary-900/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(118,185,0,0.15),_transparent_70%)]" />
        <div className="container-main text-center relative">
          <SparklesIcon className="h-10 w-10 mx-auto text-primary-400 mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">Mulai Hitung Keuntungan Anda Sekarang</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Gratis, tanpa registrasi wajib, dan akurat untuk 4 marketplace besar Indonesia.
            Coba kalkulator kami dan lihat perbedaan margin Anda.
         </p>
          <Link
            to="/calculator"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-lg bg-primary-500 hover:bg-primary-400 text-[#0a0e0a] transition-all shadow-[0_0_40px_rgba(118,185,0,0.4)] hover:shadow-[0_0_60px_rgba(118,185,0,0.6)]"
          >
            <CalculatorIcon className="h-6 w-6" />
            <span>{t('calculator.calculate')} Gratis</span>
         </Link>
       </div>
     </section>
   </div>
  );
}
