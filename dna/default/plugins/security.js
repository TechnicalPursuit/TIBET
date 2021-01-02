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
            TDS,

            reportUri,
            reportOnly,
            defaultSrc,
            scriptSrc,
            styleSrc,
            objectSrc;

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

        reportUri = TDS.getcfg('tds.csp.reportUri', '/');
        reportOnly = TDS.getcfg('tds.csp.reportOnly', true);

        defaultSrc = TDS.getcfg('tds.csp.defaultSrc', ['self']);
        defaultSrc = defaultSrc.map(
                        function(item) {
                            return TDS.quote(item, '\'');
                        });

        scriptSrc = TDS.getcfg('tds.csp.scriptSrc', ['self']);
        scriptSrc = scriptSrc.map(
                        function(item) {
                            return TDS.quote(item, '\'');
                        });

        styleSrc = TDS.getcfg('tds.csp.styleSrc', ['self']);
        styleSrc = styleSrc.map(
                        function(item) {
                            return TDS.quote(item, '\'');
                        });

        objectSrc = TDS.getcfg('tds.csp.objectSrc', ['none']);
        objectSrc = objectSrc.map(
                        function(item) {
                            return TDS.quote(item, '\'');
                        });

        app.use(helmet.contentSecurityPolicy({
            directives: {
                reportUri: reportUri,
                defaultSrc: defaultSrc,
                scriptSrc: scriptSrc,
                styleSrc: styleSrc,
                objectSrc: objectSrc
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
