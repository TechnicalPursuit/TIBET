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

    module.exports = helpers;

}());
