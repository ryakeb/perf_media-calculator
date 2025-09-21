import { useEffect, useMemo, useState } from 'react';
import { UNIVERSE_PRESETS } from '../constants/universePresets.js';
import {
  parseNumericInput,
  parsePositiveNumber,
  parsePercentageInput,
  parseNonNegativeNumber,
  roundTo,
  safeDivide,
} from '../utils/number.js';
import {
  formatDateISO,
  buildDateArray,
  diffDaysInclusive,
  daysBetweenInclusive,
  formatDateHuman,
} from '../utils/dates.js';
import {
  distributeEven,
  distributeByWeights,
  reachFromCumulativeImpressions,
  poissonReachValue,
} from '../utils/reach.js';
import { sumNumbers } from '../utils/number.js';

const DEFAULT_INPUTS = {
  currency: '€',
  budget: '10000',
  cpm: '12',
  ctr: '0.5',
  vtr: '70',
  viewability: '80',
  avgFreq: '3',
  audienceSize: '5000000',
  startDate: '',
  endDate: '',
  pacingMode: 'Even',
  reachModel: 'Poisson',
  targetImpr: '',
};

function buildPresetMap() {
  const map = new Map();
  UNIVERSE_PRESETS.forEach((preset) => {
    map.set(preset.key, preset);
  });
  return map;
}

const PRESET_MAP = buildPresetMap();

function runSelfChecks() {
  const results = [];
  const close = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;

  const diffSameDay = daysBetweenInclusive('2025-09-01', '2025-09-01') === 1;
  const diffThreeDay = daysBetweenInclusive('2025-09-01', '2025-09-03') === 3;
  results.push({ name: 'daysBetweenInclusive même jour', ok: diffSameDay });
  results.push({ name: 'daysBetweenInclusive 3 jours', ok: diffThreeDay });

  const dist = distributeEven(100, 3);
  const sumDist = roundTo(sumNumbers(dist), 2);
  results.push({ name: 'distributeEven somme', ok: sumDist === 100 });
  results.push({ name: 'distributeEven longueur', ok: dist.length === 3 });

  const impressions = (10000 / 12) * 1000;
  results.push({ name: 'impressions base', ok: close(impressions, 833333.3333333334) });

  const poissonReach = poissonReachValue(impressions, 5000000);
  results.push({ name: 'reach Poisson dans la plage', ok: poissonReach > 750000 && poissonReach < 800000 });

  const reachPct = poissonReach / 5000000;
  const freqObs = impressions / poissonReach;
  const grpsA = reachPct * 100 * freqObs;
  const grpsB = (100 * impressions) / 5000000;
  results.push({ name: 'GRPs identité Poisson', ok: close(grpsA, grpsB, 1e-9) });

  return results;
}

export function useKpiModel() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [selectedPreset, setSelectedPreset] = useState('Custom');
  const [customShares, setCustomShares] = useState([]);
  const [showChecks, setShowChecks] = useState(false);

  const rawDiffDays = diffDaysInclusive(inputs.startDate, inputs.endDate);
  const campaignDays = useMemo(
    () => daysBetweenInclusive(inputs.startDate, inputs.endDate),
    [inputs.startDate, inputs.endDate],
  );

  useEffect(() => {
    setCustomShares((previous) => {
      if (campaignDays <= 0) {
        return [];
      }
      if (previous.length === campaignDays) {
        return previous;
      }
      const evenShare = roundTo(100 / campaignDays, 2).toFixed(2);
      return Array.from({ length: campaignDays }, (_, index) => previous[index] ?? evenShare);
    });
  }, [campaignDays]);

  const parsed = useMemo(() => {
    const budget = parsePositiveNumber(inputs.budget);
    const cpm = parsePositiveNumber(inputs.cpm);
    const ctr = parsePercentageInput(inputs.ctr, { min: 0, max: 100 });
    const vtr = parsePercentageInput(inputs.vtr, { min: 0, max: 100 });
    const viewability = parsePercentageInput(inputs.viewability, { min: 0, max: 100 });
    const avgFreq = parsePositiveNumber(inputs.avgFreq);
    const audienceSize = parsePositiveNumber(inputs.audienceSize);
    const targetImpr = parseNonNegativeNumber(inputs.targetImpr);

    return {
      budget,
      cpm,
      ctr,
      vtr,
      viewability,
      avgFreq,
      audienceSize,
      targetImpr,
    };
  }, [inputs]);

  const numericValues = useMemo(() => ({
    budget: parsed.budget.isValid ? parsed.budget.value : 0,
    cpm: parsed.cpm.isValid ? parsed.cpm.value : 0,
    ctr: parsed.ctr.isValid ? parsed.ctr.value / 100 : 0,
    vtr: parsed.vtr.isValid ? parsed.vtr.value / 100 : 0,
    viewability: parsed.viewability.isValid ? parsed.viewability.value / 100 : 0,
    avgFreq: parsed.avgFreq.isValid ? parsed.avgFreq.value : 0,
    audienceSize: parsed.audienceSize.isValid ? parsed.audienceSize.value : 0,
    targetImpr: parsed.targetImpr.isValid ? Math.max(0, parsed.targetImpr.value) : 0,
  }), [parsed]);

  const customShareNumbers = useMemo(() => (
    customShares.map((value) => {
      const parsedValue = parseNumericInput(value);
      return parsedValue.isValid ? Math.max(0, parsedValue.value) : 0;
    })
  ), [customShares]);

  const customSharesSum = useMemo(() => roundTo(sumNumbers(customShareNumbers), 2), [customShareNumbers]);

  const customSharesAreValid = useMemo(() => (
    inputs.pacingMode !== 'Custom'
    || campaignDays === 0
    || Math.abs(customSharesSum - 100) <= 0.5
  ), [inputs.pacingMode, campaignDays, customSharesSum]);

  const errors = useMemo(() => {
    const messages = {};

    if (!parsed.budget.isValid) {
      messages.budget = 'Budget total doit être un nombre positif.';
    }
    if (!parsed.cpm.isValid) {
      messages.cpm = 'CPM doit être un nombre positif.';
    }
    if (!parsed.ctr.isValid) {
      messages.ctr = 'CTR doit être compris entre 0 et 100%.';
    }
    if (!parsed.vtr.isValid) {
      messages.vtr = 'VTR doit être compris entre 0 et 100%.';
    }
    if (!parsed.viewability.isValid) {
      messages.viewability = 'Viewability doit être comprise entre 0 et 100%.';
    }
    if (!parsed.avgFreq.isValid) {
      messages.avgFreq = 'Fréquence moyenne doit être > 0.';
    }
    if (!parsed.audienceSize.isValid) {
      messages.audienceSize = 'Taille d\'univers doit être > 0.';
    }
    if (rawDiffDays !== null && rawDiffDays < 0) {
      messages.dateRange = 'La date de fin doit être postérieure ou égale à la date de début.';
    }
    if (inputs.targetImpr && !parsed.targetImpr.isValid) {
      messages.targetImpr = 'Impressions cibles doit être un nombre valide.';
    }
    if (inputs.pacingMode === 'Custom' && campaignDays > 0) {
      if (!customSharesAreValid) {
        messages.customShares = `La somme des pourcentages de pacing doit faire 100% (actuellement ${customSharesSum.toFixed(2)}%).`;
      }
    }
    return messages;
  }, [parsed, rawDiffDays, inputs.pacingMode, campaignDays, customSharesAreValid, customSharesSum]);

  const hasBlockingErrors = useMemo(() => (
    Boolean(errors.budget)
    || Boolean(errors.cpm)
    || Boolean(errors.avgFreq)
    || Boolean(errors.audienceSize)
    || Boolean(errors.dateRange)
    || (inputs.pacingMode === 'Custom' && !customSharesAreValid)
  ), [errors, inputs.pacingMode, customSharesAreValid]);

  const dailyBudgets = useMemo(() => {
    if (campaignDays <= 0 || !parsed.budget.isValid) {
      return [];
    }
    if (inputs.pacingMode === 'Custom' && customSharesAreValid) {
      return distributeByWeights(parsed.budget.value, customShareNumbers);
    }
    return distributeEven(parsed.budget.value, campaignDays);
  }, [campaignDays, parsed.budget, inputs.pacingMode, customSharesAreValid, customShareNumbers]);

  const dailyImpressions = useMemo(() => {
    if (!parsed.cpm.isValid) {
      return dailyBudgets.map(() => 0);
    }
    return dailyBudgets.map((budgetForDay) => (budgetForDay / parsed.cpm.value) * 1000);
  }, [dailyBudgets, parsed.cpm]);

  const dates = useMemo(() => buildDateArray(inputs.startDate, campaignDays), [inputs.startDate, campaignDays]);

  const dateLabels = useMemo(
    () => dates.map((date) => ({ iso: formatDateISO(date), human: formatDateHuman(date) })),
    [dates],
  );

  const dailyRows = useMemo(() => {
    if (!dates.length) return [];
    const rows = [];
    let cumulativeImpressions = 0;
    let previousReach = 0;
    for (let i = 0; i < dates.length; i += 1) {
      const impressionsForDay = dailyImpressions[i] ?? 0;
      cumulativeImpressions += impressionsForDay;
      const cumulativeReach = reachFromCumulativeImpressions({
        impressions: cumulativeImpressions,
        universeSize: numericValues.audienceSize,
        averageFrequency: numericValues.avgFreq,
        model: inputs.reachModel,
      });
      const incrementalReach = Math.max(0, cumulativeReach - previousReach);
      previousReach = cumulativeReach;
      rows.push({
        date: dateLabels[i]?.iso ?? '',
        budget: dailyBudgets[i] ?? 0,
        impressions: impressionsForDay,
        incrReach: incrementalReach,
        cumReach: cumulativeReach,
      });
    }
    return rows;
  }, [dates, dailyImpressions, dailyBudgets, numericValues.audienceSize, numericValues.avgFreq, inputs.reachModel]);

  const totalImpressions = useMemo(() => sumNumbers(dailyImpressions), [dailyImpressions]);

  const metrics = useMemo(() => {
    const clicks = totalImpressions * numericValues.ctr;
    const completeViews = totalImpressions * numericValues.vtr;
    const viewableImpr = totalImpressions * numericValues.viewability;
    const reach = reachFromCumulativeImpressions({
      impressions: totalImpressions,
      universeSize: numericValues.audienceSize,
      averageFrequency: numericValues.avgFreq,
      model: inputs.reachModel,
    });
    const reachPct = safeDivide(reach, numericValues.audienceSize, 0);
    const avgFreqAmongReached = safeDivide(totalImpressions, reach, 0);
    const grps = reachPct * 100 * avgFreqAmongReached;

    return {
      impressions: totalImpressions,
      clicks,
      completeViews,
      viewableImpr,
      reach,
      reachPct,
      avgFreqAmongReached,
      grps,
      eCPC: safeDivide(numericValues.budget, clicks, 0),
      eCPCV: safeDivide(numericValues.budget, completeViews, 0),
      vCPM: safeDivide(numericValues.budget * 1000, viewableImpr, 0),
    };
  }, [totalImpressions, numericValues, inputs.reachModel]);

  const neededBudget = useMemo(() => {
    if (!parsed.cpm.isValid || !parsed.targetImpr.isValid) {
      return 0;
    }
    return (Math.max(0, parsed.targetImpr.value) * parsed.cpm.value) / 1000;
  }, [parsed.cpm, parsed.targetImpr]);

  const selfCheckResults = useMemo(() => runSelfChecks(), []);

  const updateInput = (field) => (value) => {
    setInputs((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handlePresetChange = (presetKey) => {
    setSelectedPreset(presetKey);
    const preset = PRESET_MAP.get(presetKey);
    if (preset) {
      setInputs((current) => ({
        ...current,
        audienceSize: String(preset.size),
      }));
    }
  };

  const updateAudienceSize = (value) => {
    setInputs((current) => ({
      ...current,
      audienceSize: value,
    }));
    setSelectedPreset('Custom');
  };

  const updateCustomShareAt = (index, value) => {
    setCustomShares((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  };

  const resetCustomShares = () => {
    if (campaignDays <= 0) {
      setCustomShares([]);
      return;
    }
    const evenShare = roundTo(100 / campaignDays, 2).toFixed(2);
    setCustomShares(Array.from({ length: campaignDays }, () => evenShare));
  };

  const exportCSV = () => {
    if (!dailyRows.length) return;
    const headers = ['date', 'budget', 'impressions', 'incrReach', 'cumReach'];
    const rows = dailyRows.map((row) => [
      row.date,
      row.budget.toFixed(2),
      Math.round(row.impressions),
      Math.round(row.incrReach),
      Math.round(row.cumReach),
    ].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'pacing_reach.csv';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return {
    inputs,
    updateInput,
    selectedPreset,
    handlePresetChange,
    updateAudienceSize,
    numericValues,
    customShares,
    updateCustomShareAt,
    resetCustomShares,
    customSharesSum,
    customSharesAreValid,
    campaignDays,
    rawDiffDays,
    errors,
    hasBlockingErrors,
    dailyRows,
    metrics,
    neededBudget,
    exportCSV,
    showChecks,
    setShowChecks,
    selfCheckResults,
    dateLabels,
  };
}
