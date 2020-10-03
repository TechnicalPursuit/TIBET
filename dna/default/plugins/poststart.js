/**
 * @overview A post-startup hook file for the TDS.
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
        var app,
            TDS,
            logger;

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        //  run any prolog hooks that were registered along the way.
        TDS._prologs.forEach(function(hook) {
            try {
                hook(options);
            } catch (e) {
                logger.error(e);
            }
        });

        //  Put your post-start logic here.
    };

}(this));
