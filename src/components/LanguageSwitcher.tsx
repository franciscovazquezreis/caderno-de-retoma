import { useTranslation } from 'react-i18next';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const settings = useLiveQuery(() => db.settings.get('default'));

  const currentLang = settings?.language || i18n.language || 'pt-PT';

  const toggleLanguage = async () => {
    const newLang = currentLang === 'pt-PT' ? 'en-US' : 'pt-PT';
    i18n.changeLanguage(newLang);
    if (settings) {
      await db.settings.update('default', { language: newLang });
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
    >
      <span className={currentLang === 'pt-PT' ? 'font-bold text-zinc-900 dark:text-zinc-50' : ''}>PT</span>
      <span className="mx-1">|</span>
      <span className={currentLang === 'en-US' ? 'font-bold text-zinc-900 dark:text-zinc-50' : ''}>EN</span>
    </button>
  );
}
