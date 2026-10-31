import test from 'node:test';import assert from 'node:assert/strict';
import {createDIYGame,advance,getEvent,validateSave,continueDIY,attachStoryEvent,applyCustomChoice} from '../src/engine.mjs';
import {normalizeStory,normalizeCustomAction} from '../src/story-schema.mjs';
const profile={name:'雨天咖啡',idea:'为附近上班族提供预订咖啡和午间短休空间',audience:'周边写字楼的上班族',businessModel:'retail',goal:'经营一家稳定盈利的小店',capital:80,difficulty:'normal'};
const draft={title:'写字楼的第一份订单',description:'隔壁公司希望每天订咖啡，但要求更低价格和固定送达时间。你必须确认是否值得承担额外配送。',chapter:'邻里的第一份信任',characters:[{name:'林经理',role:'客户',stance:'希望用团购降低员工早餐成本'}],threads:['送达时间能否保持稳定'],options:[{title:'先试送一周',detail:'小规模验证路线和备货',approach:'validate',result:'试点帮你看清了真实备货需求。'},{title:'直接签全楼合同',detail:'增加订单也增加承诺',approach:'expand',result:'订单增长，配送压力增加。'},{title:'提高起订量',detail:'聚焦有贡献的订单',approach:'efficiency',result:'一部分客户退出，路线更集中。'},{title:'暂不接团购',detail:'保留现有工作节奏',approach:'wait',result:'团购暂缓，门店仍服务现有客户。'}]};
test('DIY profile becomes a playable company with scaled costs',()=>{
 let g=createDIYGame(profile,42);assert.equal(g.scenario,'diy');assert.equal(g.cash,80);assert.equal(g.horizon,24);assert.equal(getEvent(g).options.length,4);
 const next=advance(g,1,'product');assert.notEqual(next.cash,g.cash);assert.equal(next.history.length,1);
 assert.equal(validateSave(JSON.parse(JSON.stringify(next))).profile.idea,profile.idea);
});
test('generated story uses bounded rules and caches without changing finances',()=>{
 const g=createDIYGame(profile,42),story=normalizeStory(draft,g),next=attachStoryEvent(g,story);
 assert.equal(next.cash,g.cash);assert.equal(next.month,1);assert.equal(getEvent(next).title,draft.title);
 assert.ok(story.options.every(o=>(o.effects.cost||0)<=g.profile.capital*0.3));
 assert.deepEqual(getEvent(validateSave(next)),story);
 const played=advance(next,0,'lean');assert.equal(played.history[0].storyChapter,draft.chapter);assert.equal(played.storyMemory.length,1);
 assert.throws(()=>attachStoryEvent(next,story),/已经生成/);
});
test('malformed AI payload cannot change money or inject arbitrary effects',()=>{
 const g=createDIYGame(profile),bad={...draft,options:[{...draft.options[0],approach:'give_me_money',effects:{funding:1e10}},...draft.options.slice(1)]};
 assert.throws(()=>normalizeStory(bad,g));assert.throws(()=>normalizeStory({...draft,options:[]},g));
 const safe=normalizeStory({...draft,options:draft.options.map(o=>({...o,effects:{funding:1e10}}))},g);
 assert.ok(!JSON.stringify(safe).includes('10000000000'));
 assert.throws(()=>createDIYGame({...profile,capital:-1}));
 assert.throws(()=>validateSave({...g,storyEvents:{1:bad}}));
});
test('player-written actions become bounded choices and enter the next-month history',()=>{
 const g=createDIYGame(profile),choice=normalizeCustomAction({title:'和隔壁公司商量预付试点',detail:'限定时间和交付范围',approach:'sales',result:'对方接受范围明确的预付试点。'},g);
 const next=applyCustomChoice(g,choice,'先向附近一家公司试卖一周的咖啡', 'lean');
 assert.equal(next.month,2);assert.match(next.history[0].choice,/自拟/);assert.ok(next.history[0].playerAction);
 assert.equal(validateSave(next).history[0].playerAction,'先向附近一家公司试卖一周的咖啡');
});
test('DIY can continue another year after a surviving season, including save roundtrip',()=>{
 const g=createDIYGame(profile);g.month=25;g.horizon=24;g.ending='survived';
 const next=continueDIY(g);assert.equal(next.horizon,36);assert.equal(next.ending,null);
 assert.throws(()=>continueDIY({...g,ending:'bankrupt'}));
});
