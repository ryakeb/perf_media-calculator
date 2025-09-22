import React, { useMemo } from 'react';
import { UNIVERSE_PRESETS } from '../constants/universePresets.js';
import { resolveMessage, useLocale } from '../i18n.jsx';

function Field({ label, error, helper, children }) {
  return (
    <label className="text-sm flex flex-col space-y-1">
      <span>{label}</span>
      {children}
      {helper && !error && <span className="text-xs text-slate-500">{helper}</span>}
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </label>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

export default function ControlsPanel({
  inputs,
  updateInput,
  selectedPreset,
  handlePresetChange,
  updateAudienceSize,
  campaignDays,
  errors,
  customSharesSum,
}) {
  const { t } = useLocale();
  const getError = useMemo(() => (
    (errorDescriptor) => {
      const message = resolveMessage(errorDescriptor, t);
      return message || undefined;
    }
  ), [t]);

  const sumFormatted = Number.isFinite(customSharesSum) ? customSharesSum.toFixed(2) : '0.00';
  const pacingHelper = inputs.pacingMode === 'Even'
    ? t('controls.helper.pacingEven', { days: campaignDays || 0 })
    : t('controls.helper.pacingCustom', { sum: sumFormatted });

  return (
    <section className="grid md:grid-cols-3 gap-4">
      <Card title={t('controls.section.purchase')}>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('controls.fields.currency')}>
            <select
              value={inputs.currency}
              onChange={(event) => updateInput('currency')(event.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="€">€</option>
              <option value="$">$</option>
              <option value="£">£</option>
            </select>
          </Field>
          <Field label={t('controls.fields.budget')} error={getError(errors.budget)}>
            <input
              type="text"
              inputMode="decimal"
              value={inputs.budget}
              onChange={(event) => updateInput('budget')(event.target.value)}
              className="w-full border rounded-lg p-2"
              aria-invalid={Boolean(errors.budget)}
            />
          </Field>
          <Field label={t('controls.fields.cpm')} error={getError(errors.cpm)}>
            <input
              type="text"
              inputMode="decimal"
              value={inputs.cpm}
              onChange={(event) => updateInput('cpm')(event.target.value)}
              className="w-full border rounded-lg p-2"
              aria-invalid={Boolean(errors.cpm)}
            />
          </Field>
          <Field label={t('controls.fields.ctr')} error={getError(errors.ctr)}>
            <input
              type="text"
              inputMode="decimal"
              value={inputs.ctr}
              onChange={(event) => updateInput('ctr')(event.target.value)}
              className="w-full border rounded-lg p-2"
              aria-invalid={Boolean(errors.ctr)}
            />
          </Field>
          <Field label={t('controls.fields.vtr')} error={getError(errors.vtr)}>
            <input
              type="text"
              inputMode="decimal"
              value={inputs.vtr}
              onChange={(event) => updateInput('vtr')(event.target.value)}
              className="w-full border rounded-lg p-2"
              aria-invalid={Boolean(errors.vtr)}
            />
          </Field>
          <Field label={t('controls.fields.viewability')} error={getError(errors.viewability)}>
            <input
              type="text"
              inputMode="decimal"
              value={inputs.viewability}
              onChange={(event) => updateInput('viewability')(event.target.value)}
              className="w-full border rounded-lg p-2"
              aria-invalid={Boolean(errors.viewability)}
            />
          </Field>
        </div>
      </Card>

      <Card title={t('controls.section.reach')}>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('controls.fields.presets')}>
            <select
              value={selectedPreset}
              onChange={(event) => handlePresetChange(event.target.value)}
              className="w-full border rounded-lg p-2"
            >
              {UNIVERSE_PRESETS.map((preset) => (
                <option key={preset.key} value={preset.key}>
                  {preset.label} ({preset.size.toLocaleString('fr-BE')})
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('controls.fields.avgFreq')} error={getError(errors.avgFreq)}>
            <input
              type="text"
              inputMode="decimal"
              value={inputs.avgFreq}
              onChange={(event) => updateInput('avgFreq')(event.target.value)}
              className="w-full border rounded-lg p-2"
              aria-invalid={Boolean(errors.avgFreq)}
            />
          </Field>
          <Field label={t('controls.fields.audienceSize')} error={getError(errors.audienceSize)}>
            <input
              type="text"
              inputMode="numeric"
              value={inputs.audienceSize}
              onChange={(event) => updateAudienceSize(event.target.value)}
              className="w-full border rounded-lg p-2"
              aria-invalid={Boolean(errors.audienceSize)}
            />
          </Field>
          <Field label={t('controls.fields.reachModel')}>
            <select
              value={inputs.reachModel}
              onChange={(event) => updateInput('reachModel')(event.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="Poisson">{t('controls.reachModelOptions.Poisson')}</option>
              <option value="Simple">{t('controls.reachModelOptions.Simple')}</option>
            </select>
          </Field>
          <p className="col-span-2 text-xs text-slate-500">
            {t('controls.helper.poissonInfo')}
          </p>
        </div>
      </Card>

      <Card title={t('controls.section.pacing')}>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('controls.fields.start')} error={getError(errors.dateRange)}>
            <input
              type="date"
              value={inputs.startDate}
              onChange={(event) => updateInput('startDate')(event.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </Field>
          <Field label={t('controls.fields.end')} error={getError(errors.dateRange)}>
            <input
              type="date"
              value={inputs.endDate}
              onChange={(event) => updateInput('endDate')(event.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </Field>
          <Field
            label={t('controls.fields.pacing')}
            error={getError(errors.customShares)}
            helper={campaignDays ? pacingHelper : t('controls.helper.pacingDisabled')}
          >
            <select
              value={inputs.pacingMode}
              onChange={(event) => updateInput('pacingMode')(event.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="Even">{t('controls.pacingOptions.Even')}</option>
              <option value="Custom">{t('controls.pacingOptions.Custom')}</option>
            </select>
          </Field>
          <div className="col-span-2 text-sm text-slate-600">
            {t('controls.campaignDays', { count: campaignDays || 0 })}
          </div>
        </div>
      </Card>
    </section>
  );
}
