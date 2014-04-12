/**
 * @file package.js
 * @overview The 'tibet package' command. Front-end to the Package object found
 *     in tibet_package.js which provides utilities for processing TIBET package
 *     files and their contents. This command also serves as a "supertype" for
 *     other commands whose operations focus on processing file lists produced
 *     from TIBET packages such as 'tibet rollup' and 'tibet lint'.
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
 *                  Defaults to the default config for the package.
 *      all         True to expand all configs recursively. Default is false.
 *                  If this is true then config is ignored.
 *
 *      silent      Silence normal logging. Default is true.
 *
 *      phaseone    Package phase-one content? Default is false.
 *      phasetwo    Package phase-two content? Default is true.
 *
 * OTHER OPTIONS:
 *
 *      Note that other options are passed through to the Package instance which
 *      does the actual expand/list processing. See tibet_package.js for more
 *      info on the options available through that component.
 */

;(function() {

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
 * The default package to process. Note the default is our default for the
 * application's tibet.xml file so commands based on tibet package can often
 * default to the common application-centric use case.
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
Cmd.prototype.USAGE = 'tibet package [--package {package}] [--config {cfg}] ' +
        '[--all] [--phaseone] [--phasetwo]' +
        '[--assets "asset names"] [--exclude] [--scripts|--styles|--images]';

/**
 * The package instance which this instance is using to process package data.
 * @type {Package}
 */
Cmd.prototype.package = null;

//  ---
//  Instance Methods
//  ---

/**
 * Top-level processing of the package to produce an asset list. For this type
 * and subtypes of the package command you should look to the "executeForEach"
 * method for the actual node-by-node processing logic.
 */
Cmd.prototype.execute = function() {

    var pkgOpts;    // Package instance options.
    var Package;    // The tibet_package export.
    var list;       // The result list of asset references.

    pkgOpts = {};

    // Note the default here points to an application-standard package path.
    pkgOpts.package = CLI.ifUndefined(this.argv.package, Cmd.PACKAGE);

    // This is ignored if --all is used and it will default based on the
    // package if not provided.
    if (this.argv.all) {
        pkgOpts.all = true;
    } else if (this.argv.config) {
        pkgOpts.config = this.argv.config;
    }

    // We default to all forms of 'script' produced by package expansion. Both
    // echo and property tags ultimately become script tags.
    pkgOpts.assets = CLI.ifUndefined(this.argv.assets, 'echo property script');

    // Configure settings for the package instance appropriate to rollup. We
    // want the output to be the full node with no color and no warnings.
    pkgOpts.nodes = true;
    pkgOpts.color = false;
    pkgOpts.silent = this.argv.nosilent ? false :
        CLI.ifUndefined(this.argv.silent, false);

    // Set boot phase defaults. If we don't manage these then most app package
    // runs will quietly filter out all their content nodes.
    pkgOpts.boot = {};
    pkgOpts.boot.phaseone = CLI.ifUndefined(this.argv.phaseone, false);
    pkgOpts.boot.phasetwo = CLI.ifUndefined(this.argv.phasetwo, true);

    // TODO: relocate from tibet3 to a reasonable TIBET 5.0 location.
    Package = require(path.join(CLI.getAppRoot(),
        'node_modules/tibet3/base/lib/tibet/src/tibet_package.js'));
    this.package = new Package(pkgOpts);

    if (this.argv.all) {
        this.package.expandAll();
        list = this.package.listAllAssets();
    } else {
        this.package.expandPackage();
        list = this.package.listPackageAssets();
    }

    return this.executeForEach(list);
};


/**
 * Processes a list of package asset nodes. The specific processing is often
 * overridden by subtypes such as rollup and lint to iterate on the list
 * produced by the 'execute' method. The default behavior is to simply output
 * the node text to the log.
 * @param {Array.<Node>} list An array of package nodes.
 */
Cmd.prototype.executeForEach = function(list) {
    var cmd,
        pkg;

    cmd = this;
    pkg = this.package;

    list.forEach(function(node) {
        cmd.info(serializer.serializeToString(node));
    });

    process.exit(0);
};

module.exports = Cmd;

}());
