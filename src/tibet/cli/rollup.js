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
var fs = require('fs');

var esprima = require('esprima');
var esmangle = require('esmangle');
var escodegen = require('escodegen');

//  ---
//  Type Construction
//  ---

// NOTE we don't inherit from _cmd, but from package.
var Parent = require('./package');

var Cmd = function(){};
Cmd.prototype = new Parent();


//  ---
//  Type Attributes
//  ---

/**
 * The context viable for this command.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;


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
'By default the output is not minified, but it does it contain filename\n' +
'data (aka \'headers\') to assist TIBET by providing file load metadata.\n\n' +

'You can minify output via the --minify flag, and turn off headers via\n' +
'--no-headers should you choose. Normally these flags are managed by one\n' +
'or more makefile.js targets used to build library or app-level bundles.\n\n' +

'<package-opts> refers to options for the \'tibet package\' command.\n';


/**
 * Command argument parsing options.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        boolean: ['all', 'scripts', 'styles', 'images', 'nodes', 'headers',
            'minify'
        ],
        string: ['package', 'config', 'include', 'exclude', 'phase'],
        default: {
            color: false,
            headers: true
        }
    },
    Parent.prototype.PARSE_OPTIONS);


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet rollup [package-opts] [--headers] [--minify]';


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
    var minifyOpts; // Options for minify

    cmd = this;
    pkg = this.package;

    if (CLI.inProject() && !CLI.isInitialized()) {
        return CLI.notInitialized();
    }

    minifyOpts = CLI.ifUndefined(this.config.tibet.minify, {});

    list.forEach(function(item) {
        var ast;
        var mangled;
        var src;
        var code;
        var virtual;

        // If this doesn't work it's a problem for any 'script' output.
        src = item.getAttribute('src') || item.getAttribute('href');

        if (src) {
            virtual = pkg.getVirtualPath(src);

            if (!sh.test('-e', src)) {
                throw new Error('NotFound: ' + src);
            }

            // Don't minify .min.js files, assume they're done. Also respect
            // either command-line option or element attribute to that effect.
            if (/\.min\.js$/.test(src) ||
                item.getAttribute('no-minify') === 'true' ||
                !cmd.options.minify) {
                code = fs.readFileSync(src, {encoding: 'utf8'});
            } else {
                try {
                    code = fs.readFileSync(src, {encoding: 'utf8'});

                    // Parse, reorg/mangle, & then re-generate JS code.
                    ast = esprima.parse(code);
                    mangled = esmangle.mangle(ast);
                    code = escodegen.generate(mangled, minifyOpts);

                    if (code && code[code.length - 1] !== ';') {
                        code += ';';
                    }
                } catch (e) {
                    cmd.error('Error minifying ' + src + ': ' + e.message);
                    throw e;
                }
            }

            if (cmd.options.headers) {
                pkg.log('TP.boot.$srcPath = \'' + virtual + '\';');
            }

            if (cmd.options.debug !== true) {
                pkg.log(code);
            }

        } else {

            if (cmd.options.headers) {
                pkg.log('TP.boot.$srcPath = \'\';');
            }

            if (cmd.options.debug !== true) {
                pkg.log(item.textContent);
            }
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
