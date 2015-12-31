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

/*eslint indent:0*/

(function() {

'use strict';

var CLI,
    beautify,
    Parent,
    Cmd;


CLI = require('./_cli');
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
Cmd.CONTEXT = CLI.CONTEXTS.PROJECT;


//  ---
//  Instance Attributes
//  ---

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

        file,
        json,
        list;

    path = require('path');
    sh = require('shelljs');

    app_inf = CLI.expandPath('~app_inf');

    // Verify our intended target directory exists.
    if (!sh.test('-e', app_inf)) {
        this.error('Cannot find app_inf: ' + app_inf);
        return;
    }

    infroot = path.join(app_inf, 'tibet');
    if (!sh.test('-e', infroot)) {
        this.warn('Application not frozen.');
        return;
    }

    if (!this.options.force) {
        this.warn('Use --force to confirm destruction of ~app_inf/tibet.');
        return 1;
    }

    err = sh.rm('-rf', infroot);
    if (err) {
        this.error('Error removing target directory: ' + err);
        return 1;
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
    beautify(JSON.stringify(json)).to(file);

    this.info('Application thawed. TIBET now boots from node_modules.');
};


module.exports = Cmd;

}());
