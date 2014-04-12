/**
 * @overview The 'tibet echo' command. A simple command usable as a template for
 *     custom commands. Echo's the current command line arguments and options.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

;(function() {

var CLI = require('./_cli');

//  ---
//  Type Construction
//  ---

var parent = require('./_cmd');

var Cmd = function(){};
Cmd.prototype = new parent();


//  ---
//  Instance Attributes
//  ---

/**
 * The command execution context. Clone can only be done outside of a project.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.BOTH;


/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
    'Echoes the command line arguments and configuration options.';


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet echo [args]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing. Typically you want to override this
 * method. The default implementation simply echoes the command arguments.
 */
Cmd.prototype.execute = function() {
    if (this.argv) {
        this.log(JSON.stringify(this.argv));
    }

    if (CLI.inProject()) {
        this.log(JSON.stringify(this.options));
    }
};

module.exports = Cmd;

}());
