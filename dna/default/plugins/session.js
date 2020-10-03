/**
 * @overview Basic session configuration for the TDS. The default will set up a
 *     session by loading whichever store is configured by tds.session.store.
 */

(function(root) {

    'use strict';

    /**
     * Creates the basic session infrastructure for the server. The value of the
     * tds.session.store variable is used with a '-store' suffix to find and
     * load the module responsible for constructing the session store object.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            cookieKey,          // Key for cookie configuration.
            cookieParser,       // Express cookie parser.
            logger,
            name,
            meta,
            sessionKey,         // Secret key value.
            session,            // Express session management.
            store,              // Session store.
            msg,
            TDS;

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        //  ---
        //  Requires
        //  ---

        cookieParser = require('cookie-parser');
        session = require('express-session');

        //  ---
        //  Variables
        //  ---

        //  NOTE:   this must be initialized before any session is.
        cookieKey = process.env.TDS_COOKIE_KEY1;
        if (TDS.isEmpty(cookieKey)) {
            msg = 'No cookie key for session. $ export TDS_COOKIE_KEY1="{secret}"';
            if (TDS.getEnv() !== 'development') {
                throw new Error(msg);
            }
            logger.warn(msg);
            cookieKey = 'T1B3TC00K13';
        }
        app.use(cookieParser(cookieKey));

        //  Require in the session store, allowing it to be separately
        //  configured for MemoryStore, Redis, Couch, etc.
        name = TDS.cfg('tds.session.store');
        meta = {
            type: 'TDS',
            name: 'session'
        };
        logger.system('loading ' + name + '-store', meta);

        store = require('./' + name + '-store')(options);

        sessionKey = process.env.TDS_SESSION_KEY;
        if (TDS.isEmpty(sessionKey)) {
            msg = 'No secret key for session. $ export TDS_SESSION_KEY="{secret}"';
            if (TDS.getEnv() !== 'development') {
                throw new Error(msg);
            }
            logger.warn(msg);
            sessionKey = 'T1B3TS3SS10N';
        }

        //  ---
        //  Middleware
        //  ---

        //  Configure the session and start using it.
        app.use(session({
            secret: sessionKey,
            resave: false,
            saveUninitialized: false,
            store: store,
            cookie: {
                secure: TDS.cfg('tds.https') === true,  //  Only for HTTPS
                httpOnly: true
            }
        }));
    };

}(this));
