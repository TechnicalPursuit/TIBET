/**
 * @file _cmd.js
 * @overview A root command object used for simple feature inheritance. All
 *     custom commands within the TIBET command set should inherit from this
 *     type or * from a subtype of this type.
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
var minimist = require('minimist');

//  ---
//  Type Construction
//  ---

/**
 * Command supertype. All individual commands inherit from this type.
 * @param {Object} options Command options from the outer CLI instance.
 *     Common keys include 'cli', 'debug', and 'verbose'.
 */
var Cmd = function(){};

/**
 * The context viable for this command. Default is inside.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;


//  ---
//  Instance Attributes
//  ---

/**
 * A help string for optional expanded help content.
 * @type {string}
 */
Cmd.prototype.HELP = '';


/**
 * A usage string which should _not_ begin with 'Usage: ' since that may be
 * added by the outer CLI when dumping usage for all available commands.
 * @type {string}
 */
Cmd.prototype.USAGE = '';


/**
 * The parsed arguments in minimist format.
 * @type {Object}
 */
Cmd.prototype.argv = null;


/**
 * Optional configuration data from invoking CLI instance.
 * @type {Object}
 */
Cmd.prototype.options = null;


/**
 * Command argument parsing options for minimist. The defaults handle the common
 * flags but can be overridden if the command needs to define specific ones.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = {
    boolean: ['color', 'help', 'usage', 'debug', 'stack', 'verbose'],
    string: ['app_root'],
    default: {
        color: true
    }
};

//  ---
//  Instance Methods
//  ---

/**
 * Outputs expanded help text if available, otherwise outputs usage().
 */
Cmd.prototype.help = function() {

    // Dump the usage string as a form of 'summary'. NOTE that this typically
    // outputs a newline above and below the actual usage text.
    this.usage();

    // Dump any additional HELP text.
    this.info((this.HELP || '') + '\n');
};


/**
 * Parse the arguments. By default this routine uses default parsing via
 * minimist resulting in arguments being placed in the argv attribute.
 * @param {Array.<string>} args Processed arguments from the command line.
 * @return {Object} An object in minimist argument format.
 */
Cmd.prototype.parse = function() {
    var cmd;

    this.argv = minimist(process.argv.slice(2), this.PARSE_OPTIONS) || [];

    // Minimist has a bad habit with boolean values...it will make entries for
    // them even if they're not on the command line which makes it harder for us
    // to manage defaulting the way we want. (tibet.json should be part of the
    // mix if not on the command line explicitly). So remove anything that was
    // not explicitly on the command line...
    cmd = this;
    if (this.PARSE_OPTIONS && this.PARSE_OPTIONS.boolean) {
        this.PARSE_OPTIONS.boolean.forEach(function(flag) {
            if (process.argv.indexOf('--' + flag) === -1 &&
                process.argv.indexOf('--no-' + flag) === -1) {
                delete(cmd.argv[flag]);
            }
        });
    }

    this.debug('process arguments: ' + JSON.stringify(process.argv));
    this.debug('parsed arguments: ' + JSON.stringify(this.argv));

    return this.argv;
};


/**
 * Perform the actual command processing. Typically you want to override this
 * method. The default implementation simply echoes the command arguments.
 */
Cmd.prototype.execute = function() {
    return;
};


/**
 * Parses, checks for --usage/--help, and invokes execute() as needed. This is a
 * template method you should normally leave as is. Override execute() to change
 * the core functionality for your command.
 * @param {Object.<string, object>} options Command processing options.
 */
Cmd.prototype.run = function(options) {

    this.options = options || {};

    // Create a shortcut to any config data we may have loaded from tibet.json.
    if (this.options.tibet && this.options.tibet.config) {
        this.config = this.options.tibet.config;
    } else {
        this.config = {};
    }

    // Re-parse the command line with any localized parser options.
    this.argv = this.parse();

    if (this.argv.usage) {
        return this.usage();
    }

    if (this.argv.help) {
        return this.help();
    }

    return this.execute();
};


/**
 * Dumps the receiver's usage string as a simple form of help.
 */
Cmd.prototype.usage = function() {
    this.info('\nUsage: ' + (this.USAGE || '') + '\n');
};

//  ---
//  Console logging API via invoking CLI instance.
//  ---

Cmd.prototype.log = CLI.log.bind(CLI);
Cmd.prototype.info = CLI.info.bind(CLI);
Cmd.prototype.warn = CLI.warn.bind(CLI);
Cmd.prototype.error = CLI.error.bind(CLI);

Cmd.prototype.debug = CLI.debug.bind(CLI);
Cmd.prototype.verbose = CLI.verbose.bind(CLI);
Cmd.prototype.system = CLI.system.bind(CLI);

module.exports = Cmd;

}());
