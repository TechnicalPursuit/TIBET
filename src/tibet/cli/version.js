//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet version' command. Dumps the current version of TIBET.
 */
//  ========================================================================

(function() {

'use strict';

var CLI,
    Parent,
    Cmd;


CLI = require('./_cli');


//  ---
//  Type Construction
//  ---

Parent = require('./_cmd');

Cmd = function() {};
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
'Displays the current version of TIBET. Also available as the\n' +
'--version flag on the \'tibet\' command (tibet --version).\n';


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet version';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @return {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var msg;

// TODO: output both app and lib when possible, and prefix with name.

    msg = 'Unable to determine TIBET version.';
    try {
        this.info(CLI.getcfg('npm.version') || msg);
    } catch (e) {
        this.error(msg);
    }
};


module.exports = Cmd;

}());
