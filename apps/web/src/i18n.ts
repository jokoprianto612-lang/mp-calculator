import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

import idTranslation from './locales/id.json';
import enTranslation from './locales/en.json';
import zhTranslation from './locales/zh.json';
import jaTranslation from './locales/ja.json';
import koTranslation from './locales/ko.json';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      id: { translation: idTranslation },
      en: { translation: enTranslation },
      zh: { translation: zhTranslation },
      ja: { translation: jaTranslation },
      ko: { translation: koTranslation },
    },
    fallbackLng: 'id',
    supportedLngs: ['id', 'en', 'zh', 'ja', 'ko'],
    defaultNS: 'translation',
    ns: ['translation'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;