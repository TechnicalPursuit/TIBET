/**
 * TIBET platform makefile. Key targets here focus on packaging the various
 * portions of the platform for inclusion in TIBET applications.
 */

(function() {

    'use strict';

    var sh = require('shelljs');
    var nodeCLI = require('shelljs-nodecli');

    //  ---
    //  helpers
    //  ---

    /**
     * Canonical `helper` object for internal utility functions.
     */
    var helpers = {};


    /**
     *
     */
    helpers.rollup = function(make, name, pkg, config, headers, promise) {
        var result;
        var cmd;

        make.log('rolling up ' + name);

        cmd = 'tibet rollup --package \'' + pkg +
            '\' --config ' + config +
            (headers ? '' : ' --no-headers');

        make.log('executing ' + cmd);
        result = sh.exec(cmd, {
            silent: true
        });

        if (result.code !== 0) {
            promise.reject(result.output);
            return;
        }

        try {
            result.output.to('./build/tibet_' + name + '.min.js');
            promise.resolve();
        } catch (e) {
            promise.reject(e);
        }
    };


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
