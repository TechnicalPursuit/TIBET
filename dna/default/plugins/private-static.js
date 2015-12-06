/**
 * @overview TDS plugin for configuring static file serving that requires the
 *     options.loggedIn helper to pass.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

    'use strict';

    var express;

    express = require('express');

    module.exports = function(options) {
        var app,
            appRoot,
            loggedIn,
            TDS;

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        loggedIn = options.loggedIn;
        TDS = app.TDS;

        //  Get the application root. This will limit the scope of the files we
        //  serve and provide a root for accessing application resources.
        appRoot = TDS.expandPath(TDS.getAppRoot());

        //  Force logins for any remaining paths under application root.
        app.use('/', loggedIn, express.static(appRoot));
    };

}());
