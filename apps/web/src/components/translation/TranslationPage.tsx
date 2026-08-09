'use client';

import { useTranslation } from 'react-i18next';
import { useState, useCallback } from 'react';
import { ArrowsRightLeftIcon, DocumentDuplicateIcon, ClockIcon, XMarkIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const SUPPORTED_LANGUAGES = [
  { code: 'id', name: 'Bahasa Indonesia', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
];

const MAX_CHARS = 5000;

export function TranslationPage() {
  const { t, i18n } = useTranslation();
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [sourceLang, setSourceLang] = useState('id');
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [history, setHistory] = useState<Array<{
    id: string;
    sourceText: string;
    targetText: string;
    sourceLang: string;
    targetLang: string;
    timestamp: Date;
  }>>([]);
  const [showHistory, setShowHistory] = useState(false);

  const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true,
  });

  const translate = useCallback(async () => {
    if (!sourceText.trim()) return;
    if (sourceText.length > MAX_CHARS) {
      toast.error(`Maksimal ${MAX_CHARS.toLocaleString()} karakter`);
      return;
    }

    setIsTranslating(true);
    try {
      const response = await api.post('/translate', {
        text: sourceText,
        targetLang,
        sourceLang: sourceLang === 'auto' ? undefined : sourceLang,
      });

      const translated = response.data.data.translations[0]?.text || '';
      setTargetText(translated);

      // Add to history
      const newEntry = {
        id: Date.now().toString(),
        sourceText,
        targetText: translated,
        sourceLang: response.data.data.translations[0]?.detectedSourceLanguage || sourceLang,
        targetLang,
        timestamp: new Date(),
      };
      setHistory(prev => [newEntry, ...prev.slice(0, 49)]);
      toast.success(t('notifications.translationCopied'));
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || t('common.error'));
    } finally {
      setIsTranslating(false);
    }
  }, [sourceText, sourceLang, targetLang, api, t]);

  const swapLanguages = () => {
    if (sourceLang === 'auto') {
      toast.error('Tidak bisa menukar saat deteksi otomatis');
      return;
    }
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(targetText);
    setTargetText(sourceText);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(t('translation.copied'));
  };

  const clearHistory = () => {
    setHistory([]);
    toast.success('Riwayat dibersihkan');
  };

  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find(l => l.code === code)?.nativeName || code;
  };

  const charCount = sourceText.length;
  const isNearLimit = charCount > MAX_CHARS * 0.8;

  return (
    <div className="container-main py-6 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">{t('translation.title')}</h1>
            <p className="page-subtitle">Terjemahkan teks dengan DeepL API - mendukung 5 bahasa</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Translation Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Source Text */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-3">
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="input w-auto px-3 py-1.5 text-sm"
                >
                  <option value="auto">{t('translation.detectLanguage')}</option>
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.nativeName}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {t('translation.sourceLanguage')}
                </span>
              </div>
              <div className={clsx(
                'text-sm font-mono tabular-nums',
                isNearLimit ? 'text-amber-600' : 'text-slate-500',
                charCount > MAX_CHARS && 'text-danger-600'
              )}>
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} {t('translation.charactersLeft')}
              </div>
            </div>
            <div className="card-body p-0">
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder={t('translation.sourceText')}
                className="w-full h-48 p-4 resize-none border-none focus:outline-none bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400"
                maxLength={MAX_CHARS}
                spellCheck={false}
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={swapLanguages}
                disabled={sourceLang === 'auto' || isTranslating}
                className={clsx(
                  'btn-outline flex items-center gap-2',
                  sourceLang === 'auto' && 'opacity-50 cursor-not-allowed'
                )}
                aria-label="Swap languages"
              >
                <ArrowsRightLeftIcon className="h-5 w-5" />
                <span className="hidden sm:inline">{t('translation.swap')}</span>
              </button>
              
              <button
                onClick={translate}
                disabled={!sourceText.trim() || isTranslating || charCount > MAX_CHARS}
                className="btn-primary flex items-center gap-2"
              >
                <GlobeAltIcon className="h-5 w-5" />
                {isTranslating ? t('common.loading') : t('translation.translate')}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="btn-ghost"
              >
                <ClockIcon className="h-5 w-5" />
                <span className="hidden sm:inline">{t('translation.history')}</span>
                {history.length > 0 && (
                  <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                    {history.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Target Text */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-3">
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="input w-auto px-3 py-1.5 text-sm"
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.nativeName}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {t('translation.targetLanguage')}
                </span>
              </div>
              {targetText && (
                <button
                  onClick={() => copyToClipboard(targetText)}
                  className="btn-ghost btn-sm flex items-center gap-1.5"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                  {t('translation.copy')}
                </button>
              )}
            </div>
            <div className="card-body p-0">
              <textarea
                value={targetText}
                readOnly
                className="w-full h-48 p-4 resize-none border-none focus:outline-none bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400"
                placeholder={t('translation.targetText')}
                spellCheck={false}
              />
            </div>
          </div>

          {/* History Panel */}
          {showHistory && history.length > 0 && (
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">{t('translation.history')}</h3>
                <button
                  onClick={clearHistory}
                  className="btn-ghost btn-sm text-danger-600 hover:text-danger-700"
                >
                  <XMarkIcon className="h-4 w-4" />
                  {t('translation.clearHistory')}
                </button>
              </div>
              <div className="card-body p-0 max-h-64 overflow-y-auto">
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                  {history.map((item) => (
                    <li key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <GlobeAltIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                            <span className="badge badge-neutral">{item.sourceLang.toUpperCase()}</span>
                            <ArrowsRightLeftIcon className="h-3 w-3" />
                            <span className="badge badge-primary">{item.targetLang.toUpperCase()}</span>
                            <span className="ml-auto">{item.timestamp.toLocaleString('id-ID')}</span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{item.sourceText}</p>
                          <p className="text-sm text-primary-700 dark:text-primary-300 truncate mt-1">{item.targetText}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSourceText(item.sourceText);
                            setTargetText(item.targetText);
                            setSourceLang(item.sourceLang);
                            setTargetLang(item.targetLang);
                          }}
                          className="btn-ghost btn-sm p-1.5"
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {showHistory && history.length === 0 && (
            <div className="card p-8 text-center">
              <ClockIcon className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-500 dark:text-slate-400">{t('translation.history')} kosong</p>
            </div>
          )}
        </div>

        {/* Sidebar - Language Info */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 lg:self-start space-y-6">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <GlobeAltIcon className="h-5 w-5 text-primary-500" />
              {t('translation.title')} Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="font-medium text-slate-900 dark:text-white mb-1">DeepL API</p>
                <p className="text-slate-600 dark:text-slate-400">Terjemahan berkualitas tinggi dengan AI neural network</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="font-medium text-slate-900 dark:text-white mb-1">5 Bahasa Didukung</p>
                <p className="text-slate-600 dark:text-slate-400">Indonesia, English, Chinese, Japanese, Korean</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="font-medium text-slate-900 dark:text-white mb-1">Cache 24 Jam</p>
                <p className="text-slate-600 dark:text-slate-400">Hasil terjemahan di-cache untuk performa lebih cepat</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="font-medium text-slate-900 dark:text-white mb-1">Batas Karakter</p>
                <p className="text-slate-600 dark:text-slate-400">Maksimal 5.000 karakter per permintaan</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <GlobeAltIcon className="h-5 w-5 text-primary-500" />
              Bahasa Tersedia
            </h3>
            <div className="space-y-2">
              {SUPPORTED_LANGUAGES.map(lang => (
                <div key={lang.code} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{lang.nativeName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{lang.name}</p>
                  </div>
                  <span className={clsx(
                    'ml-auto px-2 py-0.5 text-xs rounded-full',
                    (sourceLang === lang.code || targetLang === lang.code) 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  )}>
                    {sourceLang === lang.code ? 'Sumber' : targetLang === lang.code ? 'Tujuan' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}