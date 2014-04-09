/**
 * @overview The 'tibet help' command.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

;(function(root) {

var CLI = require('./_cli');

//  ---
//  Type Construction
//  ---

var parent = require('./_cmd');

var Cmd = function(){};
Cmd.prototype = new parent();


//  ---
//  Instance Attributes
//  ---

/**
 * The command execution context. Clone can only be done outside of a project.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.BOTH;


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet help [command]';


//  ---
//  Instance Methods
//  ---

/**
 * Runs the help command, outputting a list of usage strings for any commands
 * found.
 * @param {Array.<string>} args The argument array from the command line.
 */
Cmd.prototype.process = function(args) {

    var path;
    var sh;
    var files;
    var my;
    var argv;
    var command;

    path = require('path');
    sh = require('shelljs');

    argv = this.argv;
    command = argv._[0];

    // TODO: add logic for ~*_cmd versions of commands.
    // IFF we can find an app root then we can also try to locate any
    // app-specific commands which might exist. Otherwise we'll just list those
    // which are built-in.

    // If there's a specific command being requested just output for that one
    // command.
    if (command) {
        file = path.join(__dirname, command + '.js');
        if (sh.test('-f', file)) {
            cmd = require(file);
            this.info(cmd.prototype.USAGE);
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
