/**
 * @file lint.js
 * @overview The 'tibet lint' command. Checks a package/config's script files
 *     for lint. TIBET uses eslint, a configurable linter supporting custom
 *     rulesets, to perform the actual linting process.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/*eslint no-process-exit:0*/
(function() {

'use strict';

var CLI = require('./_cli');
var eslint = require('eslint');
var beautify = require('js-beautify').js_beautify;


//  ---
//  Type Construction
//  ---

var Parent = require('./package');

// NOTE we don't inherit from _cmd, but from package.
var Cmd = function(){};
Cmd.prototype = new Parent();

//  ---
//  Type Attributes
//  ---

Cmd.CONFIG = '~/.eslintrc';


//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Runs one or more lint tools on various files in a package#config.\n\n' +

'The package#config defaults to ~app_cfg/app.xml and its default\n' +
'config (usually #base). The eslint utility is used for JavaScript\n' +
'due to its focus on configurable and customizable rulesets.\n\n' +

'--stop tells the linter to stop after the first file with errors.\n\n' +

'[package-opts] refers to valid options for a TIBET Package object.\n' +
'These include --package, --config, --phase, --assets, etc.\n' +
'See help on the \'tibet package\' command for more information.\n\n' +

'[eslint-opts] refers to --cfg, --rules, and --format which allow\n' +
'you to configure eslint to meet your specific needs. The linter will\n' +
'automatically take advantage of an .eslintrc file in your project.\n\n' +

'In the future this command will also support css, html, xml, and other\n' +
'formats using appropriate linters for those mime types.\n';

/**
 * Command argument parsing options.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        boolean: ['stop', 'all', 'silent', 'nodes', 'reset'],
        string: ['lintcfg', 'rules', 'format', 'package', 'config', 'phase'],
        default: {
            nodes: true,
            silent: true
        }
    },
    Parent.prototype.PARSE_OPTIONS);


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet lint [--stop] [package-opts] [eslint-opts]';


//  ---
//  Instance Methods
//  ---

/**
 * Lints the script content of a package/config pair.
 * @param {Array.<Node>} list An array of package asset nodes.
 * @return {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executeForEach = function(list) {

    var cmd;
    var args;
    var sum;

    cmd = this;
    args = this.getLintArguments();
    sum = 0;

    try {
        list.forEach(function(item) {
            var src,
                result;

            if (cmd.options.nodes) {
                if (item.getAttribute('no-lint') === 'true') {
                    return;
                }
                src = item.getAttribute('src');
            } else {
                src = item;
            }

            if (src) {
                result = eslint.cli.execute(args.concat(src));
                sum = sum + result;
                if (result !== 0 && cmd.options.stop) {
                    throw new Error(result);
                }
            } else if (cmd.options.nodes) {
                console.log(item.textContent);
            }
        });
    } catch (e) {
        if (!cmd.options.stop) {
            this.error(e.message);
            sum += 1;
        }
    } finally {
        // Report on the total errors output etc.
        if (sum > 0) {
            this.error('Lint found ' + sum + ' errors.');
            process.exit(1);
        } else {
            this.log('0 errors.');
        }
    }
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


/**
 */
Cmd.prototype.getLintArguments = function() {

    var args;

    args = ['node', 'eslint'];

    // TODO: figure out why this throws errors in eslint...
    if (this.options.eslintrc === false) {
    //    args.push('--no-eslintrc');
        void(0);
    }

    if (this.options.lintcfg) {
        args.push('-c' + this.options.lintcfg);
    }

    if (this.options.format) {
        args.push('-f ' + this.options.format);
    }

    if (this.options.rules) {
        args.push('-r ' + this.options.rules);
    }

    if (this.options.reset) {
        args.push('--reset');
    }

    return args;
};

module.exports = Cmd;

}());
