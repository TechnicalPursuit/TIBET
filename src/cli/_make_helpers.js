/**
 * Sample TIBET-style makefile. Target functions are converted to promise
 * objects so you can use then() to chain tasks easily.
 */

(function() {

    'use strict';

    var sh = require('shelljs');


    /**
     * Canonical `helper` object for internal utility functions.
     */
    var helpers = {};


    /**
     *
     */
    helpers.rollup = function(make, name, pkg, config, headers, minify, promise) {
        var result;
        var cmd;
        var ext;
        var file;

        make.log('rolling up ' + name);

        cmd = 'tibet rollup --package \'' + pkg +
            '\' --config ' + config +
            (headers ? '' : ' --no-headers') +
            (minify ? ' --minify' : '');

        make.log('executing ' + cmd);
        result = sh.exec(cmd, {
            silent: true
        });

        if (result.code !== 0) {
            promise.reject(result.output);
            return;
        }

        if (minify) {
            ext = '.min.js';
        } else {
            ext = '.js';
        }

        file = './build/tibet_' + name + ext;

        try {
            make.log('Writing ' + result.output.length + ' chars to: ' + file);
            result.output.to(file);
            promise.resolve();
        } catch (e) {
            make.error('Unable to write to: ' + file);
            promise.reject(e);
        }
    };

    module.exports = helpers;

}());
