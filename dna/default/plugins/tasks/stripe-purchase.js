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
            name: 'stripe-purchase'
        };
        logger = logger.getContextualLogger(meta);

        //  ---
        //  Task name
        //  ---

        module.exports.taskName = 'stripe';

        //  ---
        //  Helper methods
        //  ---

        module.exports.generateFormHeadContent = function(stepInfo) {

            var str;

            //  Basic Stripe params sanity check
            if (!stepInfo.params.public_key) {
                logger.error(
                    'Misconfigured Stripe task. No stepInfo.params.public_key' +
                    ' value.');
            }

            str = '<script src="https://js.stripe.com/v3/"></script>\n';
            str += '<script>' +
                    'window.stripe = Stripe(\'' +
                                        stepInfo.params.public_key +
                                        '\');' +
                    '</script>\n';

            return str;
        };

        //  ---
        //  Runtime
        //  ---

        /**
         * The actual task execution function which will be invoked by the task
         * runner.
         */
        return function(job, step, params) {

            var stripe,

                stripeOpts,

                body_data,
                token,
                amount;

            //  Basic Stripe params sanity check
            if (!params.secret_key) {
                return TDS.Promise.reject(new Error(
                    'Misconfigured Stripe task. No params.secret_key value.'));
            }

            body_data = job.params.req.body;

            //  Basic content sanity check
            if (!body_data) {
                return TDS.Promise.reject(new Error(
                    'Misconfigured Stripe task. Missing body.'));
            }

            stripe = require('stripe')(params.secret_key);

            stripeOpts = {};

            token = body_data.stripeToken;
            if (TDS.isEmpty(token)) {
                return TDS.Promise.reject(new Error(
                    'Misconfigured Stripe task. Missing token.'));
            }

            amount = parseFloat(body_data.payment_amount_other);
            if (TDS.isEmpty(amount) || isNaN(amount)) {
                amount = parseFloat(body_data.payment_amount);
                if (TDS.isEmpty(amount) || isNaN(amount)) {
                    return TDS.Promise.reject(new Error(
                        'Misconfigured Stripe task. Missing amount.'));
                }
            }

            //  Stripe wants us to move the decimal 2 places to the right (e.g.
            //  19.99 becomes 1999
            amount = Math.round(amount.toFixed(2) * 100);

            step.stdout = {};

            //  In a dry run environment, just write the Stripe options to
            //  stdout and return a resolved Promise.
            if (TDS.ifDryrun()) {
                stripeOpts.status = 'Stripe charge successful';
                step.stdout = stripeOpts;
                return TDS.Promise.resolve();
            }

            return TDS.Promise.resolve(
                stripe.charges.create({
                    amount: amount,
                    currency: 'usd',
                    description: params.description,
                    source: token
                })).then(
                function(result) {
                    step.stdout.status = 'Stripe charge succeeded.';
                    return result;
                }).catch(
                function(err) {
                    step.stderr = {
                        status: 'Stripe charge failed.',
                        rawmsg: 'Stripe charge failed: ' + err.toString()
                    };

                    throw new Error('Stripe charge failed: ' + err);
                });
        };
    };

}(this));
