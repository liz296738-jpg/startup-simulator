import test from 'node:test';
import assert from 'node:assert/strict';
import {cases,scenarios} from '../src/content.mjs';
test('100 distinct case cards retain actual sources and substantive notes',()=>{
 assert.equal(cases.length,100);
 assert.equal(new Set(cases.map(c=>c.name.toLowerCase())).size,100);
 for(const c of cases){assert.ok(c.source.startsWith('https://www.loot-drop.io/'));assert.ok(c.summary.length>25);assert.ok(c.question.length>10);assert.ok(c.status);}
});
test('20 unique playable stories reference included cases',()=>{
 assert.equal(scenarios.length,20);assert.equal(new Set(scenarios.map(s=>s.id)).size,20);
 for(const s of scenarios){assert.ok(s.caseIds.length);assert.ok(s.caseIds.every(id=>cases.some(c=>c.id===id)));}
});
