const CACHE='startup-simulator-0.2.0';
const FILES=['/','/index.html','/manifest.webmanifest','/icon.svg','/icon-192.png','/icon-512.png','/apple-touch-icon.png','/src/styles.css','/src/platform.mjs','/src/app.mjs','/src/content.mjs','/src/case-expansion.mjs','/src/scenario-expansion.mjs','/src/engine.mjs','/src/context.mjs','/src/diy.mjs','/src/story-schema.mjs'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('startup-simulator-')&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 // Never cache AI requests, API responses, keys or user-generated request data.
 if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
 if(!FILES.includes(url.pathname))return;
 event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}return response;}).catch(async()=>await caches.match(request)||(request.mode==='navigate'?await caches.match('/index.html'):Response.error())));
});
