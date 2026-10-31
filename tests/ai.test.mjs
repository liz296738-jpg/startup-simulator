import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRequest, requestAI } from '../ai.cjs';
test('AI uses official host and bounded context without putting the key in messages', () => {
  const request = buildRequest({key:'sk-test', model:'deepseek-chat', question:'应该扩张吗？', context:'现金120万元', role:'partner'});
  assert.equal(request.url, 'https://api.deepseek.com/chat/completions');
  assert.equal(request.headers.Authorization, 'Bearer sk-test');
  assert.ok(!JSON.stringify(request.body).includes('sk-test'));
  assert.ok(request.body.messages.some(m => m.content.includes('现金120万元')));
  assert.throws(() => buildRequest({key:'', question:'x'}));
  assert.throws(() => buildRequest({key:'sk-x', model:'https://evil.example', question:'x'}));
});
test('AI parses success and returns actionable HTTP/empty-response failures', async () => {
  const options = {key:'sk-test', model:'deepseek-chat', question:'你好', role:'partner'};
  const success = await requestAI(options, async () => ({ok:true, json:async()=>({choices:[{message:{content:'先验证付费意愿。'}}],usage:{total_tokens:42}})}));
  assert.equal(success.text, '先验证付费意愿。');
  assert.equal(success.tokens,42);
  await assert.rejects(requestAI(options, async()=>({ok:false,status:401})), /密钥/);
  await assert.rejects(requestAI(options, async()=>({ok:false,status:402})), /余额/);
  await assert.rejects(requestAI(options, async()=>({ok:true,json:async()=>({choices:[]})})), /内容/);
});
