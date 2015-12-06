/**
 * @overview Loader for any modules found in the mocks directory. The idea is
 *     these routes load before the main routes module so when development or
 *     test is true the first middleware to match wins, hence the mocks win.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

    'use strict';

    var requireDir,
        mocks;

    requireDir = require('require-dir');
    mocks = requireDir('../mocks');

    module.exports = function(options) {
        var app,
            env,
            parsers;

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        parsers = options.parsers;

        env = app.get('env');
        if (env === 'development' || env === 'test') {
            Object.keys(mocks).forEach(function(mock) {
                app.use('/', parsers.json, parsers.urlencoded, mocks[mock]);
            });
        }
    };

}());
