import React from 'react';
import { resolveMessage, useLocale } from '../i18n.jsx';

export default function CustomPacingEditor({
  pacingMode,
  dateLabels,
  customShares,
  updateCustomShareAt,
  resetCustomShares,
  customSharesSum,
  error,
}) {
  const { t } = useLocale();
  if (pacingMode !== 'Custom' || !dateLabels.length) {
    return null;
  }

  const sumFormatted = Number.isFinite(customSharesSum) ? customSharesSum.toFixed(2) : '0.00';
  const errorMessage = resolveMessage(error, t);

  return (
    <section className="mt-4 bg-white rounded-2xl shadow">
      <div className="p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t('customPacing.title')}</h3>
          <p className="text-sm text-slate-600">{t('customPacing.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={resetCustomShares}
          className="px-3 py-1 text-sm rounded-lg border shadow hover:bg-slate-50"
        >
          {t('customPacing.reset')}
        </button>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-2">{t('customPacing.table.date')}</th>
              <th className="text-right p-2">{t('customPacing.table.share')}</th>
            </tr>
          </thead>
          <tbody>
            {dateLabels.map((label, index) => (
              <tr key={label.iso} className="odd:bg-white even:bg-slate-50">
                <td className="p-2 whitespace-nowrap">{label.human}</td>
                <td className="p-2 text-right">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={customShares[index] ?? ''}
                    onChange={(event) => updateCustomShareAt(index, event.target.value)}
                    className="w-28 border rounded-lg p-2 text-right"
                  />
                  <span className="ml-1">%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 flex items-center justify-between border-t text-sm">
        <div>{t('customPacing.total', { value: sumFormatted })}</div>
        {errorMessage && <div className="text-rose-600">{errorMessage}</div>}
      </div>
    </section>
  );
}
