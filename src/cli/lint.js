/**
 * @file lint.js
 * @overview The 'tibet lint' command. Checks a package/config's script files
 *     for lint.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

;(function(root) {

var CLI = require('./_cli');
var path = require('path');


//  ---
//  Type Construction
//  ---

var parent = require('./package');

// NOTE we don't inherit from _cmd, but from package.
var Cmd = function(){};
Cmd.prototype = new parent();


//  ---
//  Type Attributes
//  ---

/**
 * The default package to roll up. Note the default is our default for the
 * application's tibet.xml file.
 * @type {string}
 */
Cmd.PACKAGE = '~app/TIBET-INF/tibet.xml';


//  ---
//  Instance Attributes
//  ---

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet lint [package options] ';


//  ---
//  Instance Methods
//  ---

/**
 * Lints the script content of a package/config pair.
 * @param {Array.<Node>} list An array of package asset nodes.
 */
Cmd.prototype.executeForEach = function(list) {

    var cmd,
        lintArgs;

    cmd = this;
    lintArgs = ['node', 'eslint'];

    eslint = require('eslint');

    list.forEach(function(node) {
        var src = node.getAttribute('src');
        if (src) {
            eslint.cli.execute(lintArgs.concat(src));
        } else {
            // TODO
            console.log(node.textContent);
        }
    });

    process.exit(0);
};


//  ---
//  Export
//  ---

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Cmd;
    }
    exports.Cmd = Cmd;
} else {
    root.Cmd = Cmd;
}

}(this));
