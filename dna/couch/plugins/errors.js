/**
 * @overview Handler for internal server errors used as a fallback TDS option.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/* eslint-disable no-console */
(function(root) {

    'use strict';

    /**
     * Installs a generic error handler for server errors that will render the
     * current 500.* view using the current view engine.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            logger,
            meta;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        logger = options.logger;

        meta = {type: 'plugin', name: 'errors'};
        logger.system('loading middleware', meta);

        //  ---
        //  Middleware
        //  ---

        //  Internal server error handler. Just render the error template.
        app.use(function(err, req, res, next) {
            var env,
                stack;

            env = app.get('env');
            if (env === 'development') {
                stack = err.stack || '';
                logger.error(stack.replace(/\\n/g, '\n'));
            }

            res.status(err.status || 500).render('error', {error: err});
        });
    };

}(this));
