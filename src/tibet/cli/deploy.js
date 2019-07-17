//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet deploy' command. Searches for, otherwise searches for a
 *     'deploy' target in TIBET's make commands for the current project and
 *     invokes that if found.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0 */

(function() {

'use strict';

var CLI,
    Cmd;

CLI = require('./_cli');


//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('./_multi');
Cmd.prototype = new Cmd.Parent();

//  NOTE: we want deploy to be able to load runtime extensions so we need to
//  ensure we patch in an initialize hook.
Cmd.initialize = Cmd.Parent.initialize;

//  ---
//  Instance Attributes
//  ---

/**
 * The command execution context. Deploy can be done inside a project or lib.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'deploy';

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet deploy {helper} [options]';


//  ---
//  Instance Methods
//  ---

/**
 * Runs the deploy command, using the default 'tibet make' support.
 * @returns {Number} A return code.
 */
Cmd.prototype.executeMake = function() {
    var command;

    this.info('checking for `tibet make deploy` target...');

    if (CLI.hasMakeTarget('deploy')) {
        command = 'deploy';
        this.warn('Delegating to \'tibet make ' + command + '\'');
        return CLI.runViaMake(command);
    } else if (CLI.hasMakeTarget('_deploy')) {
        command = '_deploy';
        this.warn('Delegating to \'tibet make ' + command + '\'');
        return CLI.runViaMake(command);
    }

    this.warn('No make deploy or makefile deploy target found.');

    return 0;
};


module.exports = Cmd;

}());
