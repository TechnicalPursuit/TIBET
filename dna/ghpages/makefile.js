/**
 * Sample TIBET-style makefile. Target functions are converted to promise
 * objects so you can use then() to chain tasks easily. Use resolve or reject
 * to notify when the target has completed.
 */

(function() {

'use strict';

var sh = require('shelljs');
var helpers = require('tibet/src/tibet/cli/_make_helpers');

// Uncomment to run node_modules-based utilities via shelljs.
// var nodeCLI = require('shelljs-nodecli');

/**
 * Canonical `targets` object for exporting the various target functions.
 */
var targets = {};

/**
 */
targets.build = function(make) {
    make.log('building app...');

    targets.clean().then(
        targets.rollup).then(
        function() {
            targets.build.resolve();
        },
        function() {
            targets.build.reject();
        });
};

/**
 */
targets.clean = function(make) {
    make.log('cleaning...');

    if (sh.test('-d', './build')) {
        sh.rm('-rf', './build/*');
    }

    targets.clean.resolve();
};

/**
 */
targets.rollup = function(make) {
    make.log('rolling up assets...');

    if (!sh.test('-d', './build')) {
        sh.mkdir('./build');
    }

    helpers.rollup(make, {
        pkg: '~app_cfg/app.xml',
        config: 'base',
        dir: './build',
        prefix: 'app_',
        headers: true,
        minify: false
    }).then(function() {
        return helpers.rollup(make, {
            pkg: '~app_cfg/app.xml',
            config: 'base',
            dir: './build',
            prefix: 'app_',
            headers: true,
            minify: true
        });
    }).then(
    function() {
        targets.rollup.resolve();
    },
    function() {
        targets.rollup.reject();
    });
};

module.exports = targets;

}());
