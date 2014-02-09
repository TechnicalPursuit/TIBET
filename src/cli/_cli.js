/**
 * @overview TIBET command-line processor. Individual command files do the work
 *     specific to each command. The logic here is focused on initial command
 *     identification, initial argument processing, and command file loading.
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

var colors;         // The colors module. Used for improved output.

// Define a theme for our console output.
require('colors').setTheme({
    log: 'grey',
    info: 'white',
    error: 'red',
    warn: 'yellow',
    debug: 'magenta',
    verbose: 'cyan'
});

/**
 * The Command Line object. This object is fairly simply. It parses a command
 * line to determine if there's a viable command name present. If the command
 * name can be identified it tries to load a file with that name from the local
 * directory to process the command. If the command name or file cannot be found
 * then an appropriate error is reported.
 */

var CLI = {};

/**
 * Optional configuration data typically passed into run() via tibet 'binary'.
 * @type {Object}
 */
CLI.options = {};

//  ---
//  Console logging API.
//  ---

CLI.debug = function(msg) {
    if (!this.options.debug) {
        return;
    }
    console.log(msg.debug);
};

CLI.error = function(msg) {
    console.error(msg.error);
};

CLI.info = function(msg) {
    console.info(msg.info);
};

CLI.log = function(msg) {
    console.log(msg.log);
};

CLI.verbose = function(msg) {
    if (!this.options.verbose) {
        return;
    }
    console.log(msg.verbose);
};

CLI.warn = function(msg) {
    console.warn(msg.warn);
};

CLI.raw = function(msg) {
    console.log(msg);
};

//  ---
//  Console action API.
//  ---

CLI.run = function(options) {

    var opt;            // the optimist module.
    var sh;             // the shelljs module.
    var path;           // the path module.

    var argv;           // arguments processed via optimist.
    var command;        // the first non-option argument, the command name.
    var file;           // the command file we check for existence.
    var rest;           // arguments list, minus $0 and command name.

    if (options) {
        this.options = options;
    }
    options.cli = this;

    //  ---
    //  Process the command-line arguments to find the command name.
    //  ---

    opt = require('optimist');
    argv = opt.argv;
    command = argv._[0];

    // Configure logging/debugging parameters CLI-wide.
    this.options.debug = argv.debug;
    this.options.verbose = argv.verbose;

    // Note that we could inject a more REPL-based approach here in the future.
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

    sh = require('shelljs');
    path = require('path');
    file = path.join(__dirname, command + '.js');

    // Test to see if the command file in question exists.
    if (sh.test('-f', file) !== true) {
        this.error('Unrecognized command: ' + command);
        process.exit(1);
    }

    try {
        // NOTE we create an instance of the command 'type' here.
        handler = new (require('./' + command))();
    } catch (e) {
        this.error('Error loading ' + command + ': ' + e.message);
        process.exit(1);
    }

    //  ---
    //  Dispatch the command (if found).
    //  ---

    // Trim off the $0 portion (node, bin/tibet) and the command name.
    rest = process.argv.slice(2).filter(function(item) {
        return item !== command;
    });

    try {
        handler.run(rest, this.options);
    } catch (e) {
        this.error('Error processing ' + command + ': ' + e.message);
        process.exit(1);
    }
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
