import {scenarios,cases} from './content.mjs';
import {getEvent,forecast,scenarioFor} from './engine.mjs';
export function buildGameContext(game){
 if(!game)return '尚未开始游戏。';
 const s=scenarioFor(game),event=game.ending?null:getEvent(game);
 return JSON.stringify({剧本:s.name,背景:s.description,经营设定:'全部数值均为游戏假设，金额单位万元。未执行选项的精确后果未知，请提出假设而不要编造数值。',当前:{月份:game.month,现金:game.cash,客户:game.customers,预计:forecast(game),信任:game.trust,质量:game.quality,留存:game.retention,股权:game.equity},本月事件:event?{标题:event.title,描述:event.description,选项:event.options.map(o=>({标题:o.title,说明:o.detail}))}:'游戏已结束',最近决定:game.history.slice(-3),关联案例:cases.filter(c=>s.caseIds.includes(c.id)).map(c=>({名称:c.name,资料状态:c.status,摘要:c.summary}))});
}
