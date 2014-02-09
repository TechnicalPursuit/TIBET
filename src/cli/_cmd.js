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

//  ---
//  Configure command type.
//  ---

var Cmd = function(){};


//  ---
//  Console logging API via invoking CLI instance.
//  ---

Cmd.prototype.debug = function(msg) {
    return this.options.cli.debug(msg);
};

Cmd.prototype.error = function(msg) {
    return this.options.cli.error(msg);
};

Cmd.prototype.info = function(msg) {
    return this.options.cli.info(msg);
};

Cmd.prototype.log = function(msg) {
    return this.options.cli.log(msg);
};

Cmd.prototype.verbose = function(msg) {
    return this.options.cli.verbose(msg);
};

Cmd.prototype.warn = function(msg) {
    return this.options.cli.warn(msg);
};

Cmd.prototype.raw = function(msg) {
    return this.options.cli.raw(msg);
};


//  ---
//  Instance Attributes
//  ---

/**
 * The set of viable "execution contexts" for commands. Both implies a command
 * can be run either inside or outside of a TIBET project context. The others
 * should be self-evident.
 */
Cmd.prototype.CONTEXTS = {
    BOTH: 'both',
    INSIDE: 'inside',
    OUTSIDE: 'outside'
};


/**
 * The context viable for this command. Default is both.
 * @type {Cmd.CONTEXTS}
 */
Cmd.prototype.CONTEXT = Cmd.prototype.CONTEXTS.BOTH;


/**
 * The default project file for TIBET projects. Existence of this file in a
 * directory is used by TIBET's command line to signify that we're inside a
 * TIBET project.
 * @type {string}
 */
Cmd.prototype.PROJECT_FILE = 'tibet.json';


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
 * Returns true if the current context is appropriate for the command to run.
 * @return {Boolean}
 */
Cmd.prototype.canRun = function() {

    if (this.inProject() && (this.CONTEXT === this.CONTEXTS.OUTSIDE)) {
        return false;
    }

    return true;
};


/**
 * Outputs expanded help if available, otherwise outputs usage().
 */
Cmd.prototype.help = function() {
    return this.usage();
};


/**
 * Returns true if the command is currently being invoked from within a project
 * directory, false if it's being run outside of one. Some commands like 'start'
 * operate differently when they are invoked outside vs. inside of a project
 * directory. Some commands are only valid outside. Some are only valid inside.
 * @return {Boolean} True if the command was run inside a TIBET project
 *     directory.
 */
Cmd.prototype.inProject = function() {

    var path;       // The path utility module.
    var sh;         // The shelljs module. Used for file existence check.

    var cwd;        // Where are we being run?
    var file;       // What file are we looking for?

    cwd = process.cwd();
    file = this.PROJECT_FILE;
    path = require('path');
    sh = require('shelljs');

    // Walk the directory path from cwd "up" checking for the signifying file
    // which tells us we're in a TIBET project.
    while (cwd.length > 0) {
        if (sh.test('-f', path.join(cwd, file))) {
            this.options.app_root = cwd;
            return true;
        }
        cwd = cwd.slice(0, cwd.lastIndexOf(path.sep));
    }

    return false;
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

    if (options) {
        this.options = options;
    }

    if (!this.canRun()) {
        this.warn('Command must be run ' + this.CONTEXT +
            ' a TIBET project.');
        process.exit(1);
    }

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
