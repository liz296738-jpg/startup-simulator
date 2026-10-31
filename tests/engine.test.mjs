import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, advance, getEvent, validateSave, getEnding, priorities } from '../src/engine.mjs';
import { scenarios } from '../src/content.mjs';

test('each scenario has a complete playable twelve-month loop', () => {
  for (const scenario of scenarios) {
    let game = createGame(scenario.id, '小小公司', 42);
    while (!game.ending) {
      const event = getEvent(game);
      assert.equal(event.options.length, 4);
      game = advance(game, 1, 'product');
      assert.ok(Number.isFinite(game.cash));
      assert.ok(game.customers >= 0);
      assert.ok(game.month <= 13);
    }
    assert.ok(game.history.length > 0);
    assert.equal(validateSave(JSON.parse(JSON.stringify(game))).scenario, scenario.id);
  }
});
test('decisions change the future and replay uses the same conditions', () => {
  const game = createGame('delivery', '测试', 42);
  const a = advance(game, 0, 'growth');
  const b = advance(game, 1, 'lean');
  assert.notEqual(a.cash, b.cash);
  assert.deepEqual(advance(game, 0, 'growth'), a);
  assert.equal(game.month, 1);
});
test('cash reconciles to the detailed ledger', () => {
  const initial = createGame('studio', '测试', 7);
  const next = advance(initial, 1, 'team');
  const ledger = next.history[0];
  assert.ok(Math.abs(next.cash - (initial.cash + ledger.funding - ledger.eventCost + ledger.revenue - ledger.expenses)) < 0.03);
});
test('invalid choices and priorities are rejected', () => {
  const game = createGame('studio');
  for (const choice of [-1, 4, 0.5, NaN]) assert.throws(() => advance(game, choice, 'lean'));
  assert.throws(() => advance(game, 0, '__proto__'));
  assert.throws(() => createGame('unknown'));
  assert.equal(Object.keys(priorities).length, 4);
});
test('terminal states are final and insolvency wins over the annual ending', () => {
  const game = createGame('delivery');
  game.cash = 0.1;
  const next = advance(game, 0, 'growth');
  assert.equal(next.ending, 'bankrupt');
  assert.throws(() => advance(next, 0, 'lean'));
  assert.equal(getEnding({...game, cash: -1, month: 13}), 'bankrupt');
});
test('save imports reject malformed and hostile data', () => {
  const good = createGame('studio');
  for (const bad of [null, {}, {...good, cash: '100'}, {...good, scenario: '__proto__'}, {...good, month: 99}, {...good, customers: -1}, {...good, quality: 101}, {...good, seed: NaN}, {...good, history: [{}]}]) {
    assert.throws(() => validateSave(bad));
  }
  const sanitized = validateSave({...good, apiKey: 'must-not-persist', arbitrary: '<script>'});
  assert.equal(sanitized.apiKey, undefined);
});
