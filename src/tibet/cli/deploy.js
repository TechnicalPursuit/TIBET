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

/**
 * Reference to the overall CLI for logging etc.
 * @type {Object}
 */
Cmd.CLI = CLI;

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
Cmd.prototype.USAGE = 'tibet deploy <helper> [<options>]';

module.exports = Cmd;

}());
