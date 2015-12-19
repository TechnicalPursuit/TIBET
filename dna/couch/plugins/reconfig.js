/**
 * @overview A TDS plugin which is specifically focused on rewriting the
 *     tibet.json file before it is sent to the client. This allows you to
 *     control the specific values which are vended to the client. The default
 *     implementation ensures that values specific to TDS operation are set.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

    'use strict';

    /**
     * Rewrites the tibet.json file as needed to support proper client operation.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            fs,
            fullpath,
            logger,
            path,
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

        //  ---
        //  Requires
        //  ---

        fs = require('fs');
        path = require('path');

        //  Ensure we have default option slotting for this plugin.
        options.tds_reconfig = options.tds_reconfig || {};

        fullpath = path.resolve(TDS.expandPath('~app/tibet.json'));


        //  ---
        //  Middleware
        //  ---

        TDS.reconfig = function(req, res, next) {
            var str,
                obj;

            str = fs.readFile(fullpath, 'utf8', function(err, data) {
                if (err) {
                    throw err;
                }

                obj = JSON.parse(data);

                //  If there's a function replacement for this logic rely on
                //  that to do what the user wants, otherwise we want to be sure
                //  to update the default URI handler mapping to a TDS handler.
                if (typeof options.tds_reconfig.config === 'function') {
                    obj = options.tds_reconfig.reconfig(obj);
                } else {
                    obj.uri = obj.uri || {};
                    obj.uri.handler = obj.uri.handler || {};
                    obj.uri.handler.http = 'TP.tds.TDSURLHandler';
                }

                str = JSON.stringify(obj);

                logger.debug('reconfigured to: ' + TDS.beautify(str));

                res.json(obj);
            });
        };

        //  ---
        //  Routes
        //  ---

        app.use('/tibet.json', TDS.reconfig);
    };

}());

