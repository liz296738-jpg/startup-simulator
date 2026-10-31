const approaches=['validate','expand','sales','efficiency','pivot','reputation','raise','hire','wait'];
function text(value,max,min=1){if(typeof value!=='string'||value.trim().length<min||value.length>max)throw Error('AI 剧情格式不完整，请重新生成或使用离线事件。');return value.trim();}
function effectsFor(type,g){
 if(!approaches.includes(type))throw Error('AI 提供了不支持的行动类型，请重试。');
 const cash=g.profile.capital,scale=cash/160,users=g.customers,amount=f=>Math.round(cash*f*100)/100;
 return {
 validate:{cost:amount(.035),quality:6,retention:5,trust:3},
 expand:{cost:amount(.14),customers:Math.max(20,Math.round(users*.35)),baseCost:Math.round(2*scale*100)/100,quality:-4,retention:-2},
 sales:{cost:amount(.025),customers:Math.max(15,Math.round(users*.18)),trust:2},
 efficiency:{cost:amount(.03),customers:-Math.round(users*.06),baseCost:-Math.max(.1,2*scale),margin:.06},
 pivot:{cost:amount(.08),customers:-Math.round(users*.18),quality:5,retention:8,margin:.08},
 reputation:{cost:amount(.06),trust:12,quality:4},
 raise:{cost:amount(.02),conditionalFunding:amount(.4),equity:-8,trust:1},
 hire:{cost:amount(.03),baseCost:Math.round(2.5*scale*100)/100,team:1,quality:8,retention:2},
 wait:{quality:-4,retention:-3,trust:-2}
 }[type];
}
export function normalizeCustomAction(raw,g){
 if(!g?.profile)throw Error('只有 DIY 公司可以使用 AI 行动。');
 if(!raw||typeof raw!=='object')throw Error('AI 行动格式异常，请重试。');
 const approach=text(raw.approach,20);
 return {title:text(raw.title,60),detail:text(raw.detail,180),result:text(raw.result,600),approach,effects:effectsFor(approach,g)};
}
export function normalizeStory(raw,g){
 if(!raw||typeof raw!=='object'||!Array.isArray(raw.options)||raw.options.length!==4)throw Error('AI 必须生成四个可执行选项，请重试或使用离线事件。');
 if(!Array.isArray(raw.characters)||raw.characters.length>4||!Array.isArray(raw.threads)||raw.threads.length>5)throw Error('AI 剧情记忆格式异常，请重试。');
 return {title:text(raw.title,70),description:text(raw.description,1500,20),chapter:text(raw.chapter,100),category:'DIY · AI 原创剧情',caseId:'tiny',generated:true,characters:raw.characters.map(c=>({name:text(c.name,30),role:text(c.role,60),stance:text(c.stance,200)})),threads:raw.threads.map(t=>text(t,200)),options:raw.options.map(o=>normalizeCustomAction(o,g))};
}
export function parseAIJSON(value){
 if(typeof value!=='string'||value.length>30000)throw Error('AI 返回内容过长或格式异常。');
 try{return JSON.parse(value.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''));}catch{throw Error('AI 返回的剧情无法读取，请重试或改用离线事件。');}
}
