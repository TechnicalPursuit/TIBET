/**
 * @overview Lightweight proxy handler which will route based on configured
 *     paths in the tds.json file (or code you implement here).
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/*
 *  A simple proxy handler that works based on a route/replace pair defined as:
 *
        "proxy": {
            "map": {
                "couch": {
                    "route": "/couch/*",
                    "replace": "http://127.0.0.1:5984/"
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

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        logger = options.logger;
        TDS = app.TDS;

        //  Activate proxy middleware?
        if (TDS.cfg('tds.use.proxy') !== true) {
            return;
        }
        logger.debug('Integrating TDS proxy route handler.');

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
            var entry,
                name,
                route;

            //  Inbound key is the route key so fetch that first (what the route
            //  value should be for our app.all() call).
            route = TDS.cfg(key);

            //  Each key passed in at this level includes a trailing '.route'.
            //  We need to remove that and get the list of keys for route name.
            name = key.replace(/\.route$/, '');

            app.all(route, function(req, res) {
                var pattern,
                    regex,
                    replace,
                    path,
                    newpath;

                regex = new RegExp(route);
                if (!regex) {
                    logger.error('Invalid proxy entry for ' + name +
                        ' (route not regex-compatible).');
                    return;
                }

                replace = map[name + '.replace'];
                if (!replace) {
                    logger.error('Invalid proxy entry for ' + name +
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
            });
        });
    };

}(this));
