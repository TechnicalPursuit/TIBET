//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet tds' command. Provides simple utilities for interacting
 *     with the TIBET Data Server.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0 */

(function() {

'use strict';

var CLI,
    Cmd,
    TDS,
    sh;

CLI = require('./_cli');

//  Bring in the TDS code so we can reference command line options.
TDS = require('../../../tds/tds_base');

//  ---
//  Type Construction
//  ---

Cmd = function() {
    //  empty
};
Cmd.Parent = require('./_multi');
Cmd.prototype = new Cmd.Parent();

sh = require('shelljs');

//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.PROJECT;

/**
 * The command name for this type.
 * @type {String}
 */
Cmd.NAME = 'tds';


//  ---
//  Instance Attributes
//  ---

//  NOTE the parse options here are just for the 'tws' command itself.
//  Subcommands need to parse via their own set of options.

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    CLI.blend({}, TDS.PARSE_OPTIONS),       //  we use the TDS's list here so
    Cmd.Parent.prototype.PARSE_OPTIONS);    //  we create a 'copy' first.
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE = 'tibet tds start [--env <name>] [<tds options>]';


//  ---
//  Instance Methods
//  ---

/**
 */
Cmd.prototype.executeStart = function() {
    var child,      // The child_process module.
        args,       // Argument list for child process.
        nodeargs,   // Subset of arglist that are node-specific.
        serverargs, // Subset of arglist that are server-specific.
        version,    // The current Node version.
        server,     // Spawned child process for the server.
        cmd,        // Closure'd var providing access to the command object.
        inuse;      // Flag to trap EADDRINUSE exceptions.

    cmd = this;

    child = require('child_process');

    if (CLI.inProject() && !CLI.isInitialized()) {
        return CLI.notInitialized();
    }

    // Make sure we work from the launch (and hence server.js) location.
    process.chdir(CLI.getAppHead());

    if (!sh.test('-f', 'server.js')) {
        this.error('Server start failed. No server.js found.');
        return -1;
    }

    //  The slice() here removes the 'tds' and 'start' portions
    args = this.getArgv().slice(2);

    //  Process the list. We treat any args beginning with --node- as
    //  arguments to place _before_ the server.js command.
    nodeargs = args.filter(function(arg) {
        if (typeof arg === 'string') {
            return arg.indexOf('--node-') === 0;
        }
        return false;
    });
    nodeargs = nodeargs.map(function(arg) {
        return arg.replace('--node-', '--');
    });

    serverargs = args.filter(function(arg) {
        if (typeof arg === 'string') {
            return arg.indexOf('--node-') === -1;
        }
        return true;
    });

    //  Special handling for server/tds for aliases re: tds.log.level.
    if (this.options.debug) {
        serverargs.push('--tds.log.level', 'debug');
    } else if (this.options.level) {
        serverargs.push('--tds.log.level', this.options.level);
    }

    if (this.options.debugger && nodeargs.length === 0) {
        version = process.versions.node;
        if (parseInt(version.split('.'), 10) < 8) {
            nodeargs.push('--inspect', '--debug-brk');
        } else {
            nodeargs.push('--inspect-brk');
        }
    }

    args = nodeargs.slice(0);
    args.push('server.js');
    args = args.concat(serverargs);

    if (nodeargs.length !== 0) {
        cmd.system('node ' + args.join(' '));
    }

    //  Create and invoke the command to run the server.
    server = child.spawn('node', args);

    server.stdout.on('data', function(data) {
        var logmsg;

        // Why the '' + ?. Copy/convert the string for output.
        logmsg = '' + data;
        cmd.log(logmsg);
    });

    server.stderr.on('data', function(data) {
        var logmsg;

        // Why the '' + ?. Copy/convert the string for output.
        logmsg = '' + data;

        // Ignore any empty lines.
        if (logmsg.trim().length === 0) {
            return;
        }

        // If we've just trapped EADDRINUSE ignore what follows.
        if (inuse) {
            return;
        }

        // Most common error is that the port is in use. Trap that.
        if (/ADDRINUSE/.test(logmsg)) {
            // Set a flag so we don't dump a lot of unhelpful output.
            inuse = true;
            cmd.error('Server start failed. Port is busy.');
            return;
        }

        // A lot of errors will include what appears to be a common 'header'
        // output message from events.js:72 etc. which provides no useful
        // data but clogs up the output. Filter those messages.
        if (/throw er;/.test(logmsg) || /events\.js/.test(logmsg)) {
            if (cmd.getcfg('debug') && cmd.getcfg('verbose')) {
                cmd.error(logmsg);
            }
            return;
        }

        cmd.error(logmsg);
    });

    server.on('exit', function(code) {
        if (code !== 0) {
            cmd.error('Stopped with status: ' + code);
            /* eslint-disable no-process-exit */
            // exit with status code so command line sees proper exit code.
            process.exit(code);
            /* eslint-enable no-process-exit */
        }
    });
};

//  ---
//  Export
//  ---

module.exports = Cmd;

}());
