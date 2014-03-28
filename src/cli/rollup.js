/**
 * @overview The 'tibet rollup' command.
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
    'tibet rollup [--package {name}] [--config {name}] [options]';

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

    this.argv.files = this.argv.files || false;
    this.argv.assets = this.argv.assets || 'script';

    cmd = this;

    // TODO: relocate from tibet3 to a reasonable TIBET 5.0 location.
    var Package = require(path.join(CLI.getAppRoot(),
        'node_modules/tibet3/base/lib/tibet/src/tibet_package.js'));

    package = new Package(this.argv);

    doc = package.expandPackage(file, config);
    list = package.listPackageAssets(file, config);

    var ug = require('uglify-js');

    list.forEach(function(node) {
        console.log(ug.minify(node.getAttribute('src')).code + ';');
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
