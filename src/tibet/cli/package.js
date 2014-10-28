//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet package' command. Front-end to the Package object found
 *     in _Package.js which provides utilities for processing TIBET package
 *     files and their contents. This command also serves as a supertype for
 *     other commands whose operations focus on processing file lists produced
 *     from TIBET packages such as 'tibet rollup' and 'tibet lint'.
 */
//  ========================================================================

/*
 * STANDARD OPTIONS:
 *
 *      package     The path of the top-level package to begin processing with.
 *                  The default is ~app_cfg/app.xml for application content.
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
 *      does the actual expand/list processing. See _Package.js for more
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
//  Type Attributes
//  ---

/**
 * The context viable for this command.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;


//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Outputs a list of package assets either as asset nodes or asset paths.\n\n' +

'This command is a useful way to view the files which a `tibet rollup` or\n' +
'`tibet lint` command will process. The best way to get a sense of this\n' +
'command is to run it with various options, of which there are many:\n\n' +

'--package    the file path to the package to process.\n' +
'--config     the name of an individual config to process.\n' +
'--all        process all config tags in the package recursively.\n' +
'--missing    output a list of missing assets of all types.\n\n' +

'--include    a space-separated list of asset tags to include.\n' +
'--exclude    a space-separated list of asset tags to include.\n\n' +

'--nodes      output asset nodes rather than asset paths.\n' +
'--phase      boot phase subset to process <all | one | two>.\n\n' +

'--images     include all image assets.\n' +
'--scripts    include all JavaScript source-containing assets.\n' +
'--styles     include all CSS containing assets.\n';


/**
 * Command argument parsing options.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        boolean: ['all', 'scripts', 'styles', 'images', 'nodes', 'missing'],
        string: ['package', 'config', 'include', 'exclude', 'phase']
    },
    Parent.prototype.PARSE_OPTIONS);


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE =
    'tibet package [--package <package>] [--config <cfg>] [--all]\n' +
    '\t[--missing] [--include <asset names>] [--exclude <asset names>]\n' +
    '\t[--scripts] [--styles] --[images] [--phase <phase>] [--nodes]';


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
 * Process inbound configuration flags and provide for adjustment via the
 * finalizePackageOptions call. On completion of this routine the receiver's
 * package options are fully configured.
 * @return {Object} The package options after being fully configured.
 */
Cmd.prototype.configurePackageOptions = function(options) {

    this.pkgOpts = options || this.options;

    // If we're doing a missing file scan we need to override/assign values to
    // the other parameters to ensure we get a full list of known assets from
    // the package being scanned.
    if (this.options.missing) {
        this.warn('scanning for missing files...');
        this.options.all = true;
        this.options.images = true;
        this.options.scripts = true;
        this.options.style = true;
        this.options.phase = 'all';
        this.options.include = null;
        this.options.exclude = null;
    }

    // If silent isn't explicitly set but we're doing a full expansion turn
    // silent on so we skip duplicate resource warnings.
    if (CLI.notValid(this.options.silent) && this.options.all) {
        this.pkgOpts.silent = true;
    }

    // Set boot phase defaults. If we don't manage these then most app package
    // runs will quietly filter out all their content nodes.
    this.pkgOpts.boot = {};
    switch (this.options.phase) {
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

    // Give subtypes a hook to make any specific adjustments to
    // the package options they need.
    this.finalizePackageOptions();

    return this.pkgOpts;
};


/**
 * Top-level processing of the package to produce an asset list. For this type
 * and subtypes of the package command you should look to the "executeForEach"
 * method for the actual node-by-node processing logic.
 * @return {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var list;       // The result list of asset references.

    this.configurePackageOptions();
    list = this.getPackageAssetList();

    // TODO: try/catch for errors? need a result code from the overall loop.
    this.executeForEach(list);

    return 0;
};


/**
 * Processes a list of package asset nodes. The specific processing is often
 * overridden by subtypes such as rollup and lint to iterate on the list
 * produced by the 'execute' method. The default behavior is to simply output
 * the node text to the log.
 * @param {Array.<Node>} list An array of package nodes.
 * @return {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executeForEach = function(list) {
    var cmd;
    var sh;
    var buildDir;
    var dirs;
    var files;
    var count;

    cmd = this;

    if (!this.options.missing) {
        list.forEach(function(item) {
            if (cmd.pkgOpts.nodes) {
                cmd.info(serializer.serializeToString(item));
            } else {
                cmd.info(item);
            }
        });
        return;
    }

    // If we're doing a missing file check we need to compare the content of our
    // list with the list of all known files in the application's various source
    // directories.
    sh = require('shelljs');
    buildDir = CLI.expandPath('~app_build').replace(process.cwd() + '/', '');
    dirs = sh.find('.').filter(function(file) {
        return sh.test('-d', file) &&
            file !== '.' &&                     // remove current dir
            !file.match(/node_modules/) &&      // remove npm dir
            !file.match(/TIBET-INF/) &&         // remove tibet dir
            !file.match(/\//) &&                // remove subdirs
            file !== buildDir;                  // remove build dir
    });

    files = sh.find(dirs).filter(function(file) {
        return !sh.test('-d', file) &&
            !file.match(/img\/boot/);
    });

    // Package files are provided in fully expanded form to avoid problems
    // with potentially different virtual path prefixing etc. We need to
    // adapt the local file references accordingly.
    files = files.map(function(file) {
        return path.join(process.cwd(), file);
    });

    count = 0;
    files.forEach(function(item) {
        if (list.indexOf(item) === -1) {
            cmd.log(item);
            count++;
        }
    });

    if (count > 0) {
        this.info('' + count + ' files not referenced in package.');
    } else {
        this.info('All files referenced at least once in package.');
    }

    return;
};


/**
 * Perform any last-minute changes to the package options before creation of the
 * internal Package instance. Intended to be overridden but custom subcommands.
 */
Cmd.prototype.finalizePackageOptions = function() {
    this.verbose('pkgOpts: ' + beautify(JSON.stringify(this.pkgOpts)));
};


/**
 * Return the list of assets for the receiver based on its current package
 * options. The package options are determined by configurePackageOptions and
 * the finalizePackageOptions call it invokes.
 * @return {Array} The package options.
 */
Cmd.prototype.getPackageAssetList = function() {

    var Package;    // The _Package.js export.
    var list;       // The result list of asset references.

    Package = require(path.join(__dirname, '_Package.js'));
    this.package = new Package(this.pkgOpts);

    if (this.pkgOpts.all) {
        this.package.expandAll();
        list = this.package.listAllAssets();
    } else {
        this.package.expandPackage();
        list = this.package.listPackageAssets();
    }

    return list;
};


module.exports = Cmd;

}());
