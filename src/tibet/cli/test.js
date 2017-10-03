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

// NOTE this is a subtype of the 'tsh' command focused on running :test.
Cmd = function() {
    //  empty
};
Cmd.Parent = require('./tsh');
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
 * The default path to the TIBET-specific phantomjs test runner.
 * @type {string}
 */
Cmd.DEFAULT_RUNNER = Cmd.Parent.DEFAULT_RUNNER;

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
        'boolean': ['selftest', 'ignore-only', 'ignore-skip', 'tap', 'ok',
            'karma'],
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
Cmd.prototype.USAGE = 'tibet test [<target>|<suite>] [--target <target>] [--suite <suite>] [--cases <casename>] [--ignore-only] [--ignore-skip] [--no-tap] [--no-ok] [--remote-debug-port <portnumber>] [--profile <profile>] [--config <config>]';

//  ---
//  Instance Methods
//  ---

/**
 * Execute either Karma or PhantomJS-based testing.
 */
Cmd.prototype.execute = function() {
    var karmafile;

    if (this.options.karma) {
        //  Not really checking as much as calling when available and falling
        //  through when not so we default back down to phantomjs.
        karmafile = path.join(CLI.getAppHead(), Cmd.KARMA_FILE);
        if (sh.test('-e', karmafile) && sh.which(Cmd.KARMA_COMMAND)) {
            return this.executeViaKarma();
        }
    }

    //  Defer back to parent version which will trigger normal invocation of
    //  things like our finalizeArglist/processScript etc. to run phantomjs.
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
    child = proc.spawn(sh.which(Cmd.KARMA_COMMAND), args);

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

    child.on('close', function(code) {
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

    if (arglist.indexOf('--tap') === -1 &&
            arglist.indexOf('--no-tap') === -1) {
        arglist.push('--tap');
    }

    return arglist;
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
Cmd.prototype.getProfile = function() {

    var profile;

    if (CLI.notEmpty(this.options.profile)) {
        profile = this.options.profile;
    }

    if (this.options.selftest) {
        profile = '~lib_etc/phantom/phantom@selftest';
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


/**
 * Verify any command prerequisites are in place. In this case phantomjs must be
 * a binary we can locate.
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

    //  Parent will check phantomjs availability.
    return Cmd.Parent.prototype.prereqs.call(this);
};


module.exports = Cmd;

}());
