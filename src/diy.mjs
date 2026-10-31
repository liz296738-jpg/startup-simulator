const boundedText=(v,max,required=false)=>{if(typeof v!=='string'||v.trim().length>max||(required&&!v.trim()))throw Error('公司资料不完整或内容过长。');return v.trim();};
export function normalizeProfile(input){
 if(!input||typeof input!=='object')throw Error('请填写公司资料。');
 const profile={name:boundedText(input.name,24,true),idea:boundedText(input.idea,600,true),audience:boundedText(input.audience,200,true),goal:boundedText(input.goal,200,true),businessModel:input.businessModel,difficulty:input.difficulty,capital:Number(input.capital)};
 if(!['subscription','retail','service','hardware'].includes(profile.businessModel)||!['easy','normal','hard'].includes(profile.difficulty)||!Number.isFinite(profile.capital)||profile.capital<10||profile.capital>1000)throw Error('请选择经营模式、难度，并填写 10—1000 万元的启动资金。');
 return profile;
}
export function diyScenario(profile){
 const p=normalizeProfile(profile),model={subscription:{price:.025,margin:.85},retail:{price:.012,margin:.48},service:{price:.045,margin:.72},hardware:{price:.04,margin:.42}}[p.businessModel];
 const scale=p.capital/160,level={easy:1.35,normal:1,hard:.8}[p.difficulty];
 return {id:'diy',name:'我的创业故事',company:p.name,category:'DIY 自由创业',difficulty:{easy:'轻松',normal:'标准',hard:'挑战'}[p.difficulty],description:p.idea,theme:p.goal,caseIds:[],cash:p.capital,customers:Math.max(20,Math.round(250*scale*level)),price:model.price,baseCost:Math.max(.5,8*scale),margin:model.margin,quality:55,retention:55,trust:65,team:Math.max(2,Math.round(5*scale)),color:'#536dfe'};
}
export function offlineDIYEvent(g){
 const month=g.month,title=['第一笔真实订单','客户想要的与你想做的','一个重要的合作邀请','增长之后的交付压力','现金与承诺的距离','把下一步做小一点'][(month-1)%6];
 const desc=[`「${g.profile.name}」准备向${g.profile.audience}提供服务。围绕“${g.profile.idea}”，第一批客户愿意尝试，但希望你先证明能稳定交付。`,`客户提出了几种不同要求。你需要分清哪些属于“${g.profile.idea}”的核心价值，哪些会让业务变成另一门生意。`,`一位合作方想帮助你扩大客户范围，但需要你先投入资源。你的目标仍然是：${g.profile.goal}。`,`前几个月的选择让团队积累了一些承诺。客户等待交付的时间与服务能力，需要重新核对。`,`账上的资金还要支持产品、团队与客户。你需要决定哪些承诺值得继续承担。`,`这不是结束。你可以选择小规模验证、扩大投入或调整模式，让下一步产生更可靠的证据。`][(month-1)%6];
 const scale=g.profile.capital/160,c=Math.max(.1,Math.round(6*scale*100)/100);
 return {title,description:desc,category:'DIY · 离线剧情',caseId:'tiny',generated:false,options:[
 {title:'扩大投入，争取更多客户',detail:'增加规模，同时承担资金与交付压力',effects:{cost:c*3,customers:Math.max(20,Math.round(g.customers*.4)),baseCost:c*.3,quality:-4},result:'客户增加了。团队需要在下一月证明这些承诺能够兑现。'},
 {title:'先做一个范围明确的付费试点',detail:'用有限投入检验需求与交付',effects:{cost:c,quality:7,retention:5,trust:3},result:'试点提供了更多真实反馈，你对客户真正需要什么更有把握了。'},
 {title:'调整定价与服务边界',detail:'接受一部分客户离开，减少持续负担',effects:{cost:c*.5,customers:-Math.round(g.customers*.08),baseCost:-c*.25,margin:.05},result:'业务范围缩小了，剩下的承诺更容易被兑现。'},
 {title:'维持现有安排，暂不调整',detail:'少花现金，接受问题继续累积的可能',effects:{quality:-5,retention:-4,trust:-2},result:'本月没有增加投入，尚未解决的经营问题会继续影响后面。'}]};
}
