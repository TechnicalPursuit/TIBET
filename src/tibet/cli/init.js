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


//  ---
//  Type Attributes
//  ---

/**
 * The context viable for this command.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;


//  ---
//  Instance Attributes
//  ---

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


/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Initializes a TIBET project, linking and installing dependencies.\n\n' +

'This command must be run prior to most activity within a TIBET\n' +
'project. Many of the TIBET cli commands will fail to run until\n' +
'you have run a \'tibet init\' command.\n\n' +

'The optional link parameter will use \'npm link tibet\' to link\n' +
'TIBET into the project rather than attempting to install it via\n' +
'the current npm package.\n\n' +

'--link is useful/necessary when you are working with a copy of\n' +
'TIBET cloned from the public repository. For --link to work\n' +
'properly you need to have a local TIBET repository and you need\n' +
'to have run \'npm link .\' in that repository prior to tibet init.\n';


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
    var dna;

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

    dna = this.getcfg('tibet.dna');
    if (CLI.notEmpty(dna)) {
        dna = dna.slice(dna.lastIndexOf('/') + 1);
        cmd.info('Initializing new ' + dna + ' project...');
    } else {
        cmd.info('Initializing new project...');
    }

    if (this.options.link === true) {

        // For reasons largely due to how the CLI needs to operate (and
        // until the code is part of the global npm package install) we
        // also need an internal link to the tibet 5.0 platform.
        cmd.log('linking TIBET dynamically via `npm link tibet`.');

        child.exec('npm link tibet', function(err, stdout, stderr) {
            if (err) {
                cmd.error('Failed to initialize: ' + stderr);
                cmd.warn(
                    '`git clone` TIBET 5.x, `npm link .` it, and retry.');
                throw new Error();
            }

            cmd.log('TIBET development dependency linked successfully.');

            // Ensure npm install is run once we're sure the things that
            // need to be 'npm link'd into place have been. If we don't
            // do this last it'll just fail.
            cmd.log('installing additional dependencies via `npm install`.');

            child.exec('npm install', function(err, stdout, stderr) {
                if (err) {
                    cmd.error('Failed to initialize: ' + stderr);
                    throw new Error();
                }

                cmd.info('Project initialized successfully.');
            });
        });

    } else {

        cmd.log('installing project dependencies via `npm install`.');

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
