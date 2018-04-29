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
 * the default timeout * 2 or 10 seconds by default.
 */

/* eslint no-eval:0, no-console:0 */

/* global phantom:false, require:false */

(function(root) {

    var fs,
        system,
        minimist,
        beautify,
        Color,
        PhantomTSH;

    fs = require('fs');
    system = require('system');
    minimist = require('minimist');
    beautify = require('js-beautify');

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
     * The default logging level. Roughly equivalent to the logging levels from
     * the TIBET boot system (ALL, TRACE, DEBUG, INFO, WARN, ERROR,
     * FATAL, SYSTEM) running from 0 to N.
     * @type {Number}
     */
    PhantomTSH.DEFAULT_LEVEL = 5;       // default is ERROR

    /**
     * The default boot profile to attempt to load. This can be altered on the
     * command line via the --profile flag. The value here should be identical
     * to the form used on a TIBET boot url (e.g. 'development@teamtibet-full').
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
     * How many rows go into the log buffer before we flush the console?
     * @type {Number}
     */
    PhantomTSH.FLUSH_LIMIT = 1;

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

        'You can use --boot.profile to alter the profile used regardless of boot URL.\n' +
        'Using a different boot profile is the best way to alter what code TIBET will\n' +
        'load prior to running your script. The profile value should match the form\n' +
        'used on a TIBET launch URL: namely a config.xml@id pattern pointing to the\n' +
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
        '\t[--errexit] - Exit the PhantomJS execution onError. [false]\n' +
        '\t[--ok]      - When outputting TAP form, include \'ok\'. [true]\n' +
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
        FATAL: 6,
        SYSTEM: 7,
        OFF: 8
    };

    /**
     * Option list defining command line flag parser options for minimist.
     * @type {Object}
     */
    /* eslint-disable quote-props */
    PhantomTSH.PARSE_OPTIONS = {
        'boolean': ['color', 'errexit', 'errimg', 'help', 'usage', 'debug',
            'tap', 'system', 'quiet', 'ok'],
        'string': ['script', 'url', 'params', 'level', 'app-root', 'contrast'],
        'number': ['timeout', 'remote-debug-port'],
        'default': {
            color: true,
            ok: true
        }
    };
    /* eslint-enable quote-props */

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
    PhantomTSH.USAGE = 'phantomjs phantomtsh.js [--script <script>] ' +
        '[--url <url>] [--boot.profile <profile>] [--timeout <timeout>] ' +
        '[--help] [<flags>]';


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
     * Whether or not we're running in 'interactive mode'. If no script is
     * supplied (via the '--script' argument), then we run in interactive mode.
     * @type {Boolean}
     */
    PhantomTSH.interactive = false;

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
     * Tracks whether TIBET has loaded. This flag is used primarily to decide if
     * a resource error should terminate the phantom process or not. If an error
     * occurs prior to TIBET being loaded successfully the answer is true.
     * @type {Boolean}
     */
    PhantomTSH.loaded = false;

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
     * out. The default is 2 times the DEFAULT_TIMEOUT or 10 seconds, which
     * should be adequate even for a script-by-script developer load sequence.
     * @type {Number}
     */
    PhantomTSH.startup = PhantomTSH.DEFAULT_TIMEOUT * 2;

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
     * Executes the TIBET shell script provided using the TP.shellExec()
     * primitive. The PhantomTSH.page.onCallback routine is invoked with the
     * result JSON.
     * @param {String} tshInput The TSH command line to execute.
     * @param {Boolean} pauseBeforeExec Whether or not to pause (using a
     *     'debugger' statement) before beginning execution of the shell script.
     * @param {Boolean} interactiveMode Whether or not we're executing this
     *     script in 'interactive mode'.
     */
    PhantomTSH.exec = function(tshInput, pauseBeforeExec, interactiveMode) {
        var handler;

        handler = function(aSignal, stdioResults) {
            var result,
                found,
                results,
                str;

            //  Normalize the result data array. We rely on an array of results
            //  so that buffered output can be processed and we can be sure of
            //  the callPhantom call's wrapup steps which exit the process.
            if (TP.isValid(stdioResults)) {
                if (TP.isArray(stdioResults)) {
                    results = stdioResults;
                } else {
                    //  Objects in the stdioResults array are supposed to be
                    //  simple pojos with meta/data keys.
                    if (TP.notValid(stdioResults.meta)) {
                        results = [{
                            meta: 'stdout',
                            data: TP.json(stdioResults)
                        }];
                    } else {
                        results = [stdioResults];
                    }
                }
            } else {
                results = [];
            }

            //  If we have signal data and it's not already represented in the
            //  result array add it before getting to the output sequence.
            if (TP.isValid(aSignal)) {
                result = aSignal.getResult();
                found = results.some(function(item) {
                    return item.data === result;
                });
                if (!found) {
                    results.push({
                        meta: 'stdout',
                        data: str
                    });
                }
            }

            //  Normalize all data slots in result set to be string form.
            results = results.map(function(item) {
                var data;

                try {
                    if (TP.isString(item.data)) {
                        data = item.data;
                    } else {
                        data = JSON.stringify(item.data);
                    }
                } catch (e) {
                    try {
                        data = TP.str(item.data);
                    } catch (e2) {
                        data = item.data;
                    }
                }

                if (TP.notValid(data)) {
                    data = TP.boot.$stringify(item.data);
                }

                return {
                    meta: item.meta,
                    data: data
                };
            });

            str = JSON.stringify(results);

            //  Notify/output the final results.
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

        if (pauseBeforeExec) {
            /* eslint-disable no-debugger */
            debugger;
            /* eslint-enable no-debugger */
        }

        TP.shellExec(TP.hc(
            'cmdSrc', tshInput,         // the TSH input to run
            'cmdEcho', false,           // don't echo the request
            'cmdHistory', false,        // don't create a history entry
            'cmdSilent', false,         // report output so we can capture it
            'onsuccess', handler,       // success handler (same handler)
            'onfail', handler));        // failure handler (same handler)

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

        console.log(PhantomTSH.buffer.join('\n'));
        PhantomTSH.buffer.length = 0;

        /* eslint-disable no-nested-ternary,no-extra-parens */
        status = PhantomTSH.status === null ?
            (code === undefined ? 0 : code) :
            PhantomTSH.status;
        /* eslint-enable no-nested-ternary,no-extra-parens */

        if (status === 0) {
            color = 'success';
        } else {
            color = 'failure';
        }

        if (reason && reason.length) {
            PhantomTSH.log(reason, color, true);
        }

        if (!PhantomTSH.argv.quiet) {
            now = new Date().getTime();

            /* eslint-disable no-extra-parens */
            msg = 'Finished in ' +
                (now - PhantomTSH.start) + ' ms' +
                ' w/TSH exec time of ' +
                (PhantomTSH.startExec ? (now - PhantomTSH.startExec) : 0) + ' ms.';
            /* eslint-enable no-extra-parens */

            PhantomTSH.log(msg, 'info', true);
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
     * Processes interactive input if we're in interactive mode.
     */
    PhantomTSH.interactiveInput = function() {

        var validInput,
            interactiveInputLine;

        validInput = false;

        //  While we don't have valid shell input, keep trying to get it.
        while (!validInput) {

            system.stdout.write('tsh>> ');
            interactiveInputLine = system.stdin.readLine();

            //  We should've read a whole line. If it all was was whitespace,
            //  then we don't have valid input. But if there are real
            //  non-whitespace characters, then set the flag to true.
            if (interactiveInputLine.trim().length > 0) {
                validInput = true;
            }
        }

        //  Got good input - evaluate it.
        if (validInput) {
            PhantomTSH.page.evaluate(PhantomTSH.exec,
                                        interactiveInputLine,
                                        false,
                                        true);
        }
    };

    /**
     * Logs a message, prefixing it as a TAP comment if in TAP mode.
     * @param {String} message The string to output.
     * @param {String} style The name of a theme style to use for output.
     */
    PhantomTSH.log = function(message, style, flush) {
        var level,
            msg,
            styl;

        msg = '' + message;

        //  Sherpa output in the client uses a signifying value which we don't
        //  want to output to other console logs so strip that if found.
        if (/__TSH__NO_VALUE__TSH__/.test(msg)) {
            return;
        }

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
        } else if (/^FATAL/i.test(msg)) {
            level = 6;
        } else if (/^SYSTEM/i.test(msg)) {
            if (!PhantomTSH.argv.system) {
                return;
            }
            level = 7;
        }

        // If we have a level verify we should continue processing it.
        if (level !== void 0 && PhantomTSH.level > level) {
            return;
        }

        if (PhantomTSH.argv.tap) {
            msg = PhantomTSH.TAP_PREFIX + msg;
        }

        if (PhantomTSH.argv.contrast &&
                msg.indexOf(PhantomTSH.argv.contrast) === 0) {
            styl = 'info';
        } else {
            styl = style;
        }

        //  If the message is a JSON string beautify it for easier reading.
        try {
            JSON.parse(msg);
            msg = beautify(msg);
        } catch (e) {
            void 0;
        }

        // If color is explicit we go with that, otherwise we check the content
        // to see if it matches a typical output format from TIBET itself.
        if (styl !== void 0) {
            msg = PhantomTSH.colorize(msg, styl);
        } else {
            if (/^TRACE/i.test(msg)) {
                msg = PhantomTSH.colorize(msg, 'trace');
            } else if (/^DEBUG/i.test(msg)) {
                msg = PhantomTSH.colorize(msg, 'debug');
            } else if (/^INFO/i.test(msg)) {
                msg = PhantomTSH.colorize(msg, 'info');
            } else if (/^WARN/i.test(msg)) {
                msg = PhantomTSH.colorize(msg, 'warn');
            } else if (/^ERROR/i.test(msg)) {
                msg = PhantomTSH.colorize(msg, 'error');
            } else if (/^FATAL/i.test(msg)) {
                msg = PhantomTSH.colorize(msg, 'fatal');
            } else if (/^SYSTEM/i.test(msg)) {
                msg = PhantomTSH.colorize(msg, 'system');
            } else {
                msg = PhantomTSH.colorize(msg, 'info');
            }
        }

        PhantomTSH.buffer.push(msg);

        if (PhantomTSH.buffer.length > PhantomTSH.FLUSH_LIMIT || flush) {
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
            primary,
            fragment;

        PhantomTSH.start = (new Date()).getTime();
        PhantomTSH.parse();

        Color = require(phantom.libraryPath + '/../common/tibet_color');
        PhantomTSH._color = new Color(PhantomTSH.argv);

        //  Define a local colorizing function that respects our 'color' option.
        //  Don't colorize output (it's often parsed by invoking CLI commands)
        //  unless we're asked to.
        PhantomTSH.colorize = function(aString, aSpec) {
            if (PhantomTSH.argv.color) {
                return PhantomTSH._color.colorize(aString, aSpec);
            }
            return aString;
        };

        if (PhantomTSH.argv.debug) {
            PhantomTSH.log(JSON.stringify(PhantomTSH.argv));
        }

        if (phantom.version.major > 1) {
            PhantomTSH.url = 'file://' + PhantomTSH.url;
        }

        if (!PhantomTSH.argv.quiet) {
            PhantomTSH.log('Loading TIBET via PhantomJS ' +
                    phantom.version.major + '.' +
                    phantom.version.minor + '.' +
                    phantom.version.patch +
                    ' at ' + (new Date()).toLocaleString().replace(
                        /( ){2}/g, ' '),
                'info', true);

            if (PhantomTSH.argv.debug) {
                index = PhantomTSH.url.indexOf('#');
                primary = PhantomTSH.url.slice(0, index);
                fragment = PhantomTSH.url.slice(index + 1);
                PhantomTSH.log(primary, 'debug');
                PhantomTSH.log(fragment, 'debug');
                PhantomTSH.log('PhantomTSH.argv: ' +
                    JSON.stringify(PhantomTSH.argv), 'debug');
            }
        }

        if (PhantomTSH.argv['app-root']) {
            PhantomTSH.url += '&path.app_root=' + PhantomTSH.argv['app-root'];
        }

        //  Flip flags to allow liberal content loading (cross-origin XHR,
        //  'file://' URLs and the like).
        PhantomTSH.page.settings.localToRemoteUrlAccessEnabled = true;
        PhantomTSH.page.settings.webSecurityEnabled = false;

        PhantomTSH.page.clearMemoryCache();
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
                PhantomTSH.colorize('Error opening URL: ', 'fatal') + PhantomTSH.url,
                PhantomTSH.ERROR);
        } else {
            // Wait for TIBET to be available
            PhantomTSH.wait(
                function() {
                    return PhantomTSH.page.evaluate(
                        function() {
                            // PhantomTSH.wait check...
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
                },
                function() {

                    var timeoutFromConfig;

                    PhantomTSH.loaded = true;

                    PhantomTSH.startExec = new Date().getTime();

                    if (!PhantomTSH.argv.quiet) {
                        PhantomTSH.log('TIBET loaded in ' +
                            (PhantomTSH.startExec - PhantomTSH.start) + ' ms.' +
                            ' Starting execution.', 'info', true);
                    }

                    //  If the timeout wasn't supplied on the command line, then
                    //  we try to use either the cfg() value that is used as
                    //  'test case' timeout or, if that isn't defined, the
                    //  DEFAULT_TIMEOUT defined above. We then add 1000ms to
                    //  give the currently executing test case a chance to
                    //  report a timeout if it's going to before PhantomJS
                    //  itself times out.
                    if (!PhantomTSH.argv.timeout) {

                        timeoutFromConfig = PhantomTSH.page.evaluate(
                            function() {
                                return TP.sys.cfg('test.case_mslimit');
                            });

                        if (!timeoutFromConfig) {
                            PhantomTSH.timeout = PhantomTSH.DEFAULT_TIMEOUT;
                        } else {
                            PhantomTSH.timeout = timeoutFromConfig;
                        }

                        PhantomTSH.timeout = PhantomTSH.timeout + 1000;
                    } else {
                        PhantomTSH.timeout = PhantomTSH.argv.timeout;
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

        argv = minimist(system.args, PhantomTSH.PARSE_OPTIONS);
        PhantomTSH.argv = argv;

        if (argv.help) {
            PhantomTSH.help();
        }

        if (argv.usage) {
            PhantomTSH.usage();
        }

        if (!argv.script) {
            PhantomTSH.interactive = true;
        } else {
            PhantomTSH.script = argv.script;
        }

        if (argv.level !== void 0) {
            level = PhantomTSH.LEVELS[argv.level.toUpperCase()];
            if (level !== void 0) {
                PhantomTSH.level = level;
            } else {
                PhantomTSH.level = PhantomTSH.DEFAULT_LEVEL;
            }
        } else {
            PhantomTSH.level = PhantomTSH.DEFAULT_LEVEL;
        }

        PhantomTSH.url = argv.url || PhantomTSH.DEFAULT_URL;
        PhantomTSH.url = fs.absolute(PhantomTSH.url);

        PhantomTSH.url += '#?boot.profile="';
        if (argv.boot && argv.boot.profile) {
            PhantomTSH.url += argv.boot.profile + '"';
        } else {
            PhantomTSH.url += PhantomTSH.DEFAULT_PROFILE + '"';
        }

        if (argv.params) {
            PhantomTSH.url += '&' + argv.params + '&boot.level=' +
                PhantomTSH.level;
        } else {
            PhantomTSH.url += '&boot.level=' + PhantomTSH.level;
        }
    };


    /**
     * Performs basic TAP-format output processing.
     * @param {String} msg The TAP-formatted message to process.
     */
    PhantomTSH.tap = function(msg) {
        var str,
            level;

        //  Sherpa output in the client uses a signifying value which we don't
        //  want to output to other console logs so strip that if found.
        if (/__TSH__NO_VALUE__TSH__/.test(msg)) {
            return;
        }

        //  Allow filtering output to just comments/warnings and not-ok msgs.
        if (!PhantomTSH.argv.ok && !/^not/.test(msg)) {
            return;
        }

        if (/^#/.test(msg)) {
            // comment
            if (/^# PASS:/.test(msg)) {
                str = PhantomTSH.colorize(msg, 'pass');
            } else if (/^# FAIL:/.test(msg)) {
                str = PhantomTSH.colorize(msg, 'fail');
            } else if (/# SKIP/.test(msg)) {
                str = PhantomTSH.colorize(msg, 'skip');
            } else {
                str = PhantomTSH.colorize(msg, 'comment');
            }
        } else if (/^not ok/.test(msg)) {
            // bad, but might be todo item...
            if (/# TODO/.test(msg)) {
                // warning but basically ignored
                str = PhantomTSH.colorize('not ok', 'fail') +
                    PhantomTSH.colorize(msg.slice(6), 'todo');
            } else {
                // true error
                str = PhantomTSH.colorize('not ok', 'fail') + msg.slice(6);
                PhantomTSH.status = -1;
            }
        } else if (/^ok/.test(msg)) {
            // passed or skipped
            if (/# SKIP/.test(msg)) {
                str = PhantomTSH.colorize(msg, 'skip');
            } else if (/# TODO/.test(msg)) {
                str = PhantomTSH.colorize('ok', 'pass') +
                    PhantomTSH.colorize(msg.slice(2), 'todo');
            } else {
                str = PhantomTSH.colorize('ok', 'pass') + msg.slice(2);
            }
        } else if (/^bail out!/i.test(msg)) {
            // termination signal
            str = PhantomTSH.colorize('Bail out!', 'fail') + msg.slice(8);
            PhantomTSH.status = -1;
        } else if (/^\d{1}\.\.\d+$/.test(msg)) {
            str = msg;
        } else {
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
            } else if (/^FATAL/i.test(msg)) {
                level = 6;
            } else if (/^SYSTEM/i.test(msg)) {
                if (!PhantomTSH.argv.system) {
                    return;
                }
                level = 7;
            }

            // If we have a level verify we should continue processing it.
            if (level !== void 0 && PhantomTSH.level > level) {
                return;
            }
            str = msg;
        }

        PhantomTSH.buffer.push(str);

        if (PhantomTSH.buffer.length > PhantomTSH.FLUSH_LIMIT) {
            console.log(PhantomTSH.buffer.join('\n'));
            PhantomTSH.buffer.length = 0;
        }
    };


    /**
     * Triggers execution of the page.evaluate function which loads our
     * execution logic and the script we want to run.
     */
    PhantomTSH.tsh = function() {

        var pauseBeforeExec,
            now;

        //  If the interactive mode is on (i.e. no script was supplied)
        if (PhantomTSH.interactive) {
            //  Call the method to process interactive input
            PhantomTSH.interactiveInput();
        } else {
            PhantomTSH.lastActivity = new Date().getTime();

            //  If the CLI command that invoked this passed along a remote
            //  debugging port, then the user wants to debug this session, so we
            //  pause with a 'debugger' statement per the PhantomJS instructions.
            //  Note here how we do *not* install an 'exit' timer, as its
            //  indeterminate how long it will take the user to configure their
            //  debugger to take over from here.
            if (PhantomTSH.argv['remote-debug-port']) {
                pauseBeforeExec = true;

                /* eslint-disable no-debugger */
                debugger;
                /* eslint-enable no-debugger */
            } else {
                //  Otherwise, we're running in a regular context, which means we
                //  set up a timer.
                pauseBeforeExec = false;

                PhantomTSH.timer = setInterval(function() {
                    now = new Date().getTime();
                    if (now - PhantomTSH.lastActivity > PhantomTSH.timeout) {
                        clearInterval(PhantomTSH.timer);
                        PhantomTSH.exit(
                            PhantomTSH.colorize('Operation timed out.', 'fatal'),
                            PhantomTSH.ERROR);
                    }
                }, 250);
            }

            PhantomTSH.page.evaluate(PhantomTSH.exec,
                                        PhantomTSH.script,
                                        pauseBeforeExec,
                                        false);
        }
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
     * function is used to test for load completion. If the isReady function
     * returns true the wait will end and the onReady function will be invoked.
     * If the isReady function returns a string that string is treated as an
     * error message and PhantomTSH.exit is invoked. If the amount of time
     * specified by timeOutMillis expires before the isReady returns true
     * the entire process will time out.
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
            var now;

            now = new Date().getTime();

            /* eslint-disable no-extra-parens */
            if ((now - start < timeout) && !ready) {
            /* eslint-enable no-extra-parens */
                try {
                    ready = isReady();
                    if (typeof ready === 'string') {
                        PhantomTSH.exit(
                            PhantomTSH.colorize(ready, 'fatal'),
                            PhantomTSH.ERROR);
                    }
                } catch (e) {
                    if (/Stopped/.test(e.message)) {
                        PhantomTSH.exit(
                            PhantomTSH.colorize(e.message, 'fatal'),
                            PhantomTSH.ERROR);
                    } else {
                        PhantomTSH.exit(
                            PhantomTSH.colorize('Error in ready check: ' +
                                e.message, 'fatal'),
                            PhantomTSH.ERROR);
                    }
                }
            } else {
                if (!ready) {
                    // Ran out of time...
                    PhantomTSH.exit(
                        PhantomTSH.colorize('Operation timed out.', 'fatal'),
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
                            PhantomTSH.colorize('Error in ready function: ' +
                                e.message, 'fatal'),
                            PhantomTSH.ERROR);
                    }
                }
            }

        }, 200);
    };


    //  ---
    //  PhantomTSH.page Methods
    //  ---

    /**
     * Handle notification of an alert() call within PhantomJS and redirect it
     * to the Node.js console.
     * @param {String} msg The alert message.
     */
    PhantomTSH.page.onAlert = function(msg) {
        PhantomTSH.log('alert(' + msg + ');', 'notify');

        return;
    };


    /**
     * Handle notification that a window.callPhantom call has been made. This is
     * one way for the loaded code to call out to the invoking phantom script.
     * @param {String} result The callback data.
     */
    PhantomTSH.page.onCallback = function(data) {
        var results,
            code;

        if (!PhantomTSH.interactive) {
            PhantomTSH.lastActivity = new Date().getTime();
        }

        if (!data) {
            PhantomTSH.exit(PhantomTSH.colorize('Failed: ', 'fatal') +
                'No result data.', PhantomTSH.FAILURE);
        }

        try {
            //  Data should be a JSON string we can reconstitute.
            results = JSON.parse(data);
        } catch (e) {
            //  If we can't reconstitute from JSON we consider that failure.
            PhantomTSH.exit(data, PhantomTSH.FAILURE);
        }

        code = PhantomTSH.SUCCESS;

        results.forEach(
            function(item) {
                if (!item) {
                    return;
                }
                switch (item.meta) {
                    case 'notify':
                        PhantomTSH.log(PhantomTSH.colorize(item.data), 'notify');
                        break;
                    case 'stdin':
                        PhantomTSH.log(PhantomTSH.colorize(item.data), 'stdin');
                        break;
                    case 'stdout':
                        PhantomTSH.log(PhantomTSH.colorize(item.data), 'stdout');
                        break;
                    case 'stderr':
                        PhantomTSH.log(PhantomTSH.colorize(item.data), 'stderr');
                        code = PhantomTSH.FAILURE;
                        break;
                    default:
                        break;
                }
            });

        if (PhantomTSH.interactive) {
            //  Flush the buffer
            console.log(PhantomTSH.buffer.join('\n'));
            PhantomTSH.buffer.length = 0;

            //  Call the method to process more interactive input
            PhantomTSH.interactiveInput();
        } else {
            PhantomTSH.exit('', code);
        }
    };


    /**
     * Responds to confirm() calls in the client. This implementation returns
     * true (OK) if the message includes the word "please" in any form.
     * @param {String} msg The confirmation message.
     * @returns {Boolean} True if you ask nicely.
     */
    PhantomTSH.page.onConfirm = function(msg) {
        PhantomTSH.log('confirm(' + msg + ');', 'notify');

        // Returning true => "OK", false => "Cancel". We return a value based on
        // whether the question includes the word please, so ask nicely :).
        if (msg && /please/i.test(msg)) {
            return true;
        } else {
            return false;
        }
    };


    /**
     * Handle notification of console output within PhantomJS and redirect it to
     * the Node.js console.
     * @param {String} msg The output message.
     */
    PhantomTSH.page.onConsoleMessage = function(msg) {

        PhantomTSH.lastMessage = '' + msg;

        if (!PhantomTSH.interactive) {
            PhantomTSH.lastActivity = new Date().getTime();
        }

        //  If we're doing TAP-complaint processing then redirect.
        if (PhantomTSH.argv.tap) {
            PhantomTSH.tap('' + msg);
        } else {
            PhantomTSH.log('' + msg);
        }
    };


    /**
     * Handle notification of a JavaScript execution error and report it
     * to the Node.js console.
     * @param {String} msg The error message.
     * @param {Array.<Object>} trace A rough stack trace object.
     */
    PhantomTSH.page.onError = function(msg, trace) {
        var str,
            arr;

        PhantomTSH.lastActivity = new Date().getTime();

        if (PhantomTSH.argv.errimg) {
            /* eslint-disable no-extra-parens */
            PhantomTSH.page.render('PhantomError_' +
                (new Date().getTime()) + '.png');
            /* eslint-enable no-extra-parens */
        }

        // Only log errors if the application didn't just do it for us. Usually
        // TIBET will log an error if it can and we don't want duplicate output.
        if (PhantomTSH.lastMessage && PhantomTSH.lastMessage.indexOf(msg) !== -1) {
            return;
        }

        str = msg;
        if (trace && trace.length) {
            arr = [];
            trace.forEach(function(item) {
                //  Don't write out logging layer portions.
                if (/TIBETLogging/.test(item.file)) {
                    return;
                }
                arr.push('\t' + item.file + ':' + item.line);
            });

            if (arr.length) {
                str += ' @\n' + arr.join('\n');
            }
        }

        //  Either log and exit or just log based on startup flags.
        if (PhantomTSH.argv.errexit) {
            PhantomTSH.exit(str, PhantomTSH.ERROR);
        } else {
            PhantomTSH.log(str, 'error', true);
        }
    };


    /**
     * Responds to file picker requests from the client by returning whatever is
     * passed in oldFile.
     * @param {String} oldFile The original file provided to the file picker.
     * @returns {String} oldFile.
     */
    PhantomTSH.page.onFilePicker = function(oldFile) {
        PhantomTSH.log('onFilePicker(' + oldFile + ');', 'notify');

        return oldFile;
    };


    /**
     * Responds to prompt() calls in the client. This implementation returns
     * a random string.
     * @param {String} msg The prompt message.
     * @returns {String} A random string.
     */
    PhantomTSH.page.onPrompt = function(msg) {
        PhantomTSH.log('prompt(' + msg + ');', 'notify');

        return 'I have ' + Date.now() + ' answers.';
    };


    /**
     * Respond to notifications that a resource has failed to load. This is a
     * critical handler in many ways since resource load occurs before any
     * potential invocation of the open() callback. If a resource fails to load
     * we need to exit immediately or we'll end up waiting until we time out.
     * @param {Object} resourceError A phantom resource object containing:
     *    id : the number of the request
     *    url : the resource url
     *    errorCode : the error code
     *    errorString : the error description
     */
    PhantomTSH.page.onResourceError = function(resourceError) {
        var str;

        str = 'ERROR: Unable to load ' + resourceError.url +
            ' (id: ' + resourceError.id +
            ', code: ' + resourceError.errorCode + ').';

        if (PhantomTSH.loaded) {
            PhantomTSH.log(PhantomTSH.colorize(str, 'warn'), true);
        } else {
            console.log(PhantomTSH.colorize(str, 'fatal'));
            phantom.exit(PhantomTSH.ERROR);
        }
    };


    /**
     * Respond to notifications that a resource request timed out. The timeout
     * setting is based on 'settings.resourceTimeout' for phantom.
     * @param {Object} request A phantom request object containing:
     *     id: the number of the requested resource
     *     method: http method
     *     url: the URL of the requested resource
     *     time: Date object containing the date of the request
     *     headers: list of http headers
     *     errorCode: the error code of the error
     *     errorString: text message of the error
     */
    PhantomTSH.page.onResourceTimeout = function(request) {
        PhantomTSH.log('Request #' + request.id + ': ' +
            JSON.stringify(request), 'error');
    };


    //  ---
    //  Execute...
    //  ---

    PhantomTSH.main();

}(this));
