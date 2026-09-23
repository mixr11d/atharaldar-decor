/**
 * أثر الدار - مشغل الخدمة (Service Worker)
 * Strategy: Network-First for HTML/JS/CSS with Auto-Purge on updates
 */

var CACHE_NAME = 'athar-decor-v2';
var STATIC_ASSETS = [
  '/',
  '/style.css?v=2.0',
  '/script.js?v=2.0',
  '/manifest.json'
];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheKey) {
          if (cacheKey !== CACHE_NAME) {
            return caches.delete(cacheKey);
          }
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  
  // تجاهل الطلبات الخارجية مثل إعلانات قوقل وتتبع الـ analytics
  if (request.method !== 'GET' || request.url.indexOf('google') !== -1 || request.url.indexOf('doubleclick') !== -1) {
    return;
  }

  // استراتيجية Network-First لكافة الصفحات والأكواد لضمان عدم بقاء كاش قديم
  event.respondWith(
    fetch(request)
      .then(function (networkResponse) {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          var responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(function () {
        return caches.match(request).then(function (cachedResponse) {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/404.html');
          }
        });
      })
  );
});
