import React from 'react';

export default function CustomPacingEditor({
  pacingMode,
  dateLabels,
  customShares,
  updateCustomShareAt,
  resetCustomShares,
  customSharesSum,
  error,
}) {
  if (pacingMode !== 'Custom' || !dateLabels.length) {
    return null;
  }

  const sumFormatted = Number.isFinite(customSharesSum) ? customSharesSum.toFixed(2) : '0.00';

  return (
    <section className="mt-4 bg-white rounded-2xl shadow">
      <div className="p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Répartition personnalisée du budget</h3>
          <p className="text-sm text-slate-600">Ajuste les pourcentages par jour (total 100%).</p>
        </div>
        <button
          type="button"
          onClick={resetCustomShares}
          className="px-3 py-1 text-sm rounded-lg border shadow hover:bg-slate-50"
        >
          Répartir équitablement
        </button>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-2">Date</th>
              <th className="text-right p-2">Pourcentage du budget</th>
            </tr>
          </thead>
          <tbody>
            {dateLabels.map((label, index) => (
              <tr key={label.iso} className="odd:bg-white even:bg-slate-50">
                <td className="p-2 whitespace-nowrap">{label.human}</td>
                <td className="p-2 text-right">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={customShares[index] ?? ''}
                    onChange={(event) => updateCustomShareAt(index, event.target.value)}
                    className="w-28 border rounded-lg p-2 text-right"
                  />
                  <span className="ml-1">%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 flex items-center justify-between border-t text-sm">
        <div>Total: {sumFormatted}%</div>
        {error && <div className="text-rose-600">{error}</div>}
      </div>
    </section>
  );
}

