import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from 'constants/languages/en.json';
import translationFR from 'constants/languages/fr.json';

const resources = {
  en: {
    translation: translationEN,
  },
  fr: {
    translation: translationFR,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,

    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
