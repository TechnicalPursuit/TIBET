/**
 * @overview Redis-based session store for authenticated TDS sessions.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Creates and returns a Redis-based session store for use with the TDS. The
     * parameters used are defined by the 'sessionstore' module's requirements.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            TDS,
            sessionstore,
            params,
            pass;

        app = options.app;
        TDS = app.TDS;

        sessionstore = require('sessionstore');

        params = {};
        params.type = 'redis';

        params.host = TDS.cfg('tds.session.host') || '127.0.0.1';
        params.port = TDS.cfg('tds.session.port') || 6379;
        params.prefix = TDS.cfg('tds.session.db') || 0;
        params.prefix = TDS.cfg('tds.session.prefix') || 'sess';
        params.timeout = TDS.cfg('tds.session.timeout') || 15000;

        //  check for authentication
        pass = process.env.REDIS_PWD;
        if (TDS.notEmpty(pass)) {
            params.password = pass;
        }

        return sessionstore.createSessionStore(params);
    };

}(this));
