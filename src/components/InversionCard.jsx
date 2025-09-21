import React from 'react';
import { formatCurrency } from '../utils/format.js';

export default function InversionCard({ targetImpr, onTargetImprChange, neededBudget, currency, cpm, error }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="text-lg font-semibold">Objectif impressions, budget requis</h3>
      <div className="grid grid-cols-2 gap-3 mt-2">
        <label className="text-sm flex flex-col space-y-1">
          <span>Impressions cibles</span>
          <input
            type="text"
            inputMode="numeric"
            value={targetImpr}
            onChange={(event) => onTargetImprChange(event.target.value)}
            className="w-full border rounded-lg p-2"
            aria-invalid={Boolean(error)}
          />
          {error && <span className="text-xs text-rose-600">{error}</span>}
        </label>
        <div className="flex flex-col justify-end text-sm">
          <div>Budget requis estimé</div>
          <div className="text-xl font-semibold">{formatCurrency(neededBudget, currency)}</div>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2">Hypothèse, CPM, {formatCurrency(cpm, currency)}</p>
    </div>
  );
}

