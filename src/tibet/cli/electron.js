//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'electron' command. Checks for an electron.js file and will
 *     try to start electron for you. Also invoked by 'tibet start' when no
 *     server.js file is found but an electron.js file is found in a project.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0 */

(function() {

'use strict';

var CLI,
    Cmd,
    nodecli,
    ChromeLauncher;

CLI = require('./_cli');
nodecli = require('shelljs-nodecli');

ChromeLauncher = require('chrome-launcher');

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
Cmd.NAME = 'electron';

/**
 * The TIBET logo in ASCII-art form.
 * @type {String}
 */
/* eslint-disable quotes */
Cmd.LOGO = "\n" +
    "                            ,`\n" +
    "                     __,~//`\n" +
    "  ,///,_       .~///////'`\n" +
    "      '//,   ///'`\n" +
    "         '/_/'\n" +
    "           `\n" +
    "   /////////////////     /////////////// ///\n" +
    "   `//'````````///      `//'```````````  '''\n" +
    "   ,/`          //      ,/'\n" +
    "  ,/___          /'    ,/_____\n" +
    " ///////;;,_     //   ,/////////;,_\n" +
    "          `'//,  '/            `'///,_\n" +
    "              `'/,/                '//,\n" +
    "                 `/,                  `/,\n" +
    "                   '                   `/\n" +
    "                                        '/\n" +
    "                                         /\n" +
    "                                         '\n";
/* eslint-enable: quotes, no-multi-str */

//  ---
//  Instance Attributes
//  ---

/**
 * Command argument parsing options.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    CLI.blend({
        boolean: ['debugger', 'devtools', 'empty']
    }, CLI.PARSE_OPTIONS),
Cmd.Parent.prototype.PARSE_OPTIONS);

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet electron [<path>|--empty] [--debugger] [--devtools] [<electron options>]';

//  ---
//  Instance Methods
//  ---

/**
 * Runs the command.
 * @returns {Number|Promise} The return code produced by running the command (a
 *     non-zero indicates an Error) or a Promise that resolves when the command
 *     finishes.
 */
Cmd.prototype.execute = function() {

    var sh,         // The shelljs module.
        child,      // The child_process module.
        args,       // Argument list for child process.
        cmd,        // Closure'd var providing access to the command object.
        noop,       // Empty no-operation function.
        msg;        // Shared message content.

    cmd = this;

    if (CLI.inProject() && !CLI.isInitialized()) {
        return CLI.notInitialized();
    }

    sh = require('shelljs');
    child = require('child_process');

    // Make sure we work from the launch (and hence server.js) location.
    process.chdir(CLI.getAppHead());

    cmd.system(Cmd.LOGO);

    //  Need our electron.js file
    if (!sh.test('-f', 'electron.js')) {
        msg = 'No electron.js file found. Is this a TIBET electron project?';
        cmd.warn(msg);
    }

    //  ---
    //  start electron process...
    //  ---

    args = this.getArgv();

    //  If we're coming from 'tibet start' adjust to 'tibet electron'
    if (args && args[0] === 'start') {
        args[0] = 'electron';
    }

    //  make sure there's at least a '.' on the command line for what to
    //  launch or electron won't actually try to load a file.
    args.splice(1, 0, '.');

    //  If our TIBET-style debugger flag is set push on inspection arguments.
    if (this.options.debugger) {
        args.push('--inspect-brk');

        //  Auto-launch Chrome to connect to debugger.
        ChromeLauncher.launch({
            chromeFlags: ['--auto-open-devtools-for-tabs']
        });
    }

    //  NB: all other Electron options will be passed along to Electron except
    //  for 'devtools'. Due to our desire to control spawing DevTools, we want
    //  control. So we splice out the 'devtools' flag and substitute 'dev'.
    if (this.options.devtools) {
        args.splice(args.indexOf('--devtools'));
        args.push('--dev');
    }

    //  If we want 'empty', then just launch a plain Electron window.
    if (this.options.empty) {
        args = ['electron'];
    }

    //  Tell nodecli we want to run async (and silent to avoid dup messages).
    args.push({async: true, silent: true});

    cmd.debug('Invoking via: ' + CLI.beautify(args));

    //  Try electron's default of running 'electron .' via npm...
    child = nodecli.exec.apply(nodecli, args);

    //  ---
    //  set up process 'on' handlers
    //  ---

    if (child.stdout) {
        child.stdout.on('data', function(data) {
            var logmsg;

            // Why the '' + ?. Copy/convert the string for output.
            logmsg = '' + data;
            cmd.log(logmsg);
        });

        child.stderr.on('data', function(data) {
            var logmsg;

            // Why the '' + ?. Copy/convert the string for output.
            logmsg = '' + data;

            // Ignore any empty lines.
            if (logmsg.trim().length === 0) {
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

        child.on('exit', function(code) {
            if (code !== 0) {
                cmd.error('stopped with status: ' + code);
                // exit with status code so command line sees proper exit code.
                return CLI.exitSoon(code);
            }
        });
    }

    //  Register these so a Ctrl-C etc. won't exit with an error code.
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
