//importScripts('/src/assets/idb.js');
//importScripts('/src/assets/sw-utils.js');
var CACHE_STATIC = 'static-v1';
var CACHE_DYNAMIC = 'dynamic-v1';

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
					//'/src/assets/idb.js',
					//'/src/assets/sw-utils.js',
					'https://fonts.googleapis.com/css?family=Comfortaa:700|Didact+Gothic|Josefin+Sans:700'
				]);
			})
			.catch((err) => console.log(err))
	);
});
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys()
    .then(function(keyList){
      keyList.forEach(function(key){
          if(key !== CACHE_STATIC && key !== CACHE_DYNAMIC){
            console.log('deleted ', key)
            caches.delete(key);
          }    
      })
    })
  )
  return self.clients.claim();
});
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
self.addEventListener('fetch', function(e) {
  let assets = '/assets';
  let surkl = '/surkl';
  let settings = '/settings';
  let session  = 'session';
  //console.log(e)
  if (e.request.url.indexOf(assets) > -1) {
		return fetch(e.request).then((resp)=> {
      /* caches.match(e.request.url).then(function(response) {
        
      }) */
		   caches.open(CACHE_DYNAMIC).then((cache)=> {
        cache.put(e.request.url, resp.clone());
        console.log(resp)
				return resp;
			});
		});
	} else if(e.request.url.indexOf('iframe_api')<0) {
    if(e.request.url.indexOf(settings)>-1 || e.request.url.indexOf(session)>-1 || 
    e.request.url === 'http://localhost:4000/' || e.request.url.indexOf('bundle')>-1 ){
      e.respondWith(
        caches.match(e.request.url).then(function(response) {
          return response || fetch(e.request.url);
        })
      );
    }   
  } 
 /*  if( e.request.url.indexOf(settings)>-1 || 
  e.request.url.indexOf(session)>-1 && e.request.url.indexOf('/api')==-1 ){
    e.respondWith(
      caches.match('/index.html')
      .then(function(res){
        console.log(res)
        return res;
      })
    )
  } else  */
});
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