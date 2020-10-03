/**
 * @overview CouchDB-based session store for authenticated TDS sessions.
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
            TDS,
            sessionstore,
            params,
            config;

        app = options.app;
        TDS = app.TDS;

        sessionstore = require('sessionstore');

        config = TDS.getCouchParameters();

        params = {};
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
