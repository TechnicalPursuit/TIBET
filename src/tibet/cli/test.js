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

(function() {

'use strict';

var CLI = require('./_cli');


//  ---
//  Type Construction
//  ---

// NOTE this is a subtype of the 'tsh' command focused on running :test.
var Parent = require('./tsh');

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
'Runs the TIBET phantomtsh script runner to test your application.\n\n' +

'The default operation makes use of ~app_test/phantom.xml as the\n' +
'boot.profile (which controls what code is loaded) and a TSH shell\n' +
'command of \':test\' which will run all test suites in the profile.\n\n' +

'Output is to the terminal in colorized TAP format by default.\n' +
'Future versions will support additional test output formatters.\n\n' +

'Changing the boot profile is not normally required however you\n' +
'can easily test components simply by naming them via the --script\n' +
'parameter. For example, you can run all String tests via:\n\n' +

'tibet test --script \':test String\'\n';


/**
 * Command argument parsing options.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        boolean: ['selftest'],
        default: {}
    },
    Parent.prototype.PARSE_OPTIONS);

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE = 'tibet test [target] [--ignore-only]';

//  ---
//  Instance Methods
//  ---

/**
 * Performs any final processing of the argument list prior to execution.
 * @param {Array.<String>} arglist The argument list to finalize.
 * @return {Array.<String>} The finalized argument list.
 */
Cmd.prototype.finalizePhantomArglist = function(arglist) {

    if ((arglist.indexOf('--tap') === -1) &&
            (arglist.indexOf('--no-tap') === -1)) {
        arglist.push('--tap');
    }

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
        profile = profile || '~app/test/phantom';
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

    var script;
    var prefix;

    if (CLI.notEmpty(this.options.script)) {
        script = this.options.script;
    } else {
        // The options._ object holds non-qualified parameters. [0] is the
        // command name (tsh in this case). [1] should be the "script" to run.
        script = this.options._[1];
    }

    if (CLI.inProject()) {
        prefix = ':test ';
    } else {
        prefix = ':test -ignore_only ';
    }

    script = script || '';
    if (script.length > 0 && script.indexOf(prefix) !== 0) {
        script = prefix + '\'' + script + '\'';
    } else {
        script = prefix;
    }

    return script;
};


module.exports = Cmd;

}());
