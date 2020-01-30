/**
 * @overview Loads the various plugins in the TDS plugins directory of the
 *     current TIBET library. Examples are the watch and couchdb plugins.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Loads plugins specific to the TDS's development/TWS functionality. The
     * list to load can be an array or '*' to load them all.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            path,
            sh,
            plugins,
            pluginDir,
            TDS;

        app = options.app;
        TDS = app.TDS;

        //  ---
        //  Requires
        //  ---

        path = require('path');
        sh = require('shelljs');

        //  ---
        //  Loading
        //  ---

        plugins = TDS.getcfg('tds.plugins.tds');

        //  No valid explicit specification? Don't load any TDS extensions.
        if (TDS.notValid(plugins)) {
            return;
        }

        if (!Array.isArray(plugins) && plugins !== '*') {
            throw new Error('Invalid tds.plugins.tds specification: ' + plugins);
        }

        pluginDir = TDS.expandPath('~lib/tds/plugins');

        //  * means load them all...but we need to build the list via scan.
        if (plugins === '*') {
            plugins = sh.find(pluginDir).filter(
                function(fname) {
                    var filename,
                        base;

                    filename = fname.toString();

                    base = path.basename(filename);
                    return !base.match(/^(\.|_)/) &&
                        !base.match(/~$/) &&        //  tilde files for vi etc.
                        !base.match(/\.sw(.{1})$/) && //  swap files for vi etc.
                        !sh.test('-d', filename);
                });
        } else {
            //  Plugin list won't have the directory path, just basename minus
            //  extension, so adjust to be full paths.
            plugins = plugins.map(function(plugin) {
                return path.join(pluginDir, plugin);
            });
        }

        plugins.forEach(function(plugin) {
            var meta;

            meta = {
                comp: 'TDS',
                type: 'plugin',
                name: path.basename(plugin)
            };

            if (TDS.logger) {
                options.logger = TDS.logger.getContextualLogger(meta);
                TDS.logger.system('loading tds plugin', meta);
            }
            require(plugin)(options);
        });

        return;
    };

}(this));
