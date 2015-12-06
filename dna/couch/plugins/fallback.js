/**
 * @overview Handlers for fallback conditions like 404's in the TDS.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

    'use strict';

    module.exports = function(options) {
        var app;

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        //  Serve a general 404 if no other handler too care of the request.
        app.get('/*', function(req, res, next) {
            res.status(404).render('404', {error:
                req.url + ' not found.'});
        });
    };

}());
