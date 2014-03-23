/**
 * @overview TIBET command-line processor. Individual command files do the work.
 *     The logic here is focused on command identification, initial argument
 *     processing, and command file loading. If a command isn't found this will
 *     try to find a matching grunt or gulp task to invoke to perform the work.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-Approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/*
 * TODO:    Add --help support
 */

;(function(root) {

/*
 * Required modules we'll bring in once.
 */
var path = require('path');
var sh = require('shelljs');
var chalk = require('chalk');

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
 * The set of viable "execution contexts" for commands. Both implies a command
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
 * grunt-enabled project.
 * @type {string}
 */
CLI.GRUNT_FILE = 'gruntfile.js';


/**
 * Gulp fallback requires that we find this file to be sure we're in a
 * gulp-enabled project.
 * @type {string}
 */
CLI.GULP_FILE = 'gulpfile.js';


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
CLI.options = {};


//  ---
//  Common Logging
//  ---

/*
 * Methods here provide simple coloring to match the level of the log message.
 */

CLI.log = function(msg) {
    if (this.options.color === false) {
        console.log(msg);
        return;
    }
    console.log(chalk.grey(msg));
};

CLI.info = function(msg) {
    if (this.options.color === false) {
        console.info(msg);
        return;
    }
    console.info(chalk.white(msg));
};

CLI.warn = function(msg) {
    if (this.options.color === false) {
        console.warn(msg);
        return;
    }
    console.warn(chalk.yellow(msg));
};

CLI.error = function(msg) {
    if (this.options.color === false) {
        console.error(msg);
        return;
    }
    console.error(chalk.red(msg));
};

CLI.debug = function(msg) {
    if (!this.options.debug) {
        return;
    }
    if (this.options.color === false) {
        console.log(msg);
        return;
    }
    console.log(chalk.magenta(msg));
};

CLI.verbose = function(msg) {
    if (!this.options.verbose) {
        return;
    }
    if (this.options.color === false) {
        console.log(msg);
        return;
    }
    console.log(chalk.cyan(msg));
};

CLI.system = function(msg) {
    if (this.options.color === false) {
        console.info(msg);
        return;
    }
    console.info(chalk.green(msg));
};

//  ---
//  "Can Run" Checking
//  ---

/**
 * Returns true if the current context is appropriate for the command to run.
 * @param {Object} cmd The command instance to check.
 * @return {Boolean} True if the command is runnable.
 */
CLI.canRun = function(cmd) {

    if (CLI.inProject())
        return cmd.CONTEXT !== CLI.CONTEXTS.OUTSIDE;
    else {
        return cmd.CONTEXT !== CLI.CONTEXTS.INSIDE;
    }
};


/**
 * Returns the application root directory, the path where the PROJECT_FILE is
 * found.
 */
CLI.getAppRoot = function() {

    var cwd;        // Where are we being run?
    var file;       // What file are we looking for?

    if (CLI.options.app_root) {
        return CLI.options.app_root;
    }

    cwd = process.cwd();
    file = CLI.PROJECT_FILE;

    // Walk the directory path from cwd "up" checking for the signifying file
    // which tells us we're in a TIBET project.
    while (cwd.length > 0) {
        if (sh.test('-f', path.join(cwd, file))) {
            CLI.options.app_root = cwd;
            break;
        }
        cwd = cwd.slice(0, cwd.lastIndexOf(path.sep));
    }

    return CLI.options.app_root;
};


/**
 * Searches a set of paths including ~app_cmd and ~lib_cmd for an implementation
 * file for the named command.
 * @param {string} command The command to find, such as 'start'.
 * @return {string} The path to the command, if found.
 */
CLI.getCommandPath = function(command, options) {

    var roots;      // The directory roots we'll search.
    var package;
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

    // Check other potential paths, which are virtual so they require our
    // package logic.
    var Package = require(path.join(__dirname,
        '../../node_modules/tibet3/base/lib/tibet/src/tibet_package.js'));
    package = new Package(options);

    roots = ['~app_cmd', '~lib_cmd'];
    len = roots.length;

    for (i = 0; i < len; i++) {
        base = package.expandPath(roots[i]);
        file = path.join(base, command + '.js');
        if (sh.test('-f', file)) {
            return file;
        }
    }

    return;
};


/**
 * Returns true if the project appears to be using Grunt as a build tool.
 * @return {Boolean} true if a CLI.GRUNT_FILE file is found.
 */
CLI.inGruntProject = function() {

    var cwd;        // Where are we being run?
    var file;       // What file are we looking for?

    cwd = process.cwd();
    file = CLI.GRUNT_FILE;

    return sh.test('-f', path.join(cwd, file)) &&
        sh.test('-f', path.join(cwd, './node_modules/.bin/grunt'));
};


/**
 * Returns true if the project appears to be using Gulp as a build tool.
 * @return {Boolean} true if a CLI.GULP_FILE file is found.
 */
CLI.inGulpProject = function() {

    var cwd;        // Where are we being run?
    var file;       // What file are we looking for?

    cwd = process.cwd();
    file = CLI.GULP_FILE;

    return sh.test('-f', path.join(cwd, file)) &&
        sh.test('-f', path.join(cwd, './node_modules/.bin/gulp'));
};


/**
 * Returns true if the command is currently being invoked from within a project
 * directory, false if it's being run outside of one. Some commands like 'start'
 * operate differently when they are invoked outside vs. inside of a project
 * directory. Some commands are only valid outside. Some are only valid inside.
 * @return {Boolean} True if the current context is inside a TIBET project.
 */
CLI.inProject = function() {

    var cwd;        // Where are we being run?
    var file;       // What file are we looking for?

    cwd = process.cwd();
    file = CLI.PROJECT_FILE;

    // Walk the directory path from cwd "up" checking for the signifying file
    // which tells us we're in a TIBET project.
    while (cwd.length > 0) {
        if (sh.test('-f', path.join(cwd, file))) {
            CLI.options.app_root = cwd;
            // Relocate cwd to the new root so our paths for things like
            // grunt and gulp work without requiring global installs etc.
            process.chdir(cwd);
            return true;
        }
        cwd = cwd.slice(0, cwd.lastIndexOf(path.sep));
    }

    return false;
};


//  ---
//  Command Execution
//  ---

/**
 * Executes the current command line, parsing the command line and invoking the
 * appropriate command in response.
 * @param {Object} options An object containing command/context information.
 */
CLI.run = function(options) {

    var opt;            // the optimist module. parses command line.
    var argv;           // arguments processed via optimist.
    var command;        // the first non-option argument, the command name.
    var file;           // the command file we check for existence.
    var rest;           // arguments list, minus $0 and command name.
    var cmdPath;        // the command path (for use with require())
    var cmdType;        // the command type (require'd into existence)
    var cmd;            // the command instance for a command run.
    var msg;            // error message string.

    this.options = options || {};
    this.options.cli = this;

    //  ---
    //  Process the command-line arguments to find the command name.
    //  ---

    opt = require('optimist');
    argv = opt.argv;
    command = argv._[0];

    // Configure logging/debugging parameters CLI-wide.
    this.options.debug = argv.debug;
    this.options.verbose = argv.verbose;
    this.options.stack = argv.stack;

    // NOTE: we could inject a more REPL-based approach here in the future.
    if (!command) {
        this.info('Usage: tibet {command} [arguments]');
        process.exit(1);
    }

    //  ---
    //  Verify the command is valid.
    //  ---

    // If the command specified happens to be 'cli' that's bad. We don't want to
    // try to load this file again from within this file.
    if (command === '_cli') {
        this.error('Cannot run TIBET CLI as a command.');
        process.exit(1);
    }

    // Search app_cmd, lib_cmd_ etc. for the command implementation.
    cmdPath = CLI.getCommandPath(command, options);

    if (!cmdPath) {
        // If the file doesn't exist it's not a "pure TIBET" command. It might
        // be that we're trying to invoke a grunt task via the 'tibet' command
        // so check for that.

        // We have to be in a project to invoke grunt as a fallback.
        if (!this.inProject()) {
            this.warn('Command not found: ' + command + '.' +
                    ' Grunt fallback requires a project.');
            process.exit(1);
        }

        if (this.inGulpProject()) {
            CLI.runViaGulp();
        } else if (this.inGruntProject()) {
            CLI.runViaGrunt();
        }

        return;
    }

    try {
        cmdType = require(cmdPath);

        cmd = new cmdType(this.options);

        if (!this.canRun(cmd)) {
            this.warn('Command must be run ' + cmd.CONTEXT +
                ' a TIBET project.');
            process.exit(1);
        }

    } catch (e) {
        msg = e.message;
        if (this.options.stack) {
            msg += ' ' + e.stack;
        }
        this.error('Error loading ' + command + ': ' + msg);
        process.exit(1);
    }

    //  ---
    //  Dispatch the command (if found).
    //  ---

    // Trim off the $0 portion (node, bin/tibet) and the command name. We pass
    // the remainder to the command as the argument list for the command.
    rest = process.argv.slice(2).filter(function(item) {
        return item !== command;
    });

    try {
        cmd.run(rest, this.options);
    } catch (e) {
        msg = e.message;
        if (this.options.stack) {
            msg += ' ' + e.stack;
        }
        this.error('Error processing ' + command + ': ' + msg);
        process.exit(1);
    }
};


/**
 * Executes a command by delegating to 'grunt' and treating the command name as
 * a grunt task name.
 */
CLI.runViaGrunt = function() {

    var cmd;        // Command string we'll be executing via grunt.
    var child;      // spawned child process for grunt execution.

    // If there's no node_modules in place (and in particular no grunt) then
    // suggest they run `tibet init` first.
    if (!sh.test('-e', 'node_modules')) {
        this.error('Project not initialized. Run `tibet init` first.');
        process.exit(1);
    }

    cmd = 'grunt ' + process.argv.slice(2).join(' ');
    this.debug('spawning: ' + cmd);

    child = require('child_process').spawn('./node_modules/.bin/grunt',
        process.argv.slice(2),
        { cwd: this.getAppRoot()}
    );

// TODO: add more handlers here for signal handling, cleaner shutdown, etc.

    child.stdout.on('data', function(data) {
        // Why the '' + ?. Apparently to 'copy' the string :)
        var msg = '' + data;

        CLI.log(msg);
    });

    child.stderr.on('data', function(data) {
        // Why the '' + ?. Apparently to 'copy' the string :)
        var msg = '' + data;

        CLI.error(msg);
    });

    child.on('error', function(err) {
        CLI.error('' + err.message);
    });

    child.on('exit', function(code) {
        process.exit(code);
    });

    return;
};

/**
 * Executes a command by delegating to 'gulp' and treating the command name as
 * a gulp task name.
 */
CLI.runViaGulp = function() {

    var cmd;        // Command string we'll be executing via gulp.
    var child;      // spawned child process for gulp execution.

    // If there's no node_modules in place (and in particular no gulp) then
    // suggest they run `tibet init` first.
    if (!sh.test('-e', 'node_modules')) {
        this.error('Project not initialized. Run `tibet init` first.');
        process.exit(1);
    }

    cmd = './node_modules/.bin/gulp ' + process.argv.slice(2).join(' ');
    this.debug('spawning: ' + cmd);

    child = require('child_process').spawn('./node_modules/.bin/gulp',
        process.argv.slice(2),
        { cwd: this.getAppRoot()}
    );

// TODO: add more handlers here for signal handling, cleaner shutdown, etc.

    child.stdout.on('data', function(data) {
        // Why the '' + ?. Apparently to 'copy' the string :)
        var msg = '' + data;

        CLI.log(msg);
    });

    child.stderr.on('data', function(data) {
        // Why the '' + ?. Apparently to 'copy' the string :)
        var msg = '' + data;

        CLI.error(msg);
    });

    child.on('error', function(err) {
        CLI.error('' + err.message);
    });

    child.on('exit', function(code) {
        process.exit(code);
    });

    return;
};

//  ---
//  Export
//  ---

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = CLI;
    }
    exports.CLI = CLI;
} else {
    root.CLI = CLI;
}

}(this));
