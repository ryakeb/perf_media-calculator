import React from 'react';
import { formatInt, formatPct } from '../utils/format.js';

const CARD_STYLES = 'bg-white rounded-2xl shadow p-4';

export default function ReachSummary({ metrics, campaignDays, pacingMode }) {
  return (
    <section className="mt-4 grid md:grid-cols-3 gap-4">
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500">Reach cumulé estimé</div>
        <div className="text-2xl font-semibold mt-1">{formatInt(metrics.reach)}</div>
        <div className="text-xs text-slate-500 mt-1">{formatPct(metrics.reachPct)}</div>
      </div>
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500">Fréquence moyenne observée</div>
        <div className="text-2xl font-semibold mt-1">{metrics.avgFreqAmongReached.toFixed(2)}</div>
        <div className="text-xs text-slate-500 mt-1">GRPs estimés, {metrics.grps.toFixed(1)}</div>
      </div>
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500">Jours de campagne</div>
        <div className="text-2xl font-semibold mt-1">{campaignDays || 0}</div>
        <div className="text-xs text-slate-500 mt-1">pacing, {pacingMode}</div>
      </div>
    </section>
  );
}

