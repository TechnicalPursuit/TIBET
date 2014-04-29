/**
 * TIBET platform makefile. Key targets here focus on packaging the various
 * portions of the platform for inclusion in TIBET applications.
 */

(function() {

    'use strict';

    var sh = require('shelljs');
    var nodeCLI = require('shelljs-nodecli');
    var helpers = require('tibet/src/cli/_make_helpers');

    //  ---
    //  targets
    //  ---

    /**
     * Canonical `targets` object for exporting the various target functions.
     */
    var targets = {};


    /**
     */
    targets.test = function(make) {
        var result;

        make.log('testing...');

        result = nodeCLI.exec('mocha', '--ui bdd', '--reporter dot');

        if (result.code !== 0) {
            targets.test.reject();
            return;
        }

        try {
            targets.test.resolve();
        } catch (e) {
            targets.test.reject(e);
        }
    };


    //  ---
    //  export
    //  ---

    module.exports = targets;

}());
