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
    Cmd;


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
'Starts the current TIBET project data server, if any.\n\n' +

'Many TIBET dna templates provide a simple Node.js-based server\n' +
'based on Connect and/or Express for use during development. If\n' +
'the current project contains either a server.js file or can invoke\n' +
'\'npm start\' this command will try to start that server.\n\n' +

'The optional --port parameter lets you specify a port other than\n' +
'the default (which is port 1407).\n\n' +

'When a local server.js file is used it can be augmented with code\n' +
'for TIBET Data Server (TDS) functionality. Use require() with the\n' +
'path \'tibet/etc/tds/tds-middleware\' to load that module.\n\n' +

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
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var sh,     // The shelljs module.
        child,  // The child_process module.

        server, // Spawned child process for the server.
        cmd,    // Closure'd var providing access to the command object.
        port,   // The port number to start up on.
        inuse,  // Flag to trap EADDRINUSE exceptions.
        msg,    // Shared message content.
        url,    // Url for file-based launch messaging.
        indexpage,  // Config parameter for index page.
        index;  // URL to the index page.

    cmd = this;

    sh = require('shelljs');
    child = require('child_process');

    if (!CLI.isInitialized() && !CLI.inLibrary()) {
        return CLI.notInitialized();
    }

    // Determine the port the user wants to start on.
    port = CLI.getcfg('port') ||
        CLI.getcfg('tds.port') ||
        process.env.npm_package_config_port ||
        process.env.PORT ||
        this.PORT;

// TODO:    process command line arguments such that we can add them to the
//          array of parameters given to spawn() calls below.

    // Make sure we work from the launch (and hence server.js) location.
    process.chdir(CLI.getAppHead());

    // If there's no server.js assume a 'noserver' template or 'couchdb'
    // template of some sort and default to opening the index.html.
    if (!sh.test('-f', 'server.js')) {
        url = CLI.expandPath(CLI.getcfg('path.index_page'));
        msg = 'No server.js. Opening ' + url;
        cmd.system(msg);

        process.env.PORT = port;
        server = child.spawn('open',
            [CLI.expandPath(CLI.getcfg('path.index_page'))]);
    } else {
        // If possible try to output the actual page reference to the index
        // page. This helps with things like CouchDB template start output.
        indexpage = CLI.getcfg('path.index_page');
        if (CLI.notEmpty(indexpage)) {
            index = CLI.expandPath(CLI.getcfg('path.index_page'));
            index = index.replace(CLI.expandPath(CLI.getAppHead()), '');
        } else {
            index = '';
        }

        server = child.spawn('node',
            ['server.js', '--port', port,
                '--app-root', CLI.getAppRoot()]);
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
            cmd.error('Unable to start server. Port ' + port + ' is busy.');
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
