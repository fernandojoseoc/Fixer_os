const CACHE = 'fixer-os-v3';
const ASSETS = ['/Fixer_os/', '/Fixer_os/index.html', '/Fixer_os/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const url = e.request.url;
  if(url.includes('firestore') || url.includes('googleapis') ||
     url.includes('gstatic') || url.includes('fonts.g') ||
     url.includes('accounts.google')) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if(res.ok && res.status < 400) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match('/Fixer_os/index.html')))
  );
});
