/**
 * @file _make_helpers.js
 * @overview Common shared utility functions for TIBET-style 'make' operations.
 *     See the make.js command file for more information on 'tibet make'.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

'use strict';

var CLI = require('./_cli');
var sh = require('shelljs');

/**
 * Canonical `helper` object for internal utility functions.
 */
var helpers = {};


/**
 * A common utility used by rollup operations to avoid duplication of the
 * logic behind building specific rollup products.
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
        silent: (CLI.options.silent !== true)
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
