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
Cmd.CONTEXT = CLI.CONTEXTS.ANY;


//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Outputs quick getting started information for new TIBET users.\n';

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
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var str =
'\nWelcome to TIBET! This quickstart content is intended to get you up and running\n' +
'with a minimum of overhead so we\'ll be working with a limited set of commands\n' +
'and using their default options. Once you\'re done, check out the development wiki\n' +
'at https://github.com/TechnicalPursuit/TIBET/wiki to dive deeper into TIBET.\n\n' +

'CREATE A NEW PROJECT\n\n' +

'The \'tibet clone\' command is your first step in creating a TIBET project.\n\n' +

'Before using clone navigate to a directory to hold your new project content\n' +
'and select a name for your new project. The name will be used as a directory\n' +
'name so it should be a valid directory name on your platform.\n\n' +
'Type \'tibet clone {appname}\', replacing {appname} with your project name:\n\n' +

'    $ tibet clone test\n' +
'    TIBET dna \'default\' cloned to test as app \'test\'.\n\n' +

'INITIALIZE THE PROJECT\n\n' +

'With your new project in place you need to initialize it to install any code\n' +
'dependencies specific to the template you cloned (we used the default here).\n' +
'Navigate to your project and then type \'tibet init\' to initialize it:\n\n' +

'    $ cd test\n' +
'    $ tibet init\n' +
'    Initializing new default project...\n' +
'    installing project dependencies via `npm install`.\n' +
'    Project initialized successfully.\n\n' +


'START THE DEMO SERVER\n\n' +

'The \'default\' template used by clone includes a simple Node.js-based HTTP\n' +
'server we call the TIBET Data Server or TDS. By default the TDS will use\n' +
'port 1407 so assuming that port isn\'t busy on your system you can start the\n' +
'server using \'tibet start\' without any parameters:\n\n' +

'    $ tibet start\n' +
'    Starting server at http://127.0.0.1:1407/index.html\n\n' +
'Congratulations! Your new TIBET project is running. Open the web address\n' +
'for your project in an HTML5 browser and you should see text directing you\n' +
'on how to take the next step in your TIBET journey.\n\n' +

'For more info visit http://github.com/TechnicalPursuit/TIBET/wiki.\n';

    this.info(str);
};


module.exports = Cmd;

}());
