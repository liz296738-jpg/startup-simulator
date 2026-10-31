import test from 'node:test';import assert from 'node:assert/strict';
import {createDIYGame} from '../src/engine.mjs';
import {buildDirectorRequest,requestDirector} from '../director.cjs';
const profile={name:'小雨咖啡',idea:'为写字楼提供咖啡',audience:'附近上班族',goal:'稳定盈利',businessModel:'retail',capital:80,difficulty:'normal'};
test('director uses the player company, story memory and structured output',()=>{
 const state=createDIYGame(profile);state.storyMemory=[{month:0,chapter:'上次讨论',decision:'先不扩张',result:'决定试点',characters:[],threads:['验证团购']}];
 const r=buildDirectorRequest({key:'sk-test',state,model:'deepseek-flash'});
 assert.equal(r.url,'https://api.deepseek.com/chat/completions');assert.equal(r.body.response_format.type,'json_object');
 assert.equal(r.body.thinking.type,'disabled');
 assert.match(r.body.messages[1].content,/验证团购/);assert.ok(!JSON.stringify(r.body).includes('sk-test'));
 assert.throws(()=>buildDirectorRequest({key:'sk-test',state,kind:'action',action:''}));
});
test('director rejects malformed response rather than mutating a game',async()=>{
 const state=createDIYGame(profile),before=JSON.stringify(state);
 await assert.rejects(requestDirector({key:'sk-test',state},async()=>({ok:true,json:async()=>({choices:[{message:{content:'not json'}}]})})),/无法读取/);
 assert.equal(JSON.stringify(state),before);
});
