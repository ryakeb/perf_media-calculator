import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import LanguageToggle from '../components/LanguageToggle.jsx';
import { useLocale } from '../i18n.jsx';

function NumberField({ id, label, value, onChange, suffix }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700" htmlFor={id}>
      {label}
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-500">
        <input
          id={id}
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-base font-semibold text-slate-900 outline-none"
        />
        {suffix ? <span className="text-xs font-semibold text-slate-500">{suffix}</span> : null}
      </div>
    </label>
  );
}

function ResultBadge({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <span className="text-lg font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export default function PercentageTools() {
  const { t, language } = useLocale();
  const locale = language === 'fr' ? 'fr-FR' : 'en-US';

  const [percentValue, setPercentValue] = useState('20');
  const [baseValue, setBaseValue] = useState('8850');

  const [partValue, setPartValue] = useState('1750');
  const [totalValue, setTotalValue] = useState('8200');

  const [adjustBase, setAdjustBase] = useState('12000');
  const [adjustPercent, setAdjustPercent] = useState('12.5');
  const [direction, setDirection] = useState('increase');

  const [fromValue, setFromValue] = useState('7800');
  const [toValue, setToValue] = useState('9300');

  const formatNumber = useMemo(
    () => (value) => {
      if (!Number.isFinite(value)) return '—';
      return new Intl.NumberFormat(locale, {
        maximumFractionDigits: Math.abs(value) >= 1 ? 2 : 4,
      }).format(value);
    },
    [locale],
  );

  const parseInput = (raw) => {
    const normalized = `${raw}`.replace(',', '.');
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const percentResult = useMemo(() => {
    const percent = parseInput(percentValue);
    const base = parseInput(baseValue);
    if (percent === null || base === null) return null;
    return (percent / 100) * base;
  }, [percentValue, baseValue]);

  const shareResult = useMemo(() => {
    const part = parseInput(partValue);
    const total = parseInput(totalValue);
    if (part === null || total === null || total === 0) return null;
    return (part / total) * 100;
  }, [partValue, totalValue]);

  const adjustedResult = useMemo(() => {
    const base = parseInput(adjustBase);
    const change = parseInput(adjustPercent);
    if (base === null || change === null) return null;
    const factor = 1 + (direction === 'increase' ? 1 : -1) * (change / 100);
    return {
      newValue: base * factor,
      delta: base * (factor - 1),
    };
  }, [adjustBase, adjustPercent, direction]);

  const changeResult = useMemo(() => {
    const from = parseInput(fromValue);
    const to = parseInput(toValue);
    if (from === null || to === null || from === 0) return null;
    return ((to - from) / from) * 100;
  }, [fromValue, toValue]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link to="/" className="text-sm font-medium text-blue-600 hover:underline">
              {t('converter.backLink')}
            </Link>
            <h1 className="mt-4 text-3xl font-semibold">{t('percentageTool.title')}</h1>
            <p className="mt-2 max-w-3xl text-base text-slate-600">{t('percentageTool.description')}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>{t('percentageTool.bullets.quick')}</li>
              <li>{t('percentageTool.bullets.variations')}</li>
              <li>{t('percentageTool.bullets.cleanUi')}</li>
            </ul>
          </div>
          <LanguageToggle />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{t('percentageTool.cards.percentOf.title')}</h2>
            <p className="mt-1 text-sm text-slate-600">{t('percentageTool.cards.percentOf.subtitle')}</p>
            <div className="mt-4 grid gap-4">
              <NumberField
                id="percentValue"
                label={t('percentageTool.cards.percentOf.percentLabel')}
                value={percentValue}
                onChange={setPercentValue}
                suffix="%"
              />
              <NumberField
                id="baseValue"
                label={t('percentageTool.cards.percentOf.baseLabel')}
                value={baseValue}
                onChange={setBaseValue}
              />
              <ResultBadge
                label={t('percentageTool.cards.percentOf.resultLabel')}
                value={formatNumber(percentResult)}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{t('percentageTool.cards.share.title')}</h2>
            <p className="mt-1 text-sm text-slate-600">{t('percentageTool.cards.share.subtitle')}</p>
            <div className="mt-4 grid gap-4">
              <NumberField
                id="partValue"
                label={t('percentageTool.cards.share.partLabel')}
                value={partValue}
                onChange={setPartValue}
              />
              <NumberField
                id="totalValue"
                label={t('percentageTool.cards.share.totalLabel')}
                value={totalValue}
                onChange={setTotalValue}
              />
              <ResultBadge
                label={t('percentageTool.cards.share.resultLabel')}
                value={shareResult !== null ? `${formatNumber(shareResult)} %` : '—'}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{t('percentageTool.cards.adjust.title')}</h2>
                <p className="mt-1 text-sm text-slate-600">{t('percentageTool.cards.adjust.subtitle')}</p>
              </div>
              <div className="inline-flex overflow-hidden rounded-lg border text-xs font-semibold text-slate-700">
                <button
                  type="button"
                  onClick={() => setDirection('increase')}
                  className={`px-3 py-2 transition ${direction === 'increase' ? 'bg-blue-50 text-blue-700' : 'bg-white hover:bg-slate-50'}`}
                >
                  {t('percentageTool.cards.adjust.increase')}
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('decrease')}
                  className={`px-3 py-2 transition ${direction === 'decrease' ? 'bg-rose-50 text-rose-700' : 'bg-white hover:bg-slate-50'}`}
                >
                  {t('percentageTool.cards.adjust.decrease')}
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4">
              <NumberField
                id="adjustBase"
                label={t('percentageTool.cards.adjust.baseLabel')}
                value={adjustBase}
                onChange={setAdjustBase}
              />
              <NumberField
                id="adjustPercent"
                label={t('percentageTool.cards.adjust.changeLabel')}
                value={adjustPercent}
                onChange={setAdjustPercent}
                suffix="%"
              />
              <ResultBadge
                label={t('percentageTool.cards.adjust.resultLabel')}
                value={adjustedResult?.newValue ? formatNumber(adjustedResult.newValue) : '—'}
              />
              <div className="text-xs text-slate-500">
                {adjustedResult?.delta ? (
                  <>
                    {direction === 'increase'
                      ? t('percentageTool.cards.adjust.deltaUp', { value: formatNumber(adjustedResult.delta) })
                      : t('percentageTool.cards.adjust.deltaDown', { value: formatNumber(Math.abs(adjustedResult.delta)) })}
                  </>
                ) : (
                  t('percentageTool.cards.adjust.deltaPlaceholder')
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{t('percentageTool.cards.change.title')}</h2>
            <p className="mt-1 text-sm text-slate-600">{t('percentageTool.cards.change.subtitle')}</p>
            <div className="mt-4 grid gap-4">
              <NumberField
                id="fromValue"
                label={t('percentageTool.cards.change.fromLabel')}
                value={fromValue}
                onChange={setFromValue}
              />
              <NumberField
                id="toValue"
                label={t('percentageTool.cards.change.toLabel')}
                value={toValue}
                onChange={setToValue}
              />
              <ResultBadge
                label={t('percentageTool.cards.change.resultLabel')}
                value={changeResult !== null ? `${formatNumber(changeResult)} %` : '—'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
