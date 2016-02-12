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

    module.exports = function(options) {
        var app,
            logger,
            TDS,

            AWS,
            s3Service;

        //  ---
        //  Config Check
        //  ---

        app = options.app;
        if (!app) {
            throw new Error('No application instance provided.');
        }

        logger = options.logger;
        TDS = app.TDS;

        //  ---
        //  Requires
        //  ---

        AWS = require('aws-sdk');

        //  ---
        //  Variables
        //  ---

        s3Service = new AWS.S3(
            {
                accessKeyId: 'AKIAI3VQYU7ZLMBFMGCA',
                secretAccessKey: '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',
                region: 'us-east-1',
                params: {
                    Bucket: 'bedney'
                }
            });

        //  ---
        //  Task
        //  ---

        /**
         * The actual task execution function which will be invoked by the task
         * runner.
         */
        return function(job, step, taskOptions) {

            var params,

                uploadParams;

            logger.debug('\n');
            logger.debug('processing s3 for: ' +
                JSON.stringify(step));

            params = step.params;

            uploadParams = {
                Key: 'stuff',
                Body: params.body || 'This is some body content'
            };

            s3Service.upload(
                uploadParams,
                function(err, resp) {

                    var nano,
                        db;

                    if (err) {
                        logger.error(
                                'S3 put operation failed: ' +
                                    TDS.beautify(JSON.stringify(err)));
                    } else {
                        logger.debug(
                                'S3 put operation succeeded: ' +
                                    TDS.beautify(JSON.stringify(resp)));

                        nano = require('nano')(taskOptions.db_url);
                        db = nano.use(taskOptions.db_name);

                        step.end = Date.now();
                        step.state = '$$complete';

                        logger.debug('update prepped: ' + JSON.stringify(step));

                        db.insert(job, function(err2, body) {
                            if (err2) {
                                logger.error('job update failed: ' + err2);
                            }

                            logger.debug('job update succeeded: ' +
                                TDS.beautify(JSON.stringify(body)));
                        });
                    }
                });
        };
    };
}());
