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

(function() {

    'use strict';

    var express,
        path;

    path = require('path');
    express = require('express');

    module.exports = function(options) {
        var app,
            appRoot,
            root,
            TDS;

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        TDS = app.TDS;

        //  Get the application root. This will limit the scope of the files we
        //  serve and provide a root for accessing application resources.
        appRoot = TDS.expandPath(TDS.getAppRoot());

        //  The following paths are leveraged by the login page, even if there's
        //  been no code loaded yet, and by the initial startup sequence in the
        //  case of the TIBET library which simply avoids a ton of
        //  deserialization of the user object to confirm login.
        root = path.join(appRoot, 'TIBET-INF');
        app.use('/TIBET-INF', express.static(root));

        root = path.join(appRoot, 'tibet.json');
        app.use('/tibet.json', express.static(root));

        root = path.join(appRoot, 'styles');
        app.use('/styles', express.static(root));

        root = path.join(appRoot, 'media');
        app.use('/media', express.static(root));
    };

}());
