//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet quickstart' command. A simple command whose only goal
 *     is to output help on the steps to take after installation to get a new
 *     project up an running with a minimum of overhead.
 */
//  ========================================================================

/* eslint indent:0 */

(function() {

'use strict';

var CLI,
    Cmd;

CLI = require('./_cli');

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
Cmd.CONTEXT = CLI.CONTEXTS.ANY;

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'quickstart';

//  ---
//  Instance Attributes
//  ---

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet quickstart';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @returns {Number|Promise} The return code produced by running the command (a
 *     non-zero indicates an Error) or a Promise that resolves when the command
 *     finishes.
 */
Cmd.prototype.execute = function() {

    var str;

    str =
'\nWelcome to TIBET! This quickstart content is intended to get you up and running\n' +
'with a minimum of overhead so we\'ll be working with a limited set of commands\n' +
'and using their default options. Once you\'re done, check out the documentation\n' +
'at https://www.technicalpursuit.com/docs/index.html to dive deeper into TIBET.\n\n' +

'CREATE A NEW PROJECT\n\n' +

'The \'tibet clone\' command is your first step in creating a TIBET project.\n\n' +

'Before using \'clone\', navigate to a directory to hold your project content\n' +
'and select a name for your new project. The name will be used as a directory\n' +
'name so it should be a valid directory name on your platform.\n\n' +
'Type \'tibet clone {appname}\', replacing {appname} with your project name:\n\n' +

'    $ tibet clone hello\n' +
'    ...\n' +
'    Application DNA \'default\' cloned to ./hello as \'hello\'.\n' +
'    ...\n\n' +

'INITIALIZE THE PROJECT\n\n' +

'With your new project in place you need to initialize it to install any code\n' +
'dependencies specific to the template you cloned (we used the default above).\n' +
'Navigate to your project and then type \'tibet init\' to initialize it:\n\n' +

'    $ cd hello\n' +
'    $ tibet init\n' +
'    ...\n' +
'    project initialized successfully.\n' +
'    ...\n\n' +

'START THE APPLICATION\n\n' +

'All project DNA templates support using the \'tibet start\' command to run them.\n' +
'Electron projects will launch directly. TIBET Data Server (TDS) projects will\n' +
'start their Express-based NodeJS server (using HTTP on port 1407 by default):\n\n' +

'    $ tibet start\n' +
'    ...\n\n' +

'Congratulations! Your new TIBET project is running.\n\n' +

'For Electron projects your application is now running and ready for expansion.\n' +
'For TDS-based projects open the web address output by \'tibet start\' for your\n' +
'project in a supported HTML5 browser. All TIBET projects display launch text\n' +
'directing you on how to take the next step in your TIBET journey.\n\n' +

'For more info visit https://www.technicalpursuit.com\n';

    this.info(str);

    return 0;
};


module.exports = Cmd;

}());
