/**
 * @overview The 'tibet version' command. Dumps the current version of TIBET.
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
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.BOTH;


/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
    'Displays the current version of TIBET.';


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet version';


//  ---
//  Instance Methods
//  ---

/**
 */
Cmd.prototype.execute = function() {
    try {
        this.info(this.options.npm.dependencies.tibet.version);
    } catch (e) {
        this.error('Unable to determine TIBET version.');
    }
};

module.exports = Cmd;

}());
