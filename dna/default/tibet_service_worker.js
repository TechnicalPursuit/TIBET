//  Add a listener to intercept 'install' events for when Service Worker is
//  installed.
self.addEventListener('install', function(event) {

    //  Activate worker immediately
    event.waitUntil(self.skipWaiting());
});

//  Add a listener to intercept 'activate' events for when Service Worker is
//  activated.
self.addEventListener('activate', function(event) {

    //  Become available to all pages
    event.waitUntil(self.clients.claim());
});

//  Add a listener to intercept 'message' events. This is used to trap messages
//  that TIBET is sending from the main window.
self.addEventListener('message', function(event) {

    var propData,
        key;

    switch (event.data.command) {
        case 'setcfg':
            self.cfg = JSON.parse(event.data.payload);
            self.libResourcePath = self.cfg['boot.lib_resource_path'];
            self.appResourcePath = self.cfg['boot.app_resource_path'];
            break;
        case 'setcfgprop':
            propData = JSON.parse(event.data.payload);
            key = Object.keys(propData)[0];
            self.cfg[key] = propData[key];
            break;
        default:
            break;
    }

    event.ports[0].postMessage({
        error: null,
        msg: 'ok'
    });
});

//  Add a listener to intercept 'fetch' events.
self.addEventListener('fetch', function(event) {

    var url,
        filename,

        promise;

    //  Grab the url that we're fetching.
    url = event.request.url;

    //  Grab it's filename.
    filename = url.slice(url.lastIndexOf('/') + 1);

    //  If the filename has no extension or it has a query string then it's a
    //  route that's not a file (probably a server call of some sort). Exit here
    //  without logging, allowing the server to vend back what it normally
    //  would.
    if (/\.\w+$/.test(filename) === false ||
        /\?.+=.+/.test(filename) === true) {
        return;
    }

    //  If the filename starts with 'TP_' and ends with '.js', then it's very
    //  likely that the caller is requesting an 'ECMA Module'ized version of a
    //  piece of TIBET code (usually pseudo-class definitions). In this case,
    //  look in a special cache set aside just for that that TIBET kernel code
    //  will have placed these specialized module definitions into.
    if (filename.startsWith('TP_')) {
        promise = caches.open('TIBET_PSEUDO_MODULE_CACHE').then(
            function(cache) {
                return cache.match(filename);
            }).then(function(response) {
                return response.text();
            }).then(function(text) {
                var resp;

                resp = new Response(
                    text,
                    {
                        headers: new Headers(
                            {'Content-Type': 'text/javascript'})
                    });

                return resp;
            });

    } else {

        //  If the 'cfg' variable is available and has it's 'boot.use_sw_cache'
        //  flag set to false, then (even though we're active), TIBET has
        //  decided that we're not supposed to be returning entries from our
        //  cache.
        if (self.cfg && self.cfg['boot.use_sw_cache'] === false) {
            //  TIBET has told us that we're not supposed to use our caches, so
            //  we'll return, allowing the regular HTTP machinery to take over
            //  and vend files back from the regular browser cache and/or
            //  server. Since this is by design, we won't log a message.
            return;
        }

        //  If the libResourcePath has not been configured, then we're not yet
        //  at a point where the service worker is being controlled by TIBET
        //  (probably in the earliest stages of loading before the loader's boot
        //  code has been called). In this case, we take our best guess (based
        //  on defacto TIBET standards) as to what the lib and app resource
        //  paths should be.
        if (!self.libResourcePath) {
            self.libResourcePath = self.location.origin + '/TIBET-INF/tibet/';
            self.appResourcePath = self.location.origin + '/';
        }

        /* eslint-disable no-console */
        if (url.startsWith(self.libResourcePath)) {

            promise = caches.open('TIBET_LIB_CACHE').then(
                            function(cache) {
                                return cache.match(event.request);
                            }).then(function(response) {
                                if (!response) {
                                    console.warn(
                                        'CACHE MISS ON LIB RESOURCE: ' + url);
                                    return fetch(event.request).then(
                                        function(resp) {
                                            return resp;
                                        });
                                } else {
                                    return response;
                                }
                            });

            event.respondWith(promise);

        } else if (url.startsWith(self.appResourcePath)) {

            promise = caches.open('TIBET_APP_CACHE').then(
                            function(cache) {
                                return cache.match(event.request);
                            }).then(function(response) {
                                if (!response) {
                                    console.warn(
                                        'CACHE MISS ON APP RESOURCE: ' + url);
                                    return fetch(event.request).then(
                                        function(resp) {
                                            return resp;
                                        });
                                } else {
                                    return response;
                                }
                            });

            event.respondWith(promise);

        } else {
            //  Loading resource from server.
            console.log('LOADING RESOURCE FROM SERVER: ' + url);
        }
        /* eslint-enable no-console */
    }
});
