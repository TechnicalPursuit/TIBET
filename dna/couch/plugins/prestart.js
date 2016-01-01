/**
 * @overview A pre-startup hook file for the TDS.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Perform any pre-start processing. This runs after all plugins have loaded
     * but before the server has started to listen for incoming connections.
     * Also the server has not yet read the port number or other data needed for
     * the listening setup.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            logger;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        logger = options.logger;

        logger.debug('Executing TDS pre-start hook.');

        //  ---
        //  Middleware
        //  ---

        //  Put your pre-start logic here.
    };

}(this));
