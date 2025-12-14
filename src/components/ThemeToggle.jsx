import React from 'react';
import { useTheme } from '../theme.jsx';
import { useLocale } from '../i18n.jsx';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();
  const label = theme === 'dark' ? t('app.switchToLight') : t('app.switchToDark');
  const icon = theme === 'dark' ? '☀️' : '🌙';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      className={`inline-flex h-9 items-center justify-center gap-2 px-3 py-1 text-sm rounded-lg border shadow transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 ${className}`}
    >
      <span aria-hidden>{icon}</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}
