/**
 * @overview Plugin which sets up the app menu used by Electron apps.
 */

/* eslint-disable no-console */

(function(root) {

    'use strict';

    /**
     * Runs any app menu logic defined for the Electron app.
     * @param {Object} options Configuration options shared across Electron
     *     modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var pkg,
            logger,
            meta,

            electron,

            BrowserWindow,
            ipcMain,
            autoUpdater;

        pkg = options.pkg;
        logger = options.logger;

        //  NOTE this plugin loads prior to the logger so our best option here
        //  is to use the prelog function to queue logging output.
        meta = {
            type: 'plugin',
            name: 'updater'
        };

        logger.system('loading updater', meta);

        //  ---
        //  Requires
        //  ---

        electron = require('electron');

        //  Module to create browser window.
        BrowserWindow = electron.BrowserWindow;

        //  Module to communicate with renderer processes over IPC.
        ipcMain = electron.ipcMain;

        autoUpdater = require('electron-updater').autoUpdater;

        //  ---

        //  We do *not* auto download and install by default.
        autoUpdater.autoDownload = false;

        //  ---
        //  Autoupdater event handlers
        //  ---

        /**
         * Event emitted when the auto updater is checking for an available
         * update.
         */
        autoUpdater.on('checking-for-update', function(event) {
            var mainContents;

            mainContents = BrowserWindow.fromId(options.mainid).webContents;

            mainContents.send('TP.sig.CheckingForUpdate', event);
        });

        //  ---

        /**
         * Event emitted when the auto updater has an error.
         */
        autoUpdater.on('error', function(event) {
            var mainContents;

            mainContents = BrowserWindow.fromId(options.mainid).webContents;

            mainContents.send('TP.sig.UpdateError', event);
        });

        //  ---

        /**
         * Event emitted when the auto updater has an update available.
         */
        autoUpdater.on('update-available', function(event) {
            var mainContents;

            mainContents = BrowserWindow.fromId(options.mainid).webContents;

            mainContents.send('TP.sig.UpdateAvailable', event);
        });

        //  ---

        /**
         * Event emitted when the auto updater has no update available.
         */
        autoUpdater.on('update-not-available', function(event) {
            var mainContents;

            mainContents = BrowserWindow.fromId(options.mainid).webContents;

            mainContents.send('TP.sig.UpdateNotAvailable', event);
        });

        //  ---

        /**
         * Event emitted when the auto updater has the latest update downloaded.
         */
        autoUpdater.on('update-downloaded', function(event) {
            var mainContents;

            mainContents = BrowserWindow.fromId(options.mainid).webContents;

            mainContents.send('TP.sig.UpdateDownloaded', event);
        });

        //  ---

        /**
         * Event emitted when TIBET wants to check to see if updates are
         * available.
         */
        ipcMain.handle('TP.sig.CheckForUpdates',
            function(event, payload) {
                //  check to see if there are any available updates using
                //  autoUpdater.
                autoUpdater.checkForUpdates();
            });

        //  ---

        /**
         * Event emitted when TIBET wants to download the latest application
         * version.
         */
        ipcMain.handle('TP.sig.DownloadUpdate',
            function(event, payload) {
                autoUpdater.downloadUpdate();
            });

        //  ---

        /**
         * Event emitted when TIBET wants to install the latest version and
         * restart the application.
         */
        ipcMain.handle('TP.sig.InstallUpdateAndRestart',
            function(event, payload) {
                autoUpdater.quitAndInstall();
            });

        //  ---

        /**
         * Event emitted when TIBET has determined that the app has started and
         * is ready.
         */
        ipcMain.handle('TP.sig.AppDidStart',
            function(event, payload) {

                if (pkg.getcfg('electron.updater.onstart') === true) {
                    autoUpdater.checkForUpdates();
                }
            });

    };

}(this));
