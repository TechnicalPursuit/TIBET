/**
 * @overview The 'tibet freeze' command. Copies and prunes the node_modules
 *     version of TIBET currently used by an application into the application's
 *     TIBET-INF directory. This allows the library to be added via Git or
 *     similar tools which might normally ignore node_modules and avoids
 *     bringing over dependencies which aren't needed for deployment.
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
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.PROJECT;


//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Freezes the current application\'s TIBET library in ~app_inf.\n\n' +

'By default ~app_inf refers to TIBET-INF, the default location for\n' +
'package data, custom commands, etc. TIBET also is configured to\n' +
'allow a version of TIBET to be frozen into TIBET-INF/tibet rather\n' +
'than in node_modules/tibet to support deployments where deploying\n' +
'the rest of node_modules would be unnecessary.\n';

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet freeze';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @return {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var path;
    var sh;
    var err;
    var app_inf;
    var libroot;

    path = require('path');
    sh = require('shelljs');
    app_inf = CLI.expandPath('~app_inf');

    // TODO: verify app_inf exists...

    libroot = path.join(app_inf, 'tibet');

    // TODO: verify node_modules/tibet exists...


    // TODO: replace node_modules with ~npm or whatever it is.

    sh.mkdir(libroot);
    err = sh.error();
    if (err) {
        if (!this.options.force) {
            if (/already exists/i.test(err)) {
                this.warn('Project already frozen. Use --force to re-freeze.');
            } else {
                this.error('Error creating target directory. ' +
                    'Use --force to attempt to rebuild.');
            }
            return 1;
        }
        this.warn('--force specified...cleansing/rebuilding target directory.');
        err = sh.rm('-rf', libroot);
        if (err) {
            this.error('Error removing target directory: ' + err);
            return 1;
        }
        sh.mkdir(libroot);
        err = sh.error();
        if (err) {
            this.error('Error creating target directory: ' + err);
            return 1;
        }
    }

    sh.cp('-R', 'node_modules/tibet/bin', libroot);
    err = sh.error();
    if (err) {
        this.error('Error cloning tibet/bin' + err);
        return 1;
    }

    sh.cp('-R', 'node_modules/tibet/etc', libroot);
    err = sh.error();
    if (err) {
        this.error('Error cloning tibet/etc: ' + err);
        return 1;
    }

    sh.cp('-R', 'node_modules/tibet/lib', libroot);
    err = sh.error();
    if (err) {
        this.error('Error cloning tibet/lib: ' + err);
        return 1;
    }

    sh.cp('-R', 'node_modules/tibet/src', libroot);
    err = sh.error();
    if (err) {
        this.error('Error cloning tibet/src: ' + err);
        return 1;
    }

    this.info('TIBET library frozen in ' + libroot + '.');
};


module.exports = Cmd;

}());
