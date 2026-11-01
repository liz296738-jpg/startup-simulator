async function send(path,payload,timeout){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
 try{const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(payload),signal:controller.signal});
  let data;try{data=await response.json();}catch{return {ok:false,error:'服务正在启动或返回异常，请稍后重试。'};}
  return data;
 }catch(error){return {ok:false,error:error.name==='AbortError'?'AI 请求超时，请稍后重试；当前进度已保留。':'网络连接失败。请联网后重试，当前进度已保留。'};}
 finally{clearTimeout(timer);}
}
if(!window.desktop)window.desktop={
 askAI:options=>send('/api/ai/chat',options,75000),
 directStory:options=>send('/api/ai/director',options,105000),
 openLink:href=>{try{const url=new URL(href);if(url.protocol==='https:'&&['www.loot-drop.io','loot-drop.io','platform.deepseek.com','api-docs.deepseek.com'].includes(url.hostname))window.open(url.href,'_blank','noopener,noreferrer');}catch{}}
};
if('serviceWorker'in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{});});}
