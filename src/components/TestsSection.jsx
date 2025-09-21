import React from 'react';

export default function TestsSection({ showChecks, onToggle, results }) {
  return (
    <section className="mt-6 bg-white rounded-2xl shadow p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tests intégrés</h3>
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={showChecks}
            onChange={(event) => onToggle(event.target.checked)}
          />
          Afficher
        </label>
      </div>
      {showChecks && (
        <ul className="mt-3 list-disc pl-6 text-sm">
          {results.map((result) => (
            <li key={result.name} className={result.ok ? 'text-emerald-600' : 'text-rose-600'}>
              {result.ok ? 'OK' : 'KO'} — {result.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

