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
            name,
            logger,
            meta,
            TDS;

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        //  ---
        //  VCard Access
        //  ---

        name = TDS.cfg('tds.vcard.strategy');
        if (TDS.notEmpty(name)) {
            meta = {
                type: 'TDS',
                name: 'user'
            };
            logger.system('loading ' + name + '-vcards', meta);

            require('./' + name + '-vcards')(options);
        } else {
            //  If no other provider is in place we provide a default route to
            //  create a simple vcard for the current user.
            app.get(TDS.cfg('tds.vcard.uri') || '/vcard', options.loggedIn,
                function(req, res) {
                    var xml;

                    xml = ['<vcard xmlns="urn:ietf:params:xml:ns:vcard-4.0"',
                        ' xmlns:vcard-ext="http://www.technicalpursuit.com/vcard-ext">',
                        '<fn><text>', req.user.id, '</text></fn>',
                        '<nickname><text>', req.user.id, '</text></nickname>',
                        '<role><text>', TP.sys.cfg('user.default_role'), '</text></role>',
                        '<org><text>', TP.sys.cfg('user.default_org'), '</text></org>',
                        '<vcard-ext:x-orgunit>',
                        '<text>', TP.sys.cfg('user.default_org'), '</text>',
                        '</vcard-ext:x-orgunit>',
                        '</vcard>'].join('\n');

                    res.set('Content-Type', 'application/vcard+xml');
                    res.send(xml);
                });
        }

        //  ---
        //  User Access
        //  ---

        /**
         * Returns the currently logged in user...if and only if the caller is
         * properly authenticated.
         */
        app.get(TDS.cfg('tds.user.uri') || '/whoami', options.loggedIn,
        function(req, res) {
            res.json(
                {
                    ok: true,
                    user: req.user
                });
        });
    };

}(this));
