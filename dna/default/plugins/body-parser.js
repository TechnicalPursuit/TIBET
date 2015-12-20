/**
 * @overview Configure the various body parser components the application will
 *     have access to. NOTE that we don't apply them here, we simply create them
 *     and add them to the shared options for use on a route-by-route basis.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/* eslint-disable no-console */

(function(root) {

    'use strict';

    /**
     * Configures a JSON and urlencoded body parser instance and applies them to
     * the options object for use by later plugins. The authentication plugin is
     * a good example of a parser consumer.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            bodyLimit,
            bodyParser,
            jsonParser,
            level,
            TDS,
            urlEncoded;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        TDS = app.TDS;

        //  NOTE this plugin loads prior to the logger so our only option is to
        //  use the console for output meaning we must level check ourselves.
        level = TDS.cfg('tds.log.level') || 'info';
        if (level === 'debug') {
            console.log('debug: Integrating TDS body parser.');
        }

        //  ---
        //  Requires
        //  ---

        bodyParser = require('body-parser');

        //  ---
        //  Variables
        //  ---

        bodyLimit = TDS.cfg('tds.max_bodysize') || '5mb';

        //  ---
        //  Middleware
        //  ---

        /**
         */
        jsonParser = bodyParser.json({limit: bodyLimit});

        /**
         */
        urlEncoded = bodyParser.urlencoded({
            extended: false,
            limit: bodyLimit
        });

        //  ---
        //  Sharing
        //  ---

        options.parsers = {
            json: jsonParser,
            urlencoded: urlEncoded
        }

        return options.parsers;
    };

}(this));
