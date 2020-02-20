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

        var fs,

            fileDelete,
            fileExists,
            fileLoad,
            fileSave;

        fs = require('fs');

        //  ---

        /**
         *
         */
        fileDelete = function(filePath) {

            try {
                fs.unlinkSync(filePath);

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
         *
         */
        fileExists = function(filePath) {

            var doesExist;

            try {
                doesExist = fs.existsSync(filePath);

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
         *
         */
        fileLoad = function(filePath) {

            var data;

            try {
                data = fs.readFileSync(filePath, 'utf8');

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
         *
         */
        fileSave = function(filePath, body, mode) {

            try {

                //  NB: we take the mode, either 'a' or 'w', and append a '+' to
                //  it so that this call will automatically create the file if
                //  it doesn't exist.
                fs.writeFileSync(filePath, body, {flag: mode + '+'});

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

        return {
            fileDelete: fileDelete,
            fileExists: fileExists,
            fileLoad: fileLoad,
            fileSave: fileSave
        };
    };

}(this));

