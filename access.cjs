const {createHmac,createHash,timingSafeEqual,randomBytes,randomUUID}=require('node:crypto');
const DAY=86400000,COOKIE='startup_access_v1';
function fault(status,message){const error=Error(message);error.status=status;return error;}
const digest=value=>createHash('sha256').update(value).digest('hex');
function createAccess({code=process.env.MONTHLY_ACTIVATION_CODE||'',codes=code?{}:JSON.parse(process.env.ACTIVATION_CODES_JSON||'{}'),secret=process.env.ACCESS_SIGNING_SECRET,now=Date.now}={}){
 if(!secret){if(process.env.NODE_ENV==='production')throw Error('ACCESS_SIGNING_SECRET is required');secret=randomBytes(32).toString('hex');}
 if(secret.length<32)throw Error('ACCESS_SIGNING_SECRET must contain at least 32 characters');
 // These caches prevent stale-cookie replay while the process is running. Signed
 // cookies preserve the latest browser entitlement across service restarts.
 const sessions=new Map();
 const today=()=>new Date(now()+8*3600000).toISOString().slice(0,10);
 const daily=Object.keys(codes).length>0;
 if(daily){
  for(const [day,hash] of Object.entries(codes))if(!/^\d{2}-\d{2}$/.test(day)||!/^[a-f0-9]{64}$/.test(hash))throw Error('Invalid activation code calendar configuration');
 }
 const mac=payload=>createHmac('sha256',secret).update(payload).digest('hex');
 function write(req,res,s){
  const payload=Buffer.from(JSON.stringify(s)).toString('base64url');
  res.setHeader('set-cookie',`${COOKIE}=${payload}.${mac(payload)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=34560000${req.socket.encrypted||req.headers['x-forwarded-proto']==='https'?'; Secure':''}`);
  sessions.delete(s.id);sessions.set(s.id,s);
  if(sessions.size>10000)sessions.delete(sessions.keys().next().value);
 }
 function read(req,res){
  const raw=(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
  let s;
  if(raw){
   const [payload,signature]=raw.split('.');
   if(!payload||!/^[a-f0-9]{64}$/.test(signature||'')||!timingSafeEqual(Buffer.from(signature),Buffer.from(mac(payload))))throw fault(401,'激活凭证无法验证，请联系卖家协助恢复。');
   try{s=JSON.parse(Buffer.from(payload,'base64url').toString());}catch{throw fault(401,'激活凭证无法读取，请联系卖家。');}
   if(!s||s.v!==1||typeof s.id!=='string'||!Number.isInteger(s.used)||s.used<0||s.used>3||!(s.activatedAt===null||Number.isFinite(s.activatedAt)))throw fault(401,'激活凭证无效，请联系卖家。');
   s=sessions.get(s.id)||s;
  }else s={v:1,id:randomUUID(),used:0,activatedAt:null,codeId:null,lastTurn:null};
  write(req,res,s);return s;
 }
 function status(s){const expiresAt=s.activatedAt===null?null:s.activatedAt+30*DAY,active=expiresAt!==null&&now()<expiresAt;return {active,expiresAt,expired:expiresAt!==null&&!active,remaining:s.activatedAt===null?Math.max(0,3-s.used):0,trialLimit:3,canPlay:active||(s.activatedAt===null&&s.used<3),available:daily?!!codes[today().slice(5)]:!!code,dailyCodes:daily};}
 function requirePlay(s){if(!status(s).canPlay)throw fault(402,s.activatedAt===null?'3 回合体验已结束，激活月卡后可继续当前进度。':'月卡已到期，当前进度已保留，请联系卖家续期。');}
 function activate(req,res,s,input){
  const codeId=daily?today():digest(code),expected=daily?codes[codeId.slice(5)]:code?digest(code.trim().toUpperCase()):null;
  if(!expected)throw fault(503,'激活服务尚未配置，请稍后重试或联系卖家。');
  const value=typeof input==='string'?input.trim().toUpperCase():'';
  if(!timingSafeEqual(Buffer.from(digest(value)),Buffer.from(expected)))throw fault(400,daily?'激活码不正确或不是今天的码，请向卖家领取北京时间当天的激活码。':'激活码不正确，请检查后重试。');
  if(s.activatedAt!==null){
   if(status(s).active)return status(s);
   if(!daily||s.codeId===codeId)throw fault(409,'这张月卡已在当前浏览器使用且已到期，请联系卖家续期。');
  }
  s.activatedAt=now();s.codeId=codeId;s.used=3;write(req,res,s);return status(s);
 }
 function commit(req,res,s,requestId,fingerprint){
  if(s.lastTurn?.requestId===requestId){if(s.lastTurn.fingerprint!==fingerprint)throw fault(409,'同一决策请求内容发生变化，请重试。');return status(s);}
  requirePlay(s);if(!status(s).active)s.used++;
  s.lastTurn={requestId,fingerprint};write(req,res,s);return status(s);
 }
 return {read,status,requirePlay,activate,commit};
}
module.exports={createAccess,digest};
