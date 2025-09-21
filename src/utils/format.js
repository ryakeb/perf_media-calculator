const INTL_NUMBER = new Intl.NumberFormat('fr-BE');

export function formatInt(value) {
  if (!Number.isFinite(value)) return '0';
  return INTL_NUMBER.format(Math.round(value));
}

export function formatPct(value, fractionDigits = 2) {
  if (!Number.isFinite(value)) return '0%';
  const pct = (value * 100).toFixed(fractionDigits);
  return `${pct}%`;
}

export function formatCurrency(value, currencySymbol = '€', fractionDigits = 2) {
  if (!Number.isFinite(value)) {
    return `${currencySymbol}0.00`;
  }
  return `${currencySymbol}${value.toFixed(fractionDigits)}`;
}

