import React from 'react';
import { formatInt, formatCurrency } from '../utils/format.js';
import { useLocale } from '../i18n.jsx';

const CARD_STYLES = 'bg-white rounded-2xl shadow p-4 border border-slate-100 dark:border-slate-700 dark:bg-slate-800';

export default function SummaryCards({ metrics, currency, budget }) {
  const { t } = useLocale();
  return (
    <section className="mt-6 grid md:grid-cols-4 gap-4">
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500 dark:text-slate-300">{t('summary.cards.impressions.title')}</div>
        <div className="text-2xl font-semibold mt-1 dark:text-white">{formatInt(metrics.impressions)}</div>
        <div className="text-xs text-slate-500 mt-1 dark:text-slate-400">{t('summary.cards.impressions.subtitle', { value: formatCurrency(budget, currency) })}</div>
      </div>
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500 dark:text-slate-300">{t('summary.cards.clicks.title')}</div>
        <div className="text-2xl font-semibold mt-1 dark:text-white">{formatInt(metrics.clicks)}</div>
        <div className="text-xs text-slate-500 mt-1 dark:text-slate-400">{t('summary.cards.clicks.subtitle', { value: formatCurrency(metrics.eCPC, currency) })}</div>
      </div>
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500 dark:text-slate-300">{t('summary.cards.completeViews.title')}</div>
        <div className="text-2xl font-semibold mt-1 dark:text-white">{formatInt(metrics.completeViews)}</div>
        <div className="text-xs text-slate-500 mt-1 dark:text-slate-400">{t('summary.cards.completeViews.subtitle', { value: formatCurrency(metrics.eCPCV, currency, 4) })}</div>
      </div>
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500 dark:text-slate-300">{t('summary.cards.viewable.title')}</div>
        <div className="text-2xl font-semibold mt-1 dark:text-white">{formatInt(metrics.viewableImpr)}</div>
        <div className="text-xs text-slate-500 mt-1 dark:text-slate-400">{t('summary.cards.viewable.subtitle', { value: formatCurrency(metrics.vCPM, currency) })}</div>
      </div>
    </section>
  );
}
