import test from 'node:test';
import assert from 'node:assert/strict';
import {createWebServer} from '../server.cjs';
import {createGame,createDIYGame,getEvent} from '../src/engine.mjs';
import {digest} from '../access.cjs';

test('three total turns, signed browser access, monthly activation and expiry',async()=>{
 let now=1800000000000,called=0;
 const options={access:{code:'TEST-MONTH-ONLY',secret:'test-only-signing-secret-that-is-at-least-32-characters',now:()=>now},ask:async()=>{called++;return {text:'test',tokens:1};}};
 let server,base,cookie='';
 async function start(){server=createWebServer(options);await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;}
 async function send(route,body){const r=await fetch(base+route,{method:body===undefined?'GET':'POST',headers:{cookie,'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});if(r.headers.get('set-cookie')){assert.match(r.headers.get('set-cookie'),/HttpOnly/);cookie=r.headers.get('set-cookie').split(';')[0];}return {status:r.status,...await r.json()};}
 await start();
 try{
  assert.equal((await send('/api/access')).access.remaining,3);
  for(let i=0;i<3;i++){
   const state=createGame('studio','公司'+i,12+i);
   const r=await send('/api/game/turn',{state,choice:0,priority:'product',requestId:'turn-'+i});
   assert.equal(r.status,200);assert.equal(r.state.month,2);assert.equal(r.access.remaining,2-i);
   if(i===2){const retry=await send('/api/game/turn',{state,choice:0,priority:'product',requestId:'turn-'+i});assert.equal(retry.status,200);assert.equal(retry.access.remaining,0);}
  }
  const state=createGame('studio','新局',88);
  assert.equal((await send('/api/game/turn',{state,choice:0,priority:'product',requestId:'fourth'})).status,402);
  assert.equal((await send('/api/ai/chat',{key:'sk-test',question:'你好'})).status,402);assert.equal(called,0);
  assert.equal((await send('/api/access/activate',{code:'wrong'})).status,400);
  const activated=await send('/api/access/activate',{code:' test-month-only '});
  assert.equal(activated.access.active,true);const expiresAt=activated.access.expiresAt;
  assert.equal(expiresAt,now+30*86400000);
  for(let i=0;i<5;i++)assert.equal((await send('/api/game/turn',{state,choice:0,priority:'product',requestId:'paid-'+i})).status,200);
  now+=86400000;
  assert.equal((await send('/api/access/activate',{code:'TEST-MONTH-ONLY'})).access.expiresAt,expiresAt);
  await new Promise(r=>server.close(r));await start();
  assert.equal((await send('/api/access')).access.expiresAt,expiresAt);
  now=expiresAt;
  assert.equal((await send('/api/access')).access.active,false);
  assert.equal((await send('/api/game/turn',{state,choice:0,priority:'product',requestId:'expired'})).status,402);
  assert.equal((await send('/api/access/activate',{code:'TEST-MONTH-ONLY'})).status,409);
  cookie=cookie.slice(0,-1)+(cookie.endsWith('a')?'b':'a');
  assert.equal((await send('/api/game/turn',{state,choice:0,priority:'product',requestId:'tamper'})).status,401);
 }finally{await new Promise(r=>server.close(r));}
});

test('calendar codes use Beijing date, expire after 30 days, renew and repeat each year',async()=>{
 let now=Date.parse('2028-02-28T15:59:59Z');
 const codes={'02-28':digest('FEB28'), '02-29':digest('LEAP'), '12-31':digest('YEAR-END'), '01-01':digest('NEW-YEAR')};
 const server=createWebServer({access:{codes,secret:'test-only-signing-secret-that-is-at-least-32-characters',now:()=>now}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;let cookie='';
 async function activate(code){const r=await fetch(base+'/api/access/activate',{method:'POST',headers:{cookie,'content-type':'application/json'},body:JSON.stringify({code})});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,...await r.json()};}
 try{
  assert.equal((await activate('LEAP')).status,400);
  now+=1000;
  assert.equal((await activate('FEB28')).status,400);
  const first=await activate(' leap ');assert.equal(first.status,200);assert.equal(first.access.expiresAt,now+30*86400000);
  now+=3600000;assert.equal((await activate('LEAP')).access.expiresAt,first.access.expiresAt);
  now=Date.parse('2028-12-31T15:59:59Z');assert.equal((await activate('YEAR-END')).status,200);
  now+=1000;assert.equal((await activate('YEAR-END')).status,400);
  now=Date.parse('2029-12-31T16:00:00Z');assert.equal((await activate('NEW-YEAR')).status,200);
  assert.equal((await activate('NEW-YEAR')).access.expiresAt,now+30*86400000);
 }finally{await new Promise(r=>server.close(r));}
});

test('invalid decisions do not consume trial; DIY custom decisions share the same limit',async()=>{
 const server=createWebServer({access:{code:'TEST',secret:'test-only-signing-secret-that-is-at-least-32-characters'}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;let cookie='';
 const post=async(body)=>{const r=await fetch(base+'/api/game/turn',{method:'POST',headers:{cookie,'content-type':'application/json'},body:JSON.stringify(body)});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,...await r.json()};};
 try{
  let state=createDIYGame({name:'小店',idea:'提供预约咖啡',audience:'附近上班族',goal:'稳定盈利',capital:100,businessModel:'retail',difficulty:'normal'});
  assert.equal((await post({state,choice:8,requestId:'invalid'})).status,400);
  const r=await post({state,choice:{title:'预付试点',detail:'先做小范围试点',approach:'sales',result:'客户愿意参加预约试点。'},action:'先做一个试点',kind:'custom',priority:'product',requestId:'custom'});
  assert.equal(r.status,200);assert.equal(r.access.remaining,2);assert.equal(r.state.month,2);
  const bad=await fetch(base+'/api/access/activate',{method:'POST',headers:{'content-type':'application/json',origin:'https://evil.example'},body:'{"code":"TEST"}'});assert.equal(bad.status,403);
 }finally{await new Promise(r=>server.close(r));}
});
