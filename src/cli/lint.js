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

(function() {

'use strict';

var eslint = require('eslint');


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
'Lints files in a package#config. The package#config defaults to\n' +
'~/TIBET-INF/app.xml and its default config. The eslint utility is\n' +
'used for JavaScript due to its configurable/customizable rulesets.\n' +
'The csslint and jsonlint utilities are also leveraged as needed.\n\n' +

'--stop tells the linter to stop after the first file with errors.\n\n' +
'[package-opts] refers to valid options for a TIBET Package object.\n' +
'These include --package, --config, --phase, --assets, etc.\n' +
'See help on the \'tibet package\' command for more information.\n\n' +

'[eslint-opts] refers to --cfg, --rules, and --format which allow\n' +
'you to configure eslint to meet your specific needs. The linter will\n' +
'automatically take advantage of an .eslintrc file in your project.\n';

/**
 * Command argument parsing options.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = {
    boolean: [
        'color', 'help', 'usage', 'debug', 'stack', 'verbose', 'stop',
        'all', 'silent', 'nodes', 'reset'
    ],
    string: ['app_root', 'lintcfg', 'rules', 'format', 'package', 'config',
        'phase'],
    default: {
        color: true,
        silent: true
    }
};


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

            if (cmd.argv.nodes) {
                src = item.getAttribute('src');
            } else {
                src = item;
            }

            if (src) {
                result = eslint.cli.execute(args.concat(src));
                sum = sum + result;
                if (result !== 0 && cmd.argv.stop) {
                    throw new Error(result);
                }
            } else if (cmd.argv.nodes) {
                console.log(item.textContent);
            }
        });
    } catch (e) {
        // Don't really care about the error, it's a way to exit the loop while
        // retaining some control.
        void(0);
    } finally {
        // Report on the total errors output etc.
        if (sum > 0) {
            this.error('Lint found ' + sum + ' errors.');
        } else {
            this.log('0 errors.');
        }
    }
};


/**
 */
Cmd.prototype.getLintArguments = function() {

    var args;

    args = ['node', 'eslint'];

    // TODO: figure out why this throws errors in eslint...
    if (this.argv.eslintrc === false) {
    //    args.push('--no-eslintrc');
        void(0);
    }

    if (this.argv.lintcfg) {
        args.push('-c' + this.argv.lintcfg);
    }

    if (this.argv.format) {
        args.push('-f ' + this.argv.format);
    }

    if (this.argv.rules) {
        args.push('-r ' + this.argv.rules);
    }

    if (this.argv.reset) {
        args.push('--reset');
    }

    return args;
};

module.exports = Cmd;

}());
