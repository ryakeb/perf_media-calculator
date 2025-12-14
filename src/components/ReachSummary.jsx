import React, { useMemo } from 'react';
import { formatInt, formatPct } from '../utils/format.js';
import { useLocale } from '../i18n.jsx';

const CARD_STYLES = 'bg-white rounded-2xl shadow p-4 border border-slate-100 dark:border-slate-700 dark:bg-slate-800';

export default function ReachSummary({ metrics, campaignDays, pacingMode }) {
  const { t } = useLocale();
  const pacingLabel = useMemo(() => {
    const key = `pacingModes.${pacingMode}`;
    const translated = t(key);
    return translated === key ? pacingMode : translated;
  }, [pacingMode, t]);

  return (
    <section className="mt-4 grid md:grid-cols-3 gap-4">
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500 dark:text-slate-300">{t('reachSummary.reachTitle')}</div>
        <div className="text-2xl font-semibold mt-1 dark:text-white">{formatInt(metrics.reach)}</div>
        <div className="text-xs text-slate-500 mt-1 dark:text-slate-400">{t('reachSummary.reachPct', { value: formatPct(metrics.reachPct) })}</div>
      </div>
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500 dark:text-slate-300">{t('reachSummary.frequencyTitle')}</div>
        <div className="text-2xl font-semibold mt-1 dark:text-white">{metrics.avgFreqAmongReached.toFixed(2)}</div>
        <div className="text-xs text-slate-500 mt-1 dark:text-slate-400">{t('reachSummary.frequencyGrps', { grps: metrics.grps.toFixed(1) })}</div>
      </div>
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500 dark:text-slate-300">{t('reachSummary.daysTitle')}</div>
        <div className="text-2xl font-semibold mt-1 dark:text-white">{campaignDays || 0}</div>
        <div className="text-xs text-slate-500 mt-1 dark:text-slate-400">{t('reachSummary.pacingMode', { mode: pacingLabel })}</div>
      </div>
    </section>
  );
}
