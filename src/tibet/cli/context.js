/**
 * @overview The 'tibet context' command. Dumps basic TIBET config/context data
 *     useful for debugging within a project or library context.
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
var beautify = require('js-beautify').js_beautify;


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
'Outputs current context information to stdout.\n';


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet context';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @return {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {
    var context;

    context = {};

    context.name = CLI.getcfg('npm.name');
    context.version = CLI.getcfg('npm.version');

    context.in_library = CLI.inLibrary(Cmd);
    context.in_project = CLI.inProject(Cmd);

    context['~'] = CLI.getAppHead();
    context['~app'] = CLI.getAppRoot();
    context['~lib'] = CLI.getLibRoot();

    this.info(beautify(JSON.stringify(context)));
};


module.exports = Cmd;

}());
