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

(function() {

'use strict';

var CLI = require('./_cli');

//  ---
//  Type Construction
//  ---

var Parent = require('./_cmd');

var Cmd = function(){};
Cmd.prototype = new Parent();


/**
 * Command argument parsing options.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        boolean: ['link'],
        default: {
            link: false
        }
    },
    Parent.prototype.PARSE_OPTIONS);


//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
    'Initializes a TIBET project, linking and installing all dependencies.';


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet init [--link]';


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
    var cmd;    // Closure'd var providing access to the command object.

    cmd = this;

    sh = require('shelljs');
    child = require('child_process');

    // We can only start if we're in a top-level Node.js project directory.
    if (!sh.test('-f', 'package.json')) {
        this.error(
            'Cannot init. No package.json found. Are you in a project?');
        return 1;
    }

    // If the node_modules directory doesn't exist (but we know there's a
    // package.json due to earlier check) it means 'npm install' was never run.
    // We have to do that before we can try to start the server.
    if (sh.test('-e', 'node_modules')) {
        this.warn('Project already initialized. ' +
            'Re-initialize by removing node_modules first.');
        // TODO: add a force option
        return 1;
    }

    this.warn('Project not initialized. Initializing.');

    if (this.argv.link === true) {

        // For reasons largely due to how the CLI needs to operate (and
        // until the code is part of the global npm package install) we
        // also need an internal link to the tibet 5.0 platform.
        cmd.warn('TIBET v5.0 required. Trying `npm link tibet`.');

        child.exec('npm link tibet', function(err, stdout, stderr) {
            if (err) {
                cmd.error('Failed to initialize: ' + stderr);
                cmd.info(
                    '`git clone` TIBET 5.x, `npm link` it, and retry.');
                throw new Error();
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
                    throw new Error();
                }

                cmd.info('Project initialized successfully.');
            });
        });

    } else {

        cmd.info('Installing project dependencies via `npm install`.');

        child.exec('npm install', function(err, stdout, stderr) {
            if (err) {
                cmd.error('Failed to initialize: ' + stderr);
                throw new Error();
            }

            // If initialization worked invoke startup function.
            cmd.info('Project initialized successfully.');
        });
    }
};

module.exports = Cmd;

}());
