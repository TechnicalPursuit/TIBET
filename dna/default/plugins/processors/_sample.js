/**
 * @overview A sample file processor used to respond to and process changes
 *     to a particular source file extension.
 */

(function(root) {

    'use strict';

    /**
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            logger,
            meta,
            TDS,
            processor;

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        meta = {
            type: 'TDS',
            name: 'sample'
        };

        /**
         * Processes a file that has changed. Typically a "source" file of some
         * sort such as sass, JS in need of a compilation/translation via babel,
         * etc.
         * @param {String} filepath The full file path which changed.
         * @returns {Boolean} An explicit 'false' value to disable any standard
         *     change signaling from server to client.
         */
        processor = function(filepath) {
            logger.info('processing changed file: ' + filepath);

            //  Return false to prevent default.
            // return false;
        };

        TDS.watch.registerProcessor('sample', processor, meta);
    };

}(this));
