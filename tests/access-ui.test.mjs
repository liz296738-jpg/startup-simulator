import test from 'node:test';import assert from 'node:assert/strict';
import {accessBanner,purchaseLink,PURCHASE_URL} from '../src/access.mjs';
test('purchase buttons link to the supplied Xiaohongshu product and open safely',()=>{
 assert.equal(PURCHASE_URL,'https://xhslink.cn/o/45AV9dSQ71T');
 for(const html of [accessBanner(),purchaseLink()]){
  assert.match(html,/href="https:\/\/xhslink\.cn\/o\/45AV9dSQ71T"/);
  assert.match(html,/target="_blank"/);assert.match(html,/rel="noopener noreferrer"/);
 }
 assert.match(accessBanner(),/data-action="activate"/);
});
