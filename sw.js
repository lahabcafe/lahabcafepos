/* Minimal app-shell cache. Supabase API traffic is deliberately never cached. */
const CACHE_NAME = 'lahab-pos-shell-v1';
const APP_SHELL = './index.html';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.add(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('lahab-pos-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Keep the app shell available offline; runtime Supabase requests are cross-origin and bypass this cache.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response && response.ok) caches.open(CACHE_NAME).then(cache => cache.put(APP_SHELL, response.clone()));
      return response;
    }).catch(() => caches.match(APP_SHELL)));
  }
});
