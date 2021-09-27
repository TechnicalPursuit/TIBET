/**
 * @overview A TDS plugin which is specifically focused on rewriting the
 *     tibet.json file before it is sent to the client. This allows you to
 *     control the specific values which are vended to the client. The default
 *     implementation ensures that values specific to TDS operation are set.
 */

(function(root) {

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

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        //  ---
        //  Requires
        //  ---

        fs = require('fs');
        path = require('path');

        //  ---
        //  Variables
        //  ---

        //  Ensure we have default option slotting for this plugin.
        options.tds_reconfig = options.tds_reconfig || {};

        fullpath = path.resolve(TDS.expandPath('~app/tibet.json'));

        //  ---
        //  Middleware
        //  ---

        TDS.reconfig = function(req, res, next) {
            var str,
                obj;

            fs.readFile(fullpath, 'utf8', function(err, data) {
                if (err) {
                    throw err;
                }

                try {
                    obj = JSON.parse(data);
                } catch (e) {
                    logger.error(e);
                    res.status(500);
                    res.json('{ok: false}');
                    return;
                }

                //  If there's a function replacement for this logic rely on
                //  that to do what the user wants, otherwise we want to be sure
                //  to update the default URI handler mapping to a TDS handler.
                if (typeof options.tds_reconfig.reconfig === 'function') {
                    obj = options.tds_reconfig.reconfig(obj);
                } else {
                    obj.uri = obj.uri || {};
                    obj.uri.handler = obj.uri.handler || {};
                    obj.uri.handler.http = 'TP.uri.TDSURLHandler';
                }

                str = JSON.stringify(obj);

                TDS.ifDebug() ?
                    logger.debug('reconfigured to: ' + TDS.beautify(str)) : 0;

                res.json(obj);
            });
        };

        //  ---
        //  Routes
        //  ---

        app.use('/tibet.json', TDS.reconfig);
    };

}(this));

