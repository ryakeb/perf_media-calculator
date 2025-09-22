import React from 'react';
import { formatInt, formatCurrency } from '../utils/format.js';
import { useLocale } from '../i18n.jsx';

export default function DailyTable({ dailyRows, currency }) {
  const { t } = useLocale();
  return (
    <section className="mt-6 bg-white rounded-2xl shadow">
      <div className="p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('dailyTable.title')}</h3>
        <div className="text-sm text-slate-500">{t('dailyTable.rowsCount', { count: dailyRows.length })}</div>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-2">{t('dailyTable.headers.date')}</th>
              <th className="text-right p-2">{t('dailyTable.headers.budget', { currency })}</th>
              <th className="text-right p-2">{t('dailyTable.headers.impressions')}</th>
              <th className="text-right p-2">{t('dailyTable.headers.incrReach')}</th>
              <th className="text-right p-2">{t('dailyTable.headers.cumReach')}</th>
            </tr>
          </thead>
          <tbody>
            {dailyRows.map((row) => (
              <tr key={row.date} className="odd:bg-white even:bg-slate-50">
                <td className="p-2 whitespace-nowrap">{row.date}</td>
                <td className="p-2 text-right">{formatCurrency(row.budget, currency)}</td>
                <td className="p-2 text-right">{formatInt(row.impressions)}</td>
                <td className="p-2 text-right">{formatInt(row.incrReach)}</td>
                <td className="p-2 text-right">{formatInt(row.cumReach)}</td>
              </tr>
            ))}
            {!dailyRows.length && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  {t('dailyTable.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
