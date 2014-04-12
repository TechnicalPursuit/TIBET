/**
 * @overview The 'tibet start' command.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

;(function() {

//  ---
//  Type Construction
//  ---

var parent = require('./_cmd');

var Cmd = function(){};
Cmd.prototype = new parent();


//  ---
//  Instance Attributes
//  ---

/**
 * The default TIBET port.
 * @type {number}
 */
Cmd.prototype.PORT = 1407;      // Reserved by us in another lifetime.


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet start [--port {{port}}]';


//  ---
//  Instance Methods
//  ---

/**
 * Runs the command. For this type the goal is to provide easy startup of the
 * local TIBET server.
 */
Cmd.prototype.execute = function() {

    var sh;     // The shelljs module.
    var child;  // The child_process module.

    var server; // Spawned child process for the server.
    var cmd;    // Closure'd var providing access to the command object.
    var func;   // The startup function used either sync or async.
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
        process.exit(1);
    }

    // If the node_modules directory doesn't exist (but we know there's a
    // package.json due to earlier check) it means 'npm install' was never run.
    // We have to do that before we can try to start the server.
    if (!sh.test('-e', 'node_modules')) {
        this.error('Project not initialized. Run `tibet init` first.');
        process.exit(1);
    }

    // Determine the port the user wants to start on.
    port = this.argv.port ||
        process.env.npm_package_config_port ||
        process.env.PORT ||
        this.PORT;

    msg = 'Starting server on port: ' + port;

    // If we can't find server.js our only option is to use npm start. If we
    // have port information on our command line we've got to use options.
    if (!sh.test('-f', 'server.js')) {
        cmd.system(msg + ' via `npm start`');
        process.env.PORT = port;
        server = child.spawn('npm', ['start']);
    } else {
        cmd.system(msg);
        server = child.spawn('node',
            ['server.js', '--port', port]);
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
