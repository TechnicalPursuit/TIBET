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
Cmd.NAME = 'open';


//  ---
//  Instance Attributes
//  ---

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'string': ['editor']
    },
    Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet open <vpath> [--editor <cmd>]';


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
        cmd,
        command,
        args,
        opts;

    this.options.editor = this.options.editor || CLI.getcfg('cli.open.editor');

    if (CLI.isEmpty(this.options.editor)) {
        this.error('Unsupported editor for open command: ' + this.options.editor);
        return -1;
    }

    command = this.getEditorCommand();
    if (CLI.isEmpty(command)) {
        this.error('Unable to determine command for editor: ' + this.options.editor);
        return -1;
    }

    args = this.getEditorArglist();

    opts = this.getEditorOptions();

    cp = require('child_process');
    child = cp.spawn(command, args, opts);

    cmd = this;
    child.stderr.on('data', function(data) {
        cmd.error('' + data);
    });

    child.unref();

    return 0;
};

/**
 */
Cmd.prototype.getEditorCommand = function() {
    var editor;

    editor = this.options.editor.toLowerCase();

    switch (editor) {
        case 'code':
        case 'vscode':
            return 'code';
        case 'vi':
        case 'vim':
            return 'vim';
        default:
            //  NOTE: this will often fail based on arglist variance but it will try.
            return 'open';
    }
};

/**
 */
Cmd.prototype.getEditorArglist = function() {
    var editor,
        method,
        cmd;

    editor = this.options.editor.toLowerCase();
    editor = editor.charAt(0).toUpperCase() + editor.slice(1);

    method = 'getArglistFor' + editor;
    if (typeof this[method] === 'function') {
        return this['getArglistFor' + editor]();
    }

    //  Default arglist. NOTE: this may not work for editor command.
    cmd = this;
    return this.options._.slice(1).map(function(target) {
        return cmd.getExpandedTarget(target);
    });
};

/**
 */
Cmd.prototype.getArglistForVim = function() {
    var cmd;

    cmd = this;
    return this.options._.slice(1).map(function(target) {
        return cmd.getExpandedTarget(target);
    });
};

/**
 *
 */
Cmd.prototype.getArglistForVscode = function() {
    var args,
        cmd,
        needsGoto;

    cmd = this;
    args = this.options._.slice(1).map(function(target) {
        var arg;

        arg = cmd.getExpandedTarget(target);
        if (arg.indexOf(':') !== -1) {
            needsGoto = true;
        }
        return arg;
    });

    args.unshift('--reuse-window');

    if (needsGoto) {
        //  VSCode requires --goto if there's line:char info, otherwise not.
        args.unshift('--goto');
    }

    return args;
};

/**
 */
Cmd.prototype.getEditorOptions = function() {
    var editor;

    editor = this.options.editor.toLowerCase();

    switch (editor) {
        case 'vi':
        case 'vim':
            //  Need terminal etc. for IO in vim. We
            //  retain stderr for reporting errors on startup.
            return {
                detached: true,
                stdio: ['inherit', 'inherit']
            }
        default:
            //  VSCode and other "apps" can ignore IO. We
            //  retain stderr for reporting errors on startup.
            return {
                detached: true,
                stdio: ['ignore', 'ignore']
            };
    }
};

/**
 */
Cmd.prototype.getExpandedTarget = function(target) {
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
