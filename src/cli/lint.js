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

;(function() {

var CLI = require('./_cli');
var path = require('path');


//  ---
//  Type Construction
//  ---

var parent = require('./package');

// NOTE we don't inherit from _cmd, but from package.
var Cmd = function(){};
Cmd.prototype = new parent();


//  ---
//  Type Attributes
//  ---

Cmd.CONFIG = '~/.eslintrc'

//  ---
//  Instance Attributes
//  ---

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet lint [package options] [--stop] ' +
    '[-lintcfg {file}] [--rules {dir}] [--format {name}] ' +
    '[--eslintrc] [--reset]';


//  ---
//  Instance Methods
//  ---

/**
 * Lints the script content of a package/config pair.
 * @param {Array.<Node>} list An array of package asset nodes.
 */
Cmd.prototype.executeForEach = function(list) {

    var cmd,
        eslint,
        args;

    cmd = this;

    eslint = require('eslint');
    args = this.getLintArguments();

    list.forEach(function(node) {
        var src = node.getAttribute('src');
        if (src) {
            result = eslint.cli.execute(args.concat(src));
            if (result !== 0 && cmd.argv.stop) {
                process.exit(result);
            }
        } else {
            // TODO: lint raw content
            console.log(node.textContent);
        }
    });

    process.exit(0);
};


/**
 */
Cmd.prototype.getLintArguments = function() {

    var args;

    args = ['node', 'eslint'];

    console.log(this.argv);

    // TODO: figure out why this throws errors in eslint...
    if (this.argv.eslintrc === false) {
    //    args.push('--no-eslintrc');
    }

    if (this.argv.lintcfg) {
        args.push('-c' + this.argv.lintcfg);
    }

    if (this.argv.format) {
        args.push('-f ' + this.argv.format);
    }

    if (this.argv.reset) {
        args.push('--reset');
    }

    this.debug('lint args: ' + args);
    return args;
};

module.exports = Cmd;

}());
