import test from 'node:test';import assert from 'node:assert/strict';
import {createWebServer} from '../server.cjs';
import {createDIYGame} from '../src/engine.mjs';
test('web serves only public assets and never exposes server files',async()=>{
 const server=createWebServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 try{
  for(const url of ['/','/src/app.mjs','/src/styles.css','/manifest.webmanifest','/api/health'])assert.equal((await fetch(base+url)).status,200,url);
  for(const url of ['/server.cjs','/ai.cjs','/director.cjs','/.git/config','/tests/server.test.mjs'])assert.equal((await fetch(base+url)).status,404,url);
  assert.match((await fetch(base)).headers.get('content-security-policy'),/connect-src 'self'/);
 }finally{await new Promise(r=>server.close(r));}
});
test('web AI requires proper same-origin JSON and validates the DIY state',async()=>{
 let called=0;const server=createWebServer({ask:async()=>{called++;return {text:'先验证客户需求。',tokens:12};},direct:async()=>{called++;return {event:{title:'测试剧情'},tokens:30};}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 const post=(url,body,headers={})=>fetch(base+url,{method:'POST',headers:{'content-type':'application/json',...headers},body:JSON.stringify(body)});
 try{
  assert.equal((await post('/api/ai/chat',{key:'sk-test',question:'你好',model:'deepseek-flash'},{origin:'https://untrusted.example'})).status,403);
  assert.equal((await post('/api/ai/chat',{key:'',question:'你好'})).status,400);
  assert.equal((await post('/api/ai/director',{key:'sk-test',state:{}})).status,400);
  const response=await post('/api/ai/chat',{key:'sk-test',question:'你好',model:'deepseek-flash'});
  assert.equal(response.status,200);assert.equal((await response.json()).ok,true);assert.equal(called,1);
  const state=createDIYGame({name:'小店',idea:'提供预约咖啡',audience:'附近上班族',goal:'稳定盈利',capital:100,businessModel:'retail',difficulty:'normal'});
  const direct=await post('/api/ai/director',{key:'sk-test',model:'deepseek-flash',state,kind:'story'});assert.equal(direct.status,200);assert.equal(called,2);
 }finally{await new Promise(r=>server.close(r));}
});
