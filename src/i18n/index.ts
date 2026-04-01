import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptPT from '../locales/pt-PT.json';
import enUS from '../locales/en-US.json';

const resources = {
  'pt-PT': {
    translation: ptPT
  },
  'en-US': {
    translation: enUS
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt-PT', // default language, will be overridden by settings
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
