import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import LanguageToggle from '../components/LanguageToggle.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { useLocale } from '../i18n.jsx';
import { formatCurrency } from '../utils/format.js';

const STORAGE_KEY = 'campaign-control-center';
const MS_IN_DAY = 24 * 60 * 60 * 1000;

const TYPE_METRICS = {
  'Video/OLV': ['vtr', 'completeViews', 'viewability'],
  Display: ['ctr', 'viewability'],
  CTV: ['completion', 'reach', 'frequency'],
};

const ALL_METRICS = ['vtr', 'completeViews', 'viewability', 'ctr', 'reach', 'frequency', 'completion'];

const DEFAULT_CAMPAIGN = {
  id: null,
  name: '',
  type: 'Video/OLV',
  startDate: '',
  endDate: '',
  totalBudget: '',
  spentBudget: '',
  metrics: {
    vtr: { actual: '', target: '' },
    completeViews: { actual: '', target: '' },
    viewability: { actual: '', target: '' },
    ctr: { actual: '', target: '' },
    reach: { actual: '', target: '' },
    frequency: { actual: '', target: '' },
    completion: { actual: '', target: '' },
  },
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const toNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function daysBetweenInclusive(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.round((end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0)) / MS_IN_DAY);
  return diff >= 0 ? diff + 1 : 0;
}

function getMetricsForType(type) {
  return TYPE_METRICS[type] ?? [];
}

const hasValue = (value) => value !== '' && value !== undefined && value !== null;

function scoreFromRatio(ratio) {
  if (!Number.isFinite(ratio) || ratio <= 0) return 0;
  if (ratio >= 1) {
    return Math.min(110, ratio * 100);
  }
  return Math.max(0, ratio * 100);
}

function computeDerived(campaign) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const totalDays = daysBetweenInclusive(campaign.startDate, campaign.endDate);
  const startMs = campaign.startDate ? new Date(campaign.startDate).setHours(0, 0, 0, 0) : null;
  const elapsedDays = startMs
    ? clamp(Math.round((today - startMs) / MS_IN_DAY) + 1, 0, totalDays || 0)
    : 0;
  const timeProgress = totalDays > 0 ? clamp(elapsedDays / totalDays, 0, 1) : 0;

  const totalBudget = toNumber(campaign.totalBudget);
  const spent = toNumber(campaign.spentBudget);
  const expectedSpend = totalBudget * timeProgress;
  const deltaSpend = spent - expectedSpend;
  const budgetProgress = totalBudget > 0 ? clamp(spent / totalBudget, 0, 5) : 0;
  const deltaPct = expectedSpend > 0 ? deltaSpend / expectedSpend : 0;

  const pacingStatus = deltaPct <= -0.1 ? 'under' : deltaPct >= 0.1 ? 'over' : 'on';
  const pacingScore = expectedSpend === 0 && spent === 0
    ? 100
    : 100 - Math.min(100, Math.abs(deltaPct) * 100);

  const typeMetrics = getMetricsForType(campaign.type);
  const typedKeys = typeMetrics.filter((key) => {
    const metric = campaign.metrics?.[key];
    return metric && (hasValue(metric.actual) || hasValue(metric.target));
  });
  const otherKeys = ALL_METRICS.filter((key) => {
    if (typeMetrics.includes(key)) return false;
    const metric = campaign.metrics?.[key];
    return metric && (hasValue(metric.actual) || hasValue(metric.target));
  });
  const metricsKeys = [...typedKeys, ...otherKeys];
  const metricSummaries = metricsKeys.map((key) => {
    const actual = toNumber(campaign.metrics?.[key]?.actual);
    const target = toNumber(campaign.metrics?.[key]?.target);
    const ratio = target > 0 ? actual / target : 1;
    const score = scoreFromRatio(ratio);
    const status = ratio >= 1 ? 'good' : ratio >= 0.9 ? 'watch' : 'bad';
    const delta = target > 0 ? (actual - target) / target : 0;
    return { key, actual, target, ratio, status, score, delta };
  });

  const kpiScore = metricSummaries.length
    ? clamp(
      metricSummaries.reduce((sum, m) => sum + m.score, 0) / metricSummaries.length,
      0,
      110,
    )
    : 100;

  const healthScore = Math.round((pacingScore * 0.5) + (kpiScore * 0.5));
  const healthStatus = healthScore >= 85 ? 'healthy' : healthScore >= 65 ? 'monitor' : 'risk';

  return {
    totalDays,
    elapsedDays,
    timeProgress,
    budgetProgress,
    expectedSpend,
    deltaSpend,
    deltaPct,
    pacingStatus,
    pacingScore,
    kpiScore,
    healthScore: clamp(healthScore, 0, 110),
    healthStatus,
    metricSummaries,
  };
}

function buildActions(campaign, derived, t) {
  const actions = [];
  const deltaPct = derived.deltaPct * 100;
  const absDelta = Math.abs(deltaPct);
  const worstMetric = derived.metricSummaries.reduce((worst, metric) => {
    if (!worst || metric.ratio < worst.ratio) return metric;
    return worst;
  }, null);

  if (derived.pacingStatus === 'under' && absDelta >= 10) {
    actions.push(t('ccc.actions.increaseBudget', { value: Math.round(absDelta) }));
  }
  if (derived.pacingStatus === 'over' && absDelta >= 10) {
    actions.push(t('ccc.actions.slowDown'));
  }
  if (derived.pacingStatus === 'on' && worstMetric && worstMetric.ratio < 0.95) {
    actions.push(t('ccc.actions.kpiBelow', { kpi: t(`ccc.metrics.${worstMetric.key}`) }));
  }
  if (!actions.length && derived.healthStatus === 'healthy') {
    actions.push(t('ccc.actions.allGood'));
  }
  return actions;
}

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${accent ?? 'text-slate-900 dark:text-white'}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status, t }) {
  const map = {
    healthy: { label: t('ccc.status.healthy'), className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100' },
    monitor: { label: t('ccc.status.monitor'), className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-100' },
    risk: { label: t('ccc.status.risk'), className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-100' },
  };
  const current = map[status] ?? map.monitor;
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${current.className}`}>
      {current.label}
    </span>
  );
}

function CampaignCard({ campaign, derived, onSelect, t }) {
  const progressPct = Math.round(derived.budgetProgress * 100);
  const pacingPct = derived.expectedSpend > 0 ? Math.round((toNumber(campaign.spentBudget) / derived.expectedSpend) * 100) : 0;
  const statusColor = derived.pacingStatus === 'under'
    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-100'
    : derived.pacingStatus === 'over'
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-100'
      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100';

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('ccc.card.type', { type: campaign.type })}</div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white">{campaign.name || t('ccc.card.untitled')}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{t('ccc.card.dates', { start: campaign.startDate || '—', end: campaign.endDate || '—' })}</div>
        </div>
        <StatusBadge status={derived.healthStatus} t={t} />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-slate-900/60 dark:text-slate-100">
          <span className={`h-2 w-2 rounded-full ${statusColor}`} />
          {t('ccc.card.pacing', { value: `${Math.round(pacingPct)}%` })}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{t('ccc.card.health', { value: derived.healthScore })}</span>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700/80">
        <div
          className="h-2 rounded-full bg-blue-600 transition-all dark:bg-blue-400"
          style={{ width: `${clamp(progressPct, 0, 100)}%` }}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300">
        {derived.metricSummaries.slice(0, 3).map((metric) => (
          <div key={metric.key} className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">
            <div className="font-semibold text-slate-800 dark:text-slate-100">{t(`ccc.metrics.${metric.key}`)}</div>
            <div>{metric.target ? `${metric.actual.toFixed(1)} / ${metric.target.toFixed(1)}` : metric.actual.toFixed(1)}</div>
          </div>
        ))}
      </div>
    </button>
  );
}

function MetricRow({ metric, t }) {
  const statusColor = metric.status === 'good'
    ? 'text-emerald-600'
    : metric.status === 'watch'
      ? 'text-amber-600'
      : 'text-rose-600';
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
      <div>
        <div className="font-semibold text-slate-800 dark:text-slate-100">{t(`ccc.metrics.${metric.key}`)}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{t('ccc.detail.benchmark', { target: metric.target.toFixed(1) })}</div>
      </div>
      <div className={`text-base font-semibold ${statusColor}`}>
        {metric.actual.toFixed(1)}
      </div>
    </div>
  );
}

function DetailPanel({ campaign, derived, t, onDelete }) {
  if (!campaign) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        {t('ccc.detail.empty')}
      </div>
    );
  }

  const pacingBadge = derived.pacingStatus === 'under'
    ? t('ccc.pacing.under')
    : derived.pacingStatus === 'over'
      ? t('ccc.pacing.over')
      : t('ccc.pacing.onTrack');

  const actions = buildActions(campaign, derived, t);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{campaign.type}</div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{campaign.name}</h2>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t('ccc.card.dates', { start: campaign.startDate || '—', end: campaign.endDate || '—' })}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onDelete(campaign.id)}
            className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-100 dark:hover:bg-rose-900/30"
          >
            {t('ccc.form.delete')}
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900">
            <div className="text-slate-500 dark:text-slate-400">{t('ccc.pacing.time')}</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {Math.round(derived.timeProgress * 100)}%
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900">
            <div className="text-slate-500 dark:text-slate-400">{t('ccc.pacing.budget')}</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {Math.round(derived.budgetProgress * 100)}%
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900">
            <div className="text-slate-500 dark:text-slate-400">{t('ccc.pacing.delta')}</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {formatCurrency(derived.deltaSpend, '€', 0)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{pacingBadge}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('ccc.kpis.title')}</h3>
          <StatusBadge status={derived.healthStatus} t={t} />
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {derived.metricSummaries.map((metric) => (
            <MetricRow key={metric.key} metric={metric} t={t} />
          ))}
          {!derived.metricSummaries.length && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              {t('ccc.kpis.empty')}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('ccc.health.title')}</h3>
          <div className="text-2xl font-semibold text-slate-900 dark:text-white">{derived.healthScore}/100</div>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('ccc.health.help')}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('ccc.actions.title')}</h3>
        <ul className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-200">
          {actions.map((action) => (
            <li key={action} className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">{action}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MetricInputs({ metricKey, values, onChange, t }) {
  return (
    <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="font-semibold text-slate-800 dark:text-slate-100">{t(`ccc.metrics.${metricKey}`)}</div>
      <label className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-300">
        {t('ccc.form.actual')}
        <input
          type="number"
          step="any"
          value={values.actual}
          onChange={(event) => onChange(metricKey, { ...values, actual: event.target.value })}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-300">
        {t('ccc.form.target')}
        <input
          type="number"
          step="any"
          value={values.target}
          onChange={(event) => onChange(metricKey, { ...values, target: event.target.value })}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
        />
      </label>
    </div>
  );
}

function CampaignForm({ formState, setFormState, onSave, isEditing, onReset }) {
  const { t } = useLocale();
  const recommended = getMetricsForType(formState.type);
  const extra = ALL_METRICS.filter((key) => !recommended.includes(key));
  const relevantMetrics = [...recommended, ...extra];

  const handleField = (field) => (event) => {
    setFormState((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleMetricChange = (metricKey, nextValues) => {
    setFormState((current) => ({
      ...current,
      metrics: {
        ...current.metrics,
        [metricKey]: nextValues,
      },
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{isEditing ? t('ccc.form.editTitle') : t('ccc.form.addTitle')}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('ccc.form.help')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {t('ccc.form.reset')}
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            {isEditing ? t('ccc.form.update') : t('ccc.form.save')}
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-slate-700 dark:text-slate-200">
          {t('ccc.form.name')}
          <input
            type="text"
            value={formState.name}
            onChange={handleField('name')}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            required
          />
        </label>
        <label className="text-sm text-slate-700 dark:text-slate-200">
          {t('ccc.form.type')}
          <select
            value={formState.type}
            onChange={handleField('type')}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="Video/OLV">{t('ccc.form.types.video')}</option>
            <option value="Display">{t('ccc.form.types.display')}</option>
            <option value="CTV">{t('ccc.form.types.ctv')}</option>
          </select>
        </label>
        <label className="text-sm text-slate-700 dark:text-slate-200">
          {t('ccc.form.start')}
          <input
            type="date"
            value={formState.startDate}
            onChange={handleField('startDate')}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
        <label className="text-sm text-slate-700 dark:text-slate-200">
          {t('ccc.form.end')}
          <input
            type="date"
            value={formState.endDate}
            onChange={handleField('endDate')}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
        <label className="text-sm text-slate-700 dark:text-slate-200">
          {t('ccc.form.budget')}
          <input
            type="number"
            step="any"
            value={formState.totalBudget}
            onChange={handleField('totalBudget')}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
        <label className="text-sm text-slate-700 dark:text-slate-200">
          {t('ccc.form.spent')}
          <input
            type="number"
            step="any"
            value={formState.spentBudget}
            onChange={handleField('spentBudget')}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {relevantMetrics.map((metricKey) => (
          <MetricInputs
            key={metricKey}
            metricKey={metricKey}
            values={formState.metrics[metricKey]}
            onChange={handleMetricChange}
            t={t}
          />
        ))}
        {!relevantMetrics.length && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            {t('ccc.kpis.empty')}
          </div>
        )}
      </div>
    </form>
  );
}

function CampaignControlCenter() {
  const { t } = useLocale();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [formState, setFormState] = useState(DEFAULT_CAMPAIGN);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCampaigns(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load campaigns', err);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
    } catch (err) {
      console.error('Failed to persist campaigns', err);
    }
  }, [campaigns, hydrated]);

  const derivedCampaigns = useMemo(() => (
    campaigns.map((campaign) => ({
      campaign,
      derived: computeDerived(campaign),
    }))
  ), [campaigns]);

  const selected = derivedCampaigns.find((item) => item.campaign.id === selectedId);

  const portfolio = useMemo(() => {
    if (!derivedCampaigns.length) {
      return { active: 0, risk: 0, monitor: 0, avgPacing: 0, status: 'weak' };
    }
    const risk = derivedCampaigns.filter((item) => item.derived.healthStatus === 'risk').length;
    const monitor = derivedCampaigns.filter((item) => item.derived.healthStatus === 'monitor').length;
    const avgPacing = Math.round(
      derivedCampaigns.reduce((sum, item) => sum + item.derived.budgetProgress, 0) / derivedCampaigns.length * 100,
    );
    const healthy = derivedCampaigns.filter((item) => item.derived.healthStatus === 'healthy').length;
    const status = healthy === derivedCampaigns.length
      ? 'good'
      : healthy >= derivedCampaigns.length / 2
        ? 'mixed'
        : 'weak';
    return {
      active: derivedCampaigns.length,
      risk,
      monitor,
      avgPacing,
      status,
    };
  }, [derivedCampaigns]);

  const resetForm = () => {
    setFormState(DEFAULT_CAMPAIGN);
    setSelectedId(null);
    setFormVisible(false);
  };

  const saveCampaign = () => {
    const id = formState.id ?? crypto.randomUUID();
    const payload = {
      ...formState,
      id,
    };
    setCampaigns((current) => {
      const exists = current.some((item) => item.id === id);
      if (exists) {
        return current.map((item) => (item.id === id ? payload : item));
      }
      return [...current, payload];
    });
    setSelectedId(id);
    setFormVisible(false);
  };

  const deleteCampaign = (id) => {
    setCampaigns((current) => current.filter((item) => item.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
    if (formState.id === id) {
      resetForm();
    }
  };

  const handleSelect = (item) => {
    setSelectedId(item.campaign.id);
    setFormState(item.campaign);
    setFormVisible(false);
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = typeof reader.result === 'string' ? reader.result : '';
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          setCampaigns(parsed);
          setSelectedId(null);
          setFormState(DEFAULT_CAMPAIGN);
        }
      } catch (err) {
        console.error('Failed to import campaigns', err);
      }
    };
    reader.readAsText(file);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(campaigns, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'campaign-control-center.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const headers = ['name', 'type', 'startDate', 'endDate', 'totalBudget', 'spentBudget', 'healthScore'];
    const rows = derivedCampaigns.map(({ campaign, derived }) => ([
      `"${campaign.name.replace(/"/g, '""')}"`,
      campaign.type,
      campaign.startDate,
      campaign.endDate,
      campaign.totalBudget,
      campaign.spentBudget,
      derived.healthScore,
    ].join(',')));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'campaign-control-center.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const editing = Boolean(formState.id);
  const selectedCampaign = derivedCampaigns.find((item) => item.campaign.id === selectedId)?.campaign;

  const openAddForm = () => {
    setFormState(DEFAULT_CAMPAIGN);
    setSelectedId(null);
    setFormVisible(true);
  };

  const openUpdateForm = () => {
    if (!selectedCampaign) return;
    setFormState(selectedCampaign);
    setFormVisible(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link to="/" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-300">
              {t('converter.backLink')}
            </Link>
            <h1 className="mt-3 text-3xl font-semibold">{t('ccc.title')}</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-3xl">
              {t('ccc.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <StatCard label={t('ccc.header.active')} value={portfolio.active} />
          <StatCard label={t('ccc.header.monitor')} value={portfolio.monitor} accent="text-amber-600" />
          <StatCard label={t('ccc.header.attention')} value={portfolio.risk} accent="text-rose-600" />
          <StatCard label={t('ccc.header.pacing')} value={`${portfolio.avgPacing}%`} />
          <StatCard label={t('ccc.header.status')} value={t(`ccc.header.statusValue.${portfolio.status}`)} />
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="text-sm text-slate-600 dark:text-slate-300">
              {t('ccc.overviewTitle')}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <button
                type="button"
                onClick={openAddForm}
                className="rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t('ccc.form.addButton')}
              </button>
              <button
                type="button"
                onClick={openUpdateForm}
                disabled={!selectedCampaign}
                className={`rounded-lg border px-3 py-2 font-semibold transition ${
                  selectedCampaign
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800'
                    : 'cursor-not-allowed border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-500'
                }`}
              >
                {t('ccc.form.updateButton')}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
              <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
              {t('ccc.form.import')}
            </label>
            <button
              type="button"
              onClick={handleExportJson}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t('ccc.form.exportJson')}
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t('ccc.form.exportCsv')}
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-3">
            {derivedCampaigns.map((item) => (
              <CampaignCard
                key={item.campaign.id}
                campaign={item.campaign}
                derived={item.derived}
                onSelect={() => handleSelect(item)}
                t={t}
              />
            ))}
            {!derivedCampaigns.length && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                {t('ccc.empty')}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <DetailPanel
              campaign={selected?.campaign}
              derived={selected?.derived}
              t={t}
              onDelete={deleteCampaign}
            />
            {formVisible && (
              <CampaignForm
                formState={formState}
                setFormState={setFormState}
                onSave={saveCampaign}
                isEditing={editing}
                onReset={resetForm}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignControlCenter;
