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
     * Configure the PouchDB instance for the project, if tds.use_pouch is true.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            DefaultPouch,
            expressPouch,
            name,
            PouchDB,
            prefix,
            route,
            TDS;

        app = options.app;
        TDS = app.TDS;

        //  ---
        //  Requires
        //  ---

        PouchDB = require('pouchdb');
        expressPouch = require('express-pouchdb');

        //  ---
        //  Variables
        //  ---

        name = TDS.cfg('tds.pouch.name') || 'tds';
        prefix = TDS.cfg('tds.pouch.prefix') || 'pouch';
        prefix = './' + prefix + '/';
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
