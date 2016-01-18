//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet test' command. Runs phantomjs via TIBET's phantomtsh
 *     script runner. The script run is typically the TSH script ':test' which
 *     will run the tsh:test command tag to invoke all test suites.
 */
//  ========================================================================

/*eslint indent:0*/

(function() {

'use strict';

var CLI,
    Parent,
    Cmd;


CLI = require('./_cli');

//  ---
//  Type Construction
//  ---

// NOTE this is a subtype of the 'tsh' command focused on running :test.
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
 * The default path to the TIBET-specific phantomjs test runner.
 * @type {String}
 */
Cmd.DEFAULT_RUNNER = Parent.DEFAULT_RUNNER;


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
        'boolean': ['selftest', 'ignore-only', 'ignore-skip', 'tap'],
        'string': ['target', 'suite', 'cases', 'context'],
        'default': {
            tap: true
        }
    },
    Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE = 'tibet test [<target>|<suite>] [--target <target>] [--suite <suite>] [--cases <casename>] [--ignore-only] [--ignore-skip] [--no-tap] [--remote-debug-port <portnumber>]';

//  ---
//  Instance Methods
//  ---

/**
 * Performs any final processing of the argument list prior to execution.
 * @param {Array.<String>} arglist The argument list to finalize.
 * @returns {Array.<String>} The finalized argument list.
 */
Cmd.prototype.finalizeArglist = function(arglist) {

    if (arglist.indexOf('--tap') === -1 &&
            arglist.indexOf('--no-tap') === -1) {
        arglist.push('--tap');
    }

    return arglist;
};


/**
 * Computes and returns the proper profile to boot in support of the TSH.
 * @returns {String} The profile to boot.
 */
Cmd.prototype.getProfile = function() {

    var profile;

    if (CLI.notEmpty(this.options.profile)) {
        profile = this.options.profile;
    }

    if (this.options.selftest) {
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
 * @returns {String} The TIBET Shell script command to execute.
 */
Cmd.prototype.getScript = function() {

    var target,
        context,
        prefix,
        ignore;

    if (CLI.notEmpty(this.options.target)) {
        target = this.options.target;
    } else {
        // The options._ object holds non-qualified parameters. [0] is the
        // command name (tsh in this case). [1] should be the "target" to run.
        target = this.options._[1];
    }

    prefix = ':test';
    target = target || '';

    if (target.length > 0 && target.indexOf(prefix) !== 0) {
        target = prefix + ' \'' + target + '\'';
    } else {
        target = prefix;
    }

    if (CLI.notEmpty(this.options.suite)) {
        target = target.trim() + ' -suite=\'' + this.options.suite + '\'';
    }

    context = this.options.context;
    if (CLI.isEmpty(context)) {
        context = CLI.inLibrary() ? 'lib' : 'app';
    }
    target = target.trim() + ' -context=\'' + context + '\'';

    if (this.options.selftest) {
        target += ' -ignore_only';
    } else {
        ignore = this.options['ignore-only'];
        if (ignore === true) {
            target += ' -ignore_only';
        }

        ignore = this.options['ignore-skip'];
        if (ignore === true) {
            target += ' -ignore_skip';
        }
    }

    if (CLI.notEmpty(this.options.cases)) {
        target = target.trim() + ' -cases=\'' + this.options.cases + '\'';
    }

    return target;
};


module.exports = Cmd;

}());
