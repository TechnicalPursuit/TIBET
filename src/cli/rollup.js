/**
 * @file rollup.js
 * @overview The 'tibet rollup' command. This command inherits from 'tibet
 * package' and works with a list of package asset nodes to process them into
 * compressed and concatenated form for faster loading. See the tibet package
 * command for more information on options.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/*eslint no-extra-semi:0*/
;(function() {

'use strict';

var CLI = require('./_cli');

//  ---
//  Type Construction
//  ---

// NOTE we don't inherit from _cmd, but from package.
var Parent = require('./package');

var Cmd = function(){};
Cmd.prototype = new Parent();


//  ---
//  Instance Attributes
//  ---

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet rollup [package-opts]';


//  ---
//  Instance Methods
//  ---

/**
 * Produces a compressed package of code ready for inclusion in a production
 * package. Note that virtually everything defaults when running in a typical
 * TIBET application context. For processing the TIBET platform you must at
 * least provide a package name (since the platform doesn't keep its tibet.xml
 * in the typical application location under TIBET-INF).
 * @param {Array.<Node>} list An array of package asset nodes.
 */
Cmd.prototype.executeForEach = function(list) {

    var pkg;
    var cmd;
    var ug;         // The uglify-js compressor export.
    var uglifyOpts; // Options for uglify.

    cmd = this;
    pkg = this.package;

    ug = require('uglify-js');
    uglifyOpts = CLI.ifUndefined(this.config.uglify, {});

    list.forEach(function(node) {
        var src = node.getAttribute('src');
        var code;
        var virtual;

        if (src) {
            virtual = pkg.getVirtualPath(src);
            if (cmd.argv.files) {
                console.log(src);
            } else {
                code = ug.minify(src, uglifyOpts).code;
                if (code && code[code.length - 1] !== ';') {
                    code += ';';
                }

                console.log('TP.boot.$srcPath = \'' + virtual + '\';');
                console.log(code);
            }
        } else {
            if (cmd.argv.files) {
                console.log(node);
            } else {
                console.log('TP.boot.$srcPath = \'\';');
                console.log(node.textContent);
            }
        }
    });
};

module.exports = Cmd;

}());
