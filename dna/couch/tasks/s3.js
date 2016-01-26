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
        var logger;

        //  ---
        //  Requires
        //  ---

        logger = options.logger;

        //  ---
        //  Variables
        //  ---

        //  ---
        //  Task
        //  ---

        /**
         * The actual task execution function which will be invoked by the task
         * runner.
         */
        return function(json) {

            console.log('\n');
            console.log('processing s3 for: ' +
                JSON.stringify(json));
        };
    };
}());
