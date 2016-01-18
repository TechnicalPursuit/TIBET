//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview A base command type which runs TIBET shell within the context of
 *     the phantomtsh script runner. The script to run can be provided as a
 *     quoted string or as the value for the command argument --script. All
 *     remaining arguments are processed and passed to phantomtsh.js for use.
 */
//  ========================================================================

/*eslint indent:0*/

(function() {

'use strict';

var CLI,
    sh,
    Parent,
    Cmd;


CLI = require('./_cli');
sh = require('shelljs');


//  ---
//  Type Construction
//  ---

Parent = require('./_cmd');

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
 * The default path to the TIBET-specific phantomjs TSH script runner.
 * @type {String}
 */
Cmd.DEFAULT_RUNNER = '~lib_etc/phantom/phantomtsh.js';


//  ---
//  Instance Attributes
//  ---

/**
 * Command argument parsing options. Note that most of these are based on the
 * values suitable for the phantomtsh.js script so they can be parsed properly
 * for passing to that routine.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
{
    'boolean': ['color', 'errimg', 'help', 'usage', 'debug', 'tap',
        'system', 'quiet'],
    'string': ['script', 'url', 'profile', 'params', 'level'],
    'number': ['timeout', 'remote-debug-port'],
    'default': {
        color: true
    }
},
Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE = 'tibet tsh <script> [<phantomtsh_args>]';

//  ---
//  Instance Methods
//  ---

/**
 * Perform phantom startup announcement as appropriate for the (sub)command.
 */
Cmd.prototype.announce = function() {

    var port,
        str;

    if (CLI.isValid(port = this.options['remote-debug-port'])) {

        str =
        'You\'ve configured TIBET to run using a remote debugger.\n' +
        'To begin a debugging session, follow these steps:\n\n' +

        '1. Navigate to this url using a browser:\n\n' +
            'http://localhost:' +
            port +
            '/webkit/inspector/inspector.html?page=1\n\n' +

        '2. Open the console by clicking the button in the lower\n' +
        'left corner and evaluate the following source code: \n\n' +
        '__run()\n\n' +
        'TIBET will then load and pause in the debugger.\n\n' +

        '3. Open a *second* browser window or tab and navigate to this\n' +
        'url:\n\n' +
            'http://localhost:' +
            port +
            '/webkit/inspector/inspector.html?page=2\n\n' +

        '4. Return to the *first* browser window or tab and click the\n' +
        '"Run" button (an arrow in the upper right hand corner)\n\n' +

        '5. Return to the *second* browser window or tab. TIBET will\n' +
        'be paused, ready for you to set breakpoints, etc.\n\n' +

        '6. Set your breakpoints, etc. and then click the "Run" button\n' +
        'in this browser window or tab.\n\n';

        this.info(str);
    }

    return;
};


/**
 * Perform the actual command processing logic.
 */
Cmd.prototype.execute = function() {

    var proc,       // The child_process module.
        child,      // The spawned child process.
        tshpath,    // Path to the TIBET Shell runner script.
        cmd,        // Local binding variable.
        script,     // The command script to run.
        arglist;    // The argument list to pass to phantomjs.

    proc = require('child_process');

    cmd = this;

    // Verify we can find the shell runner script.
    tshpath = CLI.expandPath(Cmd.DEFAULT_RUNNER);
    if (!sh.test('-e', tshpath)) {
        this.error('Cannot find runner at: ' + tshpath);
        return 1;
    }

    // Without a script we can't run so verify that we got something useful.
    script = this.getScript();
    if (script === void 0) {
        this.usage();
        return;
    }
    this.options.script = script;

    // Ensure we update the value for our profile. This is often computed based
    // on where the command is being executed.
    this.options.profile = this.getProfile();

    //  Push values into the config or we won't get them back in the arglist.
    TP.sys.setcfg('script', this.options.script);
    TP.sys.setcfg('profile', this.options.profile);

    // Access the argument list. Subtypes can adjust how they assemble this to
    // alter the default behavior.
    arglist = this.getArglist();
    if (CLI.isEmpty(arglist)) {
        return;
    }

    // Finalize it, giving subtypes a chance to tweak the arguments as needed.
    arglist = this.finalizeArglist(arglist);

    // If no arglist then we presubably output usage() and are just returning.
    if (!arglist) {
        return;
    }

    // Push the path to our script runner onto the front so our command line is
    // complete.
    arglist.unshift(tshpath);

    // Push an additional debug flag specific to phantom if set.
    if (this.options.debug && this.options.verbose) {
        arglist.unshift(true);
        arglist.unshift('--debug');
    }

    if (CLI.isValid(this.options['remote-debug-port'])) {
        arglist.unshift('--remote-debugger-port=' +
                        this.options['remote-debug-port']);
    }

    // Push app root value since Phantom can't properly determine that based on
    // where it loads (app vs. lib, tibet_pub or not, etc).
    arglist.push('--app-root=\'' + CLI.expandPath('~app') + '\'');

    this.debug('phantomjs ' + arglist.join(' '));

    this.announce();

    // Run the script via phantomjs which should load/execute in a TIBET client
    // context for us.
    child = proc.spawn('phantomjs', arglist);

    child.stdout.on('data', function(data) {
        var msg;

        if (CLI.isValid(data)) {
            // Copy and remove newline.
            msg = data.slice(0, -1).toString('utf-8');

            if (/SyntaxError: Parse error/.test(msg)) {
                // Bug in phantom script itself most likely.
                cmd.error(msg + ' in ' + tshpath);

                /* eslint-disable no-process-exit */
                process.exit(1);
                /* eslint-enable no-process-exit */
            }

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
};


/**
 * Computes and returns the full boot profile value, combining the profile
 * package name with any profile config ID.
 * @returns {String} The profile#config to boot.
 */
Cmd.prototype.getProfile = function() {

    var root,
        config;

    root = this.getProfileRoot();
    config = this.getProfileConfig();

    if (CLI.notEmpty(config)) {
        return root + '#' + config;
    }

    return root;
};


/**
 * Computes and returns the proper profile configuration to boot. This value is
 * appended to the value from getProfileRoot() to produce the full boot profile
 * value. Most commands use the same root but some will alter the configuration.
 * @returns {String} The profile config ID.
 */
Cmd.prototype.getProfileConfig = function() {
    return 'reflection';
};


/**
 * Computes and returns the proper profile to boot in support of the TSH. This
 * is the name of the package file, minus any specific boot config ID.
 * @returns {String} The profile root name.
 */
Cmd.prototype.getProfileRoot = function() {

    var profile;

    if (CLI.notEmpty(this.options.profile)) {
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

    var script;

    if (CLI.notEmpty(this.options.script)) {
        script = this.options.script;
    } else {
        // The options._ object holds non-qualified parameters. [0] is the
        // command name (tsh in this case). [1] should be the "script" to run.
        script = this.options._[1];
    }

    return script;
};


/**
 * Verify any command prerequisites are in place. In this case phantomjs must be
 * a binary we can locate.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.prereqs = function() {

    // Verify we can find a phantomjs binary of some form.
    if (!sh.which('phantomjs')) {
        this.warn('This command requires PhantomJS to be installed.\n' +
            'See http://phantomjs.org for installation info.');
        return 1;
    }

    return 0;
};

module.exports = Cmd;

}());
