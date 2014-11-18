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
Cmd.CONTEXT = CLI.CONTEXTS.ANY;


/**
 * The default path to the TIBET-specific phantomjs TSH script runner.
 * @type {String}
 */
Cmd.DEFAULT_RUNNER = '~lib_etc/phantom/phantomtsh.js';


//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {String}
 */
Cmd.prototype.HELP =
'Runs the TIBET phantomtsh script runner to execute a TSH script.\n\n' +

'The script to execute is presumed to be the first argument, quoted as\n' +
'needed to ensure that it can be captured as a single string to pass to\n' +
'the TIBET Shell. For example: tibet tsh \':echo "Hello World!"\'.\n' +
'You can also use the --script argument to provide the TSH script.\n\n' +

'<phantomtsh_args] refers to the various flags and paramters you can\n' +
'provide to TIBET\'s phantomtsh.js script. To see phantomtsh.js help\n' +
'use \'phantomjs ${TIBET_HOME}/etc/phantom/phantomtsh.js --help\n' +
'where ${TIBET_HOME} refers to your TIBET installation directory.\n';

/**
 * Command argument parsing options. Note that most of these are based on the
 * values suitable for the phantomtsh.js script so they can be parsed properly
 * for passing to that routine.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
{
    'boolean': ['color', 'errimg', 'help', 'usage', 'debug', 'tap',
        'system', 'quiet'],
    'string': ['script', 'url', 'profile', 'params', 'level'],
    'number': ['timeout'],
    'default': {
        color: true
    }
},
Parent.prototype.PARSE_OPTIONS);

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE = 'tibet tsh <script> [<phantomtsh_args>]';

//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 */
Cmd.prototype.execute = function() {

    var proc,       // The child_process module.
        child,      // The spawned child process.
        tshpath,    // Path to the TIBET Shell runner script.
        cmd,        // Local binding variable.
        debug,      // Flag for debug passed to phantomjs.
        arglist;    // The argument list to pass to phantomjs.

    proc = require('child_process');

    cmd = this;

    // Verify we can find the shell runner script.
    tshpath = CLI.expandPath(Cmd.DEFAULT_RUNNER);
    if (!sh.test('-e', tshpath)) {
        this.error('Cannot find runner at: ' + tshpath);
        return 1;
    }

    // Access the argument list. Subtypes can adjust how they assemble this to
    // alter the default behavior.
    arglist = this.getPhantomArglist();

    // Finalize it, giving subtypes a chance to tweak the arguments as needed.
    arglist = this.finalizePhantomArglist(arglist);

    // If no arglist then we presubably output usage() and are just returning.
    if (!arglist) {
        return;
    }

    // Push the path to our script runner onto the front so our command line is
    // complete.
    arglist.unshift(tshpath);

    // Push an additional debug flag specific to phantom if set.
    if (this.options.debug) {
        arglist.unshift(true);
        arglist.unshift('--debug');
    }

    this.debug('phantomjs ' + arglist.join(' '));

    // Run the script via phantomjs which should load/execute in a TIBET client
    // context for us.
    child = proc.spawn('phantomjs', arglist);

    child.stdout.on('data', function(data) {

        if (CLI.isValid(data)) {
            // Copy and remove newline.
            var msg = data.slice(0, -1).toString('utf-8');

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
        if (code !== 0) {
            cmd.error('Execution stopped with status: ' + code);
        }
        /* eslint-disable no-process-exit */
        process.exit(code);
        /* eslint-enable no-process-exit */
    });
};


/**
 * Performs any final processing of the argument list prior to execution. The
 * default implementation does nothing but subtypes can leverage this method
 * to ensure the command line meets their specific requirements.
 * @param {Array.<String>} arglist The argument list to finalize.
 * @return {Array.<String>} The finalized argument list.
 */
Cmd.prototype.finalizePhantomArglist = function(arglist) {
    return arglist;
};


/**
 * Returns an array of arguments to be passed to a spawn() operation used to
 * invoke phantomjs. Subtypes can override this to default their behavior in
 * different ways.
 * @return {Array.<String>}
 */
Cmd.prototype.getPhantomArglist = function() {

    var script,     // The script to run.
        arglist,    // Array of parameters to spawn.
        cmd;

    cmd = this;

    arglist = [];

    // Without a script we can't run so verify that we got something useful.
    script = this.getScript();
    if (script === void(0)) {
        this.usage();
        return;
    }
    this.options.script = script;

    // Ensure we update the value for our profile. This is often computed based
    // on where the command is being executed.
    this.options.profile = this.getProfile();

    // Process string arguments. We need both key and value here.
    Cmd.prototype.PARSE_OPTIONS.string.forEach(function(key) {
        if (CLI.notEmpty(cmd.options[key])) {
            arglist.push('--' + key, cmd.options[key]);
        }
    });

    // Process number arguments. We need both key and value here.
    Cmd.prototype.PARSE_OPTIONS.number.forEach(function(key) {
        if (CLI.notEmpty(cmd.options[key])) {
            arglist.push('--' + key, cmd.options[key]);
        }
    });

    // Process boolean arguments. These are just the key with --no- if the value
    // is false.
    Cmd.prototype.PARSE_OPTIONS.boolean.forEach(function(key) {
        if (CLI.notEmpty(cmd.options[key])) {
            if (cmd.options[key]) {
                arglist.push('--' + key);
            } else {
                arglist.push('--no-' + key);
            }
        }
    });

    return arglist;
};


/**
 * Computes and returns the proper profile to boot in support of the TSH.
 * Profiles can vary based on project location (as can the URL).
 * @return {String} The profile to boot.
 */
Cmd.prototype.getProfile = function() {

    var profile;

    if (CLI.notEmpty(this.options.profile)) {
        profile = this.options.profile;
    }

    return profile;
};


/**
 * Computes and returns the TIBET Shell script command line to be run.
 * @return {String} The TIBET Shell script command to execute.
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
 * @return {Number} A return code. Non-zero indicates an error.
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
