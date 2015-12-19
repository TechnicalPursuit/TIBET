/**
 * @overview Basic session configuration for the TDS. The default will set up a
 *     session by loading whichever store is configured by tds.session.store.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

    'use strict';

    var cookieKey,          // Key for cookie configuration.
        cookieParser,       // Express cookie parser.
        secretKey,          // Secrete key value.
        session,            // Express session management.
        store;              // Session store.

    cookieParser = require('cookie-parser');
    session = require('express-session');

    module.exports = function(options) {
        var app,
            name,
            TDS;

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        TDS = app.TDS;

        //  NOTE:   this must be initialized before any session is.
        cookieKey = TDS.cfg('tds.cookie.key1') || 'T1B3TC00K13';
        app.use(cookieParser(cookieKey));

        //  Require in the session store, allowing it to be separately
        //  configured for MemoryStore, Redis, Couch, etc.
        name = TDS.cfg('tds.session.store');
        store = require('./' + name + '-store')(options);

        secretKey = TDS.cfg('tds.secret.key') || 'ThisIsNotSecureChangeIt';

        //  Configure a simple memory session by default.
        app.use(session({
            secret: secretKey,
            resave: false,
            saveUninitialized: false,
            store: store,
            cookie: {
                secure: false,  //  Only for HTTPS
                httpOnly: true
            }
        }));

    };

}());
