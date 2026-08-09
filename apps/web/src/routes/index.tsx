import { Link, createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { useTranslation } from 'react-i18next';
import { CalculatorIcon, ArrowRightIcon, CheckCircleIcon, GlobeAltIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

export const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/',
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
      icon: SparklesIcon,
      title: 'Dual Mode Calculation',
      description: 'Dukungan perhitungan untuk Harga Jual Marketplace (toko) dan Harga Jual Live (live selling) dengan diskon otomatis.',
    },
    {
      icon: GlobeAltIcon,
      title: t('translation.title'),
      description: 'Fitur terjemahan terintegrasi dengan DeepL API untuk mendukung 5 bahasa: Indonesia, English, 中文, 日本語, 한국어.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Akurat & Terpercaya',
      description: 'Fee structure terupdate untuk marketplace Indonesia dengan konfigurasi kategori, program gratis ongkir, promo, dan pajak PPh 22.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-slate-50 dark:from-primary-900/20 dark:to-slate-900 py-20 sm:py-32">
        <div className="container-main">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6 animate-in">
              <SparklesIcon className="h-4 w-4" />
              <span>Versi 1.0 - Siap Produksi</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-6 animate-in">
              {t('app.name')}
              <br />
              <span className="text-primary-600 dark:text-primary-400">{t('app.tagline')}</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto animate-in">
              Kalkulator keuntungan marketplace terlengkap untuk penjual e-commerce Indonesia. 
              Hitung harga jual optimal, lihat rincian biaya transparan, dan terjemahkan konten ke 5 bahasa.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in">
              <Link to="/calculator" className="btn-primary btn-lg group">
                <span>{t('calculator.calculate')}</span>
                <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/register" className="btn-outline btn-lg">
                {t('nav.register')}
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500 dark:text-slate-400 animate-in">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-success-500" />
                <span>4 Marketplace</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-success-500" />
                <span>Real-time Calculation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-success-500" />
                <span>5 Bahasa</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-success-500" />
                <span>Data Aman & Privat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/30 dark:bg-primary-800/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-200/30 dark:bg-primary-800/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28 bg-white dark:bg-slate-900">
        <div className="container-main">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Dirancang khusus untuk kebutuhan penjual e-commerce Indonesia dengan akurasi tinggi dan UX yang intuitif
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card p-6 hover:shadow-card-hover transition-shadow duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Preview */}
      <section className="py-20 sm:py-28 bg-slate-50 dark:bg-slate-800/50">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Pratinjau Kalkulator
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Antarmuka yang bersih, responsif, dan mudah digunakan di desktop maupun mobile
              </p>
            </div>

            {/* Mock Calculator Card */}
            <div className="card overflow-hidden">
              <div className="bg-primary-500 rounded-t-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">{t('calculator.marketplacePrice')}</h3>
                    <p className="text-primary-100 text-sm">Termasuk rincian biaya lengkap</p>
                  </div>
                  <button className="btn-ghost text-primary-100 hover:text-white hover:bg-primary-400/20 btn-sm">
                    {t('calculator.edit')}
                  </button>
                </div>
                <div className="relative">
                  <div className="bg-white/10 border-2 border-dashed border-white/30 rounded-xl p-6 text-center">
                    <p className="text-4xl sm:text-5xl font-bold text-white">Rp250.000</p>
                    <p className="text-primary-100 mt-2">Untung bersih +Rp13.096 (5.2%)</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Live Price Card */}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-slate-900 dark:text-white font-semibold">{t('calculator.livePrice')}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">-24% dari harga toko</p>
                    </div>
                    <button className="btn-outline btn-sm">{t('calculator.edit')}</button>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center">
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">Rp191.000</p>
                    <p className="text-success-600 dark:text-success-400 mt-1">Untung +Rp386 (0.2%)</p>
                  </div>
                </div>

                {/* Fee Breakdown Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="card p-4">
                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{t('calculator.marketplaceDeduction')}</h4>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">25.8%</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Rp64.404 {t('calculator.fromNetSale')}</p>
                  </div>
                  <div className="card p-4">
                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{t('calculator.sellerCost')}</h4>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">69.0%</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Rp172.500 {t('calculator.fromNetSale')}</p>
                  </div>
                </div>

                {/* Accordion Preview */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800/50 rounded-lg transition-colors">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {t('calculator.hideDetails')}
                  </button>
                </div>

                {/* CTA */}
                <div className="text-center pt-4">
                  <Link to="/calculator" className="btn-primary btn-lg inline-flex">
                    <CalculatorIcon className="h-5 w-5" />
                    <span>{t('calculator.title')}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-primary-500 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>
        <div className="container-main text-center relative">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Mulai Hitung Keuntungan Anda Sekarang
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Gratis, tanpa registrasi wajib, dan akurat untuk 4 marketplace besar Indonesia. 
            Coba kalkulator kami dan lihat perbedaan margin Anda.
          </p>
          <Link to="/calculator" className="btn-lg bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 inline-flex items-center gap-2">
            <CalculatorIcon className="h-6 w-6" />
            <span className="font-semibold">{t('calculator.calculate')} Gratis</span>
          </Link>
        </div>
      </section>
    </div>
  );
}