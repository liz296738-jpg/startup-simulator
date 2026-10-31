import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/engine.mjs';
import { buildGameContext } from '../src/context.mjs';
test('AI sees current evidence and options but cannot read future results or hidden effects',()=>{
 const context=JSON.parse(buildGameContext(createGame('delivery')));
 assert.equal(context.当前.现金,180);
 assert.equal(context.本月事件.选项.length,4);
 assert.equal(context.本月事件.选项[0].effects,undefined);
 assert.equal(context.本月事件.选项[0].result,undefined);
 assert.ok(!JSON.stringify(context).includes('conditionalFunding'));
 assert.ok(!JSON.stringify(context).includes('订单明显增加'));
});
