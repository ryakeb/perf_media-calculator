import React from 'react';
import { formatInt, formatCurrency } from '../utils/format.js';

const CARD_STYLES = 'bg-white rounded-2xl shadow p-4';

export default function SummaryCards({ metrics, currency, budget }) {
  return (
    <section className="mt-6 grid md:grid-cols-4 gap-4">
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500">Impressions estimées</div>
        <div className="text-2xl font-semibold mt-1">{formatInt(metrics.impressions)}</div>
        <div className="text-xs text-slate-500 mt-1">Budget cumulé, {formatCurrency(budget, currency)}</div>
      </div>
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500">Clics estimés</div>
        <div className="text-2xl font-semibold mt-1">{formatInt(metrics.clicks)}</div>
        <div className="text-xs text-slate-500 mt-1">eCPC, {formatCurrency(metrics.eCPC, currency)}</div>
      </div>
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500">Vues complètes</div>
        <div className="text-2xl font-semibold mt-1">{formatInt(metrics.completeViews)}</div>
        <div className="text-xs text-slate-500 mt-1">eCPCV, {formatCurrency(metrics.eCPCV, currency, 4)}</div>
      </div>
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500">Viewable Impr</div>
        <div className="text-2xl font-semibold mt-1">{formatInt(metrics.viewableImpr)}</div>
        <div className="text-xs text-slate-500 mt-1">vCPM, {formatCurrency(metrics.vCPM, currency)}</div>
      </div>
    </section>
  );
}

