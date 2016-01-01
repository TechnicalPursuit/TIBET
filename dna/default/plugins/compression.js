/**
 * @overview Simple compression plugin for the TDS.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Configures a JSON and urlencoded body parser instance and applies them to
     * the options object for use by later plugins. The authentication plugin is
     * a good example of a parser consumer.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            compression,
            logger;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        logger = options.logger;

        logger.debug('Integrating TDS compression.');

        //  ---
        //  Requires
        //  ---

        compression = require('compression');

        //  ---
        //  Middleware
        //  ---

        app.use(compression());
    };

}(this));
