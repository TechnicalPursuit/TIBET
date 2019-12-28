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
            meta,
            TDS,
            urlEncoded,
            urlExtended;

        app = options.app;
        TDS = app.TDS;

        //  NOTE this plugin loads prior to the logger so our best option here
        //  is to use the prelog function to queue logging output.
        meta = {
            type: 'plugin',
            name: 'body-parser'
        };
        TDS.prelog('system', 'loading middleware', meta);

        bodyParser = require('body-parser');

        //  ---
        //  Initialization
        //  ---

        bodyLimit = TDS.cfg('tds.max_bodysize') || '5mb';

        //  ---
        //  Middleware
        //  ---

        /**
         */
        jsonParser = bodyParser.json({
                limit: bodyLimit
            });

        /**
         */
        urlEncoded = bodyParser.urlencoded({
            extended: false,
            limit: bodyLimit
        });

        /**
         */
        urlExtended = bodyParser.urlencoded({
            extended: true,
            limit: bodyLimit
        });

        //  ---
        //  Sharing
        //  ---

        options.parsers = {
            json: jsonParser,
            urlencoded: urlEncoded,
            urlextended: urlExtended
        };

        return options.parsers;
    };

}(this));
