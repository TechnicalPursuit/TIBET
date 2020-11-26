//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet version' command. Outputs information on the current
 *     application and library versions.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0 */

(function() {

'use strict';

var CLI,
    Cmd,
    fs,
    hb,
    helpers,
    semver,
    versioning;

CLI = require('./_cli');

fs = require('fs');
hb = require('handlebars');
semver = require('semver');
helpers = require('../../../etc/helpers/config_helpers');
versioning = require('../../../etc/helpers/version_helpers');

//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('./_cmd');
Cmd.prototype = new Cmd.Parent();

//  Augment our prototype with XML config methods.
helpers.extend(Cmd, CLI);

//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'version';

//  ---
//  Instance Attributes
//  ---

/**
 * Command argument parsing options.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend({
    boolean: ['check', 'full', 'major', 'minor', 'patch', 'sync'],
    string: ['context', 'suffix', 'version'],
    number: ['increment'],
    default: {
        major: false,
        minor: false,
        patch: false,
        sync: false
    }
},
Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The name of the target file to be updated with the templated output.
 * @type {String}
 */
Cmd.TARGET_FILE = '~lib/src/tibet/kernel/version.js';

/**
 * The name of the template file to use for injecting values. This file is
 * expected to have handlebars template slots for the data needed for a tag.
 * @type {String}
 */
Cmd.TEMPLATE_FILE = '~lib/src/tibet/kernel/version_template.js';

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet version [[--version] <version>] ' +
    '[--check] [--context] [--full] ' +
    '[--major|--minor|--patch|--sync] [--increment <num>] [--suffix <suffix>]';


//  ---
//  Instance Methods
//  ---

/**
 * Checks the npm repository for latest version information and compares it to
 * the value of 'current' provided.
 * @param {String} name The npm module name to check.
 * @param {String} current The current version, if available.
 */
Cmd.prototype.checkNpmVersion = function(name, current) {
    var result,
        npmver,
        msg;

    msg = name + '@' + current;

    //  If we're checking version we capture the latest information from npm
    //  about what TIBET release is in the npm repository and compare the semver
    //  data from that with our current library release.
    result = this.shexec('npm info ' + name + ' --json', true);
    try {
        result = JSON.parse(result.stdout.trim());
    } catch (e) {
        //  Simulate npm 404 response.
        result = {
            error: {
                code: 'E404'
            }
        };
    }

    if (result.error) {
        if (result.error.code === 'E404') {
            msg += ' (unpublished)';
            this.warn(msg);
        } else {
            msg += ' (error ' + result.error.code + ')';
            this.error(msg);
        }
        return 0;
    }

    npmver = result.version;

    if (semver.lt(current, npmver)) {
        msg += ' (latest: ' + npmver + ')';
        this.warn(msg);
    } else {
        msg += ' (latest)';
        this.log(msg);
    }

    return 0;
};


/**
 * Check arguments and configure default values prior to running prereqs.
 * @returns {Object} An options object usable by the command.
 */
Cmd.prototype.configure = function() {
    var options;

    options = this.options;

    //  Ensure we get a solid setting in place for context.
    if (CLI.isEmpty(options.context)) {
        if (CLI.inProject()) {
            options.context = 'app';
        } else if (CLI.inLibrary()) {
            options.context = 'lib';
        } else {
            options.context = 'lib';
        }
    }

    return options;
};


/**
 * Verify args are not ambiguous. There are a few options where we want to avoid
 * confusion if they are supplied at the same time.
 * @returns {Object} An options object usable by the command.
 */
Cmd.prototype.prereqs = function() {
    var root,
        options;

    //  Must be in a git project
    root = CLI.getAppHead();
    if (!CLI.sh.test('-d', CLI.joinPaths(root, '.git'))) {
        this.warn('tibet version supports git-based projects.');
        this.error('.git directory not found in project root.');
        return -1;
    }

    if (!CLI.sh.which('git')) {
        this.warn('tibet version supports git-based projects.');
        this.error('git executable not found.');
        return -1;
    }

    options = this.options;

    //  Map any non-flag argument as the version string to use.
    if (CLI.isValid(options._) && options._.length > 1) {
        if (!CLI.isEmpty(this.options.version)) {
            this.warn('Ambiguous arguments for version flag.');
            return 1;
        }

        this.options.version === options._[1];
    }

    //  Sanity checks...

    if (this.options.major && this.options.minor ||
            this.options.major && this.options.patch ||
            this.options.major && this.options.sync ||
            this.options.minor && this.options.patch ||
            this.options.minor && this.options.sync ||
            this.options.patch && this.options.sync) {

        this.warn('Ambiguous arguments for version update.');
        return -1;
    }

    if (CLI.notEmpty(this.options.version)) {
        if (this.options.major ||
                this.options.minor ||
                this.options.patch ||
                this.options.suffix ||
                this.options.increment ||
                this.options.sync) {

            this.warn('Ambiguous arguments for version update.');
            return 1;
        }
    }

    return 0;
};


/**
 */
Cmd.prototype.reportAppVersion = function() {
    var name,
        version,
        msg;

    name = CLI.getProjectName();
    version = CLI.getAppVersion(this.options.full);

    if (this.options.check) {
        return this.checkNpmVersion(name, version, this);
    }

    msg = name + '@' + version;
    this.info(msg);

    return 0;
};


/**
 */
Cmd.prototype.reportLibVersion = function() {
    var name,
        version,
        msg;

    name = 'tibet';
    version = CLI.getLibVersion(this.options.full);
    if (this.options.check) {
        return this.checkNpmVersion(name, version, this);
    }

    msg = name + '@' + version;
    this.info(msg);

    return 0;
};


/**
 * Updates the project (or lib project) with a new version. The version used is
 * based on command line flag settings.
 */
Cmd.prototype.updateVersion = function() {
    var source,
        version,
        parts,
        result;

    //  Get the version object computed from command line arguments.
    source = versioning.getVersionObject(this.options);

    //  Get computed version object in string format for prompt.
    version = versioning.getVersionString(source);

    parts = version.split('+');
    version = parts[0] + ' (+' + parts[1] + ') ';

    result = this.prompt.question(
        'Set version ' + version + '? Type \'yes\' to continue: ');
    if (!/^y/i.test(result)) {
        return;
    }

    return this.updateVersionFiles(source);
};


/**
 */
Cmd.prototype.updateVersionFiles = function(source) {
    var cfgkey,
        file,
        data,
        content,
        template,
        pkgName,
        pkgNode,
        mainName,
        mainNode,
        fullVersion,
        version;

    // Don't include metadata in the version string.
    fullVersion = versioning.getVersionString(source);
    CLI.config.npm.version = fullVersion.split('+')[0];
    CLI.config.tibet.version = CLI.config.npm.version;

    //  ---
    //  Update the embedded version file for the project (or lib).
    //  ---

    if (CLI.inProject()) {
        cfgkey = 'path.app_version_template';
    } else {
        cfgkey = 'path.lib_version_template';
    }

    file = CLI.expandPath(CLI.getcfg(cfgkey));
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

    if (CLI.inProject()) {
        cfgkey = 'path.app_version_file';
    } else {
        cfgkey = 'path.lib_version_file';
    }

    file = CLI.expandPath(CLI.getcfg(cfgkey));
    if (this.options['dry-run']) {
        this.warn('dry-run. bypassing writing: ' + file);
    } else {
        this.info('Updating target version file: ' + file);
        try {
            content = CLI.normalizeLineEndings(content);
            fs.writeFileSync(file, content);
        } catch (e) {
            this.error('Error writing file ' + file + ': ' + e.message);
            return;
        }
    }

    //  ---
    //  Update package.json file content (CLI.config.npm.version)
    //  ---

    file = CLI.expandPath(CLI.joinPaths('~', CLI.NPM_FILE));
    if (this.options['dry-run']) {
        this.warn('dry-run. bypassing writing: ' + file);
    } else {
        this.info('Updating npm version in: ' + file);
        try {
            content = CLI.beautify(JSON.stringify(CLI.config.npm));
            content = CLI.normalizeLineEndings(content);
            fs.writeFileSync(file, content);
        } catch (e) {
            this.error('Error writing file ' + file + ': ' + e.message);
            return;
        }
    }

    //  ---
    //  Project-specific XML files (which drive cache updates)
    //  ---

    if (CLI.inLibrary()) {
        pkgName = 'TIBET';
    } else {
        pkgName = CLI.getcfg('project.name');
    }

    //  Now we fetch or build nodes for both the inline and resource sections of
    //  the config.
    if (pkgName.charAt(0) !== '~') {
        if (CLI.inProject()) {
            pkgName = CLI.joinPaths('~app_cfg', pkgName);
        } else {
            pkgName = CLI.joinPaths('~lib_cfg', pkgName);
        }
    }

    if (!/.xml$/.test(pkgName)) {
        pkgName = pkgName + '.xml';
    }

    //  update the primary package node's version (TIBET.xml or {app}.xml)

    pkgNode = this.readPackageNode(pkgName);
    if (!CLI.isValid(pkgNode)) {
        this.error('Unable to ready package ' + pkgName);
        throw new Error('PackageReadError');
    }

    //  NOTE the test here is against the full version with git metadata
    version = pkgNode.getAttribute('version');
    if (version !== fullVersion) {
        pkgNode.setAttribute('version', fullVersion);
        this.writePackageNode(pkgName, pkgNode);
    }

    //  If we're in a project we also update the main.xml for that project
    if (CLI.inProject()) {
        mainName = CLI.joinPaths('~app_cfg', 'main.xml');
        mainNode = this.readPackageNode(mainName);

        if (!CLI.isValid(mainNode)) {
            this.error('Unable to ready package ' + mainName);
            throw new Error('PackageReadError');
        }
        version = mainNode.getAttribute('version');

        //  NOTE the test here is against the full version with git metadata
        if (version !== fullVersion) {
            mainNode.setAttribute('version', fullVersion);
            this.writePackageNode(mainName, mainNode);
        }
    }

    return;
};


/**
 * Perform the actual command processing logic.
 * @returns {Number|Promise} The return code produced by running the command (a
 *     non-zero indicates an Error) or a Promise that resolves when the command
 *     finishes.
 */
Cmd.prototype.execute = function() {
    var options,
        context,
        code,
        cmd;

    options = this.options;

    context = options.context;

    cmd = this;

    //  If this is an update request do that first, then report on final value.
    if (options.major || options.minor || options.patch || options.sync ||
            CLI.notEmpty(options.version) || CLI.isValid(options.suffix) ||
            CLI.isValid(options.increment)) {
        this.updateVersion();
    }

    if (context === 'app' || context === 'all') {
        code = this.reportAppVersion();
    }

    if (context === 'lib' || context === 'all') {
        code = this.reportLibVersion();
    }

    if (CLI.notValid(code)) {
        cmd.error('Invalid context (must be app, lib, or all).');
        code = 1;
    }

    return code;
};


module.exports = Cmd;

}());
