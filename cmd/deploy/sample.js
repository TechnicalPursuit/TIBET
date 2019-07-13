/**
 * A sample 'tibet deploy' command. This one is built to handle invocations of
 * the TIBET CLI with a command line of:
 * 'tibet deploy sample'.
 */

(function() {
    'use strict';

    module.exports = function(cmdType) {

        //  NOTE: we patch the prototype since invocation is instance-level.
        cmdType.prototype.executeSample = function() {
            /* eslint-disable no-console */
            console.log('deploying sample...');
            /* eslint-enable no-console */
        };
    };

}(this));
