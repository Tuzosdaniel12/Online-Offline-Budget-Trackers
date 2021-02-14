const STATIC_BUDGET = "static-budget-v3";
const DATA_BUDGET = "data-budget-v3";

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/styles.css',
  '/index.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// const CACHE_NAME = "static-cache-v2";
// const DATA_CACHE_NAME = "data-cache-v1";

// install
self.addEventListener("install", async (evt)=> {
    // pre cache image data
    evt.waitUntil(
        caches.open(DATA_BUDGET).then((cache) => cache.add("/api/transaction"))
    );
        
    // pre cache all static assets
    evt.waitUntil(
        caches.open(STATIC_BUDGET).then((cache) => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting()
});

self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== STATIC_BUDGET && key !== DATA_BUDGET) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );

    self.clients.claim();
  });

  self.addEventListener('fetch', async (evt) => {
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
          caches.open(DATA_BUDGET).then(cache => {
            return fetch(evt.request)
              .then(response => {
                // If the response was good, clone it and store it in the cache.
                if (response.status === 200) {
                  cache.put(evt.request.url, response.clone());
                }
    
                return response;
              })
              .catch(err => {
                // Network request failed, try to get it from the cache.
                return cache.match(evt.request);
              });
          }).catch(err => console.log(err))
        );
    
        return;
      }

        evt.respondWith(
            caches.open(STATIC_BUDGET).then(cache => {
              return cache.match(evt.request).then(response => {
                return response || fetch(evt.request);
              });
            })
          );
    })