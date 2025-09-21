import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseLocalDate,
  diffDaysInclusive,
  daysBetweenInclusive,
  buildDateArray,
  formatDateISO,
  formatDateHuman,
} from '../dates.js';

test('parseLocalDate retourne null pour valeurs invalides', () => {
  assert.equal(parseLocalDate(''), null);
  assert.equal(parseLocalDate('2025-13-01'), null);
});

test('diffDaysInclusive calcule la différence brute', () => {
  assert.equal(diffDaysInclusive('2025-01-01', '2025-01-01'), 1);
  assert.equal(diffDaysInclusive('2025-01-01', '2024-12-31'), 0);
});

test('daysBetweenInclusive renvoie 0 pour dates inversées', () => {
  assert.equal(daysBetweenInclusive('2025-01-02', '2025-01-01'), 0);
});

test('buildDateArray génère la séquence attendue', () => {
  const dates = buildDateArray('2025-01-01', 3);
  assert.equal(dates.length, 3);
  assert.equal(formatDateISO(dates[2]), '2025-01-03');
});

test('formatDateHuman renvoie une chaîne lisible', () => {
  const dates = buildDateArray('2025-01-01', 1);
  assert.match(formatDateHuman(dates[0]), /1 janv. 2025/i);
});

