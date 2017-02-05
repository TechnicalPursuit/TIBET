/**
 * @overview A post-startup hook file for the TDS.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     * Perform any post-startup processing. This runs after all operations which
     * are part of starting the TDS have finished (including listening on the
     * port which is defined for the server).
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {

        //  ---
        //  Middleware
        //  ---

        //  Put your post-start logic here.
    };

}(this));
