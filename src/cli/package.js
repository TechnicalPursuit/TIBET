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
 *                  The default is ~app_base/app.xml for application content.
 *      config      The name of the top-level package config to process.
 *                  Defaults to the default config for the package.
 *      all         True to expand all configs recursively. Default is false.
 *                  If this is true then config is ignored since all configs in
 *                  the package (and descendant packages) will be processed.
 *      silent      Silence normal logging. Defaults to the value set for 'all'.
 *                  If 'all' is true we default this to true to suppress
 *                  warnings about duplicate assets.
 *      phase       Package phase? Default is phase two (application phase).
 *
 * OTHER OPTIONS:
 *
 *      Note that other options are passed through to the Package instance which
 *      does the actual expand/list processing. See tibet_package.js for more
 *      info on the options available through that component.
 */

(function() {

'use strict';

var CLI = require('./_cli');
var path = require('path');
var dom = require('xmldom');
var serializer = new dom.XMLSerializer();
var beautify = require('js-beautify').js_beautify;


//  ---
//  Type Construction
//  ---

var Parent = require('./_cmd');

var Cmd = function(){};
Cmd.prototype = new Parent();

//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Outputs a list of package assets either as nodes (default) or file names.';


/**
 * Command argument parsing options.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = {
    boolean: [
        'color', 'help', 'usage', 'debug', 'stack', 'verbose',
        'all', 'scripts', 'styles', 'images', 'nodes'
    ],
    string: ['package', 'config', 'include', 'exclude', 'phase']
};


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE =
    'tibet package [--package <package>] [--config <cfg>] [--all]\n' +
    '\t[--include <asset names>] [--exclude <asset names>]\n' +
    '\t[--scripts] [--styles] --[images] [--phase <phase>]';


/**
 * The package instance which this instance is using to process package data.
 * @type {Package}
 */
Cmd.prototype.package = null;


/**
 * The final options used to drive the underlying Package object.
 * @type {Object}
 */
Cmd.prototype.pkgOpts = null;


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

    this.pkgOpts = this.argv;

    // If silent isn't explicitly set but we're doing a full expansion turn
    // silent on so we skip duplicate resource warnings.
    if (CLI.notValid(this.argv.silent) && this.argv.all) {
        this.pkgOpts.silent = true;
    }

    // Set boot phase defaults. If we don't manage these then most app package
    // runs will quietly filter out all their content nodes.
    this.pkgOpts.boot = {};
    switch (this.argv.phase) {
        case 'one':
            this.pkgOpts.boot.phaseone = true;
            this.pkgOpts.boot.phasetwo = false;
            break;
        case 'two':
            this.pkgOpts.boot.phaseone = false;
            this.pkgOpts.boot.phasetwo = true;
            break;
        default:
            this.pkgOpts.boot.phaseone = true;
            this.pkgOpts.boot.phasetwo = true;
            break;
    }

    // TODO: relocate from tibet3 to a reasonable TIBET 5.0 location.
    Package = require(path.join(CLI.getAppRoot(),
        'node_modules/tibet3/base/lib/tibet/src/tibet_package.js'));

    this.verbose('pkgOpts: ' + beautify(JSON.stringify(this.pkgOpts)));
    this.package = new Package(this.pkgOpts);

    if (this.pkgOpts.all) {
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
    var cmd;

    cmd = this;

    list.forEach(function(item) {
        if (cmd.pkgOpts.nodes) {
            cmd.info(serializer.serializeToString(item));
        } else {
            cmd.info(item);
        }
    });
};

module.exports = Cmd;

}());
