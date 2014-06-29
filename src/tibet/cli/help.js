/**
 * @overview The 'tibet help' command. Displays the usage and/or help text for a
 *     command, or for the entire TIBET CLI if no command name is given. Note
 *     that if `tibet help` is invoked within a project any custom commands or
 *     makefile.js targets for that application are also listed.
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
var path = require('path');
var sh = require('shelljs');


//  ---
//  Type Construction
//  ---

var Parent = require('./_cmd');

var Cmd = function(){};
Cmd.prototype = new Parent();


//  ---
//  Instance Attributes
//  ---

/**
 * The command execution context. Clone can only be done outside of a project.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.BOTH;


/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'help';


/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Displays usage and help for a specific command, or the \'tibet\' command\n\n' +

'You can alternatively get usage data via the --usage flag on each command\n' +
'or complete help output by using the --help flag on the target command.\n';

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet help [command]';


//  ---
//  Instance Methods
//  ---

/**
 * Processes requests of the form 'tibet --help', 'tibet help --help', or
 * 'tibet --help <command>'. Each variant has a different target (tibet, help,
 * or command respectively).
 * @return {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.help = function() {

    // The 'tibet --help' command will end up here, but it's not really a
    // request for help on the help command.

    if (this.options._[0] !== 'help') {
        return this.execute();
    }

    this.usage();
    this.info(this.HELP + '\n');

    return 0;
};


/**
 * Processes requests of the form 'tibet --usage', 'tibet help --usage', and
 * potentially 'tibet --usage <command>'. The last one is a bit tricky since
 * minimist will parse that and make <command> the value of the usage flag.
 * @return {Number} A return code.
 */
Cmd.prototype.usage = function() {

    // The 'tibet --usage' command can end up here. It's not really a request
    // for usage on the help command.
    if (this.options._[0] !== 'help') {
        return this.execute();
    }

    this.info('\nUsage: ' + this.USAGE + '\n');

    return 0;
};


/**
 * Runs the help command, outputting a list of usage strings for any commands
 * found.
 * @return {Number} A return code.
 */
Cmd.prototype.execute = function() {

    var command;
    var cmds;
    var intro;

    // If specific command was given delegate to the command type.
    command = this.options._ && this.options._[1];
    if (command) {
        if (command === 'help') {
            // Help on help? Easy
            return this.help();
        }
        return this.executeForCommand(command);
    }

    this.info('\nUsage: tibet <command> <options>');

    // ---
    // Introduction
    // ---

    intro =
        '\nThe tibet command can invoke TIBET built-ins, custom commands,\n' +
        'tibet makefile.js targets, grunt targets, or gulp targets based\n' +
        'on your project configuration and your specific customizations.';

    this.info(intro);

    // ---
    // Built-ins
    // ---

    cmds = this.getCommands(__dirname);
    this.info('\n<command> built-ins include:\n');
    this.logCommands(cmds);

    // ---
    // Add-ons
    // ---

    if (CLI.inProject(Cmd)) {
        cmds = this.getCommands(CLI.expandPath('~app_cmd'));
        if (cmds.length > 0) {
            this.info('\n<command> extensions include:\n');
            this.logCommands(cmds);
        }
    }

    if (CLI.isInitialized() || CLI.inLibrary()) {
        cmds = this.getMakeTargets();
        if (cmds.length > 0) {
            this.info('\nmakefile.js targets include:\n');
            this.logCommands(cmds);
        }
    }

    // ---
    // Summary
    // ---

    this.info('\n<options> always include:\n');

    this.info('\t--help         display command help text');
    this.info('\t--usage        display command usage summary');
    this.info('\t--color        colorize the log output [true]');
    this.info('\t--verbose      work with verbose output [false]');
    this.info('\t--debug        turn on debugging output [false]');
    this.info('\t--stack        display stack with error [false]');

    this.info('\nConfigure default parameters via tibet.json');

    try {
        this.info('\n' + CLI.config.npm.name + '@' + CLI.config.npm.version +
            ' ' + sh.which('tibet'));
    } catch (e) {
    }
};


/**
 * Processes help for a specific command. This method forwards to the command
 * and invokes its help() method.
 * @param {string} command The command name we're running.
 * @return {Number} A return code.
 */
Cmd.prototype.executeForCommand = function(command) {
    var file;
    var CmdType;
    var cmd;

    file = path.join(__dirname, command + '.js');
    if (sh.test('-f', file)) {
        CmdType = require(file);
        cmd = new CmdType();
        cmd.help();
    } else {
        this.error('Command \'' + command + '\' not found.');
        return 1;
    }

    return 0;
};


/**
 * Returns a list of command files found in the path provided.
 * @param {string} aPath The path to search.
 * @return {Array.<string>} The list of commands.
 */
Cmd.prototype.getCommands = function(aPath) {
    var files;
    var cmds;

    cmds = [];

    // Depending on where the command is run the path built might not actually
    // exist, so check that first.
    if (sh.test('-d', aPath)) {
        files = sh.ls(aPath);
        files.sort().forEach(function(file) {
            if (file.charAt(0) !== '_' && /\.js$/.test(file)) {
                cmds.push(file.replace(/\.js$/, ''));
            }
        });
    }

    return cmds;
};


/**
 * Returns a list of custom make targets found in any TIBET-style `makefile` for
 * the current project.
 * @return {Array.<string>} The list of targets.
 */
Cmd.prototype.getMakeTargets = function() {
    var targets;
    var cmds;

    cmds = [];

    // Note that despite the name this isn't a list of targets in the form we're
    // looking for here. We want target names, this is a handle to the wrapper
    // object whose 'methods' define the targets.
    targets = CLI.getMakeTargets();
    if (!targets) {
        return cmds;
    }

    Object.keys(targets).forEach(function(target) {
        if (typeof targets[target] === 'function') {
            cmds.push(target);
        }
    });
    cmds.sort();

    return cmds;
};


/**
 * Outputs a command list, formatting it so it wraps properly and stays indented
 * to keep it looking crisp.
 * @param {Array.<string>} aList The list of command names to output.
 */
Cmd.prototype.logCommands = function(aList) {
    CLI.logItems(aList);
};


module.exports = Cmd;

}());
