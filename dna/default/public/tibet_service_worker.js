//  Add a listener to intercept 'install' events for when Service Worker is
//  installed.
self.addEventListener('install', function(event) {

    //  Activate worker immediately
    event.waitUntil(self.skipWaiting());
});

//  ----------------------------------------------------------------------------

//  Add a listener to intercept 'activate' events for when Service Worker is
//  activated.
self.addEventListener('activate', function(event) {

    //  Become available to all pages
    event.waitUntil(self.clients.claim());
});

//  ----------------------------------------------------------------------------

//  Add a listener to intercept 'message' events. This is used to trap messages
//  that TIBET is sending from the main window.
self.addEventListener('message', function(event) {

    self.receiveMessageFromPage(event.data);

    event.ports[0].postMessage({
        error: null,
        msg: 'ok'
    });
});

//  ----------------------------------------------------------------------------

//  Add a listener to intercept 'fetch' events.
self.addEventListener('fetch', function(event) {

    var url,
        filename,

        promise,

        isTIBETLibFile,

        shouldWarn;

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
                //  See if we find a match of the 'filename' in the cache.
                return cache.match(filename);
            }).then(function(response) {
                if (response) {
                    //  Found a match - return its content
                    return response.text();
                }

                //  Didn't find a match. Post a message over to the main window
                //  asking if it can create a module for us based on the
                //  filename.
                return self.clients.matchAll().then(
                    function(clients) {
                        return self.sendMessageToPage(
                            clients[0],
                            {
                                command: 'createModule',
                                payload: filename
                            });
                    }).then(function(result) {
                        return result.payload;
                    });
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

            event.respondWith(promise);

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

        //  If the 'cfg' variable is available and has it's 'debug.cache'
        //  flag set to true, then we will warn about cache misses.
        if (self.cfg && self.cfg['debug.cache'] === true) {
            shouldWarn = true;
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

        //  NB: We treat the TIBET library file specially. It will load through
        //  an *app* path, but we cache it with the *lib* files. That way, if
        //  we're in developer mode and we're not caching the application files,
        //  we still are caching the TIBET library file.
        isTIBETLibFile = /tibet.*\.min.js$/.test(url);

        /* eslint-disable no-console */
        if (url.startsWith(self.libResourcePath) || isTIBETLibFile) {

            promise = caches.open('TIBET_LIB_CACHE').then(
                            function(cache) {
                                return cache.match(event.request);
                            }).then(function(response) {
                                if (!response) {
                                    if (shouldWarn) {
                                        console.warn(
                                            'CACHE MISS ON LIB RESOURCE: ' +
                                            url);
                                    }

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
                                    if (shouldWarn) {
                                        console.warn(
                                            'CACHE MISS ON APP RESOURCE: ' +
                                            url);
                                    }

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

//  ----------------------------------------------------------------------------

self.receiveMessageFromPage = function(msgObjContent) {

    /**
     * @method receiveMessageFromPage
     * @summary Receives a message (via postMessage) from this worker's
     *     controlling page.
     * @param {Object} msgObjContent The POJO object that contains data received
     *     from the controlling page.
     */

    var propData,
        key;

    switch (msgObjContent.command) {
        case 'setcfg':
            self.cfg = JSON.parse(msgObjContent.payload);
            self.libResourcePath = self.cfg['boot.lib_resource_path'];
            self.appResourcePath = self.cfg['boot.app_resource_path'];
            break;
        case 'setcfgprop':
            propData = JSON.parse(msgObjContent.payload);
            key = Object.keys(propData)[0];
            self.cfg[key] = propData[key];
            break;
        default:
            break;
    }
};

//  ----------------------------------------------------------------------------

self.sendMessageToPage = function(client, msgObjContent) {

    /**
     * @method sendMessageToPage
     * @summary Sends a message (via postMessage) to this worker's controlling
     *     page.
     * @param {Window} client The window to post the message on.
     * @param {Object} msgObjContent The POJO object that contains data to send
     *     to the controlling page.
     * @returns {Promise} A Promise that will resolve when the ServiceWorker has
     *     been sent the message and we have received a reply.
     */

    var listenerPromise;

    listenerPromise = new Promise(
        function(resolver, rejector) {
            var messageChannel;

            messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = function(event) {
                if (event.data.error) {
                    rejector(event.data.error);
                } else {
                    resolver(event.data);
                }
            };

            client.postMessage(msgObjContent, [messageChannel.port2]);
        });

    return listenerPromise;
};

