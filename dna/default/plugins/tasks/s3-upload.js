/**
 * @overview Simple task runner for storing data in an s3 bucket.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

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
            AWS,
            Promise,
            meta;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        meta = {
            comp: 'TWS',
            type: 'task',
            name: 's3-upload'
        };
        logger.system('loading task', meta);

        //  ---
        //  Requires
        //  ---

        AWS = require('aws-sdk');
        Promise = require('bluebird');

        //  ---
        //  Task
        //  ---

        /**
         * The actual task execution function which will be invoked by the task
         * runner.
         */
        return function(job, step, params) {
            var service,
                serviceOpts,
                uploadOpts,
                upload,
                promise,
                stepID,
                template,
                body;

            meta.name = job.state;
            stepID = job._id;

            logger.info(stepID + ' step starting', meta);

            logger.debug(JSON.stringify(step), meta);

            //  Basic option sanity check
            if (!params.auth) {
                return Promise.reject(new Error(
                    'Misconfigured S3 task. No params.auth found.'));
            }

            //  Basic authentication value check
            if (!params.auth.id || !params.auth.secret) {
                return Promise.reject(new Error(
                    'Misconfigured S3 task. No params.auth.id and/or params.auth.secret.'));
            }

            if (!params.region || !params.bucket) {
                return Promise.reject(new Error(
                    'Misconfigured S3 task. No params.region and/or params.bucket.'));
            }

            //  Basic content sanity check
            if (!params.key || !params.body) {
                return Promise.reject(new Error(
                    'Misconfigured SMTP task. Missing params.key and/or params.body.'));
            }

            //  Build up the options necessary to construct the service.
            serviceOpts = {};

            serviceOpts.accessKeyId = TDS.decrypt(params.auth.id);
            serviceOpts.secretAccessKey = TDS.decrypt(params.auth.secret);

            serviceOpts.region = params.region;

            serviceOpts.params = {};
            serviceOpts.params.Bucket = params.bucket;

            try {
                template = TDS.template.compile(params.body);
                body = template(params);
            } catch (e) {
                return Promise.reject(e);
            }

            //  Build up the options for the upload operation itself.
            uploadOpts = {
                Key: params.key,
                Body: body
            };

            //  build the service and create a promise-driven version of upload.
            service = new AWS.S3(serviceOpts);
            upload = Promise.promisify(service.upload.bind(service));

            logger.info(stepID + ' uploading data to s3', meta);

            //  Invoke the upload operation, returning the promise for the task
            //  engine to link to.
            promise = upload(uploadOpts).then(function(result) {
                logger.info(stepID + ' step succeeded', meta);
            }).catch(function(err) {
                logger.error(stepID + ' step failed', meta);
                throw err;
            });

            return promise;
        };
    };
}());
