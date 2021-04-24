/**
 * @overview Plugin which loads first and allows you to add custom objects or
 *     parameters into the options object used by all subsequent TDS plugins or
 *     provide helper functions on the TDS or app object as needed.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/* eslint-disable no-console */

(function(root) {

    'use strict';

    /**
     * Runs any pre-load logic defined for the server. The default
     * implementation defines a log_filter routine for trimming log output.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {

        var CLI,

            sh,
            electron,

            fileDelete,
            fileExists,
            fileLoad,
            fileSave,

            getAppVersion,

            addListenerForMainEvent,
            removeListenerForMainEvent,
            sendEventToMain,

            commandSpawn;

        CLI = require('../../src/tibet/cli/_cli');

        sh = require('shelljs');

        electron = require('electron');

        //  ---

        /**
         * @method fileDelete
         * @summary Removes the filePath from the local file system, provided
         *     you have proper permissions.
         * @param {String} filePath The file path to remove.
         * @returns {Object} An object with 2 fields: 'ok' (true|false if the
         *     operation succeeded|failed) and 'msg' (error string if the
         *     operation failed).
         */

        fileDelete = function(filePath) {

            try {
                sh.rm('-rf', filePath);

                return {
                    ok: true
                };

            } catch (e) {
                return {
                    ok: false,
                    msg: e.name + ' : ' + e.message
                };
            }
        };

        //  ---

        /**
         * @method fileExists
         * @summary Returns inforation about whether the filePath exists in the
         *     file system.
         * @param {String} filePath The file path to check.
         * @returns {Object} An object with 3 fields: 'ok' (true|false if the
         *     operation succeeded|failed), 'exists' (true|false if the filePath
         *     existed|didn't exist) and 'msg' (error string if the operation
         *     failed).
         */

        fileExists = function(filePath) {

            var doesExist;

            try {
                doesExist = sh.test('-e', filePath);

                return {
                    ok: true,
                    exists: doesExist
                };

            } catch (e) {
                return {
                    ok: false,
                    msg: e.name + ' : ' + e.message
                };
            }
        };

        //  ---

        /**
         * @method fileLoad
         * @summary Loads the content of filePath
         * @param {String} filePath The file path to load.
         * @returns {Object} An object with 3 fields: 'ok' (true|false if the
         *     operation succeeded|failed), 'content' (content string if the
         *     operation succeeded) and 'msg' (error string if the operation
         *     failed).
         */

        fileLoad = function(filePath) {

            var data;

            try {
                data = sh.cat(filePath);

                return {
                    ok: true,
                    content: data
                };

            } catch (e) {
                return {
                    ok: false,
                    msg: e.name + ' : ' + e.message
                };
            }
        };

        //  ---

        /**
         * @method fileSave
         * @summary Saves content to the filePath provided.
         * @param {String} filePath The file path to save.
         * @param {String} body The body content to save to the filePath.
         * @param {String} mode If 'a', the supplied content will be appended to
         *     the existing file content, otherwise it will replace any existing
         *     content.
         * @returns {Object} An object with 2 fields: 'ok' (true|false if the
         *     operation succeeded|failed) and 'msg' (error string if the
         *     operation failed).
         */

        fileSave = function(filePath, body, mode) {

            try {

                if (mode === 'a') {
                    new sh.ShellString(body).toEnd(filePath);
                } else {
                    new sh.ShellString(body).to(filePath);
                }

                return {
                    ok: true
                };

            } catch (e) {
                return {
                    ok: false,
                    msg: e.name + ' : ' + e.message
                };
            }
        };

        //  ---

        /**
         * @method getAppVersion
         * @summary Returns the application version as specified in the
         *     'package.json' file in the application's project.
         * @returns {String} The application version as the package.json file
         *     sees it. This should match up with the app version that the
         *     renderer-side (TIBET) codebase has.
         */

        getAppVersion = function() {

            return electron.ipcRenderer.invoke('TP.sig.getAppVersion');
        };

        //  ---

        /**
         * @method commandSpawn
         * @summary Spawns a command on the operating system and manages the
         *     standard output and standard error of the resulting process.
         * @param {String} command The command to use to cause  the operating
         *     system to execute to spawn a process.
         * @param {Array} args The Array of arguments to the command.
         * @param {Function} onmsgcb A function to execute when the process has
         *     output in stdout.
         * @param {Function} onerrcb A function to execute when the process has
         *     output in stderr.
         * @returns {Object} An object with 3 fields: 'ok' (true|false if the
         *     spawned command succeeded|failed), 'level' (the logging level to
         *     log out at) and 'data' (either the stdout or stderr data).
         */

        commandSpawn = function(command, args, onmsgcb, onerrcb) {

            var cmdObj,

                spawnArgs;

            /*
            cmdObj = {
                options: {debug: false, verbose: false},
                log: CLI.log,
                error: CLI.error
            };
            */

            //  Note no 'status' field here for the 'log' or 'error' functions -
            //  they don't cause the command to terminate at this point.

            cmdObj = {
                options: {debug: false, verbose: false},
                log: function(msg, spec, level) {
                    var logMsg;

                    logMsg = {
                        level: level,
                        ok: true,
                        data: msg
                    };

                    onmsgcb(logMsg);
                },
                error: function(msg, spec) {
                    var errMsg;

                    errMsg = {
                        level: 'error', //  ??
                        ok: false,
                        reason: msg
                    };

                    onerrcb(errMsg);
                }
            };

            if (command) {
                spawnArgs = args.slice();
                return CLI.spawnAsync(cmdObj, command, spawnArgs).then(
                    function(result) {
                        var spawnResult;

                        spawnResult = {
                            level: 'log', // ??
                            ok: true,
                            data: result.stdout
                        };

                        return spawnResult;
                    },
                    function(err) {
                        var spawnError;

                        spawnError = {
                            level: 'error', // ??
                            ok: false,
                            reason: err.toString()
                        };

                        return spawnError;
                    });
            }

            return Promise.resolve();
        };

        //  ---

        /**
         * @method addListenerForMainEvent
         * @summary Adds a listener function that listens for events fired from
         *     the main process.
         * @param {String} eventName The name of the event to listen for.
         * @param {Function} handlerFunc The listener function to execute when
         *     the event is fired from main process.
         */

        addListenerForMainEvent = function(eventName, handlerFunc) {

            electron.ipcRenderer.on(eventName, handlerFunc);
        };

        //  ---

        /**
         * @method removeListenerForMainEvent
         * @summary Removes a listener function that was listening for events
         *     fired from the main process.
         * @param {String} eventName The name of the event to stop listening
         *     for.
         * @param {Function} handlerFunc The listener function that was
         *     registered with the addListenerForMainEvent. This must be the
         *     *identical* ('===') function object that was supplied to that
         *     method.
         */

        removeListenerForMainEvent = function(eventName, handlerFunc) {

            electron.ipcRenderer.removeListener(eventName, handlerFunc);
        };

        //  ---

        /**
         * @method sendEventToMain
         * @summary Sends an event to the main process.
         * @param {Array} eventArgs The event arguments to send to the main
         *     process. This array should always have one item in it, which
         *     should be the event name.
         * @returns {Promise} A Promise returned from sending the event to
         *     the main process. When this Promise is resolved its value will be
         *     whatever value that method returned (limited by the rules of the
         *     Structured Clone Algorithm).
         */

        sendEventToMain = function(eventArgs) {

            return electron.ipcRenderer.invoke.apply(electron.ipcRenderer,
                                                        eventArgs);
        };

        //  ---

        return {
            fileDelete: fileDelete,
            fileExists: fileExists,
            fileLoad: fileLoad,
            fileSave: fileSave,

            getAppVersion: getAppVersion,

            commandSpawn: commandSpawn,

            addListenerForMainEvent: addListenerForMainEvent,
            removeListenerForMainEvent: removeListenerForMainEvent,
            sendEventToMain: sendEventToMain
        };
    };

}(this));

