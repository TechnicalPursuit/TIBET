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

//  We use the TDS's list here so we create a 'copy' and add to it.
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    CLI.blend({
        boolean: ['debugger']
    }, TDS.PARSE_OPTIONS),
Cmd.Parent.prototype.PARSE_OPTIONS);

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet start [--env <name>] [--debug] [--level=[\'all\'|\'trace\'|\'debug\'|\'info\'|\'warn\'|\'error\'|\'fatal\'|\'system\'|\'off\']] [--debugger] [--port N] [--color[=true|false]] [--no-color] [--https] [--https_port N] [<options>]';

//  ---
//  Instance Methods
//  ---

/**
 * Runs the command. For this type the goal is to provide easy startup of the
 * local TIBET server.
 * @returns {Number|Promise} The return code produced by running the command (a
 *     non-zero indicates an Error) or a Promise that resolves when the command
 *     finishes.
 */
Cmd.prototype.execute = function() {

    var sh,             //  The shelljs module.
        child,          //  The child_process module.
        ChromeLauncher, //  The module that launches Chrome for debugging.
        args,           //  Argument list for child process.
        nodeargs,       //  Subset of arglist that are node-specific.
        serverargs,     //  Subset of arglist that are server-specific.
        server,         //  Spawned child process for the server.
        noop,           //  Empty hook function to trigger signal passing to
                        //  client.
        cmd,            //  Closure'd var providing access to the command
                        //  object.
        inuse,          //  Flag to trap EADDRINUSE exceptions.
        msg,            //  Shared message content.
        url;            //  Url for file-based launch messaging.

    cmd = this;

    if (CLI.inProject() && !CLI.isInitialized()) {
        return CLI.notInitialized();
    }

    sh = require('shelljs');
    child = require('child_process');
    ChromeLauncher = require('chrome-launcher');

    // Make sure we work from the launch (and hence server.js) location.
    process.chdir(CLI.getAppHead());

    //  If we see electron.js delegate to the electron command....
    if (sh.test('-f', 'electron.js')) {
        msg = 'Found electron.js...\nRunning \'tibet electron\'...';
        cmd.system(msg);

        args = process.argv.slice(3);
        return CLI.runCommand('electron' +
            (args ? ' ' + args.join(' ') : ''),
            CLI.joinPaths(__dirname, 'electron.js'));
    }

    //  If there's no server.js test to see if Electron is available.
    if (!sh.test('-f', 'server.js')) {
        msg = 'No server.js found...';
        cmd.warn(msg);

        url = CLI.expandPath(CLI.getcfg('project.start_page'));
        msg = 'Trying project.start_page via \'open\': ' + url;
        cmd.system(msg);

        server = child.spawn('open', [url]);

    } else {

        //  The slice() here removes the command name ('start').
        args = this.getArgv().slice(1);

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
            nodeargs.push('--inspect-brk');

            //  Auto-launch Chrome to connect to debugger.
            ChromeLauncher.launch({
                chromeFlags: ['--auto-open-devtools-for-tabs']
            });
        }

        args = nodeargs.slice(0);
        args.push('server.js');
        args = args.concat(serverargs);

        if (nodeargs.length !== 0) {
            cmd.system('node ' + args.join(' '));
        }

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

    server.on('exit', function(code) {
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
