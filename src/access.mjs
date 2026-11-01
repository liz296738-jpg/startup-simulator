import {escape} from './ui-kit.mjs';
let current=null;
export function accessStatus(){
 if(!current)return null;
 const expired=current.expiresAt!==null&&Date.now()>=current.expiresAt;
 return {...current,active:current.active&&!expired,expired:current.expired||expired};
}
export async function accessRequest(path,body){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
 try{
  const r=await fetch(path,{method:body===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',headers:{'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal});
  let data;try{data=await r.json();}catch{throw Error('服务正在启动，请稍后重试。');}
  if(data.access)current=data.access;
  if(!data.ok){const e=Error(data.error||'操作未完成，请重试。');e.status=r.status;throw e;}
  return data;
 }catch(error){if(error.name==='AbortError')throw Error('连接超时，请重试；当前进度已保留。');if(error instanceof TypeError)throw Error('请联网后重试，当前进度已保留。');throw error;}
 finally{clearTimeout(timer);}
}
export const refreshAccess=()=>accessRequest('/api/access');
export function accessDate(value){return new Date(value).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});}
export function accessBanner(){
 const s=accessStatus(),title=s?.active?'月卡已激活':s?.expired?'月卡已到期':'先体验，再开启整段创业旅程';
 const detail=s?.active?`有效期至 ${accessDate(s.expiresAt)}（北京时间） · 期间不限经营回合`:s?.expired?'你的公司和存档已保留，激活后可以接着经营。':s?`免费体验剩余 ${s.remaining} / 3 回合 · 重开公司共用额度`:'免费体验 3 回合 · 激活月卡后畅玩 30 天';
 return `<section class="access-banner ${s?.active?'is-active':''}" aria-label="月卡与试玩额度"><div class="access-emblem" aria-hidden="true">${s?.active?'✓':'30'}</div><div class="access-copy"><strong>${title}</strong><p>${escape(detail)}</p></div><button class="button ${s?.active?'secondary':'primary'} small" data-action="activate">${s?.active?'查看月卡':'输入激活码'}</button></section>`;
}
