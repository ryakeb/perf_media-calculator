import React from 'react';
import { useLocale } from '../i18n.jsx';

export default function LanguageToggle({ className = '' }) {
  const { language, setLanguage, t } = useLocale();
  const label = language === 'fr' ? t('app.switchToEnglish') : t('app.switchToFrench');

  const handleClick = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`px-3 py-1 text-sm rounded-lg border shadow hover:bg-slate-100 transition dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 ${className}`}
    >
      {label}
    </button>
  );
}
