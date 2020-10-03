/**
 * @overview Plugin which loads first and allows you to add custom objects or
 *     parameters into the options object used by all subsequent TDS plugins or
 *     provide helper functions on the TDS or app object as needed.
 */

/* eslint-disable no-console */

(function(root) {

    'use strict';

    /**
     * Runs any pre-load logic defined for the server. The default
     * implementation defines a log_filter routine for trimming log output.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            meta,
            TDS,
            watchurl;

        app = options.app;
        TDS = app.TDS;

        //  NOTE this plugin loads prior to the logger so our best option here
        //  is to use the prelog function to queue logging output.
        meta = {
            type: 'plugin',
            name: 'preload'
        };
        TDS.prelog('system', 'executing hook function', meta);

        watchurl = TDS.getcfg('tds.watch.uri');

        //  ---
        //  TDS Logger Options
        //  ---

        /**
         * Provides a useful 'skip' function for the Express logger. This will
         * filter out a lot of logging overhead that might otherwise occur when
         * the TDS is being accessed.
         * @returns {Boolean} true to skip logging the current request.
         */
        TDS.log_filter = function(req, res) {
            // Don't log repeated calls to the watcher URL.
            if (req.path.indexOf(watchurl) !== -1) {
                return true;
            }
        };

        //  ---
        //  TDS CouchDB Options (Sample)
        //  ---

        /**
         * Sample TDS couch feed.filter update to eliminate all filtering.
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
