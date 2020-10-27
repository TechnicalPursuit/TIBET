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
    semver;

CLI = require('./_cli');
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
    boolean: ['check', 'full'],
    string: ['context'],
    default: {
    }
},
Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet version [--check] [--context] [--full]';


//  ---
//  Instance Methods
//  ---


/**
 * Check arguments and configure default values prior to running prereqs.
 * @returns {Object} An options object usable by the command.
 */
Cmd.prototype.configure = function() {
    var options;

    options = this.options;

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
 */
Cmd.prototype.reportAppVersion = function() {
    var name,
        version,
        msg;

    name = CLI.getProjectName();
    version = CLI.getAppVersion(this.options.full);

    if (this.options.check) {
        return this.checkNpmVersion(name, version);
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
        return this.checkNpmVersion(name, version);
    }

    msg = name + '@' + version;
    this.info(msg);

    return 0;
};


/**
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
 * Perform the actual command processing logic.
 * @returns {Number|Promise} The return code produced by running the command (a
 *     non-zero indicates an Error) or a Promise that resolves when the command
 *     finishes.
 */
Cmd.prototype.execute = function() {

    var context,
        code,
        cmd;

    context = this.options.context;

    cmd = this;

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
