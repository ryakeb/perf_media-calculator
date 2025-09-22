import React, { useMemo } from 'react';
import { formatInt, formatPct } from '../utils/format.js';
import { useLocale } from '../i18n.jsx';

const CARD_STYLES = 'bg-white rounded-2xl shadow p-4';

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
        <div className="text-sm text-slate-500">{t('reachSummary.reachTitle')}</div>
        <div className="text-2xl font-semibold mt-1">{formatInt(metrics.reach)}</div>
        <div className="text-xs text-slate-500 mt-1">{t('reachSummary.reachPct', { value: formatPct(metrics.reachPct) })}</div>
      </div>
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500">{t('reachSummary.frequencyTitle')}</div>
        <div className="text-2xl font-semibold mt-1">{metrics.avgFreqAmongReached.toFixed(2)}</div>
        <div className="text-xs text-slate-500 mt-1">{t('reachSummary.frequencyGrps', { grps: metrics.grps.toFixed(1) })}</div>
      </div>
      <div className={CARD_STYLES}>
        <div className="text-sm text-slate-500">{t('reachSummary.daysTitle')}</div>
        <div className="text-2xl font-semibold mt-1">{campaignDays || 0}</div>
        <div className="text-xs text-slate-500 mt-1">{t('reachSummary.pacingMode', { mode: pacingLabel })}</div>
      </div>
    </section>
  );
}
