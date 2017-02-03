/**
 * Sample TIBET-style makefile. Target functions are converted to promise
 * objects so you can use then() to chain tasks easily. Use resolve or reject
 * to notify when the target has completed.
 */

(function() {

    'use strict';

    var sh,
        path,
        helpers,
        targets;

    path = require('path');
    sh = require('shelljs');
    helpers = require('tibet/etc/helpers/make_helpers');

    /**
     * Canonical `targets` object for exporting the various target functions.
     */
    targets = {};

    /**
     */
    targets.build = function(make) {
        make.log('building app...');

        targets.clean().then(
            targets.check_lint).then(
            targets.check_package).then(
            targets.build_resources).then(
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
    targets.build_resources = function(make) {
        var config;

        make.log('processing resources...');

        config = make.options.config || 'base';

        helpers.resource_build(make, {
            pkg: '~app_cfg/main.xml',
            config: config
        }).then(
        function() {
            targets.build_resources.resolve();
        },
        function() {
            targets.build_resources.reject();
        });
    };

    /**
     * Run lint and test commands to verify the code is in good shape.
     */
    targets.checkup = function(make) {
        make.log('checking app...');

        targets.check_lint().then(
            targets.check_package).then(
            targets.check_tests).then(
            function() {
                targets.checkup.resolve();
            },
            function() {
                targets.checkup.reject();
            });
    };

    /**
     * Run lint and test commands to verify the code is in good shape.
     */
    targets.check_lint = function(make) {
        var result;

        make.log('checking for lint...');

        result = sh.exec('tibet lint');
        if (result.code !== 0) {
            targets.check_lint.reject();
            return;
        }

        targets.check_lint.resolve();
    };

    /**
     */
    targets.check_package = function(make) {
        var config;

        make.log('verifying packages...');

        config = make.options.config || 'base';

        helpers.package_check(make, {
            pkg: '~app_cfg/main.xml',
            config: config
        }).then(
        function() {
            targets.check_package.resolve();
        },
        function() {
            targets.check_package.reject();
        });
    };

    /**
     * Run unit tests to verify the code is in good shape.
     */
    targets.check_tests = function(make) {
        var result;

        make.log('running unit tests...');

        result = sh.exec('tibet test');
        if (result.code !== 0) {
            targets.check_tests.reject();
            return;
        }

        targets.check_tests.resolve();
    };

    /**
     */
    targets.clean = function(make) {
        var dir;

        make.log('cleaning...');

        dir = make.CLI.expandPath('~app_build');
        if (sh.test('-d', dir)) {
            sh.rm('-rf', path.join(dir, '*'));
        }

        dir = make.CLI.expandPath('~app_log');
        if (sh.test('-d', dir)) {
            sh.rm('-rf', path.join(dir, '*'));
        }

        targets.clean.resolve();
    };

    /**
     */
    targets.deploy = function(make) {
        var args;

        make.log('deploying application...');

        args = make.getArgv();
        if (args.length) {
            make.log('deployment args: ' + args.join(' '));
        }

        make.warn('No concrete deployment logic.');

        targets.deploy.resolve();
    };

    /**
     */
    targets.rollup = function(make) {
        var dir,
            config;

        make.log('rolling up assets...');

        dir = make.CLI.expandPath('~app_build');
        if (!sh.test('-d', dir)) {
            sh.mkdir(dir);
        }

        config = make.options.config || 'base';

        helpers.rollup(make, {
            pkg: '~app_cfg/main.xml',
            config: config,
            phase: 'two',
            dir: dir,
            prefix: 'app_',
            headers: true,
            minify: false,
            zip: true
        }).then(function() {
            return helpers.rollup(make, {
                pkg: '~app_cfg/main.xml',
                config: config,
                phase: 'two',
                dir: dir,
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
