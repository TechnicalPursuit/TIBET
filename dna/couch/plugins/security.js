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
            TDS,

            helmet,
            noCache,

            cspKeywords,
            quoteValue,

            reportUri,
            reportOnly,
            defaultSrc,
            imgSrc,
            scriptSrc,
            styleSrc,
            objectSrc,
            frameSrc,
            connectSrc;

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

        //  Set up CSP directives

        //  Define a RegExp with all of the CSP keywords from the grammar
        //  defined in the CSP specification.
        cspKeywords = new RegExp(
                        '^(' +
                        'self' +
                        '|unsafe-inline' +
                        '|unsafe-eval' +
                        '|strict-dynamic' +
                        '|unsafe-hashes' +
                        '|report-sample' +
                        '|unsafe-allow-redirects' +
                        ')$');

        quoteValue = function(aValue) {
            if (cspKeywords.test(aValue)) {
                return TDS.quote(aValue, '\'');
            }

            return aValue;
        };

        reportUri = TDS.getcfg('tds.csp.reportUri', '/');
        reportOnly = TDS.getcfg('tds.csp.reportOnly', true);

        defaultSrc = TDS.getcfg('tds.csp.defaultSrc', ['self']);
        defaultSrc = defaultSrc.map(quoteValue);

        imgSrc = TDS.getcfg('tds.csp.imgSrc', ['self']);
        imgSrc = imgSrc.map(quoteValue);

        scriptSrc = TDS.getcfg('tds.csp.scriptSrc', ['self']);
        scriptSrc = scriptSrc.map(quoteValue);

        styleSrc = TDS.getcfg('tds.csp.styleSrc', ['self']);
        styleSrc = styleSrc.map(quoteValue);

        objectSrc = TDS.getcfg('tds.csp.objectSrc', ['none']);
        objectSrc = objectSrc.map(quoteValue);

        frameSrc = TDS.getcfg('tds.csp.frameSrc', ['none']);
        frameSrc = frameSrc.map(quoteValue);

        connectSrc = TDS.getcfg('tds.csp.connectSrc', ['none']);
        connectSrc = connectSrc.map(quoteValue);

        app.use(helmet.contentSecurityPolicy({
            directives: {
                reportUri: reportUri,
                defaultSrc: defaultSrc,
                imgSrc: imgSrc,
                scriptSrc: scriptSrc,
                styleSrc: styleSrc,
                objectSrc: objectSrc,
                frameSrc: frameSrc,
                connectSrc: connectSrc
            },
            reportOnly: reportOnly
        }));

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
