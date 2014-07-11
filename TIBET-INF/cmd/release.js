/**
 * @overview The 'tibet release' command. Does a number of steps with the goal
 *     of updating the TIBETVersion.js file with a new release number and
 *     tagging the resulting commit with that release number.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function() {

'use strict';

var CLI = require('tibet/src/tibet/cli/_cli');
var beautify = require('js-beautify').js_beautify;


//  ---
//  Type Construction
//  ---

var Parent = require('tibet/src/tibet/cli/_cmd');

var Cmd = function(){};
Cmd.prototype = new Parent();


//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.LIBRARY;

/**
 * The name of the target file to be updated with the templated output.
 * @type {String}
 */
Cmd.TARGET_FILE = '~lib/src/tibet/kernel/TIBETVersion.js';


/**
 * The name of the template file to use for injecting values.
 * @type {String}
 */
Cmd.TEMPLATE_FILE = '~lib/src/tibet/kernel/TIBETVersionTemplate.js';


//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Performs the steps necessary to tag a release.\n\n' +

'\n' +
'\n';


/**
 * Command argument parsing options.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        boolean: ['major', 'minor', 'patch', 'dirty'],
        string: ['name', 'state'],
        default: {
            major: false,
            minor: false,
            patch: false
        }
    },
    Parent.prototype.PARSE_OPTIONS);


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet release --major|--minor|--patch' +
    ' [--state <state>] [--name <name>]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @return {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var sh;
    var hb;
    var fs;

    var cmd;
    var version;
    var result;
    var parts;
    var source;
    var file;
    var data;
    var content;
    var template;

    hb = require('handlebars');
    sh = require('shelljs');
    fs = require('fs');


    // Verify the repo isn't "dirty"
    cmd = 'git describe --long --tags --dirty --always';
    result = sh.exec(cmd, {
        silent: (CLI.options.silent !== true)
    });

    if (result.code !== 0) {
        throw new Error(result.output);
    }

    // Undocumented flag here...unless you count this comment :)
    if (/dirty/.test(result.output) && !this.options.dirty) {
        throw new Error('Cannot release from a dirty repository.');
    }

    source = {};
    source.describe = result.output.slice(0, -1);

    // Must have a release type.
    if (!this.options.major && !this.options.minor && !this.options.patch) {
        return this.usage();
    }

    // Read the current version...should be in npm.version.
    version = this.getcfg('npm.version');
    parts = version.split('.');

    // Is this a major, minor, or patch release?
    // Bump appropriately. Major also zeroes out minor/patch. Minor also zeroes
    // out patch. Patch just updates patch.
    if (this.options.major) {
        parts[0] = parseInt(parts[0], 10) + 1;
        parts[1] = 0;
        parts[2] = 0;
    } else if (this.options.minor) {
        parts[1] = parseInt(parts[1], 10) + 1;
        parts[2] = 0;
    } else if (this.options.patch) {
        parts[2] = parseInt(parts[2], 10) + 1;
    }

    this.log('Updating release ' + version + ' to ' + parts.join('.'));

    source.name = this.options.name || '';
    source.major = parts[0];
    source.minor = parts[1];
    source.patch = parts[2];
    source.state = this.options.state || 'dev';
    source.isodate = new Date().toISOString();

    file = CLI.expandPath(Cmd.TEMPLATE_FILE);
    try {
        data = fs.readFileSync(file, {encoding: 'utf8'});
        if (!data) {
            throw new Error('NoData');
        }
    } catch (e) {
        this.error('Error reading file data: ' + e.message);
        return;
    }

    try {
        template = hb.compile(data);
        if (!template) {
            throw new Error('InvalidTemplate');
        }
    } catch (e) {
        this.error('Error compiling template ' + file + ': ' +
            e.message);
        return;
    }

    try {
        content = template(source);
        if (!content) {
            throw new Error('InvalidContent');
        }
    } catch (e) {
        this.error('Error injecting template data in ' + file +
            ': ' + e.message);
        return;
    }

    file = CLI.expandPath(Cmd.TARGET_FILE);
    this.info('Updating file: ' + file);
    try {
        fs.writeFileSync(file, content);
    } catch (e) {
        this.error('Error writing file ' + file + ': ' + e.message);
        return;
    }

    // Update the package.json content with the new version and save it.
    CLI.config.npm.version = parts.join('.');

    // Commit the changes
    file = CLI.expandPath(Cmd.TARGET_FILE);
    this.info('Updating file: ' + file);
    try {
        fs.writeFileSync(file, content);
    } catch (e) {
        this.error('Error writing file ' + file + ': ' + e.message);
        return;
    }


    // Tag the release


    //

    this.log(content);
};


module.exports = Cmd;

}());
