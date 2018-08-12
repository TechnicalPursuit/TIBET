//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet vscode' command. Allows client-side triggering of VSCode
 *     to let you navigate VSCode to a specific file:line from the Sherpa.
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

Cmd = function() {
    //  empty
};
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
Cmd.NAME = 'vscode';

//  ---
//  Instance Attributes
//  ---

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet vscode [path[:line]]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {
    var cp,
        child,
        target,
        parts,
        args;

    args = [];
    target = process.argv[process.argv.length - 1];
    if (CLI.notEmpty(target) && target !== 'vscode') {
        //  If we got optional line:char info split so we can expand any virtual
        //  path reference on the front, then join it back up for final push.
        if (target.indexOf(':') !== -1) {
            parts = target.split(':');
            parts[0] = CLI.expandPath(parts[0]);
            target = parts.join(':');

            //  VSCode requires --goto if there's line:char info, otherwise not.
            args.push('--goto');
        } else {
            target = CLI.expandPath(target);
        }
        args.push(target);
    }

    cp = require('child_process');
    child = cp.spawn('code', args, {detached: true, stdio: ['ignore', 'ignore', 'ignore']});
    child.unref();

    return 0;
};


module.exports = Cmd;

}());
