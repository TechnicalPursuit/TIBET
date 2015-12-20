/**
 * @overview Trivial memory store constructor for default TDS sessions.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Creates an empty Express MemoryStore instance for use in temporary
     * session management. Not intended for production use!
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            logger,
            MemoryStore,
            session;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        logger = options.logger;

        logger.debug('Integrating TDS session store (memory).');

        //  ---
        //  Requires
        //  ---

        session = require('express-session');

        //  ---
        //  Initialization
        //  ---

        MemoryStore = session.MemoryStore;

        return new MemoryStore();
    };

}(this))
