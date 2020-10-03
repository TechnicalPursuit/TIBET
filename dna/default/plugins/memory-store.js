/**
 * @overview Trivial memory store constructor for default TDS sessions.
 */

(function(root) {

    'use strict';

    /**
     * Creates an empty memory-based store instance for use in temporary
     * session management. Not intended for production use!
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var sessionstore;

        sessionstore = require('sessionstore');

        return sessionstore.createSessionStore();
    };

}(this));
