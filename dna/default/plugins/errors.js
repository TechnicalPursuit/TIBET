/**
 * @overview Handler for internal server errors used as a fallback TDS option.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/* eslint-disable no-console */
(function() {

    'use strict';

    module.exports = function(options) {
        var app;

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        //  Internal server error handler. Just render the 500 template.
        app.use(function(err, req, res, next) {
            console.error(err.stack);
            res.status(500).render('500', {error: err});
        });
    };

}());
