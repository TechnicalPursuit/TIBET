//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet reflect' command. Runs phantomjs via TIBET's phantomtsh
 *     script runner. The script run is ':reflect' with optional arguments.
 */
//  ========================================================================

(function() {

'use strict';

var CLI,
    Parent,
    Cmd;


CLI = require('./_cli');

//  ---
//  Type Construction
//  ---

// NOTE this is a subtype of the 'tsh' command focused on running :reflect.
Parent = require('./tsh');

Cmd = function() {};
Cmd.prototype = new Parent();


//  ---
//  Type Attributes
//  ---


/**
 * The context viable for this command.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;


/**
 * The default path to the TIBET-specific phantomjs script runner.
 * @type {String}
 */
Cmd.DEFAULT_RUNNER = Parent.DEFAULT_RUNNER;


//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {String}
 */
Cmd.prototype.HELP =
'tibet reflect [<object>]\n';


/**
 * Command argument parsing options.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['methods'],
        'string': ['target'],
        'default': {}
    },
    Parent.prototype.PARSE_OPTIONS);

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE = 'tibet reflect [target] [--target <target>]';

//  ---
//  Instance Methods
//  ---

/**
 * Performs any final processing of the argument list prior to execution.
 * @param {Array.<String>} arglist The argument list to finalize.
 * @return {Array.<String>} The finalized argument list.
 */
Cmd.prototype.finalizePhantomArglist = function(arglist) {

    return arglist;
};


/**
 * Computes and returns the proper profile to boot in support of the TSH.
 * @return {String} The profile to boot.
 */
Cmd.prototype.getProfile = function() {

    var profile;

    if (CLI.notEmpty(this.options.profile)) {
        profile = this.options.profile;
    }

    if (CLI.isValid(this.options.selftest)) {
        profile = '~lib_etc/phantom/phantom#selftest';
    } else if (CLI.notEmpty(this.options.profile)) {
        profile = this.options.profile;
    }

    if (CLI.inProject()) {
        profile = profile || '~app_cfg/phantom';
    } else {
        profile = profile || '~lib_etc/phantom/phantom';
    }

    return profile;
};


/**
 * Computes and returns the TIBET Shell script command line to be run.
 * @return {String} The TIBET Shell script command to execute.
 */
Cmd.prototype.getScript = function() {

    var target,
        prefix;

    if (CLI.notEmpty(this.options.target)) {
        target = this.options.target;
    } else {
        // The options._ object holds non-qualified parameters. [0] is the
        // command name (tsh in this case). [1] should be the "target" to run.
        target = this.options._[1];
    }

    prefix = ':reflect ';

    target = target || '';
    if (target.length > 0 && target.indexOf(prefix) !== 0) {
        target = prefix + '\'' + target + '\'';
    } else {
        target = prefix;
    }

    return target;
};


module.exports = Cmd;

}());
