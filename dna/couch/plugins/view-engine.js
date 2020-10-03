/**
 * @overview Simple view engine configuration hook. This file is require()'d by
 *     the TDS to provide a way to alter the view engine used. The default
 *     engine is handlebars via: https://github.com/ericf/express-handlebars.
 */

(function(root) {

    'use strict';

    /**
     * Configures the server's view engine. By default this is handlebars.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            handlebars;

        app = options.app;

        //  ---
        //  Requires
        //  ---

        handlebars = require('express-handlebars');

        //  ---
        //  Initialization
        //  ---

        app.set('views', './views');
        app.engine('handlebars',
            handlebars(
                {
                    defaultLayout: 'main'
                }));
        app.set('view engine', 'handlebars');
    };

}(this));
