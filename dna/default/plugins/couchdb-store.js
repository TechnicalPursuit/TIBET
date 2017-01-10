/**
 * @overview CouchDB-based session store for authenticated TDS sessions.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Creates and returns a new CouchDB-based session store. Configuration
     * parameters are based on the needs of the 'sessionstore' module and the
     * underlying 'cradle' module it uses to connect to CouchDB. See the
     * documentation on those two modules for more information.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            logger,
            meta,
            TDS,
            sessionstore,
            params,
            config;

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        meta = {
            type: 'plugin',
            name: 'couchdb-store'
        };
        logger.system('integrating couchdb session store', meta);

        sessionstore = require('sessionstore');

        config = TDS.getCouchParameters();

        /* eslint-disable object-curly-newline */
        params = {};
        /* eslint-enable object-curly-newline */
        params.type = 'couchdb';

        params.host = TDS.cfg('tds.session.db_host') || config.db_host;
        params.port = TDS.cfg('tds.session.db_port') || config.db_port;
        params.dbName = TDS.cfg('tds.session.db_name') || 'tds-sessions';
        params.collectionName = TDS.cfg('tds.session.collection') || 'sessions';
        params.timeout = TDS.cfg('tds.session.timeout') || 15000;

        if (TDS.notEmpty(config.db_user) && TDS.notEmpty(config.db_pass)) {
            params.options = {
                secure: true,
                auth: {
                    username: config.db_user,
                    password: config.db_pass
                }
            };
        }

        return sessionstore.createSessionStore(params);
    };

}(this));
