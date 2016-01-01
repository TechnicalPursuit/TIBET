/**
 * @overview Supports sending standard diff/patch formatted files to the server.
 *     This is normally disabled but when enabled it allows the Sherpa to send
 *     client-side edits to the server for integration with on-file source code.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    //  ---
    //  File Patch Middleware
    //  ---

    /**
     * Processes requests to patch a source file with client-side changes.
     * Changes can be in the form of an entire file or a patch/diff formatted
     * patch file. The target path must reside under tds.patch_root for the
     * patch to be valid. The default is ~app_src which restricts patches to
     * application assets in the application's source directory.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            loggedIn,
            logger,
            path,
            TDS;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        loggedIn = options.loggedIn;
        logger = options.logger;
        TDS = app.TDS;

        //  Should we add routes for source-code patch processor? Off by default
        //  for profiles other than 'development'.
        if (TDS.cfg('tds.use.patch') !== true) {
            return;
        }
        logger.debug('Integrating TDS FilePatch interface.');

        //  ---
        //  Requires
        //  ---

        path = require('path');

        //  Ensure we have default option slotting for this plugin.
        options.tds_patch = options.tds_patch || {};

        //  ---
        //  Middleware
        //  ---

        TDS.patch = function(req, res, next) {
            var body,
                data,
                type,
                target,
                text,
                content,
                patchRoot,
                url,
                diff,
                fs,
                err;

            err = function(code, message) {
                logger.error(message);
                res.send(code, message);
                res.end();
                return;
            };

            logger.info('Processing patch request.');

            fs = require('fs');

            body = req.body;
            if (body === null || body === undefined) {
                return err(400, 'No patch data provided.');
            }

            // TODO: parsing?
            data = body;

            // ---
            // verify type
            // ---

            type = data.type;
            if (!type) {
                return err(400, 'No patch type provided.');
            }

            if (type !== 'patch' && type !== 'file') {
                return err(400, 'Invalid patch type ' + type + '.');
            }

            // ---
            // verify target
            // ---

            target = data.target;
            if (!target) {
                return err(400, 'No patch target provided.');
            }

            url = TDS.expandPath(target);
            if (!url) {
                return err(400, 'Unable to resolve patch target url.');
            }

            patchRoot = path.resolve(TDS.expandPath(
                TDS.getcfg('tds.patch.root')));

            if (url.indexOf(patchRoot) !== 0) {
                return err(403, 'Patch target outside patch directory.');
            }

            // ---
            // verify content
            // ---

            content = data.content;
            if (!content) {
                return err(400, 'No patch content provided.');
            }

            // ---
            // process the patch
            // ---

            logger.info('Processing patch for ' + url);

            // TODO: remove sync versions

            if (type === 'patch') {
                // Read the target and applyPatch using JsDiff to get content.

                try {
                    text = fs.readFileSync(url, {encoding: 'utf8'});
                    if (!text) {
                        throw new Error('NoData');
                    }
                } catch (e) {
                    return err('Error reading file data: ' + e.message);
                }

                diff = require('diff');

                text = diff.applyPatch(text, content);
            } else {
                // Supplied content is the new file text.
                text = content;
            }

            try {
                fs.writeFileSync(url, text);
            } catch (e) {
                return err('Error writing file ' + url + ': ' + e.message);
            }

            res.send('ack');
            res.end();
        };

        //  ---
        //  Routes
        //  ---

        app.put(TDS.cfg('tds.patch.uri'), loggedIn, TDS.patch);
        app.post(TDS.cfg('tds.patch.uri'), loggedIn, TDS.patch);
        app.patch(TDS.cfg('tds.patch.uri'), loggedIn, TDS.patch);
    };

}(this));

