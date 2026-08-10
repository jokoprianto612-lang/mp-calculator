import { createRootRoute, Outlet, Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { Bars3Icon, XMarkIcon, CalculatorIcon, Cog6ToothIcon, UserCircleIcon, ArrowRightOnRectangleIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { OkongzINCLogo } from '../components/brand/OkongzINCLogo';
import { clsx } from 'clsx';
import React from 'react';
import { AnimatedBackground } from '../components/common/AnimatedBackground';

export const rootRoute = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/' });
    setUserMenuOpen(false);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLangMenuOpen(false);
  };

  const languages = [
    { code: 'id', name: 'Bahasa Indonesia', nativeName: 'Bahasa Indonesia' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0e0a] text-slate-100 overflow-x-hidden">
      {/* Animated background - green network pattern */}
      <AnimatedBackground />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e0a]/80 backdrop-blur-md border-b border-primary-900/30">
        <div className="container-main">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-500 hover:text-primary-400 transition-colors">
              <OkongzINCLogo size={40} />
              <span>{t('app.name')}</span>
          </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:gap-6">
              {isAuthenticated ? (
                <>
                  <Link to="/calculator" className="text-sm font-medium text-slate-300 hover:text-primary-400 transition-colors">
                    {t('nav.calculator')}
                 </Link>
                  <Link to="/history" className="text-sm font-medium text-slate-300 hover:text-primary-400 transition-colors">
                    {t('nav.history')}
                 </Link>
                  <Link to="/presets" className="text-sm font-medium text-slate-300 hover:text-primary-400 transition-colors">
                    {t('nav.presets')}
                 </Link>
                  <Link to="/settings" className="text-sm font-medium text-slate-300 hover:text-primary-400 transition-colors">
                    {t('nav.settings')}
                 </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-primary-400 transition-colors">
                    {t('nav.login')}
                 </Link>
                  <Link to="/register" className="btn-primary btn-sm">
                    {t('nav.register')}
                 </Link>
                </>
              )}

              {/* Language Selector */}
              <div className="relative">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-primary-400 transition-colors rounded-lg hover:bg-primary-900/20"
                  onClick={() => { setLangMenuOpen(!langMenuOpen); setUserMenuOpen(false); }}
                >
                  <GlobeAltIcon className="h-5 w-5" />
                  <span>{languages.find(l => l.code === i18n.language)?.nativeName || i18n.language}</span>
               </button>
                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-[#121812] rounded-lg shadow-xl border border-primary-900/40 py-1 z-50 animate-in">
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={clsx(
                          'w-full px-4 py-2 text-left text-sm transition-colors',
                          i18n.language === lang.code
                            ? 'bg-primary-500/20 text-primary-300'
                            : 'text-slate-300 hover:bg-primary-900/20'
                        )}
                      >
                        {lang.nativeName}
                     </button>
                    ))}
                 </div>
                )}
             </div>

              {/* User Menu */}
              {isAuthenticated && (
                <div className="relative">
                  <button
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-primary-900/20 transition-colors"
                    onClick={() => { setUserMenuOpen(!userMenuOpen); setLangMenuOpen(false); }}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                      <UserCircleIcon className="h-5 w-5 text-primary-400" />
                   </div>
                    <span className="text-sm font-medium text-slate-200 hidden sm:block">
                      {user?.name || user?.email}
                   </span>
                 </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#121812] rounded-lg shadow-xl border border-primary-900/40 py-1 z-50 animate-in">
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-primary-900/20"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="h-5 w-5" />
                        {t('nav.settings')}
                     </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-primary-900/20"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <UserCircleIcon className="h-5 w-5" />
                        {t('nav.profile')}
                     </Link>
                      <hr className="my-1 border-primary-900/30" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/20"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        {t('nav.logout')}
                     </button>
                   </div>
                  )}
               </div>
              )}
           </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                className="p-2 rounded-lg text-slate-300 hover:bg-primary-900/20 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
             </button>
           </div>
         </div>
       </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a0e0a]/95 border-t border-primary-900/30 py-4 animate-in">
            <div className="container-main space-y-2">
              {isAuthenticated ? (
                <>
                  <Link to="/calculator" className="block px-4 py-2 text-slate-300 hover:bg-primary-900/20 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.calculator')}
                 </Link>
                  <Link to="/history" className="block px-4 py-2 text-slate-300 hover:bg-primary-900/20 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.history')}
                 </Link>
                  <Link to="/presets" className="block px-4 py-2 text-slate-300 hover:bg-primary-900/20 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.presets')}
                 </Link>
                  <Link to="/settings" className="block px-4 py-2 text-slate-300 hover:bg-primary-900/20 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.settings')}
                 </Link>
                  <hr className="my-2 border-primary-900/30" />
                  <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-900/20 rounded-lg">
                    {t('nav.logout')}
                 </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-4 py-2 text-slate-300 hover:bg-primary-900/20 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.login')}
                 </Link>
                  <Link to="/register" className="block px-4 py-2 text-center btn-primary mx-4 mt-2" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.register')}
                 </Link>
                </>
              )}
           </div>
         </div>
        )}
     </nav>

      {/* Main Content */}
      <main className="relative pt-16 min-h-screen z-10">
        <Outlet />
     </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-primary-900/30 bg-[#0a0e0a]/80 backdrop-blur-md">
        <div className="container-main py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400 text-center md:text-left">
              &copy; {new Date().getFullYear()} {t('app.name')}. {t('footer.copyright')}
           </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">
                {t('footer.privacy')}
             </a>
              <a href="#" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">
                {t('footer.terms')}
             </a>
              <a href="#" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">
                {t('footer.contact')}
             </a>
           </div>
         </div>
       </div>
     </footer>
   </div>
  );
}
