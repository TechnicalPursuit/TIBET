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
            path,
            sh,
            pubs,
            privs,
            list,
            TDS;

        app = options.app;
        TDS = app.TDS;

        //  ---
        //  Requires
        //  ---

        path = require('path');
        express = require('express');
        sh = require('shelljs');

        //  ---
        //  Setup
        //  ---

        //  Create a helper function for registering top-level public items. We
        //  do this so that we can invoke it in this routine if we're not using
        //  logins or in the the private-static.js plugin if we are.
        options.registerPublicStatics = function(rootDir, skips, opts, metadata) {

            //  sh.ls here means only top-level files are processed/filtered.
            list = sh.ls(rootDir).filter(function(fname) {
                var filename,
                    ok;

                filename = fname.toString();

                //  Never vend hidden or 'helper' files.
                if (filename.match(/^(\.|_)/) ||
                    filename.match(/~$/) ||            //  tilde files for vi etc.
                    filename.match(/\.sw(.{1})$/) ||   //  swap files for vi etc.
                        sh.test('-d', filename)) {
                    return false;
                }

                //  Process against each entry in the private list. These are
                //  supposed to be a list of specific directories to mask off. By
                //  default the 'src' directory requires login to access code.
                ok = true;
                skips.forEach(function(priv) {
                    if (priv === filename) {
                        ok = false;
                    }
                });

                return ok;
            });

            //  activate handlers for the files which made it past the root tests.
            list.forEach(function(fname) {
                var filename,
                    full;

                filename = fname.toString();

                //  note we use metadata passed in to allow for invocation via
                //  the private-static module which reports correctly.
                if (options.argv.verbose) {
                    if (metadata) {
                        opts.logger.system('enabling public static path: ' +
                            filename, metadata);
                    } else {
                        opts.logger.system('enabling public static path: ' +
                            filename);
                    }
                }

                full = path.join(rootDir, filename);
                opts.app.use('/' + filename, express.static(full));
            });
        };

        //  Get the application root. This will limit the scope of the files we
        //  serve and provide a root for accessing application resources.
        appRoot = TDS.expandPath(TDS.getAppRoot());

        //  ---
        //  Routes
        //  ---

        //  If we're attempting to use logins we have to avoid opening up any
        //  directories/files that would sidestep the routes for / and login.
        if (TDS.cfg('boot.use_login')) {
            pubs = ['TIBET-INF', 'media', 'styles'];

            //  If we're in development mode, then we also allow access to the
            //  'src' directory.
            if (TDS.getEnv() === 'development') {
                pubs.push('src');
            }
            pubs.forEach(function(pub) {
                app.use('/' + pub, express.static(path.join(appRoot, pub)));
            });
            return;
        }

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

        //  If we got here we're not using logins and we have at least some
        //  private content so we need to conditionally open up public paths.
        options.registerPublicStatics(appRoot, privs, options);
    };

}(this));
