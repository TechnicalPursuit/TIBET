//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet echo' command. Echoes the current command line arguments
 *     to stdout. This can be useful to help debug how command arguments are
 *     processed by the TIBET CLI. The echo command is also a good template for
 *     creating your own custom commands.
 */
//  ========================================================================

/* eslint indent:0 */

(function() {

'use strict';

var CLI,
    Cmd;

CLI = require('./_cli');

//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('./_cmd');
Cmd.prototype = new Cmd.Parent();


//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.ANY;

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'echo';

//  ---
//  Instance Attributes
//  ---

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet echo [<args>]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @returns {Number|Promise} The return code produced by running the command (a
 *     non-zero indicates an Error) or a Promise that resolves when the command
 *     finishes.
 */
Cmd.prototype.execute = function() {
    if (this.options) {
        this.info('Options:');
        this.info(CLI.beautify(JSON.stringify(this.options)));
    }

    return 0;
};


module.exports = Cmd;

}());
