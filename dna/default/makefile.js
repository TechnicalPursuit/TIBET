/**
 * Sample TIBET-style makefile. Target functions are converted to promise
 * objects so you can use then() to chain tasks easily.
 */

(function() {

    'use strict';

    var sh = require('shelljs');

    /*
     * Uncomment to run node_modules-based utilities.
    var nodeCLI = require('shelljs-nodecli');
    */

    /*
     * Uncomment to include TIBET's default make helper routines.
    var helpers = require('tibet/src/cli/_make_helpers');
    */

    //  ---
    //  targets
    //  ---

    /**
     * Canonical `targets` object for exporting the various target functions.
     */
    var targets = {};

    /**
     * Canonical test target.
     */
    targets.test = function(make) {
        var result;

        make.log('checking for lint...');

        result = sh.exec('tibet lint');
        if (result.code !== 0) {
            targets.test.reject();
            return;
        }

        make.log('running unit tests...');
        make.warn('add some tests... ;)');
        targets.test.resolve();
    };


    //  ---
    //  export
    //  ---

    module.exports = targets;

}());
