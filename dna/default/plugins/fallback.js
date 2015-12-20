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
            logger;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        logger = options.logger;

        logger.debug('Integrating TDS 404 error handler.');

        //  ---
        //  Middleware
        //  ---

        //  Serve a general 404 if no other handler too care of the request.
        app.get('/*', function(req, res, next) {
            res.status(404).render('404', {error:
                req.url + ' not found.'});
        });
    };

}(this));
