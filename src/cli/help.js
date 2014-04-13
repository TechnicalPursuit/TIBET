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
    var files;
    var my;
    var CmdType;
    var cmd;
    var file;

    command = this.argv._ && this.argv._[1];
    if (command) {
        return this.executeForCommand(command);
    }

    // If no specific command was given dump the full help content.

    this.info('\nUsage: tibet <command> <options>\n');

    // ---
    // Built-ins
    // ---

    this.info('TIBET commands include:\n');

    my = this;
    files = sh.ls(__dirname);
    files.sort().forEach(function(file) {
        var cmd;

        if (file.charAt(0) !== '_') {
            cmd = require('./' + file);
            my.info('    ' + cmd.prototype.USAGE.replace(/^tibet /, ''));
        }
    });

    // ---
    // Add-ons
    // ---


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

module.exports = Cmd;

}());
