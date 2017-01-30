/**
 * @overview Simple task runner template.
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
            meta,
            Promise;

        //  ---
        //  Intro
        //  ---

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        meta = {
            comp: 'TWS',
            type: 'task',
            name: 'sample-task'     //  RENAME THIS!!!
        };
        logger.system('loading task', meta);

        //  ---
        //  Prereqs
        //  ---

        Promise = require('bluebird');

        //  ---
        //  Task
        //  ---

        /**
         * The actual task execution function which will be invoked by the task
         * runner.
         */
        return function(job, step, params) {
            var stepID,
                promise;

            meta.name = job.state;
            stepID = job._id;

            logger.info(stepID + ' step starting', meta);
            logger.debug(TDS.beautify(step), meta);

            //  ---
            //  Check task parameters
            //  ---

            //  Repeat this kind of block for all necessary parameters.
            /*
            if (!params.fluffy) {
                return Promise.reject(new Error(
                    'Misconfigured task. No params.fluffy.'));
            }
            */

            promise = new Promise(function(resolve, reject) {

                //  Do the real work here...
                return resolve();

            }).then(function(result) {
                logger.info(stepID + ' step succeeded', meta);
            }).catch(function(err) {
                logger.info(stepID + ' step failed', meta);
                throw err;
            });

            return promise;
        };
    };

}(this));
