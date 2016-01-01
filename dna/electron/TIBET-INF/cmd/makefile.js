/**
 * Sample TIBET-style makefile. Target functions are converted to promise
 * objects so you can use then() to chain tasks easily. Use resolve or reject
 * to notify when the target has completed.
 */

(function() {

    'use strict';

    var sh,
        helpers,
        targets;

    sh = require('shelljs');
    helpers = require('tibet/src/tibet/cli/_make_helpers');

    /**
     * Canonical `targets` object for exporting the various target functions.
     */
    targets = {};

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
     * Run lint and test commands to verify the code is in good shape.
     */
    targets.checkup = function(make) {
        var result;

        make.log('checking for lint...');

        result = sh.exec('tibet lint');
        if (result.code !== 0) {
            targets.checkup.reject();
            return;
        }

        make.log('running unit tests...');

        result = sh.exec('tibet test');
        if (result.code !== 0) {
            targets.checkup.reject();
            return;
        }

        targets.checkup.resolve();
    };

    /**
     */
    targets.clean = function(make) {
        make.log('cleaning...');

        if (sh.test('-d', './build')) {
            sh.rm('-rf', './build/*');
        }

        if (sh.test('-d', './log')) {
            sh.rm('-rf', './log/*');
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
            pkg: '~app_cfg/tibet.xml',
            config: 'base',
            phase: 'one',
            dir: './build',
            prefix: 'tibet_',
            headers: true,
            minify: false,
            zip: true
        }).then(function() {
            return helpers.rollup(make, {
                pkg: '~app_cfg/tibet.xml',
                config: 'base',
                phase: 'one',
                dir: './build',
                prefix: 'tibet_',
                headers: true,
                minify: true,
                zip: true
            });
        }).then(function() {
            return helpers.rollup(make, {
                pkg: '~app_cfg/app.xml',
                config: 'base',
                phase: 'two',
                dir: './build',
                prefix: 'app_',
                headers: true,
                minify: false,
                zip: true
            });
        }).then(function() {
            return helpers.rollup(make, {
                pkg: '~app_cfg/app.xml',
                config: 'base',
                phase: 'two',
                dir: './build',
                prefix: 'app_',
                headers: true,
                minify: true,
                zip: true
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
