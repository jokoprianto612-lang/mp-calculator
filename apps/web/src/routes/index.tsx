import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { CalculatorIcon, ArrowRightIcon, CheckCircleIcon, GlobeAltIcon, SparklesIcon, BoltIcon, ChartBarIcon, UserIcon } from '@heroicons/react/24/outline';
import { OkongzINCLogo } from '../components/brand/OkongzINCLogo';

export const indexRoute = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: CalculatorIcon,
      title: t('home.features.calculator.title'),
      description: t('home.features.calculator.description'),
    },
    {
      icon: BoltIcon,
      title: t('home.features.dualMode.title'),
      description: t('home.features.dualMode.description'),
    },
    {
      icon: GlobeAltIcon,
      title: t('home.features.translation.title'),
      description: t('home.features.translation.description'),
    },
    {
      icon: ChartBarIcon,
      title: t('home.features.breakdown.title'),
      description: t('home.features.breakdown.description'),
    },
    {
      icon: SparklesIcon,
      title: t('home.features.presets.title'),
      description: t('home.features.presets.description'),
    },
    {
      icon: CheckCircleIcon,
      title: t('home.features.history.title'),
      description: t('home.features.history.description'),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e0a] text-slate-100">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="container-main">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-sm font-medium mb-8 animate-in slide-in-from-bottom-4 duration-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              {t('home.versionBadge')}
            </div>

            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-3 text-3xl font-bold text-primary-500 hover:text-primary-400 transition-colors mb-8">
              <OkongzINCLogo size={56} />
              <span>{t('app.name')}</span>
            </Link>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 animate-in slide-in-from-bottom-4 duration-500 delay-100">
              {t('home.ctaTitle')}
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto mb-12 animate-in slide-in-from-bottom-4 duration-500 delay-200">
              {t('home.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-4 duration-500 delay-300">
              <Link to="/calculator" className="btn-primary btn-lg px-8 py-3.5 text-base font-semibold">
                <CalculatorIcon className="h-5 w-5 mr-2" />
                {t('nav.calculator')}
              </Link>
              <Link to="/translation" className="btn-outline btn-lg px-8 py-3.5 text-base font-semibold">
                <GlobeAltIcon className="h-5 w-5 mr-2" />
                {t('nav.translation') || 'Translator'}
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-slate-500 text-sm animate-in fade-in duration-700 delay-500">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-primary-500" />
                <span>4 Marketplace</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-primary-500" />
                <span>Real-time Calc</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-primary-500" />
                <span>5 Languages</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-primary-500" />
                <span>Free Forever</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-[#121812]/50 border-y border-primary-900/30">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t('home.features')}
            </h2>
            <p className="text-slate-400 text-lg">
              Semua fitur yang Anda butuhkan untuk mengoptimalkan profit penjualan online
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="relative overflow-hidden rounded-2xl border border-primary-900/30 bg-[#121812]/60 backdrop-blur-sm p-6 hover:border-primary-500/40 hover:bg-primary-500/5 transition-all duration-300 animate-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary-500/10 text-primary-500 mb-4">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))
          }
        </div>
      </div>

      {/* Calculator Preview */}
      <section className="py-20 lg:py-28">
        <div className="container-main">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t('home.calculatorPreview')}
            </h2>
            <p className="text-slate-400 text-lg">{t('home.calculatorPreviewDesc')}</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-primary-900/30 bg-[#121812]/60 backdrop-blur-sm p-8">
            <div className="grid gap-8 lg:grid-cols-2 items-start">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white mb-4">
                  {t('home.detailedBreakdown')}
                </h3>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-center gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-primary-500 flex-shrink-0" />
                    <span>Platform commission & service fee</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-primary-500 flex-shrink-0" />
                    <span>Biaya transaksi & order processing</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-primary-500 flex-shrink-0" />
                    <span>Biaya logistik (ongkir) per kg/km</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-primary-500 flex-shrink-0" />
                    <span>Program gratis ongkir & promo platform</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-primary-500 flex-shrink-0" />
                    <span>AMS (Advertising) & biaya iklan</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-primary-500 flex-shrink-0" />
                    <span>Pajak & biaya packing</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-primary-500/10 to-primary-900/20 rounded-xl border border-primary-500/20 flex items-center justify-center">
                  <CalculatorIcon className="h-24 w-24 text-primary-500/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-primary-500/10 via-transparent to-transparent border-y border-primary-900/30">
        <div className="container-main">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              {t('home.ctaTitle')}
            </h2>
            <p className="text-slate-300 text-lg mb-10">
              Mulai hitung keuntungan toko online Anda sekarang. Gratis, cepat, dan akurat.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/calculator" className="btn-primary btn-lg px-10 py-4 text-lg font-semibold">
                <CalculatorIcon className="h-6 w-6 mr-2" />
                Mulai Hitung Sekarang
              </Link>
              <Link to="/auth/register" className="btn-outline btn-lg px-10 py-4 text-lg font-semibold">
                <UserIcon className="h-6 w-6 mr-2" />
                Buat Akun Gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-primary-900/30">
        <div className="container-main">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-500">
              <OkongzINCLogo size={32} />
              <span>{t('app.name')}</span>
            </Link>
            <p className="text-slate-500 text-sm">
              {t('footer.copyright')}
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link to="/privacy" className="hover:text-primary-400 transition-colors">{t('footer.privacy')}</Link>
              <Link to="/terms" className="hover:text-primary-400 transition-colors">{t('footer.terms')}</Link>
              <Link to="/contact" className="hover:text-primary-400 transition-colors">{t('footer.contact')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}