/**
 * @overview Loads any routes found in the routes directory and ensures they
 *     leverage the proper body parsers.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

    'use strict';

    var requireDir,
        routes;

    requireDir = require('require-dir');
    routes = requireDir('../routes');

    module.exports = function(options) {
        var app,
            parsers;

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        parsers = options.parsers;

        Object.keys(routes).forEach(function(route) {
            app.use('/', parsers.json, parsers.urlencoded, routes[route]);
        });
    };

}());
