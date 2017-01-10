/**
 * @overview Handlers for fallback conditions like 404's in the TDS.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Installs a generic error handler for 404 errors that will render the
     * current 404.* view using the current view engine.
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

        meta = {
            type: 'plugin',
            name: 'fallback'
        };
        logger.system('loading 404 handler', meta);

        //  ---
        //  Middleware
        //  ---

        //  Serve a general 404 if no other handler too care of the request.
        app.get('/*', function(req, res, next) {
            var err;

            err = {
                status: 404,
                message: req.url + ' not found.'
            };

            res.status(404).render(
                '404',
                {
                    error: err
                });
        });
    };

}(this));
