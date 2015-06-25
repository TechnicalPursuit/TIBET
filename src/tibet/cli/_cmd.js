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
 * Processes key/value pairs and adds missing ones to the argument list
 * provided. The keys are checked against the optional list of known parameters
 * to avoid redundant processing.
 */
Cmd.prototype.augmentArglist = function(arglist, options, known, prefix) {

    var list,
        opts,
        skips,
        name,
        cmd;

    list = arglist || [];
    opts = options || {};
    skips = known || [];

    cmd = this;

    // Pass along anything found in the arglist that isn't part of the official
    // list.
    Object.keys(opts).forEach(function(key) {
        var value;

        //  Ignore the _ argument from minimist parsing.
        if (key === '_') {
            return;
        }

        if (prefix) {
            name = prefix + '.' + key;
        } else {
            name = key;
        }

        //  If it's already in the arglist nothing to do.
        if (list.indexOf(name) !== -1) {
            return;
        }

        //  If it's a known property ignore it...already processed.
        if (known.indexOf(name) !== -1) {
            return;
        }

        value = opts[key];

        if (value === true) {
            list.push('--' + name);
        } else if (value === false) {
            list.push('--no-' + name);
        } else {
            if (CLI.isObject(value)) {
                //  Nested value...have to recurse.
                cmd.augmentArglist(list, value, skips, name);
            } else {
                list.push('--' + name + '=' + value);
            }
        }
    });

    return list;
};


/**
 * Performs any final processing of the argument list prior to execution. The
 * default implementation does nothing but subtypes can leverage this method
 * to ensure the command line meets their specific requirements.
 * @param {Array.<String>} arglist The argument list to finalize.
 * @returns {Array.<String>} The finalized argument list.
 */
Cmd.prototype.finalizeArglist = function(arglist) {
    return arglist;
};


/**
 * Returns an argument list that reflects the final options the command using,
 * essentially giving the most verbose form of the command line that would have
 * produced the commands configuration. This is typically used when spawning
 * commands which need to reflect the receiver's true execution settings.
 * @returns {Array.<String>}
 */
Cmd.prototype.getArglist = function() {

    var arglist,
        known,
        cmd;

    cmd = this;
    arglist = [];
    known = [];

    // Process string arguments. We need both key and value here.
    if (this.PARSE_OPTIONS && this.PARSE_OPTIONS.string) {
        this.PARSE_OPTIONS.string.forEach(function(key) {
            known.push(key);
            if (CLI.notEmpty(CLI.getcfg(key))) {
                arglist.push('--' + key, CLI.getcfg(key));
            } else if (key in cmd.PARSE_OPTIONS.default) {
                arglist.push('--' + key, cmd.PARSE_OPTIONS.default[key]);
            }
        });
    }

    // Process number arguments. We need both key and value here.
    if (this.PARSE_OPTIONS && this.PARSE_OPTIONS.number) {
        this.PARSE_OPTIONS.number.forEach(function(key) {
            known.push(key);
            if (CLI.notEmpty(CLI.getcfg(key))) {
                arglist.push('--' + key, CLI.getcfg(key));
            } else if (key in cmd.PARSE_OPTIONS.default) {
                arglist.push('--' + key, cmd.PARSE_OPTIONS.default[key]);
            }
        });
    }

    // Process boolean arguments. These are just the key with --no- if the value
    // is false.
    if (this.PARSE_OPTIONS && this.PARSE_OPTIONS.boolean) {
        this.PARSE_OPTIONS.boolean.forEach(function(key) {
            known.push(key);
            if (CLI.notEmpty(CLI.getcfg(key))) {
                if (CLI.getcfg(key)) {
                    arglist.push('--' + key);
                } else {
                    //  Booleans default to false normally so adding all the
                    //  --no- prefixing can be verbose. Only do it if the
                    //  default value was supposed to be true.
                    if (key in cmd.PARSE_OPTIONS.default) {
                        arglist.push('--no-' + key);
                    }
                }
            } else if (key in cmd.PARSE_OPTIONS.default) {
                //  If no value provided but it's supposed to default to true
                //  then we need to push the flag manually.
                arglist.push('--' + key);
            }
        });
    }

    //  Ensure any missing arguments are properly accounted for.
    return this.augmentArglist(arglist, this.options, known);
};

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
 * via minimist and places the result in the receiver's options property.
 * @returns {Object} An object in minimist argument format.
 */
Cmd.prototype.parse = function() {
    var command,
        cfg;

    //  Parse the command line (again) but with the command's specific args.
    this.options = minimist(process.argv.slice(2), this.PARSE_OPTIONS || {});

    //  Blend in any missing options provided by the CLI.PROJECT_FILE.
    command = CLI.options._[0];
    cfg = CLI.getPackage().getProjectConfig().cli;
    if (cfg && cfg[command]) {
        this.options = CLI.blend(this.options, cfg[command]);
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
 */
Cmd.prototype.run = function() {

    var code;

    // Config data can be pulled directly from the CLI.
    this.config = CLI.config;

    // Re-parse the command line with any localized parser options.
    this.options = this.parse();

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
