/**
 * @name phantom.js
 * @overview
 * @author Scott Shattuck (ss), William J. Edney (wje)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-Approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/*
To fire it up:

//  Here we default the URL that PhantomJS will navigate to to:
//  file:///usr/local/src/TIBET/tdp/index.html

<path_to_phantom_install>/phantomjs testrunner.js ":echo '42'"

//  Here we specify the URL that PhantomJS will navigate to to:

<path_to_phantom_install>/phantomjs testrunner.js http://localhost:80/myapp/index.html ":echo '42'"

Notice how we have to quote things to pass a String to the ':echo' command here.
*/

/* JSHint checking */

/* global phantom:false,
          require:false
*/

//  ------------------------------------------------------------------------
//  waitFor() function from PhantomJS web site (but cleaned up via JSHint)
//  ------------------------------------------------------------------------

function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(
            function() {
                if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                    //  If not time-out yet and condition not yet fulfilled
                    condition = (typeof(testFx) === 'string' ? eval(testFx) : testFx()); //< defensive code
                } else {
                    if (!condition) {
                        //  If condition still not fulfilled (timeout but condition
                        //  is 'false')
                        console.log('\'waitFor()\' timeout');
                        phantom.exit(1);
                    } else {
                        //  Condition fulfilled (timeout and/or condition is 'true')
                        console.log('\'waitFor()\' finished in ' +
                                    (new Date().getTime() - start) + 'ms.');
                        typeof(onReady) === 'string' ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                        clearInterval(interval); //< Stop this interval
                    }
                }
            }, 250); //< repeat check every 250ms
}

//  ------------------------------------------------------------------------
var EXIT_SUCCESS = 0,
    EXIT_FAILURE = 1,
    EXIT_ERROR = 2;

//  ------------------------------------------------------------------------

var url,

    shellSrc,

    page,
    system,

    phantomQuit,

    execTSH,
    main;

//  ------------------------------------------------------------------------

url = 'file:///usr/local/src/TIBET/tdp/index.html';

//  ------------------------------------------------------------------------

page = require('webpage').create();
system = require('system');

//  ------------------------------------------------------------------------

//  NB: 'testrunner.js' is always the first argument (system.args[0]), but we
//  need more

if (system.args.length === 1) {
    phantom.exit();
} else if (system.args.length === 2) {
    //  If there were 2 args, then the 2nd one is the shell snippet that should
    //  be run
    shellSrc = system.args[1];
} else {
    //  If there were 3 args, then the 2nd one is the URL to navigate to and the
    //  3rd one is the shell snippet that should be run
    url = system.args[1];
    shellSrc = system.args[2];
}

//  A nice quit function
phantomQuit = function (reason, value) {

    if (reason) {
        //  Render an image of what we see
        //page.render('Loaded.png');
        console.log('PHANTOM STOP: ' + reason);
    }

    phantom.exit(value);
};

//  ---

//  Wire browser console.log into PhantomJS console.log
page.onConsoleMessage = function (msg) {
    console.log(msg);
};

//  ---

//  Wire up an error handler
page.onError = function (msg, trace) {

    phantomQuit('ERROR IN PAGE: ' + msg, EXIT_ERROR);

    trace.forEach(
            function(item) {
                console.log('  ', item.file, ':', item.line);
            });
};

//  ---

execTSH = function (shellInput) {

    //  NB: We configure this call to the shell to not echo output, not create a
    //  history entry, but to echo output so that we can see it here.
    TP.shell(
        shellInput,
        false, false, true, null,
        function (aSignal, stdioResults) {
            var results;

            //  The shell request itself succeeded. See if it returned the
            //  correct value.

            results = stdioResults.copy();

            try {

                //  The correct value should be in the result of the
                //  TPShellResponse that is supplied to this method.
                results.atPut('requestOutput', aSignal.getResult());

                window.callPhantom(TP.json(results));
            } catch (e) {
                window.callPhantom('FAILURE: ' + TP.str(e));
            } finally {
            }
        },
        function (aSignal) {
            window.callPhantom('FAILURE: Shell request failed.');
        });

	return;
};

//  ---

main = function () {

    page.onCallback = function (result) {

        var results;

        if (/^FAILURE: /.test(result)) {

            phantomQuit(result, EXIT_FAILURE);

            return;
        }

        //page.render('debug.png');

        //  TODO: If STDERR has content, then we shouldn't quit PhantomJS with
        //  an EXIT_SUCCESS

        results = JSON.parse(result);

        console.log('NOTIFY: ' + results.notify.join('\n') + '\n');
        console.log('STDIN: ' + results.stdin.join('\n') + '\n');
        console.log('STDOUT: ' + results.stdout.join('\n') + '\n');
        console.log('STDERR: ' + results.stderr.join('\n') + '\n');

        phantomQuit(null, EXIT_SUCCESS);
    };

    page.evaluate(execTSH, shellSrc);
};

//  ---

page.open(
    url,
    function (status) {

        //  Check for page load success
        if (status !== 'success') {
            console.log('Error opening URL: ' + url);
        } else {
            // Wait for TIBET to be available
            waitFor(
                function() {
                    var tibetStarted;

                    tibetStarted = page.evaluate(
                        function () {
                            if (TP &&
                                TP.sys &&
                                TP.sys.hasStarted) {
                                return TP.sys.hasStarted();
                            }

                            return false;
                        });

                    return tibetStarted;
                },
                function() {
                    console.log('TIBET should be loaded now.');

                    //  It is important for somewhere in the 'main' function to
                    //  call phantomQuit()!
                    main();
                },
                10000); //  Wait for up to 10 seconds for TIBET to load
        }
});
