//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet thaw' command reverses the effect of 'tibet freeze',
 *     removing the TIBET-INF/tibet directory and resetting the default lib_root
 *     value in tibet.json to ~/node_modules/tibet.
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

Cmd = function() {
    //  empty
};
Cmd.Parent = require('./_cmd');
Cmd.prototype = new Cmd.Parent();


//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.PROJECT;

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'thaw';

//  ---
//  Instance Attributes
//  ---

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['force'],
        'default': {}
    },
    Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet thaw [--force]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var path,
        sh,

        err,
        app_inf,
        infroot,

        lnflags,
        lnerr,

        file,
        json,
        list;

    path = require('path');
    sh = require('shelljs');

    app_inf = CLI.expandPath('~app_inf');

    // Verify our intended target directory exists.
    if (!sh.test('-e', app_inf)) {
        this.error('Cannot find app_inf: ' + app_inf);
        return -1;
    }

    //  Verify target subdir/link exists.
    infroot = path.join(app_inf, 'tibet');
    if (!sh.test('-e', infroot)) {
        this.warn('Application not frozen.');
        return 0;
    }

    //  If it's a link we're in a thawed state already.
    if (sh.test('-L', infroot)) {
        this.info('Project library resources already thawed.');
        return 0;
    }

    //  Exists and not a link...need force to remove it...
    if (!this.options.force) {
        this.warn('Use --force to confirm destruction of ~app_inf/tibet.');
        return 1;
    }

    err = sh.rm('-rf', infroot);
    if (err) {
        this.error('Error removing target directory: ' + err);
        return 1;
    }

    //  Replace link to library resources common to all projects.
    lnflags = '-s';
    if (this.options.force) {
        lnflags += 'f';
    }
    this.log('relinking development library resources...');
    sh.ln(lnflags, path.join(
        CLI.expandPath(CLI.getAppHead()), 'node_modules/tibet'),
        path.join(
        CLI.expandPath(CLI.getAppRoot()), 'TIBET-INF/tibet'));
    lnerr = sh.error();
    if (lnerr) {
        this.error('Error relinking library resources: ' + lnerr);
    }

    this.log('updating embedded lib_root references...');

    list = sh.find('.').filter(function(fname) {
        return !fname.match('node_modules/tibet') &&
            !fname.match('TIBET-INF/tibet');
    });
    list = sh.grep('-l', 'TIBET-INF/tibet', list);

    list.split('\n').forEach(function(fname) {
        if (fname) {
            sh.sed('-i', /TIBET-INF\/tibet/g, 'node_modules/tibet', fname);
        }
    });

    this.log('updating project lib_root setting...');

    file = CLI.expandPath('~tibet_file');
    json = require(file);
    if (!json) {
        this.error('Unable to update lib_root in: ' + file);
        return 1;
    }
    if (!json.path) {
        json.path = {};
    }
    json.path.lib_root = '~/node_modules/tibet';
    CLI.beautify(JSON.stringify(json)).to(file);

    this.info('Application thawed. TIBET now boots from ~/node_modules/tibet.');

    return 0;
};

module.exports = Cmd;

}());
