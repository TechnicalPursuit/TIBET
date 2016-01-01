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
     * Loads all plugins found in the TIBET library's TDS plugins directory.
     * Each plugin will check whether it should activate by testing one or more
     * configuration flags of the form 'tds.use.*'. See the individual plugins
     * for more information.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            logger,
            path,
            plugins,
            requireDir,
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

        logger.debug('Integrating TDS library components.');

        //  ---
        //  Requires
        //  ---

        requireDir = require('require-dir');

        //  ---
        //  Variables
        //  ---

        path = TDS.expandPath('~lib/etc/tds/plugins');

        //  ---
        //  Loading
        //  ---

        //  Load all TDS plugins and invoke their exported configuration
        //  function(s). It's up to each plugin to check TDS config values
        //  to determine if it should activate for the current application.
        plugins = requireDir(path);
        Object.keys(plugins).forEach(function(plugin) {
            plugins[plugin](options);
        });

        return;
    };

}(this));
