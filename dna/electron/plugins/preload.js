/**
 * @overview Plugin which loads first and allows you to add custom objects or
 *     parameters into the options object used by all subsequent Electron
 *     plugins or provide helper functions on the app object as needed.
 */

/* eslint-disable no-console */

(function(root) {

    'use strict';

    /**
     * Runs any pre-load logic defined for the Electron app.
     * @param {Object} options Configuration options shared across Electron
     *     modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var logger,
            meta,

            electron,

            ipcMain;

        logger = options.logger;

        meta = {
            type: 'plugin',
            name: 'preload'
        };
        logger.system('preloading utilities', meta);

        //  ---
        //  Requires
        //  ---

        electron = require('electron');

        //  Module to communicate with renderer processes over IPC.
        ipcMain = electron.ipcMain;

        /**
         * Event emitted when TIBET wants to log some data to the console.
         */
        ipcMain.on('TP.sig.LogMessage',
            function(event, logData) {
                console.log(logData);
            });

    };

}(this));

