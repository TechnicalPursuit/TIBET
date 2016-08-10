/**
 * @overview Route configuration for the TDS specific to public static files.
 *     The default implementation ensures the routes for TIBET-INF and related
 *     boot-required files are servable prior to login.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Configures the routes used for static file serving which are public.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            appRoot,
            express,
            fullpath,
            logger,
            path,
            sh,
            privs,
            list,
            TDS;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        logger = options.logger;
        TDS = app.TDS;

        logger.debug('Integrating TDS public static routes.');

        //  ---
        //  Requires
        //  ---

        path = require('path');
        express = require('express');
        sh = require('shelljs');

        //  ---
        //  Variables
        //  ---

        //  Get the application root. This will limit the scope of the files we
        //  serve and provide a root for accessing application resources.
        appRoot = TDS.expandPath(TDS.getAppRoot());

        //  ---
        //  Routes
        //  ---

        privs = TDS.getcfg('tds.static.private');

        //  If the list of private files is empty they're all public.
        if (TDS.notValid(privs) || privs.length === 0) {
            app.use('/', express.static(appRoot));

            //  Map HTML directory to the root so you don't see /html/foo.xhtml
            app.use('/', express.static(path.join(appRoot, 'html')));
            return;
        }

        if (!Array.isArray(privs)) {
            throw new Error('Invalid tds.static.private specification: ' +
                privs);
        }

        //  sh.ls here means only top-level files are processed/filtered.
        list = sh.ls(appRoot).filter(function(fname) {
            var ok;

            //  Never vend hidden or 'helper' files.
            if (fname.match(/^(\.|_)/)) {
                return false;
            }

            //  Process against each entry in the private list. These are
            //  supposed to be a list of specific directories to mask off. By
            //  default the 'src' directory requires login to access code.
            ok = true;
            privs.forEach(function(priv) {
                if (priv === fname) {
                    ok = false;
                }
            });

            return ok;
        });

        //  activate handlers for the files which made it past the root tests.
        list.forEach(function(fname) {
            var full;

            logger.debug('enabling public static path: ' + fname);

            full = path.join(appRoot, fname);
                app.use('/' + fname, express.static(full));
        });

        //  Map HTML directory to the root so you don't see /html/foo.xhtml
        app.use('/', express.static(path.join(appRoot, 'html')));
    };

}(this));
