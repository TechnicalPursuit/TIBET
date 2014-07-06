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

    path = require('path');
    sh = require('shelljs');

    sh.mkdir('TIBET-INF/tibet');
    err = sh.error();
    if (err) {
        this.error('Error creating target directory: ' + err);
        return 1;
    }

    sh.cp('-R', 'node_modules/tibet/bin', 'TIBET-INF/tibet');
    err = sh.error();
    if (err) {
        this.error('Error cloning node_modules TIBET: ' + err);
        return 1;
    }

    sh.cp('-R', 'node_modules/tibet/etc', 'TIBET-INF/tibet');
    err = sh.error();
    if (err) {
        this.error('Error cloning node_modules TIBET: ' + err);
        return 1;
    }

    sh.cp('-R', 'node_modules/tibet/lib', 'TIBET-INF/tibet');
    err = sh.error();
    if (err) {
        this.error('Error cloning node_modules TIBET: ' + err);
        return 1;
    }

    sh.cp('-R', 'node_modules/tibet/src', 'TIBET-INF/tibet');
    err = sh.error();
    if (err) {
        this.error('Error cloning node_modules TIBET: ' + err);
        return 1;
    }
};


module.exports = Cmd;

}());
