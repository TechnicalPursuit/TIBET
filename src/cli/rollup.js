/**
 * @file rollup.js
 * @overview The 'tibet rollup' command. Produces optimized content packages
 *     based on the content of one or more TIBET manifest files.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/*
 * STANDARD OPTIONS:
 *
 *      package     The path of the top-level package to begin processing with.
 *      config      The name of the top-level package config to process.
 *      all         True to expand all configs in a package (and subpackages).
 *      assets      A list of one or more asset types to process. Default is
 *                  all script resources after full expansion.
 *      exclude     Use asset list as exclusions? Default is false.
 *      silent      Toggle error reporting. Default is false.
 *      files       Output files rather than source code? Default is false.
 *      phaseone    Package phase-one content? Default is false.
 *      phasetwo    Package phase-two content? Default is true.
 *
 * OTHER OPTIONS:
 *
 *      Note that other options are passed through to the Package instance which
 *      does the actual expand/list processing. See tibet_package.js for more
 *      info on the options available through that component.
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
Cmd.prototype.USAGE =
    'tibet rollup [--package {package}] [--config {cfg}] ' +
        '[--phaseone] [--phasetwo] [--assets {asset names}] --exclude';


//  ---
//  Instance Methods
//  ---

/**
 * Produces a compressed package of code ready for inclusion in a production
 * package. Note that virtually everything defaults when running in a typical
 * TIBET application context. For processing the TIBET platform you must at
 * least provide a package name (since the platform doesn't keep its tibet.xml
 * in the typical application location under TIBET-INF).
 */
Cmd.prototype.process = function() {

    var list;       // The result list of asset references.
    var cmd;        // Binding reference to 'this'.
    var Package;    // The tibet_package export.
    var ug;         // The uglify-js compressor export.

    // Note the default here points to an application-standard package path.
    file = CLI.ifUndefined(this.argv.package, Cmd.PACKAGE);

    // This is ignored if --all is used and it will default based on the
    // package if not provided.
    config = this.argv.config;

    // We default to all forms of 'script' produced by package expansion. Both
    // echo and property tags ultimately become script tags.
    this.argv.assets = CLI.ifUndefined(this.argv.assets,
        'echo property script');

    this.argv.files = CLI.ifUndefined(this.argv.files, false);

    // Configure settings for the package instance appropriate to rollup. By
    // default we need non-colored source-code output with no warnings.
    this.argv.color = CLI.ifUndefined(this.argv.color, false);
    this.argv.source = false;
    this.argv.silent = this.argv.nosilent ? false :
        CLI.ifUndefined(this.argv.silent, false);

    // Set boot phase defaults. If we don't manage these then most app package
    // runs will quietly filter out all their content nodes.
    this.argv.boot = {};
    this.argv.boot.phaseone = CLI.ifUndefined(this.argv.phaseone, false);
    this.argv.boot.phasetwo = CLI.ifUndefined(this.argv.phasetwo, true);

    // TODO: relocate from tibet3 to a reasonable TIBET 5.0 location.
    Package = require(path.join(CLI.getAppRoot(),
        'node_modules/tibet3/base/lib/tibet/src/tibet_package.js'));

    package = new Package(this.argv);

    if (this.argv.all) {
        package.expandAll(file);
        list = package.listAllAssets(file);
    } else {
        package.expandPackage(file, config);
        list = package.listPackageAssets(file, config);
    }

    // Create closure'd this reference for iteration function.
    cmd = this;

    ug = require('uglify-js');

    list.forEach(function(node) {
        var src = node.getAttribute('src');

        if (cmd.argv.files) {
            console.log(src);
        } else {
            console.log(ug.minify(src).code + ';');
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
