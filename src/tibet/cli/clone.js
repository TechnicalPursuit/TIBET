//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet clone' command. Clones application dna to create new
 *     applications.
 */
//  ========================================================================

/* eslint indent:0 */

(function() {

'use strict';

var CLI,
    Cmd,
    path;

CLI = require('./_cli');
path = require('path');

//  ---
//  Type Construction
//  ---

Cmd = function() {
    //  empty
};
Cmd.Parent = require('./_dna');
Cmd.prototype = new Cmd.Parent();

//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.OUTSIDE;

/**
 * Where are the dna templates we should clone from? This value will be joined
 * with the current file's load path to create the absolute root path.
 * @type {string}
 */
Cmd.prototype.DNA_ROOT = '../../../../dna/';

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'clone';

//  ---
//  Instance Attributes
//  ---

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE =
    'tibet clone [--name] <name> [[--dir] <dirname>] [--dna <template>]' +
    ' [--list] [--force]';

//  ---
//  Instance Methods
//  ---

/**
 * Write a summary of what the command has done.
 */
Cmd.prototype.summarize = function() {
    var options;

    options = this.options;

    this.log('Application DNA \'' + path.basename(options.dna) +
        '\' cloned to ' + options.dirname +
        ' as \'' + options.name + '\'.');

    this.info('cd ' + options.dirname + '; tibet init; to continue developing.');
};

module.exports = Cmd;

}());
