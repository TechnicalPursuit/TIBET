//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet start' command. Starts any local TIBET Data Server
 *     which might exist, or simply runs 'npm start' to start any process
 *     associated with npm via the current package.json file.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0 */

(function() {

'use strict';

var CLI,
    Cmd,
    TDS;

//  Bring in the TDS code so we can reference command line options.
TDS = require('../../../tds/tds_base');

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
Cmd.CONTEXT = CLI.CONTEXTS.PROJECT;

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'start';

//  ---
//  Instance Attributes
//  ---

/**
 * Command argument parsing options.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    CLI.blend({}, TDS.PARSE_OPTIONS),       //  we use the TDS's list here so
    Cmd.Parent.prototype.PARSE_OPTIONS);    //  we create a 'copy' first.

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet start [--env <name>] [<tds options>]';


//  ---
//  Instance Methods
//  ---

/**
 * Runs the command. For this type the goal is to provide easy startup of the
 * local TIBET server.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var sh,     // The shelljs module.
        child,  // The child_process module.
        args,   // Argument list for child process.
        server, // Spawned child process for the server.
        noop,   // Empty hook function to trigger signal passing to client.
        cmd,    // Closure'd var providing access to the command object.
        inuse,  // Flag to trap EADDRINUSE exceptions.
        msg,    // Shared message content.
        url;    // Url for file-based launch messaging.

    cmd = this;

    sh = require('shelljs');
    child = require('child_process');

    if (CLI.inProject() && !CLI.isInitialized()) {
        return CLI.notInitialized();
    }

    // Make sure we work from the launch (and hence server.js) location.
    process.chdir(CLI.getAppHead());

    if (!sh.test('-f', 'server.js')) {
        // If there's no server.js assume a 'noserver' template or 'couch'
        // template of some sort and default to opening the index.html.

        //  If we see electron.js and we can find an electron binary we can
        //  spawn it and fire up the electron engine.
        if (sh.test('-f', 'electron.js') && sh.which('electron')) {
            msg = 'Found electron.js. Launching Electron.';
            cmd.system(msg);
            server = child.spawn('electron', ['./electron.js']);
        } else {
            url = CLI.expandPath(CLI.getcfg('path.start_page'));
            msg = 'No server.js. Opening ' + url;
            cmd.system(msg);

            server = child.spawn('open', [url]);
        }
    } else {
        //  Capture the command line arguments and place server.js on the front.
        //  This essentially becomes the command line for a new 'node' command.
        //  The slice() here removes the command name ('start').
        args = this.getArglist().slice(1);
        args.unshift('server.js');

        //  Create and invoke the command to run the server.
        server = child.spawn('node', args);
    }

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

    server.on('close', function(code) {
        if (code !== 0) {
            cmd.error('stopped with status: ' + code);
            /* eslint-disable no-process-exit */
            // exit with status code so command line sees proper exit code.
            process.exit(code);
            /* eslint-enable no-process-exit */
        }
    });

    //  NOTE that by registering here in the parent we end up with transmission
    //  to the client process. See server.js for the actual handler logic.
    noop = function() {
        return;
    };
    process.on('SIGINT', noop);
    process.on('SIGHUP', noop);
    process.on('SIGQUIT', noop);
    process.on('SIGTERM', noop);
    process.on('exit', noop);

    return 0;
};

module.exports = Cmd;

}());
