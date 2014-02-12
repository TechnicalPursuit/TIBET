/**
 * @overview The 'tibet expand' command.
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
var dom = require('xmldom');
var serializer = new dom.XMLSerializer();

// TODO: relocate from tibet3 to a reasonable TIBET 5.0 location.
var Package = require(path.join(CLI.getAppRoot(),
    'node_modules/tibet3/base/lib/tibet/src/tibet_package.js'));


//  ---
//  Type Construction
//  ---

var parent = require('./_cmd');

var Cmd = function(){};
Cmd.prototype = new parent();

//  ---
//  Type Attributes
//  ---

Cmd.PACKAGE = './TIBET-INF/tibet.xml';


//  ---
//  Instance Attributes
//  ---

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE =
    'tibet expand [--package {name}] [--config {name}] [options]';

//  ---
//  Instance Methods
//  ---

/**
 */
Cmd.prototype.process = function() {

    var file;       // The manifest file name to read.
    var config;     // The config to expand from the manifest.
    var package;    // The package processing instance.
    var doc;        // The document object for the initial package/manifest.
    var list;       // The result list of asset references.
    var cmd;        // An external binding reference to 'this'.

    file = this.argv.package || Cmd.PACKAGE;
    config = this.argv.config;  // default read from package content.
    files = this.argv.files;    // dump file names, or nodes?

    cmd = this;

    // TODO: work on parameters/options loading here
    package = new Package(this.argv);

    doc = package.expandPackage(file, config);
    list = package.listPackageAssets(file, config);

    if (files) {
        list.forEach(function(node) {
            var file;
            file = node.getAttribute('src') || node.getAttribute('href');
            if (file) {
                cmd.raw(file);
            }
        });
    } else {
        list.forEach(function(node) {
            cmd.raw(serializer.serializeToString(node));
        });
    }

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
