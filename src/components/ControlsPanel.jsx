import React from 'react';
import { UNIVERSE_PRESETS } from '../constants/universePresets.js';

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
  const sumFormatted = Number.isFinite(customSharesSum) ? customSharesSum.toFixed(2) : '0.00';
  const pacingHelper = inputs.pacingMode === 'Even'
    ? `Répartition égale sur ${campaignDays || 0} jour(s).`
    : `Répartition personnalisée, total actuel ${sumFormatted}%.`;

  return (
    <section className="grid md:grid-cols-3 gap-4">
      <Card title="Paramètres d'achat">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Devise">
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
          <Field label="Budget total" error={errors.budget}>
            <input
              type="text"
              inputMode="decimal"
              value={inputs.budget}
              onChange={(event) => updateInput('budget')(event.target.value)}
              className="w-full border rounded-lg p-2"
              aria-invalid={Boolean(errors.budget)}
            />
          </Field>
          <Field label="CPM" error={errors.cpm}>
            <input
              type="text"
              inputMode="decimal"
              value={inputs.cpm}
              onChange={(event) => updateInput('cpm')(event.target.value)}
              className="w-full border rounded-lg p-2"
              aria-invalid={Boolean(errors.cpm)}
            />
          </Field>
          <Field label="CTR %" error={errors.ctr}>
            <input
              type="text"
              inputMode="decimal"
              value={inputs.ctr}
              onChange={(event) => updateInput('ctr')(event.target.value)}
              className="w-full border rounded-lg p-2"
              aria-invalid={Boolean(errors.ctr)}
            />
          </Field>
          <Field label="VTR %" error={errors.vtr}>
            <input
              type="text"
              inputMode="decimal"
              value={inputs.vtr}
              onChange={(event) => updateInput('vtr')(event.target.value)}
              className="w-full border rounded-lg p-2"
              aria-invalid={Boolean(errors.vtr)}
            />
          </Field>
          <Field label="Viewability %" error={errors.viewability}>
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

      <Card title="Reach et univers">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Préréglages d'univers">
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
          <Field label="Fréquence moyenne" error={errors.avgFreq}>
            <input
              type="text"
              inputMode="decimal"
              value={inputs.avgFreq}
              onChange={(event) => updateInput('avgFreq')(event.target.value)}
              className="w-full border rounded-lg p-2"
              aria-invalid={Boolean(errors.avgFreq)}
            />
          </Field>
          <Field label="Taille d'univers" error={errors.audienceSize}>
            <input
              type="text"
              inputMode="numeric"
              value={inputs.audienceSize}
              onChange={(event) => updateAudienceSize(event.target.value)}
              className="w-full border rounded-lg p-2"
              aria-invalid={Boolean(errors.audienceSize)}
            />
          </Field>
          <Field label="Modèle de reach">
            <select
              value={inputs.reachModel}
              onChange={(event) => updateInput('reachModel')(event.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="Poisson">Poisson</option>
              <option value="Simple">Simple</option>
            </select>
          </Field>
          <p className="col-span-2 text-xs text-slate-500">
            Poisson reflète la duplication probable, Simple divise les impressions par la fréquence moyenne.
          </p>
        </div>
      </Card>

      <Card title="Dates et pacing">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start" error={errors.dateRange}>
            <input
              type="date"
              value={inputs.startDate}
              onChange={(event) => updateInput('startDate')(event.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </Field>
          <Field label="End" error={errors.dateRange}>
            <input
              type="date"
              value={inputs.endDate}
              onChange={(event) => updateInput('endDate')(event.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </Field>
          <Field label="Pacing" error={errors.customShares} helper={campaignDays ? pacingHelper : 'Ajoute des dates pour activer le pacing.'}>
            <select
              value={inputs.pacingMode}
              onChange={(event) => updateInput('pacingMode')(event.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="Even">Even</option>
              <option value="Custom">Custom</option>
            </select>
          </Field>
          <div className="col-span-2 text-sm text-slate-600">
            Jours de campagne, {campaignDays || 0}
          </div>
        </div>
      </Card>
    </section>
  );
}
