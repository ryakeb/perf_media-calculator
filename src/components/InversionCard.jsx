import React from 'react';
import { formatCurrency } from '../utils/format.js';
import { resolveMessage, useLocale } from '../i18n.jsx';

export default function InversionCard({
  targetImpr,
  onTargetImprChange,
  neededBudget,
  currency,
  costType,
  costValue,
  error,
}) {
  const { t } = useLocale();
  const errorMessage = resolveMessage(error, t);
  const localizedCostType = costType === 'CPC'
    ? t('controls.costTypeOptions.CPC')
    : t('controls.costTypeOptions.CPM');
  const noteValue = formatCurrency(costValue, currency);

  return (
    <div className="bg-white rounded-2xl shadow p-4 border border-slate-100 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="text-lg font-semibold dark:text-white">{t('inversion.title')}</h3>
      <div className="grid grid-cols-2 gap-3 mt-2">
        <label className="text-sm flex flex-col space-y-1">
          <span>{t('inversion.targetLabel')}</span>
          <input
            type="text"
            inputMode="numeric"
            value={targetImpr}
            onChange={(event) => onTargetImprChange(event.target.value)}
            className="w-full border rounded-lg p-2 bg-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            aria-invalid={Boolean(error)}
          />
          {errorMessage && <span className="text-xs text-rose-600 dark:text-rose-300">{errorMessage}</span>}
        </label>
        <div className="flex flex-col justify-end text-sm">
          <div>{t('inversion.budgetLabel')}</div>
          <div className="text-xl font-semibold dark:text-white">{formatCurrency(neededBudget, currency)}</div>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2 dark:text-slate-400">{t('inversion.costNote', { label: localizedCostType, value: noteValue })}</p>
    </div>
  );
}
