/**
 * @overview Basic user data access for the TDS. The default will provide access
 *     to the currently logged in user name and vcard/keyring data for that user.
 */

(function(root) {

    'use strict';

    /**
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            TDS;

        app = options.app;
        TDS = app.TDS;

        //  ---
        //  Middleware
        //  ---

        /**
         *
         */
        app.get(TDS.cfg('tds.vcard.uri') || '/vcard', options.loggedIn,
                options.parsers.urlencoded,
        function(req, res) {
            var email,

                role,
                primaryRole,
                otherRoles,

                org,

                domain,
                len,
                i,

                primaryOrg,
                otherOrgs,

                unit,

                xml;

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
                //  If we have more than 1 org, grab the domain from the email
                //  and see if any of the orgs match it.
                domain = email.slice(email.lastIndexOf('@') + 1,
                                        email.lastIndexOf('.'));
                domain = domain.toLowerCase();

                if (domain === 'websanity') {
                    domain = 'formsanity';
                }

                //  Now, we have to iterate through and compare using lowercase
                //  versions of the org names. If we find one that matches the
                //  domain, then use it as the primary org and splice it out of
                //  the Array of the 'other orgs'.
                len = org.length;
                for (i = 0; i < len; i++) {
                    if (org[i].toLowerCase() === domain) {
                        primaryOrg = org[i];
                        org.splice(i, 1);
                        otherOrgs = org;
                        break;
                    }
                }

                if (!primaryOrg) {
                    primaryOrg = org[0];
                    otherOrgs = org.slice(1);
                }
            } else {
                primaryOrg = org;
            }

            unit = req.user.unit || TP.sys.cfg('user.default_unit');

            xml = [
                '<vcard xmlns="urn:ietf:params:xml:ns:vcard-4.0"',
                ' xmlns:vcard-ext="http://www.technicalpursuit.com/vcard-ext">',
                '<fn><text>' + req.user.id + '</text></fn>',
                '<n>',
                    '<surname>' + req.user.surname + '</surname>',
                    '<given>' + req.user.givenname + '</given>',
                    '<prefix/>',
                '</n>',
                '<nickname><text>' + req.user.id + '</text></nickname>',
                '<role><text>' + primaryRole + '</text></role>',
                '<org><text>' + primaryOrg + '</text></org>',
                '<tel>',
                    '<parameters>',
                        '<type><text>work</text><text>voice</text></type>',
                    '</parameters>',
                    '<text>' + req.user.tel + '</text>',
                    '<uri/>',
                '</tel>',
                '<email><text>' + email + '</text></email>',
                '<url>',
                    '<parameters>',
                        '<type><text>work</text></type>',
                    '</parameters>',
                    '<uri>' + req.user.website + '</uri>',
                '</url>',
                '<tz><text>' + req.user.tz + '</text></tz>',
                '<vcard-ext:x-orgunit>',
                    '<text>' + unit + '</text>',
                '</vcard-ext:x-orgunit>',
                '<vcard-ext:x-password>',
                    '<text>' + TDS.decrypt(req.user.pass) + '</text>',
                '</vcard-ext:x-password>'
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
    };

}(this));
