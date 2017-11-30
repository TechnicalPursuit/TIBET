/**
 * @overview A TDS plugin to provide simple admin routes for the TDS.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Configure the admin routes for the project, if tds.use_admin is true.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            TDS,
            logger,
            ip,
            meta,
            rootPath,
            router,
            sanityCheck;

        app = options.app;
        TDS = app.TDS;

        logger = options.logger;

        meta = {
            comp: 'TWS',
            type: 'plugin',
            name: 'admin'
        };

        logger = logger.getContextualLogger(meta);

        if (!TDS.cfg('tds.use_admin')) {
            logger.warn('tds admin routes disabled', meta);
            return;
        }

        ip = require('ip');
        router = require('express').Router();

        //  ---
        //  Helpers
        //  ---

        /**
         *
         */
        sanityCheck = function(req, res, next) {
            var i,
                len,
                err,
                nodeIPs,
                reqIP;

            if (req.isAuthenticated()) {
                return next();
            }

            //  If the request is made from the local host we can assume that's
            //  a developer and let it pass without typical authentication.
            if (app.get('env') === 'development') {
                nodeIPs = TDS.getNodeIPs();
                len = nodeIPs.length;
                reqIP = req.ip;

                for (i = 0; i < len; i++) {
                    if (ip.isEqual(nodeIPs[i], reqIP)) {
                        return next();
                    }
                }
            }

            //  Don't indicate this route is even valid.
            err = {
                status: 404,
                message: '/_tds' + req.url + ' not found.'
            };

            res.status(404).render(
                '404',
                {
                    error: err
                });

            return;
        };

        //  ---
        //  Route(s)
        //  ---

        /*
         test via curl:

            curl -XGET http://127.0.0.1:1407/_tds/ident
         */
        router.get('/ident', function(req, res) {
            res.json({
                ok: true,
                version: TDS.cfg('tibet.version')
            });
        });

        //  ---
        //  export
        //  ---

        rootPath = TDS.cfg('tds.admin.root') || '/_tds';
        if (rootPath.charAt(0) !== '/') {
            rootPath = '/' + rootPath;
        }

        app.use(rootPath, sanityCheck, options.parsers.json, router);
    };

}(this));
