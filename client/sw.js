self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open('video-store').then(function(cache) {
     return cache.addAll([
       '/',
       'index.html',
       'js/script.js',
       'css/style.css',
       'css/bootstrap.min.css',
       'compressor/compressor.min.js',
       'dragdroptouch-master/DragDropTouch.js',
       'img/asset1.png',
       'img/bucket.png',
       'img/calendar.png',
       'img/male.png',
       'img/plant.png',
       'img/scissors.png',
       'img/sprout.png',
       'img/watering-can.png',

      //  '/pwa-examples/a2hs/images/fox2.jpg',
      //  '/pwa-examples/a2hs/images/fox3.jpg',
      //  '/pwa-examples/a2hs/images/fox4.jpg'
     ]);
   })
 );
});

self.addEventListener('fetch', function(e) {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
