/**
 * @overview TIBET command-line processor. Individual command files do the work.
 *     The logic here is focused on command identification, initial argument
 *     processing, and command file loading. If a command isn't found this will
 *     try to find a matching grunt task to invoke to perform the work.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-Approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/*
 * TODO:    Add --help support to this 'command'.
 */

(function(root) {

// Define a theme for our console output.
// TODO: replace with ansi.js at some point.
require('colors').setTheme({
    log: 'grey',
    info: 'white',
    error: 'red',
    warn: 'yellow',
    debug: 'magenta',
    verbose: 'cyan'
});

/*
 * The Command Line object. This object is fairly simply. It parses a command
 * line to determine if there's a viable command name present. If the command
 * name can be identified it tries to load a file with that name from the local
 * directory to process the command. If the command cannot be found an attempt
 * is made to invoke a task of that name using grunt as a fallback build tool.
 */

var CLI = {};

/**
 * The set of viable "execution contexts" for commands. Both implies a command
 * can be run either inside or outside of a TIBET project context. The others
 * should be self-evident.
 */
CLI.CONTEXTS = {
    BOTH: 'both',
    INSIDE: 'inside',
    OUTSIDE: 'outside'
};

/**
 * Grunt fallback requires that we find this file to be sure we're in a
 * grunt-enabled project.
 */
CLI.GRUNT_FILE = 'Gruntfile.js';

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

/*
 * Required modules we'll bring in once.
 */
CLI.path = require('path');
CLI.sh = require('shelljs');

//  ---
//  Console logging API.
//  ---

/*
 * Methods here provide simple coloring to match the level of the log message.
 */

CLI.log = function(msg) {
    console.log(msg.log);
};

CLI.info = function(msg) {
    console.info(msg.info);
};

CLI.warn = function(msg) {
    console.warn(msg.warn);
};

CLI.error = function(msg) {
    console.error(msg.error);
};

CLI.debug = function(msg) {
    if (!this.options.debug) {
        return;
    }
    console.log(msg.debug);
};

CLI.verbose = function(msg) {
    if (!this.options.verbose) {
        return;
    }
    console.log(msg.verbose);
};

CLI.raw = function(msg) {
    console.log(msg);
};


//  ---
//  'Can Run' support
//  ---

/**
 * Returns true if the current context is appropriate for the command to run.
 * @return {Boolean}
 */
CLI.canRun = function(cmd) {

    if (CLI.inProject())
        return cmd.CONTEXT !== CLI.CONTEXTS.OUTSIDE;
    else {
        return cmd.CONTEXT !== CLI.CONTEXTS.INSIDE;
    }
};


/**
 * Returns true if the command is currently being invoked from within a project
 * directory, false if it's being run outside of one. Some commands like 'start'
 * operate differently when they are invoked outside vs. inside of a project
 * directory. Some commands are only valid outside. Some are only valid inside.
 * @return {Boolean} True if the command was run inside a TIBET project
 *     directory.
 */
CLI.inProject = function() {

    var path;       // The path utility module.
    var sh;         // The shelljs module. Used for file existence check.

    var cwd;        // Where are we being run?
    var file;       // What file are we looking for?

    cwd = process.cwd();
    file = CLI.PROJECT_FILE;

    // Walk the directory path from cwd "up" checking for the signifying file
    // which tells us we're in a TIBET project.
    while (cwd.length > 0) {
        if (this.sh.test('-f', this.path.join(cwd, file))) {
            CLI.options.app_root = cwd;
            return true;
        }
        cwd = cwd.slice(0, cwd.lastIndexOf(this.path.sep));
    }

    return false;
};

//  ---
//  Console action API.
//  ---

CLI.run = function(options) {

    var opt;            // the optimist module. parses command line.

    var argv;           // arguments processed via optimist.
    var command;        // the first non-option argument, the command name.
    var file;           // the command file we check for existence.
    var rest;           // arguments list, minus $0 and command name.
    var cmdType;        // the command type (require'd into existence)
    var cmd;            // the command instance for a command run.

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

    file = this.path.join(__dirname, command + '.js');

    // Test to see if the command file in question exists.
    if (this.sh.test('-f', file) !== true) {

        // If the file doesn't exist it's not a "pure TIBET" command. It might
        // be that we're trying to invoke a grunt task via the 'tibet' command
        // so check for that.

        // We have to be in a project to invoke grunt as a fallback.
        if (!this.inProject()) {
            this.warn('Command not found: ' + command + '.' +
                    ' Grunt fallback requires a project.');
            process.exit(1);
        }

        CLI.runViaGrunt();
        return;
    }

    try {
        cmdType = require('./' + command);

        cmd = new cmdType(this.options);

        if (!this.canRun(cmd)) {
            this.warn('Command must be run ' + cmd.CONTEXT +
                ' a TIBET project.');
            process.exit(1);
        }

    } catch (e) {
        this.error('Error loading ' + command + ': ' + e.message);
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
        this.error('Error processing ' + command + ': ' + e.message);
        process.exit(1);
    }
};


CLI.runViaGrunt = function() {

    var cmd,        // Command string we'll be executing via grunt.
        child;      // spawned child process for grunt execution.

    // If there's no node_modules in place (and in particular no grunt) then
    // suggest they run `tibet init` first.
    if (!this.sh.test('-e', 'node_modules')) {
        this.error('Project not initialized. Run `tibet init` first.');
        process.exit(1);
    }

    cmd = 'grunt ' + process.argv.slice(2).join(' ');
    this.debug('spawning: ' + cmd);

    child = require('child_process').spawn('grunt',
        process.argv.slice(2),
        { cwd: this.options.app_root }  // depends on inProject having run.
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
