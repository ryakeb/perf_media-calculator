import test from 'node:test';
import assert from 'node:assert/strict';
import {
  distributeEven,
  distributeByWeights,
  poissonReachValue,
  simpleReachValue,
  reachFromCumulativeImpressions,
} from '../reach.js';

test('distributeEven répartit sur l\'ensemble des jours', () => {
  const result = distributeEven(100, 4);
  assert.equal(result.length, 4);
  assert.equal(result.reduce((acc, value) => acc + value, 0), 100);
});

test('distributeByWeights normalise les poids', () => {
  const result = distributeByWeights(100, [50, 50, 0]);
  assert.equal(result.length, 3);
  assert.equal(result[0], result[1]);
  assert.equal(result[2], 0);
});

test('poissonReachValue plafonne à l\'univers', () => {
  const reach = poissonReachValue(1e7, 5e6);
  assert.ok(reach <= 5e6);
});

test('simpleReachValue respecte la fréquence', () => {
  const reach = simpleReachValue(1000, 2, 1000);
  assert.equal(reach, 500);
});

test('reachFromCumulativeImpressions bascule selon le modèle', () => {
  const poisson = reachFromCumulativeImpressions({
    impressions: 10000,
    universeSize: 5000,
    averageFrequency: 3,
    model: 'Poisson',
  });
  const simple = reachFromCumulativeImpressions({
    impressions: 10000,
    universeSize: 5000,
    averageFrequency: 3,
    model: 'Simple',
  });
  assert.ok(poisson >= simple);
});

