import React from 'react';
import { formatInt, formatCurrency } from '../utils/format.js';
import { useLocale } from '../i18n.jsx';

const CARD_STYLES = 'bg-white rounded-2xl shadow p-4';

export default function SummaryCards({ metrics, currency, budget }) {
  const { t } = useLocale();
  return (
    <section className="mt-6 grid md:grid-cols-4 gap-4">
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500">{t('summary.cards.impressions.title')}</div>
        <div className="text-2xl font-semibold mt-1">{formatInt(metrics.impressions)}</div>
        <div className="text-xs text-slate-500 mt-1">{t('summary.cards.impressions.subtitle', { value: formatCurrency(budget, currency) })}</div>
      </div>
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500">{t('summary.cards.clicks.title')}</div>
        <div className="text-2xl font-semibold mt-1">{formatInt(metrics.clicks)}</div>
        <div className="text-xs text-slate-500 mt-1">{t('summary.cards.clicks.subtitle', { value: formatCurrency(metrics.eCPC, currency) })}</div>
      </div>
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500">{t('summary.cards.completeViews.title')}</div>
        <div className="text-2xl font-semibold mt-1">{formatInt(metrics.completeViews)}</div>
        <div className="text-xs text-slate-500 mt-1">{t('summary.cards.completeViews.subtitle', { value: formatCurrency(metrics.eCPCV, currency, 4) })}</div>
      </div>
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500">{t('summary.cards.viewable.title')}</div>
        <div className="text-2xl font-semibold mt-1">{formatInt(metrics.viewableImpr)}</div>
        <div className="text-xs text-slate-500 mt-1">{t('summary.cards.viewable.subtitle', { value: formatCurrency(metrics.vCPM, currency) })}</div>
      </div>
    </section>
  );
}
