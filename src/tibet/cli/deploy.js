//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet deploy' command. Searches for shipitjs-related files
 *     and invokes them if found, otherwise searches for a 'deploy' target in
 *     TIBET's makefile.js for the current project and invokes that if found.
 */
//  ========================================================================

/* eslint indent:0 */

(function() {

'use strict';

var CLI,
    path,
    sh,
    Parent,
    Cmd;

CLI = require('./_cli');
path = require('path');
sh = require('shelljs');


//  ---
//  Type Construction
//  ---

Parent = require('./_cmd');

Cmd = function() {};
Cmd.prototype = new Parent();


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
 * The name of the Shipit executable we look for to confirm installation.
 * @type {string}
 */
Cmd.SHIPIT_COMMAND = 'shipit';

/**
 * The name of the Shipit configuration file used to confirm that Shipit has
 * been enabled for the current project.
 * @type {string}
 */
Cmd.SHIPIT_FILE = 'shipitfile.js';

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet deploy [options]';


//  ---
//  Instance Methods
//  ---

/**
 * Runs the deploy command, checking for shipit-related support and then
 * makefile.js support in that order.
 * @returns {Number} A return code.
 */
Cmd.prototype.execute = function() {

    var shipitpath,
        command;

    this.debug('checking for shipitjs support...');
    if (sh.which(Cmd.SHIPIT_COMMAND)) {

        this.debug('found shipit command...');

        shipitpath = path.join(CLI.getAppHead(), Cmd.SHIPIT_FILE);
        if (sh.test('-e', shipitpath)) {
            //  Found shipit and shipitfile.js. Delegate to those.
            this.debug('found shipit file...');
            return this.executeViaShipit();
        } else {
            this.debug('no shipit file found...');
        }
    }

    this.debug('checking for makefile.js target...');

    command = 'deploy';
    if (this.getMakeTargets().indexOf('deploy') !== -1) {
        this.warn('Delegating to \'tibet make ' + command + '\'');
        return CLI.runViaMake(command);
    }

    this.warn('No deploy shipit support or makefile target found.');

    return 0;
};


/**
 * Runs the deploy by activating the Shipit executable.
 * @returns {Number} A return code.
 */
Cmd.prototype.executeViaShipit = function() {
    var cmd,
        proc,
        child,
        args,
        target;

    cmd = this;
    args = this.getArgv();
    target = args[0];

    proc = require('child_process');

    if (target) {
        this.warn('Delegating to \'shipit ' + target + ' deploy\'');
    } else {
        this.error('No shipit environment specified.');
        return 1;
    }

    args.push('deploy');

    child = proc.spawn(sh.which(Cmd.SHIPIT_COMMAND), args);

    child.stdout.on('data', function(data) {
        var msg;

        if (CLI.isValid(data)) {
            // Copy and remove newline.
            msg = data.slice(0, -1).toString('utf-8');

            cmd.log(msg);
        }
    });

    child.stderr.on('data', function(data) {
        var msg;

        if (CLI.notValid(data)) {
            msg = 'Unspecified error occurred.';
        } else {
            // Copy and remove newline.
            msg = data.slice(0, -1).toString('utf-8');
        }

        // Some leveraged module likes to write error output with empty lines.
        // Remove those so we can control the output form better.
        if (msg && typeof msg.trim === 'function' && msg.trim().length === 0) {
            return;
        }

        // A lot of errors will include what appears to be a common 'header'
        // output message from events.js:72 etc. which provides no useful
        // data but clogs up the output. Filter those messages.
        if (/throw er;/.test(msg)) {
            return;
        }

        cmd.error(msg);
    });

    child.on('close', function(code) {
        var msg;

        if (code !== 0) {
            msg = 'Execution stopped with status: ' + code;
            if (!cmd.options.debug || !cmd.options.verbose) {
                msg += ' Retry with --debug --verbose for more information.';
            }
            cmd.error(msg);
        }

        /* eslint-disable no-process-exit */
        process.exit(code);
        /* eslint-enable no-process-exit */
    });
};


/**
 * Returns a list of custom make targets found in any TIBET-style `makefile` for
 * the current project.
 * @returns {Array.<string>} The list of targets.
 */
Cmd.prototype.getMakeTargets = function() {
    var targets,
        cmds;

    cmds = [];

    // Note that despite the name this isn't a list of targets in the form we're
    // looking for here. We want target names, this is a handle to the wrapper
    // object whose 'methods' define the targets.
    targets = CLI.getMakeTargets();
    if (!targets) {
        return cmds;
    }

    Object.keys(targets).forEach(function(target) {
        if (typeof targets[target] === 'function') {
            cmds.push(target);
        }
    });
    cmds.sort();

    return cmds;
};


module.exports = Cmd;

}());
