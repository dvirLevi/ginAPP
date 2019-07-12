// const version = "?0_1" 

self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open('gin-app').then(function(cache) {
     return cache.addAll([
       '/',
      //  'index.html'+version,
      //  'js/script.js'+version,
      //  'css/style.css'+version,
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
       'img/coffee.png',
       'img/bac.png',

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
