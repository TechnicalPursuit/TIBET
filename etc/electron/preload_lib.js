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
            path,

            fileDelete,
            fileExists,
            fileLoad,
            fileSave;

        fs = require('fs');
        path = require('path');

        //  ---

        /**
         *
         */
        fileDelete = function(filePath) {
            console.log('DELETING FILE: ' + filePath);
            console.log('TODO: IMPLEMENT FILE DELETE.');

            return {
                ok: true
            };

            //  If error, return this:
            /*
            return {
                ok: false,
                msg: <errMsg>
            }
            */
        };

        //  ---

        /**
         *
         */
        fileExists = function(filePath) {
            console.log('TESTING FILE FOR EXISTENCE: ' + filePath);
            console.log('TODO: IMPLEMENT FILE EXISTS.');

            return {
                ok: true
            };

            //  If error, return this:
            /*
            return {
                ok: false,
                msg: <errMsg>
            }
            */
        };

        //  ---

        /**
         *
         */
        fileLoad = function(filePath) {
            console.log('LOADING FILE: ' + filePath);
            console.log('TODO: IMPLEMENT FILE LOAD.');

            return {
                ok: true
            };

            //  If error, return this:
            /*
            return {
                ok: false,
                msg: <errMsg>
            }
            */
        };

        //  ---

        /**
         *
         */
        fileSave = function(filePath, body, mode) {
            console.log('SAVING FILE: ' + filePath);
            console.log('TODO: IMPLEMENT FILE SAVE.');

            return {
                ok: true
            };

            //  If error, return this:
            /*
            return {
                ok: false,
                msg: <errMsg>
            }
            */
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

