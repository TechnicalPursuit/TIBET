/**
 * @overview Integrates basic security via Helmet so basic operation of the
 *     server can meet some minimum security requirements.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

    'use strict';

    var helmet;

    helmet = require('helmet');

    module.exports = function(options) {
        var app;

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        app.use(helmet.hidePoweredBy());
        app.use(helmet.ieNoOpen());
        app.use(helmet.noCache());
        app.use(helmet.noSniff());
        app.use(helmet.frameguard('sameorigin'));
        app.use(helmet.xssFilter());

        //  Should be more configurable. This is just a placeholder for now.
        app.use(helmet.contentSecurityPolicy({
            directives: {
                reportUri: '/',
                reportOnly: true
            }
        }));

        //  Should be more configurable. These are disabled by default.
        //app.use(helmet.hpkp());
        //app.use(helmet.hsts());

        //  TODO:   is this necessary or does helmet handle this?
        //app.use(csurf());
    };

}());
