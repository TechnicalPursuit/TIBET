/**
 * @overview Plugin which manages the profile data used by Electron apps.
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

            loadProfile,
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
         * Loads the supplied profile data from the project's 'profile.json'
         * file.
         * @returns {Object} The data that was loaded.
         */
        loadProfile = function(profileData) {
            var file,
                json;

            file = CLI.expandPath('~profile_file');
            try {
                json = require(file);
            } catch (e) {
                json = {};
            }

            if (!json) {
                json = {};
            }

            return json;
        };

        /**
         * Saves the supplied profile data to the project's 'profile.json' file.
         * @param {Object} profileData The data to save.
         */
        saveProfile = function(profileData) {
            var file,
                json,
                profile,
                str;

            file = CLI.expandPath('~profile_file');
            try {
                json = require(file);
            } catch (e) {
                json = {};
            }

            if (!json) {
                json = {};
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
         * profile.json file.
         */
        ipcMain.handle('TP.sig.SaveProfile',
            function(event, profileInfo) {
                saveProfile(profileInfo.data);
            });

        /**
         * Event emitted when TIBET wants to load the user profile. The profile
         * is represented as a block of JSON under the 'profile' key in the
         * profile.json file.
         */
        ipcMain.handle('TP.sig.LoadProfile',
            function(event) {
                return loadProfile();
            });

    };

}(this));
