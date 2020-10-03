/**
 * @overview Redis-based session store for authenticated TDS sessions.
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
            provider,
            url,
            host,
            port,
            sessionstore,
            store,
            params,
            pass;

        app = options.app;
        TDS = app.TDS;

        sessionstore = require('sessionstore');

        params = {};
        params.type = 'redis';

        //  Process any REDIS environment variables to get preferred settings.
        provider = process.env.REDIS_PROVIDER || 'REDIS_URL';
        url = process.env[provider];
        if (url) {
            if (/:\/\//.test(url)) {
                url = url.slice(url.indexOf('://') + 3);
            }

            if (/:\d+$/.test(url)) {
                port = url.slice(url.lastIndexOf(':') + 1);
                host = url.slice(0, url.lastIndexOf(':'));
            } else {
                host = url;
            }
        }

        params.host = host || TDS.cfg('tds.session.host') || '127.0.0.1';
        params.port = port || TDS.cfg('tds.session.port') || 6379;

        params.prefix = TDS.cfg('tds.session.db') || 0;
        params.prefix = TDS.cfg('tds.session.prefix') || 'sess';
        params.timeout = TDS.cfg('tds.session.timeout') || 15000;

        //  check for authentication
        pass = process.env.REDIS_PWD;
        if (TDS.notEmpty(pass)) {
            params.password = pass;
        }

        store = sessionstore.createSessionStore(params);

        return store;
    };

}(this));
