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
    helpers = require('tibet/etc/cli/make_helpers');

    /**
     * Canonical `targets` object for exporting the various target functions.
     */
    targets = {};

    /**
     */
    targets.build = function(make) {
        make.log('building app...');

        targets.clean().then(
            targets.resources).then(
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
    targets.resources = function(make) {
        var dir;

        make.log('processing resources...');

        helpers.resources(make, {
            pkg: '~app_cfg/main.xml',
            config: 'base',
        }).then(
        function() {
            targets.resources.resolve();
        },
        function() {
            targets.resources.reject();
        });
    };

    /**
     */
    targets.rollup = function(make) {
        var dir;

        make.log('rolling up assets...');

        dir = make.CLI.expandPath('~app_build');
        if (!sh.test('-d', dir)) {
            sh.mkdir(dir);
        }

        helpers.rollup(make, {
            pkg: '~app_cfg/tibet.xml',
            config: 'base',
            phase: 'one',
            dir: dir,
            prefix: 'tibet_',
            headers: true,
            minify: false,
            zip: true
        }).then(function() {
            return helpers.rollup(make, {
                pkg: '~app_cfg/tibet.xml',
                config: 'base',
                phase: 'one',
                dir: dir,
                prefix: 'tibet_',
                headers: true,
                minify: true,
                zip: true
            });
        }).then(function() {
            return helpers.rollup(make, {
                pkg: '~app_cfg/main.xml',
                config: 'base',
                phase: 'two',
                dir: dir,
                prefix: 'app_',
                headers: true,
                minify: false,
                zip: true
            });
        }).then(function() {
            return helpers.rollup(make, {
                pkg: '~app_cfg/main.xml',
                config: 'base',
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
