import { roundTo, sumNumbers } from './number.js';

export function poissonReachValue(impressions, universeSize) {
  const N = Math.max(1, Number.isFinite(universeSize) ? universeSize : 0);
  const impressionsSafe = Math.max(0, Number.isFinite(impressions) ? impressions : 0);
  const m = impressionsSafe / N;
  const reach = N * (1 - Math.exp(-m));
  return Math.min(N, reach);
}

export function simpleReachValue(impressions, averageFrequency, universeSize) {
  if (!Number.isFinite(impressions) || !Number.isFinite(averageFrequency) || averageFrequency <= 0) {
    return 0;
  }
  const maxReach = Number.isFinite(universeSize) && universeSize > 0 ? universeSize : Infinity;
  return Math.min(maxReach, impressions / averageFrequency);
}

export function distributeEven(total, parts) {
  if (!Number.isFinite(total) || parts <= 0) return [];
  const base = roundTo(total / parts, 2);
  const arr = Array(parts).fill(base);
  let remainder = roundTo(total - base * parts, 2);
  let i = 0;
  while (remainder > 0.009) {
    arr[i % parts] = roundTo(arr[i % parts] + 0.01, 2);
    remainder = roundTo(remainder - 0.01, 2);
    i += 1;
  }
  return arr;
}

export function distributeByWeights(total, weights) {
  if (!Number.isFinite(total) || !Array.isArray(weights) || !weights.length) {
    return [];
  }
  const normalizedWeights = weights.map((value) => (Number.isFinite(value) && value > 0 ? value : 0));
  const sum = sumNumbers(normalizedWeights);
  if (sum <= 0) {
    return distributeEven(total, weights.length);
  }
  return normalizedWeights.map((weight) => roundTo((weight / sum) * total, 2));
}

export function reachFromCumulativeImpressions({
  impressions,
  universeSize,
  averageFrequency,
  model,
}) {
  if (model === 'Simple') {
    return simpleReachValue(impressions, averageFrequency, universeSize);
  }
  return poissonReachValue(impressions, universeSize);
}

