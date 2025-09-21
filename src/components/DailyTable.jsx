import React from 'react';
import { formatInt, formatCurrency } from '../utils/format.js';

export default function DailyTable({ dailyRows, currency }) {
  return (
    <section className="mt-6 bg-white rounded-2xl shadow">
      <div className="p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pacing et reach par jour</h3>
        <div className="text-sm text-slate-500">{dailyRows.length} lignes</div>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-2">Date</th>
              <th className="text-right p-2">Budget {currency}</th>
              <th className="text-right p-2">Impressions</th>
              <th className="text-right p-2">Reach incrémental</th>
              <th className="text-right p-2">Reach cumulé</th>
            </tr>
          </thead>
          <tbody>
            {dailyRows.map((row) => (
              <tr key={row.date} className="odd:bg-white even:bg-slate-50">
                <td className="p-2 whitespace-nowrap">{row.date}</td>
                <td className="p-2 text-right">{formatCurrency(row.budget, currency)}</td>
                <td className="p-2 text-right">{formatInt(row.impressions)}</td>
                <td className="p-2 text-right">{formatInt(row.incrReach)}</td>
                <td className="p-2 text-right">{formatInt(row.cumReach)}</td>
              </tr>
            ))}
            {!dailyRows.length && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  Renseigne des dates et un budget pour voir le détail journalier.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

