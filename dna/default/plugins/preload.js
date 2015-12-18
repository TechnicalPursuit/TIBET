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
(function() {

    'use strict';

    module.exports = function(options) {
        var app,
            TDS;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        TDS = app.TDS;

        if (!app) {
            throw new Error('No application instance provided.');
        }

        //  ---
        //  TDS CouchDB Hook Functions (Sample)
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

        /**
         * Sample tds-couch change handler override. The default will use the
         * TDS's TaskRunner to run simple workflows if tds.use.tasks is true.
         */
        /*
        options.tds_couch = options.tds_couch || {};
        options.tds_couch.change = function(change) {
            //console.log('CouchDB change:\n' +
             //   TDS.beautify(JSON.stringify(change)));
        };
        */
    };

}());
