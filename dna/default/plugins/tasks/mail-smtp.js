/**
 * @overview Simple task runner for sending email via nodemailer smtp.
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
            meta;

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        meta = {
            comp: 'TWS',
            type: 'task',
            name: 'mail-smtp'
        };
        logger = logger.getContextualLogger(meta);

        //  ---
        //  Task name
        //  ---

        module.exports.taskName = 'smtp';

        //  ---

        nodemailer = require('nodemailer');

        //  ---
        //  Task
        //  ---

        /**
         * The actual task execution function which will be invoked by the task
         * runner.
         */
        return function(job, step, params) {
            var smtpOpts,
                mailOpts,

                i,
                fullPath,
                fileName,

                transporter,
                srctext,
                format,
                template,
                send;

            logger.trace(job, TDS.beautify(step));

            //  Basic SMTP option sanity check. These params should include the
            //  service and auth (user/pass) data for the SMTP config.
            if (!params.transport) {
                return TDS.Promise.reject(new Error(
                    'Misconfigured SMTP task. No params.transport value.'));
            }

            //  We need a minimum of from/to/subject to do any mailing.
            ['from', 'to', 'subject'].forEach(function(key) {
                if (!params[key]) {
                    return TDS.Promise.reject(new Error(
                    'Misconfigured SMTP task. Missing param: ' + key + '.'));
                }
            });

            //  Basic content sanity check
            if (!params.text && !params.html) {
                logger.warn('Missing params.text and params.html.');

                //  We allow empty body, but not empty subject.
                format = 'text';
                srctext = '';
            } else if (params.html) {
                format = 'html';
                srctext = params[format];
            } else {
                format = 'text';
                srctext = params[format];
            }

            //  Map over the smtp parameters from the task as our top-level
            //  option data. This should give us service name, secure, host,
            //  port, auth: {user, pass} etc.
            smtpOpts = TDS.blend({}, params.transport);

            //  Decrypt the username, which should always be provided from the
            //  database and stored in encrypted form.
            if (smtpOpts.auth && smtpOpts.auth.user) {
                smtpOpts.auth.user = TDS.decrypt(smtpOpts.auth.user);
            }

            //  Decrypt the password, which should always be provided from the
            //  database and stored in encrypted form.
            if (smtpOpts.auth && smtpOpts.auth.pass) {
                smtpOpts.auth.pass = TDS.decrypt(smtpOpts.auth.pass);
            }

            if (smtpOpts.secure === undefined) {
                smtpOpts.secure = true;
            }

            mailOpts = {};

            mailOpts.subject = params.subject;
            mailOpts.from = params.from;
            mailOpts.to = params.to;
            mailOpts.cc = params.cc;
            mailOpts.bcc = params.bcc;

            //  Process any file attachments by adding their file paths and file
            //  names to the 'attachments' Array that nodemailer will use to
            //  send them.
            if (params.attachments) {
                mailOpts.attachments = [];
                for (i = 0; i < params.attachments.length; i++) {
                    fullPath = params.attachments[i];
                    fileName = fullPath.slice(fullPath.lastIndexOf('/') + 1);
                    mailOpts.attachments.push({
                            filename: fileName,
                            path: fullPath
                        });
                }
            }

            try {
                template = TDS.template.compile(srctext);
                mailOpts[format] = template(
                    {
                        job: job,
                        step: step,
                        params: params
                    });
            } catch (e) {
                return TDS.Promise.reject(e);
            }

            //  Provide final mail content for any downstream services.
            step.stdout = {mail: mailOpts, format: format};

            //  In a dry run environment, just write the SMTP options to
            //  stdout and return a resolved Promise.
            if (TDS.ifDryrun()) {
                smtpOpts.status = 'SMTP succeeded IN DRY RUN MODE.';
                step.stdout = smtpOpts;
                return TDS.Promise.resolve();
            }

            //  Create the transport instance and verify the connection.
            transporter = nodemailer.createTransport(smtpOpts);

            //  Use promise lib's promisify to wrap standard callbacks as
            //  promises so we can work with promises consistently. NOTE
            //  we have to bind() since promisify won't and we need internal
            //  'this' references to be correct.
            send = TDS.Promise.promisify(transporter.sendMail.bind(transporter));

            logger.trace(job, ' sending email via SMTP');

            //  Supply a catch here in case the SMTP task has some sort of
            //  error, like it can't compute the correct username or password or
            //  connect for some other reason.
            return send(mailOpts).then(
                function(result) {
                    step.stdout.status = 'SMTP succeeded.';
                    return result;
                }).catch(
                function(err) {
                    step.stderr = {
                        status: 'SMTP failed.',
                        rawmsg: 'SMTP failed: ' + err.toString()
                    };

                    throw new Error('SMTP task failed: ' + err);
                });
        };
    };

}(this));
