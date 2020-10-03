/**
 * @overview TDS plugin for configuring static file serving that requires the
 *     options.loggedIn helper to pass.
 */

(function(root) {

    'use strict';

    /**
     * Configures the routes used for static file serving which require a login.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            appRoot,
            express,
            loggedIn,
            logger,
            TDS,
            privs,
            sh;

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        loggedIn = options.loggedIn;

        //  ---
        //  Requires
        //  ---

        express = require('express');
        sh = require('shelljs');

        //  ---
        //  Variables
        //  ---

        //  Get the application root. This will limit the scope of the files we
        //  serve and provide a root for accessing application resources.
        appRoot = TDS.expandPath(TDS.getAppRoot());

        privs = TDS.getcfg('tds.static.private');

        //  ---
        //  Routes
        //  ---

        //  Only open up the src tree if running in development environment.
        if (app.get('env') !== 'development') {
            privs.push('src');
        }

        //  If logins were enabled the public-static module will have skipped
        //  adding public directories, particularly for html dirs since they can
        //  conflict with the / and login routes. Do that now since routes will
        //  override anything we register here.
        if (TDS.cfg('boot.use_login')) {
            options.registerPublicStatics(appRoot, privs, options);
        }

        //  If the list of private files is empty they're all public.
        if (TDS.notValid(privs) || privs.length === 0) {
            //  NOTE we don't do anything here. The public-static plugin should
            //  have already done any mapping in this case.
            return;
        }

        if (!Array.isArray(privs)) {
            throw new Error('Invalid tds.static.private specification: ' +
                privs);
        }

        privs.forEach(function(priv) {
            var full;

            full = TDS.joinPaths(appRoot, priv);
            if (sh.test('-e', full)) {
                if (options.argv.verbose) {
                    logger.system('enabling private static path: ' + priv);
                }
                app.use('/' + priv, loggedIn, express.static(full));
            }
        });
    };

}(this));
