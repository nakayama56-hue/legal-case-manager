const CACHE_NAME = 'legal-case-manager-202603250001';
const ASSETS = [
  './legal-case-manager.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// インストール時にキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS.filter(a => !a.endsWith('.png')));
    })
  );
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// オフライン対応：キャッシュ優先、なければネットワーク
self.addEventListener('fetch', event => {
  // GASへのリクエストはキャッシュしない
  if (event.request.url.includes('script.google.com')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // HTMLファイルはキャッシュを更新
        if (response.ok && event.request.url.endsWith('.html')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // オフライン時はキャッシュから返す
        return caches.match('./legal-case-manager.html');
      });
    })
  );
});
