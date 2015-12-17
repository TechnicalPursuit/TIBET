/**
 * @overview Connect/Express middleware supporting the various aspects of TDS
 *     (TIBET Data Server) functionality. Primary goals of the TDS are to
 *     provide focused REST data access and support TIBET development.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

    'use strict';

    //  ---
    //  WebDAV Middleware
    //  ---

    /**
     * Provides routing to the jsDAV module for WebDAV support. The primary
     * purpose of this middleware is to give TIBET a way to update the server
     * without relying on any non-standard APIs or server functionality.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            jsDAV,
            jsDAV_CORS,
            loggedIn,
            logger,
            mount,
            node,
            path,
            TDS;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        loggedIn = options.loggedIn;
        logger = options.logger;
        TDS = app.TDS;

        //  Turn on support for webdav verbs? Off by default for profiles other
        //  than 'development' since this adds PUT, DELETE, etc.
        if (TDS.cfg('tds.use.webdav') !== true) {
            return;
        }
        logger.debug('Activating TDS WebDAV plugin.');

        //  ---
        //  Requires
        //  ---

        path = require('path');
        jsDAV = require('jsDAV/lib/jsdav');
        jsDAV_CORS = require('jsDAV/lib/DAV/plugins/cors');

        //  Ensure we have default option slotting for this plugin.
        options.tds_webdav = options.tds_webdav || {};

        node = path.resolve(TDS.expandPath(TDS.getcfg('tds.webdav.root')));

        //  NB: The mount is set to '/' because it is already relative to the
        //  route that got us here (when we got installed as middleware).
        mount = TDS.getcfg('tds.webdav.mount') || '/';

        //  ---
        //  Middleware
        //  ---

        TDS.webdav = function(req, res, next) {

            //  A little strange but this causes the jsDAV module to position
            //  itself relative to the "mount point" and then invoke it's
            //  handler logic to process the request/response pair.
            jsDAV.mount({
                node: node,
                mount: mount,
                server: req.app,
                standalone: false,
                plugins: jsDAV_CORS
            }).exec(req, res);

        };

        //  ---
        //  Routes
        //  ---

        app.use(TDS.cfg('tds.webdav.uri'), loggedIn, TDS.webdav);
    };

}());

