import React from 'react';

export default function ExportCard({ onExport, disabled }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="text-lg font-semibold">Export journalier</h3>
      <p className="text-sm text-slate-600 mt-1">Télécharge le CSV avec budget, impressions, reach incrémental et cumulé.</p>
      <button
        type="button"
        onClick={onExport}
        disabled={disabled}
        className="mt-3 px-4 py-2 rounded-xl shadow border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Exporter CSV
      </button>
    </div>
  );
}

