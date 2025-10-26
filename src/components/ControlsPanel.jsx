import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  selectedPresets,
  selectedPresetTotals,
  handlePresetChange,
  updateAudienceSize,
  campaignDays,
  errors,
  customSharesSum,
}) {
  const { t } = useLocale();
  const costType = inputs.costType ?? 'CPM';
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
  const numberFormatter = useMemo(() => new Intl.NumberFormat('fr-BE'), []);
  const presetMap = useMemo(
    () => new Map(UNIVERSE_PRESETS.map((preset) => [preset.key, preset])),
    [],
  );
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);
  const presetsContainerRef = useRef(null);
  const presetTotals = selectedPresetTotals ?? {
    uu: 0,
    pv: 0,
    hasPv: false,
    isCustom: true,
  };
  const formatCount = (value) => {
    const numeric = Number.isFinite(value) ? value : 0;
    return numberFormatter.format(Math.max(0, Math.round(numeric)));
  };
  const presetsTotalsLabel = presetTotals.isCustom
    ? t('controls.helper.presetsTotalsCustom', { uu: formatCount(presetTotals.uu) })
    : presetTotals.hasPv
      ? t('controls.helper.presetsTotalsWithPv', {
        uu: formatCount(presetTotals.uu),
        pv: formatCount(presetTotals.pv),
      })
      : t('controls.helper.presetsTotalsNoPv', { uu: formatCount(presetTotals.uu) });
  const selectedLabels = useMemo(
    () => selectedPresets
      .map((key) => presetMap.get(key)?.label)
      .filter(Boolean),
    [presetMap, selectedPresets],
  );
  const presetsButtonLabel = useMemo(() => {
    if (!selectedPresets.length) {
      return t('controls.helper.presetsButtonEmpty');
    }
    if (selectedPresets.length === 1 && selectedPresets[0] === 'Custom') {
      const formattedUu = numberFormatter.format(Math.max(0, Math.round(presetTotals.uu)));
      return t('controls.helper.presetsButtonCustom', { uu: formattedUu });
    }
    if (selectedLabels.length === 1) {
      return selectedLabels[0];
    }
    if (selectedLabels.length === 2) {
      return selectedLabels.join(', ');
    }
    return t('controls.helper.presetsButtonMultiple', { count: selectedLabels.length });
  }, [numberFormatter, presetTotals.uu, selectedLabels, selectedPresets, t]);

  useEffect(() => {
    if (!isPresetMenuOpen) {
      return undefined;
    }
    const handleClickOutside = (event) => {
      if (presetsContainerRef.current && !presetsContainerRef.current.contains(event.target)) {
        setIsPresetMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsPresetMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPresetMenuOpen]);

  const togglePresetMenu = () => {
    setIsPresetMenuOpen((current) => !current);
  };

  const handlePresetToggle = (presetKey) => {
    const isSelected = selectedPresets.includes(presetKey);
    if (!isSelected) {
      if (presetKey === 'Custom') {
        handlePresetChange(['Custom']);
        return;
      }
      if (selectedPresets.length === 1 && selectedPresets[0] === 'Custom') {
        handlePresetChange([presetKey]);
        return;
      }
      handlePresetChange([...selectedPresets, presetKey]);
      return;
    }

    if (presetKey === 'Custom') {
      return;
    }

    const next = selectedPresets.filter((key) => key !== presetKey);
    handlePresetChange(next.length ? next : ['Custom']);
  };


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
          <Field label={t('controls.fields.costType')}>
            <select
              value={costType}
              onChange={(event) => updateInput('costType')(event.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="CPM">{t('controls.costTypeOptions.CPM')}</option>
              <option value="CPC">{t('controls.costTypeOptions.CPC')}</option>
            </select>
          </Field>
          {costType === 'CPM' ? (
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
          ) : (
            <Field label={t('controls.fields.cpc')} error={getError(errors.cpc)}>
              <input
                type="text"
                inputMode="decimal"
                value={inputs.cpc}
                onChange={(event) => updateInput('cpc')(event.target.value)}
                className="w-full border rounded-lg p-2"
                aria-invalid={Boolean(errors.cpc)}
              />
            </Field>
          )}
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
          <Field
            label={t('controls.fields.presets')}
            helper={t('controls.helper.presetsHint')}
          >
            <div className="relative" ref={presetsContainerRef}>
              <button
                type="button"
                onClick={togglePresetMenu}
                className="w-full border rounded-lg p-2 flex items-center justify-between gap-2 bg-white text-left hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                aria-haspopup="listbox"
                aria-expanded={isPresetMenuOpen}
              >
                <span className="block flex-1 truncate">{presetsButtonLabel}</span>
                <span className="text-xs text-slate-500">{isPresetMenuOpen ? '^' : 'v'}</span>
              </button>
              {isPresetMenuOpen && (
                <div
                  className="absolute z-10 mt-2 w-full max-h-64 overflow-y-auto rounded-xl border bg-white shadow-lg"
                  role="listbox"
                  aria-multiselectable="true"
                >
                  <ul className="py-1 space-y-1">
                    {UNIVERSE_PRESETS.map((preset) => {
                      const isChecked = selectedPresets.includes(preset.key);
                      const uuLabel = preset.size.toLocaleString('fr-BE');
                      const pvLabel = typeof preset.pageViews === 'number'
                        ? preset.pageViews.toLocaleString('fr-BE')
                        : null;
                      return (
                        <li key={preset.key}>
                          <label className="flex items-start gap-2 px-3 py-2 text-sm hover:bg-slate-100">
                            <input
                              type="checkbox"
                              className="mt-0.5 h-4 w-4 rounded border-slate-300"
                              checked={isChecked}
                              onChange={() => handlePresetToggle(preset.key)}
                            />
                            <span className="leading-snug">
                              <span className="font-medium">{preset.label}</span>
                              <span className="block text-xs text-slate-500">
                                {pvLabel ? `${uuLabel} UU · ${pvLabel} PV` : `${uuLabel} UU`}
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1">{presetsTotalsLabel}</div>
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
