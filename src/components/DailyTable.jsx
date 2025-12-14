import React, { useState } from 'react';
import { formatInt, formatCurrency } from '../utils/format.js';
import { useLocale } from '../i18n.jsx';

export default function DailyTable({ dailyRows, currency }) {
  const { t } = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <section className="mt-6 bg-white rounded-2xl shadow border border-slate-100 dark:border-slate-700 dark:bg-slate-800">
      <div className="p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold dark:text-white">{t('dailyTable.title')}</h3>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-500 dark:text-slate-300">{t('dailyTable.rowsCount', { count: dailyRows.length })}</div>
          <button
            type="button"
            onClick={handleToggle}
            aria-expanded={isExpanded}
            className="px-3 py-1 text-sm rounded-lg border shadow hover:bg-slate-100 transition dark:border-slate-600 dark:bg-slate-900 dark:hover:bg-slate-700"
          >
            {isExpanded ? t('dailyTable.hideDetails') : t('dailyTable.showDetails')}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="overflow-auto">
          <table className="w-full text-sm text-slate-900 dark:text-slate-100">
            <thead className="bg-slate-100 dark:bg-slate-700/80">
              <tr>
                <th className="text-left p-2 font-semibold">{t('dailyTable.headers.date')}</th>
                <th className="text-right p-2 font-semibold">{t('dailyTable.headers.budget', { currency })}</th>
                <th className="text-right p-2 font-semibold">{t('dailyTable.headers.impressions')}</th>
                <th className="text-right p-2 font-semibold">{t('dailyTable.headers.incrReach')}</th>
                <th className="text-right p-2 font-semibold">{t('dailyTable.headers.cumReach')}</th>
              </tr>
            </thead>
            <tbody>
              {dailyRows.map((row) => (
                <tr key={row.date} className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-800 dark:even:bg-slate-900/60">
                  <td className="p-2 whitespace-nowrap">{row.date}</td>
                  <td className="p-2 text-right">{formatCurrency(row.budget, currency)}</td>
                  <td className="p-2 text-right">{formatInt(row.impressions)}</td>
                  <td className="p-2 text-right">{formatInt(row.incrReach)}</td>
                  <td className="p-2 text-right">{formatInt(row.cumReach)}</td>
                </tr>
              ))}
              {!dailyRows.length && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500 dark:text-slate-300">
                    {t('dailyTable.empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
