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
     * Configures compression middleware so content can be served in compressed
     * formats.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            compression,
            logger,
            meta;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        logger = options.logger;

        meta = {
            type: 'plugin',
            name: 'compression'
        };
        logger.system('loading middleware', meta);

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
