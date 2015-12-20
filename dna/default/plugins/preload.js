/**
 * @overview Plugin which loads first and allows you to add custom objects or
 *     parameters into the options object used by all subsequent TDS plugins or
 *     provide helper functions on the TDS or app object as needed.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/* eslint-disable no-console */

(function(root) {

    'use strict';

    /**
     * Runs any pre-load logic defined for the server. The default
     * implementation defines a logger_filter routine for trimming log output.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            level,
            TDS;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        TDS = app.TDS;

        //  NOTE this plugin loads prior to the logger so our only option is to
        //  use the console for output meaning we must level check ourselves.
        level = TDS.cfg('tds.log.level') || 'info';
        if (level === 'debug') {
            console.log('debug: Executing TDS preload hook.');
        }

        //  ---
        //  TDS Logger Options
        //  ---

        /**
         * Provides a useful 'skip' function for the Express logger. This will
         * filter out a lot of logging overhead that might otherwise occur when
         * the TDS is being accessed.
         * @returns {Boolean} true to skip logging the current request.
         */
        TDS.logger_filter = function(req, res) {
            var url;

            url = TDS.getcfg('tds.watch.uri');

            // Don't log repeated calls to the watcher URL.
            if (req.path.indexOf(url) !== -1) {
                return true;
            }
        };

        //  ---
        //  TDS CouchDB Options (Sample)
        //  ---

        /**
         * Sample tds-couch feed.filter update to eliminate all filtering.
         */
        /*
        options.tds_couch = options.tds_couch || {};
        options.tds_couch.filter = function(doc) {
            //  Don't filter any documents, let them all trigger change.
            return true;
        };
        */
    };

}(this));
