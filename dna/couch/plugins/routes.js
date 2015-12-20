/**
 * @overview Loads any routes found in the routes directory and ensures they
 *     leverage the proper body parsers.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Loads any routes found in the project routes directory. These load after
     * any mock routes in the mocks directory so they may not always be reached.
     * NOTE that routes whose file name starts with 'public' and a separator
     * such as dot, underscore, or dash will be loaded without requiring the
     * loggedIn helper in the middleware pipeline.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            loggedIn,
            logger,
            parsers,
            requireDir,
            routes;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        logger = options.logger;
        loggedIn = options.loggedIn;

        logger.debug('Integrating TDS pluggable routes.');

        //  ---
        //  Requires
        //  ---

        requireDir = require('require-dir');
        routes = requireDir('../routes');

        //  ---
        //  Variables
        //  ---

        parsers = options.parsers;

        //  ---
        //  Routes
        //  ---

        Object.keys(routes).forEach(function(route) {

            //  If the route name (file name) starts with public then we skip
            //  having the loggedIn middleware in the pipeline for the route.
            if (route.indexOf('public[_.-]') === 0) {
                app.use('/', parsers.json, parsers.urlencoded, routes[route]);
            } else {
                //  NOTE the use of the loggedIn helper here. All routes loaded in
                //  this fashion are assumed to require a login to access them.
                app.use('/', parsers.json, parsers.urlencoded, loggedIn, routes[route]);
            }
        });
    };

}(this));
