// HTMLのバージョン番号をキャッシュ名に使う
// → legal-case-manager.html が更新されるたびに自動でキャッシュが更新される
const CACHE_PREFIX = 'legal-case-manager-';
const HTML_URL = './legal-case-manager.html';

// HTMLからバージョン番号を取得してキャッシュ名を決定
async function getCacheName() {
  try {
    const res = await fetch(HTML_URL + '?_sw_check=' + Date.now(), { cache: 'no-store' });
    const text = await res.text();
    const m = text.match(/ver\.\s*([\d.]+)/);
    if (m) return CACHE_PREFIX + m[1].replace(/\./g, '-');
  } catch (e) {}
  return CACHE_PREFIX + Date.now();
}

// インストール時：最新HTMLを取得してキャッシュ
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

// アクティベート時：古いキャッシュをすべて削除
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

// フェッチ：GAS等は素通し、HTMLはネットワーク優先（更新をすぐ反映）
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // GAS・Google APIはキャッシュしない
  if (url.includes('script.google.com') ||
      url.includes('script.googleusercontent.com') ||
      url.includes('googleapis.com')) return;

  // HTMLはネットワーク優先（オフライン時のみキャッシュ）
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

  // その他：キャッシュ優先
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).catch(() => caches.match(HTML_URL));
    })
  );
});
