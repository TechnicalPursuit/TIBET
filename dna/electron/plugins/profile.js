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
        var pkg,
            app,
            logger,

            meta,

            sh,
            CLI,
            electron,

            ipcMain,

            loadProfile,
            saveProfile;

        pkg = options.pkg;
        app = options.app;
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
        //  Application event handlers
        //  ---

        /**
         * Event emitted when Electron has finished initialization and is ready
         * to create browser windows, etc.. Some APIs can only be used after
         * this event occurs.
         */
        app.on('ready',
                function() {
                    var data;

                    //  We go ahead load the profile data here because we may
                    //  have other plugins (i.e. devtools) that need this data
                    //  on startup (if opening when launching for window
                    //  positioning, etc.)
                    //  The fact that we will also load it later when TIBET asks
                    //  for it from the renderer side is of no consequence.

                    //  Grab the data from the profile
                    data = loadProfile();

                    //  Set the profile data into the 'main process' side config.
                    pkg.overlayProperties(data.profile, 'profile');
                });

        //  ---
        //  Profile event handlers.
        //  ---

        /**
         * Method called when TIBET wants to save the user profile. The profile
         * is represented as a block of JSON under the 'profile' key in the
         * profile.json file.
         */
        ipcMain.handle('TIBET-SaveProfile',
            function(event, profileInfo) {
                saveProfile(profileInfo.data);
            });

        /**
         * Method called when TIBET wants to load the user profile. The profile
         * is represented as a block of JSON under the 'profile' key in the
         * profile.json file.
         */
        ipcMain.handle('TIBET-LoadProfile',
            function(event) {
                var data;

                //  Grab the data from the profile
                data = loadProfile();

                //  Set the profile data into the 'main process' side config.
                pkg.overlayProperties(data.profile, 'profile');

                //  Return the profile data to the 'renderer process'. Assumably
                //  it will make it available to its config system.
                return data;
            });

    };

}(this));
