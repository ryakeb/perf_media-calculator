import React from 'react';
import { useLocale } from '../i18n.jsx';

export default function ExportCard({ onExport, disabled }) {
  const { t } = useLocale();
  return (
    <div className="bg-white rounded-2xl shadow p-4 border border-slate-100 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="text-lg font-semibold dark:text-white">{t('export.title')}</h3>
      <p className="text-sm text-slate-600 mt-1 dark:text-slate-300">{t('export.description')}</p>
      <button
        type="button"
        onClick={onExport}
        disabled={disabled}
        className="mt-3 px-4 py-2 rounded-xl shadow border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-700"
      >
        {t('export.button')}
      </button>
    </div>
  );
}
