//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet path' command. Outputs the fully-resolved value for a
 *     tibet virtual path.
 */
//  ========================================================================

/* eslint indent:0 */

(function() {

'use strict';

var CLI,
    Cmd;

CLI = require('./_cli');

//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('./_cmd');
Cmd.prototype = new Cmd.Parent();


//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.ANY;

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'path';

//  ---
//  Instance Attributes
//  ---

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet path <virtual_path>';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @returns {Number|Promise} The return code produced by running the command (a
 *     non-zero indicates an Error) or a Promise that resolves when the command
 *     finishes.
 */
Cmd.prototype.execute = function() {

    var args,
        thisref;

    thisref = this;
    args = this.getArgv().slice(1);

    args.forEach(function(item) {
        var vpath;

        if (item.charAt(0) !== '~') {
            vpath = '~' + item;
        } else {
            vpath = item;
        }

        if (CLI.inLibrary() && vpath.indexOf('~app') === 0) {
            thisref.info(vpath + ' => ' + 'not valid in library context.');
            return;
        }

        //  NOTE true flag here to silence errors and just return undef for
        //  paths that aren't found.
        thisref.info(vpath + ' => ' + CLI.expandPath(vpath, true));
    });

    return 0;
};


module.exports = Cmd;

}());
