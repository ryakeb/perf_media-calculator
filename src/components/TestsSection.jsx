import React from 'react';
import { useLocale } from '../i18n.jsx';

export default function TestsSection({ showChecks, onToggle, results }) {
  const { t } = useLocale();
  return (
    <section className="mt-6 bg-white rounded-2xl shadow p-4 border border-slate-100 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold dark:text-white">{t('tests.title')}</h3>
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={showChecks}
            onChange={(event) => onToggle(event.target.checked)}
          />
          {t('tests.show')}
        </label>
      </div>
      {showChecks && (
        <ul className="mt-3 list-disc pl-6 text-sm">
          {results.map((result) => (
            <li key={result.name} className={result.ok ? 'text-emerald-600' : 'text-rose-600'}>
              {result.ok ? t('tests.ok') : t('tests.ko')} — {t(result.name)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
