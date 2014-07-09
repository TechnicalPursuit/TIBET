/**
 * Sample TIBET-style makefile. Target functions are converted to promise
 * objects so you can use then() to chain tasks easily. Use resolve or reject
 * to notify when the target has completed.
 */

(function() {

'use strict';

var sh = require('shelljs');

// Uncomment to run node_modules-based utilities via shelljs.
// var nodeCLI = require('shelljs-nodecli');

// Uncomment to include TIBET's make helper routines for rollups.
// var helpers = require('tibet/src/tibet/cli/_make_helpers');

/**
 * Canonical `targets` object for exporting the various target functions.
 */
var targets = {};

/**
 * Run lint and test commands to verify the code is in good shape.
 */
targets.check = function(make) {
    var result;

    make.log('checking for lint...');

    result = sh.exec('tibet lint');
    if (result.code !== 0) {
        targets.check.reject();
        return;
    }

    make.log('running unit tests...');

    result = sh.exec('tibet test');
    if (result.code !== 0) {
        targets.check.reject();
        return;
    }

    targets.check.resolve();
};

module.exports = targets;

}());
