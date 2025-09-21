import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseNumericInput,
  parsePositiveNumber,
  parsePercentageInput,
  parseNonNegativeNumber,
  roundTo,
  safeDivide,
  sumNumbers,
} from '../number.js';

test('parseNumericInput accepte les virgules et espaces', () => {
  const result = parseNumericInput(' 1\u00a0000,5 ');
  assert.equal(result.value, 1000.5);
  assert.equal(result.isValid, true);
});

test('parsePositiveNumber rejette zéro et négatif', () => {
  assert.equal(parsePositiveNumber('0').isValid, false);
  assert.equal(parsePositiveNumber('-3').isValid, false);
  assert.equal(parsePositiveNumber('3').isValid, true);
});

test('parsePercentageInput respecte les bornes', () => {
  assert.equal(parsePercentageInput('50').isValid, true);
  assert.equal(parsePercentageInput('150').isValid, false);
  assert.equal(parsePercentageInput('-10').isValid, false);
});

test('parseNonNegativeNumber accepte zéro mais pas négatif', () => {
  assert.equal(parseNonNegativeNumber('0').isValid, true);
  assert.equal(parseNonNegativeNumber('-1').isValid, false);
});

test('roundTo arrondit à la précision attendue', () => {
  assert.equal(roundTo(10 / 3, 2), 3.33);
});

test('safeDivide évite les divisions par zéro', () => {
  assert.equal(safeDivide(10, 2), 5);
  assert.equal(safeDivide(10, 0), 0);
});

test('sumNumbers ignore les valeurs non finies', () => {
  const sum = sumNumbers([1, 2, Number.NaN, Infinity, 3]);
  assert.equal(sum, 6);
});

