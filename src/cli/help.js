/**
 * @overview The 'tibet help' command.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/*eslint no-extra-semi:0*/
;(function() {

'use strict';

var CLI = require('./_cli');

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
 */
Cmd.prototype.help = function() {

    // The 'tibet --help' command will end up here, but it's not really a
    // request for help on the help command.

    if (this.argv._[0] !== 'help') {
        return this.execute();
    }

    this.usage();
    this.info(this.HELP + '\n');
};


/**
 * Processes requests of the form 'tibet --usage', 'tibet help --usage', and
 * potentially 'tibet --usage <command>'. The last one is a bit tricky since
 * minimist will parse that and make <command> the value of the usage flag.
 */
Cmd.prototype.usage = function() {

    // The 'tibet --usage' command can end up here. It's not really a request
    // for usage on the help command.
    if (this.argv._[0] !== 'help') {
        return this.execute();
    }

    this.info('\nUsage: ' + this.USAGE + '\n');
};


/**
 * Runs the help command, outputting a list of usage strings for any commands
 * found.
 */
Cmd.prototype.execute = function() {

    var path;
    var sh;
    var files;
    var my;
    var command;
    var CmdType;
    var cmd;
    var file;

    path = require('path');
    sh = require('shelljs');

    command = this.argv._ && this.argv._[1];

    // TODO: add logic for ~*_cmd versions of commands.
    // IFF we can find an app root then we can also try to locate any
    // app-specific commands which might exist. Otherwise we'll just list those
    // which are built-in.

    // If there's a specific command being requested just output for that one
    // command.
    if (command) {
        file = path.join(__dirname, command + '.js');
        if (sh.test('-f', file)) {
            CmdType = require(file);
            cmd = new CmdType();
            cmd.help();
        } else {
            this.error('Command \'' + command + '\' not found.');
        }
        return;
    }

    // If no specific command was given build up a list. Note that we need to
    // filter out the ones that start with _ since they're "internal" files.

    this.info('tibet commands:');

    my = this;
    files = sh.ls(__dirname);
    files.sort().forEach(function(file) {
        var cmd;

        if (file.charAt(0) !== '_') {
            cmd = require('./' + file);
            my.info('    ' + cmd.prototype.USAGE.replace(/^tibet /, ''));
        }
    });
};

module.exports = Cmd;

}());
