//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview A root command object used for simple feature inheritance. All
 *     custom commands within the TIBET command set should inherit from this
 *     type or from a subtype of this type such as `package`.
 */
//  ========================================================================

/*eslint indent:0*/

(function() {

'use strict';

var CLI,
    minimist,
    beautify,
    Cmd;

CLI = require('./_cli');
minimist = require('minimist');
beautify = require('js-beautify').js_beautify;

//  ---
//  Type Construction
//  ---

/**
 * Command supertype. All individual commands inherit from this type.
 */
Cmd = function() {};


/**
 * The context viable for this command.
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
 * A reference to the CLI configuration data. primarily CLI.PROJECT_FILE data.
 * The common keys in this object are 'tibet' and 'npm' respectively.
 * @type {Object}
 */
Cmd.prototype.config = null;


/**
 * The command-line arguments as parsed by this command, combined with data
 * specific to this command from the config data in the CLI.PROJECT_FILE.
 * @type {Object}
 */
Cmd.prototype.options = null;


/**
 * Command argument parsing options for minimist. Note that boolean values
 * default to false so we need to default some to true explicitly.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = CLI.blend({}, CLI.PARSE_OPTIONS);

//  ---
//  Instance Methods
//  ---

/**
 * Returns the configuration values currently in force. Leverages the logic in a
 * TIBET Package object for the loading/processing of default TIBET parameters.
 * If no property is provided the entire set of configuration values is
 * returned.
 * @param {string} property A specific property value to check.
 * @returns {Object} The property value, or the entire configuration object.
 */
Cmd.prototype.getcfg = function(property) {
    return CLI.getcfg(property);
};


/**
 * Outputs expanded help text if available, otherwise outputs usage().
 */
Cmd.prototype.help = function() {

    // Dump the usage string as a form of 'summary'. NOTE that this typically
    // outputs a newline above and below the actual usage text.
    this.usage();

    // Dump any additional HELP text.
    this.info((this.HELP || '') + '\n' +
    'For more visit http://github.com/TechnicalPursuit/TIBET/wiki.\n');
};


/**
 * Parse the arguments and blend with default values. This routine uses parsing
 * via minimist and places the resulting arguments in the receiver's options
 * attribute. Note that the options from the CLI as well as any command-specific
 * options in the CLI.PROJECT_FILE are used in constructing the final arglist.
 * @param {Array.<string>} args Processed arguments from the command line.
 * @returns {Object} An object in minimist argument format.
 */
Cmd.prototype.parse = function(options) {
    var command,
        cmd;

    // Note we use the command's own version of PARSE_OPTIONS here.
    this.options = minimist(process.argv.slice(2), this.PARSE_OPTIONS || {});

    // Now overlay any options provided as input.
    this.options = CLI.blend(this.options, options);

    // Unfortunately our approach to defaulting means we have to apply CLI
    // defaults _after_ we blend any CLI.NPM_FILE values. So we have to do a
    // shuffle here to remove them, blend in the package file stuff, then add
    // anything missing back in.

    cmd = this;

    // Booleans get default values of false unless otherwise set to true.
    if (this.PARSE_OPTIONS && this.PARSE_OPTIONS.boolean) {
        this.PARSE_OPTIONS.boolean.forEach(function(flag) {
            if (process.argv.indexOf('--' + flag) === -1 &&
                process.argv.indexOf('--no-' + flag) === -1) {
                delete cmd.options[flag];
            }
        });
    }

    // Strings, numbers, etc. with explicit defaults also need to be handled.
    if (this.PARSE_OPTIONS && this.PARSE_OPTIONS.default) {
        Object.keys(this.PARSE_OPTIONS.default).forEach(function(flag) {
            if (process.argv.indexOf('--' + flag) === -1 &&
                process.argv.indexOf('--no-' + flag) === -1) {
                delete cmd.options[flag];
            }
        });
    }

    // Now overlay any options missing but provided by the CLI.PROJECT_FILE.
    command = CLI.options._[0];
    if (CLI.config.tibet.cli && CLI.config.tibet.cli[command]) {
        this.options = CLI.blend(this.options, CLI.config.tibet.cli[command]);
    }

    // Now we have to reverse that process...sigh...
    if (this.PARSE_OPTIONS && this.PARSE_OPTIONS.default) {
        this.options = CLI.blend(this.options, this.PARSE_OPTIONS.default);
    }

    this.debug('process.argv: ' + JSON.stringify(process.argv));
    this.debug('minimist.argv: ' + JSON.stringify(this.options));

    return this.options;
};


/**
 * Perform the actual command processing. Typically you want to override this.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {
    return 0;
};


/**
 * Verify any command prerequisites are in place (such as necessary binaries
 * etc). If the execution should stop this method will return a non-zero result
 * code.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.prereqs = function() {
    return 0;
};


/**
 * Common synchronous prompt for user input.
 */
Cmd.prototype.prompt = CLI.prompt;


/**
 * Parses, checks for --usage/--help, and invokes execute() as needed. This is a
 * template method you should normally leave as is. Override execute() to change
 * the core functionality for your command.
 * @param {Object.<string, object>} options Command processing options.
 */
Cmd.prototype.run = function(options) {

    var code;

    // Config data can be pulled directly from the CLI.
    this.config = CLI.config;

    // Re-parse the command line with any localized parser options.
    this.options = this.parse(options);

    this.debug(beautify(JSON.stringify(this.config.tibet)), true);

    if (this.options.usage) {
        return this.usage();
    }

    if (this.options.help) {
        return this.help();
    }

    code = this.prereqs();
    if (code !== 0) {
        return code;
    }

    this.execute();
};


/**
 * A synchronous call to shelljs's exec utility which standardizes silent flag
 * and error handling to simplify usage for command subtypes.
 * @param {String} cmd The command string to run.
 * @returns {Object} A shelljs return value containing a 'code' and 'output'.
 */
Cmd.prototype.shexec = function(cmd) {

    var result,
        sh;

    sh = require('shelljs');

    result = sh.exec(cmd, {
        silent: CLI.options.silent !== true
    });

    if (result.code !== 0) {
        throw new Error(result.output);
    }

    return result;
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

Cmd.prototype.success = CLI.success.bind(CLI);

Cmd.prototype.lpad = CLI.lpad.bind(CLI);
Cmd.prototype.rpad = CLI.rpad.bind(CLI);

module.exports = Cmd;

}());
