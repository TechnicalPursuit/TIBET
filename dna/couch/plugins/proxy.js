/**
 * @overview Lightweight proxy handler which will route based on configured
 *     paths in the tds.json file (or code you implement here).
 */

/*
 *  A simple proxy handler that works based on a route/replace pair defined as:
 *
        "proxy": {
            "map": {
                "couch": {
                    "route": "/couch/*",
                    "replace": "http://127.0.0.1:5984/",
                    "public": false
                }
            }
        },
 */

(function(root) {

    'use strict';

    /**
     *
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            logger,
            request,
            map,
            keys,
            TDS,
            url;

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        //  Activate proxy middleware?
        if (TDS.cfg('tds.use_proxy') !== true) {
            return;
        }

        //  ---
        //  Requires
        //  ---

        request = require('request');
        url = require('url');

        //  ---
        //  Middleware
        //  ---

        map = TDS.cfg('tds.proxy.map');
        if (!map) {
            return;
        }

        //  Filter the map to get the unique list of routes being mapped.
        keys = Object.keys(map);
        keys = keys.filter(function(key) {
            return /\.route$/.test(key);
        });

        keys.forEach(function(key) {
            var name,
                route,
                handler,
                pub;

            //  Inbound key is the route key so fetch that first (what the route
            //  value should be for our app.all() call).
            route = TDS.cfg(key);

            //  Each key passed in at this level includes a trailing '.route'.
            //  We need to remove that and get the list of keys for route name.
            name = key.replace(/\.route$/, '');

            pub = map[name + '.public'];
            if (TDS.notValid(pub) || pub !== true) {
                pub = false;
            }

            logger.system('enabling proxy for ' + route);

            handler = function(req, res) {
                var regex,
                    replace,
                    path,
                    newpath;

                regex = new RegExp(route);
                if (!regex) {
                    logger.error('invalid proxy entry for ' + name +
                        ' (route not regex-compatible).');
                    return;
                }

                replace = map[name + '.replace'];
                if (!replace) {
                    logger.error('invalid proxy entry for ' + name +
                        ' (no replacement pattern).');
                    return;
                }

                path = url.parse(req.url).path;
                newpath = path.replace(regex, replace);

                req.pipe(request({
                    url: newpath,
                    qs: req.query,
                    method: req.method
                }, function(err, response, body) {
                    if (err) {
                        logger.error(err);
                    }
                })).pipe(res);
            };

            if (pub) {
                app.all(route, handler);
            } else {
                app.all(route, options.loggedInOrLocalDev, handler);
            }

        });
    };

}(this));
