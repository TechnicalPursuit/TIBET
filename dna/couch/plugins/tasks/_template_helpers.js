/**
 * @overview Extensions to the handlebars-based engine for templater tasks.
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
         * Sample. See handlebars documentation for 'registerHelper' to create
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
