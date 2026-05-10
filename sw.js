const CACHE_PREFIX = 'legal-case-manager-';
const HTML_URL = './legal-case-manager.html';

async function getCacheName() {
  try {
    const res = await fetch(HTML_URL + '?_sw_check=' + Date.now(), { cache: 'no-store' });
    const text = await res.text();
    const m = text.match(/ver\.\s*([\d.]+)/);
    if (m) return CACHE_PREFIX + m[1].replace(/\./g, '-');
  } catch (e) {}
  return CACHE_PREFIX + Date.now();
}

self.addEventListener('install', event => {
  event.waitUntil(
    getCacheName().then(cacheName =>
      caches.open(cacheName).then(cache =>
        cache.addAll([HTML_URL, './manifest.json'])
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    getCacheName().then(cacheName =>
      caches.keys().then(keys =>
        Promise.all(
          keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== cacheName)
              .map(k => caches.delete(k))
        )
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
          getCacheName().then(cacheName =>
            caches.open(cacheName).then(cache =>
              cache.put(event.request, response.clone())
            )
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
