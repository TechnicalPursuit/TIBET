/**
 * @overview A TDS plugin to activate PouchDB storage on a particular route.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

    'use strict';

    var PouchDB;

    module.exports = function(options) {
        var app,
            DefaultPouch,
            expressPouch,
            prefix,
            route,
            TDS;

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        TDS = app.TDS;

        //  Turn on support for pouchdb? Off by default since it can add a bit
        //  of overhead to the init process and may not be desired.
        if (TDS.cfg('tds.use.pouchdb') !== true) {
            return;
        }

        PouchDB = require('pouchdb');
        expressPouch = require('express-pouchdb');

        prefix = TDS.cfg('tds.pouchdb.prefix') || './prefix/';
        route = TDS.cfg('tds.pouchdb.route') || '/db';

        //  TODO: probably want to support memory based option by default and
        //  include the option to simply "route through" to backend couchdb.

        DefaultPouch = PouchDB.defaults({prefix: prefix});
        app.use(route, expressPouch(DefaultPouch));

        return new DefaultPouch('tds');
    };

}());
