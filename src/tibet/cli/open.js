//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet open' command. Allows client-side triggering of an
 *     editor to let you navigate to a specific file:line from the Sherpa.
 */
//  ========================================================================

/* eslint indent:0, consistent-this: 0 */

(function() {

'use strict';

var CLI,
    Cmd,
    open;

CLI = require('./_cli');
open = require('open-editor');


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
Cmd.NAME = 'open';


//  ---
//  Instance Attributes
//  ---

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend({
    string: ['editor']
},
Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet open <vpath[:file[:char]]> [--editor <cmd>]';


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
    var files,
        opts,
        cmd;

    //  Try to default editor. If not provided we'll rely on the open-editor
    //  module to look at environment instead.
    this.options.editor = this.options.editor || CLI.getcfg('cli.open.editor');

    //  Process all file references provided, expanding any virtual paths.
    cmd = this;
    files = this.options._.slice(1).map(function(file) {
        return cmd.getExpandedPath(file);
    });

    opts = {};
    if (this.options.editor) {
        opts.editor = this.options.editor;
    }

    open(files, opts);
};

/**
 */
Cmd.prototype.getExpandedPath = function(target) {
    var parts;

    if (/:/.test(target)) {
        parts = target.split(':');
        parts[0] = CLI.expandPath(parts[0]);
        return parts.join(':');
    }
    return CLI.expandPath(target);
};


module.exports = Cmd;

}());
