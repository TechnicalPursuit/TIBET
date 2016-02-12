/**
 * @overview Simple task runner for sending email.
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

            nodemailer,
            mandrill,

            transport;

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

        nodemailer = require('nodemailer');

        //  TODO:   make the choice of email service a configurable value.
        mandrill = require('nodemailer-mandrill-transport');

        //  ---
        //  Variables
        //  ---

        //  TODO:   make the choice of email service a configurable value.
        //  TODO:   load service credentials/options from the tds.json file.
        transport = nodemailer.createTransport(mandrill({
            auth: {
                apiKey: 'ZBvuUZ6UhGlIwnYdJYaZdg'
            }
        }));

        //  ---
        //  Task
        //  ---

        /**
         * The actual task execution function which will be invoked by the task
         * runner.
         */
        return function(job, step, taskOptions) {
            var params;

            logger.debug('\n');
            logger.debug('processing email for: ' +
                JSON.stringify(step));

            params = step.params;

            //  TODO:   read a template from somewhere. and make the targets
            //  here configurable.
            transport.sendMail({
                from: params.from || 'defaultmailer@formsanity.com',
                to: params.to || 'ss@technicalpursuit.com',
                subject: params.subject || 'Test',
                html: params.body || 'Sending FS doc: ' +
                    '<code>' + TDS.beautify(JSON.stringify(step)) + '</code>'
            },
            function(err, info) {
                var nano,
                    db;

                if (err) {
                    logger.error('email failed: ' + err);
                    return;
                }

                logger.debug('email succeeded: ' + JSON.stringify(info));

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
            });
        };
    };

}(this));
