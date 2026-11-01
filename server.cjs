const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {buildRequest,requestAI}=require('./ai.cjs');
const {buildDirectorRequest,requestDirector}=require('./director.cjs');
const {createAccess,digest}=require('./access.cjs');
const engine=import('./src/engine.mjs');
const CSP="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
const root=__dirname,MAX_BODY=1024*1024;
const publicFiles=new Set(['/index.html','/manifest.webmanifest','/sw.js','/icon.svg','/icon-192.png','/icon-512.png','/apple-touch-icon.png']);
function json(res,status,value){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(value));}
async function readJSON(req){
 let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>MAX_BODY)throw Error('请求内容过大，请减少历史记录或导出备份后开始新局。');chunks.push(chunk);}
 try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw Error('请求格式不正确，请刷新后重试。');}
}
function createWebServer({ask=requestAI,direct=requestDirector,access:accessOptions}={}){
 const access=createAccess(accessOptions);
 const limits=new Map();let active=0;
 const server=http.createServer(async(req,res)=>{
  res.setHeader('content-security-policy',CSP);res.setHeader('x-content-type-options','nosniff');res.setHeader('referrer-policy','same-origin');res.setHeader('permissions-policy','camera=(), microphone=(), geolocation=()');res.setHeader('x-frame-options','DENY');
  try{
   const url=new URL(req.url,'http://localhost'),pathname=url.pathname;
   if(pathname==='/api/health'&&req.method==='GET')return json(res,200,{ok:true,version:'0.3.0',cases:100,scenarios:20,activation:true});
   if(pathname==='/api/access'&&req.method==='GET')return json(res,200,{ok:true,access:access.status(access.read(req,res))});
   if(pathname.startsWith('/api/')){
    if(req.method!=='POST')return json(res,405,{ok:false,error:'这个操作需要由游戏界面发起。'});
    if(!['/api/ai/chat','/api/ai/director','/api/access/activate','/api/game/turn'].includes(pathname))return json(res,404,{ok:false,error:'接口不存在。'});
    const origin=req.headers.origin;
    if(origin&&!['http://'+req.headers.host,'https://'+req.headers.host].includes(origin))return json(res,403,{ok:false,error:'请求来源不受支持。'});
    if(!(req.headers['content-type']||'').startsWith('application/json'))return json(res,415,{ok:false,error:'请使用游戏界面发送请求。'});
    const session=access.read(req,res);
    const ip=session.id,now=Date.now(),limit=limits.get(ip);
    if(limit&&now-limit.start<60000&&limit.count>=30)return json(res,429,{ok:false,error:'请求过于频繁，请稍后再试。'});
    if(active>=6)return json(res,503,{ok:false,error:'当前 AI 请求较多，请稍后再试；你的进度不会改变。'});
    if(!limit||now-limit.start>=60000)limits.set(ip,{start:now,count:1});else limit.count++;
    if(limits.size>2000)for(const [k,v]of limits)if(now-v.start>60000)limits.delete(k);
    if(pathname==='/api/access/activate'){
     const body=await readJSON(req);return json(res,200,{ok:true,access:access.activate(req,res,session,body.code)});
    }
    if(pathname==='/api/game/turn'){
     const body=await readJSON(req);
     try{
      if(typeof body.requestId!=='string'||!body.requestId||body.requestId.length>100)throw Error('决策标识不正确，请重试。');
      const {validateSave,advance,applyCustomChoice}=await engine,state=validateSave(body.state);
      const next=body.kind==='custom'?applyCustomChoice(state,body.choice,body.action,body.priority):advance(state,body.choice,body.priority);
      const fingerprint=digest(JSON.stringify(body));
      const status=access.commit(req,res,session,body.requestId,fingerprint);
      return json(res,200,{ok:true,state:next,access:status});
     }catch(error){return json(res,error.status||400,{ok:false,error:error.message,access:access.status(session)});}
    }
    access.requirePlay(session);
    let options;try{options=await readJSON(req);if(pathname.endsWith('/chat'))buildRequest(options);else{const {validateSave}=await engine;options.state=validateSave(options.state);buildDirectorRequest(options);}}catch(error){return json(res,400,{ok:false,error:error.message});}
    active++;
    // BYOK: use the visitor's key only in this request. Never log or persist request bodies.
    try{const result=pathname.endsWith('/chat')?await ask(options):await direct(options);return json(res,200,{ok:true,...result});}
    catch(error){return json(res,502,{ok:false,error:error.message});}
    finally{options.key=undefined;active--;}
   }
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
   const target=pathname==='/'?'/index.html':pathname;
   if(!publicFiles.has(target)&&!/^\/src\/[a-zA-Z0-9_.-]+\.(mjs|css)$/.test(target)){res.writeHead(404);return res.end('Not found');}
   const file=path.join(root,target),extension=path.extname(file),type={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'}[extension];
   const data=await fs.promises.readFile(file);res.setHeader('content-type',type||'application/octet-stream');res.setHeader('cache-control','no-cache');res.setHeader('content-length',data.length);res.writeHead(200);res.end(req.method==='HEAD'?undefined:data);
  }catch(error){if(!res.headersSent)json(res,error.status||500,{ok:false,error:error.status?error.message:'服务暂时不可用，请稍后重试。'});else res.end();}
 });
 server.requestTimeout=120000;server.headersTimeout=15000;
 return server;
}
if(require.main===module){const port=Number(process.env.PORT)||10000;createWebServer().listen(port,'0.0.0.0',()=>console.log('Startup Simulator ready on port '+port));}
module.exports={createWebServer};
