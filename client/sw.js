//importScripts('/src/assets/idb.js');
//importScripts('/src/assets/sw-utils.js');
var CACHE_STATIC = 'static-v2';
var CACHE_DYNAMIC = 'dynamic-v2';

self.addEventListener('install', function(e) {
	//console.log('SW installed')
	e.waitUntil(
		caches
			.open(CACHE_STATIC)
			.then((cache) => {
				cache.addAll([
					'/',
					'/index.html',
					'/bundle.css',
					'/bundle.js',
					'/assets/favicon.png',
					//'/assets/surkls_logo.png',
					//'/src/assets/idb.js',
					//'/src/assets/sw-utils.js',
          'https://fonts.googleapis.com/css?family=Comfortaa:700|Didact+Gothic|Josefin+Sans:700',
          'https://fonts.gstatic.com/s/comfortaa/v22/1Pt_g8LJRfWJmhDAuUsSQamb1W0lwk4S4Y_LDrMfJh1Zyc61YA.woff',
          'https://fonts.gstatic.com/s/didactgothic/v12/ahcfv8qz1zt6hCC5G4F_P4ASlUuYpmDmYyU.woff2'
				]);
			})
			.catch((err) => console.log(err))
	);
});
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
self.addEventListener('activate', function(e) {
	e.waitUntil(
		caches.keys().then(function(keyList) {
			keyList.forEach(function(key) {
				if (key !== CACHE_STATIC && key !== CACHE_DYNAMIC) {
					console.log('deleted ', key);
					caches.delete(key);
				}
			});
		})
	);
	return self.clients.claim();
});
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
/* self.addEventListener('fetch', function(e) {
	let assets = '/assets';
	let surkl = '/surkl';
	let settings = '/settings';
  let session = 'session';

  if(e.request.url.indexOf('iframe_api') < 0 && e.request.url.indexOf('/www-widgetapi.js') < 0
   && e.request.url.indexOf('/api')<0 
  && e.request.url.indexOf('/account')< 0 && e.request.url.indexOf('/auth')< 0 && 
  e.request.url.indexOf('/socket.io')< 0 && e.request.url.indexOf('/sockjs-node')< 0) {
    e.respondWith(
      caches.match(e.request.url).then(function(res) {     
        if(res){
          //console.log('yes',res)
          return res;
        } else {       
          return fetch(e.request.url).then((resp) => {
            //console.log('no', resp)
            return caches.open(CACHE_DYNAMIC).then((cache) => {
              cache.put(e.request.url, resp.clone());
              return resp;
            });
          });
        }    
      })
    );
  }
	
}); */
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
/* self.addEventListener('sync', function(e){
  if(e.tag==='sync-gif-post'){
    e.waitUntil(
      readData('syncedGifs')
      .then(function(syncData){
        for(var dt of syncData){
          console.log('sending', dt)
          var postData = new FormData();
          postData.append('user', dt.user);
          postData.append('name', dt.name);
          postData.append('file', dt.file, dt.name+'.png');
           fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: postData
          }).then(function(res){
            console.log(res)
            if(res.ok){
              res.json().then(function(resData){
                console.log('deleted')
                console.log(resData.name)
                deleteOne('syncedGifs', resData.name)
              })
            }
          })
        }
      })
    )
  }
}) */
