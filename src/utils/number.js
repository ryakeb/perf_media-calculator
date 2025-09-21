const COMMA_REGEX = /,/g;
const SPACE_REGEX = /[\s\u00a0]/g;

function normalizeNumericString(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim().replace(SPACE_REGEX, '').replace(COMMA_REGEX, '.');
}

export function parseNumericInput(value) {
  const normalized = normalizeNumericString(value);
  if (normalized === '') {
    return { value: NaN, isValid: false };
  }

  const parsed = Number(normalized);
  if (Number.isFinite(parsed)) {
    return { value: parsed, isValid: true };
  }

  return { value: NaN, isValid: false };
}

export function parsePositiveNumber(value) {
  const result = parseNumericInput(value);
  if (!result.isValid || result.value <= 0) {
    return { value: NaN, isValid: false };
  }
  return result;
}

export function parsePercentageInput(value, { min = 0, max = 100 } = {}) {
  const result = parseNumericInput(value);
  if (!result.isValid) {
    return { value: NaN, isValid: false };
  }

  if (result.value < min || result.value > max) {
    return { value: result.value, isValid: false };
  }

  return result;
}

export function sumNumbers(values) {
  return values.reduce((acc, current) => acc + (Number.isFinite(current) ? current : 0), 0);
}

export function parseNonNegativeNumber(value) {
  const result = parseNumericInput(value);
  if (!result.isValid || result.value < 0) {
    return { value: NaN, isValid: false };
  }
  return result;
}

export function roundTo(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function safeDivide(numerator, denominator, fallback = 0) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return fallback;
  }
  return numerator / denominator;
}
