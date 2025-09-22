import React from 'react';
import { useLocale } from '../i18n.jsx';

export default function ExportCard({ onExport, disabled }) {
  const { t } = useLocale();
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="text-lg font-semibold">{t('export.title')}</h3>
      <p className="text-sm text-slate-600 mt-1">{t('export.description')}</p>
      <button
        type="button"
        onClick={onExport}
        disabled={disabled}
        className="mt-3 px-4 py-2 rounded-xl shadow border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('export.button')}
      </button>
    </div>
  );
}
