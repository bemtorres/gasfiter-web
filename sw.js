

const CACHE_STATIC_NAME  = 'static-v1';
const CACHE_DYNAMIC_NAME = 'dynamic-v1';
const CACHE_INMUTABLE_NAME = 'inmutable-v1';

const CACHE_DYNAMIC_LIMIT = 50;


function limpiarCache( cacheName, numeroItems ) {
    caches.open( cacheName )
        .then( cache => {
            return cache.keys()
                .then( keys => {
                    
                if ( keys.length > numeroItems ) {
                    cache.delete( keys[0] )
                        .then( limpiarCache(cacheName, numeroItems) );
                }
            });            
        });
}

self.addEventListener('activate', e =>{
    
    const activacion = caches.keys().then(keys=>{
        keys.forEach(key =>{
            if(key !== CACHE_STATIC_NAME && key.includes('static')){ // ES DIFERENTE
                return caches.delete(key);
            }
        });
    });

    e.waitUntil(activacion);
});

self.addEventListener('install', e => {


    const cacheProm = caches.open( CACHE_STATIC_NAME )
        .then( cache => {
            
            return cache.addAll([
                '/',
                '/index.html',
                '/css/style.css',
                '/js/app.js',
                '/images/img/constru.png',
                '/css/pluton.css',
                '/images/ico/icons.png',
                '/images/ico/favicon.ico'
            ]);

        
        });

    const cacheInmutable = caches.open( CACHE_INMUTABLE_NAME )
            .then( cache => {
            
                return cache.addAll([
                    '/css/animate.css',
                    'https://use.fontawesome.com/releases/v5.7.2/css/all.css',
                    '/css/bootstrap.css',
                    '/css/jquery.bxslider.css',
                    '/css/jquery.cslider.css',
                    '/css/bootstrap-responsive.css',
                    '/js/jquery.js',
                    '/js/jquery.mixitup.js',
                    '/js/bootstrap.js',
                    '/js/modernizr.custom.js',
                    '/js/jquery.bxslider.js',
                    '/js/jquery.cslider.js',
                    '/js/jquery.placeholder.js',
                    '/js/jquery.inview.js',
                    '/js/jquery.bxslider.js',
                    'http://fonts.googleapis.com/css?family=Roboto:400,300,700&amp;subset=latin,latin-ext'
                ]);
    
            
            });
    e.waitUntil( Promise.all([cacheProm, cacheInmutable]) );

});


self.addEventListener('fetch', e=>{

    //2- Cache with Network Fallback
    const respuesta = caches.match( e.request )
        .then( res => {


            console.log(res);

            if ( res ) return res;

            // No existe el archivo
            // tengo que ir a la web

            return fetch( e.request ).then( newResp => {

                caches.open( CACHE_DYNAMIC_NAME )
                    .then( cache => {
                        cache.put( e.request, newResp );
                        limpiarCache( CACHE_DYNAMIC_NAME, CACHE_DYNAMIC_LIMIT );
                    });

                return newResp.clone();
            }).catch(err => {
                if(e.request.headers.get('accept').includes('text/html') ){
                    return caches.match('/pages/offline.html');
                }
               
            });

        });

        e.respondWith( respuesta );

});






    