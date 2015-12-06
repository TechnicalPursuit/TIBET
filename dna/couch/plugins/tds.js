/**
 * @overview Loads the various plugins in the TDS plugins directory of the
 *     current TIBET library. Examples are the watcher and couchdb plugins.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

    'use strict';

    var requireDir;

    requireDir = require('require-dir');

    module.exports = function(options) {
        var app,
            path,
            plugins,
            TDS;

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        TDS = app.TDS;

        path = TDS.expandPath('~lib/etc/tds/plugins');

        //  Load all TDS plugins and invoke their exported configuration
        //  function(s). It's up to each plugin to check TDS config values
        //  to determine if it should activate for the current application.
        plugins = requireDir(path);
        Object.keys(plugins).forEach(function(plugin) {
            plugins[plugin](options);
        });

        return;
    };

}());
