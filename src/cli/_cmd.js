/**
 * @overview A root command object used for simple feature inheritance.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

var CLI = require('./_cli');

/**
 * Command supertype. All individual commands inherit from this type.
 * @param {Object} options Command options from the outer CLI instance.
 *     Common keys include 'cli', 'debug', and 'verbose'.
 */
var Cmd = function(){};


/**
 * The context viable for this command. Default is both.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.BOTH;


//  ---
//  Console logging API via invoking CLI instance.
//  ---

Cmd.prototype.log = CLI.log;
Cmd.prototype.info = CLI.info;
Cmd.prototype.warn = CLI.warn;
Cmd.prototype.error = CLI.error;

Cmd.prototype.debug = CLI.debug;
Cmd.prototype.verbose = CLI.verbose;
Cmd.prototype.raw = CLI.raw;


//  ---
//  Instance Attributes
//  ---

/**
 * A usage string which should _not_ begin with 'Usage: ' since that may be
 * added by the outer CLI when dumping usage for all available commands.
 * @type {string}
 */
Cmd.prototype.USAGE = '';


/**
 * The parsed arguments in node-optimist format.
 * @type {Object}
 */
Cmd.prototype.argv = {};


/**
 * Optional configuration data from invoking CLI instance.
 * @type {Object}
 */
Cmd.prototype.options = {};


//  ---
//  Instance Methods
//  ---

/**
 * Outputs expanded help if available, otherwise outputs usage().
 */
Cmd.prototype.help = function() {
    return this.usage();
};


/**
 * Parse the arguments. By default this routine uses default parsing via
 * node-optimist resulting in arguments being placed in the argv attribute.
 * @param {Array.<string>} args Processed arguments from the command line.
 * @return {Object} An object in node-optimist argument format.
 */
Cmd.prototype.parse = function(args) {
    this.argv = require('optimist').parse(args);
    return this.argv;
};


/**
 * Perform the actual command processing. Typically you want to override this
 * method. The default implementation simply echoes the command arguments.
 */
Cmd.prototype.process = function() {
    if (this.argv) {
        this.log(JSON.stringify(this.argv));
    }
};


/**
 * Parses, checks for --usage/--help, and invokes process() as needed. This is a
 * template method you should normally leave as is. Override process() to change
 * the core functionality for your command.
 * @param {Array.<string>} args Processed arguments from the command line.
 */
Cmd.prototype.run = function(args, options) {

    this.options = options || {};

    this.parse(args);
    if (this.argv.help) {
        return this.help();
    }

    if (this.argv.usage) {
        return this.usage();
    }

    return this.process();
};


/**
 * Dumps the receiver's usage string as a simple form of help.
 */
Cmd.prototype.usage = function() {
    this.info('Usage: ' + this.USAGE);
};


//  ---
//  Export
//  ---

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Cmd;
    }
    exports.Cmd = Cmd;
} else {
    root.Cmd = Cmd;
}

}(this));
