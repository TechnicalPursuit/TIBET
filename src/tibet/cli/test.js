//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet test' command. Runs phantomjs via TIBET's phantomtsh
 *     script runner. The script run is typically the TSH script ':test' which
 *     will run the tsh:test command tag to invoke all test suites.
 */
//  ========================================================================

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
//  Type Attributes
//  ---


/**
 * The context viable for this command.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;


/**
 * The default path to the TIBET-specific phantomjs test runner.
 * @type {String}
 */
Cmd.DEFAULT_RUNNER = '~lib_tst/phantom/phantomtsh.js';


//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {String}
 */
Cmd.prototype.HELP =
'Runs the TIBET phantomtsh test runner to test your application.\n\n' +

'The default operation makes use of ~app_test/phantom.xml as the\n' +
'boot.profile (which controls what code is loaded) and a TSH shell\n' +
'command of \':test\' which will run all test suites in the profile.\n\n' +

'Output is to the terminal in colorized TAP format by default.\n' +
'Future versions will support additional test output formatters.\n\n' +

'Changing the boot profile is not normally required however you\n' +
'can easily test components simply by naming them via the --script\n' +
'parameter. For example, you can run all String tests via:\n\n' +

'tibet test --script \':test String\'\n';


/**
 * Command argument parsing options.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        boolean: ['selftest'],
        string: ['script', 'profile'],
        default: {}
    },
    Parent.prototype.PARSE_OPTIONS);

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE =
    'tibet test [--profile <url>] [--params <params>] [--script <tsh>]';

//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 */
Cmd.prototype.execute = function() {

    var sh;         // The shelljs module.
    var proc;       // The child_process module.
    var child;      // The spawned child process.
    var testpath;   // Path to the TIBET test runner script.
    var profile;    // The test profile to use.
    var script;     // The test script to run.
    var cmd;        // Local binding variable.
    var arglist;    // Array of parameters to spawn.

    // We can run in the TIBET library, or in a project, but not in an
    // un-initialized project.
    if (CLI.inProject() && !CLI.isInitialized()) {
        return CLI.notInitialized();
    }

    sh = require('shelljs');
    proc = require('child_process');

    cmd = this;

    // Verify we can find the test runner script.
    testpath = CLI.expandPath(Cmd.DEFAULT_RUNNER);
    if (!sh.test('-e', testpath)) {
        this.error('Cannot find runner at: ' + testpath);
        return;
    }

    if (CLI.notEmpty(this.options.script)) {
        script = this.options.script;
    }

    if (CLI.isValid(this.options.selftest)) {
        profile = '~lib/test/phantom/phantom#selftest';
    } else if (CLI.notEmpty(this.options.profile)) {
        profile = this.options.profile;
    }

    if (CLI.inProject()) {
        script = script || ':test';
        profile = profile || '~app/test/phantom';
    } else {
        script = script || ':test -ignore_only';
        profile = profile || '~lib/test/phantom/phantom';
    }

    arglist = [testpath, '--profile', profile, '--script', script];
    if (CLI.notEmpty(this.options.params)) {
        arglist.push('--params', this.options.params);
    }

    // Run a manufactured tsh:test command just as we would in the TDC/Sherpa.
    child = proc.spawn('phantomjs', arglist);

    child.stdout.on('data', function(data) {
        // Copy and remove newline.
        var msg = data.slice(0, -1);
        cmd.log(msg);
    });

    child.stderr.on('data', function(data) {
        // Copy and remove newline.
        var msg = data.slice(0, -1);

        // Somebody down below likes to write error output with empty lines.
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
        if (code !== 0) {
            cmd.error('Testing stopped with status: ' + code);
        }
        process.exit(code);
    });
};

module.exports = Cmd;

}());
