import { scenarios, commonEvents, scenarioEvent } from './content.mjs';
import {normalizeProfile,diyScenario,offlineDIYEvent} from './diy.mjs';
import {normalizeStory,normalizeCustomAction} from './story-schema.mjs';
export const priorities = {
 lean:{name:'现金优先',label:'控制开支，减少承诺',cost:1,quality:-2,growth:-0.015,retention:0},
 product:{name:'打磨产品',label:'修复体验，提升留存',cost:6,quality:4,growth:0.01,retention:2},
 growth:{name:'市场增长',label:'付费获客，扩大规模',cost:12,quality:-1,growth:0.14,retention:-1},
 team:{name:'团队建设',label:'改善协作，稳定交付',cost:5,quality:3,growth:0.015,retention:1}
};
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const round=v=>Math.round(v*100)/100;
export function createGame(id='studio', name='', seed=Date.now()%1000000) {
 const s=scenarios.find(s=>s.id===id); if(!s) throw Error('剧本不存在');
 return {version:1,scenario:id,name:String(name||s.company).trim().slice(0,24)||s.company,seed:Math.abs(Math.trunc(seed))%1000000,month:1,cash:s.cash,customers:s.customers,price:s.price,baseCost:s.baseCost,margin:s.margin,quality:s.quality,retention:s.retention,trust:s.trust,team:s.team,equity:100,history:[],ending:null};
}
export function scenarioFor(g){return g.scenario==='diy'?diyScenario(g.profile):scenarios.find(s=>s.id===g.scenario);}
export function createDIYGame(profile,seed=Date.now()%1000000){
 const p=normalizeProfile(profile),s=diyScenario(p);
 return {version:1,scenario:'diy',name:p.name,profile:p,horizon:24,storyEvents:{},storyMemory:[],seed:Math.abs(Math.trunc(seed))%1000000,month:1,cash:s.cash,customers:s.customers,price:s.price,baseCost:s.baseCost,margin:s.margin,quality:s.quality,retention:s.retention,trust:s.trust,team:s.team,equity:100,history:[],ending:null};
}
export function getPriorities(g){const scale=g?.scenario==='diy'?Math.max(.05,Math.min(3,g.profile.capital/160)):1;return Object.fromEntries(Object.entries(priorities).map(([id,p])=>[id,{...p,cost:round(p.cost*scale)}]));}
export function getEvent(g) {return g.scenario==='diy'?(g.storyEvents?.[g.month]||offlineDIYEvent(g)):(commonEvents[g.month] || scenarioEvent(g.scenario,g.month));}
export function attachStoryEvent(original,event){
 if(original.scenario!=='diy'||original.ending)throw Error('请先创建一家经营中的 DIY 公司。');
 if(original.storyEvents?.[original.month])throw Error('本月剧情已经生成，不会重复调用。');
 const g=structuredClone(original);g.storyEvents[g.month]=normalizeStory(event,g);return g;
}
export function continueDIY(original){
 if(original.scenario!=='diy'||!['profitable','survived','fragile'].includes(original.ending)||original.horizon>=120)throw Error('当前结局不能继续经营。');
 const g=structuredClone(original);g.horizon=Math.min(120,g.horizon+12);g.ending=null;return g;
}
export function getEnding(g) {
 if(g.cash<=0)return 'bankrupt';
 if(g.trust<=5)return 'trust';
 if(g.month>(g.horizon||12)){
 const profit=g.history.at(-1)?.profit??0;
 return profit>=3?'profitable':g.cash>=50?'survived':'fragile';
 }
 return null;
}
export function forecast(g) {
 const revenue=round(g.customers*g.price);
 const cost=round(g.baseCost+revenue*(1-g.margin));
 const burn=Math.max(0,cost+getPriorities(g).product.cost-revenue);
 return {revenue,cost,burn:round(burn),runway:burn>0?round(g.cash/burn):null};
}
export function advance(original,choice,priority='product') {
 if(original.ending)throw Error('本局已结束');
 if(!Number.isInteger(choice)||choice<0||choice>3||!Object.hasOwn(priorities,priority))throw Error('无效的决策');
 const g=structuredClone(original),e=getEvent(g),o=e.options[choice],f=o.effects,p=getPriorities(g)[priority];
 const funding=(f.funding||0)+((f.conditionalFunding&&g.trust>=60&&g.customers>=(g.profile?Math.max(20,Math.round(scenarioFor(g).customers*.8)):650))?f.conditionalFunding:0);
 const funded=!!f.conditionalFunding&&funding>0;
 g.cash+=funding-(f.cost||0);
 for(const key of ['customers','baseCost','quality','retention','trust','team','margin'])g[key]+=f[key]||0;
 if(funded)g.equity=clamp(g.equity+(f.equity||0),0,100);
 g.baseCost=Math.max(g.profile?Math.max(.1,g.profile.capital*.003):5,g.baseCost);g.team=clamp(g.team,2,100);g.margin=clamp(g.margin,0.08,0.96);
 g.quality=clamp(g.quality+p.quality,0,100);g.retention=clamp(g.retention+p.retention,5,98);g.trust=clamp(g.trust,0,100);
 const market=(((g.seed+g.month*137)%101)/100-0.5)*0.06;
 const growth=p.growth+(g.quality-50)*0.0015+(g.retention-60)*0.002+(g.trust-60)*0.001+market;
 g.customers=Math.max(0,Math.round(Math.max(0,g.customers)*(1+growth)));
 const revenue=round(g.customers*g.price),expenses=round(g.baseCost+p.cost+revenue*(1-g.margin)),profit=round(revenue-expenses);
 g.cash=round(g.cash+profit);
 const result=o.result+(f.conditionalFunding?(funded?` 融资 ${funding} 万元到账，股权稀释 ${-f.equity}%。`:' 本轮未达到客户与信任条件，没有获得融资，也未稀释股权。'):'');
 g.history.push({month:g.month,title:e.title,choice:o.title,priority:p.name,revenue,expenses,profit,eventCost:f.cost||0,funding,cash:g.cash,customers:g.customers,quality:g.quality,retention:g.retention,trust:g.trust,result,caseId:e.caseId});
 if(g.scenario==='diy'){
  if(e.generated){g.history.at(-1).storyChapter=e.chapter;g.storyMemory.push({month:g.month,chapter:e.chapter,decision:o.title,result,characters:e.characters,threads:e.threads});g.storyMemory=g.storyMemory.slice(-12);}
  else {g.storyMemory.push({month:g.month,chapter:e.title,decision:o.title,result,characters:[],threads:[]});g.storyMemory=g.storyMemory.slice(-12);}
 }
 g.month++; g.ending=getEnding(g)||(f.exit?'closed':null);
 return g;
}
export function applyCustomChoice(original,raw,playerAction,priority='product'){
 if(original.scenario!=='diy'||original.ending||typeof playerAction!=='string'||!playerAction.trim()||playerAction.length>1000)throw Error('请填写 1—1000 字的自拟行动。');
 const g=structuredClone(original),event=structuredClone(getEvent(g)),choice=normalizeCustomAction(raw,g);
 event.options[0]={...choice,title:('自拟：'+choice.title).slice(0,60)};if(!event.generated)event.customAction=true;g.storyEvents[g.month]=event;
 const next=advance(g,0,priority);next.history.at(-1).playerAction=playerAction.trim();return next;
}
export function validateSave(v) {
 const invalid=()=>{throw Error('存档格式不正确或版本不兼容，请选择本游戏导出的 JSON 存档。');};
 if(!v||v.version!==1||!(v.scenario==='diy'||scenarios.some(s=>s.id===v.scenario))||typeof v.name!=='string'||v.name.length>24)invalid();
 const isDIY=v.scenario==='diy';
 const ranges={seed:[0,999999],month:[1,isDIY?121:13],cash:[-1e8,1e9],customers:[0,1e8],price:[0.001,10],baseCost:[isDIY?.1:5,1e5],margin:[0.08,0.96],quality:[0,100],retention:[5,98],trust:[0,100],team:[2,100],equity:[0,100]};
 for(const [key,[min,max]]of Object.entries(ranges))if(typeof v[key]!=='number'||!Number.isFinite(v[key])||v[key]<min||v[key]>max)invalid();
 if(!Number.isInteger(v.month)||!Number.isInteger(v.seed)||!Number.isInteger(v.customers))invalid();
 if(!Array.isArray(v.history)||v.history.length!==v.month-1)invalid();
 if(![null,'bankrupt','trust','profitable','survived','fragile','closed'].includes(v.ending))invalid();
 if(!isDIY&&v.month===13&&!v.ending)invalid();
 const history=v.history.map((h,i)=>{
  if(!h||h.month!==i+1)invalid();
  const result={month:h.month};
  for(const key of ['title','choice','priority','result','caseId']){if(typeof h[key]!=='string'||h[key].length>1200)invalid();result[key]=h[key];}
  for(const key of ['revenue','expenses','profit','eventCost','funding','cash','customers','quality','retention','trust']){if(typeof h[key]!=='number'||!Number.isFinite(h[key])||Math.abs(h[key])>1e9)invalid();result[key]=h[key];}
  for(const key of ['storyChapter','playerAction'])if(h[key]!==undefined){if(typeof h[key]!=='string'||h[key].length>1200)invalid();result[key]=h[key];}
  return result;
 });
 const clean={version:1,scenario:v.scenario,name:v.name,history,ending:v.ending};
 for(const key of Object.keys(ranges))clean[key]=v[key];
 if(isDIY){
  clean.profile=normalizeProfile(v.profile);
  if(!Number.isInteger(v.horizon)||v.horizon<24||v.horizon>120||v.month>v.horizon+1||(v.month===v.horizon+1&&!v.ending))invalid();
  clean.horizon=v.horizon;clean.storyEvents={};
  if(!v.storyEvents||typeof v.storyEvents!=='object'||Object.keys(v.storyEvents).length>120)invalid();
  for(const [month,event] of Object.entries(v.storyEvents)){if(!/^\d+$/.test(month)||Number(month)<1||Number(month)>v.month)invalid();
   // Recreate rule-derived effects with the state used when generating that month's choices.
   const state={...clean,customers:Number(month)===1?diyScenario(clean.profile).customers:history[Number(month)-2]?.customers??clean.customers};
   if(event.generated)clean.storyEvents[month]=normalizeStory(event,state);
   else if(event.customAction){const fallback=offlineDIYEvent({...state,month:Number(month)});fallback.options[0]=normalizeCustomAction(event.options?.[0],state);fallback.customAction=true;clean.storyEvents[month]=fallback;}
   else invalid();
  }
  if(!Array.isArray(v.storyMemory)||v.storyMemory.length>12)invalid();
  clean.storyMemory=v.storyMemory.map(m=>{if(!m||!Number.isInteger(m.month)||m.month<1||m.month>=v.month||typeof m.chapter!=='string'||m.chapter.length>100||typeof m.decision!=='string'||m.decision.length>120||typeof m.result!=='string'||m.result.length>1200||!Array.isArray(m.characters)||m.characters.length>4||!Array.isArray(m.threads)||m.threads.length>5)invalid();return {month:m.month,chapter:m.chapter,decision:m.decision,result:m.result,characters:m.characters.map(c=>{if(!c||typeof c.name!=='string'||c.name.length>30||typeof c.role!=='string'||c.role.length>60||typeof c.stance!=='string'||c.stance.length>200)invalid();return {name:c.name,role:c.role,stance:c.stance};}),threads:m.threads.map(t=>{if(typeof t!=='string'||t.length>200)invalid();return t;})};});
 }
 return clean;
}
export const endings={
 profitable:{label:'活下来，也赚到了',subtitle:'规模不是唯一的答案。你开始用收入支撑自己的选择。',color:'#25b69b'},
 survived:{label:'把选择留给明天',subtitle:'你保住了资金和团队，下一步仍需找到可持续的盈利路径。',color:'#536dfe'},
 fragile:{label:'穿过这一年',subtitle:'公司还在，但资金空间已经很小。活着只是下一阶段的起点。',color:'#e9a94b'},
 bankrupt:{label:'资金跑道，到这里结束',subtitle:'支出先于收入抵达。回看最早的承诺，也许能找到另一条路。',color:'#dc7180'},
 trust:{label:'信任无法继续透支',subtitle:'客户不再相信交付。资金之外，还有一张更难修复的资产负债表。',color:'#dc7180'},
 closed:{label:'有序退场，也是决定',subtitle:'你停止继续下注，留下了现金、教训，以及重新开始的可能。',color:'#7094ad'}
};
