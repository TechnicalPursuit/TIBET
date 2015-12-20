/**
 * @overview Loader for any modules found in the mocks directory. The idea is
 *     these routes load before the main routes module so when development or
 *     test is true the first middleware to match wins, hence the mocks win.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Loads any routes found in the project mocks directory. These load prior
     * to the actual routes which allows them to short-circuit normal route
     * handlers and to process the overlaid routes with a mock result.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            env,
            logger,
            mocks,
            parsers,
            requireDir,
            TDS;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        logger = options.logger;
        TDS = app.TDS;

        //  Should we add a route for driving the tibet command line tools from
        //  the client? Off by default for profiles other than 'development'.
        if (TDS.cfg('tds.use.mocks') !== true) {
            return;
        }
        logger.debug('Integrating TDS mock routes.');

        //  ---
        //  Requires
        //  ---

        requireDir = require('require-dir');
        mocks = requireDir('../mocks');

        //  ---
        //  Variables
        //  ---

        parsers = options.parsers;

        //  ---
        //  Routes
        //  ---

        env = app.get('env');
        if (env === 'development' || env === 'test') {
            Object.keys(mocks).forEach(function(mock) {
                app.use('/', parsers.json, parsers.urlencoded, mocks[mock]);
            });
        }
    };

}(this));
