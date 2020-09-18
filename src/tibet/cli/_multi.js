//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview A common supertype for commands like tds and tws which serve as
 *     roots for multiple subcommands and their flags.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0 */
(function() {

'use strict';

var CLI,
    Cmd,
    minimist,
    path,
    sh;

CLI = require('./_cli');

//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('./_cmd');
Cmd.prototype = new Cmd.Parent();

path = require('path');
minimist = require('minimist');
sh = require('shelljs');

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
Cmd.NAME = '_multi';


//  ---
//  Type Methods
//  ---

/**
 * Initialize the command, setting up anything that might be necessary or
 * helpful before there's actually an instance (or handle to one).
 * @param {Type} cmdType The command Type. We pass this in because inheritance
 *     doesn't work (outside of TIBET ;)) and we to access the correct type.
 */
Cmd.initialize = function(cmdType) {
    Cmd.loadSubcommands(cmdType);
    return;
};

/**
 * Loads subcommand implementations for the command type passed in.
 * @param {Type} cmdType The command Type. We pass this in because inheritance
 *     doesn't work (outside of TIBET ;)) and we to access the correct type.
 */
Cmd.loadSubcommands = function(cmdType) {
    var cmdname,

        wassilent,

        fullpath,

        liblist,
        applist,
        list;

    cmdname = cmdType.NAME;

    //  Turn off ShellJS whining
    wassilent = sh.config.silent;
    sh.config.silent = true;

    fullpath = CLI.expandPath('~lib_cmd/' + cmdname);
    liblist = sh.ls(fullpath);
    liblist = liblist.map(function(file) {
        return CLI.joinPaths(fullpath, file.toString());
    });

    fullpath = CLI.expandPath('~app_cmd/' + cmdname);
    applist = sh.ls(fullpath);
    applist = applist.map(function(file) {
        return CLI.joinPaths(fullpath, file.toString());
    });

    //  NOTE we put lib first so app updates can override baseline.
    list = liblist.concat(applist);

    list.forEach(function(file) {
        var name;

        try {
            require(file)(cmdType);
        } catch (e) {
            name = path.basename(file).replace(path.extname(file), '');
            CLI.error('Error loading subcommand ' + name + ': ' + e);
        }
    });

    //  Turn back on ShellJS whining
    sh.config.silent = wassilent;
};


//  ---
//  Instance Attributes
//  ---

//  NOTE the parse options here are just for the 'tws' command itself.
//  Subcommands need to parse via their own set of options.

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend({}, Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */


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
    var args,
        subcmd;

    args = this.getArglist();

    //  NOTE argv[0] is the command name so we want [1] for any subcommand.
    subcmd = args[1];
    if (subcmd.charAt(0) === '-') {
        return this.usage();
    } else {
        return this.executeSubcommand(subcmd);
    }
};


/**
 * Dispatches a subcommand by searching for a method of the form
 * 'execute{Subcommand} to execute and dispatching to it.
 * @param {String} cmd The subcommand name.
 */
Cmd.prototype.executeSubcommand = function(cmd) {
    var name;

    name = 'execute' + cmd.charAt(0).toUpperCase() + cmd.slice(1);
    if (typeof this[name] !== 'function') {
        throw new Error('Unknown subcommand: ' + cmd);
    }

    return this[name]();
};


//  ---
//  Utilities
//  ---

/**
 * Verifies that of the list of flags provided only one was supplied on the
 * command line.
 * @param {Array.<String>} flags An array of flags which should be unique with
 *     respect to command line usage.
 * @throws InvalidFlags
 */
Cmd.prototype.onlyOne = function(flags) {
    var cmd,
        found;

    cmd = this;

    found = flags.filter(function(flag) {
        return cmd.hasArgument(flag);
    });

    if (found.length > 1) {
        throw new Error('Incompatible command options: ' + found.join(', '));
    }

    return;
};


/**
 * Dispatches to a method based on a root and optional flags. For example, when
 * invoked with 'push' and a set of flags such as ['flows', 'tasks'] this method
 * will try to find executePushFlows or executePushTasks based on the command line.
 * @param {String} root The root command to base the search on such as 'push',
 *     'list', etc.
 * @param {Array.<String>} flags The list of flags which can specialize the
 *     root to create a more fine-grained method name.
 * @param {Object} [defaults] An optional object forcing specific defaults.
 * @returns {Object} The return value of the specialized method if found.
 */
Cmd.prototype.redispatch = function(root, flags, defaults) {
    var subcmd,
        fname;

    this.reparse({
        boolean: flags.slice(0) // slice to copy since parse will modify.
    });

    //  Get the subcommand operation (which is specified via flag)
    subcmd = this.whichOne(flags);
    if (!subcmd) {
        subcmd = 'usage';
    }

    fname = this.specialize('execute', root, subcmd);
    if (this.canInvoke(fname)) {
        return this[fname]();
    }

    throw new Error('Unknown operation: ' + fname);
};


/**
 * Reparses the command line arguments using the parse options provided.
 * @param {Object} options A minimist-compatible set of parse options.
 * @returns {Array} The arglist after reparsing.
 */
Cmd.prototype.reparse = function(options) {
    var opts;

    opts = options || {};

    //  Reparse to get options parsed specifically for our subcommand.
    this.options = minimist(this.getArgv(),
        CLI.blend(opts, CLI.PARSE_OPTIONS)
    );

    //  Re-run any configuration logic to process parsed args.
    this.options = this.configure();

    return this.getArglist();
};


/**
 * Combines a root method name with a subcommand to produce a more specialized
 * method name for invocation.
 * @param {String} root The root method name such as 'executeJob'.
 * @param {String} subcmd The subcommand used to specialize the operation.
 * @returns {String} The specialized command name.
 */
Cmd.prototype.specialize = function(root, command, subcmd) {
    return root +
        command.charAt(0).toUpperCase() + command.slice(1) +
        subcmd.charAt(0).toUpperCase() + subcmd.slice(1);
};


/**
 * Returns the flag which was actually passed from a list of possible flags.
 * Note that this method will throw an exception if more than one flag is found.
 * @param {Array.<String>} flags The list of flags to check and filter.
 * @throws {Error} Incompatible command options.
 * @returns {String} The flag provided, if only one is found.
 */
Cmd.prototype.whichOne = function(flags) {
    var found,
        argv;

    argv = this.getArgv();
    found = flags.filter(function(flag) {
        return argv.indexOf('--' + flag) !== -1;
    });

    if (found.length > 1) {
        throw new Error('Incompatible command options: ' + found.join(', '));
    }

    return found[0];
};


module.exports = Cmd;

}());
