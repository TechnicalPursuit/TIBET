/**
 * @overview Simple task runner for sending data via SFTP to a remote server.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    /**
     *
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var app,
            logger,
            TDS,
            fs,
            path,
            SFTPClient,
            archiver,
            meta;

        //  ---
        //  Loadtime
        //  ---

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        meta = {
            comp: 'TWS',
            type: 'task',
            name: 'sftp'
        };
        logger = logger.getContextualLogger(meta);

        //  ---
        //  Task name
        //  ---

        module.exports.taskName = 'sftp';

        //  ---

        fs = require('fs');
        path = require('path');

        SFTPClient = require('sftp-promises');

        archiver = require('archiver-promise');

        //  ---
        //  Runtime
        //  ---

        /**
         * The actual task execution function which will be invoked by the task
         * runner.
         */
        return function(job, step, params) {
            var sftpOpts,

                root,
                fullpath,

                sftpObj,
                contentBuffer,

                fileNamePrefix,
                fileNameExtension,

                targetFileName,
                targetFullFilePath,

                sourceFullFilePath,
                sourceFile,

                archive,
                i,
                attachmentPath,
                attachmentFileName;

            logger.trace(TDS.beautify(step));

            //  Basic sftp params sanity check
            if (!params.host) {
                return TDS.Promise.reject(new Error(
                    'Misconfigured sftp task. No params.host value.'));
            }

            if (!params.username) {
                return TDS.Promise.reject(new Error(
                    'Misconfigured sftp task. No params.username value.'));
            }

            if (!params.targetpath) {
                return TDS.Promise.reject(new Error(
                    'Misconfigured sftp task. No params.targetpath value.'));
            }

            //  We need either one of these
            if (!params.password && !params.keyfile) {
                logger.warn('Missing params.password or params.keyfile.');
                return TDS.Promise.reject(new Error(
                    'Misconfigured sftp task. No params.password or params.keyfile value.'));
            }

            //  Basic content sanity check
            if (!params.text) {
                return TDS.Promise.reject(new Error(
                    'Misconfigured sftp task. No params.text value.'));
            }

            sftpOpts = {};

            //  The root path will get us into the root of the project.
            root = path.resolve(TDS.expandPath('~'));

            //  If there is a key file, read it into the 'privateKey' field of
            //  the params.
            if (params.keyfile) {
                fullpath = path.join(root, params.keyfile);
                sftpOpts.privateKey = fs.readFileSync(fullpath);
            } else {
                sftpOpts.password = TDS.decrypt(params.password);
            }

            sftpOpts.host = params.host;
            sftpOpts.username = params.username;

            step.stdout = {};

            //  In a dry run environment, just write the sftp options to
            //  stdout and return a resolved Promise.
            if (TDS.ifDryrun()) {
                sftpOpts.status = 'SFTP upload successful';
                step.stdout = sftpOpts;
                return TDS.Promise.resolve();
            }

            //  Create a new SFTP object to send the content to an SFTP server.
            sftpObj = new SFTPClient(sftpOpts);

            //  Create a Buffer of the text of the submission.
            contentBuffer = new Buffer(params.text, 'utf-8');

            //  Get the file name prefix to use
            fileNamePrefix = params.prefix || '';

            //  Get the file name extension to use
            fileNameExtension = params.extension || 'txt';

            //  Create a file name that's a stringified Date with its leading
            //  and trailing quotes sliced off.
            targetFileName = JSON.stringify(new Date()).slice(1, -1);

            //  If attachments are specified, then create a .zip archive and add
            //  the content and attachment files to it.
            if (params.attachments) {

                //  Compute the file name that will be used for the .zip file
                //  when we copy it to the target machine.
                targetFileName += '.zip';
                targetFileName = targetFileName.replace(/:/g, '_');

                targetFullFilePath = path.join(
                                        params.targetpath,
                                        targetFileName);

                //  Compute the local file name that will be temporarily used to
                //  create the .zip archive. We will delete this when it's all
                //  done.
                sourceFullFilePath = path.join(root, 'zips', targetFileName);
                sourceFile = fs.createWriteStream(sourceFullFilePath);

                //  Create the .zip archive object.
                archive = archiver('zip', {store: true});

                //  Put the Buffer of the text of the submission into the
                //  archive with a name of 'submission'.
                archive.append(
                    contentBuffer, {name: 'submission.' + fileNameExtension});

                //  Iterate over the attachments, computing a file path and file
                //  name and use those to add each attachment to the archive.
                for (i = 0; i < params.attachments.length; i++) {
                    attachmentPath = params.attachments[i];
                    attachmentFileName = attachmentPath.slice(
                                    attachmentPath.lastIndexOf('/') + 1);
                    archive.file(attachmentPath, {name: attachmentFileName});
                }

                //  Pipe the archive into the local temporary file that we've
                //  created.
                archive.pipe(sourceFile);

                //  Finalize the archive (wrapping the returned Promise into a
                //  Bluebird-enhanced Promise).
                return TDS.Promise.resolve(archive.finalize()).then(
                    function() {
                        //  Cause the SFTP object to copy the temporary local
                        //  file to the target location.

                        //  Return a Bluebird-enhanced Promise wrapping the
                        //  returned Promise from the SFTP object.
                        return TDS.Promise.resolve(
                            sftpObj.put(
                                sourceFullFilePath, targetFullFilePath)).then(
                                function() {
                                    //  At the last step before we finish and
                                    //  completely resolve the chain of
                                    //  Promises, delete the local temporary
                                    //  file that we crated.
                                    fs.unlinkSync(sourceFullFilePath);
                                }).catch(
                                function(err) {
                                    step.stderr = {
                                        status: 'SFTP upload failed.',
                                        rawmsg: 'SFTP upload failed: ' +
                                                err.toString()
                                    };

                                    return TDS.Promise.reject(
                                            new Error('SFTP upload failed: ' +
                                                                        err));
                                });
                    });

            } else {

                //  Compute the file name that will be used for the .txt file
                //  when we copy it to the target machine.
                targetFileName = fileNamePrefix +
                                    targetFileName +
                                    '.' +
                                    fileNameExtension;

                targetFileName = targetFileName.replace(/:/g, '_');

                targetFullFilePath = path.join(
                                        params.targetpath,
                                        targetFileName);

                //  Cause the SFTP object to copy the Buffer holding the text of
                //  the submission to the target location.

                //  The sftp object will return a native Promise, but the TWS
                //  expects Bluebird-enhanced Promises, so we create one from
                //  the native Promise.
                return TDS.Promise.resolve(
                    sftpObj.putBuffer(contentBuffer, targetFullFilePath)).then(
                        function(result) {
                            step.stdout.status = 'SFTP upload succeeded.';
                            return result;
                        }).catch(
                        function(err) {
                            step.stderr = {
                                status: 'SFTP upload failed.',
                                rawmsg: 'SFTP upload failed: ' + err.toString()
                            };

                            return TDS.Promise.reject(
                                    new Error('SFTP upload failed: ' + err));
                        });
            }
        };
    };

}(this));
