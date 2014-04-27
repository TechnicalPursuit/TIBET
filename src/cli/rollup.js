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

(function() {

'use strict';

var CLI = require('./_cli');
var beautify = require('js-beautify').js_beautify;
var sh = require('shelljs');

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
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Creates a minified and concatenated version of a package#config.\n\n' +
'Output from this command is written to stdout for use in redirection.\n' +
'Command-line options mirror those for the `tibet package` command.\n' +
'See `tibet help package` and the uglify-js documentation for more.\n';


/**
 * Command argument parsing options.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = {
    boolean: [
        'color', 'help', 'usage', 'debug', 'stack', 'verbose',
        'all', 'scripts', 'styles', 'images', 'nodes', 'headers'
    ],
    string: ['package', 'config', 'include', 'exclude', 'phase']
};


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet rollup [package-opts] [--headers]';


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
 * @return {Number} A return code. Non-zero indicates an error.
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

    list.forEach(function(item) {
        var src;
        var code;
        var virtual;

        // If this doesn't work it's a problem for any 'script' output.
        src = item.getAttribute('src') || item.getAttribute('href');

        if (src) {
            virtual = pkg.getVirtualPath(src);

            if (!sh.test('-e', src)) {
                console.log();
                throw new Error('NotFound: ' + src);
            }

            try {
                code = ug.minify(src, uglifyOpts).code;
                if (code && code[code.length - 1] !== ';') {
                    code += ';';
                }
            } catch (e) {
                // TODO: refine error messaging.
                throw e;
            }

            if (cmd.options.headers) {
                console.log('TP.boot.$srcPath = \'' + virtual + '\';');
            }
            console.log(code);

        } else {
            if (cmd.options.headers) {
                console.log('TP.boot.$srcPath = \'\';');
            }
            console.log(item.textContent);
        }
    });
};


/**
 * Perform any last-minute changes to the package options before creation of the
 * internal Package instance. Intended to be overridden but custom subcommands.
 */
Cmd.prototype.finalizePackageOptions = function() {

    // Force nodes to be true for this particular subcommand. Better to handle
    // the unwrapping ourselves so we have complete access to all
    // metadata and/or child node content.
    this.pkgOpts.nodes = true;

    this.verbose('pkgOpts: ' + beautify(JSON.stringify(this.pkgOpts)));
};


module.exports = Cmd;

}());
