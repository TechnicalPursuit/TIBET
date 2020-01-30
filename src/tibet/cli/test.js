//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet test' command. Runs TIBET tests via the 'tibet tsh'
 *     command. The script run is typically the TSH script ':test' which
 *     will run the tsh:test command tag to invoke all test suites.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0 */

(function() {

'use strict';

var CLI,
    Cmd,
    sh,
    path;

CLI = require('./_cli');

sh = require('shelljs');
path = require('path');

//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('./tsh');      // NOTE we inherit from 'tsh' command.
Cmd.prototype = new Cmd.Parent();


//  ---
//  Type Attributes
//  ---


/**
 * The context viable for this command.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;

/**
 * The name of the Karma test runner command used to verify Karma.
 * @type {string}
 */
Cmd.KARMA_COMMAND = 'karma';

/**
 * The name of the Karma test runner configuration file used to confirm that the
 * local project is karma-enabled.
 * @type {string}
 */
Cmd.KARMA_FILE = 'karma.conf.js';

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'test';

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
        'boolean': ['selftest', 'inherit', 'subtypes', 'ignore-only',
                    'ignore-skip', 'tap', 'ok', 'karma'],
        'string': ['target', 'suite', 'cases', 'context', 'profile', 'config'],
        'default': {
            tap: true,
            ok: true
        }
    },
    Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE = 'tibet test [<target>|<suite>] [--target <target>] [--suite <suite>] [--cases <casename>] [--ignore-only] [--ignore-skip] [--no-tap] [--no-ok] [--profile <profile>] [--config <config>]';

//  ---
//  Instance Methods
//  ---

/**
 * Execute either Karma or headless-based testing.
 */
Cmd.prototype.execute = function() {
    var karmafile;

    if (this.options.karma) {
        //  Not really checking as much as calling when available and falling
        //  through when not so we default back down to a headless option.
        karmafile = path.join(CLI.getAppHead(), Cmd.KARMA_FILE);
        if (sh.test('-e', karmafile) && sh.which(Cmd.KARMA_COMMAND)) {
            return this.executeViaKarma();
        }
    }

    //  Defer back to parent version which will trigger normal invocation of
    //  things like our finalizeArglist/processScript etc. to run headless.
    Cmd.Parent.prototype.execute.call(this);

    return 0;
};


/**
 * Runs the deploy by activating the Karma executable.
 * @returns {Number} A return code.
 */
Cmd.prototype.executeViaKarma = function() {
    var cmd,
        proc,
        child,
        args,
        str,
        list;

    cmd = this;

    //  Build an argument string that can get us past karma's command line. The
    //  karma-tibet karma.conf.js file on the other end will extract/patch.
    args = [];
    args.push('start');

    //  ---
    //  build :test command we can push to the subprocess
    //  ---

    list = this.options;
    if (list._.length > 1 || list.target || list.suite || list.cases) {

        args.push('--tibettest');
        str = ':test ';

        if (list.target) {
            str += ' -target=' + CLI.quoted(list.target);
        } else if (list._.length > 1) {
            str += ' -target=' + CLI.quoted(list._[1]);
        }

        if (list.suite) {
            str += ' -suite=' + CLI.quoted(list.suite);
        }

        if (list.cases) {
            str += ' -cases=' + CLI.quoted(list.cases);
        }

        args.push(CLI.quoted(str));
    }

    //  ---
    //  child proc
    //  ---

    proc = require('child_process');
    child = proc.spawn(sh.which(Cmd.KARMA_COMMAND).toString(), args);

    child.stdout.on('data', function(data) {
        var msg;

        if (CLI.isValid(data)) {
            // Copy and remove newline.
            msg = data.slice(0, -1).toString('utf-8');

            cmd.log(msg);
        }
    });

    child.stderr.on('data', function(data) {
        var msg;

        if (CLI.notValid(data)) {
            msg = 'Unspecified error occurred.';
        } else {
            // Copy and remove newline.
            msg = data.slice(0, -1).toString('utf-8');
        }

        // Some leveraged module likes to write error output with empty lines.
        // Remove those so we can control the output form better.
        if (msg && typeof msg.trim === 'function' && msg.trim().length === 0) {
            return;
        }

        // A lot of errors will include what appears to be a common 'header'
        // output message from events.js:72 etc. which provides no useful
        // data but clogs up the output. Filter those messages.
        if (/throw er;/.test(msg)) {
            return;
        }

        cmd.error(msg);
    });

    child.on('exit', function(code) {
        var msg;

        if (code !== 0) {
            msg = 'Execution stopped with status: ' + code;
            if (!cmd.options.debug || !cmd.options.verbose) {
                msg += ' Retry with --debug --verbose for more information.';
            }
            cmd.error(msg);
        }

        /* eslint-disable no-process-exit */
        process.exit(code);
        /* eslint-enable no-process-exit */
    });

    return 0;
};


/**
 * Performs any final processing of the argument list prior to execution.
 * @param {Array.<String>} arglist The argument list to finalize.
 * @returns {Array.<String>} The finalized argument list.
 */
Cmd.prototype.finalizeArglist = function(arglist) {
    var args;

    args = Cmd.Parent.prototype.finalizeArglist.call(this, arglist);

    if (args.indexOf('--tap') === -1 &&
            args.indexOf('--no-tap') === -1) {
        args.push('--tap');
    }

    return args;
};


/**
 * Returns a list of options/flags/parameters suitable for command completion.
 * @returns {Array.<string>} The list of options for this command.
 */
Cmd.prototype.getCompletionOptions = function() {
    var list,
        plist;

    list = Cmd.Parent.prototype.getCompletionOptions.call(this);
    plist = Cmd.Parent.prototype.getCompletionOptions();

    return CLI.subtract(plist, list);
};


/**
 * Computes and returns the proper profile to boot in support of the TSH.
 * @returns {String} The profile to boot.
 */
Cmd.prototype.getBootProfile = function() {
    if (this.options.selftest) {
        return '~lib_etc/headless/headless@selftest';
    }

    return Cmd.Parent.prototype.getBootProfile.call(this);
};


/**
 * Computes and returns the TIBET Shell script command line to be run.
 * @returns {String} The TIBET Shell script command to execute.
 */
Cmd.prototype.getScript = function() {

    var script,
        target,
        context,
        prefix,
        ignore;

    script = '';

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
        script = prefix + ' \'' + target + '\'';
    } else {
        script = prefix;
    }

    if (CLI.notEmpty(this.options.suite)) {
        script = script.trim() + ' -suite=\'' + this.options.suite + '\'';
    }

    //  Don't default context for this command. Let the object being targeted
    //  define the context based on its nsRoot once the shell resolves it.
    context = this.options.context;
    if (CLI.notEmpty(context)) {
        script = script.trim() + ' -context=\'' + context + '\'';
    } else if (CLI.isEmpty(target)) {
        script += ' -context=\'' + (CLI.inProject() ? 'app' : 'lib') + '\'';
    }

    if (this.options.selftest) {
        script += ' -ignore_only';
    } else {
        ignore = this.options['ignore-only'];
        if (ignore === true) {
            script += ' -ignore_only';
        }

        ignore = this.options['ignore-skip'];
        if (ignore === true) {
            script += ' -ignore_skip';
        }
    }

    if (this.options.inherit) {
        script += ' -inherit';
    }

    if (this.options.subtypes) {
        script += ' -subtypes';
    }

    if (CLI.notEmpty(this.options.cases)) {
        script = script.trim() + ' -cases=\'' + this.options.cases + '\'';
    }

    return script;
};


/**
 * Verify any command prerequisites are in place.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.prereqs = function() {
    var karmafile;

    if (this.options.karma) {
        this.info('Checking project for karma configuration...');
        karmafile = path.join(CLI.getAppHead(), Cmd.KARMA_FILE);
        if (sh.test('-e', karmafile) && sh.which(Cmd.KARMA_COMMAND)) {
            return 0;
        }
        this.warn('karma not configured/installed for project.');
    }

    //  Parent will check other prereq availability.
    return Cmd.Parent.prototype.prereqs.call(this);
};


module.exports = Cmd;

}());
