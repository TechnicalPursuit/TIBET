/**
 * @overview Integrates basic security via Helmet so basic operation of the
 *     server can meet some minimum security requirements.
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
            uuid,
            logger,
            meta,
            directives,
            csp,
            referrerPolicy,
            hsts,
            TDS;

        app = options.app;
        TDS = app.TDS;
        logger = options.logger;

        //  ---
        //  Requires
        //  ---

        helmet = require('helmet');
        noCache = require('nocache');
        uuid = require('uuid');

        //  ---
        //  Config data
        //  ---

        meta = {
            type: 'TDS',
            name: 'security'
        };

        //  Top-level CSP. This serves as our baseline config object.
        csp = TDS.getcfg('tds.csp', {}, true);

        //  Process CSP directives from config data. We use this as a starting
        //  point but then process it for nonce addition.
        directives = TDS.getCSPDirectives();
        if (TDS.isEmpty(csp)) {
            throw new Error('CSP directives invalid or empty.');
        }

        //  ---
        //  Middleware
        //  ---

        app.use(helmet.dnsPrefetchControl({
            allow: true
        }));
        app.use(helmet.frameguard('sameorigin'));
        app.use(helmet.hidePoweredBy());
        app.use(helmet.ieNoOpen());
        app.use(helmet.noSniff());

        referrerPolicy = TDS.getcfg('tds.security.referrerPolicy',
            'strict-origin-when-cross-origin');
        app.use(helmet.referrerPolicy({
            policy: referrerPolicy
        }));

        app.use(noCache());
        app.use(helmet.xssFilter());

        //  Add a nonce to every request.
        app.use((req, res, next) => {
            res.locals.nonce = Buffer.from(uuid.v4()).toString('base64');
            next();
        });

        //  Process the CSP so it can blend in the nonce (and other locals).
        app.use((req, res, next) => {
            var obj,
                nonce;

            nonce = ['\'nonce-' + res.locals.nonce + '\''];

            //  For localhost we don't want to upgrade requests.
            if (req.hostname === 'localhost') {
                csp.upgradeInsecureRequests = false;
            }

            //  For each directive key determine if nonce is added
            obj = {};
            csp.directives = obj;
            Object.keys(directives).forEach(function(key) {
                var val;

                val = directives[key];
                if (val.includes('\'none\'') ||
                        val.includes('\'unsafe-inline\'')) {
                    obj[key] = val;
                } else {
                    obj[key] = val.concat(nonce);
                }
            });

            //  Apply the CSP
            helmet.contentSecurityPolicy(csp);
            next();
        });

        // Add HSTS Strict-Transport-Security ??
        if (TDS.getcfg('tds.use_hsts')) {
            logger.info('activating hsts middleware', meta);
            hsts = TDS.getcfg('tds.hsts', {}, true);
            app.use(helmet.hsts(hsts));
        }

        //  Force HTTPS / SSL ??
        options.forceHTTPS = function(req, res, next) {

            //  Express will try to set req.secure, but Heroku et. al. don't
            //  always do that...check headers as well.
            if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
                return next();
            }

            //  TODO:   do we care that we're not keeping the port?
            res.redirect('https://' + req.headers.host + req.url);
        };

        //  Default to https for the site and require it to be forced off via
        //  flag
        if (TDS.getcfg('tds.https')) {
            app.enable('trust proxy');

            logger.info('forcing HTTPS/SSL via middleware', meta);
            app.use(options.forceHTTPS);
        }

        //  ---
        //  Sharing
        //  ---

        options.helmet = helmet;

        return options.helmet;
    };

}(this));
