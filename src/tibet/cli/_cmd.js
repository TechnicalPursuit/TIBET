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

/* eslint indent:0, consistent-this:0 */

(function() {

'use strict';

var CLI,
    minimist,
    Cmd;

CLI = require('./_cli');
minimist = require('minimist');

//  ---
//  Type Construction
//  ---

/**
 * Command supertype. All individual commands inherit from this type.
 */
Cmd = function() {
    //  empty
};


/**
 * The context viable for this command.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;


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

    return (opts._ || []).concat(list);
};


/**
 * Returns true if the receiver can invoke the named method.
 * @param {String} aMethodName The name of the method to check.
 * @returns {Boolean} True if the method is supported.
 */
Cmd.prototype.canInvoke = function(aMethodName) {
    return typeof this[aMethodName] === 'function';
};


/**
 * Check arguments and configure default values prior to running prereqs.
 * @returns {Object} An options object usable by the command.
 */
Cmd.prototype.configure = function() {
    return this.options;
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
        cmd,
        value;

    cmd = this;
    arglist = [];
    known = [];

    // Process string arguments. We need both key and value here.
    if (this.PARSE_OPTIONS && this.PARSE_OPTIONS.string) {
        this.PARSE_OPTIONS.string.forEach(function(key) {
            known.push(key);
            if (CLI.notEmpty(cmd.getArgument(key))) {
                arglist.push('--' + key, cmd.getArgument(key));
            }
        });
    }

    // Process number arguments. We need both key and value here.
    if (this.PARSE_OPTIONS && this.PARSE_OPTIONS.number) {
        this.PARSE_OPTIONS.number.forEach(function(key) {
            known.push(key);
            if (CLI.notEmpty(cmd.getArgument(key))) {
                arglist.push('--' + key, cmd.getArgument(key));
            }
        });
    }

    // Process boolean arguments. These are just the key with --no- if the value
    // is false.
    if (this.PARSE_OPTIONS && this.PARSE_OPTIONS.boolean) {
        this.PARSE_OPTIONS.boolean.forEach(function(key) {
            known.push(key);
            value = cmd.getArgument(key);
            if (CLI.isValid(value)) {
                if (value === true) {
                    arglist.push('--' + key);
                } else {
                    //  Booleans default to false normally so adding all the
                    //  --no- prefixing can be verbose. Only do it if the
                    //  default value was supposed to be true.
                    if (key in cmd.PARSE_OPTIONS.default) {
                        arglist.push('--no-' + key);
                    }
                }
            }
        });
    }

    //  Ensure any missing arguments are properly accounted for.
    return this.augmentArglist(arglist, this.options, known);
};


/**
 * Returns the value for a particular argument. This is taken from the parsed
 * values of the command line.
 * @param {String|Number} name If a string this should be a named argument or an
 *     string of the form 'argN' such as arg0. You can also simply pass a number
 *     to acquire that numbered argument.
 * @returns {Array.<String>} The argv list minus executable/command.
 */
Cmd.prototype.getArgument = function(name) {
    var value,
        parts,
        part,
        obj;

    if (this.options.hasOwnProperty(name)) {
        return this.options[name];
    }

    //  For dotted properties we have to try to iterate.
    if (/\./.test(name)) {
        parts = name.split('.');
        obj = this.options;
        part = parts.shift();
        try {
            while (obj && part) {
                obj = obj[part];
                part = parts.shift();
            }
            if (CLI.isValid(obj)) {
                return obj;
            }
        } catch (e) {
            void 0;
        }

        //  Fallback for dotted argument names is to grab config value.
        if (CLI.isValid(value = CLI.getcfg(name))) {
            return value;
        }
    }

    //  For properties which are not explicitly found we can look in the parse
    //  options for a default value.
    if (this.PARSE_OPTIONS.default.hasOwnProperty(name)) {
        return this.PARSE_OPTIONS.default[name];
    }

    //  If it's a numbered argument reference we can look in the '_' array from
    //  minimist's argv processing.
    if (/^arg(\d+)$/.test(name)) {
        return this.options._.slice(1)[name.slice(3)];
    }

    //  Number? Just return the numbered argument if possible.
    if (typeof name === 'number') {
        return this.options._.slice(1)[name];
    }

    return;
};


/**
 * Returns an array of actual arguments from the command line. This is useful
 * for comparing with the getArglist results or capturing specific arguments for
 * use in a child process. Note that argv[0] is the command name.
 * @returns {Array.<String>} The argv list.
 */
Cmd.prototype.getArgv = function() {
    var argv;

    argv = process.argv;
    argv = argv.slice(2);

    return argv;
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
 * Returns a list of options/flags/parameters suitable for command completion.
 * @returns {Array.<string>} The list of options for this command.
 */
Cmd.prototype.getCompletionOptions = function() {
    var options,
        list;

    options = this.PARSE_OPTIONS;

    list = [];
    ['boolean', 'string', 'number'].forEach(function(key) {
        var names;

        names = options[key];
        if (CLI.isValid(names)) {
            list = list.concat(names);
        }
    });

    list = list.map(function(option) {
        return '--' + option;
    });

    return list;
};


/**
 * Returns the 'type' responsible for the receiver. This will be the 'Cmd'
 * object relative to the current instance.
 * @returns {Function} The receiver's type object.
 */
Cmd.prototype.getType = function() {
    return this.constructor;
};


/**
 * Tests whether the explicit command line arguments included the flag (or
 * inverse for boolean flags). This check is used to determine what the user
 * actually typed vs. what minimist may have parsed and defaulted.
 * @param {String|Number} name The name of the flag or the argument number to
 *     verify.
 * @returns {Boolean} True if the argument was explicitly provided.
 */
Cmd.prototype.hasArgument = function(name) {
    var argv;

    argv = this.getArgv();

    if (typeof name === 'number') {
        //  NOTE We don't consider 'tibet' and command when indexing here.
        return CLI.isValid(argv.slice(2)[name]);
    }

    return argv.indexOf('--' + name) !== -1 || argv.indexOf('--no-' + name) !== -1;
};


/**
 * Parse the arguments and blend with default values. This routine uses parsing
 * via minimist and places the result in the receiver's options property.
 * @param {Array} [argv] An optional arguments array to parse instead of the
 *     default process.argv value.
 * @returns {Object} An object in minimist argument format.
 */
Cmd.prototype.parse = function(argv) {
    var command,
        cfg;

    //  Parse the command line (again) but with the command's specific args.
    this.options = minimist(argv || process.argv.slice(2),
        this.PARSE_OPTIONS || {});

    //  Blend in any missing options provided by the CLI.PROJECT_FILE.
    command = CLI.options._[0];
    cfg = CLI.getPackage().getProjectConfig().cli;
    if (cfg && cfg[command]) {
        this.options = CLI.blend(this.options, cfg[command]);
    }

    this.trace('argv: ' + JSON.stringify(argv || process.argv));
    this.trace('minimist.argv: ' + JSON.stringify(this.options));

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
 * @param {Array} [argv] An optional arguments array to be used for parse().
 */
Cmd.prototype.run = function(argv) {

    var code;

    // Config data can be pulled directly from the CLI.
    this.config = CLI.config;

    // Re-parse the command line with any localized parser options.
    this.options = this.parse(argv);

    this.trace(CLI.beautify(JSON.stringify(this.config.tibet)));

    //  Adjust any parameters after parsing.
    this.options = this.configure();

    if (this.options.usage) {
        return this.usage();
    }

    code = this.prereqs();
    if (code !== 0) {
        return code;
    }

    return this.execute();
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
 * @param {String} msg An alternative message to override this.USAGE value.
 */
Cmd.prototype.usage = function(msg) {
    this.info('\nUsage: ' + (msg || this.USAGE || '') + '\n');

    return 0;
};


//  ---
//  Console logging API via invoking CLI instance.
//  ---

Cmd.prototype.trace = CLI.curry(CLI.$log, 'trace').bind(CLI);
Cmd.prototype.debug = CLI.curry(CLI.$log, 'debug').bind(CLI);
Cmd.prototype.info = CLI.curry(CLI.$log, 'info').bind(CLI);
Cmd.prototype.warn = CLI.curry(CLI.$log, 'warn').bind(CLI);
Cmd.prototype.error = CLI.curry(CLI.$log, 'error').bind(CLI);
Cmd.prototype.fatal = CLI.curry(CLI.$log, 'fatal').bind(CLI);
Cmd.prototype.system = CLI.curry(CLI.$log, 'system').bind(CLI);
Cmd.prototype.log = CLI.curry(CLI.$log, 'log').bind(CLI);
Cmd.prototype.verbose = CLI.curry(CLI.$log, 'verbose').bind(CLI);

Cmd.prototype.colorize = CLI.colorize.bind(CLI);

Cmd.prototype.lpad = CLI.lpad.bind(CLI);
Cmd.prototype.rpad = CLI.rpad.bind(CLI);

module.exports = Cmd;

}());
