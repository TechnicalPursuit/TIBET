//  ========================================================================
/**
 * @overview The 'tibet echo' command. Echoes the current command line arguments
 *     to stdout. This can be useful to help debug how command arguments are
 *     processed by the TIBET CLI. The echo command is also a good template for
 *     creating your own custom commands.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */

(function() {

'use strict';

var CLI = require('./_cli');
var beautify = require('js-beautify').js_beautify;


//  ---
//  Type Construction
//  ---

var Parent = require('./_cmd');

var Cmd = function(){};
Cmd.prototype = new Parent();


//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.ANY;


//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Echoes the command line arguments to stdout.\n\n' +

'This command can be used as a template for your own custom commands or\n' +
'to help view how arguments are being parsed.\n';

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet echo [args]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @return {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {
    if (this.options) {
        this.info('Options:');
        this.info(beautify(JSON.stringify(this.options)));
    }
};


module.exports = Cmd;

}());
