//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * A script runner specific to loading and executing TIBET Shell commands within
 * the context of PhantomJS. The primary value of this script is that it allows
 * the execution of TIBET commands such as the tsh:test command (which runs unit
 * tests) to be triggered from the command line The 'tibet tsh' command is a
 * wrapper for invoking this script for just such a purpose.
 *
 * For maximum flexibility and to avoid spurious timeout errors this program
 * depends on an 'idle timeout' rather than an 'elapsed time' timeout. As long
 * as the script being run is actively outputting to the console or invoking the
 * phantomjs callback handler it will keep running without timing out. The
 * default timeout is 5 seconds. A separate boot timeout is typically set to
 * the default timeout * 3 or 15 seconds by default.
 */

/*eslint no-eval:0*/
/*global phantom:false, require:false*/
(function(root) {

    var fs,
        system,
        minimist,
        PhantomTSH;

    fs = require('fs');
    system = require('system');
    minimist = require('minimist');

    //  ---
    //  PhantomTSH
    //  ---

    /**
     * A common root object for all our functionality.
     */
    PhantomTSH = {};


    //  ---
    //  Constants
    //  ---

    /**
     * A set of color codes used to wrap text output to the console. Used by the
     * PhantomTSH.color() method to colorize console output.
     * @type {Object.<String, Array>}
     */
    PhantomTSH.COLORS = {
        gray: ['\x1B[90m', '\x1B[39m'],     // admin output
        yellow: ['\x1B[33m', '\x1B[39m'],   // warning output
        green: ['\x1B[32m', '\x1B[39m'],    // passing/debug output
        magenta: ['\x1B[35m', '\x1B[39m'],  // error, non-fatal
        red: ['\x1B[31m', '\x1B[39m'],      // severe/fatal output
        white: ['\x1B[37m', '\x1B[39m'],    // general logging
        blue: ['\x1B[34m', '\x1B[39m'],     // currently unused
        cyan: ['\x1B[36m', '\x1B[39m']      // currently unused
    };

    /**
     * The default logging level. Roughly equivalent to the logging levels from
     * the TIBET boot system (ALL, TRACE, DEBUG, INFO, WARN, ERROR, SEVERE,
     * FATAL, SYSTEM) running from 0 to N.
     * @type {Number}
     */
    PhantomTSH.DEFAULT_LEVEL = 5;       // default is ERROR

    /**
     * The default boot profile to attempt to load. This can be altered on the
     * command line via the --profile flag. The value here should be identical
     * to the form used on a TIBET boot url (e.g. 'development#teamtibet-full').
     * @type {String}
     */
    PhantomTSH.DEFAULT_PROFILE = '~lib_etc/phantom/phantom';

    /**
     * The number of milliseconds without output before execution of the script
     * will timeout. The default is a fairly short 5 seconds. You can adjust
     * using --timeout.
     * @type {Number}
     */
    PhantomTSH.DEFAULT_TIMEOUT = 5000;

    /**
     * The default URL to load. Value here is a TIBET startup page adapted to
     * the assumption we're loading from a subdirectory of ~app_root.
     * @type {String}
     */
    PhantomTSH.DEFAULT_URL = phantom.libraryPath + '/phantomtsh.xhtml';

    /**
     * Return code when there's a true error, as in a thrown exception etc.
     * @type {Number}
     */
    PhantomTSH.ERROR = 1;

    /**
     * Return code when the script runs but there were TSH errors, test
     * failures, etc.
     * @type {Number}
     */
    PhantomTSH.FAILURE = 2;

    /**
     * The command help string.
     * @type {String}
     */
    PhantomTSH.HELP =
        'Runs phantomjs to load TIBET and execute a TIBET Shell (TSH) script.\n\n' +

        'Leveraged by other TIBET command-line utilities such as \'tibet tsh\' or\n' +
        '\'tibet test\' to access TIBET Shell functionality from the command line.\n\n' +

        'Use --script to define the TSH script to run, quoting as needed for your\n' +
        'particular shell. For example, --script \':echo "Hi"\'\n\n' +

        'You can use --profile to alter the profile used regardless of the boot URL.\n' +
        'Using a different boot profile is the best way to alter what code TIBET will\n' +
        'load prior to running your script. The profile value should match the form\n' +
        'used on a TIBET launch URL: namely a config.xml#id pattern pointing to the\n' +
        'manifest file and config tag you want to use as your boot profile.\n\n' +

        'You should not normally need to alter the url used to boot TIBET however\n' +
        'use --url to point to a different boot URL if you find that necessary.\n' +
        'The URL must point to a valid TIBET-enabled boot file to work properly.\n' +
        'A good test is trying to load your intended boot URL directly from an HTML5\n' +
        'browser. If TIBET can boot it into a supported browser from the file system\n' +
        'it should function properly inside of PhantomJS.\n\n' +

        '--params allows you to provide a URL-encoded string suitable for use as\n' +
        'a set of parameters for the URL to be used. Examples might be adding a\n' +
        'logging level by using --params \'boot.level=debug\' as a param string.\n\n' +

        '--timeout allows you to change the default idle timeout from 5 seconds to\n' +
        'some other value specified in milliseconds (5000 is 5 seconds). Note that\n' +
        'the timeout is an idle timeout meaning it is reset any time output is sent\n' +
        'to PhantomJS. There is no maximum amount of time an operation can run but\n' +
        'output must be sent to PhantomJS within the timeout period.\n\n' +

        'Additional <flags> for this command include:\n' +
        '\t[--color]   - Colorizes the output in the terminal. [true]\n' +
        '\t[--errimg]  - Capture PhantomError_{ts}.png onError. [false]\n' +
        '\t[--tap]     - Specifies test anything protocol format. [false]\n' +
        '\t[--debug]   - Activates additional debugging output. [false]\n' +
        '\t[--quiet]   - Silences startup/finish message display. [false]\n' +
        '\t[--system]  - Activates system-level message display. [false]\n' +
        '\t[--level]   - Sets the TIBET logging level filter. [ERROR]\n' +
        '\t[--help]    - Outputs this content along with the usage string.\n' +
        '\t[--usage]   - Outputs the usage string.\n';

    /**
     * Logging levels used by --level parameter processing to determine the
     * proper level to filter message output.
     * @type {Object}
     */
    PhantomTSH.LEVELS = {
        ALL: 0,
        TRACE: 1,
        DEBUG: 2,
        INFO: 3,
        WARN: 4,
        ERROR: 5,
        SEVERE: 6,
        FATAL: 7,
        SYSTEM: 8,
        OFF: 9
    };

    /**
     * Option list defining command line flag parser options for minimist.
     * @type {Object}
     */
    PhantomTSH.PARSE_OPTIONS = {
        'boolean': ['color', 'errimg', 'help', 'usage', 'debug', 'tap',
            'system', 'quiet'],
        'string': ['script', 'url', 'profile', 'params'],
        'number': ['timeout'],
        'default': {
            color: true
        }
    };

    /**
     * Return code when everything succeeds (both this script and the TSH script
     * which is run).
     * @type {Number}
     */
    PhantomTSH.SUCCESS = 0;

    /**
     * A string used when --tap is true so that any output produced which isn't
     * properly formatted for TAP will be output as an annotated TAP comment.
     */
    PhantomTSH.TAP_PREFIX = '# ';

    /**
     * The command usage string.
     * @type {String}
     */
    PhantomTSH.USAGE = 'phantomjs phantomtsh.js --script <script> ' +
        '[--url <url>] [--profile <profile>] [--timeout <timeout>] [--help] [<flags>]';


    //  ---
    //  Attributes
    //  ---

    /**
     * Argument list as parsed by minimist.
     * @type {Array}
     */
    PhantomTSH.argv = null;

    /**
     * Buffer for managing console output more effectively.
     * @type {Array}
     */
    PhantomTSH.buffer = [];

    /**
     * A date stamp for the last activity (logging typically) which was observed
     * from the loaded content. Used to drive activity-based timeout processing.
     * @type {Date}
     */
    PhantomTSH.lastActivity = null;

    /**
     * Reference to the last message logged. Used to determine if an error has
     * already been logged so we can skip logging in onError handler.
     * @type {String}
     */
    PhantomTSH.lastMessage = null;

    /**
     * The logging level used to filter output coming from the TIBET client.
     * @type {Number}
     */
    PhantomTSH.level = null;

    /**
     * The PhantomJS page object used to manage the PhantomJS interface.
     * @type {Page}
     */
    PhantomTSH.page = require('webpage').create();

    /**
     * The script text to run. This should be a valid command line for TSH.
     * @type {String}
     */
    PhantomTSH.script = null;

    /**
     * Millisecond representation of the initial start time. Used to compute the
     * full execution time of the script.
     * @type {Number}
     */
    PhantomTSH.start = null;

    /**
     * Millisecond representation of the exec start time. Used to compute the
     * actual TIBET time evaluation the TSH source.
     * @type {Number}
     */
    PhantomTSH.startExec = null;

    /**
     * A status code managed primarily by the TAP handler logic which tells the
     * script what final status code to use when exiting (if none is provided).
     */
    PhantomTSH.status = null;

    /**
     * Number of milliseconds allowed before the initial startup sequence times
     * out. The default is 3 times the DEFAULT_TIMEOUT or 15 seconds, which
     * should be adequate even for a script-by-script developer load sequence.
     * @type {Number}
     */
    PhantomTSH.startup = PhantomTSH.DEFAULT_TIMEOUT * 3;

    /**
     * General timer for ensuring we eventually time out if there are issues
     * with the command (or it simply runs too long).
     * @type {Timer}
     */
    PhantomTSH.timer = null;

    /**
     * The number of milliseconds without output before execution of the script
     * will timeout. Set to DEFAULT_TIMEOUT unless --timeout is set on the
     * command line.
     * @type {Number}
     */
    PhantomTSH.timeout = null;

    /**
     * The url to load on startup. Defaults to PhantomTSH.DEFAULT_URL.
     * @type {String}
     */
    PhantomTSH.url = null;


    //  ---
    //  Methods
    //  ---

    /**
     * Returns the string wrapped in color codes appropriate to the specified
     * color name. The color name must be found in PhantomTSH.COLORS.
     * @param {String} string The string to color.
     * @param {String} color The name of the color to be used.
     * @return {String} The colorized string, if the color is found.
     */
    PhantomTSH.color = function(string, color) {
        var pair;

        if (PhantomTSH.argv.color === false) {
            return string;
        }

        pair = PhantomTSH.COLORS[color];
        if (!pair) {
            return string;
        }

        return pair[0] + string + pair[1];
    };


    /**
     * Executes the TIBET shell script provided using the TP.shell() primitive.
     * The PhantomTSH.page.onCallback routine is invoked with the result JSON.
     * @param {String} tshInput The TSH command line to execute.
     */
    PhantomTSH.exec = function(tshInput) {
        var handler,
            result;

        handler = function(aSignal, stdioResults) {
            var str;

            if (TP.canInvoke(stdioResults, 'push')) {
                if (TP.isValid(aSignal)) {
                    stdioResults.push(aSignal.getResult());
                }
            }

            if (TP.notEmpty(stdioResults)) {
                try {
                    str = JSON.stringify(stdioResults);
                } catch (e) {
                    str = TP.str(stdioResults);
                }

                if (TP.isEmpty(str)) {
                    str = TP.boot.$dump(stdioResults);
                }
            }

            try {
                if (window.callPhantom) {
                    window.callPhantom(str);
                } else {
                    top.console.log(str);
                }
            } catch (e) {
                top.console.log('ERROR ' + e.message);
                return;
            }
        };

        TP.shell(TP.hc(
            'cmdSrc', tshInput,         // the TSH input to run
            'cmdEcho', false,           // don't echo the request
            'cmdHistory', false,        // don't create a history entry
            'cmdSilent', false,         // report output so we can capture it
            'success', handler,         // success handler (same handler)
            'failure', handler));       // failure handler (same handler)

        return;
    };


    /**
     * Terminates execution, optionally providing a reason and an exit code.
     * @param {String} reason The error message or status message to output.
     * @param {Number} code The process exit code. Non-zero indicates an error.
     */
    PhantomTSH.exit = function(reason, code) {
        var status,
            now,
            msg,
            color;

        if (PhantomTSH.buffer.length > 0) {
            console.log(PhantomTSH.buffer.join('\n'));
            PhantomTSH.buffer.length = 0;
        }

        /* eslint-disable no-nested-ternary */
        status = PhantomTSH.status === null ?
            (code === undefined ? 0 : code) :
            PhantomTSH.status;
        /* eslint-enable no-nested-ternary */

        if (status === 0) {
            color = 'white';
        } else {
            color = 'red';
        }

        if (reason && reason.length) {
            PhantomTSH.log(reason, color);
        }

        if (!PhantomTSH.argv.quiet) {
            now = new Date().getTime();

            msg = 'Finished in ' +
                (now - PhantomTSH.start) + ' ms' +
                ' w/TSH exec time of ' +
                (PhantomTSH.startExec ? (now - PhantomTSH.startExec) : 0) + ' ms.';

            PhantomTSH.log(msg, 'gray');
        }

        phantom.exit(status);
    };


    /**
     * Outputs simple help/usage information.
     */
    PhantomTSH.help = function() {

        // For help we output an extra leading blank line prior to usage.
        console.log('');
        this.usage(false);

        console.log('\n' + PhantomTSH.HELP);

        phantom.exit(0);
    };


    /**
     * Logs a message, prefixing it as a TAP comment if in TAP mode.
     * @param {String} message The string to output.
     * @param {String} color The name of a color to use for output.
     */
    PhantomTSH.log = function(message, color) {
        var level,
            msg;

        msg = '' + message;

        // Determine the level of the message, if any. The parse here depends on
        // TIBET sending a level as a part of the message output, which is
        // normally only done by the phantomReporter in the TIBET boot code.
        if (/^TRACE/i.test(msg)) {
            level = 1;
        } else if (/^DEBUG/i.test(msg)) {
            level = 2;
        } else if (/^INFO/i.test(msg)) {
            level = 3;
        } else if (/^WARN/i.test(msg)) {
            level = 4;
        } else if (/^ERROR/i.test(msg)) {
            level = 5;
        } else if (/^SEVERE/i.test(msg)) {
            level = 6;
        } else if (/^FATAL/i.test(msg)) {
            level = 7;
        } else if (/^SYSTEM/i.test(msg)) {

            if (!PhantomTSH.argv.system) {
                return;
            }

            level = 8;
        }

        // If we have a level verify we should continue processing it.
        if (level !== void(0) && PhantomTSH.level > level) {
            return;
        }

        if (PhantomTSH.argv.tap) {
            msg = PhantomTSH.TAP_PREFIX + msg;
        }

        // If color is explicit we go with that, otherwise we check the content
        // to see if it matches a typical output format from TIBET itself.
        if (color !== void(0)) {
            msg = PhantomTSH.color(msg, color);
        } else {
            if (/^TRACE/i.test(msg)) {
                msg = PhantomTSH.color(msg, 'gray');
            } else if (/^DEBUG/i.test(msg)) {
                msg = PhantomTSH.color(msg, 'green');
            } else if (/^INFO/i.test(msg)) {
                msg = PhantomTSH.color(msg, 'white');
            } else if (/^WARN/i.test(msg)) {
                msg = PhantomTSH.color(msg, 'yellow');
            } else if (/^ERROR/i.test(msg)) {
                msg = PhantomTSH.color(msg, 'magenta');
            } else if (/^(SEVERE|FATAL)/i.test(msg)) {
                msg = PhantomTSH.color(msg, 'red');
            } else if (/^SYSTEM/i.test(msg)) {
                msg = PhantomTSH.color(msg, 'cyan');
            } else {
                msg = PhantomTSH.color(msg, 'white');
            }
        }

        PhantomTSH.buffer.push(msg);

        if (PhantomTSH.buffer.length > 5) {
            console.log(PhantomTSH.buffer.join('\n'));
            PhantomTSH.buffer.length = 0;
        }
    };


    /**
     * Main execution trigger. Invocation of this call starts the phantom
     * loading process. The url is opened, the opened() callback is triggered,
     * that callback passes control to the tsh() call which calls exec() which
     * triggers the page.onCallback hook function.
     */
    PhantomTSH.main = function() {
        var index,
            root,
            fragment;

        PhantomTSH.start = (new Date()).getTime();
        PhantomTSH.parse();

        if (!PhantomTSH.argv.quiet && PhantomTSH.argv.debug) {
            PhantomTSH.log('Starting PhantomJS ' +
                    phantom.version.major + '.' +
                    phantom.version.minor + '.' +
                    phantom.version.patch +
                    ' at ' + (new Date()).toLocaleString(),
                'gray');

            if (PhantomTSH.argv.debug) {
                index = PhantomTSH.url.indexOf('#');
                root = PhantomTSH.url.slice(0, index);
                fragment = PhantomTSH.url.slice(index + 1);
                PhantomTSH.log(root, 'gray');
                PhantomTSH.log(fragment, 'gray');
            }
        }

        //  Flip flags to allow liberal content loading (cross-origin XHR,
        //  'file://' URLs and the like).
        PhantomTSH.page.settings.localToRemoteUrlAccessEnabled = true;
        PhantomTSH.page.settings.webSecurityEnabled = false;

        PhantomTSH.page.open(PhantomTSH.url, PhantomTSH.opened);
    };


    /**
     * Handle notification that the page.open operation has completed. The page
     * open may or may not have been successful. The status should be 'success'
     * if there were no issues opening the page/url.
     * @param {String} status The open status.
     */
    PhantomTSH.opened = function(status) {

        //  Check for page load success
        if (status !== 'success') {
            PhantomTSH.exit(
                PhantomTSH.color('Error opening URL: ', 'red') + PhantomTSH.url,
                PhantomTSH.ERROR);
        } else {
            // Wait for TIBET to be available
            PhantomTSH.wait(
                function() {
                    var tibetStarted;

                    tibetStarted = PhantomTSH.page.evaluate(
                        function() {
                            // Provide a way to detect boot failures and avoid
                            // simply waiting for a timeout.
                            if (TP &&
                                TP.boot &&
                                TP.boot.$$stop) {
                                return TP.boot.$$stop;
                            }

                            if (TP &&
                                TP.sys &&
                                TP.sys.hasStarted) {
                                return TP.sys.hasStarted();
                            }

                            return false;
                        });

                    if (typeof tibetStarted === 'string') {
                        throw new Error('Stopped: ' + tibetStarted);
                    }
                    return tibetStarted;
                },
                function() {
                    PhantomTSH.startExec = new Date().getTime();

                    if (!PhantomTSH.argv.quiet) {
                        PhantomTSH.log('TIBET loaded. Starting execution at ' +
                            (PhantomTSH.startExec - PhantomTSH.start) + ' ms.',
                            'gray');
                    }

                    //  It is important for somewhere in the 'tsh' function to
                    //  call PhantomTSH.exit()!
                    PhantomTSH.tsh();
                },
                PhantomTSH.startup);
        }
    };


    /**
     * Processes any command line arguments in preparation for execution.
     */
    PhantomTSH.parse = function() {
        var argv,
            level;

        argv = minimist(system.args);
        PhantomTSH.argv = argv;

        if (argv.help) {
            PhantomTSH.help();
        }

        if (argv.usage || !argv.script) {
            PhantomTSH.usage();
        }

        if (argv.level) {
            level = PhantomTSH.LEVELS[argv.level.toUpperCase()];
            if (level !== void(0)) {
                PhantomTSH.level = level;
            } else {
                PhantomTSH.level = PhantomTSH.DEFAULT_LEVEL;
            }
        } else {
            PhantomTSH.level = PhantomTSH.DEFAULT_LEVEL;
        }

        if (PhantomTSH.argv.debug) {
            PhantomTSH.log(JSON.stringify(argv));
        }

        PhantomTSH.script = argv.script;

        PhantomTSH.url = argv.url || PhantomTSH.DEFAULT_URL;
        PhantomTSH.url = fs.absolute(PhantomTSH.url);

        PhantomTSH.url += '#boot.profile="' +
            (argv.profile || PhantomTSH.DEFAULT_PROFILE) + '"';

        if (argv.params) {
            PhantomTSH.url += '&' + argv.params;
        }

        PhantomTSH.timeout = argv.timeout || PhantomTSH.DEFAULT_TIMEOUT;
    };

    /**
     * Performs basic TAP-format output processing.
     * @param {String} msg The TAP-formatted message to process.
     */
    PhantomTSH.tap = function(msg) {

        var str;

        if (/^#/.test(msg)) {
            // comment
            if (/^# PASS:/.test(msg)) {
                str = PhantomTSH.color(msg, 'green');
            } else if (/^# FAIL:/.test(msg)) {
                str = PhantomTSH.color(msg, 'red');
            } else {
                str = PhantomTSH.color(msg, 'gray');
            }
        } else if (/^not ok/.test(msg)) {
            // bad, but might be todo item...
            if (/# TODO/.test(msg)) {
                // warning but basically ignored
                str = PhantomTSH.color('not ok', 'yellow') + msg.slice(6);
            } else {
                // true error
                str = PhantomTSH.color('not ok', 'red') + msg.slice(6);
                PhantomTSH.status = -1;
            }
        } else if (/^ok/.test(msg)) {
            // passed
            str = PhantomTSH.color('ok', 'green') + msg.slice(2);
        } else if (/^bail out!/i.test(msg)) {
            // termination signal
            str = PhantomTSH.color('Bail out!', 'red') + msg.slice(8);
            PhantomTSH.status = -1;
        } else if (/^\d{1}\.\.\d+$/.test(msg)) {
            str = msg;
        } else {
            str = PhantomTSH.color(msg, 'magenta');
        }

        PhantomTSH.buffer.push(str);

        if (PhantomTSH.buffer.length > 5) {
            console.log(PhantomTSH.buffer.join('\n'));
            PhantomTSH.buffer.length = 0;
        }
    };

    /**
     * Triggers execution of the page.evaluate function which loads our
     * execution logic and the script we want to run.
     */
    PhantomTSH.tsh = function() {

        PhantomTSH.lastActivity = new Date().getTime();
        PhantomTSH.timer = setInterval(function() {
            var now = new Date().getTime();
            if (now - PhantomTSH.lastActivity > PhantomTSH.timeout) {
                clearInterval(PhantomTSH.timer);
                PhantomTSH.exit(PhantomTSH.color('Operation timed out.', 'red'),
                    PhantomTSH.ERROR);
            }
        }, 250);

        PhantomTSH.page.evaluate(PhantomTSH.exec, PhantomTSH.script);
    };


    /**
     * Outputs simple usage information. Used as part of help() or as a
     * standalone usage output routine.
     * @param {Boolean} exit If explicitly false don't exit after output.
     */
    PhantomTSH.usage = function(exit) {
        console.log('Usage: ' + PhantomTSH.USAGE);

        if (exit !== false) {
            phantom.exit(0);
        }
    };


    /**
     * Cleansed version of waitFor() function from PhantomJS web site. This
     * function is used to test for load completion. If the testFunction returns
     * true the wait will end and the onReady function will be invoked. If the
     * amount of time specified by timeOutMillis expires before the testFunction
     * returns true the entire process will time out.
     * @param {Function} isReady A function returning true when ready.
     * @param {Function} onReady A function to run when ready.
     * @param {Number} timeOutMillis A millisecond timeout duration.
     */
    PhantomTSH.wait = function(isReady, onReady, timeOutMillis) {
        var timeout,  // milliseconds before we time out.
            start,    // start time in milliseconds (now).
            ready,    // is test condition fulfilled?
            interval; // the interval used to retest ready state.

        timeout = timeOutMillis ? timeOutMillis : PhantomTSH.timeout;
        ready = false;
        start = new Date().getTime();
        interval = setInterval(function() {
            var now = new Date().getTime();

            if ((now - start < timeout) && !ready) {
                try {
                    ready = isReady();
                } catch (e) {
                    if (/Stopped/.test(e.message)) {
                        PhantomTSH.exit(
                            PhantomTSH.color(e.message, 'red'),
                            PhantomTSH.ERROR);
                    } else {
                        PhantomTSH.exit(
                            PhantomTSH.color('Error in ready check: ' +
                                e.message, 'red'),
                            PhantomTSH.ERROR);
                    }
                }
            } else {
                if (!ready) {
                    // Ran out of time...
                    PhantomTSH.exit(
                        PhantomTSH.color('Operation timed out.', 'red'),
                        PhantomTSH.ERROR);
                } else {
                    // Ready in time...clear the status check interval and our
                    // overall timeout for startup.
                    window.clearInterval(interval);
                    window.clearTimeout(PhantomTSH.timer);
                    try {
                        onReady();
                    } catch (e) {
                        PhantomTSH.exit(
                            PhantomTSH.color('Error in ready function: ' +
                                e.message, 'red'),
                            PhantomTSH.ERROR);
                    }
                }
            }

        }, 100);
    };


    //  ---
    //  PhantomTSH.page Methods
    //  ---

    /**
     * Handle notification that a window.callPhantom call has been made. This is
     * one way for the loaded code to call out to the invoking phantom script.
     * @param {String} result The callback data.
     */
    PhantomTSH.page.onCallback = function(data) {
        var results,
            code;

        PhantomTSH.lastActivity = new Date().getTime();

        if (!data) {
            PhantomTSH.exit(PhantomTSH.color('Failed: ', 'yellow') +
                'No result data.', PhantomTSH.FAILURE);
        }

        try {
            // Data should be a JSON string we can reconstitute.
            results = JSON.parse(data);
        } catch (e) {
            // If we can't reconstitute from JSON we consider that failure.
            PhantomTSH.exit(data, PhantomTSH.FAILURE);
        }

        code = PhantomTSH.SUCCESS;

        results.forEach(function(item) {
            if (!item) {
                return;
            }
            switch (item.meta) {
                case 'notify':
                    PhantomTSH.log(PhantomTSH.color(item.data), 'yellow');
                    break;
                case 'stdin':
                    PhantomTSH.log(PhantomTSH.color(item.data), 'magenta');
                    break;
                case 'stdout':
                    PhantomTSH.log(PhantomTSH.color(item.data), 'white');
                    break;
                case 'stderr':
                    PhantomTSH.log(PhantomTSH.color(item.data), 'red');
                    code = PhantomTSH.FAILURE;
                    break;
                default:
                    break;
            }
        });

        PhantomTSH.exit('', code);
    };


    /**
     * Handle notification of console output within PhantomJS and redirect it to
     * the Node.js console.
     * @param {String} msg The output message.
     */
    PhantomTSH.page.onConsoleMessage = function(msg) {

        PhantomTSH.lastMessage = '' + msg;

        PhantomTSH.lastActivity = new Date().getTime();

        // If we're doing TAP-complaint processing then redirect.
        if (PhantomTSH.argv.tap) {
            PhantomTSH.tap('' + msg);
        } else {
            PhantomTSH.log('' + msg);
        }
    };


    /**
     * Handle notification of an error within the PhantomJS engine and report it
     * to the Node.js console.
     * @param {String} msg The error message.
     * @param {Array.<Object>} trace A rough stack trace object.
     */
    PhantomTSH.page.onError = function(msg, trace) {
        var str;

        if (PhantomTSH.argv.errimg) {
            PhantomTSH.page.render('PhantomError_' + (new Date().getTime()) + '.png');
        }

        // Only log errors if the application didn't just do it for us. Usually
        // TIBET will log an error if it can and we don't want duplicate output.
        if (!/in file:/.test(PhantomTSH.lastMessage)) {
            str = 'Error in page: ' + msg + ' @\n';
            trace.forEach(function(item) {
                str += '\t' + item.file + ':' + item.line + '\n';
            });
        }

        if (PhantomTSH.buffer.length > 0) {
            console.log(PhantomTSH.buffer.join('\n'));
            PhantomTSH.buffer.length = 0;
        }

        PhantomTSH.exit(str, PhantomTSH.ERROR);
    };


    //  ---
    //  Execute...
    //  ---

    PhantomTSH.main();

}(this));
