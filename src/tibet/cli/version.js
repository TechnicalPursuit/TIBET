//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet version' command. Dumps the current version of TIBET.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0 */

(function() {

'use strict';

var CLI,
    Cmd,
    path,
    sh,
    semver;


CLI = require('./_cli');
path = require('path');
sh = require('shelljs');
semver = require('semver');

//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('./_cmd');
Cmd.prototype = new Cmd.Parent();


//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.ANY;

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
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['check'],
        'default': {}
    },
    Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet version [--check] [--full]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var msg,
        project,
        root,
        fullpath,
        library,
        npm,
        result,
        npmver,
        libver,
        cmd,
        code;

    code = 0;

    msg = 'Unable to determine TIBET version.';

    cmd = this;

    //  If we're in a project try to load the project version for reference.
    if (CLI.inProject()) {
        try {
            project = CLI.getcfg('npm.version') || msg;
        } catch (e) {
            this.error(msg + ' ' + e.message);
            throw new Error();
        }
    }

    //  Library version is always at ~lib/package.json.
    root = CLI.getLibRoot();
    fullpath = CLI.expandPath(path.join(root, CLI.NPM_FILE));
    if (!sh.test('-f', fullpath)) {
        //  When frozen we can often have a lib root reference where the
        //  package.json file isn't linked/copied. When that's true we have to
        //  work from app head and add in the node_modules/tibet dir.
        root = CLI.getAppHead();
        fullpath = CLI.expandPath(path.join(root,
            'node_modules', 'tibet', CLI.NPM_FILE));
    }

    if (sh.test('-f', fullpath)) {
        try {
            npm = require(fullpath) || {tibet_project: false};
        } catch (e) {
            msg = 'Error loading TIBET package: ' + e.message;
            if (this.options.stack === true) {
                msg += ' ' + e.stack;
            }
            throw new Error(msg);
        }
    }

    if (!npm) {
        //  Unable to locate TIBET version.
        this.options.check = false;
        library = '0.0.0';
    } else {
        try {
            library = npm.version;
        } catch (e) {
            this.error(msg + ' ' + e.message);
            throw new Error();
        }
    }

    libver = library.split('+')[0];

    //  If we're checking version we capture the latest information from npm
    //  about what TIBET release is in the npm repository and compare the semver
    //  data from that with our current library release.
    if (this.options.check) {

        result = this.shexec('npm info tibet --json');
        result = JSON.parse(result.output);
        npmver = result.version;

        if (semver.lt(libver, npmver)) {
            cmd.warn(
                'Version ' + npmver +
                ' is available. You have ' + libver);
        } else {
            cmd.log(
                'Your current version ' + libver +
                ' is the latest.', 'success');
        }

    } else {

        msg = libver;
        if (project && project !== library) {
            msg = libver + ' (' +
                CLI.getcfg('npm.name') + ' ' + project.split('+')[0] +
            ')';
        }
        this.info(msg);
    }

    return code;
};


module.exports = Cmd;

}());
