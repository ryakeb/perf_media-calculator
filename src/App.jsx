import React, { useMemo, useState, useEffect } from "react";

// Calculateur KPIs & Reach Média — Single file React app (Tailwind CSS)
// Corrections:
// - Retiré les séquences \" dans le JSX (provoquait Expecting Unicode escape) 
// - Supprimé les underscores numériques (compatibilité transpileurs)
// - Corrigé une balise </label> en trop
// - Ajouté des tests intégrés (affichables) pour les utilitaires et le modèle de reach

// Presets d'univers (ajuste selon tes sources xxxxxxxxx)
const UNIVERSE_PRESETS = [
  { key: "Custom", label: "Custom", size: 5000000 },
  { key: "BE_18P", label: "Belgique 18+", size: 8900000 },
  { key: "BE_18_54_FR", label: "Belgique FR 18-54", size: 3100000 },
  { key: "BE_18_54_NL", label: "Belgique NL 18-54", size: 2400000 },
  { key: "NL_18_54", label: "Pays Bas 18-54", size: 7200000 },
  { key: "LU_18_54", label: "Luxembourg 18-54", size: 350000 },
  { key: "BENELUX_18_54", label: "BENELUX 18-54", size: 13050000 },
  { key: "BE_18_54_CTV", label: "Belgique 18-54 CTV only", size: 3000000 },
  { key: "BE_18_54_Mobile", label: "Belgique 18-54 Mobile only", size: 4500000 },
];

function toNumber(v, fallback = 0) {
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

function formatInt(n) {
  if (!Number.isFinite(n)) return "0";
  return Math.round(n).toLocaleString("fr-BE");
}

function formatPct(n) {
  if (!Number.isFinite(n)) return "0%";
  return `${(n * 100).toFixed(2)}%`;
}

function daysBetweenInclusive(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s) || isNaN(e)) return 0;
  const ms = e.setHours(12, 0, 0, 0) - s.setHours(12, 0, 0, 0);
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

function distributeEven(total, parts) {
  if (parts <= 0) return [];
  const base = Math.floor((total / parts) * 100) / 100; // 2 décimales
  const arr = Array(parts).fill(base);
  let remainder = Math.round((total - base * parts) * 100) / 100;
  let i = 0;
  while (remainder > 0.009) {
    arr[i % parts] = Math.round((arr[i % parts] + 0.01) * 100) / 100;
    remainder = Math.round((remainder - 0.01) * 100) / 100;
    i++;
  }
  return arr;
}

function buildDateArray(start, days) {
  const s = new Date(start);
  const out = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(s);
    d.setDate(s.getDate() + i);
    out.push(d);
  }
  return out;
}

function formatDateISO(d) {
  return d.toISOString().slice(0, 10);
}

function poissonReachValue(impressions, universe) {
  const N = Math.max(1, toNumber(universe));
  const m = impressions / N;
  const reach = N * (1 - Math.exp(-m));
  return Math.min(N, reach);
}

export default function KPIReachCalculator() {
  // Inputs
  const [currency, setCurrency] = useState("€");
  const [budget, setBudget] = useState(10000);
  const [cpm, setCpm] = useState(12);
  const [ctr, setCtr] = useState(0.5); // %
  const [vtr, setVtr] = useState(70); // %
  const [viewability, setViewability] = useState(80); // %
  const [avgFreq, setAvgFreq] = useState(3);
  const [audienceSize, setAudienceSize] = useState(5000000); // taille univers cible
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pacingMode, setPacingMode] = useState("Even"); // Even, Custom
  const [reachModel, setReachModel] = useState("Poisson"); // Poisson, Simple
  const [selectedPreset, setSelectedPreset] = useState("Custom");

  // Optional inversion: target impressions to solve budget
  const [targetImpr, setTargetImpr] = useState(0);

  // Tests intégrés
  const [showTests, setShowTests] = useState(false);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const results = [];
    const close = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;

    // Test 1: daysBetweenInclusive
    results.push({
      name: "daysBetweenInclusive même jour",
      ok: daysBetweenInclusive("2025-09-01", "2025-09-01") === 1,
    });
    results.push({
      name: "daysBetweenInclusive 3 jours",
      ok: daysBetweenInclusive("2025-09-01", "2025-09-03") === 3,
    });

    // Test 2: distributeEven
    const dist = distributeEven(100, 3);
    const sumDist = Math.round(dist.reduce((a, b) => a + b, 0) * 100) / 100;
    results.push({ name: "distributeEven somme", ok: sumDist === 100 });
    results.push({ name: "distributeEven longueur", ok: dist.length === 3 });

    // Test 3: impressions via budget & cpm
    const I = (10000 / 12) * 1000; // 833333.333...
    results.push({ name: "impressions base", ok: close(I, 833333.3333333334, 1e-6) });

    // Test 4: poissonReachValue plage attendue
    const R = poissonReachValue(I, 5000000); // ~7.67e5
    results.push({ name: "reach Poisson dans la plage", ok: R > 750000 && R < 800000 });

    // Test 5: GRPs cohérence en Poisson: Reach% * F = 100 * I / N
    const N = 5000000;
    const reachPct = R / N;
    const freqObs = I / R;
    const grpsA = reachPct * 100 * freqObs;
    const grpsB = (100 * I) / N;
    results.push({ name: "GRPs identité Poisson", ok: close(grpsA, grpsB, 1e-9) });

    setTestResults(results);
    // eslint-disable-next-line no-console
    console.table(results);
  }, []);

  const days = useMemo(() => daysBetweenInclusive(startDate, endDate), [startDate, endDate]);

  const impressions = useMemo(() => {
    const b = toNumber(budget);
    const c = toNumber(cpm);
    if (c <= 0) return 0;
    return (b / c) * 1000;
  }, [budget, cpm]);

  const clicks = useMemo(() => impressions * (toNumber(ctr) / 100), [impressions, ctr]);
  const completeViews = useMemo(() => impressions * (toNumber(vtr) / 100), [impressions, vtr]);
  const viewableImpr = useMemo(() => impressions * (toNumber(viewability) / 100), [impressions, viewability]);

  // Effective costs
  const eCPC = clicks > 0 ? toNumber(budget) / clicks : 0;
  const eCPCV = completeViews > 0 ? toNumber(budget) / completeViews : 0;
  const vCPM = viewableImpr > 0 ? (toNumber(budget) / viewableImpr) * 1000 : 0;

  // Reach models
  const simpleReach = useMemo(() => {
    const f = Math.max(1e-6, toNumber(avgFreq));
    return Math.min(toNumber(audienceSize), impressions / f);
  }, [impressions, avgFreq, audienceSize]);

  const poissonReach = useMemo(() => {
    return poissonReachValue(impressions, audienceSize);
  }, [impressions, audienceSize]);

  const reach = reachModel === "Poisson" ? poissonReach : simpleReach;
  const reachPct = toNumber(audienceSize) > 0 ? reach / toNumber(audienceSize) : 0;
  const avgFreqAmongReached = reach > 0 ? impressions / reach : 0;
  const grps = reachPct * 100 * avgFreqAmongReached; // GRPs = Reach% * Freq

  // Daily pacing and incremental reach
  const daily = useMemo(() => {
    if (!days || days <= 0 || !startDate) return [];
    const dates = buildDateArray(startDate, days);
    const dailyBudget = pacingMode === "Even" ? distributeEven(toNumber(budget), days) : distributeEven(toNumber(budget), days);
    const dailyImpr = dailyBudget.map((b) => (toNumber(cpm) > 0 ? (b / toNumber(cpm)) * 1000 : 0));

    const N = Math.max(1, toNumber(audienceSize));
    const f = Math.max(1e-6, toNumber(avgFreq));

    let cumImpr = 0;
    let prevReach = 0;

    return dates.map((d, i) => {
      const impr = dailyImpr[i];
      cumImpr += impr;
      let cumReach = 0;
      if (reachModel === "Poisson") {
        const m = cumImpr / N;
        cumReach = Math.min(N, N * (1 - Math.exp(-m)));
      } else {
        cumReach = Math.min(N, cumImpr / f);
      }
      const incrReach = Math.max(0, cumReach - prevReach);
      prevReach = cumReach;
      return {
        date: formatDateISO(d),
        budget: dailyBudget[i],
        impressions: impr,
        incrReach,
        cumReach,
      };
    });
  }, [days, startDate, pacingMode, budget, cpm, audienceSize, avgFreq, reachModel]);

  // Inversion helper: given target impressions, compute needed budget
  const neededBudget = useMemo(() => {
    const impr = Math.max(0, toNumber(targetImpr));
    const c = toNumber(cpm);
    return c > 0 ? (impr * c) / 1000 : 0;
  }, [targetImpr, cpm]);

  // Export CSV
  const exportCSV = () => {
    if (!daily.length) return;
    const headers = ["date", "budget", "impressions", "incrReach", "cumReach"];
    const rows = daily.map((r) => [r.date, r.budget.toFixed(2), Math.round(r.impressions), Math.round(r.incrReach), Math.round(r.cumReach)]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pacing_reach.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">Calculateur KPIs et Reach Média</h1>
          <p className="text-slate-600 mt-1">Prépare rapidement tes offres, calcule impressions, clics, CPM, VTR, viewability, et estime le reach cumulé sur tes dates de campagne.</p>
        </header>

        {/* Inputs */}
        <section className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <h2 className="text-lg font-semibold">Paramètres d'achat</h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2 text-sm">Devise
                <select value={currency} onChange={(e)=>setCurrency(e.target.value)} className="mt-1 w-full border rounded-lg p-2">
                  <option value="€">€</option>
                  <option value="$">$</option>
                  <option value="£">£</option>
                </select>
              </label>
              <label className="text-sm">Budget total
                <input type="number" step="0.01" value={budget} onChange={(e)=>setBudget(toNumber(e.target.value))} className="mt-1 w-full border rounded-lg p-2" />
              </label>
              <label className="text-sm">CPM
                <input type="number" step="0.01" value={cpm} onChange={(e)=>setCpm(toNumber(e.target.value))} className="mt-1 w-full border rounded-lg p-2" />
              </label>
              <label className="text-sm">CTR %
                <input type="number" step="0.01" value={ctr} onChange={(e)=>setCtr(toNumber(e.target.value))} className="mt-1 w-full border rounded-lg p-2" />
              </label>
              <label className="text-sm">VTR %
                <input type="number" step="0.01" value={vtr} onChange={(e)=>setVtr(toNumber(e.target.value))} className="mt-1 w-full border rounded-lg p-2" />
              </label>
              <label className="text-sm">Viewability %
                <input type="number" step="0.01" value={viewability} onChange={(e)=>setViewability(toNumber(e.target.value))} className="mt-1 w-full border rounded-lg p-2" />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <h2 className="text-lg font-semibold">Reach et univers</h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2 text-sm">Préréglages d'univers
                <select
                  value={selectedPreset}
                  onChange={(e)=>{ const k = e.target.value; setSelectedPreset(k); const p = UNIVERSE_PRESETS.find(x=>x.key===k); if(p){ setAudienceSize(p.size); } }}
                  className="mt-1 w-full border rounded-lg p-2"
                >
                  {UNIVERSE_PRESETS.map(p=> (
                    <option key={p.key} value={p.key}>{p.label} ({p.size.toLocaleString('fr-BE')})</option>
                  ))}
                </select>
              </label>

              <label className="text-sm">Fréquence moyenne
                <input type="number" step="0.01" value={avgFreq} onChange={(e)=>setAvgFreq(toNumber(e.target.value))} className="mt-1 w-full border rounded-lg p-2" />
              </label>
              <label className="text-sm">Taille d'univers
                <input type="number" step="1" value={audienceSize} onChange={(e)=>{setAudienceSize(toNumber(e.target.value)); setSelectedPreset('Custom');}} className="mt-1 w-full border rounded-lg p-2" />
              </label>
              <label className="col-span-2 text-sm">Modèle de reach
                <select value={reachModel} onChange={(e)=>setReachModel(e.target.value)} className="mt-1 w-full border rounded-lg p-2">
                  <option>Poisson</option>
                  <option>Simple</option>
                </select>
              </label>
              <p className="col-span-2 text-xs text-slate-500">Poisson reflète la duplication probable, Simple divise impressions par fréquence moyenne.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <h2 className="text-lg font-semibold">Dates et pacing</h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">Start
                <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="mt-1 w-full border rounded-lg p-2" />
              </label>
              <label className="text-sm">End
                <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="mt-1 w-full border rounded-lg p-2" />
              </label>
              <label className="col-span-2 text-sm">Pacing
                <select value={pacingMode} onChange={(e)=>setPacingMode(e.target.value)} className="mt-1 w-full border rounded-lg p-2">
                  <option>Even</option>
                  <option disabled>Custom, bientôt</option>
                </select>
              </label>
              <div className="col-span-2 text-sm text-slate-600">Jours de campagne, {days || 0}</div>
            </div>
          </div>
        </section>

        {/* Summary KPIs */}
        <section className="mt-6 grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="text-sm text-slate-500">Impressions estimées</div>
            <div className="text-2xl font-semibold mt-1">{formatInt(impressions)}</div>
            <div className="text-xs text-slate-500 mt-1">eCPM, {currency}{toNumber(budget).toFixed(2)} budget</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="text-sm text-slate-500">Clics estimés</div>
            <div className="text-2xl font-semibold mt-1">{formatInt(clicks)}</div>
            <div className="text-xs text-slate-500 mt-1">eCPC, {currency}{eCPC.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="text-sm text-slate-500">Vues complètes</div>
            <div className="text-2xl font-semibold mt-1">{formatInt(completeViews)}</div>
            <div className="text-xs text-slate-500 mt-1">eCPCV, {currency}{eCPCV.toFixed(4)}</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="text-sm text-slate-500">Viewable Impr</div>
            <div className="text-2xl font-semibold mt-1">{formatInt(viewableImpr)}</div>
            <div className="text-xs text-slate-500 mt-1">vCPM, {currency}{vCPM.toFixed(2)}</div>
          </div>
        </section>

        {/* Reach summary */}
        <section className="mt-4 grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="text-sm text-slate-500">Reach cumulé estimé</div>
            <div className="text-2xl font-semibold mt-1">{formatInt(reach)}</div>
            <div className="text-xs text-slate-500 mt-1">{formatPct(reachPct)}</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="text-sm text-slate-500">Fréquence moyenne observée</div>
            <div className="text-2xl font-semibold mt-1">{avgFreqAmongReached.toFixed(2)}</div>
            <div className="text-xs text-slate-500 mt-1">GRPs estimés, {grps.toFixed(1)}</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="text-sm text-slate-500">Jours de campagne</div>
            <div className="text-2xl font-semibold mt-1">{days || 0}</div>
            <div className="text-xs text-slate-500 mt-1">pacing, {pacingMode}</div>
          </div>
        </section>

        {/* Inversion card */}
        <section className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="text-lg font-semibold">Objectif impressions, budget requis</h3>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <label className="text-sm">Impressions cibles
                <input type="number" step="1" value={targetImpr} onChange={(e)=>setTargetImpr(toNumber(e.target.value))} className="mt-1 w-full border rounded-lg p-2" />
              </label>
              <div className="flex flex-col justify-end text-sm">
                <div>Budget requis estimé</div>
                <div className="text-xl font-semibold">{currency}{neededBudget.toFixed(2)}</div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Hypothèse, CPM, {currency}{toNumber(cpm).toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="text-lg font-semibold">Export journalier</h3>
            <p className="text-sm text-slate-600 mt-1">Télécharge le CSV avec budget, impressions, reach incrémental et cumulé.</p>
            <button onClick={exportCSV} className="mt-3 px-4 py-2 rounded-xl shadow border hover:bg-slate-50">Exporter CSV</button>
          </div>
        </section>

        {/* Daily table */}
        <section className="mt-6 bg-white rounded-2xl shadow">
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Pacing et reach par jour</h3>
            <div className="text-sm text-slate-500">{daily.length} lignes</div>
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
                {daily.map((r) => (
                  <tr key={r.date} className="odd:bg-white even:bg-slate-50">
                    <td className="p-2">{r.date}</td>
                    <td className="p-2 text-right">{r.budget.toFixed(2)}</td>
                    <td className="p-2 text-right">{formatInt(r.impressions)}</td>
                    <td className="p-2 text-right">{formatInt(r.incrReach)}</td>
                    <td className="p-2 text-right">{formatInt(r.cumReach)}</td>
                  </tr>
                ))}
                {!daily.length && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">Renseigne des dates et un budget pour voir le détail journalier.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tests intégrés (optionnels) */}
        <section className="mt-6 bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Tests intégrés</h3>
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={showTests} onChange={(e)=>setShowTests(e.target.checked)} />
              Afficher
            </label>
          </div>
          {showTests && (
            <ul className="mt-3 list-disc pl-6 text-sm">
              {testResults.map((t, idx) => (
                <li key={idx} className={t.ok ? "text-emerald-600" : "text-rose-600"}>
                  {t.ok ? "OK" : "KO"} — {t.name}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Notes */}
        <section className="mt-6 text-xs text-slate-500 space-y-2">
          <p><span className="font-semibold">Notes</span>, le modèle Poisson suppose une distribution aléatoire des impressions sur l'univers, la formule de reach cumulé est N × (1 − exp(−I/N)). Le modèle Simple estime le reach comme impressions divisées par la fréquence moyenne. Ajuste la fréquence moyenne et la taille d'univers pour coller à ton contexte xxxxxxxxx.</p>
          <p>Ce calculateur fonctionne pour vidéo et display, CTR, VTR et viewability paramétrables. Les GRPs affichés sont calculés comme Reach% × Fréquence moyenne observée.</p>
        </section>
      </div>
    </div>
  );
}
