/**
 * @file _cli.js
 * @overview The TIBET command-line harness. Logic here is focused on command
 *     identification, initial argument processing, command file loading, and
 *     common utilities for commands. If a command isn't found the CLI will
 *     check for a TIBET-style makefile.js target followed by a grunt or gulp
 *     task to perform the work.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-Approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/*
 * STANDARD OPTIONS:
 *      app_root        // Where is the application root? Normally computed.
 *      lib_root        // Where is the library root? Normally computed.
 *
 *      color           // Display colored output. Default is true.
 *
 *      debug           // Display debug-level messages. Default is false.
 *      stack           // Dump stack with error messages? Default is false.
 *      verbose         // Display verbose-level messages. Default is false.
 *
 *      help            // Display help on the command. Default is false.
 *      usage           // Display usage of the command. Default is false.
 */

/* eslint camelcase:0, consistent-return:0, no-process-exit:0, no-cond-assign:0,
   no-unused-vars:0 */
(function() {

'use strict';

/*
 * Required modules we'll bring in once.
 */
var path = require('path');
var sh = require('shelljs');
var chalk = require('chalk');
var minimist = require('minimist');

/**
 * The TIBET Package object used for path resolution and package-related asset
 * listing support.
 * @type {Package}
 */
var Package;


/*
 * Color theme:
 *
 *  log: 'grey',
 *  info: 'white',
 *  warn: 'yellow',
 *  error: 'red',
 *  debug: 'magenta',
 *  verbose: 'cyan'
 *  system: 'green'
 */


//  ---
//  Object Construction
//  ---

/**
 * The Command Line object. This object is fairly simply. It parses a command
 * line to determine if there's a viable command name present. If the command
 * name can be identified it tries to load a file with that name from the local
 * directory to process the command. If the command cannot be found an attempt
 * is made to invoke a task of that name using grunt or gulp as a fallback tool.
 * @type {Object}
 */
var CLI = {};


//  ---
//  Object Attributes
//  ---

/**
 * The max number of characters per line in the item lists for commands like
 * `help` and `make`.
 * @type {number}
 */
CLI.CHARS_PER_LINE = 50;


/**
 * The set of viable execution contexts for commands. `BOTH` implies a command
 * can be run either inside or outside of a TIBET project context. The others
 * should be self-evident.
 * @type {Object.<string,string>}
 */
CLI.CONTEXTS = {
    BOTH: 'both',
    INSIDE: 'inside',
    OUTSIDE: 'outside'
};


/**
 * Grunt fallback requires that we find this file to be sure we're in a
 * grunt-enabled project. Also, grunt's executable must be installed (which
 * TIBET does NOT do by default).
 * @type {string}
 */
CLI.GRUNT_FILE = 'gruntfile.js';


/**
 * Gulp fallback requires that we find this file to be sure we're in a
 * gulp-enabled project. Also, gulp's executable must be installed (which TIBET
 * does NOT do by default).
 * @type {string}
 */
CLI.GULP_FILE = 'gulpfile.js';


/**
 * The default `make` file for TIBET projects. Functions exported from this file
 * are potential fallbacks for cli commands.
 * @type {string}
 */
CLI.MAKE_FILE = 'makefile.js';


/**
 * The name of the npm package file.
 * @type {string}
 */
CLI.PACKAGE_FILE = 'package.json';


/**
 * Command argument parsing options for minimist. The defaults handle the common
 * flags but can be overridden if the command needs to define specific ones.
 * @type {Object}
 */
CLI.PARSE_OPTIONS = {
    boolean: ['color', 'help', 'usage', 'debug', 'stack', 'verbose'],
    string: ['app_root', 'lib_root'],
    default: {
        color: true
    }
};


/**
 * The default project file for TIBET projects. Existence of this file in a
 * directory is used by TIBET's command line to signify that we're inside a
 * TIBET project.
 * @type {string}
 */
CLI.PROJECT_FILE = 'tibet.json';


/**
 * Optional configuration data typically passed into run() via tibet 'binary'.
 * @type {Object}
 */
CLI.config = {};


/**
 * A reference to the current project's associated TIBET make targets. This
 * will only exist inProject where the project utilizes TIBET's ultra-light
 * variant on shelljs/make.
 * @type {Object}
 */
CLI.make_targets = null;


/**
 * Command options, typically populated by parameters found in process.argv.
 * @type {Object}
 */
CLI.options = {};


/**
 * The package instance used for CLI-level package processing. Considered
 * internal since it has specific configuration options which may not be
 * suitable for use by individual commands.
 * @type {Package}
 */
CLI._package = null;


//  ---
//  Common Logging
//  ---

/*
 * Methods here provide simple coloring to match the level of the log message.
 */

CLI.log = function(msg) {
    if (this.isFalse(this.options.color)) {
        return console.log(msg);
    }
    console.log(chalk.grey(msg));
};

CLI.info = function(msg) {
    if (this.isFalse(this.options.color)) {
        return console.info(msg);
    }
    console.info(chalk.white(msg));
};

CLI.warn = function(msg) {
    if (this.isFalse(this.options.color)) {
        return console.warn(msg);
    }
    console.warn(chalk.yellow(msg));
};

CLI.error = function(msg) {
    if (this.isFalse(this.options.color)) {
        return console.error(msg);
    }
    console.error(chalk.red(msg));
};

CLI.debug = function(msg) {
    if (!this.isTrue(this.options.debug)) {
        return;
    }

    if (this.isFalse(this.options.color)) {
        return console.log(msg);
    }
    console.log(chalk.magenta(msg));
};

CLI.verbose = function(msg) {
    if (!this.isTrue(this.options.verbose)) {
        return;
    }

    if (this.isFalse(this.options.color)) {
        return console.log(msg);
    }
    console.log(chalk.cyan(msg));
};

CLI.system = function(msg) {
    if (this.isFalse(this.options.color)) {
        return console.info(msg);
    }
    console.info(chalk.green(msg));
};


//  ---
//  Value checks
//  ---

CLI.isEmpty = function(aReference) {
    return aReference === null || aReference === undefined ||
        aReference.length === 0;
};

CLI.isFalse = function(aReference) {
    return aReference === false;
};

/**
 * Returns true if the object provided is an 'Object' as opposed to a string,
 * number, boolean, RegExp, Array, etc. In essense a check for whether it's a
 * hash of keys.
 * @param {Object} obj The object to test.
 * @return {Boolean} True if the object is an Object.
 */
CLI.isObject = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
};

CLI.isTrue = function(aReference) {
    return aReference === true;
};

CLI.isValid = function(aReference) {
    return aReference !== null && aReference !== undefined;
};

CLI.notEmpty = function(aReference) {
    return aReference !== null && aReference !== undefined &&
        aReference.length !== 0;
};

CLI.notValid = function(aReference) {
    return aReference === null || aReference === undefined;
};


//  ---
//  Utilities
//  ---

/**
 * A useful variation on extend from other libs sufficient for parameter block
 * copies. The objects passed are expected to be simple JavaScript objects. No
 * checking is done to support more complex cases. Slots in the target are only
 * overwritten if they don't already exist. Only slots owned by the source will
 * be copied. Arrays are treated with some limited deep copy semantics as well.
 * @param {Object} target The object which will potentially be modified.
 * @param {Object} source The object which provides new property values.
 */
CLI.blend = function (target, source) {

    if (this.notValid(source)) {
        return target;
    }

    if (Array.isArray(target)) {
        if (!Array.isArray(source)) {
            this.handleError(new Error('Incompatible Types'),
                'blending', 'blend');
            process.exit(1);
        }

        // Both arrays. Blend as best we can.
        source.forEach(function(item, index) {
            var value = CLI.blend(target[index], item);
            if (target[index] !== value) {
                target[index] = value;
            }
        });

        return target;
    }

    if (this.isValid(target)) {
        if (!this.isObject(target)) {
            return target;
        }

        if (!this.isObject(source)) {
            return target;
        }
    } else {
        // Target not valid, source should overlay.
        return source;
    }

    Object.keys(source).forEach(function(key) {
        if (key in target) {
            if (CLI.isObject(target[key])) {
                CLI.blend(target[key], source[key]);
            } else if (Array.isArray(target[key])) {
                CLI.blend(target[key], source[key]);
            }
            return;
        }

        if (Array.isArray(source[key])) {
            // Copy array/object slots deeply as needed.
            target[key] = CLI.blend([], source[key]);
        } else if (CLI.isObject(source[key])) {
            // Deeply copy other non-primitive objects.
            target[key] = CLI.blend({}, source[key]);
        } else {
            target[key] = source[key];
        }
    });

    return target;
};


/**
 * Returns true if the current context is appropriate for the command to run.
 * The primary response here is based on "context" in that some commands are
 * only useful within a project, some must be outside a project, and some can be
 * run from any location.
 * @param {Object} CmdType The command type to check.
 * @return {Boolean} True if the command is runnable.
 */
CLI.canRun = function(CmdType) {

    if (this.inProject(CmdType)) {
        return CmdType.CONTEXT !== this.CONTEXTS.OUTSIDE;
    } else {
        return CmdType.CONTEXT !== this.CONTEXTS.INSIDE;
    }
};


/**
 * Expands a TIBET virtual path to its equivalent non-virtual path.
 * @param {String} aPath The path to be expanded.
 * @return {String} The fully-expanded path value.
 */
CLI.expandPath = function(aPath) {

    this.initPackage();

    return this._package.expandPath(aPath);
};


/**
 * Returns the application root directory, the path where the PROJECT_FILE is
 * found. This path is then used by many commands as a "root" for relative path
 * computations.
 * @return {string} The application root directory.
 */
CLI.getAppRoot = function() {

    var cwd;        // Where are we being run?
    var file;       // What file are we looking for?

    if (this.config.app_root) {
        return this.config.app_root;
    }

    cwd = process.cwd();
    file = this.PROJECT_FILE;

    // Walk the directory path from cwd "up" checking for the signifying file
    // which tells us we're in a TIBET project.
    while (cwd.length > 0) {
        if (sh.test('-f', path.join(cwd, file))) {
            this.config.app_root = cwd;
            break;
        }
        cwd = cwd.slice(0, cwd.lastIndexOf(path.sep));
    }

    return this.config.app_root;
};


/**
 * Returns the configuration values currently in force. Leverages the logic in a
 * TIBET Package object for the loading/processing of default TIBET parameters.
 * If no property is provided the entire set of configuration values is
 * returned.
 * @param {string} property A specific property value to check.
 * @return {Object} The property value, or the entire configuration object.
 */
CLI.getcfg = function(property) {
    this.initPackage();

    return this._package.getcfg(property);
};


/**
 * Searches a set of paths including ~app_cmd and ~lib_cmd for an implementation
 * file for the named command.
 * @param {string} command The command to find, such as 'start'.
 * @return {?string} The path to the command, if found.
 */
CLI.getCommandPath = function(command) {

    var roots;      // The directory roots we'll search.
    var i;
    var len;
    var base;
    var file;

    // First check is for "built-in" commands. If it's one of those we'll use
    // that without troubling ourselves with trying to load Package etc.
    base = __dirname;
    file = path.join(base, command + '.js');
    if (sh.test('-f', file)) {
        return file;
    }

    // If we're in a project but not initialized make sure they do that first.
    if (this.inProject()) {
        if (!sh.test('-e', 'node_modules')) {
            this.error(
                'Project not initialized. Run `tibet init [--link]` first.');
            return 1;
        }
    }

    try {
        this.initPackage();
    } catch (e) {
        return this.handleError(e, 'loading', command);
    }

    roots = ['~app_cmd', '~lib_cmd'];
    len = roots.length;

    for (i = 0; i < len; i++) {
        base = this._package.expandPath(roots[i]);
        file = path.join(base, command + '.js');
        if (sh.test('-f', file)) {
            return file;
        }
    }
};


/**
 * Returns the targets exported from any CLI.MAKE_FILE in the application. If
 * the file isn't loaded yet this call will attempt to load it.
 * @return {boolean} True if the target is found.
 */
CLI.getMakeTargets = function() {
    var root;
    var file;
    var fullpath;

    if (this.make_targets) {
        return this.make_targets;
    }

    root = this.getAppRoot();
    file = this.MAKE_FILE;
    fullpath = path.join(root, file);

    if (!sh.test('-f', fullpath)) {
        this.debug('TIBET make file not found: ' + fullpath);
        return;
    }

    try {
        this.make_targets = require(fullpath);
    } catch (e) {
        // If we're inside the library this can occur due to a failure to link
        // TIBET into the local git repo clone.
        if (this.inLibrary()) {
            this.warn('\nTIBET not linked locally. Try `npm link tibet` to access make targets.');
        } else {
            this.error('Unable to load TIBET make file: ' + e.message);
        }
    }

    return this.make_targets;
};


/**
 * Checks for a CLI.MAKE_FILE in the application root directory and, if found,
 * checks it for a matching target.
 * @param {string} target The target to search for.
 * @return {boolean} True if the target is found.
 */
CLI.hasMakeTarget = function(target) {
    var targets;

    targets = this.getMakeTargets();
    if (this.notValid(targets)) {
        return false;
    }
    return typeof targets[target] === 'function';
};


/**
 * Returns a default value if a particular value is undefined, else returns the
 * original value. Useful for defaulting optional parameters.
 * @param {Object} suspectValue The value to test.
 * @param {Object} defaultValue The value to default to when suspect is undef.
 * @return {Object} The suspect or default value.
 */
CLI.ifUndefined = function(suspectValue, defaultValue) {

    if (suspectValue === undefined) {
        return defaultValue;
    }

    return suspectValue;
};


/**
 * Returns true if the project appears to be using Grunt as a build tool.
 * @return {Boolean} true if a CLI.GRUNT_FILE and Grunt binary are found.
 */
CLI.inGruntProject = function() {

    var cwd;        // Where are we being run?
    var file;       // What file are we looking for?

    cwd = process.cwd();
    file = this.GRUNT_FILE;

    return sh.test('-f', path.join(cwd, file)) &&
        sh.test('-f', path.join(cwd, './node_modules/.bin/grunt'));
};


/**
 * Returns true if the project appears to be using Gulp as a build tool.
 * @return {Boolean} true if a CLI.GULP_FILE and gulp binary are found.
 */
CLI.inGulpProject = function() {

    var cwd;        // Where are we being run?
    var file;       // What file are we looking for?

    cwd = process.cwd();
    file = this.GULP_FILE;

    return sh.test('-f', path.join(cwd, file)) &&
        sh.test('-f', path.join(cwd, './node_modules/.bin/gulp'));
};


/**
 * Initializes the package instance we'll use for path resolution and package
 * processing.
 */
CLI.initPackage = function() {
    if (this._package) {
        return;
    }

    Package = require(path.join(__dirname, '_Package.js'));
    this._package = new Package(this.options);
};


/**
 * Returns true if the command context is the TIBET library.
 * @param {Object} CmdType The command type currently being processed.
 * @return {Boolean} True if the current context is inside the TIBET library.
 */
CLI.inLibrary = function(CmdType) {
    return !this.inProject(CmdType) && this.config.npm.name === 'tibet';
};


/**
 * Returns true if the command is currently being invoked from within a project
 * directory, false if it's being run outside of one. Some commands like 'start'
 * operate differently when they are invoked outside vs. inside of a project
 * directory. Some commands are only valid outside. Some are only valid inside.
 * @param {Object} CmdType The command type currently being processed.
 * @return {Boolean} True if the current context is inside a TIBET project.
 */
CLI.inProject = function(CmdType) {

    var cwd;        // Where are we being run?
    var file;       // What file are we looking for?
    var fullpath;   // What full path are we checking?

    cwd = process.cwd();
    file = this.PROJECT_FILE;

    // Walk the directory path from cwd "up" checking for the signifying file
    // which tells us we're in a TIBET project.
    while (cwd.length > 0) {
        fullpath = path.join(cwd, file);
        if (sh.test('-f', fullpath)) {
            this.config.app_root = cwd;

            // Relocate cwd to the new root so our paths for things like
            // grunt and gulp work without requiring global installs etc.
            process.chdir(cwd);

            // Once we find the directory of a project root load any tibet.json
            // configuration found there.
            try {
                this.config.tibet = require(fullpath);
            } catch (e) {
                // Make sure we default to some value.
                this.config.tibet = this.config.tibet || {};

                // Don't output warnings about project issues when providing
                // help text.
                if (CmdType && CmdType.NAME !== 'help') {
                    this.warn('Error loading project file: ' + e.message);
                }
            }

            // Load the package.json file as well so we can access current
            // project configuration info specific to npm.
            try {
                this.config.npm = require(path.join(cwd, this.PACKAGE_FILE));
            } catch (e) {
                // Make sure we default to some value.
                this.config.npm = this.config.npm || {};
            }

            // One last check. The TIBET library will have a package and project
            // file but we don't consider it to be a "project" per se.
            if (this.config.npm.name === 'tibet') {
                return false;
            }

            return true;
        }
        cwd = cwd.slice(0, cwd.lastIndexOf(path.sep));
    }

    return false;
};


/**
 * Returns true if the current operation is happening in a project (inProject)
 * and that project has been initialized (has node_modules etc).
 */
CLI.isInitialized = function() {
    if (!this.inProject()) {
        return false;
    }

    return sh.test('-e', path.join(this.getAppRoot(), 'node_modules/tibet'));
};


/**
 * Outputs a list of items, formatting them to indent and wrap properly.
 * @param {Array.<string>} aList The list of items to output.
 */
CLI.logItems = function(aList) {

    var limit = this.CHARS_PER_LINE;
    var buffer;
    var line;
    var cmd;

    buffer = '';
    if (aList && aList.length > 0) {
        line = '\t';
        while ((cmd = aList.shift())) {
            if (line.length + cmd.length > limit) {
                buffer += line + '\n';
                line = '\t';
            }
            line += cmd + ' ';
        }
        buffer += line;
    }

    this.info(buffer);
};


/**
 * Outputs a standard error message and exits. This function is typically called
 * by commands that require project initialization to run properly.
 */
CLI.notInitialized = function() {
    this.error('Project not initialized. Run `tibet init` first.');
    return 1;
};


//  ---
//  Command Execution
//  ---

/**
 * Performs standard error handling for catch blocks to avoid duplication of
 * processing for empty messages, stack inclusion, etc.
 * @param {Error} e The error object.
 * @param {string} phase The phase of command processing.
 * @param {string} command The command that failed.
 */
CLI.handleError = function(e, phase, command) {
    var msg;

    msg = e.message || '';

    // Some downstream throw calls are empty so they can do their own
    // messaging but still convey they failed. Skip messaging in those cases
    // unless we're also asked to dump the stack.
    if (this.options.stack) {
        msg += ' ' + e.stack;
    } else if (!msg) {
        return 1;
    }

    // Try to avoid Error... Error... messages being built up.
    if (!/^Error/.test(msg)) {
        msg = 'Error ' + phase + ' ' + command + ': ' + msg;
    }

    this.error(msg);

    process.exit(1);
};


/**
 * Executes the current command line, parsing the command line and invoking the
 * appropriate command in response. Command instances are invoked via their
 * `execute` method. See the _cmd.js documentation for more detail.
 * @param {Object} config An object containing context/config information.
 */
CLI.run = function(config) {

    var command;        // the first non-option argument, the command name.
    var cmdPath;        // the command path (for use with require())

    // Typically contains npm config data under a 'npm' key and a slot for TIBET
    // config data (normally read in by _cmd) under a 'tibet' key.
    this.config = config || {};

    //  ---
    //  Process the command-line arguments to find the command name.
    //  ---

    // Slice 2 here to remove 'node tibet' from the front. Also ensure that our
    // binary (boolean) flags are identified as such to avoid parsing glitches.
    this.options = minimist(process.argv.slice(2), this.PARSE_OPTIONS) || {_:[]};

    command = this.options._[0];
    if (!command) {
        // Empty commands often indicate a --flag of some kind on the tibet
        // command itself. Check for the ones we support here.
        // NB: don't change these to value tests, we just want existence.
        if (this.options.version) {
            command = 'version';
        } else {
            command = 'help';
        }
    }

    // Don't run commands that are prefixed, they're considered 'cli internals'.
    if (command.charAt(0) === '_') {
        this.error('Cannot directly run private command: ' + command);
        return 1;
    }

    //  ---
    //  Verify the command is valid.
    //  ---

    // Search app_cmd, lib_cmd_ etc. for the command implementation.
    cmdPath = this.getCommandPath(command);

    // Not a 'native TIBET command' so try handling via fallback logic.
    if (!cmdPath) {
        this.runFallback(command);
        return;
    }

    this.runCommand(command, cmdPath);
};


/**
 * Executes a named command which should be found at cmdPath. Command instances
 * are invoked via their `execute` method. See the _cmd.js documentation for
 * more detail.
 * @param {string} command The command name.
 * @param {string} cmdPath The path used to require the command implementation.
 */
CLI.runCommand = function(command, cmdPath) {

    var CmdType;
    var cmd;

    // Load the command type
    try {
        CmdType = require(cmdPath);
    } catch (e) {
        this.debug('cmdPath: ' + cmdPath);
        return this.handleError(e, 'loading', command);
    }

    // Instantiate the command instance. Note no arguments here.
    try {
        cmd = new CmdType();
    } catch (e) {
        return this.handleError(e, 'instantiating', command);
    }

    // If we're not dumping help or usage check context. We can't really run to
    // completion if we're not in the right context.
    if (!this.options.usage && !this.options.help) {
        if (!this.canRun(CmdType)) {
            this.error('Command must be run ' + CmdType.CONTEXT +
                ' a TIBET project.');
            return 1;
        }
    }

    //  Dispatch the command with any config options. It will parse the command
    //  line again itself so it can be certain of flag values.
    try {
        cmd.run(this.options);
    } catch (e) {
        return this.handleError(e, 'processing', command);
    }
};


/**
 * Runs a series of checks for fallback options from 'make' to grunt to
 * gulp (in that order).
 * @param {string} command The command to attempt to execute.
 */
CLI.runFallback = function(command) {

    if (!this.inProject() && !this.inLibrary()) {
        this.error('Command not found: ' + command + '.');
        return 1;
    }

    // If there's no node_modules in place (and hence no tibet, grunt, or gulp
    // that are local) suggest they run `tibet init` first.
    if (!sh.test('-e', 'node_modules')) {
        this.notInitialized();
    }

    if (this.hasMakeTarget(command)) {

        this.warn('Delegating `' + command + '` to tibet make...');
        this.runViaMake(command);

    } else if (this.inGruntProject(command)) {

        this.warn('Delegating `' + command + '` to grunt...');
        this.runViaGrunt(command);

    } else if (this.inGulpProject()) {

        this.warn('Delegating `' + command + '` to grunt...');
        this.runViaGulp(command);

    } else {

        this.error('Command not found: ' + command + '.');
        return 1;
    }
};


/**
 * Executes a command by delegating to 'grunt' and treating the command name as
 * a grunt task name.
 * @param {string} command The command to attempt to execute.
 */
CLI.runViaGrunt = function(command) {

    var cmd;        // Command string we'll be executing via grunt.
    var child;      // spawned child process for grunt execution.

    cmd = 'grunt ' + process.argv.slice(2).join(' ');
    this.debug('spawning: ' + cmd);

    child = require('child_process').spawn('./node_modules/.bin/grunt',
        process.argv.slice(2),
        { cwd: this.getAppRoot() }
    );

    // TODO: add more handlers here for signal handling, cleaner shutdown, etc.

    child.stdout.on('data', function(data) {
        // Why the '' + ?. Apparently to 'copy' the string :)
        var msg = '' + data;

        this.log(msg);
    });

    child.stderr.on('data', function(data) {
        // Why the '' + ?. Apparently to 'copy' the string :)
        var msg = '' + data;

        this.error(msg);
    });

    child.on('error', function(err) {
        this.error('' + err.message);
    });

    child.on('exit', function(code) {
        process.exit(code);
    });

    return;
};


/**
 * Executes a command by delegating to 'gulp' and treating the command name as
 * a gulp task name.
 * @param {string} command The command to attempt to execute.
 */
CLI.runViaGulp = function(command) {

    var cmd;        // Command string we'll be executing via gulp.
    var child;      // spawned child process for gulp execution.

    cmd = './node_modules/.bin/gulp ' + process.argv.slice(2).join(' ');
    this.debug('spawning: ' + cmd);

    child = require('child_process').spawn('./node_modules/.bin/gulp',
        process.argv.slice(2),
        { cwd: this.getAppRoot() }
    );

    // TODO: add more handlers here for signal handling, cleaner shutdown, etc.

    child.stdout.on('data', function(data) {
        // Why the '' + ?. Apparently to 'copy' the string :)
        var msg = '' + data;

        this.log(msg);
    });

    child.stderr.on('data', function(data) {
        // Why the '' + ?. Apparently to 'copy' the string :)
        var msg = '' + data;

        this.error(msg);
    });

    child.on('error', function(err) {
        this.error('' + err.message);
    });

    child.on('exit', function(code) {
        process.exit(code);
    });

    return;
};


/**
 * Executes a command by delegating to `tibet make` and executing the command as
 * a make target.
 * @param {string} command The command to attempt to execute.
 */
CLI.runViaMake = function(command) {

    // Delegate to the same runCommand used for all other common commands. Note
    // that the only difference to the `make` command is that it won't be able
    // to parse quite the same command line from process.argv.
    this.runCommand('make', path.join(__dirname, 'make.js'));
};


module.exports = CLI;

}());
