const CACHE_PREFIX = 'legal-case-manager-';
const CACHE_NAME = 'legal-case-manager-5-6-1';
const HTML_URL = './legal-case-manager.html';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll([HTML_URL, './manifest.json'])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME)
            .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  if (url.includes('script.google.com') ||
      url.includes('script.googleusercontent.com') ||
      url.includes('googleapis.com')) return;

  if (url.endsWith('.html') || url.includes('legal-case-manager')) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(event.request, clone)
          );
        }
        return response;
      }).catch(() => caches.match(HTML_URL))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).catch(() => caches.match(HTML_URL));
    })
  );
});
