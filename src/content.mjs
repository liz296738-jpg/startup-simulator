import {expandedCases} from './case-expansion.mjs';
import {extraScenarios,expandedScenarioEvent} from './scenario-expansion.mjs';
const source = slug => `https://www.loot-drop.io/startup/${slug}`;
export const cases = [
  {id:'tiny', name:'Tiny Speck / Glitch', sector:'游戏与内容', tag:'需求验证', icon:'G', color:'#7465d5', source:source('638-tiny-speck'), status:'产品关闭后转型', summary:'Tiny Speck 的游戏 Glitch 没能形成足够大的持续用户群；团队后来将内部协作工具发展为 Slack。它提醒我们：一个产品失败，不等于团队所有积累都失去价值。', signal:'有人喜欢你的产品，与有足够多的人持续使用，是两件不同的事。', question:'如果核心产品增长停滞，你会如何判断内部工具是否值得独立出来？', lesson:'给核心需求设验证期限，同时记录团队已经解决、别人也愿意付费的问题。', rebuild:'先为一个明确的工作场景提供协作工具，以付费试点判断需求。'},
  {id:'koji', name:'Koji', sector:'工具与平台', tag:'竞争壁垒', icon:'K', color:'#5277b9', source:source('284-koji'), status:'来源存在矛盾 · 待核实', summary:'LOOTDROP 将 Koji 作为无代码创作平台的竞争案例，强调平台定位问题。但其页面对年份与运营状态的描述不一致，本版不把这些描述当作已核实的公司结局。', signal:'“人人都能用”的平台，可能无法说明第一批付费用户究竟是谁。', question:'当大平台补齐你的核心功能，你的客户为什么还要留下？', lesson:'把竞争分析落在具体工作流程、迁移成本和客户关系上，而不是功能数量。', rebuild:'为单一行业提供模板、服务和工作流，用持续付费验证差异。'},
  {id:'reality', name:'Reality Hunt', sector:'硬件与沉浸体验', tag:'市场时机', icon:'R', color:'#339f9a', source:source('1885-reality-hunt'), status:'LOOTDROP 条目 · 待独立核实', summary:'该条目描述了一项面向消费者的 AR 探索，将问题归于用户接受程度与产品投入的错位。本版把它作为网站观点呈现，不将条目中的融资及年份作为定论。', signal:'演示效果让人惊叹，但客户缺少使用设备或重复使用的理由。', question:'你能否在购买专用硬件之前，让客户先验证体验价值？', lesson:'先检验使用条件是否成熟，再决定是否承担自研硬件投入。', rebuild:'从已有手机能够运行的小型付费体验开始。'},
  {id:'virtual', name:'Virtual Arts', sector:'硬件与沉浸体验', tag:'平台依赖', icon:'V', color:'#bc7762', source:source('2470-virtual-arts'), status:'LOOTDROP 条目 · 待独立核实', summary:'LOOTDROP 将它描述为 VR 文化体验案例：制作内容需要持续投入，用户却受设备门槛限制。这里采用的是网站提出的风险情境，不据此认定该企业的全部真实历史。', signal:'每增加一件内容都很昂贵，而能打开它的用户仍然很少。', question:'你的市场规模，是潜在感兴趣的人，还是实际拥有设备且愿意付款的人？', lesson:'把可触达、可使用、愿付费的人数分别估算。', rebuild:'测试普通浏览器版本与学校团体采购，分别检验触达和付费。'},
  {id:'gigs', name:'Gigs Live', sector:'游戏与内容', tag:'竞争壁垒', icon:'L', color:'#9c6a9c', source:source('907-gigs-live'), status:'LOOTDROP 条目 · 待独立核实', summary:'LOOTDROP 将 Gigs Live 列为互动产品领域的竞争案例。本版用它引出内容产品的分发难题，不复述未经独立核实的财务数字。', signal:'产品可以上线，但稳定触达观众的渠道不一定属于你。', question:'失去一个主要分发渠道，你还能联系到付费客户吗？', lesson:'分别测量内容吸引力、获客成本与重复付费，不用播放量代替收入。', rebuild:'从一个小型社群的付费内容开始，建立可持续触达的客户关系。'},
  {id:'outcome', name:'Outcome Health', sector:'医疗与合规', tag:'信任与合规', icon:'O', color:'#bd6b75', source:'https://www.loot-drop.io/deep-dive/interactive', status:'网站分析 · 需结合原始资料', summary:'LOOTDROP 的行业分析以 Outcome Health 提醒读者关注广告交付数据与客户信任。模拟器只提炼“报告必须可验证”这一经营问题，具体法律事实应查原始文书。', signal:'销售承诺跑在真实交付能力前面，报表越来越难以对账。', question:'发现交付数据不准确时，你会主动披露还是继续接受续费？', lesson:'保留可审计的交付记录，把客户承诺与实际能力对齐。', rebuild:'从能够验证效果的有限试点开始，而不是追求无法证明的覆盖规模。'},
  {id:'tellme', name:'Tellme', sector:'工具与平台', tag:'平台依赖', icon:'T', color:'#5d88a0', source:'https://www.loot-drop.io/deep-dive/interactive', status:'收购与产品演变 · 非简单倒闭', summary:'LOOTDROP 将 Tellme 放入互动产品的竞争讨论。收购、服务终止和企业破产不是同一件事，本版不把该分类简单解释为“公司倒闭”。', signal:'独立产品的能力，可能成为大平台免费提供的一项功能。', question:'如果平台将同类功能免费打包，你卖出的独立价值是什么？', lesson:'区分技术能力、独立产品与最终付费场景。', rebuild:'聚焦对可靠性、集成或服务有明确要求的专业场景。'},
  {id:'club', name:'Club Penguin', sector:'游戏与内容', tag:'持续运营', icon:'C', color:'#5688b3', source:'https://www.loot-drop.io/deep-dive/interactive', status:'产品停运 · 非简单创业失败', summary:'LOOTDROP 将 Club Penguin 纳入互动产品分析。游戏停运不能直接等同于企业破产；本版借此讨论在线社区的内容成本和产品生命周期。', signal:'老用户仍有感情，但维护和更新的成本不会自动下降。', question:'你如何在服务现有用户和寻找下一代产品之间分配资源？', lesson:'同时观察社区活跃、重复付费与维护成本，并提前设计退出安排。', rebuild:'验证规模更小、更新成本可承担的社区服务。'},
  {id:'qwiki', name:'Qwiki', sector:'游戏与内容', tag:'需求验证', icon:'Q', color:'#b18a4f', source:'https://www.loot-drop.io/startup/481-qwiki', status:'目录索引可见 · 详情未核实', summary:'Qwiki 出现在 LOOTDROP 的互动产品目录。本次未能读取详情，因此仅保留索引与来源链接，不填充推测的融资、失败原因或经营时间线。', signal:'阅读案例时，先确认哪些事实有出处，哪些只是解释。', question:'如果缺少用户留存数据，你会用什么小实验降低判断的不确定性？', lesson:'对资料缺口保留空白，比编出完整故事更有用。', rebuild:'先收集产品历史与用户行为证据，再讨论新的创业方向。'},
  {id:'webvan', name:'Webvan', sector:'零售与配送', tag:'过早扩张', icon:'W', color:'#508c79', source:'https://www.loot-drop.io/startup/732-webvan', status:'参考索引 · 财务数据未收录', summary:'Webvan 是网络生鲜配送的早期案例。本版将“仓配投入先于需求验证”作为原创经营题目；LOOTDROP 详情本次未读取成功，因此不录入其未核实的金额与时间线。', signal:'新仓库的固定支出已经发生，但订单密度还没有达到预期。', question:'扩张前，你需要一个城市的哪些经营证据？', lesson:'把一个地区的履约成本算清楚，再验证这个模型能否复制。', rebuild:'先做单一区域试点，使用按量付费的基础设施。'}
,...expandedCases];

export const scenarios = [
  {id:'delivery', name:'最后一公里', company:'邻里鲜送', category:'零售与配送', difficulty:'进阶', icon:'↗', color:'#249e87', hook:'订单翻倍了，为什么钱更少了？', description:'接手一家社区配送公司，在补贴、配送效率与跨城扩张之间做选择。', caseIds:['webvan','virtual'], cash:180, customers:1300, price:0.012, baseCost:16, margin:0.42, quality:54, retention:65, trust:72, team:10, theme:'单位经济与扩张'},
  {id:'studio', name:'下一个爆款', company:'微光工作室', category:'游戏与内容', difficulty:'入门', icon:'✳', color:'#7968c6', hook:'大家都说好玩，却没有人留下。', description:'你有一款受少数人喜爱的游戏，也有一个团队天天使用的内部工具。', caseIds:['tiny','club','gigs'], cash:160, customers:900, price:0.018, baseCost:12, margin:0.8, quality:68, retention:45, trust:68, team:7, theme:'需求验证与转型'},
  {id:'platform', name:'巨头的下一步', company:'轻搭科技', category:'工具与平台', difficulty:'进阶', icon:'⌘', color:'#5277b9', hook:'你最得意的功能，被免费了。', description:'为创作者提供无代码工具；大平台、定制客户与渠道规则都在挤压你。', caseIds:['koji','tellme'], cash:170, customers:800, price:0.022, baseCost:14, margin:0.85, quality:57, retention:58, trust:70, team:8, theme:'差异化与平台依赖'},
  {id:'hardware', name:'未来提前到场', company:'远景实验室', category:'硬件与沉浸体验', difficulty:'挑战', icon:'◇', color:'#c08a50', hook:'技术已经实现，市场还没准备好。', description:'打造沉浸式体验，决定继续自研硬件，还是先用现有设备交付价值。', caseIds:['reality','virtual'], cash:220, customers:400, price:0.035, baseCost:21, margin:0.58, quality:73, retention:48, trust:65, team:12, theme:'市场时机与资本投入'},
  {id:'health', name:'信任的价格', company:'明证健康', category:'医疗与合规', difficulty:'挑战', icon:'＋', color:'#b66f83', hook:'漂亮的报表，经得起追问吗？', description:'经营一家医疗场景服务商，让交付、数据与销售承诺保持一致。', caseIds:['outcome','tellme'], cash:200, customers:500, price:0.036, baseCost:18, margin:0.72, quality:60, retention:66, trust:58, team:9, theme:'真实交付与信任'}
];

scenarios.push(...extraScenarios);
// These events and all financial parameters are original fictional simulations, not reconstructions of historical accounts.
const opt = (title, detail, effects, result) => ({title, detail, effects, result});
const event = (title, category, description, options, caseId) => ({title, category, description, options, caseId});
export const commonEvents = {
  2:event('客户说“挺好”，然后没有回来', '客户来信', '用户访谈中有不少赞美，但后台显示第二个月回来的客户不到预期。运营同事想用一轮活动把曲线拉回来。',[
    opt('用优惠券唤回用户','短期拉动订单，但毛利与付费意愿承压。',{cost:8,customers:350,margin:-0.04,retention:-3},'活动带来了新订单。折扣退出后，仍需要一个让用户回来的理由。'),
    opt('访谈流失客户，修复核心流程','放慢拉新，把资源投向反复出现的问题。',{cost:4,quality:9,retention:8,customers:-40},'你发现了重复出现的使用障碍，核心流程开始改善。'),
    opt('重做品牌与首页','提高认知，但不保证解决产品里的问题。',{cost:12,customers:120,trust:3},'新形象吸引了关注，真正的使用体验仍等待检验。'),
    opt('暂停低频功能，聚焦高频用户','放弃一部分人，换取更明确的产品方向。',{cost:2,customers:-120,retention:12,margin:0.03},'产品变窄了，留下的客户开始更频繁地使用。')],'tiny'),
  3:event('一笔很诱人的定制订单', '销售机会', '一家大客户愿意先支付一笔项目费，但要求团队接下来两个月优先做专属功能。销售承诺“后面还有很多家”。',[
    opt('全力接单','先收项目款，同时提高后续交付成本。',{funding:30,baseCost:5,quality:-5,retention:-3},'项目款到账，但维护专属版本成了持续支出。'),
    opt('收取试点费用，限制交付范围','减少短期收入，保留产品路线。',{funding:12,cost:4,quality:4,trust:4},'客户接受了范围明确的付费试点，双方预期更一致。'),
    opt('拒绝定制，服务现有客户','放弃项目款，让标准产品更稳定。',{quality:8,retention:4,trust:-2},'你错过一笔收入，但没有让团队转向另一门生意。'),
    opt('免费做，换取客户背书','获得曝光，但现金支出在前。',{cost:18,customers:250,trust:5,team:-1},'案例展示很漂亮。团队开始追问：什么时候才能收费？')],'koji'),
  5:event('投资人只给你二十分钟', '融资窗口', '投资人愿意看一份经营材料。对方关注增长，也追问获客之后的留存。准备材料将占用团队的时间。',[
    opt('用增长故事争取融资','达成客户规模与信任条件时可获融资；会稀释股权。',{conditionalFunding:100,equity:-18,cost:6,retention:-2},'你把业务交给投资人检验。融资结果取决于当前的客户规模与可信度。'),
    opt('展示真实小规模盈利路径','融资额较小，保留更多控制权。',{conditionalFunding:45,equity:-8,cost:3,trust:4},'材料不再追求夸张的市场故事，投资人看到了更清楚的经营边界。'),
    opt('先不融资，推出付费年包','获得部分预付款，也承担持续交付义务。',{funding:18,margin:-0.02,trust:-2,baseCost:1},'预付款改善了现金，但未来的服务承诺也增加了。'),
    opt('借短期资金维持增长','不稀释股权，后续每月成本增加。',{funding:38,baseCost:4,trust:-3},'你换来了时间，同时让接下来每个月更难达到收支平衡。')],'webvan'),
  6:event('核心成员发来一条消息', '团队会议', '负责关键交付的同事已经连续加班数周。他希望增加人手，或停止不断变化的需求。',[
    opt('招聘两名正式员工','提升交付能力，固定支出长期增加。',{cost:4,team:2,baseCost:4,quality:7,retention:3},'交付开始稳定，工资支出也成为每个月的固定承诺。'),
    opt('减少功能，清理技术债','控制范围，让现有团队恢复节奏。',{cost:3,quality:10,retention:5,customers:-70},'你推迟了发布计划，换回更稳定的工作节奏。'),
    opt('用奖金撑过这个月','暂时改善关系，但不能代替资源。',{cost:6,trust:3,quality:-2},'奖金解决了一部分情绪，排期上的矛盾还没有消失。'),
    opt('维持目标，要求继续冲刺','保留现金，承担人员与服务风险。',{team:-2,quality:-12,trust:-8,retention:-6},'两位同事离开了。表格上的目标没有变，能够完成它的人变少了。')],'club'),
  8:event('最重要的渠道改了规则', '外部变化', '贡献大量新客户的平台调整了推荐规则。即使产品没有变化，你的自然流量也开始下降。',[
    opt('增加投放买回曝光','直接买量，现金先支出。',{cost:22,customers:500,margin:-0.02},'新客户回来了，但你为流量支付了更高的价格。'),
    opt('建立直接触达的客户社群','增长慢一些，换取更稳定的关系。',{cost:5,retention:9,trust:5,customers:-60},'客户开始直接找到你，而不是只在平台上偶然遇见你。'),
    opt('与第二个渠道做小规模试验','付出试错费用，分散依赖。',{cost:9,customers:180,trust:3},'你没有立刻追回全部流量，但开始拥有第二条路。'),
    opt('等待规则恢复','不投入，接受客户流失。',{customers:-350,retention:-4},'平台没有保证流量何时回来，经营仍然需要继续。')],'tellme'),
  9:event('客户要求你解释这份报表', '信任考验', '一位客户发现交付数据与自己记录的不一致。销售希望先安抚客户，下个月再统一修正。',[
    opt('主动核查，披露并补偿','短期退款，恢复数据可信度。',{cost:12,trust:15,quality:5},'你公开了差异与修复安排，客户愿意继续观察。'),
    opt('只调整有投诉的账户','减少当月赔付，保留未解决的问题。',{cost:3,trust:-9,retention:-3},'局部问题缓解了，但同一套报表仍在发给其他客户。'),
    opt('投入独立校验流程','建立长期验证能力。',{cost:8,baseCost:1,trust:11,quality:6},'交付数据可以对账了，销售承诺也开始受到事实约束。'),
    opt('按原口径继续汇报','短期保住回款，信任大幅下降。',{funding:8,trust:-30,retention:-10},'回款暂时没有变化。客户开始共享自己的异常记录。')],'outcome'),
  11:event('扩张邀请，还是退出窗口', '董事会简报', '合作方提出帮助你进入新市场；另一方愿意承接部分业务。你需要决定把剩余资源押向哪里。',[
    opt('进入新市场','客户规模增加，筹备成本较高。',{cost:45,customers:1000,baseCost:5,quality:-5},'公司进入了更大的市场，复杂度也一起进入了你的账本。'),
    opt('留在已验证的市场','改善毛利与留存。',{cost:4,margin:0.08,retention:7},'你开始把“做得更稳”当作这一阶段的增长。'),
    opt('收缩非核心业务','减少用户和团队，降低长期成本。',{cost:7,customers:-180,baseCost:-5,team:-2,margin:0.05},'公司规模缩小了，剩余业务拥有更多喘息空间。'),
    opt('有序关停，结清承诺','结束本局；保留剩余现金，记录退出决定。',{cost:12,exit:true},'你选择有序退出。停止投入也是一种需要承担的创业决策。')],'webvan'),
  12:event('最后一场年度会议', '年度决策', '一年即将结束。团队需要一个明确的下一阶段计划：继续追求规模，还是先让业务独立活下来？',[
    opt('加速冲刺下一轮规模','把现金换成更多客户。',{cost:28,customers:650,baseCost:3,trust:2},'你以更大的业务规模进入年末，也带着更重的成本结构。'),
    opt('修复定价与履约效率','可能失去价格敏感客户，提升毛利。',{cost:5,customers:-80,margin:0.09,retention:3},'公司开始用真实收入覆盖真实交付。'),
    opt('保留现金，慢下来','控制成本，让团队完成积压任务。',{cost:2,baseCost:-3,quality:5,trust:3},'你给下一年留下了选择的空间。'),
    opt('兑现团队承诺','支付奖金并改善服务，牺牲短期现金。',{cost:14,quality:7,trust:8,retention:5},'这一年的最后一笔投入，花在了继续陪你走下去的人身上。')],'tiny')
};

const opening = {
 delivery:event('订单翻倍，亏损也翻倍', '接任第一天', '午高峰订单不断跳出来，配送员却越来越忙。财务提醒：目前每单收入扣除履约支出后，留下的钱不足以覆盖团队与仓点。',[
 opt('追加补贴，先抢下市场','争取规模，毛利下降。',{cost:24,customers:650,margin:-0.08},'订单明显增加，但每笔订单留下的现金更少了。'),
 opt('聚焦一个片区，重排配送路线','舍弃边缘订单，提高履约效率。',{cost:6,customers:-150,margin:0.12,quality:5},'骑手不再频繁跨区，单位履约成本开始下降。'),
 opt('签下第二座城市的仓库','提前承担扩张成本。',{cost:55,customers:350,baseCost:7},'你拥有了新的地盘，同时开始为尚未填满的仓库付款。'),
 opt('上调起送价，测试真实需求','订单减少，但收入质量改善。',{customers:-220,margin:0.16,trust:-3},'一部分补贴客户离开了，留下的订单更接近可持续价格。')],'webvan'),
 studio:event('评论区的热爱，账单上的空白', '接任第一天', '游戏社区的核心玩家很热情，但新玩家常在第一次进入后离开。团队同时发现，内部做的协作小工具被朋友主动借去使用。',[
 opt('制作更多昂贵的新内容','核心玩家满意，制作支出增加。',{cost:28,customers:220,quality:6,baseCost:3},'社区为更新欢呼，但你仍需观察新增玩家是否留下。'),
 opt('先修复新手体验','小步验证用户卡在哪里。',{cost:5,retention:12,quality:8},'新玩家终于能够更快理解产品，第二次回来的人增加了。'),
 opt('为内部工具找五个付费试点','缩减游戏投入，测试第二条路。',{cost:8,customers:-120,margin:0.12,retention:10,baseCost:-2},'第一批试点愿意付款，但它仍然需要一个清楚的服务边界。'),
 opt('找头部主播做一次推广','争取曝光，产品问题仍然存在。',{cost:22,customers:650,retention:-4},'直播当晚人很多。你等待着一周后的回访数据。')],'tiny'),
 platform:event('巨头发布了你的核心功能', '接任第一天', '一个拥有巨大分发渠道的平台，宣布向现有客户免费提供与你相似的工具。客户成功团队已经收到第一封退订咨询。',[
 opt('全面降价迎战','留住一部分用户，牺牲毛利。',{customers:250,margin:-0.14,trust:2},'客户对新价格很满意，公司需要承担更低的收入空间。'),
 opt('聚焦一个有明确需求的行业','减少泛用户，增强工作流价值。',{cost:7,customers:-100,retention:12,margin:0.1,quality:5},'产品变得更专门，客户终于能说出为什么需要你。'),
 opt('开发更多功能保持领先','增加工程投入，固定支出上升。',{cost:24,baseCost:4,quality:8},'功能列表更长了，但销售仍然要解释独立购买的理由。'),
 opt('转做集成服务与迁移支持','获得服务收入，同时增加人工负担。',{funding:18,baseCost:3,customers:120,retention:4},'你开始从工具之外的交付价值中获得收入。')],'koji'),
 hardware:event('展会排长队，预订只有七份', '接任第一天', '你的沉浸体验在展会上很受欢迎，但多数人没有兼容设备。供应商要求你尽快确认下一批硬件订单。',[
 opt('加大自研硬件投入','押注设备普及，承担库存成本。',{cost:65,quality:10,baseCost:5,customers:100},'样机更加出色，仓库里的设备也开始占用资金。'),
 opt('先推出普通手机能用的版本','降低门槛，接受视觉效果的取舍。',{cost:12,customers:420,quality:-5,retention:8,margin:0.08},'体验没有展会版本惊艳，但更多人真的可以打开它。'),
 opt('向机构销售付费试点','减少泛客户，争取明确的采购场景。',{funding:15,customers:80,retention:10,trust:5},'采购方要求清楚的教学目标和交付日期。'),
 opt('免费送设备培养市场','快速增加用户，现金支出较高。',{cost:48,customers:600,margin:-0.08},'设备送到了用户手里，重复使用的理由还需要验证。')],'reality'),
 health:event('销售合同，比系统能力快了一步', '接任第一天', '销售团队刚签下一份合同，承诺提供系统暂时无法完整记录的交付指标。客户即将支付预付款。',[
 opt('先收款，之后再补系统','获得现金，承担信任风险。',{funding:35,trust:-18,baseCost:2},'预付款到账了。未兑现的指标成为新的交付压力。'),
 opt('重新约定可验证的交付范围','减少订单规模，建立可信记录。',{funding:10,cost:5,trust:14,quality:6},'客户接受较小范围的试点，合同与系统终于一致。'),
 opt('立即投入全套数据系统','强化能力，承担较大前置支出。',{cost:38,quality:15,trust:8,baseCost:2},'数据链路更完整了，但资金跑道明显缩短。'),
 opt('撤回合同并退款','保留信誉，放弃短期订单。',{cost:8,customers:-80,trust:10,baseCost:-1},'你为承诺不足承担了代价，也避免让问题继续扩大。')],'outcome')
};
export const scenarioEvent = (scenario, month) => {
 const expanded=expandedScenarioEvent(scenario,month);if(expanded)return expanded;
 if (month === 1) return opening[scenario];
 const settings = {
 delivery:['从一个片区到整座城市','履约团队希望一次开出五个仓点。尚未稳定的订单密度，让效率和扩张速度发生冲突。','webvan'],
 studio:['把热爱变成第二次付款','用户希望持续更新免费内容；愿意付费的人，似乎更在意另一个具体问题。','tiny'],
 platform:['客户买功能，还是买结果','一位垂直行业客户需要完整工作流程，而大众用户仍在比较免费功能。','koji'],
 hardware:['真正能使用的人有多少','设备兼容与内容制作不断产生额外成本。机构客户愿意为一个明确场景试点。','virtual'],
 health:['这一次，客户要看原始记录','新的订单要求更大覆盖，但交付团队希望先把每一项指标做实。','outcome']
 };
 const [title,description,caseId]=settings[scenario];
 const stage = month === 4 ? '验证阶段' : month === 7 ? '增长阶段' : '生存阶段';
 return event(`${title} · ${stage}`,stage,description + (month === 7 ? ' 上一阶段的决策已经改变了你的客户和成本。' : month === 10 ? ' 留给下一轮验证的现金已经不多了。' : ''),[
 opt('加速覆盖，扩大投入','更多客户、更高的持续支出。',{cost:month*3,customers:month*70,baseCost:3,retention:-3},'规模变大了，你必须用接下来的收入证明投入值得。'),
 opt('限定范围，付费验证','用小范围真实交易改进产品。',{cost:5,quality:7,retention:7,margin:0.04,trust:3},'你得到了范围有限但更可信的使用证据。'),
 opt('调整模式，减少固定投入','放弃部分客户，降低成本。',{cost:7,customers:-90,baseCost:-3,margin:0.06,quality:-2},'路线调整有代价，但公司少了一部分持续负担。'),
 opt('按原计划继续，暂不调整','保留本月投入，接受积累的问题。',{quality:-6,retention:-5,trust:-3},'账面现金暂时保住了，客户的不满也在逐渐积累。')],caseId);
};
