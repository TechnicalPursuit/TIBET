/**
 * @overview The 'tibet start' command. Starts any local TIBET development
 *     server which might exist, or simply runs 'npm start' to start any
 *     process associated with npm via the current package.json file.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

'use strict';

var CLI = require('./_cli');


//  ---
//  Type Construction
//  ---

var Parent = require('./_cmd');

var Cmd = function(){};
Cmd.prototype = new Parent();


//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Starts the current TIBET project development server, if any.\n\n' +

'Many TIBET dna templates provide a simple Node.js-based server\n' +
'based on Connect and/or Express for use during development. If\n' +
'the current project contains either a server.js file or can invoke\n' +
'\'npm start\' this command will try to start that server.\n\n' +
'The optional --port parameter lets you specify a port other than\n' +
'the default (which is port 1407).\n\n' +
'When a local server.js file is used it can be augmented with code\n' +
'for TIBET Development Server (TDS) functionality. Use require()\n' +
'with a path of \'tibet/etc/tds-middleware\' to load that module.\n\n' +
'If your server includes TDS features you can optionally add\n' +
'command-line parameters to provide the various modules of the TDS\n' +
'with config data. Use \'tds-{module}\' plus \'-{var}\' in these\n' +
'cases, replacing {var} with the config variable you need. As an\n' +
'example \'--tds-watch-root\' provides the tds file watch module\n' +
'with the root path to watch for source code changes.\n';

/**
 * The default TIBET port.
 * @type {number}
 */
Cmd.prototype.PORT = 1407;      // Reserved by us in another lifetime.


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet start [--port <port>] [<tds options>]';


//  ---
//  Instance Methods
//  ---

/**
 * Runs the command. For this type the goal is to provide easy startup of the
 * local TIBET server.
 * @return {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var sh;     // The shelljs module.
    var child;  // The child_process module.

    var server; // Spawned child process for the server.
    var cmd;    // Closure'd var providing access to the command object.
    var port;   // The port number to start up on.
    var inuse;  // Flag to trap EADDRINUSE exceptions.
    var msg;    // Shared message content.

    cmd = this;

    sh = require('shelljs');
    child = require('child_process');

    // We can only start if we're in a top-level Node.js project directory.
    if (!sh.test('-f', 'package.json')) {
        this.error(
            'Cannot start. No package.json found. Are you in a project?');
        return 1;
    }

    if (!CLI.isInitialized() && !CLI.inLibrary()) {
        return CLI.notInitialized();
    }

    // Determine the port the user wants to start on.
    port = CLI.getcfg('port') ||
        CLI.getcfg('tds.port') ||
        process.env.npm_package_config_port ||
        process.env.PORT ||
        this.PORT;

    msg = 'Starting server on port: ' + port;

// TODO:    process command line arguments such that we can add them to the
//          array of parameters given to spawn() calls below.

    // If we can't find server.js our only option is to use npm start. If we
    // have port information on our command line we've got to use options.
    if (!sh.test('-f', 'server.js')) {
        process.env.PORT = port;
        server = child.spawn('npm', ['start']);
    } else {
        cmd.system(msg);
        server = child.spawn('node',
            ['server.js', '--port', port,
                '--app-root', CLI.getAppRoot()]);
    }

    server.stdout.on('data', function(data) {
        // Why the '' + ?. Apparently to 'copy' the string :)
        var msg = '' + data;
        cmd.log(msg);
    });

    server.stderr.on('data', function(data) {
        // Why the '' + ?. Apparently to 'copy' the string :)
        var msg = '' + data;

        // Somebody down below likes to write error output with empty lines.
        if (msg.trim().length === 0) {
            return;
        }

        // If we've just trapped EADDRINUSE ignore what follows.
        if (inuse) {
            return;
        }

        // Most common error is that the port is in use. Trap that.
        if (/ADDRINUSE/.test(msg)) {
            // Set a flag so we don't dump a lot of unhelpful output.
            inuse = true;
            cmd.error('Unable to start server. Port ' + port + ' is busy.');
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

    server.on('close', function(code) {
        if (code !== 0) {
            cmd.error('Server stopped with status: ' + code);
        }
    });
};

module.exports = Cmd;

}());
