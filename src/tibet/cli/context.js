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

/* eslint indent:0 */

(function() {

'use strict';

var CLI,
    sh,
    dom,
    Cmd;


CLI = require('./_cli');
sh = require('shelljs');
dom = require('xmldom');

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
Cmd.NAME = 'context';

//  ---
//  Instance Attributes
//  ---

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
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {
    var context,
        result;

    result = 0;

    context = {};

    context.name = CLI.getcfg('npm.name');
    context.version = CLI.getcfg('npm.version');

    context.in_library = CLI.inLibrary(Cmd);
    context.in_project = CLI.inProject(Cmd);

    context['~'] = CLI.getAppHead();
    context['~app'] = CLI.getAppRoot();
    context['~lib'] = CLI.getLibRoot();

    context.boot = this.getBootData();
    if (!context.boot) {
        result = 1;
    }

    this.info(CLI.beautify(JSON.stringify(context)));

    return result;
};

/**
 * Returns information on the current project's boot target(s).
 * @returns {Object} An object containing boot package/config information.
 */
Cmd.prototype.getBootData = function() {
    var info,
        profile,
        pkg,
        config,
        parser,
        doc,
        text,
        elem,
        cfg,
        configs;

    parser = new dom.DOMParser();

    info = {};

    profile = CLI.getcfg('boot.profile');
    if (CLI.notEmpty(profile)) {
        profile = profile.split('@');
        pkg = profile[0];
        config = profile[1];
    }

    config = config || CLI.getcfg('boot.config');

    pkg = pkg || CLI.getcfg('boot.package') ||
        CLI.getcfg('boot.default_package') ||
        CLI.PACKAGE_FILE;

    cfg = CLI.expandPath(pkg);
    if (sh.test('-f', cfg)) {
        text = sh.cat(cfg);
    } else {
        this.error('Unable to locate boot.package: ' + cfg);
        return;
    }

    info.profile = profile;
    info.package = pkg;

    if (text) {
        text = text.toString();
        doc = parser.parseFromString(text);
        if (!doc || CLI.isValid(doc.getElementsByTagName('parsererror')[0])) {
            this.error('Error parsing ' + cfg + '. Not well-formed?');
            throw new Error();
        }

        if (CLI.isEmpty(config)) {
            elem = doc.getElementsByTagName('package')[0];
            config = elem.getAttribute('default');
        }

        configs = doc.getElementsByTagName('config');
        configs = Array.prototype.slice.call(configs, 0);
        configs = configs.filter(function(cfgtag) {
            return CLI.notEmpty(cfgtag.getAttribute('id'));
        });

        info.configs = configs.map(function(cfgtag) {
            return cfgtag.getAttribute('id');
        }).sort();
    }

    info.config = config;

    return info;
};


module.exports = Cmd;

}());
