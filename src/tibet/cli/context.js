//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet context' command. Dumps basic TIBET config/context data
 *     useful for debugging within a project or library context.
 */
//  ========================================================================

(function() {

'use strict';

var CLI,
    sh,
    dom,
    beautify,
    Parent,
    Cmd;


CLI = require('./_cli');
sh = require('shelljs');
dom = require('xmldom');
beautify = require('js-beautify').js_beautify;


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
    var context,
        text,
        doc,
        parser,
        configs;

    parser = new dom.DOMParser();

    context = {};

    context.name = CLI.getcfg('npm.name');
    context.version = CLI.getcfg('npm.version');

    context.in_library = CLI.inLibrary(Cmd);
    context.in_project = CLI.inProject(Cmd);

    context['~'] = CLI.getAppHead();
    context['~app'] = CLI.getAppRoot();
    context['~lib'] = CLI.getLibRoot();

    context.boot = {};
    context.boot.package = CLI.getcfg('boot.package') ||
        '~app_cfg/standard.xml';    // NOTE the default here must be in sync
                                    // with default value from the boot system.

    text = sh.cat(CLI.expandPath(context.boot.package));
    if (text) {
        doc = parser.parseFromString(text);
        configs = doc.getElementsByTagName('config');
        configs = Array.prototype.slice.call(configs, 0);
        configs = configs.filter(function(config) {
            return CLI.notEmpty(config.getAttribute('id'));
        });

        context.boot.configs = configs.map(function(config) {
            return config.getAttribute('id');
        }).sort();
    }

    this.info(beautify(JSON.stringify(context)));
};


module.exports = Cmd;

}());
