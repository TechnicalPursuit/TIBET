/**
 * @overview The 'tibet make' command.
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
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
    'Runs a target function in a TIBET project Makefile.js file.\n\n' +
    'Inspired by shelljs/make but adjusted to meet the requirements\n' +
    'of TIBET\'s command line interface.\n';


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet make [<target>]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 */
Cmd.prototype.execute = function() {

    var targets;
    var command;

    // The CLI loads our makefile to check for targets. We can just leverage
    // that here to execute.
    targets = CLI.make_targets;

    command = this.argv._[0];

    if (CLI.notValid(targets)) {
        this.error('TIBET make file not found: ' + CLI.MAKE_FILE);
        return 1;
    }

    if (typeof targets[command] !== 'function') {
        this.error('TIBET make target not found: ' + command);
        return 1;
    }

    try {
        targets[command](this);
    } catch (e) {
        this.error(e.message);
        return 1;
    }
};


module.exports = Cmd;

}());
