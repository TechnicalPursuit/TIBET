/**
 * @overview Simple compression plugin for the TDS.
 */

(function(root) {

    'use strict';

    /**
     * Configures compression middleware so content can be served in compressed
     * formats.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            compression;

        app = options.app;

        compression = require('compression');

        //  ---
        //  Middleware
        //  ---

        app.use(compression());
    };

}(this));
