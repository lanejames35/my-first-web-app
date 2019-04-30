// Listen for the install event then open a new cache
var cacheName = 'weatherPWA-shellv2';
var dataCacheName = 'weatherPWA-datav2';
var filesToCache = [
  '/my-first-web-app',
  '/my-first-web-app/index.html',
  '/my-first-web-app/favicon.ico',
  '/my-first-web-app/manifest.json',
  '/my-first-web-app/styles/ud811.css',
  '/my-first-web-app/scripts/app.js',
  '/my-first-web-app/scripts/localforage.min.js',
  '/my-first-web-app/images/clear.png',
  '/my-first-web-app/images/cloudy_s_sunny.png',
  '/my-first-web-app/images/cloudy-scattered-showers.png',
  '/my-first-web-app/images/cloudy.png',
  '/my-first-web-app/images/fog.png',
  '/my-first-web-app/images/ic_add_white_24px.svg',
  '/my-first-web-app/images/ic_refresh_white_24px.svg',
  '/my-first-web-app/images/partly-cloudy.png',
  '/my-first-web-app/images/rain.png',
  '/my-first-web-app/images/scattered-showers.png',
  '/my-first-web-app/images/sleet.png',
  '/my-first-web-app/images/snow.png',
  '/my-first-web-app/images/thunderstorm.png',
  '/my-first-web-app/images/wind.png'
];
var weatherAPIUrlBase = 'https://publicdata-weather.firebaseio.com/';

self.addEventListener('install', function(event){
  event.waitUntil(
      caches.open(cacheName).then(function(cache){
        console.log('ServiceWorker [Adding to cache]')
        return cache.addAll(filesToCache);
      })
  );
});

// Active event to remove old resources from the cache
self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keyList){
      return Promise.all(keyList.map(function(key){
        if(key !== cacheName && key !== dataCacheName){
          console.log('ServiceWorker [Removing from cache]', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// Serve requested resources or pull from the cache
self.addEventListener('fetch', function(event){
  console.log('[ServiceWorker Fetch]', event.request.url);
  // Run when a call to the data API is made
  if(event.request.url.startsWith(weatherAPIUrlBase)){
    event.respondWith(
      // Get the data
      fetch(event.request).then(function(response){
        // Clone the response and put it in the data cache
        return caches.open(dataCacheName).then(function(cache){
          cache.put(event.request.url, response.clone());
          console.log('ServiceWorker [Cloned + cached data]');
          // return the inital API request
          return response;
        });
      }).catch(function(error){
          console.log(error);
      })
    );
  } else {
    // When no API call
      event.respondWith(
        // compare the cache with the requested rerouce
        caches.match(event.request).then(function(response){
          return response || fetch(event.request);
        })
      );  
  }
});