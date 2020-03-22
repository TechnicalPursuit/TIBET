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
            meta;

        //  ---
        //  Intro
        //  ---

        app = options.app;
        logger = options.logger;
        TDS = app.TDS;

        meta = {
            comp: 'TWS',
            type: 'task',
            name: 'noop'
        };
        logger = logger.getContextualLogger(meta);

        //  ---
        //  Task name
        //  ---

        module.exports.taskName = 'noop';

        //  ---
        //  Runtime
        //  ---

        /**
         * The actual task execution function which will be invoked by the task
         * runner.
         */
        return function(job, step, params) {

            logger.trace(TDS.beautify(step));

            return new TDS.Promise(function(resolve, reject) {

                //  No real work to do here...
                return resolve();
            });
        };
    };

}(this));
