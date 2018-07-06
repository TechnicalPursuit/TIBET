//  ========================================================================
/**
 * @overview Simple helper objects and support routines for the TWS engine.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */
//  ========================================================================

(function(root) {

    'use strict';

    /**
     * Returns a function which when executed will return an 'Evaluator' which
     * can be used to process simple boolean expressions.
     * @param {Object} options Configuration options shared across TDS modules.
     * @returns {Function} A function which will configure/activate the helper.
     */
    module.exports = function(options) {
        var app,
            TDS,
            logger,
            meta,
            safeEval,
            TWS,
            Job,
            Evaluator;

        app = options.app;
        TDS = app.TDS;

        meta = {
            comp: 'TWS',
            type: 'plugin',
            name: 'tasks'
        };
        logger = options.logger.getContextualLogger(meta);

        safeEval = require('safe-eval');

        TWS = {};

        //  ---
        //  Job Processing
        //  ---

        Job = {};

        TWS.Job = Job;

        /**
         * Dictionary of job ids and references to callbacks to be
         * invoked/notified as jobs move through the task engine.
         */
        Job.$$subscribers = {};

        /**
         */
        Job.didFail = function(jobOrStep) {
            return jobOrStep.state === '$$failed';
        };

        /**
         */
        Job.didSucceed = function(jobOrStep) {
            return jobOrStep.state === '$$complete';
        };

        /**
         */
        Job.getLastStep = function(job) {
            var steps;

            steps = job.steps;
            if (!steps) {
                return;
            }

            return steps[steps.length - 1];
        };

        /**
         */
        Job.getLastCompleteStep = function(job) {
            var steps,
                len,
                i,
                step;

            steps = job.steps;
            if (!steps) {
                return;
            }

            len = steps.length;

            for (i = len - 1; i >= 0; i--) {
                step = steps[i];
                //  NB: Jobs and Steps share the same status codes.
                if (Job.isComplete(step)) {
                    return step;
                }
            }
        };

        /**
         */
        Job.isComplete = function(jobOrStep) {
            return jobOrStep.state === '$$complete' ||
                    jobOrStep.state === '$$failed';
        };

        /**
         * Gets invoked when activity has occurred on the job.
         */
        Job.notify = function(job) {
            var id,
                subscriber;

            id = job._id;
            subscriber = Job.$$subscribers[id];

            if (TDS.notValid(subscriber)) {
                return;
            }

            try {
                subscriber(job);
            } catch (e) {
                logger.error(e);
                //  If a subscriber is invalid/throws then remove it.
                logger.warn('Removing faulty subscriber for job: ' + id);
                Job.$$subscribers[id] = undefined;
            }

            if (Job.isComplete(job)) {
                Job.$$subscribers[id] = undefined;
            }
        };

        /**
         * Invoke to remove the notifier and cease notifications
         */
        Job.removeNotifier = function(job) {
            var id,
                subscriber;

            id = job._id;
            subscriber = Job.$$subscribers[id];

            if (TDS.notValid(subscriber)) {
                return;
            }

            Job.$$subscribers[id] = undefined;
        };

        /**
         *
         */
        Job.submit = function(flow, owner, opts, subscriber) {
            var job,
                params,
                db;

            if (TDS.isEmpty(flow)) {
                return TDS.Promise.reject(
                    new Error('Bad request. Missing flow specification.'));
            }

            if (TDS.isEmpty(owner)) {
                return TDS.Promise.reject(
                    new Error('Bad request. Missing owner specification.'));
            }

            params = opts || {};

            job = {
                type: 'job',
                flow: flow,
                owner: owner,
                params: params
            };

            logger.debug('submitting job data: ' + TDS.beautify(job));

            db = TDS.getCouchDatabase({
                db_name: TDS.cfg('tds.tasks.db_name'),
                confirm: false
            });

            if (TDS.notValid(db)) {
                return TDS.Promise.reject(
                    new Error('Database connection error.'));
            }

            //  Pass back the promise in case the requestor wants to attach.
            return db.insertAsync(job).then(function(result) {
                //  Once the insert is done we need to optionally register any
                //  subscriber hook under the job id. When the job changes
                //  status (i.e. first task start, task completion, etc.), the
                //  engine will notify. When the job is complete, the engine
                //  will notify and then remove the subscription.
                if (TDS.isValid(subscriber)) {
                    Job.$$subscribers[result[0].id] = subscriber;
                }

                return result;
            }).catch(function(err) {
                return err;
            });
        };

        //  ---
        //  Task Guard Evaluator
        //  ---

        Evaluator = {};

        TWS.Evaluator = Evaluator;

        /**
         *
         */
        Evaluator.evaluate = function(expression, params) {
            var template,
                data,
                expr,
                result;

            data = params || {};

            //  Log the guard and optionally the data we'll use during any
            //  expansion that may be required.
            logger.debug('expanding: ' + expression, meta);

            try {
                //  This pair effectively takes any field references to
                //  parameter data etc. in the guard and expands them so we end
                //  up with a secondary expression with those values in place.
                template = TDS.template.compile(expression);
                expr = template(data);

                //  Output the "expanded" expression we'll be evaluating.
                logger.debug('evaluating: ' + expr, meta);
                logger.trace('w/params:\n' + TDS.beautify(data), meta);

                try {
                    result = safeEval(expr);
                    result = Boolean(result);  //  always convert to a boolean
                } catch (e2) {
                    logger.error(e2);
                    result = false;
                }
            } catch (e) {
                logger.error(e);
                result = false;
            }

            return result;
        };

        //  ---
        //  Export
        //  ---

        return TWS;
    };

}(this));
