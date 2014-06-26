/**
 * @overview The 'tibet test' command.
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
//  Type Attributes
//  ---

/**
 * The default path to the TIBET-specific phantomjs test runner.
 * @type {String}
 */
Cmd.DEFAULT_RUNNER = './test/phantom/phantomtsh.js';


//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {String}
 */
Cmd.prototype.HELP =
    'Runs unit and functional tests for the library and application.';


/**
 * Command argument parsing options.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        boolean: ['ignore_only', 'ignore_skip'],
        string: ['script', 'profile'],
        default: {}
    },
    Parent.prototype.PARSE_OPTIONS);

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE = 'tibet test [options]';

//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 */
Cmd.prototype.execute = function() {

    var sh;         // The shelljs module.
    var child;      // The child_process module.
    var process;    // The spawned child process.
    var path;       // The path module.
    var testpath;   // Path to the TIBET test runner script.
    var profile;    // The test profile to use.
    var script;     // The test script to run.
    var cmd;        // Local binding variable.

    // We can run in the TIBET library, or in a project, but not in an
    // un-initialized project.
    if (CLI.inProject() && !CLI.isInitialized()) {
        return CLI.notInitialized();
    }

    path = require('path');
    sh = require('shelljs');
    child = require('child_process');

    cmd = this;

    // Verify we can find the test runner script.
    testpath = CLI.expandPath(path.join('~lib_root/', Cmd.DEFAULT_RUNNER));
    if (!sh.test('-e', testpath)) {
        this.log('cannot find runner at: ' + testpath);
        return;
    }

    if (CLI.notEmpty(this.argv.script)) {
        script = this.argv.script;
    }

    if (CLI.notEmpty(this.argv.profile)) {
        profile = this.argv.profile;
    }

    if (CLI.inProject()) {
        script = script || ':test';
        profile = profile || '~app/test/phantom';
    } else {
        script = script || ':test -ignore_only';
        profile = profile || '~lib/test/phantom/phantom';
    }

    // Run a manufactured tsh:test command just as we would in the TDC/Sherpa.
    process = child.spawn('phantomjs', [testpath,
        '--profile', profile,
        '--script', script]);

    process.stdout.on('data', function(data) {
        var msg = data.slice(0, -1);
        cmd.log(msg);
    });

    process.stderr.on('data', function(data) {
        var msg = data.slice(0, -1);

        // Somebody down below likes to write error output with empty lines.
        if (msg.trim().length === 0) {
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

    process.on('close', function(code) {
        if (code !== 0) {
            cmd.error('Testing stopped with status: ' + code);
        }
    });
};

module.exports = Cmd;

}());
