/**
 * @overview Simple view engine configuration hook. This file is require()'d by
 *     the TDS to provide a way to alter the view engine used. The default
 *     engine is handlebars via: https://github.com/ericf/express-handlebars.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Configures the server's view engine. By default this is handlebars.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            handlebars,
            logger;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        logger = options.logger;

        logger.debug('Integrating TDS view engine.');

        //  ---
        //  Requires
        //  ---

        handlebars = require('express-handlebars');

        //  ---
        //  Initialization
        //  ---

        app.set('views', './views');
        app.engine('handlebars', handlebars({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars');
    };

}(this));
