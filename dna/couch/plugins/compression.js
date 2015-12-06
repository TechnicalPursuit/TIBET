/**
 * @overview Simple compression plugin for the TDS.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

    'use strict';

    var compression;

    compression = require('compression');

    module.exports = function(options) {
        var app;

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        app.use(compression());
    };

}());
