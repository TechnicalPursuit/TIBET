/**
 * @overview Basic user data access for the TDS. The default will provide access
 *     to the currently logged in user name and vcard/keyring data for that user.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            TDS,
            path,
            sh;

        app = options.app;
        TDS = app.TDS;

        path = require('path');
        sh = require('shelljs');

        //  ---
        //  Middleware
        //  ---

        /**
         *
         */
        app.get(TDS.cfg('tds.vcard.uri') || '/vcard', options.loggedIn,
                options.parsers.urlencoded,
        function(req, res) {
            var fullpath,
                xml;

            res.set('Content-Type', 'application/vcard+xml');

            fullpath = path.join(TDS.expandPath(
                TDS.getcfg('path.app_vcards', '~app_dat')), req.user.id + '_vcard.xml');

            if (!sh.test('-e', fullpath)) {
                xml = ['<vcard xmlns="urn:ietf:params:xml:ns:vcard-4.0"' +
                    ' xmlns:vcard-ext="http://www.technicalpursuit.com/vcard-ext">',
                    '<fn><text>' + req.user.id + '</text></fn>',
                    '<nickname><text>' + req.user.id + '</text></nickname>',
                    '<role><text>' + TP.sys.cfg('user.default_role') + '</text></role>',
                    '<org><text>' + TP.sys.cfg('user.default_org') + '</text></org>',
                    '<vcard-ext:x-orgunit>' +
                        '<text>' + TP.sys.cfg('user.default_org') + '</text>' +
                    '</vcard-ext:x-orgunit>',
                    '</vcard>'].join('\n');

                res.send(xml);
            } else {
                res.sendFile(fullpath);
            }
        });
    };

}(this));
