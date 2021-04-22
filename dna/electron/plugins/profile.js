/**
 * @overview Plugin which sets up the app menu used by Electron apps.
 */

/* eslint-disable no-console */

(function(root) {

    'use strict';

    /**
     * Runs any preferences logic defined for the Electron app.
     * @param {Object} options Configuration options shared across Electron
     *     modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var logger,

            meta,

            sh,
            CLI,
            electron,

            ipcMain,

            saveProfile;

        logger = options.logger;

        //  NOTE this plugin loads prior to the logger so our best option here
        //  is to use the prelog function to queue logging output.
        meta = {
            type: 'plugin',
            name: 'profile'
        };

        logger.system('loading profile', meta);

        //  ---
        //  Requires
        //  ---

        sh = require('shelljs');

        CLI = require('../TIBET-INF/tibet/src/tibet/cli/_cli');

        electron = require('electron');

        //  Module to communicate with renderer processes over IPC.
        ipcMain = electron.ipcMain;

        //  ---

        /**
         * Saves the supplied profile data to the project's 'tibet.json' file.
         * @param {Object} profileData The data to save.
         */
        saveProfile = function(profileData) {
            var file,
                json,
                profile,
                str;

            file = CLI.expandPath('~tibet_file');
            json = require(file);
            if (!json) {
                this.error('Unable to update profile in: ' + file);
                return 1;
            }

            profile = profileData.profile;

            json.profile = profile;

            //  SAVE the file (note the 'to()' call here...)
            str = CLI.beautify(JSON.stringify(json));
            new sh.ShellString(str).to(file);
        };

        //  ---
        //  Profile event handlers.
        //  ---

        /**
         * Event emitted when TIBET wants to save the user profile. The profile
         * is represented as a block of JSON under the 'profile' key in the
         * tibet.json file.
         */
        ipcMain.handle('TP.sig.SaveProfile',
            function(event, profileInfo) {
                saveProfile(profileInfo.data);
            });

    };

}(this));
