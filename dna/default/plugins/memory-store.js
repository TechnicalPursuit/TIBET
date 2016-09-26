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
     * Creates an empty memory-based store instance for use in temporary
     * session management. Not intended for production use!
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            logger,
            sessionstore;

        app = options.app;
        logger = options.logger;

        logger.debug('Integrating TDS session store (memory).');

        sessionstore = require('sessionstore');

        return sessionstore.createSessionStore();
    };

}(this));
