/**
 * @overview Simple task runner for sending email via nodemailer sendmail.
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
            nodemailer;

        //  ---
        //  Loadtime
        //  ---

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        nodemailer = require('nodemailer');

        //  ---
        //  Runtime
        //  ---

        /**
         * The actual task execution function which will be invoked by the task
         * runner.
         */
        return function(job, step, params) {
            var sendmailOpts,
                mailOpts,
                transporter,
                template,
                send;

            TDS.ifDebug() ? logger.debug(JSON.stringify(step)) : 0;

            //  Basic sendmail option sanity check
            if (!params.sendmail) {
                return TDS.Promise.reject(new Error(
                    'Misconfigured sendmail task. No params.sendmail.'));
            }

            //  Basic mail options sanity check
            if (!params.from || !params.subject) {
                return TDS.Promise.reject(new Error(
                'Misconfigured sendmail task. Missing params.from, ' +
                'params.to, and/or ' +
                'params.subject.'));
            }

            //  Basic content sanity check
            if (!params.text && !params.html) {
                logger.warn('Missing params.text and params.html.');
                params.text = '';
            }

            //  Map over the sendmail parameters from the task as our top-level
            //  option data. This should give us optional values for the path,
            //  newline, and args for the nodemailer sendmail transport.
            sendmailOpts = TDS.blend({}, params.sendmail);

            sendmailOpts.path = sendmailOpts.path || 'sendmail';
            sendmailOpts.newline = sendmailOpts.newline || 'unix';
            //  NOTE we don't try to default the 'args' param since that can
            //  cause issues if we don't get the required flags right etc.

            mailOpts = {};

            mailOpts.subject = params.subject;
            mailOpts.from = params.from;
            mailOpts.to = params.to;

            try {
                if (params.html) {
                    template = TDS.template.compile(params.html);
                    mailOpts.html = template(
                        {
                            job: job,
                            step: step,
                            params: params
                        });
                } else if (params.text) {
                    template = TDS.template.compile(params.text);
                    mailOpts.text = template(
                        {
                            job: job,
                            step: step,
                            params: params
                        });
                }
            } catch (e) {
                return TDS.Promise.reject(e);
            }

            //  Create the transport instance and verify the connection.
            transporter = nodemailer.createTransport(sendmailOpts);

            //  Use promise lib's promisify to wrap standard callbacks as
            //  promises so we can work with promises consistently. NOTE
            //  we have to bind() since promisify won't and we need internal
            //  'this' references to be correct.
            send = TDS.Promise.promisify(transporter.sendMail.bind(transporter));

            //  Supply a catch here in case the sendmail task has some sort of
            //  error, like it can't compute the correct username or password or
            //  connect for some other reason.
            return send(mailOpts).catch(
                function(err) {
                    return TDS.Promise.reject(
                            new Error('sendmail task failed: ' + err));
                });
        };
    };

}(this));
