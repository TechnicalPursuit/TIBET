//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet clone' command. Clones application dna to create new
 *     applications.
 */
//  ========================================================================

/* eslint indent:0 */

(function() {

'use strict';

var CLI,
    Cmd,
    path;

CLI = require('./_cli');
path = require('path');

//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('./_dna');     // NOTE we inherit from 'dna' command.
Cmd.prototype = new Cmd.Parent();

//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.NONLIB;

/**
 * Where are the dna templates we should clone from? This value will be joined
 * with the current file's load path to create the absolute root path.
 * @type {string}
 */
Cmd.prototype.DNA_ROOT = CLI.joinPaths('..', '..', '..', '..', 'dna');

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'clone';

//  ---
//  Instance Attributes
//  ---

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE =
    'tibet clone [[--name] <name>] [[--dir] <dirname>|.] [--dna <template>]' +
    ' [--xmlns <nsuri>] [--list] [--force] [--update]';

//  ---
//  Instance Methods
//  ---

/**
 * Check arguments and configure default values prior to running prereqs.
 * @returns {Object}
 */
Cmd.prototype.configure = function() {
    var options,
        cwd;

    options = this.options;

    //  One special case has to be dealt with, in particular cloning to an
    //  exising directory via '.' as a parameter. That value is always treated
    //  as the value for 'dir' and any other positional parameter is
    //  treated as the name. So `tibet clone . foo` is --dir="." --name="foo".
    if (options._[1] === '.') {
        options.dir = options._[1];
        options.name = options._[2] || options.name;
    } else {
        options.name = options._[1] || options.name;
        options.dir = options._[2] || options.dir || './' + options.name;
    }

    cwd = CLI.getCurrentDirectory();

    //  If we're targeting the current directory we allow for scanning any
    //  existing project information for name and dna values.
    if (options.dir === '.') {
        if (!options.name) {
            if (CLI.inProject()) {
                options.name = CLI.cfg('npm.name');
            }

            if (!options.name) {
                options.name = path.basename(cwd);
            }
        }

        if (!options.dna) {
            //  Before we assume default dna check the project.
            if (CLI.inProject()) {
                options.dna = CLI.cfg('tibet.dna');
            }
        }
    }
    options.dna = options.dna || this.DNA_DEFAULT;

    options.xmlns = options.xmlns || this.configureXMLNS();

    options.year = new Date().getFullYear();

    this.trace('configure:\n' + CLI.beautify(JSON.stringify(options)));

    return options;
};


/**
 * Write a summary of what the command has done.
 */
Cmd.prototype.summarize = function() {
    var options;

    options = this.options;

    this.log('Application DNA \'' + path.basename(options.dna) +
        '\' cloned to ' + options.dir +
        ' as \'' + options.name + '\'.');

    this.info('cd ' + options.dir + '; tibet init; to continue developing.');
};

module.exports = Cmd;

}());
