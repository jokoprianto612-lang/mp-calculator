import { createRootRoute, Outlet, Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { Bars3Icon, XMarkIcon, CalculatorIcon, ClockIcon, DocumentDuplicateIcon, Cog6ToothIcon, UserCircleIcon, ArrowRightOnRectangleIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import React from 'react';

export const rootRoute = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/' });
    setUserMenuOpen(false);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const languages = [
    { code: 'id', name: 'Bahasa Indonesia', nativeName: 'Bahasa Indonesia' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="container-main">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-600 dark:text-primary-400">
              <CalculatorIcon className="h-8 w-8" />
              <span>{t('app.name')}</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:gap-6">
              {isAuthenticated ? (
                <>
                  <Link to="/calculator" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                    {t('nav.calculator')}
                  </Link>
                  <Link to="/history" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                    {t('nav.history')}
                  </Link>
                  <Link to="/presets" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                    {t('nav.presets')}
                  </Link>
                  <Link to="/settings" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                    {t('nav.settings')}
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
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
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <GlobeAltIcon className="h-5 w-5" />
                  <span>{languages.find(l => l.code === i18n.language)?.nativeName || i18n.language}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 animate-in">
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={clsx(
                          'w-full px-4 py-2 text-left text-sm transition-colors',
                          i18n.language === lang.code
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
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
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <UserCircleIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">
                      {user?.name || user?.email}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 animate-in">
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="h-5 w-5" />
                        {t('nav.settings')}
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <UserCircleIcon className="h-5 w-5" />
                        {t('nav.profile')}
                      </Link>
                      <hr className="my-1 border-slate-200 dark:border-slate-700" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20"
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
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
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
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-4 animate-in">
            <div className="container-main space-y-2">
              {isAuthenticated ? (
                <>
                  <Link to="/calculator" className="block px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.calculator')}
                  </Link>
                  <Link to="/history" className="block px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.history')}
                  </Link>
                  <Link to="/presets" className="block px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.presets')}
                  </Link>
                  <Link to="/settings" className="block px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.settings')}
                  </Link>
                  <hr className="my-2 border-slate-200 dark:border-slate-700" />
                  <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg">
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
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
      <main className="pt-16 min-h-screen">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="container-main py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center md:text-left">
              © {new Date().getFullYear()} {t('app.name')}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}