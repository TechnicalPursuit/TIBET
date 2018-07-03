/**
 * @overview Extensions to the handlebars-based engine for templater tasks.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *       Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *       OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *       for your rights and responsibilities. Contact TPI to purchase optional
 *       open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    var apply_helpers,
        helpers;

    //  ---
    //  Add your helpers to the object below...
    //  ---

    helpers = {
        /*
         * Sample. See handlebars documentation for 'registerHandler' to create
         * your own extensions to the handlebars templating engine.
        fluff: function(content) {
            return content;
        }
        */
    };

    //  ---
    //  Edit below with care...
    //  ---

    apply_helpers = function(TDS, meta) {
        var keys;

        keys = Object.keys(helpers);

        if (!TDS || !TDS.template) {
            if (keys.length > 0) {
                throw new Error('Missing templater to extend.');
            }
            return;
        }

        keys.forEach(function(key) {
            TDS.logger.system('registering template helper ' + key, meta);
            TDS.template.registerHelper(key, helpers[key]);
        });
    };

    module.exports = apply_helpers;

}(this));
