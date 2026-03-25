import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enUS from './locales/en-US.json';
import ptPT from './locales/pt-PT.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'en-US': { translation: enUS },
      'pt-PT': { translation: ptPT },
      'en': { translation: enUS },
      'pt': { translation: ptPT }
    },
    // Enforcing strict fallback to english per user requirements
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false 
    }
  });

export { i18n };
