/**
 * @overview The 'tibet help' command.
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
'Displays usage and help information for a command, or the \'tibet\' command.';


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet help [command]';


//  ---
//  Instance Methods
//  ---

/**
 * Processes requests of the form 'tibet --help', 'tibet help --help', and
 * potentially 'tibet --help <command>'. The last one is a bit tricky since
 * minimist will parse that and make <command> the value of the help flag.
 * @return {Number} A return code.
 */
Cmd.prototype.help = function() {

    // The 'tibet --help' command will end up here, but it's not really a
    // request for help on the help command.

    if (this.argv._[0] !== 'help') {
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
    if (this.argv._[0] !== 'help') {
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

    // If specific command was given delegate to the command type.
    command = this.argv._ && this.argv._[1];
    if (command) {
        if (command === 'help') {
            // Help on help? Easy
            return this.help();
        }
        return this.executeForCommand(command);
    }

    this.info('\nUsage: tibet <command> <options>');

    // ---
    // Built-ins
    // ---

    cmds = this.getCommands(__dirname);
    this.info('\nTIBET <command> choices include:\n');
    this.logCommands(cmds);

    // ---
    // Add-ons
    // ---

    if (CLI.inProject(Cmd)) {
        cmds = this.getCommands(CLI.expandPath('~app_cmd'));
        if (cmds.length > 0) {
            this.info('\nCustom <command> choices include:\n');
            this.logCommands(cmds);
        }
    }

    // ---
    // Summary
    // ---

    this.info('\nCommon <options> include:\n');

    this.info('\t--help         display command help text');
    this.info('\t--usage        display command usage summary');
    this.info('\t--color        colorize the log output [true]');
    this.info('\t--verbose      work with verbose output [false]');
    this.info('\t--debug        turn on debugging output [false]');
    this.info('\t--stack        display stack with error [false]');

    this.info('\nConfigure default parameters via tibet.json');

    try {
        this.info('\n' + this.options.npm.dependencies.tibet._id + ' ' +
            this.options.npm.dependencies.tibet.path);
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
 * Outputs a command list, formatting it so it wraps properly and stays indented
 * to keep it looking crisp.
 * @param {Array.<string>} aList The list of command names to output.
 */
Cmd.prototype.logCommands = function(aList) {
    CLI.logItems(aList);
};


module.exports = Cmd;

}());
