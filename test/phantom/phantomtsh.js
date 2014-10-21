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
 * tests) to be triggered from the command line.
 *
 * Command line arguments currently use position:
 *
 *      phantomjs phantomtsh.js <script> <url>
 *
 * The script argument is the typical one to change and requires quoting to
 * handle any spaces etc. The url argument is available but frankly should
 * rarely if ever be used since a proper launch file is a challenge to
 * configure and the one provided is general enough to handle most cases.
 *
 * For maximum flexibility and to avoid spurious timeout errors this script
 * depends on an 'idle timeout' rather than an 'elapsed time' timeout. As long
 * as the script being run is actively outputting to the console or invoking the
 * phantomjs callback handler it will keep running.
 */

/*eslint no-eval:0*/
/*global phantom:false, require:false*/
;(function(root) {

    var fs = require('fs');
    var system = require('system');
    var minimist = require('minimist');

    //  ---
    //  PhantomTSH
    //  ---

    /**
     * A common root object for all our functionality.
     */
    var PhantomTSH = {};


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
        red: ['\x1B[31m', '\x1B[39m']       // severe/fatal output
    };

    /**
     * The default boot profile to attempt to load. This can be altered on the
     * command line via the --profile flag. The value here should be identical
     * to the form used on a TIBET boot url (e.g. 'development#teamtibet-full').
     * @type {String}
     */
    PhantomTSH.DEFAULT_PROFILE = 'phantom';

    /**
     * The number of milliseconds without output before execution of the script
     * will timeout. The default is a fairly short 5 seconds. You can adjust
     * using --timeout.
     * @type {Number}
     */
    PhantomTSH.DEFAULT_TIMEOUT = 5000;

    /**
     * The default TSH command to execute. Value here should be legal TSH.
     * @type {String}
     */
    PhantomTSH.DEFAULT_TSH = ':echo Welcome to TIBET!';

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
     * Option list defining command line flag parser options for minimist.
     * @type {Object}
     */
    PhantomTSH.PARSE_OPTIONS = {
        'boolean': ['color', 'image', 'help', 'usage', 'debug', 'tap'],
        'string': ['script', 'url', 'profile', 'params'],
        'number': ['timeout'],
        'default': {
            color: true,
            tap: true
        }
    };

    /**
     * Return code when everything succeeds (both this script and the TSH script
     * which is run).
     * @type {Number}
     */
    PhantomTSH.SUCCESS = 0;


    //  ---
    //  Attributes
    //  ---

    /**
     * Argument list as parsed by minimist.
     * @type {Array}
     */
    PhantomTSH.argv = null;

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
     * The PhantomJS page object used to manage the PhantomJS interface.
     * @type {Page}
     */
    PhantomTSH.page = require('webpage').create();

    /**
     * The script text to run. This should be a valid command line for TSH.
     * Defaults to PhantomTSH.DEFAULT_TSH.
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
     * @param {String} c
     * @return {String} The colorized string, if the color is found.
     */
    PhantomTSH.color = function(color, string) {
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
        var str,
            start,
            interval;

        var fallback = TP.hc(
            'notify', TP.ac(),
            'stdin', TP.ac(),
            'stdout', TP.ac(),
            'stderr', TP.ac());

        var handler = function(aSignal, stdioResults) {
            var results;

            if (TP.isValid(stdioResults)) {
                results = stdioResults.copy();
            } else {
                results = fallback;
            }

            results.atPut('result', aSignal.getResult());

            try {
                str = TP.json(results);
            } catch (e) {
                // Probably a circular reference of some kind in the output data
                // which stringify can't handle.
                str = TP.str(results);
            }

            try {
                window.callPhantom(str);
            } catch (e) {
                console.log(e.message);
                phantom.exit(1);
            }
        };

        TP.shell(
            tshInput,       // the TSH input to run
            false,          // don't echo the request
            false,          // don't create a history entry
            true,           // do echo any output (so we can capture it)
            null,           // no specific shell ID in this case.
            handler,        // success handler (same handler)
            handler);       // failure handler (same handler)

        return;
    };


    /**
     * Terminates execution, optionally providing a reason and an exit code.
     * @param {String} reason The error message or status message to output.
     * @param {Number} code The process exit code. Non-zero indicates an error.
     */
    PhantomTSH.exit = function(reason, code) {
        var status,
            color;
        var now = new Date().getTime();
        var msg = '# !!! Finished in ' +
            (now - PhantomTSH.start) + ' ms' +
            ' w/TSH exec time of ' +
            (PhantomTSH.startExec ? (now - PhantomTSH.startExec) : 0) + ' ms.';

        if (reason && reason.length) {
            console.log('# !!! ' + reason);
        }

        status = PhantomTSH.status === null ?
            (code === undefined ? 0 : code) :
            PhantomTSH.status;

        if (status === 0) {
            color = 'gray';
        } else {
            color = 'red';
        }

        console.log(PhantomTSH.color(color, msg));
        phantom.exit(status);
    };


    /**
     * Outputs simple help/usage information.
     */
    PhantomTSH.help = function() {
        console.log('Usage: phantomjs phantomtsh.js [--script <script>] ' +
            '[--url <url>] [--timeout <timeout>] [<flags>]\n' +
            '\nwhere <flags> include:\n' +
            '\t[--no-color]\n\t[--no-tap]\n\t[--debug]\n\t[--help]\n\t[--usage]\n');
        phantom.exit(0);
    };


    /**
     * Main execution trigger. Invocation of this call starts the phantom
     * loading process. The url is opened, the opened() callback is triggered,
     * that callback passes control to the tsh() call which calls exec() which
     * triggers the page.onCallback hook function.
     */
    PhantomTSH.main = function() {
        PhantomTSH.start = (new Date()).getTime();
        PhantomTSH.parse();
        console.log(PhantomTSH.color('gray',
            '# !!! Starting PhantomJS version: ' +
                JSON.stringify(phantom.version) + ' at ' +
                (new Date()).toLocaleString()));
        console.log(PhantomTSH.color('gray',
            '# !!! Loading TIBET via ' + PhantomTSH.url + '.'));

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
            PhantomTSH.exit(PhantomTSH.color('red',
                'Error opening URL: ' + PhantomTSH.url),
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
                        throw new Error('Stopped: '+ tibetStarted);
                    }
                    return tibetStarted;
                },
                function() {
                    PhantomTSH.startExec = new Date().getTime();
                    console.log(PhantomTSH.color('gray',
                        '# !!! TIBET loaded. Starting execution at ' +
                        (PhantomTSH.startExec - PhantomTSH.start) + ' ms.'));

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
        var argv;

        argv = minimist(system.args);
        PhantomTSH.argv = argv;

        if (argv.debug) {
            console.log(JSON.stringify(argv));
        }

        if (argv.help || argv.usage) {
            PhantomTSH.help();
        }

        PhantomTSH.script = argv.script || PhantomTSH.DEFAULT_TSH;

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
        if (/^#/.test(msg)) {
            // comment
            console.log(PhantomTSH.color('gray', msg));
        } else if (/^not ok/.test(msg)) {
            // bad, but might be todo item...
            if (/# TODO/.test(msg)) {
                // warning but basically ignored
                console.log(PhantomTSH.color('yellow', 'not ok') +
                    msg.slice(6));
            } else {
                // true error
                console.log(PhantomTSH.color('red', 'not ok') + msg.slice(6));
                PhantomTSH.status = -1;
            }
        } else if (/^ok/.test(msg)) {
            // passed
            console.log(PhantomTSH.color('green', 'ok') + msg.slice(2));
        } else if (/^bail out!/i.test(msg)) {
            // termination signal
            console.log(PhantomTSH.color('red', 'Bail out!') + msg.slice(8));
            PhantomTSH.status = -1;
        } else if (/^\d{1}\.\.\d+$/.test(msg)) {
            // the plan
            console.log(msg);
        } else {
            // incorrect output...must be #, ok, or not ok to start a line.
            // Check for typical indicators from TIBET logging re: level.
            if (/TRACE/.test(msg)) {
                console.log(PhantomTSH.color('gray', '# !!! ' + msg));
            } else if (/DEBUG/.test(msg)) {
                console.log(PhantomTSH.color('magenta', '# !!! ' + msg));
            } else if (/INFO/.test(msg)) {
                console.log('# !!! ' + msg);
            } else if (/WARN/.test(msg)) {
                console.log(PhantomTSH.color('yellow', '# !!! ' + msg));
            } else if (/ERROR/.test(msg)) {
                console.log(PhantomTSH.color('magenta', '# !!! ' + msg));
            } else if (/SEVERE|FATAL/.test(msg)) {
                console.log(PhantomTSH.color('red', '# !!! ' + msg));
            } else if (/SYSTEM/.test(msg)) {
                console.log(PhantomTSH.color('gray', '# !!! ' + msg));
            } else {
                console.log('# !!! ' + msg);
            }
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
                PhantomTSH.exit(PhantomTSH.color('red', 'Operation timed out.'),
                    PhantomTSH.ERROR);
            }
        }, 250);

        PhantomTSH.page.evaluate(PhantomTSH.exec, PhantomTSH.script);
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
        var timeout; // milliseconds before we time out.
        var start; // start time in milliseconds (now).
        var ready; // is test condition fulfilled?
        var interval; // the interval used to retest ready state.

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
                            PhantomTSH.color('red', e.message),
                            PhantomTSH.ERROR);
                    } else {
                        PhantomTSH.exit(
                            PhantomTSH.color('red',
                                'Error in ready check: ' + e.message),
                            PhantomTSH.ERROR);
                    }
                }
            } else {
                if (!ready) {
                    // Ran out of time...
                    PhantomTSH.exit(
                        PhantomTSH.color('red', 'Operation timed out.'),
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
                            PhantomTSH.color('red',
                                'Error in ready function: ' + e.message),
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
        var results;
        var output;

        PhantomTSH.lastActivity = new Date().getTime();

        if (!data) {
            PhantomTSH.exit(PhantomTSH.color('yellow', 'Failed: ') +
                'No result data.', PhantomTSH.FAILURE);
        }

        try {
            // Data should be a JSON string we can reconstitute.
            results = JSON.parse(data);
        } catch (e) {
            // If we can't reconstitute from JSON we consider that failure.
            PhantomTSH.exit(data, PhantomTSH.FAILURE);
        }

        if (results.stderr.length > 0) {
            output = results.stderr.length > 1 ? results.stderr.join('\n') :
                results.stderr[0];
            PhantomTSH.exit(PhantomTSH.color('yellow', 'Failed: ') +
                output && output.trim ? output.trim() : '',
                PhantomTSH.FAILURE);
        } else if (results.stdout.length > 0) {
            output = results.stdout.length > 1 ? results.stdout.join('\n') :
                results.stdout[0];
            PhantomTSH.exit(output && output.trim ? output.trim() : '',
                PhantomTSH.SUCCESS);
        }
    };


    /**
     * Handle notification of console output within PhantomJS and redirect it to
     * the Node.js console.
     * @param {String} msg The output message.
     */
    PhantomTSH.page.onConsoleMessage = function(msg) {

        PhantomTSH.lastMessage = msg;

        PhantomTSH.lastActivity = new Date().getTime();

        // If we're doing TAP-complaint processing then redirect.
        if (PhantomTSH.argv.tap === false) {
            console.log(msg);
            return;
        }

        PhantomTSH.tap(msg);
    };


    /**
     * Handle notification of an error within the PhantomJS engine and report it
     * to the Node.js console.
     * @param {String} msg The error message.
     * @param {Array.<Object>} trace A rough stack trace object.
     */
    PhantomTSH.page.onError = function(msg, trace) {
        var str;

        //TODO: do we want to activate this via command-line flag?
        //PhantomTSH.page.render('Loaded.png');

        // Only log errors if the application didn't just do it for us. Usually
        // TIBET will log an error if it can and we don't want duplicate output.
        if (!/in file:/.test(PhantomTSH.lastMessage)) {
            str = 'Error in page: ' + msg + ' @\n';
            trace.forEach(function(item) {
                str += '\t' + item.file + ':' + item.line + '\n';
            });
        }

        PhantomTSH.exit(str, PhantomTSH.ERROR);
    };


    //  ---
    //  Execute...
    //  ---

    PhantomTSH.main();

}(this));
