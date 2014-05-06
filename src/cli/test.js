/**
 * @overview The 'tibet test' command.
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

//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
    'Runs unit and functional tests for the library and application.';


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet test [options]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 */
Cmd.prototype.execute = function() {
    this.info('testing...');

    return;
};


module.exports = Cmd;

}());
