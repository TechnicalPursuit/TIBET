/**
 * @overview A pre-startup hook file for the TDS.
 */

(function(root) {

    'use strict';

    /**
     * Perform any pre-start processing. This runs after all plugins have loaded
     * but before the server has started to listen for incoming connections.
     * Also the server has not yet read the port number or other data needed for
     * the listening setup.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {

        //  ---
        //  Middleware
        //  ---

        //  Put your pre-start logic here.
    };

}(this));
