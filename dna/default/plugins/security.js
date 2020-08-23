/**
 * @overview Integrates basic security via Helmet so basic operation of the
 *     server can meet some minimum security requirements.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Installs the helmet modules considered the defaults for basic security.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            helmet,
            noCache,
            TDS;

        app = options.app;
        TDS = app.TDS;

        //  ---
        //  Requires
        //  ---

        helmet = require('helmet');
        noCache = require('nocache');

        //  ---
        //  Middleware
        //  ---

        app.use(helmet.hidePoweredBy());
        app.use(helmet.ieNoOpen());
        app.use(noCache());
        app.use(helmet.noSniff());
        app.use(helmet.frameguard('sameorigin'));
        app.use(helmet.xssFilter());

        //  Should be more configurable. This is just a placeholder for now.
        /* eslint-disable quotes */
        app.use(helmet.contentSecurityPolicy({
            directives: {
                reportUri: '/',
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                objectSrc: ["'none'"]
            },
            reportOnly: true
        }));
        /* eslint-enable quotes */

        //  Should be more configurable. These are disabled by default.
        // app.use(helmet.hpkp());
        // app.use(helmet.hsts());

        //  TODO:   is this necessary or does helmet handle this?
        // app.use(csurf());

        /**
         *
         */
        options.forceHTTPS = function(req, res, next) {

            //  Express will try to set req.secure, but Heroku et. al. don't
            //  always do that...check headers as well.
            if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
                return next();
            }

            //  TODO:   do we care that we're not keeping the port?
            res.redirect('https://' + req.headers.host + req.url);
        };

        //  ---
        //  Sharing
        //  ---

        //  Default to https for the site and require it to be forced off via flag.
        if (TDS.getcfg('tds.https')) {
            app.enable('trust proxy');
            app.use(options.forceHTTPS);
        }

        options.helmet = helmet;

        return options.helmet;
    };

}(this));
