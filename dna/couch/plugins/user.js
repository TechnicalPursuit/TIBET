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
            //  create a simple vCard (in XML format) for the current user.
            app.get(TDS.cfg('tds.vcard.uri') || '/vcard', options.loggedIn,
                function(req, res) {
                    var email,

                        role,
                        primaryRole,
                        otherRoles,

                        org,
                        primaryOrg,
                        otherOrgs,

                        unit,

                        xml,

                        i;

                    res.set('Content-Type', 'application/vcard+xml');

                    email = req.user.email || '';

                    role = req.user.role || TP.sys.cfg('user.default_role');
                    if (Array.isArray(role)) {
                        primaryRole = role[0];
                        otherRoles = role.slice(1);
                    } else {
                        primaryRole = role;
                    }

                    org = req.user.org || TP.sys.cfg('user.default_org');
                    if (Array.isArray(org)) {
                        primaryOrg = org[0];
                        otherOrgs = org.slice(1);
                    } else {
                        primaryOrg = org;
                    }

                    unit = req.user.unit || TP.sys.cfg('user.default_unit');

                    xml = [
                        '<vcard xmlns="urn:ietf:params:xml:ns:vcard-4.0"' +
                        ' xmlns:vcard-ext="http://www.technicalpursuit.com/vcard-ext">',
                        '<fn><text>' + req.user.id + '</text></fn>',
                        '<n><surname/><given/><prefix/></n>',
                        '<nickname><text>' + req.user.id + '</text></nickname>',
                        '<role><text>' + primaryRole + '</text></role>',
                        '<org><text>' + primaryOrg + '</text></org>',
                        '<tel>',
                            '<parameters>',
                                '<type><text>work</text><text>voice</text></type>',
                            '</parameters>',
                            '<uri></uri>',
                        '</tel>',
                        '<email><text>' + email + '</text></email>',
                        '<url>',
                            '<parameters>',
                                '<type><text>work</text></type>',
                            '</parameters>',
                            '<uri/>',
                        '</url>',
                        '<tz><text/></tz>',
                        '<vcard-ext:x-orgunit>' +
                            '<text>' + unit + '</text>' +
                        '</vcard-ext:x-orgunit>'
                    ];

                    if (otherRoles) {
                        xml.push('<vcard-ext:x-otherroles>');
                        for (i = 0; i < otherRoles.length; i++) {
                            xml.push('<text>' + otherRoles[i] + '</text>');
                        }
                        xml.push('</vcard-ext:x-otherroles>');
                    } else {
                        xml.push('<vcard-ext:x-otherroles/>');
                    }

                    if (otherOrgs) {
                        xml.push('<vcard-ext:x-otherorgs>');
                        for (i = 0; i < otherOrgs.length; i++) {
                            xml.push('<text>' + otherOrgs[i] + '</text>');
                        }
                        xml.push('</vcard-ext:x-otherorgs>');
                    } else {
                        xml.push('<vcard-ext:x-otherorgs/>');
                    }

                    xml.push('</vcard>');

                    xml = xml.join('\n');

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
