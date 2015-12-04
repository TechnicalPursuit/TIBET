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

/*eslint indent:0*/

(function() {

'use strict';

var CLI,
    Parent,
    Cmd,
    TDS;

//  Bring in the TDS code so we can reference command line options.
TDS = require('../../../etc/tds/tds-middleware');

CLI = require('./_cli');

//  ---
//  Type Construction
//  ---

Parent = require('./_cmd');

Cmd = function() {};
Cmd.prototype = new Parent();


//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;


//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Starts the current TIBET project data server, if available.\n\n' +

'Many TIBET dna templates provide a simple Node.js-based server. If\n' +
'the current project contains either a server.js file or can invoke\n' +
'\'npm start\' this command will try to start that server.\n\n' +

'The optional --env parameter lets you specify an environment setting\n' +
'such as `development` or `production`. The default is development.\n' +
'The current setting is announced in the server startup banner\n\n' +

'The --tds.port parameter lets you specify a port other than\n' +
'the registered TIBET Data Server port (which is port 1407).\n\n' +

'If your server includes TDS features you can optionally add\n' +
'command-line parameters to provide the various modules of the TDS\n' +
'with config data. All values for the tds are supported. See the\n' +
'output of `tibet config tds` for a list of current options.\n\n';

/**
 * Command argument parsing options.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    TDS.PARSE_OPTIONS,          //   NOTE we use the TDS's list here.
    Parent.prototype.PARSE_OPTIONS);

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
        cmd,    // Closure'd var providing access to the command object.
        inuse,  // Flag to trap EADDRINUSE exceptions.
        msg,    // Shared message content.
        url;    // Url for file-based launch messaging.

    cmd = this;

    sh = require('shelljs');
    child = require('child_process');

    if (!CLI.isInitialized() && !CLI.inLibrary()) {
        return CLI.notInitialized();
    }

    // Make sure we work from the launch (and hence server.js) location.
    process.chdir(CLI.getAppHead());

    if (!sh.test('-f', 'server.js')) {
        // If there's no server.js assume a 'noserver' template or 'couchdb'
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
        args = this.getArglist();
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
            cmd.error('Stopped with status: ' + code);
            /* eslint-disable no-process-exit */
            // exit with status code so command line sees proper exit code.
            process.exit(code);
            /* eslint-enable no-process-exit */
        }
    });
};

module.exports = Cmd;

}());
