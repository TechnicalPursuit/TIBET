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
Cmd.DEFAULT_RUNNER = './tst/phantomtsh.js';


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
        boolean: ['ignore_only', 'ignore_defer'],
        string: ['target'],
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
    var cmd;        // Local binding variable.

    path = require('path');
    sh = require('shelljs');
    child = require('child_process');

    // Run phantomjs with a manufactured command line which reflects the :test
    // command we'd run if we were in the TIBET Shell environment.

    testpath = CLI.expandPath(
        path.join('~/node_modules/tibet3/', Cmd.DEFAULT_RUNNER));
    if (!sh.test('-e', testpath)) {
        this.log('cannot find runner at: ' + testpath);
        return;
    }

    cmd = this;

    process = child.spawn('phantomjs', [testpath,
        '--profile', '~app/tst/phantom',
        '--script', ':test -ignore_only']);

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
