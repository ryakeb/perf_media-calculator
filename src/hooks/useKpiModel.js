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
  reachModel: 'Simple',
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

function computeModelSnapshot({ inputs, customShares, campaignDays, rawDiffDays }) {
  const parsed = {
    budget: parsePositiveNumber(inputs.budget),
    cpm: parsePositiveNumber(inputs.cpm),
    ctr: parsePercentageInput(inputs.ctr, { min: 0, max: 100 }),
    vtr: parsePercentageInput(inputs.vtr, { min: 0, max: 100 }),
    viewability: parsePercentageInput(inputs.viewability, { min: 0, max: 100 }),
    avgFreq: parsePositiveNumber(inputs.avgFreq),
    audienceSize: parsePositiveNumber(inputs.audienceSize),
    targetImpr: parseNonNegativeNumber(inputs.targetImpr),
  };

  const numericValues = {
    budget: parsed.budget.isValid ? parsed.budget.value : 0,
    cpm: parsed.cpm.isValid ? parsed.cpm.value : 0,
    ctr: parsed.ctr.isValid ? parsed.ctr.value / 100 : 0,
    vtr: parsed.vtr.isValid ? parsed.vtr.value / 100 : 0,
    viewability: parsed.viewability.isValid ? parsed.viewability.value / 100 : 0,
    avgFreq: parsed.avgFreq.isValid ? parsed.avgFreq.value : 0,
    audienceSize: parsed.audienceSize.isValid ? parsed.audienceSize.value : 0,
    targetImpr: parsed.targetImpr.isValid ? Math.max(0, parsed.targetImpr.value) : 0,
  };

  const customShareNumbers = customShares.map((value) => {
    const parsedValue = parseNumericInput(value);
    return parsedValue.isValid ? Math.max(0, parsedValue.value) : 0;
  });

  const customSharesSum = roundTo(sumNumbers(customShareNumbers), 2);

  const customSharesAreValid = inputs.pacingMode !== 'Custom'
    || campaignDays === 0
    || Math.abs(customSharesSum - 100) <= 0.5;

  const errors = {};

  if (!parsed.budget.isValid) {
    errors.budget = { key: 'errors.budgetPositive' };
  }
  if (!parsed.cpm.isValid) {
    errors.cpm = { key: 'errors.cpmPositive' };
  }
  if (!parsed.ctr.isValid) {
    errors.ctr = { key: 'errors.ctrRange' };
  }
  if (!parsed.vtr.isValid) {
    errors.vtr = { key: 'errors.vtrRange' };
  }
  if (!parsed.viewability.isValid) {
    errors.viewability = { key: 'errors.viewabilityRange' };
  }
  if (!parsed.avgFreq.isValid) {
    errors.avgFreq = { key: 'errors.avgFreqPositive' };
  }
  if (!parsed.audienceSize.isValid) {
    errors.audienceSize = { key: 'errors.audiencePositive' };
  }
  if (rawDiffDays !== null && rawDiffDays < 0) {
    errors.dateRange = { key: 'errors.dateOrder' };
  }
  if (inputs.targetImpr && !parsed.targetImpr.isValid) {
    errors.targetImpr = { key: 'errors.targetImprValid' };
  }
  if (inputs.pacingMode === 'Custom' && campaignDays > 0 && !customSharesAreValid) {
    errors.customShares = {
      key: 'errors.customShares',
      params: { sum: customSharesSum.toFixed(2) },
    };
  }

  const hasBlockingErrors = Boolean(errors.budget)
    || Boolean(errors.cpm)
    || Boolean(errors.avgFreq)
    || Boolean(errors.audienceSize)
    || Boolean(errors.dateRange)
    || (inputs.pacingMode === 'Custom' && !customSharesAreValid);

  const dailyBudgets = (() => {
    if (campaignDays <= 0 || !parsed.budget.isValid) {
      return [];
    }
    if (inputs.pacingMode === 'Custom' && customSharesAreValid) {
      return distributeByWeights(parsed.budget.value, customShareNumbers);
    }
    return distributeEven(parsed.budget.value, campaignDays);
  })();

  const dailyImpressions = parsed.cpm.isValid
    ? dailyBudgets.map((budgetForDay) => (budgetForDay / parsed.cpm.value) * 1000)
    : dailyBudgets.map(() => 0);

  const dates = buildDateArray(inputs.startDate, campaignDays);
  const dateLabels = dates.map((date) => ({ iso: formatDateISO(date), human: formatDateHuman(date) }));

  const dailyRows = (() => {
    if (!dates.length) {
      return [];
    }
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
  })();

  const totalImpressions = sumNumbers(dailyImpressions);
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

  const metrics = {
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

  const neededBudget = (!parsed.cpm.isValid || !parsed.targetImpr.isValid)
    ? 0
    : (Math.max(0, parsed.targetImpr.value) * parsed.cpm.value) / 1000;

  return {
    parsed,
    numericValues,
    customShareNumbers,
    customSharesSum,
    customSharesAreValid,
    errors,
    hasBlockingErrors,
    dailyBudgets,
    dailyImpressions,
    dates,
    dateLabels,
    dailyRows,
    metrics,
    neededBudget,
  };
}

function runSelfChecks() {
  const results = [];
  const close = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;

  const diffSameDay = daysBetweenInclusive('2025-09-01', '2025-09-01') === 1;
  const diffThreeDay = daysBetweenInclusive('2025-09-01', '2025-09-03') === 3;
  results.push({ name: 'tests.names.daysBetweenSameDay', ok: diffSameDay });
  results.push({ name: 'tests.names.daysBetweenThreeDays', ok: diffThreeDay });

  const dist = distributeEven(100, 3);
  const sumDist = roundTo(sumNumbers(dist), 2);
  results.push({ name: 'tests.names.distributeEvenSum', ok: sumDist === 100 });
  results.push({ name: 'tests.names.distributeEvenLength', ok: dist.length === 3 });

  const impressions = (10000 / 12) * 1000;
  results.push({ name: 'tests.names.baseImpressions', ok: close(impressions, 833333.3333333334) });

  const poissonReach = poissonReachValue(impressions, 5000000);
  results.push({ name: 'tests.names.poissonReachRange', ok: poissonReach > 750000 && poissonReach < 800000 });

  const reachPct = poissonReach / 5000000;
  const freqObs = impressions / poissonReach;
  const grpsA = reachPct * 100 * freqObs;
  const grpsB = (100 * impressions) / 5000000;
  results.push({ name: 'tests.names.poissonGrpIdentity', ok: close(grpsA, grpsB, 1e-9) });

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

  const {
    numericValues,
    customSharesSum,
    customSharesAreValid,
    errors,
    hasBlockingErrors,
    dailyRows,
    metrics,
    neededBudget,
    dateLabels,
  } = computeModelSnapshot({ inputs, customShares, campaignDays, rawDiffDays });

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
