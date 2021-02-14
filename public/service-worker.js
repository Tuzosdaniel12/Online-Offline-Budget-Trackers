const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/styles.css',
  '/indexDB.js',
  '/index.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
  'https://use.fontawesome.com/releases/v5.8.2/css/all.css'
];

// const CACHE_NAME = "static-cache-v2";
// const DATA_CACHE_NAME = "data-cache-v1";

// install
self.addEventListener("install", (evt)=> {
    // pre cache image data
    evt.waitUntil(async () => {
        const dataCache = await caches.open(DATA_CACHE_NAME);
        await dataCache.add("/api/transaction");
    })

    evt.waitUntil(async () => {
        const staticCache = await caches.open(CACHE_NAME);
        await staticCache.add(FILES_TO_CACHE);
    })
      
    // tell the browser to activate this service worker immediately once it
    // has finished installing
    self.skipWaiting()
});

self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
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
    // cache successful requests to the API
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(async () => {

        try {
            const cache = await  caches.open(DATA_CACHE_NAME)
            const response = await fetch(evt.request)

            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
            }

            return response;

            } catch (error) {
            // Network request failed, try to get it from the cache.
            return cache.match(evt.request);
            }
            });
        }


    evt.respondWith(async () => {
        const response = await caches.match(evt.request)
        return response || fetch(evt.request)
    })
})