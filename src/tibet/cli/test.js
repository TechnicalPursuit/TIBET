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
 * The command help string.
 * @type {String}
 */
Cmd.prototype.HELP =
'Runs unit, functional, and/or integration tests on your application.\n\n' +

'CLI-initiated tests are run in the context of phantomjs and support\n' +
'the use of the full TIBET test harness and UI driver feature set.\n\n' +

'The default operation makes use of ~app_test/phantom.xml as the\n' +
'boot.profile (which controls what code is loaded) and a TSH shell\n' +
'command of \':test\' which will run all test suites in the profile.\n\n' +

'You can specify a particular test target object or test suite to\n' +
'run as the first argument to the command. If you need to specify\n' +
'both a target and suite use --target and --suite respectively.\n\n' +

'Output is to the terminal in colorized TAP format by default.\n' +
'Future versions will support additional test output formatters.\n\n' +

'Changing the boot profile is not normally required however you\n' +
'can easily test components simply by naming them via the --script\n' +
'parameter. For example, you can run all String tests via:\n\n' +

'tibet test [--script] \':test String\'\n';


/**
 * Command argument parsing options.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['selftest', 'ignore-only', 'ignore-skip'],
        'string': ['target', 'suite'],
        'default': {}
    },
    Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE = 'tibet test [target|suite] [--target <target>] [--suite <suite>] [--ignore-only] [--ignore-skip]';

//  ---
//  Instance Methods
//  ---

/**
 * Performs any final processing of the argument list prior to execution.
 * @param {Array.<String>} arglist The argument list to finalize.
 * @returns {Array.<String>} The finalized argument list.
 */
Cmd.prototype.finalizePhantomArglist = function(arglist) {

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
 * @returns {String} The TIBET Shell script command to execute.
 */
Cmd.prototype.getScript = function() {

    var target,
        prefix,
        ignore;

    if (CLI.notEmpty(this.options.target)) {
        target = this.options.target;
    } else {
        // The options._ object holds non-qualified parameters. [0] is the
        // command name (tsh in this case). [1] should be the "target" to run.
        target = this.options._[1];
    }

    prefix = ':test ';
    target = target || '';

    if (target.length > 0 && target.indexOf(prefix) !== 0) {
        target = prefix + '\'' + target + '\'';
    } else {
        target = prefix;
    }

    if (CLI.notEmpty(this.options.suite)) {
        target = target.trim() + ' -suite=\'' + this.options.suite + '\'';
    } else if (target === prefix) {
        target += ' --all';
    }

    if (CLI.isValid(this.options.selftest)) {
        target += ' --ignore_only';
    } else {
        ignore = this.options['ignore-only'];
        if (ignore === true) {
            target += ' --ignore_only';
        }

        ignore = this.options['ignore-skip'];
        if (ignore === true) {
            target += ' --ignore_skip';
        }
    }

    return target;
};


module.exports = Cmd;

}());
