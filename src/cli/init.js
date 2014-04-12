/**
 * @overview The 'tibet init' command. Ensures any local tibet repositories are
 *     linked into place (for TIBET developers ;)) and that npm install is run
 *     to ensure any other dependencies are installed.
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
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet init';


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
    if (sh.test('-e', 'node_modules')) {
        this.warn('Project already initialized. ' +
            'Re-initialize by removing node_modules first.');
        process.exit(1);
    }

    this.warn('Project not initialized. Initializing.');

    // Complicated if we're still using two libs (tibet3 and tibet) and the
    // only way to be sure involves extra work. *sigh*.

    child.exec('npm ll --json', function(err, stdout, stderr) {
        var json;

        // Due to a current issue with npm ls variants they'll always return
        // an error if there are unmet dependencies. See issue filed at:
        // https://github.com/npm/npm/issues/4480.
        // if (err) {
        //     cmd.error('Unable to verify dependencies: ' + stderr);
        //     process.exit(1);
        // }

        // Instead of checking err above we'll check stdout.
        if (!stdout) {
            cmd.error('Unable to verify dependencies: ' + stderr);
            process.exit(1);
        }

        json = JSON.parse(stdout);
        cmd.debug(stdout);

        // NOTE that tibet3 is a short-term dependency while we port from the
        // older codebase into the new 5.0 repository.
        if (json.dependencies.tibet3) {
            cmd.warn('TIBET v3.0 required. Trying `npm link tibet3`.');

            child.exec('npm link tibet3', function(err, stdout, stderr) {
                if (err) {
                    cmd.error('Failed to initialize: ' + stderr);
                    cmd.info(
                        '`git clone` TIBET 3.x, `npm link` it, and retry.');
                    process.exit(1);
                }

                cmd.info('TIBET v3.0 linked successfully.');

                // For reasons largely due to how the CLI needs to operate (and
                // until the code is part of the global npm package install) we
                // also need an internal link to the tibet 5.0 platform.
                cmd.warn('TIBET v5.0 required. Trying `npm link tibet`.');

                child.exec('npm link tibet', function(err, stdout, stderr) {
                    if (err) {
                        cmd.error('Failed to initialize: ' + stderr);
                        cmd.info(
                            '`git clone` TIBET 5.x, `npm link` it, and retry.');
                        process.exit(1);
                    }

                    cmd.info('TIBET v5.0 linked successfully.');

                    // Ensure npm install is run once we're sure the things that
                    // need to be 'npm link'd into place have been. If we don't
                    // do this last it'll just fail.
                    cmd.info(
                        'Installing project dependencies via `npm install`.');

                    child.exec('npm install', function(err, stdout, stderr) {
                        if (err) {
                            cmd.error('Failed to initialize: ' + stderr);
                            process.exit(1);
                        }

                        cmd.info('Project initialized successfully.');
                    });
                });
            });

        } else {

            cmd.info('Installing project dependencies via `npm install`.');

            child.exec('npm install', function(err, stdout, stderr) {
                if (err) {
                    cmd.error('Failed to initialize: ' + stderr);
                    process.exit(1);
                }

                // If initialization worked invoke startup function.
                cmd.info('Project initialized successfully.');
            });
        }
    });
};

module.exports = Cmd;

}());
