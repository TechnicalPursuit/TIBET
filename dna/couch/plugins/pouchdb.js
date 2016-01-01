/**
 * @overview A TDS plugin to activate PouchDB storage on a particular route.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Configure the PouchDB instance for the project, if tds.use.pouch is true.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            DefaultPouch,
            expressPouch,
            logger,
            name,
            PouchDB,
            prefix,
            route,
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

        //  Turn on support for pouchdb? Off by default since it can add a bit
        //  of overhead to the init process and may not be desired.
        if (TDS.cfg('tds.use.pouch') !== true) {
            return;
        }
        logger.debug('Integrating TDS pouchdb storage.');

        //  ---
        //  Requires
        //  ---

        PouchDB = require('pouchdb');
        expressPouch = require('express-pouchdb');

        //  ---
        //  Variables
        //  ---

        name = TDS.cfg('tds.pouch.name') || 'tds';
        prefix = TDS.cfg('tds.pouch.prefix') || './prefix/';
        route = TDS.cfg('tds.pouch.route') || '/db';

        //  ---
        //  Initialization
        //  ---

        //  TODO: probably want to support memory based option by default and
        //  include the option to simply "route through" to backend couchdb.

        DefaultPouch = PouchDB.defaults({prefix: prefix});
        app.use(route, expressPouch(DefaultPouch));

        //  ---
        //  Sharing
        //  ---

        options.pouch = new DefaultPouch(name);

        return options.pouch;
    };

}(this));
