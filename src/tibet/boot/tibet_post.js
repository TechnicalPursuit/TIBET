//  ============================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ============================================================================

/*
 * TODO
 *
 */

/* jshint debug:true,
          eqnull:true,
          evil:true,
          maxerr:999,
          nonstandard:true,
          node:true
*/
/* global ActiveXObject:false,
          netscape:false,
          Components:false,
          $ERROR:true,
          $STATUS:true
*/

/* eslint-disable new-cap, no-alert */

//  ----------------------------------------------------------------------------

//  We don't rely on require() but using a closure helps avoid unintended
//  leakage into any enclosing scope.
(function(root) {

//  ============================================================================
//  Core Globals / Roots
//  ============================================================================

if (!root || !root.TP || !root.APP) {
    throw new Error('GlobalInitError');
}

TP = root.TP;
APP = root.APP;

//  ============================================================================
//  tibet_cfg Overrides / Updates
//  ============================================================================

TP.boot.$$theme = {
    trace: TP.sys.cfg('log.color.trace'),
    info: TP.sys.cfg('log.color.info'),
    warn: TP.sys.cfg('log.color.warn'),
    error: TP.sys.cfg('log.color.error'),
    fatal: TP.sys.cfg('log.color.fatal'),
    severe: TP.sys.cfg('log.color.severe'),
    system: TP.sys.cfg('log.color.system'),

    time: TP.sys.cfg('log.color.time'),
    delta: TP.sys.cfg('log.color.delta'),
    slow: TP.sys.cfg('log.color.slow'),

    debug: TP.sys.cfg('log.color.debug'),
    verbose: TP.sys.cfg('log.color.verbose')
};

//  ============================================================================
//  Feature Detection
//  ============================================================================

/*
 * A variation on feature detection, and not exclusive of our use of testing of
 * the user-agent string. We combine data from both user-agent and feature to
 * determine if a browser is supportable, requires shimming, etc.
 */

//  Feature names and tests for registered features.
if (TP.sys.$features == null) {
    TP.sys.$features = {};
    TP.sys.$featureTests = {};
}

//  ----------------------------------------------------------------------------

TP.sys.hasFeature = function(aFeatureName, retest) {

    /**
     * @name hasFeature
     * @summary Returns true if the named feature is a feature of the current
     *     system. The feature list is populated primarily during TIBET startup
     *     and kernel finalization.
     * @param {String} aFeatureName The feature name, typically provided as a
     *     constant from a published list of names.
     * @param {Boolean} retest Whether or not to ignore any cached value.
     * @return {Boolean} True if the feature is available.
     * @todo
     */

    var testVal,
        testFunc;

    //  If a valid value was cached for the test and retest isn't true, then
    //  just return the cached value.
    if (TP.boot.$isValid(testVal = TP.sys.$features[aFeatureName]) &&
        retest !== true) {
        return testVal;
    }

    //  If a test function was found, run it and get the value.
    if (typeof(testFunc = TP.sys.$featureTests[aFeatureName]) === 'function') {
        testVal = testFunc();
    } else if (aFeatureName.slice(0, 4) === 'dom-') {
        //  Otherwise, if the test name started with 'dom-', then its a 'DOM
        //  implementation' test, so ask the DOM implementation.
        testVal = document.implementation.hasFeature(
                                            aFeatureName.slice(4), '2.0');
    } else {
        //  Otherwise just use false.
        testVal = false;
    }

    TP.sys.$features[aFeatureName] = testVal;

    return testVal;
};

//  ----------------------------------------------------------------------------

TP.sys.addFeatureTest = function(aFeatureName, featureTest, testNow) {

    /**
     * @name addFeatureTest
     * @summary Adds a feature test under the name provided. If testNow is
     *     true, the test is performed immediately.
     * @param {String} aFeatureName The feature name, typically provided as a
     *     constant from a published list of names.
     * @param {Function} featureTest The feature test function to execute.
     * @param {Boolean} testNow Whether or not to execute the test immediately
     *     instead of waiting until the first time the test is used.
     * @return {Boolean} The result of the test if 'testNow' is specified.
     * @todo
     */

    TP.sys.$featureTests[aFeatureName] = featureTest;

    if (testNow) {
        return TP.boot.hasFeature(aFeatureName);
    }
};

//  ----------------------------------------------------------------------------

TP.sys.hasFeatureTest = function(aFeatureName) {

    /**
     * @name hasFeatureTest
     * @summary Returns whether or not a particular feature test exists.
     * @param {String} aFeatureName The feature name, typically provided as a
     *     constant from a published list of names.
     * @return {Boolean} True if the feature test is defined.
     */

    return (typeof TP.sys.$featureTests[aFeatureName] === 'function');
};

//  ----------------------------------------------------------------------------
//  STANDARD FEATURE TESTS
//  ----------------------------------------------------------------------------

TP.sys.addFeatureTest('gecko',
                        function() {
                            return TP.sys.isUA('gecko');
                        });

TP.sys.addFeatureTest('firefox',
                        function() {
                            return TP.sys.isUA('firefox');
                        });

TP.sys.addFeatureTest('trident',
                        function() {
                            return TP.sys.isUA('trident');
                        });

TP.sys.addFeatureTest('ie',
                        function() {
                            return TP.sys.isUA('ie');
                        });

TP.sys.addFeatureTest('webkit',
                        function() {
                            return TP.sys.isUA('webkit');
                        });

TP.sys.addFeatureTest('safari',
                        function() {
                            return TP.sys.isUA('safari');
                        });

TP.sys.addFeatureTest('chrome',
                        function() {
                            return TP.sys.isUA('chrome');
                        });

TP.sys.addFeatureTest('opera',
                        function() {
                            return TP.sys.isUA('opera');
                        });

//  ----------------------------------------------------------------------------
//  Package Checking
//  ----------------------------------------------------------------------------

TP.sys.hasPackage = function(aPackageFile, aConfig) {

    /**
     * @name hasPackage
     * @summary Returns true if the named package/config pair has been
     *     loaded. If the config isn't defined then the 'base' config is
     *     assumed. NOTE that the 'full' config is always checked and if that
     *     config has been loaded it is assumed that any specific config has
     *     also been loaded.
     * @param {String} aPackageFile A package filename, which should typically
     *     be a .xml file in the lib_cfg or app_cfg path.
     * @param {String} aConfig A specific config name. Default is 'full'.
     * @return {Boolean} True if the package/config has been loaded.
     * @todo
     */

    var config;

    config = aConfig || 'base';

    //  if the full config has loaded we presume all other configs were a
    //  part of that and that the config is available
    if (TP.boot.$$packages[aPackageFile + '#' + 'full'] === true) {
        return true;
    }

    return TP.boot.$$packages[aPackageFile + '#' + config] === true;
};

//  ============================================================================
//  Stdio Hooks
//  ============================================================================

/*
 *  Standard (reusable) input/output/error functions.
 *
 *  Note that these invoke the TP.boot.log function to ensure that
 *  TP.boot.$stdout and TP.boot.$stderr also get captured in the TIBET
 *  bootlog.
 */

//  ----------------------------------------------------------------------------

TP.boot.$alert = window.alert;
TP.boot.$prompt = window.prompt;
TP.boot.$confirm = window.confirm;
TP.boot.$notify = TP.boot.$alert;


//  ---
//  STDERR
//  ---

TP.boot.STDERR_ALERT = function(msg, obj, level) {

    /**
     * @name STDERR_ALERT
     * @summary Logs an error and alerts it. Only the first parameter is passed
     *     to $alert().
     * @param {String} msg The error string to log and alert.
     * @param {Object|Number} obj Optional annotation, arguments, or a logging
     *     level. This parameter is overloaded. When three arguments are present
     *     should be an annotation or argument array and level should be third.
     * @param {Number} level A boot logging level. Default is TP.ERROR.
     */

    TP.boot.STDERR_LOG(msg, obj, level);
    TP.boot.$alert(msg);
    return;
};

TP.boot.STDERR_BREAK = function(msg, obj, level) {

    /**
     * @name STDERR_BREAK
     * @summary Logs an error and triggers the debugger.
     * @param {String} msg The error string.
     * @param {Object|Number} obj Optional annotation, arguments, or a logging
     *     level. This parameter is overloaded. When three arguments are present
     *     should be an annotation or argument array and level should be third.
     * @param {Number} level A boot logging level. Default is TP.ERROR.
     */

    TP.boot.STDERR_LOG(msg, obj, level);
    /* eslint-disable no-debugger */
    debugger;
    /* eslint-enable no-debugger */
    return;
};

TP.boot.STDERR_LOG = function(msg, obj, level) {

    /**
     * @name STDERR_LOG
     * @summary Logs an error, augmenting it with any optional annotation data.
     * @param {String|Object} msg The error string or object to be logged.
     * @param {Object|Number} obj Optional annotation, arguments, or a logging
     *     level. This parameter is overloaded. When three arguments are present
     *     should be an annotation or argument array and level should be third.
     * @param {Number} level A boot logging level. Default is TP.ERROR.
     */

    var ann,
        lvl,
        log,
        ctx;

    switch (arguments.length) {
        case 1:
            // object/string to log
            break;
        case 2:
            //  object/string + either an annotation/context or log level
            if (TP.boot.$isNumber(obj) ||
                    (TP.boot.$isString(obj) &&
                    TP.boot.LOG_NAMES.indexOf(obj) !== -1)) {
                lvl = TP.boot[obj];
            } else {
                ann = obj;
            }
            break;
        default:
            //  all three, or more but we ignore past 3.
            ann = obj;
            lvl = level;
            break;
    }

    //  If level wasn't explicitly set above we'll set it now based on the
    //  nature of the input. This is simplistic, but we'll assume if it's a
    //  simple string it's TP.ERROR and if it's an object it's TP.SEVERE.
    if (TP.boot.$notValid(lvl)) {
        if (typeof msg === 'string') {
            lvl = TP.ERROR;
        } else {
            lvl = TP.SEVERE;
        }
    }

    log = msg;

    // If there's annotation data we need to consider that, or relay it as
    // context data if it's an arguments array.
    if (TP.boot.$isValid(ann)) {
        if (TP.boot.$isArgumentArray(ann)) {
            ctx = ann;
        } else if (ann instanceof Error) {
            log = TP.boot.$ec(ann, msg);
        } else if (TP.boot.$notValid(ann.message)) {
            log = TP.boot.$annotate(ann, msg);
        }
    }

    TP.boot.log(log, lvl, ctx);

    return;
};

TP.boot.STDERR_NOTIFY = function(msg, obj, level) {

    /**
     * @name STDERR_NOTIFY
     * @summary Logs an error and displays it via TP.boot.$notify. Only the
     *     first argument is passed to $notify().
     * @param {String} msg The error string.
     * @param {Object|Number} obj Optional annotation, arguments, or a logging
     *     level. This parameter is overloaded. When three arguments are present
     *     should be an annotation or argument array and level should be third.
     * @param {Number} level A boot logging level. Default is TP.ERROR.
     */

    TP.boot.STDERR_LOG(msg, obj, level);
    TP.boot.$notify(msg);
    return;
};

TP.boot.STDERR_NULL = function(msg, obj, level) {

    /**
     * @name STDERR_NULL
     * @summary Silently consumes errors. Set during post-boot operations to
     *     ensure they don't report through the boot log.
     * @param {String} msg The error string.
     * @param {Object|Number} obj Optional annotation, arguments, or a logging
     *     level. This parameter is overloaded. When three arguments are present
     *     should be an annotation or argument array and level should be third.
     * @param {Number} level A boot logging level. Default is TP.ERROR.
     */

    return;
};

//  ---
//  STDIN
//  ---

TP.boot.STDIN_CONFIRM = function(msg) {

    /**
     * @name STDIN_CONFIRM
     * @summary Requests confirmation of an operation.
     * @param {String} msg The confirmation request message.
     * @return {Boolean} True if the operation was confirmed.
     */

    var input;

    input = window.confirm(msg == null ? '?' : msg);
    if (TP.boot.$notValid(input) || input === '') {
        return null;
    } else {
        return input;
    }
};

TP.boot.STDIN_PROMPT = function(msg, def) {

    /**
     * @name STDIN_PROMPT
     * @summary Prompts the user for a value, returning either the user-entered
     * value or a default value.
     * @param {String} msg The input request message.
     * @param {Object} def The default object to display/use.
     * @return {Boolean} The value the user chooses.
     */

    var input;

    input = window.prompt(msg == null ? '?' : msg, (def == null ? '' : def));
    if (input == null || input === '') {
        return null;
    } else {
        return input;
    }
};

//  ---
//  STDOUT
//  ---

TP.boot.STDOUT_ALERT = function(msg, obj, level) {

    /**
     * @name STDOUT_ALERT
     * @summary Logs a message and alerts it. Only the first parameter is passed
     *     to $alert().
     * @param {String} msg The message to log and alert.
     * @param {Object|Number} obj Optional annotation, argument list, or logging
     *     level. This parameter is overloaded. When three arguments are present
     *     should be an annotation or argument array and level should be third.
     * @param {Number} level A boot logging level. Default is TP.INFO.
     */

    TP.boot.STDOUT_LOG(msg, obj, level);
    TP.boot.$alert(msg);
    return;
};

TP.boot.STDOUT_LOG = function(msg, obj, level) {

    /**
     * @name STDOUT_LOG
     * @summary Logs a message.
     * @param {String} msg The message to log.
     * @param {Object|Number} obj Optional annotation, argument list, or logging
     *     level. This parameter is overloaded. When three arguments are present
     *     should be an annotation or argument array and level should be third.
     * @param {Number} level A boot logging level. Default is TP.INFO.
     */

    var ann,
        lvl,
        log,
        ctx;

    switch (arguments.length) {
        case 1:
            // object/string to log
            break;
        case 2:
            //  object/string + either an annotation/context or log level
            if (TP.boot.$isNumber(obj)) {
                lvl = obj;
            } else if (TP.boot.$isString(obj) &&
                    TP.boot.LOG_NAMES.indexOf(obj) !== -1) {
                lvl = TP.boot[obj];
            } else {
                ann = obj;
            }
            break;
        default:
            //  all three, or more but we ignore past 3.
            ann = obj;
            lvl = level;
            break;
    }

    //  If level wasn't explicitly set above we'll set it now.
    if (TP.boot.$notValid(lvl)) {
        lvl = TP.INFO;
    }

    log = msg;

    // If there's annotation data we need to consider that, or relay it as
    // context data if it's an arguments array.
    if (TP.boot.$isValid(ann)) {
        if (TP.boot.$isArgumentArray(ann)) {
            ctx = ann;
        } else {
            log = TP.boot.$annotate(ann, msg);
        }
    }

    TP.boot.log(log, lvl, ctx);

    return;
};

TP.boot.STDOUT_NOTIFY = function(msg, obj, level) {

    /**
     * @name STDOUT_NOTIFY
     * @summary Logs a message and displays it via TP.boot.$notify. Only the
     *     first parameter is passed to $notify().
     * @param {String} msg The message to log.
     * @param {Object|Number} obj Optional annotation, argument list, or logging
     *     level. This parameter is overloaded. When three arguments are present
     *     should be an annotation or argument array and level should be third.
     * @param {Number} level A boot logging level. Default is TP.INFO.
     */

    TP.boot.STDOUT_LOG(msg, obj, level);
    TP.boot.$notify(msg);
    return;
};

//  ----------------------------------------------------------------------------

//  declarations of 'stdio' function references. these get installed based
//  on parameters that can alter how the boot process manages IO/logging.
//  NOTE that there are actually two forms of these variables, the TP.boot
//  version and a TP version found later. The TP.boot versions are specific
//  to IO for the boot process while the TP variants (TP.stdin, TP.stdout,
//  TP.stderr) are used by all of TIBET as low-level IO hooks often used by
//  TIBET tools.

//  define the default mappings. the tibet.xml file can override as needed
TP.boot.$stderr = TP.boot.STDERR_LOG;
TP.boot.$stdin = TP.boot.STDIN_PROMPT;
TP.boot.$stdout = TP.boot.STDOUT_LOG;

//  ------------------------------------------------------------------------

TP.boot.$$log = function(argList, aLogLevel) {

    /**
     * @name $$log
     * @summary Routes logging output to either stderr or stdout based on
     *     logging level.
     * @param {Arguments} argList A list of arguments from a logging call.
     * @param {Number} aLogLevel TP.INFO or a similar level name.
     * @todo
     */

    var level,
        message;

    // Get level in numeric form so we can test leveling below.
    level = TP.ifInvalid(aLogLevel, TP.INFO);
    level = TP.boot[level];

    // TODO: Convert argument list into a single message object we can output.
    message = argList[0];

    if ((level >= TP.boot.ERROR) && (level < TP.boot.SYSTEM)) {
        return TP.boot.$stderr(message, level);
    } else {
        return TP.boot.$stdout(message, level);
    }
};

//  ============================================================================
//  ERROR HANDLING
//  ============================================================================

//  define a new one we can count on to call TP.boot.$stderr for us, the
//  TIBET kernel will define a similar one itself for TIBET applications
window.onerror = function(msg, url, line, column, errorObj) {

    /**
     * @name onerror
     * @synopsis Captures global errors and outputs them appropriately. This
     *     hook allows TIBET to capture native JavaScript errors and avoid
     *     reporting them via the normal browser mechanism. This keeps users
     *     from being bombarded by messages about JS errors while allowing
     *     developers to see what's what.
     * @param {String} message The error message.
     * @param {String} url The url of the JavaScript script.
     * @param {Number} line The line number in that script.
     * @param {Number} column The column number in that script.
     * @param {Error} errorObj The error object of the error that caused this
     *     hook to trigger.
     * @returns {Boolean} TP.sys.shouldCaptureErrors() value.
     * @todo
     */

    var file,
        path,
        str;

    try {
        file = TP.boot.$$onerrorURL;
        path = (file == null) ? url : file;

        str = msg || 'Error';
        str += ' in file: ' + path + ' line: ' + line + ' column: ' + column;

        if (errorObj) {
            if (TP.getStackInfo) {
                str += '\nSTACK:\n' + TP.getStackInfo(errorObj).join('\n');
            } else {
                str += '\nSTACK:\n' + errorObj.stack;
            }
        }

        //  Invoke the currently configured stderr hook function. This will push
        //  the message into the logs and trigger any configured reporters. NOTE
        //  that logging a FATAL error will also terminate the boot process.
        TP.boot.$stderr(str, TP.FATAL);
    } catch (e) {
        // don't let log errors trigger recursion, but don't bury them either.
        top.console.error('Error logging onerror: ' + e.message);
        top.console.error(str || msg);
    }

    //  set a non-zero status to signify that an error occurred to callers
    //  which won't see a native Error in a catch block
    $STATUS = TP.FAILURE;

    return true;
};

//  ============================================================================
//  BROWSER DETECTION
//  ============================================================================

/*
 * Historically it's been shown that feature detection isn't sufficient if
 * you intend to actually support a framework in production. The browsers are
 * not stable version to version and bugs in things like sockets, workers, or
 * even function.bind crop up now and then. Partial support is another issue.
 *
 * Feature detection is a good starting point but it should be tempered with
 * some awareness of the code's current context. Newer versions of UA checking
 * do a sufficient job to let you combine the two reasonably well.
 *
 * Finally, certain specific user agent versions (and hence certain specific UA
 * strings) are literally too buggy to support. That doesn't happen as often as
 * it used to in the heyday of the browser wars, but it still happens. So a
 * final check against a list of known "bad browser strings" should be added.
 */

/*
 * NOTE that the code below is _really old_ and desperately in need of an update
 * to be current regarding things like mobile devices etc.
 */

//  ----------------------------------------------------------------------------

TP.$agent = null;
TP.$platform = 'other';
TP.$language = null;

TP.$browser = null;
TP.$browserUI = null;
TP.$browserSuffix = null;

TP.$browserIdent = null;
TP.$browserMajor = null;
TP.$browserMinor = null;
TP.$browserBuild = null;
TP.$browserPatch = null;

TP.$browserUIIdent = null;
TP.$browserUIMajor = null;
TP.$browserUIMinor = null;
TP.$browserUIBuild = null;
TP.$browserUIPatch = null;

TP.$msxml = null;

//  NOTE that these 3 are temporary and will be deleted once detect is done.
TP.$versions = null;
TP.$major = null;
TP.$minor = null;

TP.$$assignBrowser = function(aString) {

    var parts;

    parts = aString.split('.');

    TP.$browserIdent = aString;
    TP.$browserMajor = (parts[0] == null) ? 0 : parts[0];
    TP.$browserMinor = (parts[1] == null) ? 0 : parts[1];
    TP.$browserBuild = (parts[2] == null) ? 0 : parts[2];
    TP.$browserPatch = (parts[3] == null) ? 0 : parts[3];
};

TP.$$assignBrowserUI = function(aString) {

    var str,
        parts;

    //  Webkit suddenly decided to add '+' to the tail of their version
    //  numbers, just to make things more interesting I'm sure.
    str = aString.replace('+', '');
    parts = str.split('.');

    TP.$browserUIIdent = aString;
    TP.$browserUIMajor = (parts[0] == null) ? 0 : parts[0];
    TP.$browserUIMinor = (parts[1] == null) ? 0 : parts[1];
    TP.$browserUIBuild = (parts[2] == null) ? 0 : parts[2];
    TP.$browserUIPatch = (parts[3] == null) ? 0 : parts[3];
};

//  ----------------------------------------------------------------------------

//  capture default value for the browser, we'll adjust below.
TP.$browser = navigator.userAgent;

// convert all characters to lowercase to simplify certain tests
TP.$agent = navigator.userAgent.toLowerCase();

//  get major and minor version info as defined by the navigator object, we
//  can clear the slot used for the split values after parsing
TP.$versions = navigator.appVersion.split('.');
TP.$major = parseInt(TP.$versions[0], 10);

if (TP.$versions.length > 1) {
    TP.$minor = parseInt(TP.$versions[1], 10);
} else {
    TP.$minor = 0;
}

delete(TP.$versions);

//  ----------------------------------------------------------------------------
//  Platform (OS) - seems this is accurate enough for supported browsers.
//  We're really only interested in nailing down Windows, Mac, *NIX here
//  and with those variants we're likely to support. All others end up
//  categorized simple as 'other'.

if (TP.$agent.indexOf('windows nt') !== -1) {
    if (TP.$agent.indexOf('nt 5.0') !== -1) {
        TP.$platform = 'win2k';
    } else if (TP.$agent.indexOf('nt 5.1') !== -1) {
        TP.$platform = 'winxp';
    } else if (TP.$agent.indexOf('nt 5.2') !== -1) {
        TP.$platform = 'winxps';
    } else if (TP.$agent.indexOf('nt 6.0') !== -1) {
        TP.$platform = 'vista';
    } else {
        TP.$platform = 'winnt';
    }
} else if (TP.$agent.indexOf('win') !== -1) {
    TP.$platform = 'win';
} else if (TP.$agent.indexOf('mac') !== -1) {
    TP.$platform = 'mac';

    if (TP.$agent.indexOf('68k') !== -1 || TP.$agent.indexOf('68000') !== -1) {
        TP.$platform = 'mac68k';
    } else if (TP.$agent.indexOf('ppc') !== -1 ||
                TP.$agent.indexOf('powerpc') !== -1) {
        TP.$platform = 'macppc';
    }

    if (TP.$agent.indexOf(' os x') !== -1) {
        TP.$platform = 'macosx';
    }
} else if (TP.$agent.indexOf('sunos') !== -1 ||
        TP.$agent.indexOf('irix') !== -1 ||
        TP.$agent.indexOf('hp-ux') !== -1 ||
        TP.$agent.indexOf('aix') !== -1 ||
        TP.$agent.indexOf('inux') !== -1 ||
        TP.$agent.indexOf('ultrix') !== -1 ||
        TP.$agent.indexOf('unix_system_v') !== -1 ||
        TP.$agent.indexOf('reliantunix') !== -1 ||
        TP.$agent.indexOf('sinix') !== -1 ||
        TP.$agent.indexOf('freebsd') !== -1 ||
        TP.$agent.indexOf('bsd') !== -1) {
    TP.$platform = '*nix';
}

//  ----------------------------------------------------------------------------

//  Configure the language reference, this plays into localization later
if (navigator.userLanguage != null) {
    TP.$language = navigator.userLanguage;
} else {
    TP.$language = navigator.language;
}

//  ----------------------------------------------------------------------------
//  Browser/Renderer - here's where they tend to lie. Our goal here isn't
//  to determine precisely which browser we're dealing with as much as it's
//  to narrow down whether it's supported (IE, Safari, Chrome, Firefox) or
//  close enough (Gecko-based, Webkit-based) that we're willing to let it
//  slide with just a warning.

TP.$$match = null;

if (TP.$agent.indexOf('chrome/') !== -1) {
    //  Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.2.149.27 Safari/525.13

    //  chrome is WebKit-based for GUI, but has a different JS engine.

    //  TODO:   check for spoofing via object-testing for V8 etc?

    TP.$browser = 'chrome';
    TP.$browserUI = 'webkit';
    TP.$browserSuffix = 'Webkit';

    //  capture chrome number for browser version numbering
    TP.$$match = TP.$agent.match(/chrome\/([^ ]*?) /);
    if (TP.$$match != null) {
        TP.$$assignBrowser(TP.$$match[1]);
    }

    //  capture the webkit id for rendering engine numbers
    TP.$$match = TP.$agent.match(/applewebkit\/([^ ]*?) /);
    if (TP.$$match != null) {
        TP.$$assignBrowserUI(TP.$$match[1]);
    }

    //  A bug in Chrome returns the locale code (with an underscore '_')
    //  instead of the language code (with a dash '-').

    //  See: http://code.google.com/p/chromium/issues/detail?id=20071
    TP.$language = TP.$language.replace('_', '-');
} else if (TP.$agent.indexOf('safari/') !== -1 ||
            TP.$agent.indexOf('mobile/') !== -1) {  //  only reports
                                                    //  'mobile' when
                                                    //  iPhone/iPad is
                                                    //  running TIBET in
                                                    //  'non-chrome' mode.
    //  safari can lie completely, but typically identifies itself. the
    //  bigger problem is that a few others are clones for the Mac that we
    //  don't want to try to support.
    if (TP.$agent.indexOf('arora') !== -1 ||
        TP.$agent.indexOf('epiphany') !== -1 ||
        TP.$agent.indexOf('midori') !== -1 ||
        TP.$agent.indexOf('omniweb') !== -1 ||
        TP.$agent.indexOf('shiira') !== -1) {
        TP.$browser = 'wk-clone';
    } else {
        TP.$browser = 'safari';
        TP.$browserUI = 'webkit';
        TP.$browserSuffix = 'Webkit';

        //  capture safari number for browser version numbering
        TP.$$match = TP.$agent.match(/version\/([^ ]*?)($| )/);
        if (TP.$$match != null) {
            TP.$$assignBrowser(TP.$$match[1]);
        }

        //  capture the webkit id for rendering engine numbers
        TP.$$match = TP.$agent.match(/applewebkit\/([^ ]*?)($| )/);
        if (TP.$$match != null) {
            TP.$$assignBrowserUI(TP.$$match[1]);
        }
    }
} else if (TP.$agent.indexOf('firefox/') !== -1 ||
            TP.$agent.indexOf('minefield/') !== -1 ||
            TP.$agent.indexOf('mozilladeveloperpreview/') !== -1) {
    //  firefox has a number of clones we want to watch out for
    if (TP.$agent.indexOf('camino') !== -1 ||
        TP.$agent.indexOf('epiphany') !== -1 ||
        TP.$agent.indexOf('flock') !== -1 ||
        TP.$agent.indexOf('navigator') !== -1 ||
        TP.$agent.indexOf('swiftfox') !== -1) {
        TP.$browser = 'ff-clone';
    } else {
        TP.$browser = 'firefox';
        TP.$browserUI = 'gecko';
        TP.$browserSuffix = 'Gecko';

        //  nightlies use minefield, not firefox, for version prefix
        if (TP.$agent.indexOf('minefield') !== -1) {
            TP.$$match = TP.$agent.match(/minefield\/([^ ]*?)($| )/);
        } else {
            TP.$$match = TP.$agent.match(/firefox\/([^ ]*?)($| )/);
        }

        if (TP.$$match != null) {
            TP.$$assignBrowser(TP.$$match[1]);
        }

        //  capture the gecko id for rendering engine numbers
        TP.$$match = TP.$agent.match(/rv:(.*?)\)/);
        if (TP.$$match != null) {
            TP.$$assignBrowserUI(TP.$$match[1]);
        }
    }
} else if (TP.$agent.indexOf('msie') !== -1) {
    //  some browsers may lie, but they won't have ActiveXObject support
    if (TP.global.ActiveXObject != null) {
        TP.$browser = 'ie';
        TP.$browserUI = 'trident';
        TP.$browserSuffix = 'IE';

        //  version is number (ala 6.0) behind key
        TP.$$match = TP.$agent.match(/msie (.*?);/);
        if (TP.$$match != null) {
            TP.$$assignBrowser(TP.$$match[1]);
        }

        //  Trident numbers aren't accessible from JS, but they map as
        //  follows:
        if (TP.$browserMajor === 7) {
            TP.$$assignBrowserUI('5.0.0.0');
        } else if (TP.$browserMajor === 8) {
            TP.$$assignBrowserUI('6.0.0.0');
        }
    } else {
        TP.$browser = 'spoof';
    }
}

//  ----------------------------------------------------------------------------
//  DETECTION QUERIES
//  ----------------------------------------------------------------------------

TP.sys.getBrowser = function() {

    /**
     * @name getBrowser
     * @summary Returns the standard 'browser' string, typically one of:
     *     'firefox', 'ie', 'safari', 'chrome'.
     * @return {String} The String representing the 'browser'.
     */

    return TP.$browser;
};

//  ----------------------------------------------------------------------------

TP.sys.getBrowserUI = function() {

    /**
     * @name getBrowserUI
     * @summary Returns the standard 'browser UI' string, typically one of:
     *     'gecko', 'trident', 'webkit'.
     * @return {String} The String representing the 'browser UI'.
     */

    return TP.$browserUI;
};

//  ----------------------------------------------------------------------------

TP.sys.isMac = function() {

    return TP.$platform.indexOf('mac') === 0;
};

//  ----------------------------------------------------------------------------

TP.sys.isNix = function() {

    return TP.$platform.indexOf('*nix') === 0;
};

//  ----------------------------------------------------------------------------

TP.sys.isWin = function() {

    return TP.$platform.indexOf('win') === 0 ||
            TP.$platform.indexOf('vista') === 0;
};

//  ----------------------------------------------------------------------------

TP.sys.isUA = function(browser, varargs) {

    /**
     * @name isUA
     * @summary Tests the current user agent (UA) for a specific version, or a
     *     version equal-to-or-above (TP.UP) or equal-to-or-below (TP.DOWN) a
     *     specified version number.
     * @param {String} browser The browser or browser UI string, typically one
     *     of: 'ie', 'safari', 'chrome', 'firefox', 'trident', 'webkit', or
     *     'gecko'.
     * @param {Array} varargs The remaining arguments can range from 0 to 5
     *     in length where the arguments are major, minor, patchMajor,
     *     patchMinor, and comparison respectively. The first 4 are numbers used
     *     to specify a version to varying degrees of detail. The comparison
     *     value should be a string, either TP.UP or TP.DOWN, which defines how
     *     the version testing should be done.
     * @return {Boolean} True if the current browser matches the test criteria.
     * @todo
     */

    var ua,
        cachedUA,

        arg,

        bmajor,
        bminor,
        bbuild,
        bpatch,

        tmajor,
        tminor,
        tbuild,
        tpatch,

        comparison;

    //  browser key must match lowercase
    ua = browser.toLowerCase();

    if (arguments.length === 1) {
        if ((cachedUA = TP.$$uaInfo[ua]) != null) {
            return cachedUA;
        }

        if (TP.$browser !== ua && TP.$browserUI !== ua) {
            TP.$$uaInfo[ua] = false;

            return false;
        }
    }

    //  define which keys we'll be using, browser or browerUI, based on what
    //  the inbound value was
    if (TP.$browser === ua) {
        bmajor = '$browserMajor';
        bminor = '$browserMinor';
        bbuild = '$browserBuild';
        bpatch = '$browserPatch';
    } else if (TP.$browserUI === ua) {
        bmajor = '$browserUIMajor';
        bminor = '$browserUIMinor';
        bbuild = '$browserUIBuild';
        bpatch = '$browserUIPatch';
    } else {
        return false;
    }

    //  slice up argument list based on length and data type to support the
    //  specific variable argument list form we've chosen
    switch (arguments.length) {
        case 1:

            //  no version info/comparison, just browser
            TP.$$uaInfo[ua] = true;

            return true;

        case 2:

            //  got a major version number only, ala TP.sys.isUA('IE', 7),
            //  so the comparison is simple
            return TP[bmajor] === arguments[1];

        case 3:

            tmajor = arguments[1];
            arg = parseInt(arguments[2], 10);

            if (isNaN(arg)) {
                comparison = arguments[2];
            } else {
                tminor = arguments[2];
            }

            break;

        case 4:

            tmajor = arguments[1];
            tminor = arguments[2];
            arg = parseInt(arguments[3], 10);

            if (isNaN(arg)) {
                comparison = arguments[3];
            } else {
                tbuild = arguments[3];
            }

            break;

        case 5:

            tmajor = arguments[1];
            tminor = arguments[2];
            tbuild = arguments[3];
            arg = parseInt(arguments[4], 10);

            if (isNaN(arg)) {
                comparison = arguments[4];
            } else {
                tpatch = arguments[4];
            }

            break;

        case 6:

            tmajor = arguments[1];
            tminor = arguments[2];
            tbuild = arguments[3];
            tpatch = arguments[4];
            comparison = arguments[5];

            break;

        default:

            break;
    }

    comparison = (comparison != null) ? comparison.toUpperCase() : null;

    //  do the comparison. the basic idea here is that a match is valid as
    //  long as each step from major to minor patch release is consistent.
    if (comparison === TP.UP) {
        if (TP[bmajor] < tmajor) {
            return false;
        } else if (TP[bmajor] > tmajor) {
            return true;
        }

        if (tminor == null || TP[bminor] > tminor) {
            return true;
        } else if (TP[bminor] < tminor) {
            return false;
        }

        if (tbuild == null || TP[bbuild] > tbuild) {
            return true;
        } else if (TP[bbuild] < tbuild) {
            return false;
        }

        if (tpatch == null || TP[bpatch] > tpatch) {
            return true;
        } else if (TP[bpatch] < tpatch) {
            return false;
        }
    } else if (comparison === TP.DOWN) {
        if (TP[bmajor] > tmajor) {
            return false;
        } else if (TP[bmajor] < tmajor) {
            return true;
        }

        if (tminor == null || TP[bminor] < tminor) {
            return true;
        } else if (TP[bminor] > tminor) {
            return false;
        }

        if (tbuild == null || TP[bbuild] < tbuild) {
            return true;
        } else if (TP[bbuild] > tbuild) {
            return false;
        }

        if (tpatch == null || TP[bpatch] < tpatch) {
            return true;
        } else if (tpatch != null && TP[bpatch] > tpatch) {
            return false;
        }
    } else {
        if (tmajor !== TP[bmajor]) {
            return false;
        }

        if (tminor != null && tminor !== TP[bminor]) {
            return false;
        }

        if (tbuild != null && tbuild !== TP[bbuild]) {
            return false;
        }

        if (tpatch != null && tpatch !== TP[bpatch]) {
            return false;
        }
    }

    return true;
};

//  ----------------------------------------------------------------------------
//  IE MSXML VERSION TRACKING
//  ----------------------------------------------------------------------------

/*
Various tasks such as document creation etc. can be sensitive to the MSXML
and JScript versions available in IE. We test for that information here.
*/

//  ----------------------------------------------------------------------------

if (TP.sys.isUA('IE')) {

    //  NB: Put this in an enclosing function so that we can use local vars
    //  without them being hoisted into the global space
    (function() {
        var xmlDoc;

        //  We assign to 'xmlDoc' here to avoid JSHint errors, but we don't
        //  really use it.

        //  NB: MSXML versions 4 and 5 are not recommended by Microsoft, but
        //  we go ahead and set the TP.$msxml variable to the real version of
        //  MSXML that is installed. It's just that this shouldn't be used for
        //  creating documents, etc.
        try {
            xmlDoc = new ActiveXObject('Msxml2.DOMDocument.6.0');
            TP.$msxml = 6;
        } catch (e) {
            try {
                xmlDoc = new ActiveXObject('Msxml2.DOMDocument.5.0');
                TP.$msxml = 5;
            } catch (e2) {
                try {
                    xmlDoc = new ActiveXObject('Msxml2.DOMDocument.4.0');
                    TP.$msxml = 4;
                } catch (e3) {
                    try {
                        xmlDoc = new ActiveXObject('Msxml2.DOMDocument.3.0');
                        TP.$msxml = 3;
                    } catch (e4) {
                        try {
                            xmlDoc =
                                new ActiveXObject('Msxml2.DOMDocument.2.0');
                            TP.$msxml = 2;
                        } catch (e5) {
                        }
                    }
                }
            }
        }
    }());
}

//  ----------------------------------------------------------------------------

TP.sys.isMSXML = function(version, comparison) {

    /**
     * @name isMSXML
     * @summary Tests IE's MSXML version for an explicit version, or a version
     *     equal-to-or-above (TP.UP) or equal-to-or-below (TP.DOWN) a specified
     *     version number.
     * @param {Number} version The version number for comparison.
     * @param {String} comparison TP.UP or TP.DOWN.
     * @todo
     */

    if (comparison === TP.UP) {
        return TP.$msxml >= version;
    } else if (comparison === TP.DOWN) {
        return TP.$msxml <= version;
    } else {
        return TP.$msxml === version;
    }
};

//  ----------------------------------------------------------------------------
//  SUPPORTED PLATFORM TRACKING
//  ----------------------------------------------------------------------------

TP.sys.isObsolete = function() {

    /**
     * @name isObsolete
     * @summary Returns whether or not TIBET considers the current browser to be
     *     obsolete. Any browser not appearing to be ECMAScript-5 compliant is
     *     considered to be obsolete. Obsolete browsers refuse to boot TIBET.
     * @return {Boolean} Whether TIBET considers the browser obsolete.
     */

    //  simple check for rough ECMAScript 5 compliance.
    if ((typeof Object.keys !== 'function') ||
        (typeof Object.defineProperty !== 'function')) {
        return true;
    }

    return false;
};

//  ----------------------------------------------------------------------------

TP.sys.isSupported = function() {

    /**
     * @name isSupported
     * @summary Returns whether or not TIBET is supported in the browser that
     *     is currently trying to execute it. Supported browsers boot without
     *     any warnings. Obsolete browsers refuse to boot. "Unsupported" which
     *     is the gap between obsolete and supported (or those which aren't in
     *     the primary browser list) boot with warnings.
     * @return {Boolean} Whether or not TIBET is supported in the currently
     *     executing browser.
     */

    //  check for a few more advanced options re: HTML5
    if (window.WebSocket && window.Worker) {
        return true;
    }

    return false;
};

//  ============================================================================
//  LOAD INFORMATION
//  ============================================================================

/*
It's common to need information about the location from which TIBET was
loaded. This set of functions provides access to the host, port, protocol,
and pathname which were used to load TIBET, as well as the 'launch path'.
*/

//  first define whether we were loaded from file url or a web server
TP.sys.$httpBased = (window.location.protocol.indexOf('file') !== 0);

TP.sys.$scheme = window.location.protocol.slice(0, -1);
TP.sys.$pathname = decodeURI(window.location.pathname);

if (TP.sys.$httpBased) {
    TP.sys.$host = window.location.hostname;
    TP.sys.$port = ((window.location.port === '') ||
                    (window.location.port == null)) ?
                            80 :
                            window.location.port;
} else {
    TP.sys.$host = '';
    TP.sys.$port = '';
}

//  ----------------------------------------------------------------------------

TP.sys.isHTTPBased = function() {

    /**
     * @name isHTTPBased
     * @summary Returns true if the TIBET codebase was loaded via HTTP.
     * @return {Boolean} Whether or not the TIBET codebase was loaded over
     *     HTTP.
     */

    return TP.sys.$httpBased;
};

//  ----------------------------------------------------------------------------

TP.sys.getLaunchRoot = function() {

    /**
     * @name getLaunchRoot
     * @summary Returns the "launch root", either the web server's root or the
     *     root of the file system from which the current app was launched.
     * @return {String} The root path that the TIBET codebase was launched
     *     from.
     */

    var str,
        port,
        loc;

    if (TP.boot.$isValid(TP.sys.$launchRoot)) {
        return TP.sys.$launchRoot;
    }

    if (TP.sys.isHTTPBased()) {
        //  on http uris you need the host:port portion as a root
        str = TP.sys.getScheme() + '://' + TP.sys.getHost();
        if (TP.boot.$isValid(port = TP.sys.getPort()) &&
            port.toString() !== '80') {
            str += ':' + port;
        }
    } else if (TP.sys.isWin()) {
        //  on windows if you don't include the drive spec in the root the
        //  files won't be found. this is consistent with IE behavior.
        loc = decodeURI(window.location.toString());
        loc = loc.split(/[#?]/)[0];
        str = loc.slice(0, loc.lastIndexOf(':') + 1);
    } else {
        //  on unix-style platforms there's no drive spec to mess things up
        //  when resolving 'absolute' paths starting with '/'
        str = 'file://';
    }

    TP.sys.$launchRoot = str;

    return str;
};

//  ----------------------------------------------------------------------------

TP.sys.getHost = function() {

    /**
     * @name getHost
     * @summary Returns the hostname from which TIBET was loaded.
     * @return {String} The host from which TIBET was loaded.
     */

    return TP.sys.$host;
};

//  ----------------------------------------------------------------------------

TP.sys.getPathname = function() {

    /**
     * @name getPathname
     * @summary Returns the pathname from which TIBET was loaded.
     * @return {String} The pathname from which TIBET was loaded.
     */

    return TP.sys.$pathname;
};

//  ----------------------------------------------------------------------------

TP.sys.getPort = function() {

    /**
     * @name getPort
     * @summary Returns the port number string from which TIBET was loaded. If
     *     no port number was specified in the load URL this string is empty.
     * @return {Number} The port number from which TIBET was loaded.
     */

    return TP.sys.$port;
};

//  ----------------------------------------------------------------------------

TP.sys.getScheme = function() {

    /**
     * @name getScheme
     * @summary Returns the scheme used when TIBET was loaded. This is
     *     typically http or https which allows TIBET to determine if a secure
     *     connection is required as the default for future connections to the
     *     server.
     * @return {String} The protocol used when TIBET was loaded.
     * @todo
     */

    return TP.sys.$scheme;
};

//  ============================================================================
//  HTTP PRIMITIVES
//  ============================================================================

/**
 * @HTTP protocol support primitives. These provide the foundation for the
 *     HTTP-based content operations specific to booting. Full-featured versions
 *     ofthese are also found in the TIBET kernel, which adds support for a
 *     number ofmore advanced features.
 * @todo
 */

//  ----------------------------------------------------------------------------

TP.boot.$httpCall = function(targetUrl, callType, callHeaders, callUri) {

    /**
     * @name $httpCall
     * @summary Performs an XMLHTTPRequest based on the information provided.
     *     NOTE again that this version is specific to the boot system where
     *     synchronous loads are actually what's desired/required to ensure
     *     proper load sequencing.
     * @param {String} targetUrl The request's target URL.
     * @param {String} callType One of the valid HTTP call types such as
     *     TP.HTTP_HEAD, or TP.HTTP_GET.
     * @param {Array} callHeaders Key/value pairs to be used as request headers.
     *     Note that this call automatically uses no-cache headers. We use an
     *     array to avoid issues with loading TIBET and adding additional
     *     elements to Object.prototype. NOTE: that this differs from the
     *     kernel's $httpCall API which uses a hash.
     * @param {String} callUri Optional URI data for the call. Often used for
     *     GET/POST calls to provide CGI parameter strings, etc.
     * @raises Error Various HTTP-related errors.
     * @return {XMLHTTPRequest} The request object used for the call.
     * @todo
     */

    var i,
        httpObj,
        len;

    if (targetUrl == null) {
        return TP.boot.$httpError('InvalidURL: ' + targetUrl);
    }

    if (callType == null) {
        return TP.boot.$httpError('InvalidCallType: ' + callType);
    }

    //  same domain? if not we'll need permission to do this
    if (TP.sys.isUA('GECKO') &&
        (targetUrl.indexOf(TP.sys.getLaunchRoot()) !== 0)) {
        try {
            if (TP.sys.cfg('log.privilege_requests')) {
                TP.boot.$stdout('Privilege request at TP.boot.$httpCall',
                                TP.WARN);
            }

            netscape.security.PrivilegeManager.enablePrivilege(
                                                'UniversalBrowserRead');
        } catch (e) {
            return TP.boot.$httpError(
                        'PrivilegeException. url: ' + targetUrl,
                        TP.boot.$ec(e));
        }
    }

    try {
        httpObj = TP.boot.$httpCreate();

        //  If its Mozilla, and we're not trying to load XML, then set
        //  the MIME type to 'text/plain' to avoid parsing errors due to
        //  Moz trying to turn everything into XML and then complaining
        if (TP.sys.isUA('GECKO') &&
            (TP.boot.$uriResultType(targetUrl) !== TP.DOM)) {
            httpObj.overrideMimeType('text/plain');
        }
    } catch (e) {
        return TP.boot.$httpError(
            'RequestObjectError.  url: ' + targetUrl, TP.boot.$ec(e));
    }

    try {
        httpObj.open(callType, targetUrl, false);
    } catch (e) {
        return TP.boot.$httpError(
            'RequestOpenError. url: ' + targetUrl, TP.boot.$ec(e));
    }

    //  process any headers, note we always bypass caches if possible
    try {
        httpObj.setRequestHeader('Pragma', 'no-cache');
        httpObj.setRequestHeader('Cache-control', 'no-cache');
        httpObj.setRequestHeader('Cache-control', 'no-store');

        httpObj.setRequestHeader(
                'X-Requested-With', 'XMLHttpRequest');

        if (callHeaders != null) {
            //  NOTE    the use of an array here to avoid issues with TIBET
            //          adding to Object.prototype during the load process
            len = callHeaders.length;
            for (i = 0; i < len; i = i + 2) {
                httpObj.setRequestHeader(callHeaders[i],
                                            callHeaders[i + 1]);
            }
        }
    } catch (e) {
        return TP.boot.$httpError(
                    'HeaderConfigurationError. url: ' + targetUrl,
                    TP.boot.$ec(e));
    }

    //  isolate the actual send call for finer-grained error handling
    try {
        if (TP.sys.cfg('debug.http')) {
            TP.boot.$stdout('TP.boot.$httpCall() targetUrl: ' +
                targetUrl, TP.DEBUG);
            TP.boot.$stdout('TP.boot.$httpCall() callType: ' +
                callType, TP.DEBUG);
            TP.boot.$stdout('TP.boot.$httpCall() callUri: ' +
                ((callUri != null) ? callUri : 'n/a'), TP.DEBUG);
        }

        httpObj.send(callUri);

        if (TP.sys.cfg('debug.http')) {
            TP.boot.$stdout('TP.boot.$httpCall() status: ' +
                httpObj.status, TP.DEBUG);
            TP.boot.$stdout('TP.boot.$httpCall() headers: ' +
                httpObj.getAllResponseHeaders(), TP.DEBUG);

            if (TP.boot.$$verbose) {
                TP.boot.$stdout('TP.boot.$httpCall() result: ' +
                    httpObj.responseText, TP.DEBUG);
            }
        }
    } catch (e) {
        return TP.boot.$httpError(
                    'HTTPCallException: url: ' + targetUrl,
                    TP.boot.$ec(e));
    }

    return httpObj;
};

//  ----------------------------------------------------------------------------

TP.boot.$httpCreate = function() {

    /**
     * @name $httpCreate
     * @summary Returns a platform-specific XMLHttpRequest object for use.
     * @return {XMLHttpRequest} A new XMLHttpRequest object.
     */

    var request,
        versions,
        len,
        i;

    if (TP.sys.isUA('IE')) {
        //  first check here _should be_ for IE's built-in, however...
        //  TIBET doesn't use this object by default, because of the
        //  following limitations on calls made by using this object:
        //      - Limited to http:// or https:// protocols
        //      - Limited to same port, host and domain

        //  try to create the most recent version possible

        //  NB: MSXML versions 4 and 5 are not recommended by Microsoft,
        //  so we don't create them and have them commented out here.
        versions = ['Msxml2.XMLHTTP.6.0',
                        //'Msxml2.XMLHTTP.5.0',
                        //'Msxml1.XMLHTTP.4.0',
                        'Msxml2.XMLHTTP.3.0',
                        'Msxml2.XMLHTTP',
                        'Microsoft.XMLHTTP'];
        len = versions.length;

        for (i = 0; i < len; i++) {
            try {
                request = new ActiveXObject(versions[i]);
                break;
            } catch (e) {
            }
        }
    } else {
        request = new XMLHttpRequest();
    }

    if (request == null) {
        TP.boot.shouldStop('HTTP request creation failure.');
        TP.boot.$stderr(
            'RequestCreationError: could not create request object.',
            TP.FATAL);
    }

    return request;
};

//  ----------------------------------------------------------------------------

TP.boot.$httpError = function(aString, errObj) {

    /**
     * @name $httpError
     * @summary Throws an error containing aString, and optionally logs the
     *     string to TP.boot.$stderr. This allows debug mode to control
     *     whether all such calls are logged at the low level, while allowing
     *     catch blocks in higher-level calls to handle errors silently when not
     *     in debug mode.
     * @param {String} aString The error message, if any.
     * @param {Object} errObj An optional Error object, as creatd by the
     *     TP.boot.$ec() call.
     * @raises Error Throws an Error containing aString.
     * @return {null}
     * @todo
     */

    //  since we're throwing an exception here we'll rely on debug mode to
    //  tell us if we should log or not. the error may be handled higher up
    if (TP.sys.cfg('debug.http')) {
        TP.boot.$stderr(aString, errObj);
    }

    throw new Error(aString);
};

//  ============================================================================
//  URI PATHS
//  ============================================================================

/*
Path manipulation. These provide the necessary hooks to alter path
names to meet platform requirements and deal with "virtualized" paths.
*/

//  ----------------------------------------------------------------------------

TP.boot.$uriCollapsePath = function(aPath) {

    /**
     * @name $uriCollapsePath
     * @summary Collapses a URI path to remove any embedded . or .. segments
     *     which may exist.
     * @param {String} aPath The path to collapse.
     * @return {String} The path with any . or .. collapsed.
     */

    var path,
        newpath;

    //  first step is to expand any ~ path elements so we get an absolute
    //  path to work with
    path = TP.boot.$uriExpandPath(aPath);

    //  if the path has /. in it anywhere we've got an offset of some kind,
    //  but otherwise we can return with minimal overhead
    if (TP.HAS_PATH_OFFSET_REGEX.test(path) === false) {
        return decodeURI(path);
    }

    while (TP.HAS_PATH_OFFSET_REGEX.test(path)) {
        newpath = path.replace(TP.REMOVE_PATH_OFFSET_REGEX, '');

        if (newpath === path) {
            break;
        }

        path = newpath;
    }

    while (TP.HAS_PATH_NOOP_REGEX.test(path)) {
        newpath = path.replace(TP.REMOVE_PATH_NOOP_REGEX, '');

        if (newpath === path) {
            break;
        }

        path = newpath;
    }

    return decodeURI(path);
};

//  ----------------------------------------------------------------------------

TP.boot.$uriExpandPath = function(aPath) {

    /**
     * @name $uriExpandPath
     * @summary Returns the expanded form of the TIBET '~' (tilde) path
     *     provided. Variable values in the path (~[varname]/) are expanded
     *     using the corresponding TP.sys.cfg(path.varname) lookup. NOTE the
     *     'path.' prefixing here. All path variables are expected to be
     *     registered under a path.app_* or path.lib_* style key to help
     *     maintain lookup conventions.
     * @param {String} aPath The TIBET path to expand.
     * @return {String} A newly constructed path string.
     */

    var path,
        arr,
        variable,
        value;

    if ((path = TP.boot.$$fullPaths[aPath]) != null) {
        return path;
    }

    if (!aPath) {
        return aPath;
    }

    if (aPath === '/') {
        return TP.sys.getLaunchRoot();
    }

    if (aPath.indexOf('/') === 0) {
        // Launch root doesn't include a trailing slash, so avoid possible
        // recursion via uriJoinPaths and just concatenate.
        return TP.sys.getLaunchRoot() + aPath;
    }

    if (aPath.indexOf('~') !== 0) {
        return aPath;
    }

    //  we'll be altering the value so it's best not to mod the parameter
    path = aPath;

    if (path.indexOf('~/') === 0 || path === '~') {
        path = TP.boot.$uriJoinPaths(TP.boot.$getAppHead(), path.slice(2));
    } else if (path.indexOf('~app/') === 0 || path === '~app') {
        path = TP.boot.$uriJoinPaths(TP.boot.$getAppRoot(), path.slice(5));
    } else if (path.indexOf('~lib/') === 0 || path === '~lib') {
        path = TP.boot.$uriJoinPaths(TP.boot.$getLibRoot(), path.slice(5));
    } else if (path.indexOf('~tibet/') === 0 || path === '~tibet') {
        path = TP.boot.$uriJoinPaths(TP.boot.$getLibRoot(), path.slice(7));
    } else {
        arr = path.match(/~([^\/]*)\/(.*)/);
        if (!arr) {
            arr = path.match(/~([^\/]*)/);
        }

        if (arr) {
            variable = arr[1];

            //  NOTE we resolve these variables via the configuration data
            value = TP.sys.cfg('path.' + variable);

            if (typeof(value) === 'string') {
                //  one issue here is that we may have a variable value
                //  that starts with or ends with a '/' since they're
                //  parts of paths, but we don't want to alter that
                //  aspect of the current path so we want to trim them
                //  off if found
                if (value.indexOf('/') === 0) {
                    value = value.slice(1);
                }

                if (value.lastIndexOf('/') === (value.length - 1)) {
                    value = value.slice(0, -1);
                }

                //  patch the original path for testing
                path = aPath.replace('~' + variable, value);
            } else {
                if (variable === 'app_root') {
                    path = aPath.replace('~' + variable, TP.boot.$$approot);
                } else if (variable === 'lib_root') {
                    path = aPath.replace('~' + variable, TP.boot.$$libroot);
                }
            }
        }
    }

    //  variable expansions can sometimes create additional ~ paths
    if (path !== aPath && path.indexOf('~') === 0) {
        path = TP.boot.$uriExpandPath(path);
    }

    // remove any relative segments before caching
    path = TP.boot.$uriCollapsePath(path);

    //  Cache the expanded value so we don't do this work again.
    TP.boot.$$fullPaths[aPath] = path;

    return path;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriInLocalFormat = function(aPath) {

    /**
     * @name $uriInLocalFormat
     * @summary Returns the path with proper adjustments made to represent a
     *     valid file on the current platform.
     * @param {String} aPath The path to adjust.
     * @return {String} The supplied path adjusted to be a 'proper URL' for the
     *     current platform.
     */

    var path;

    //  work from a fully expanded string value
    path = TP.boot.$uriExpandPath(aPath);

    //  TODO: for now we only support conversion of file: scheme paths
    if (path.indexOf('file:') !== 0) {
        //  NOTE that we don't return the expanded path, we leave the
        //  incoming path in whatever form it came in
        return aPath;
    }

    //  remove the file scheme prefix, which may be all we need to do
    path = TP.boot.$uriMinusFileScheme(path);

    //  non-windows platforms we support don't need anything else, for
    //  example file:///usr/local/tibet becomes /usr/local/tibet :)
    if (!TP.sys.isWin()) {
        return path;
    }

    //  Windows needs some help (to say the least ;))
    if (path.charAt(1) !== ':') {
        path = path.charAt(0) + ':' + path.slice(1, path.length);
    }

    path = path.replace(/\//g, '\\\\');

    return path;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriInTIBETFormat = function(aPath) {

    /**
     * @name $uriInTIBETFormat
     * @summary Returns the path with typical TIBET prefixes for app_cfg,
     *     lib_cfg, app_root, and lib_root replaced with their TIBET aliases.
     *     This is typically used to shorten log output.
     * @param {String} aPath The URI path to process.
     * @return {String} The supplied path with typical TIBET prefixes.
     */

    var path;

    // Don't try to do this until we've computed the proper root paths.
    if (!TP.boot.$$approot || !TP.boot.$$libroot) {
      return aPath;
    }

    // TODO: best to replace with a better list derived from reflection on the
    // sys.cfg path.* properties.
    path = aPath.replace(TP.boot.$uriExpandPath('~app_cfg'), '~app_cfg');
    path = path.replace(TP.boot.$uriExpandPath('~lib_cfg'), '~lib_cfg');
    path = path.replace(TP.boot.$uriExpandPath('~app_src'), '~app_src');
    path = path.replace(TP.boot.$uriExpandPath('~lib_src'), '~lib_src');
    path = path.replace(TP.boot.$uriExpandPath('~app'), '~app');
    path = path.replace(TP.boot.$uriExpandPath('~lib'), '~lib');
    path = path.replace(TP.boot.$uriExpandPath('~tibet'), '~tibet');
    path = path.replace(TP.boot.$uriExpandPath('~'), '~');

    return path;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriIsAbsolute = function(aPath) {

    /**
     * Returns true if the path provided appears to be an aboslute path. Note
     * that this will return true for TIBET virtual paths since they are
     * absolute paths when expanded.
     * @param {string} aPath The path to be tested.
     * @return {Boolean} True if the path is absolute.
     */

    if (aPath.indexOf('~') === 0) {
        return true;
    }

    if (aPath.indexOf('/') === 0) {
        return true;
    }

    if (/^[a-zA-Z]+:/.test(aPath)) {
        return true;
    }

    return false;
};


//  ----------------------------------------------------------------------------

TP.boot.$uriIsVirtual = function(aPath) {

    /**
     * Returns true if the path provided appears to be a virtual path.
     * @param {string} aPath The path to be tested.
     * @return {Boolean} True if the path is virtual.
     */

    return aPath.indexOf('~') === 0;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriJoinPaths = function(firstPath, secondPath) {

    /**
     * @name uriJoinPaths
     * @summary Returns the two path components joined appropriately. Note that
     *     the second path has precedence, meaning that if the second path
     *     appears to be an absolute path the first path isn't used.
     * @param {String} firstPath The 'root' path.
     * @param {String} secondPath The 'tail' path.
     * @return {String} The two supplied paths joined together.
     * @todo
     */

    var i,
        len,
        val,
        first,
        second,
        path;

    if (firstPath == null || firstPath === '') {
        return secondPath;
    }

    if (secondPath == null || secondPath === '') {
        return firstPath;
    }

    //  tibet URIs are absolute, so we can return them immediately
    if (secondPath.indexOf('~') === 0) {
        return secondPath;
    }

    //  'typical' absolute paths can be expanded.
    if (secondPath.indexOf('/') === 0) {
        return TP.boot.$uriExpandPath(secondPath);
    }

    //  if the second path uses a scheme prefix we can return it right away
    if (secondPath.indexOf(':') !== TP.NOT_FOUND) {
        len = TP.SCHEMES.length;
        for (i = 0; i < len; i++) {
            if (secondPath.indexOf('' + TP.SCHEMES[i] + ':') === 0) {
                return secondPath;
            }
        }
    }

    //  work around mozilla bug
    if (firstPath.indexOf('about:blank') === 0) {
        first = firstPath.slice('about:blank'.length);
    } else {
        first = firstPath;
    }

    //  if the first path starts with '~' we adjust to the proper root
    if (first.indexOf('~') === 0) {
        path = TP.boot.$uriExpandPath(first);
        if (path !== first) {
            //  cause re-evaluation with the expanded variable value
            return TP.boot.$uriJoinPaths(path, secondPath);
        }
    }

    //  copy to a local so we can manipulate as needed
    second = secondPath;

    //  adjust for an OSX bug around "absolute paths"
    if (second.indexOf('/Volumes') === 0) {
        //  one case is where path is completely contained in first path
        if (first.indexOf(second) !== TP.NOT_FOUND) {
            return first;
        }

        if (second.indexOf(first) !== TP.NOT_FOUND) {
            return second;
        }

        if (first.indexOf(TP.boot.$uriPlusFileScheme(second))) {
            return first;
        }

        if (second.indexOf(TP.boot.$uriPlusFileScheme(first)) !==
                                                            TP.NOT_FOUND) {
            return second;
        }

        if (TP.boot.$uriPlusFileScheme(first).indexOf(second) !==
                                                            TP.NOT_FOUND) {
            return TP.boot.$uriPlusFileScheme(first);
        }

        if (TP.boot.$uriPlusFileScheme(second).indexOf(first) !==
                                                            TP.NOT_FOUND) {
            return TP.boot.$uriPlusFileScheme(second);
        }

        //  second is still an absolute path so go with that since the first
        //  is usually a "prefix" which is probably incorrect for the
        //  typically more concrete second path
        return TP.boot.$uriPlusFileScheme(second);
    }

    //  deal with second path starting with './', which is superfluous
    if (second.indexOf('./') === 0) {
        //  NOTE we leave on the slash, that will be dealt with later
        second = second.slice(1);
    }

    //  now for the '../' case...first we'll need to remove any trailing
    //  slash from the first path so we can back up accurately
    if (first.charAt(first.length - 1) === '/') {
        //  strange IE question here...reading a basedir ending in /
        //  gives us //. check for it and adjust as needed here
        if (first.lastIndexOf('//') === first.length - 2) {
            first = first.slice(0, first.length - 2);
        } else {
            first = first.slice(0, first.length - 1);
        }
    }

    //  while we're being told to 'back up' the path, do so
    while (second.indexOf('../') === 0) {
        second = second.slice(3, second.length);
        first = first.slice(0, first.lastIndexOf('/'));
    }

    //  join what's left, applying separator as needed
    if (second.charAt(0) !== '/') {
        val = first + '/' + second;
    } else {
        val = first + second;
    }

    return val;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriMinusFileScheme = function(aPath) {

    /**
     * @name $uriMinusFileScheme
     * @summary Returns the filename trimmed of any leading file://[/] chars.
     *     This is often necessary for proper use based on host platform.
     * @param {String} aPath The path to trim.
     * @return {String} The path trimmed of any leading file://[/] characters.
     */

    var path;

    if (!aPath) {
        TP.boot.$stderr('InvalidURI');

        return;
    }

    if (aPath.toLowerCase().indexOf('file:') !== 0) {
        return aPath;
    }

    //  slice off the file:// number of chars, removing the base prefix
    path = aPath.slice('file://'.length);

    //  on Windows we may need to slice 1 more character if the path
    //  matches /drive: rather than a UNC path
    if (TP.sys.isWin() && (/^\/\w:/).test(path)) {
        path = path.slice(1);
    }

    return path;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriPlusFileScheme = function(aPath) {

    /**
     * @name $uriPlusFileScheme
     * @summary Returns the filename padded with leading file://[/] chars. This
     *     is often necessary for proper use based on host platform.
     * @param {String} aPath The path to pad.
     * @return {String} The supplied path padded with the proper leading
     *     file://[/] characters.
     */

    var prefix,
        path;

    if (!aPath) {
        TP.boot.$stderr('InvalidURI');

        return;
    }

    if (aPath.toLowerCase().indexOf('file:') === 0) {
        return aPath;
    }

    prefix = 'file://';

    if (TP.sys.isWin() && (/^\w:/).test(aPath)) {
        prefix = prefix + '/';
    }

    path = prefix + aPath;

    //  one last check for UNC paths on windows is that we don't want to end
    //  up with four slashes...
    if (/file:\/\/\/\//.test(path)) {
        path = path.replace(/file:\/\//, 'file:');
    }

    return path;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriRelativeToPath = function(firstPath, secondPath, filePath) {

    /**
     * @name uriRelativeToPath
     * @summary Returns a "relativized" version of the firstPath at it relates
     *     to the second path. In essence, what path would you have to append to
     *     the secondPath to acquire the resource defined by the first path.
     * @description This method is a core method for helping stored files remain
     *     "relocatable". When storing TIBET metadata or compiled pages their
     *     internal references are automatically adjusted to relative paths
     *     using this routine. For example, given a path of ~lib_cfg/TIBET.xml
     *     as the firstPath and a path of ~lib_cfg as the secondPath we'd expect
     *     the return value to be ./cfg/TIBET.xml. Note that since the path
     *     returned is relative to a directory it is occasionally necessary to
     *     assist TIBET with whether it should treat the last element of the
     *     second path as a file or not. For example, if our secondPath in the
     *     previous example were ~lib_cfg/tibet_kernel.xml we'd want the path to
     *     be returned as ./TIBET.xml, not ../TIBET.xml as it would be if the
     *     last element were a directory.
     * @param {String} firstPath The path to convert.
     * @param {String} secondPath The path to be relative to.
     * @param {Boolean} filePath True if the absolute path includes a file
     *     reference. This is important since the offset is relative to
     *     directories, not files. Defaults to true since the vast majority of
     *     URI references are to files.
     * @return {String} The relativized version of firstPath.
     * @todo
     */

    var file,
        first,
        second,
        index,
        prefix,
        path,
        count,
        ndx,
        i,
        len,
        partial;

    //  the "path we append" to the second path to get the first path when
    //  the first path doesn't exist is null
    if (!firstPath) {
        return;
    }

    //  a "valid path" relative to some non-existent path is presumed to be
    //  the original path itself. we don't presume a "default root" here
    if (!secondPath) {
        return firstPath;
    }

    //  are they the same path? then the relative path is '.'
    if (firstPath === secondPath) {
        return '.';
    }

    //  expand the paths to avoid issues with ~ prefixing
    first = TP.boot.$uriExpandPath(firstPath);
    second = TP.boot.$uriExpandPath(secondPath);

    //  get the first path normalized
    if (first.length > 1 && (first.lastIndexOf('/') === first.length - 1)) {
        //  if the first path ended in a '/' we can safely remove it since
        //  it's the same directory path with or without the trailing /
        first = first.slice(0, -1);
    }

    //  normalize the second path next

    if (filePath === true) {
        //  forced to interpret second path as a file path, so if there's
        //  any / in the second path we use that as the point of trimming
        //  the last segment
        if ((index = second.lastIndexOf('/')) !== TP.NOT_FOUND) {
            if (second.lastIndexOf('/') === (second.length - 1)) {
                second = second.slice(0, -1);
                second = second.slice(0, second.lastIndexOf('/'));
            } else {
                second = second.slice(0, second.lastIndexOf('/'));
            }
        } else {
            //  entire second path is a file name, so our example is
            //  something like file:///thisdir relative to foo.xml. We can't
            //  know where foo.xml is, but we might presume that it's in the
            //  same location as the first path's file (if first has a file
            //  reference, or that it's in the same directory as the first
            //  when the first is a directory path
            if (TP.FILE_PATH_REGEX.test(firstPath)) {
                //  first path has a file location, and we're assuming we're
                //  in the same directory, so the path would be '.'
                return '.' + first.slice(first.lastIndexOf('/'));
            } else {
                //  assuming second path file is in first path directory
                //  we'll return '.'
                return '.';
            }
        }
    } else if (filePath === false) {
        //  not able to alter second path too much, we're being forced to
        //  interpret it as a directory no matter what, but
        if (second.lastIndexOf('/') === (second.length - 1)) {
            second = second.slice(0, -1);
        }
    } else {
        //  try to determine if the second path is a file path or a
        //  directory path...the easiest check is does it end with a '/',
        //  after which we can check for an extension on the last portion
        if (second.lastIndexOf('/') === (second.length - 1)) {
            file = false;
            second = second.slice(0, -1);
        } else {
            //  if we can split the last element (having already split on
            //  '/') and find an extension then it's likely a file path
            if (TP.FILE_PATH_REGEX.test(second)) {
                file = true;
                second = second.slice(0, second.lastIndexOf('/'));
            } else {
                file = false;
            }
        }
    }

    //  after normalization we run our quick checks again

    //  the "path we append" to the second path to get the first path when
    //  the first path doesn't exist is null
    if (!first) {
        return;
    }

    //  a "valid path" relative to some non-existent path is presumed to be
    //  the original path itself. we don't presume a "default root" here
    if (!second) {
        return first;
    }

    //  are they the same path? then the relative path is '.'
    if (first === second) {
        return '.';
    }

    //  now for the other common cases, which hopefully helps us keep this
    //  running a little faster

    //  page compilation often wants a path relative to the cache directory
    //  or similar structure, meaning the first path is a subset of the
    //  second path (~app vs. ~app_tmp) so check for that
    if (second.indexOf(first) !== TP.NOT_FOUND) {
        path = second.replace(first, '');
        if (path.indexOf('/') === 0) {
            path = path.slice(1);
        }

        path = path.split('/');
        len = path.length;

        for (i = 0; i < len; i++) {
            path[i] = '..';
        }

        return path.join('/');
    }

    //  a large (predominant) number of these calls are asking for a full
    //  path relative to a directory higher up the tree (as in an app file
    //  relative to either the lib root or app root). in these cases the
    //  second path is completely contained in the first path and we're
    //  simply trying to detemine how many segments to remove from the path
    //  before we tack on a leading './'. we can determine that condition by
    //  simply replacing the secondPath with a '.' and seeing if we end up
    //  with a './' path meaning the replacement was clean on a directory
    //  boundary
    if ((path = first.replace(second, '.')) !== first) {
        //  we know there was at least a match, but did it produce a valid
        //  relative path?
        if (path.indexOf('./') === 0) {
            return path;
        }
    }

    //  if the first path is relative we can shortcut the test
    if (first.indexOf('.') === 0) {
        //  we're often forced, when resolving two paths, to adapt a path
        //  relative to a file (think about href values being resolved
        //  against their window.location) so we need an extra .. prefix
        if (file === true) {
            //  if it's a "local" file we don't want to return .././foo so
            //  we remove the internal ./ portion and make it ../foo,
            //  otherwise it's ../something and we want ../../something to
            //  ensure we skip past the file element of the second path
            if (first.indexOf('./') === 0) {
                return '../' + first.slice(2);
            } else {
                return '../' + first;
            }
        }

        return first;
    }

    //  a second common case is when we're looking for a directory in
    //  the middle of a larger absolute path (as when trying to locate
    //  basedir or libroot references)
    if ((ndx = second.indexOf(first)) !== TP.NOT_FOUND) {
        //  looks like the first path is a point in the second path, so the
        //  question now is how many segments "up" in the second path is it

        //  get the 'tail' from the match down as our starting point and
        //  remove the matching portion. so if we had something like
        //  file://foo/bar/tibet/baz/tibet.html and 'tibet' or '/tibet' as
        //  a relative portion we're now holding /baz/tibet.html...
        partial = second.slice(ndx).replace(first, '');

        count = partial.split('/').length;
        prefix = '';
        for (i = 0; i < count; i++) {
            prefix = prefix + '../';
        }

        return prefix + first;
    }

    //  neither path is contained in the other, which means we're going to
    //  have to work a bit harder by looking for a common branch point in
    //  the middle of the two paths...

    count = 0;
    ndx = second.lastIndexOf('/');
    while (ndx !== TP.NOT_FOUND) {
        //  peel off the last segment
        second = second.slice(0, ndx);

        //  see if we can replace it as a subset of the first path now...
        if ((path = first.replace(second, '..')) !== first) {
            //  if we can then all we need to do is put the proper number of
            //  jumps (../) on the front so we've adjusted
            if (path.indexOf('../') === 0) {
                prefix = '';
                for (i = 0; i < count; i++) {
                    prefix = prefix + '../';
                }

                return prefix + path;
            }
        }

        //  count so we know to add when we find a match
        count++;

        ndx = second.lastIndexOf('/');
    }

    //  no common elements in the paths at all if we got here..., and the
    //  path wasn't relative so we have to assume absolute and just return
    return first;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriWithRoot = function(targetUrl, aRoot) {

    /**
     * @name $uriWithRoot
     * @summary Returns the path provided with any additional root information
     * which is necessary to create a full path name. The root used is the
     * result of calling TP.boot.$getRootPath(), which may be referencing either
     * the lib or app root at the time of the call depending on the current
     * settings.
     * @param {String} targetUrl A url to expand as needed.
     * @param {String} aRoot The root path to use. Default is launch root.
     * @return {String} The url - after ensuring a root exists.
     */

    var url,
        root;

    if (!targetUrl) {
        return;
    }

    url = targetUrl.toLowerCase();

    if (url.indexOf('http:') === 0 ||
        url.indexOf('file:') === 0 ||
        url.indexOf('https:') === 0) {
        return targetUrl;
    }

    //  note the use of the 'current root' path here since we can't assume
    //  that this should be rooted against libroot or approot without help
    if (TP.boot.$notValid(aRoot)) {
        root = TP.sys.getAppHead();
    } else {
        root = aRoot;
    }

    return TP.boot.$uriJoinPaths(root, targetUrl);
};

//  ============================================================================
//  URL (RE)LOCATION
//  ============================================================================

/**
 * @Provides methods for determining the true location of a URL. These are
 *     used when redirection of a URL may be occuring. HTTP versions of these
 *     functions rely on the Location header values in 3xx return code results.
 * @todo
 */

//  ----------------------------------------------------------------------------

TP.boot.$uriLocation = function(targetUrl) {

    /**
     * @name $uriLocation
     * @summary Returns the true location of the URL. If the URL has been
     *     moved this will return the Location header value from the redirect,
     *     otherwise the original URL location is returned.
     * @param {String} targetUrl URL of the target resource.
     * @return {String} The true location of the resource which may or may not
     *     be at targetUrl.
     */

    if (!targetUrl) {
        TP.boot.$stderr('InvalidURI');

        return null;
    }

    if (targetUrl.toLowerCase().indexOf('file') === 0) {
        return TP.boot.$uriLocationFile(targetUrl);
    } else {
        return TP.boot.$uriLocationHttp(targetUrl);
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLocationFile = function(targetUrl) {

    /**
     * @name $uriLocationFile
     * @summary Returns the true location of the file. For file urls (no HTTP)
     *     this is the original url. HTTP urls will return a value based on
     *     whether the final url is a redirected value.
     * @param {String} targetUrl URL of the target file.
     * @return {String} The true location of the file which may or may not be
     *     at targetUrl.
     */

    return targetUrl;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLocationHttp = function(targetUrl) {

    /**
     * @name $uriLocationHttp
     * @summary Returns the true location of the resource. If the resource has
     *     been moved this will return the Location header value from the
     *     redirect, otherwise the original URL location is returned.
     * @param {String} targetUrl URL of the target resource.
     * @return {String} The true location of the resource which may or may not
     *     be at targetUrl.
     */

    var httpObj;

    try {
        httpObj = TP.boot.$httpCall(targetUrl, TP.HTTP_HEAD);
        if (httpObj.status === 200) {
            return targetUrl;
        } else if (httpObj.status >= 300 && httpObj.status <= 307) {
            return httpObj.getResponseHeader('Location');
        } else {
            TP.boot.$stderr('NotFound: ' + targetUrl);
        }
    } catch (e) {
        TP.boot.$stderr('AccessException: ' + targetUrl,
                        TP.boot.$ec(e));
    }

    return null;
};

//  ============================================================================
//  RESOURCE AGING
//  ============================================================================

/**
 * @Informational methods providing data such as last-modified-date. This is
 *     useful when trying to determine whether a resource should be reloaded, or
 *     in determining whether a generated resource is older than its source.
 * @todo
 */

//  ----------------------------------------------------------------------------

TP.boot.$uriLastModified = function(targetUrl) {

    /**
     * @name $uriLastModified
     * @summary Returns the last-modified-date of the target resource.
     * @param {String} targetUrl URL of the target resource.
     * @raises InvalidURL, UnsupportedFeature
     * @return {Date} The Date the targetUrl was last modified.
     */

    var fname;

    if (!targetUrl) {
        TP.boot.$stderr('InvalidURL: ' + targetUrl);

        return null;
    }

    fname = TP.boot.$uriWithRoot(targetUrl);

    if (fname.toLowerCase().indexOf('file') === 0) {
        if (TP.sys.isUA('IE')) {
            return TP.boot.$uriLastModifiedIEFile(fname);
        } else if (TP.sys.isUA('GECKO')) {
            return TP.boot.$uriLastModifiedMozFile(fname);
        } else if (TP.sys.isUA('WEBKIT')) {
            //  can't access file system on safari so we assume the file was
            //  recently modified to ensure current data on loads
            return (new Date());
        }
    } else {
        return TP.boot.$uriLastModifiedHttp(fname);
    }

    return null;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLastModifiedIEFile = function(targetUrl) {

    /**
     * @name $uriLastModifiedIEFile
     * @summary Returns the last-modified-date of a file in the file system.
     * @param {String} targetUrl URL of the target file.
     * @raises AccessException, NotFound
     * @return {Date} The Date the targetUrl was last modified.
     */

    var fname,
        fso,
        file;

    //  remove the file:/// or the file won't be found
    fname = TP.boot.$uriMinusFileScheme(
                        TP.boot.$uriInLocalFormat(targetUrl));

    //  make sure that any spaces or other escaped characters in the file
    //  name get unescaped properly.
    fname = window.unescape(fname);

    try {
        fso = new ActiveXObject('Scripting.FileSystemObject');

        if (fso.FileExists(fname)) {
            file = fso.GetFile(fname);

            return new Date(file.DateLastModified);
        } else {
            TP.boot.$stderr('NotFound: ' + fname);
        }
    } catch (e) {
        TP.boot.$stderr('AccessException: ' + fname,
                        TP.boot.$ec(e));
    }

    return null;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLastModifiedMozFile = function(targetUrl) {

    /**
     * @name $uriLastModifiedMozFile
     * @summary Returns the last-modified-date of a file in the file system.
     * @param {String} targetUrl URL of the target file.
     * @raises AccessException, PrivilegeException,
     *     NotFound, FileComponentError
     * @return {Date} The Date the targetUrl was last modified.
     */

    //  it turns out that on Mozilla if you query for a directory you'll get
    //  a listing back in XHTML format that you can interrogate for the file
    //  data....of course this is likely to break all the time given that
    //  the moz team apparently can't leave well enough alone :(.

    var httpObj,
        text,
        file,
        re,
        parts,
        info,
        mod;

    httpObj = TP.boot.$httpCreate();

    //  If its Mozilla, and we're not trying to load XML, then set the MIME
    //  type to 'text/plain' to avoid parsing errors.
    if (TP.sys.isUA('GECKO') &&
        TP.boot.$uriResultType(targetUrl) !== TP.DOM) {
        httpObj.overrideMimeType('text/plain');
    }

    try {
        httpObj.open(TP.HTTP_GET,
                        targetUrl.slice(0, targetUrl.lastIndexOf('/')),
                        false);

        httpObj.send(null);
    } catch (e) {
        //  going to say we can't tell
        return null;
    }

    text = httpObj.responseText;

    if (text == null) {
        //  going to say we can't tell
        return null;
    }

    //  clean out whitespace so we (I ;)) can think clearly about the regex
    text = text.replace('\n', '', 'g').replace('> <', '><', 'g');

    //  we'll be matching against the file name only, not the full path
    file = targetUrl.slice(targetUrl.lastIndexOf('/') + 1);

    //  slice out the td's that hold size and date information
    re = new RegExp('>' +
                    file.replace('.', '\\.') +
                    '<\\/a><\\/td>(.*?)<\\/tr>');

    parts = text.match(re);
    if (!parts) {
        return null;
    }

    info = parts[1];

    //  now we'll have something that looks like this:
    //  <td>1 KB</td><td>10/20/2006</td><td>6:41:01 PM</td>
    parts = info.split('</td><td>');

    mod = new Date(parts[1] + ' ' + parts[2].slice(0, -5));

    return mod;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLastModifiedHttp = function(targetUrl) {

    /**
     * @name $uriLastModifiedHttp
     * @summary Returns the last-modified-date of a resource on a web server.
     * @param {String} targetUrl URL of the target resource.
     * @raises AccessException, NotFound
     * @return {Date} The Date the targetUrl was last modified.
     */

    var httpObj,
        header;

    //  leverage HEAD requests and HTTP headers to test resource.
    try {
        httpObj = TP.boot.$httpCall(targetUrl, TP.HTTP_HEAD);

        if (httpObj.status === 200) {
            header = httpObj.getResponseHeader('Last-Modified');

            return new Date(header);
        } else if (httpObj.status >= 300 && httpObj.status <= 307) {
            return TP.boot.$uriLastModifiedMozHttp(
                            httpObj.getResponseHeader('Location'));
        } else {
            TP.boot.$stderr('NotFound: ' + targetUrl);
        }
    } catch (e) {
        TP.boot.$stderr('AccessException: ' + targetUrl,
                        TP.boot.$ec(e));
    }

    return null;
};

//  ============================================================================
//  RESOURCE COMPARISON
//  ============================================================================

/*
Compares two resources by last-modified-date. This is useful when trying to
determine whether a resources should be reloaded, or in determining whether a
generated resources is older than its source.
*/

//  ----------------------------------------------------------------------------

TP.boot.$uriCurrent = function(targetUrl, sourceUrl) {

    /**
     * @name $uriCurrent
     * @summary Returns true if targetUrl has a newer modified date than
     *     sourceUrl. This version dispatches to the proper low-level
     *     browser-specific version appropriate to the environment.
     * @param {String} targetUrl URL of the target resource.
     * @param {String} sourceUrl URL of the source resource.
     * @return {Boolean} Whether or not the targetUrl is 'current' against the
     *     sourceUrl.
     * @todo
     */

    var t1,
        t2;

    if (targetUrl == null) {
        return false;
    }

    if (sourceUrl == null) {
        return true;
    }

    try {
        t1 = TP.boot.$uriLastModified(targetUrl);
    } catch (e) {
        //  error here means target is bad, etc.
        return false;
    }

    try {
        t2 = TP.boot.$uriLastModified(sourceUrl);

        //  both resources have dates, do the comparison
        return t1 >= t2;
    } catch (e) {
        //  error here means source is bad, but target is probably
        //  'more recent' in that case
        return true;
    }

    TP.boot.$stderr('UnsupportedFeature: TP.boot.$uriCurrent()');

    return false;
};

//  ============================================================================
//  RESOURCE EXISTENCE
//  ============================================================================

/*
Any time we are provided with a URL we check for its existence using
an appropriate mechanism. Both Mozilla and IE provide utilities for this
purpose at the file system level. Likewise, both provide an HTTP interface
which can be used to test for resource existence. This avoids 404's etc.
*/

//  ----------------------------------------------------------------------------

TP.boot.$uriExists = function(targetUrl) {

    /**
     * @name $uriExists
     * @summary Returns true if targetUrl exists on the boot server.
     * @param {String} targetUrl URL of the target resource.
     * @return {Boolean} Whether or not the targetUrl exists.
     */

    if (!targetUrl) {
        return false;
    }

    if (targetUrl.toLowerCase().indexOf('file') === 0) {
        return TP.boot.$uriExistsFile(targetUrl);
    } else {
        return TP.boot.$uriExistsHttp(targetUrl);
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$uriExistsFile = function(targetUrl) {

    /**
     * @name $uriExistsFile
     * @summary Returns true if targetUrl exists on the boot server.
     * @param {String} targetUrl URL of the target file.
     * @return {Boolean} Whether or not the targetUrl exists.
     */

    var httpObj;

    //  using HTTP object avoids permission problems on all browsers
    httpObj = TP.boot.$httpCreate();

    //  If its Mozilla, and we're not trying to load XML, then set the MIME
    //  type to 'text/plain' to avoid parsing errors.
    if (TP.sys.isUA('GECKO') &&
        TP.boot.$uriResultType(targetUrl) !== TP.DOM) {
        httpObj.overrideMimeType('text/plain');
    }

    try {
        httpObj.open(TP.HTTP_GET, targetUrl, false);
        httpObj.send(null);
    } catch (e) {
        //  IE acts strangely, depending on version and whether the URL
        //  being tested is a file or a directory. If it was a file, and it
        //  existed, we would never have gotten here. If could be a
        //  directory and exist, though, in which case an exception is still
        //  thrown. Luckily it is fairly straightforward to distinguish
        //  between that case and the case where its either a file or a
        //  directory, but really doesn't exist.

        if (TP.sys.isUA('IE')) {
            //  IE versions less than 8:

            //  If an exception is thrown with 'The system cannot locate the
            //  resource specified', then it couldn't find the file or
            //  directory and we should return false.
            if (/cannot locate/.test(e.message)) {
                return false;
            }

            //  IE8 and newer behavior:

            //  If the http status code is 2 or 3 and the exception is
            //  thrown with 'System error: -2146697211', then it couldn't
            //  find the file or directory and we should return false.
            if (/System error: -2146697211/.test(e.message) &&
                    (httpObj.status === 2 || httpObj.status === 3)) {
                return false;
            }

            //  Otherwise, it was probably a
            //  directory that really does exist, so we fall through to
            //  returning true at the end of the method.

            //  NOTE: in IE8 and higher, this will have an http status
            //  code of 0 and the exception will have: 'System error:
            //  -2146697195'
        } else if (TP.sys.isUA('GECKO')) {
            if (/Access to restricted URI denied/.test(e.message)) {
                TP.boot.$stderr('AccessException: ' + targetUrl,
                                TP.boot.$ec(e));
            }

            return false;
        } else {
            //  It threw an exception, which means that it definitely
            //  didn't find it so we always return false if we get here.
            return false;
        }
    }

    if (TP.sys.isUA('WEBKIT')) {
        //  Safari 4.X - all platforms
        if (httpObj.status === 404) {
            return false;
        }

        //  Safari 4.X - Windows
        if (TP.sys.isWin() && httpObj.status === -1100) {
            return false;
        }

        //  Safari 3.1 - Mac
        if (TP.sys.isMac() &&
            (httpObj.status === -1100 || httpObj.status === 400)) {
            return false;
        }

        //  Safari 3.1 - Windows
        if (TP.sys.isWin() && httpObj.status === 1789378560) {
            return false;
        }

        //  Chrome workaround -- sigh.
        if (httpObj.status === 0 && httpObj.responseText === '') {
            return false;
        }
    }

    return true;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriExistsHttp = function(targetUrl) {

    /**
     * @name $uriExistsHttp
     * @summary Returns true if targetUrl exists on the boot server.
     * @param {String} targetUrl URL of the target resource.
     * @return {Boolean} Whether or not the targetUrl exists.
     */

    var httpObj;

    try {
        httpObj = TP.boot.$httpCall(targetUrl, TP.HTTP_HEAD);

        if (httpObj.status === 200) {
            return true;
        } else if (httpObj.status >= 300 && httpObj.status <= 307) {
            return true;
        } else if (httpObj.status === 0) {
            if (/^chrome-extension/.test(targetUrl) &&
                httpObj.response != null) {
                return true;
            }
        }
    } catch (e) {
        //  index lookups cause problems, so if the path doesn't have an
        //  extension (or even more specifically ends with tibetinf) then
        //  presume a redirect/exception is "exists, but can't open"
        if (targetUrl &&
            targetUrl.indexOf(TP.sys.cfg('boot.tibetinf')) !==
                                                        TP.NOT_FOUND) {
            return true;
        }

        TP.boot.$stderr('AccessException: ' + targetUrl,
                        TP.boot.$ec(e));

        return false;
    }

    return false;
};

//  ============================================================================
//  RESOURCE LOAD
//  ============================================================================

/*
Numerous resources including XML config/build data need to be loaded at various
times. The routines in this section read data from either the local file
system or the net and produce XML documents which can be manipulated.
*/

//  ----------------------------------------------------------------------------

TP.boot.$uriLoad = function(targetUrl, resultType, targetType, isCacheable,
        isPackage) {
    /**
     * @name $uriLoad
     * @summary Loads the content of a targetUrl, returning that content as
     *     either XML or text depending on the desired resultType. The work to
     *     load the content may include checking TIBET's client-side cache based
     *     on targetType and isCacheable values.
     * @param {String} targetUrl URL of the target resource.
     * @param {TP.DOM|TP.TEXT} resultType Result as a DOM node or TEXT.
     * @param {String} targetType The nature of the target, 'source' or
     *     'manifest' are common values here.
     * @param {Boolean} isCacheable True if the content may be in the cache, and
     *     should be cached when loaded.
     * @param {Boolean} isPackage True if the resource being imported is a
     *     package-level resource. This can impact cache storage logic.
     * @return {XMLDocument|String} The XML document or String that was loaded
     *     from the targetUrl.
     * @todo
     */

    var logpath,
        result,
        lastmod;

    if (targetUrl == null) {
        TP.boot.$stderr('InvalidURI');

        return null;
    }

    //  compute common result type from input and targetUrl extension.
    resultType = TP.boot.$uriResultType(targetUrl, resultType);

    //  clear our cache lookup flag
    TP.boot.$loadCached = false;

    //  if the cache is active and being requested then we need to check
    //  there before going over the wire/to the file system (with one or two
    //  caveats based on the source preference).
    if (TP.sys.cfg('boot.localcache') && (isCacheable === true)) {

        logpath = TP.boot.$uriInTIBETFormat(targetUrl);

        switch (TP.sys.cfg('import.source')) {
            case 'marked':

                //  NOTE we fall through on purpose here...if the import
                //  mode is marked but this node is listed as cacheable then
                //  it must not be marked. in that case we fall through,
                //  check the cache and proceed based on our findings.

            case 'local':

                //  check cache before anything else, and no..we don't
                //  care about Last-Modified date, if we find the data
                //  we use it.
                TP.$BOOT_STORAGE.get(
                    targetUrl,
                    function(content) {

                        if (TP.boot.$isValid(content)) {
                            //  map content to outer scoped var for
                            //  reference after exit
                            result = TP.boot.$uriResult(content,
                                                            resultType);

                            //  flag that we got the data from the cache
                            TP.boot.$loadCached = true;
                        }
                    });

                //  if we found data then because we're set for 'local' mode
                //  we can return the data directly without checking dates
                if (TP.boot.$loadCached) {
                    if (TP.sys.cfg('debug.cache')) {
                        TP.boot.$stdout('Loaded ' + logpath +
                                        ' from cache.', TP.DEBUG);
                    }

                    return result;
                }

                break;

            case 'modified':

                //  modification dates are almost impossible to gather from
                //  non-HTTP urls so we don't support this approach except
                //  for urls with either an http or https scheme.
                if (/^http/.test(targetUrl)) {
                    //  depends on whether we can find a Last-Modified date
                    //  and some cached data for the targetUrl
                    TP.$BOOT_STORAGE.get(
                        targetUrl + '_lastmodified',
                        function(content) {

                            if (TP.boot.$isValid(content)) {
                                //  map content to outer scoped var for
                                //  reference after exit
                                lastmod = content;
                            }
                        });

                    //  if we found a modified date for the data we'll rely
                    //  on the uriLoad HTTP variant to use a 304-aware call
                    //  when it sees a last modified date and to return
                    //  cached data in response to a 304.
                    if (lastmod) {
                        if (TP.sys.cfg('debug.cache')) {
                            TP.boot.$stdout('Found ' + logpath +
                                        ' date ' + lastmod, TP.DEBUG);
                        }

                        //  NOTE that we'll have to rely on this routine to
                        //  cache the data when it's checking 304 states.
                        return TP.boot.$uriLoadCommonHttp(
                                            targetUrl,
                                            resultType,
                                            lastmod,
                                            isCacheable,
                                            isPackage);
                    } else {
                        if (TP.sys.cfg('debug.cache')) {
                            TP.boot.$stdout('No modified date for ' +
                                            logpath, TP.DEBUG);
                        }
                    }
                }

                break;

            default:

                //  don't care about cache, being forced to go remote

                break;
        }
    }

    if (targetUrl.toLowerCase().indexOf('file') === 0) {
        if (TP.sys.isUA('IE')) {
            result = TP.boot.$uriLoadIEFile(targetUrl, resultType);
        } else if (TP.sys.cfg('boot.moz_xpcom')) {
            //  if the uriLoadCommonFile has to switch into privilege mode
            //  for Moz/FF3+ then the flag will redirect so we don't waste
            //  time trying HTTP, we'll go straight to XPCOM
            result = TP.boot.$uriLoadMozFile(targetUrl, resultType);
        } else {
            result = TP.boot.$uriLoadCommonFile(targetUrl, resultType);
        }
    } else {
        //  NOTE that when we don't access cache data we don't provide a
        //  last modified date here so the HTTP calls don't check for 304.
        //  We do pass along a modified value for cacheable so the HTTP
        //  response can be saved in the cache if appropriate however.
        result = TP.boot.$uriLoadCommonHttp(
                targetUrl,
                resultType,
                null,
                TP.sys.cfg('boot.localcache') && (isCacheable === true),
                isPackage);
    }

    return result;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLoadCommonFile = function(targetUrl, resultType) {

    /**
     * @name $uriLoadCommonFile
     * @summary Loads (reads and produces an XML document for) targetUrl.
     * @param {String} targetUrl URL of the target file.
     * @param {TP.DOM|TP.TEXT} resultType Result as a DOM node or TEXT.
     * @return {XMLDocument|String} The XML document or String that was loaded
     *     from the targetUrl.
     * @todo
     */

    var httpObj;

    resultType = TP.boot.$uriResultType(targetUrl, resultType);

    httpObj = TP.boot.$httpCreate();

    //  If its Mozilla, and we're not trying to load XML, then set the MIME
    //  type to 'text/plain' to avoid parsing errors.
    if (TP.sys.isUA('GECKO') && (resultType !== TP.DOM)) {
        httpObj.overrideMimeType('text/plain');
    }

    //  for non-IE we always use the same approach to get the
    //  data...xmlhttprequest...even when using a file url
    try {
        httpObj.open(TP.HTTP_GET, targetUrl, false);
        httpObj.send(null);
    } catch (e) {
        //  as of FF3 HTTP calls to the file system can fail for a number of
        //  security reasons. if we encounter an error we'll retry via XPCOM
        if (TP.sys.isUA('GECKO', 1, 9, 0, TP.UP)) {
            TP.boot.$stdout('Switching to XPCOM for file load operations',
                            TP.boot.$ec(e), TP.WARN);
            TP.sys.setcfg('boot.moz_xpcom', true);

            return TP.boot.$uriLoadMozFile(targetUrl, resultType);
        }

        return null;
    }

    return TP.boot.$uriResult(httpObj.responseText, resultType);
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLoadIEFile = function(targetUrl, resultType) {

    /**
     * @name $uriLoadIEFile
     * @summary Loads (reads and produces an XML document for) targetUrl.
     * @param {String} targetUrl URL of the target file.
     * @param {TP.DOM|TP.TEXT} resultType Result as a DOM node or TEXT.
     * @return {XMLDocument|String} The XML document or String that was loaded
     *     from the targetUrl.
     * @todo
     */

    var doc,

        httpObj;

    resultType = TP.boot.$uriResultType(targetUrl, resultType);

    if (resultType === TP.DOM) {
        //  leverage DOMDocument's ability to load synchronously
        doc = TP.boot.$documentCreate();
        doc.load(targetUrl);

        if (doc.xml == null || doc.xml === '') {
            return;
        }

        return doc;
    } else {
        //  We use the HTTP functionality here, since it respects the 'same
        //  domain' process during boot, unlike the FileSystemObject (which
        //  causes disconcerting ActiveX alerts even when we're just reading
        //  a file from the same domain we booted from).

        httpObj = TP.boot.$httpCreate();

        try {
            httpObj.open(TP.HTTP_GET, targetUrl, false);
            httpObj.send(null);
        } catch (e) {
            //  An exception is thrown with 'The system cannot locate the
            //  resource specified' if file isn't there
            return null;
        }

        return TP.boot.$uriResult(httpObj.responseText, resultType);
    }

    return null;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLoadMozFile = function(targetUrl, resultType) {

    /**
     * @name uriLoadMozFile
     * @summary Loads (reads and produces an XML document for) targetUrl. This
     *     version is specific to Mozilla 1.3+ browsers.
     * @param {String} targetUrl URL of the target file.
     * @param {TP.DOM|TP.TEXT} resultType Result as a DOM node or TEXT.
     * @raises URINotFound, AccessViolation, DOMParseException,
     *     PrivilegeViolation, URIComponentException
     * @return {XMLDocument|String} The XML document or String that was loaded
     *     from the targetUrl.
     * @since 2.0
     * @todo
     */

    var FP,
        IOS,
        IS,

        file,
        fname,

        channel,
        stream,

        text;

    resultType = TP.boot.$uriResultType(targetUrl, resultType);

    //  file system access in Mozilla requires UniversalXPConnect
    try {
        if (TP.sys.cfg('log.privilege_requests')) {
            TP.boot.$stdout('Privilege request at TP.boot.$uriLoadMozFile',
                TP.WARN);
        }

        netscape.security.PrivilegeManager.enablePrivilege(
                                            'UniversalXPConnect');
    } catch (e) {
        TP.boot.$stderr('PrivilegeException: ' + targetUrl,
                        TP.boot.$ec(e));

        return;
    }

    try {
        //  mozilla-specific components, see Moz's FileUtils.js etc.
        FP = new Components.Constructor(
                    '@mozilla.org/file/local;1',
                    'nsILocalFile', 'initWithPath');

        /* eslint-disable space-in-brackets */
        IOS = Components.classes[
            '@mozilla.org/network/io-service;1'].getService(
                    Components.interfaces.nsIIOService);
        /* eslint-enable space-in-brackets */

        IS = new Components.Constructor(
                    '@mozilla.org/scriptableinputstream;1',
                    'nsIScriptableInputStream');
    } catch (e) {
        TP.boot.$stderr('FileComponentError: ' + targetUrl,
                        TP.boot.$ec(e));

        return;
    }

    //  adjust file name for platform and access path
    fname = TP.boot.$uriMinusFileScheme(
                                TP.boot.$uriInLocalFormat(targetUrl));

    //  make sure that any spaces or other escaped characters in the file
    //  name get unescaped properly.
    fname = window.unescape(fname);

    //  now for the fun part, files and channels and streams, oh my!
    try {
        file = new FP(fname);
        if (file.exists()) {
            channel = IOS.newChannelFromURI(IOS.newFileURI(file));
            stream = new IS();

            stream.init(channel.open());
            text = stream.read(file.fileSize);
            stream.close();

            return TP.boot.$uriResult(text, resultType);
        }
    } catch (e) {
        TP.boot.$stderr('AccessViolation: ' + targetUrl,
                        TP.boot.$ec(e));

        return;
    }

    return null;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLoadCommonHttp = function(targetUrl, resultType, lastModified,
                                        isCacheable, isPackage) {
    /**
     * @name $uriLoadCommonHttp
     * @summary Loads (reads and produces an XML document for) targetUrl.
     * @param {String} targetUrl URL of the target resource.
     * @param {TP.DOM|TP.TEXT} resultType Result as a DOM node or TEXT.
     * @param {String} lastModified An optional Last-Modified header value used
     *     along with 304 checking to minimize overhead for HTTP calls whose
     *     content is cached but needs to be refreshed.
     * @param {Boolean} isCacheable True if the content may be in the cache, and
     *     should be cached when loaded.
     * @param {Boolean} isPackage True if the resource being imported is a
     *     package-level resource. This can impact cache storage logic.
     * @return {XMLDocument|String} The XML document or String that was loaded
     *     from the targetUrl.
     * @todo
     */

    var logpath,
        doc,
        httpObj,
        result,
        headers,
        lastmod,
        response,
        chunks,
        len,
        i,
        chunk,
        chunkName,
        cnameRegex;

    resultType = TP.boot.$uriResultType(targetUrl, resultType);

    //  When accessing XML on IE we can leverage the DOMDocument load
    //  method for fast synchronous access provided we don't need to be
    //  leveraging header data for Last-Modified times.
    if (TP.sys.isUA('IE') && resultType === TP.DOM && !lastModified) {
        doc = TP.boot.$documentCreate();
        doc.load(targetUrl);

        if (doc.xml == null || doc.xml === '') {
            return;
        }

        return doc;
    }

    try {
        //  if we got a valid lastModified value then we're being asked to
        //  load for a "synchronized" update and need to use 304-aware code
        if (lastModified) {
            //  the httpCall routine accepts an array of key/value pairs as
            //  header content (to avoid issues with for/in etc) so build
            //  that here and pass along an If-Modified-Since header.
            headers = [];
            headers.push('If-Modified-Since', lastModified);

            httpObj = TP.boot.$httpCall(targetUrl, TP.HTTP_GET, headers);
        } else {
            httpObj = TP.boot.$httpCall(targetUrl, TP.HTTP_GET);
        }

        logpath = TP.boot.$uriInTIBETFormat(targetUrl);

        if (httpObj.status === 200) {

            //  if we did a= last-modified check and got a 200 we need to
            //  update our cache with both the date and the content since we
            //  got back new content, not a 304 saying the cache was fine
            if (lastModified) {
                if (TP.sys.cfg('debug.cache')) {
                    TP.boot.$stdout('Loaded ' + logpath + ' from origin.',
                                    TP.DEBUG);
                }

                lastmod = httpObj.getResponseHeader('Last-Modified');
                if (TP.sys.cfg('debug.cache')) {
                    TP.boot.$stdout('Refreshed ' + logpath +
                                    ' to ' + lastmod, TP.DEBUG);
                }

                TP.$BOOT_STORAGE.set(
                        targetUrl + '_lastmodified',
                        lastmod,
                        TP.NOOP);
            }

            //  if we're either working from a existing resource with a valid
            //  last-modified date or a new cachable resource then we want to
            //  save the result to the cache
            if (lastModified || isCacheable) {
                //  one additional check here, at least for the short-term,
                //  is that we only want to store javascript files that have
                //  been compressed...otherwise the cache will fill up.
                if (/\.js$/.test(logpath) !== true ||
                    logpath.indexOf(
                         TP.sys.cfg('pack.extension') + '.js') !==
                                                             TP.NOT_FOUND) {
                    if (TP.sys.cfg('debug.cache')) {
                        TP.boot.$stdout('Storing ' +
                                        logpath +
                                        ' to cache.', TP.DEBUG);
                    }

                    response = httpObj.responseText;

                    TP.$BOOT_STORAGE.set(
                            targetUrl,
                            response,
                            TP.NOOP);

                    //  code might be loading in packaged form, but we also
                    //  want to update the individual chunks so we can
                    //  support smaller-grained incremental updates.
                    if (isPackage && TP.sys.cfg('import.chunks')) {
                        if (TP.sys.cfg('debug.cache')) {
                            TP.boot.$stdout('Checking ' +
                                            logpath +
                                            ' for chunks.', TP.DEBUG);
                        }

                        chunks = response.split(
                                        TP.sys.cfg('boot.uichunked'));

                        len = chunks.length;
                        if (len > 1) {
                            cnameRegex = /\/\/\t(.*)/;

                            for (i = 0; i < len; i++) {
                                chunk = chunks[i];
                                if (!cnameRegex.test(chunk)) {
                                    continue;
                                }

                                chunkName = chunk.match(/\/\/\t(.*)/)[1];
                                if (chunkName &&
                                    (chunkName !== 'inline source')) {
                                    if (TP.sys.cfg('debug.cache')) {
                                        TP.boot.$stdout(
                                        'Storing ' +
                                        TP.boot.$uriInTIBETFormat(
                                                            chunkName) +
                                        ' to cache.', TP.DEBUG);
                                    }

                                    TP.$BOOT_STORAGE.set(
                                            chunkName,
                                            chunk,
                                            TP.NOOP);
                                }
                            }
                        }
                    }
                }
            }

            return TP.boot.$uriResult(httpObj.responseText, resultType);
        } else if (httpObj.status === 304) {
            //  if we did a last-modified check and got a 304 then we want
            //  to return the data we find in the cache
            TP.$BOOT_STORAGE.get(
                targetUrl,
                function(content) {

                    if (TP.boot.$isValid(content)) {
                        //  map content to our enclosing var for
                        //  reference, packaging it property for type
                        result = TP.boot.$uriResult(content, resultType);

                        //  flag that we got the data from the cache
                        TP.boot.$loadCached = true;

                        if (TP.sys.cfg('debug.cache')) {
                            TP.boot.$stdout('Loaded ' +
                                            logpath +
                                            ' from cache.', TP.DEBUG);
                        }
                    } else {
                        if (TP.sys.cfg('debug.cache')) {
                            //  a bit of a problem...had a last-modified
                            //  stamp but no data? ouch.
                            TP.boot.$stdout('Missing ' +
                                            logpath +
                                            ' in cache.', TP.DEBUG);
                        }

                        //  at a minimum clear the old data so we don't do
                        //  this more than once...
                        TP.$BOOT_STORAGE.set(
                                targetUrl + '_lastmodified',
                                null,
                                TP.NOOP);

                        TP.$BOOT_STORAGE.set(
                                targetUrl,
                                null,
                                TP.NOOP);
                    }
                });

            //  if we found data then because we're set for 'local' mode
            //  we can return the data directly without checking dates
            if (TP.boot.$loadCached) {
                return result;
            }
        } else if (httpObj.status === 0) {
            if (/^chrome-extension/.test(targetUrl) &&
                httpObj.responseText != null) {
                return TP.boot.$uriResult(httpObj.responseText, resultType);
            }
        }
    } catch (e) {
        TP.boot.$stderr('AccessException: ' + targetUrl,
                        TP.boot.$ec(e));
    }

    return null;
};

//  ============================================================================
//  URI RESULTS
//  ============================================================================

TP.boot.$uriResult = function(text, type) {

    /**
     * @name $uriResult
     * @summary Returns the proper result object given the result text and
     *     result type, typically from an XMLHTTPRequest's responseText.
     * @param {String} text The response text to process.
     * @param {TP.DOM|TP.TEXT|null} type The result type desired.
     * @return {String|Document} An XML document or the response text.
     * @todo
     */

    var doc;

    if (text == null) {
        return null;
    }

    if (type === TP.TEXT) {
        return text;
    }

    doc = TP.boot.$documentFromString(text);

    //  watch out for "empty documents"
    if (TP.boot.$isValid(doc) && (doc.childNodes.length > 0)) {
        return doc;
    }

    if (type !== TP.DOM) {
        return text;
    }

    return null;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriResultType = function(targetUrl, resultType) {

    /**
     * @name $uriResultType
     * @summary Returns a reasonable result type, TP.TEXT or TP.DOM, based on
     *     examination of the targetUrl's extension. If that check isn't
     *     definitive then the original resultType is returned (which may mean a
     *     null result type is returned).
     * @param {String} targetUrl A url to define a result type for.
     * @param {TP.DOM|TP.TEXT|null} resultType A result type constant.
     * @return {Number} TP.DOM|TP.TEXT|null
     * @todo
     */

    //  Certain extensions are clearly not intended to be XML, like .js and
    //  .css files for example. We ignore any input result type in these
    //  cases since there's no way they should be TP.DOM even if specified.
    if (/\.js$|\.css$|\.html$|\.txt$|\.json$/.test(targetUrl)) {
        return TP.TEXT;
    }

    if (/\.xml$|\.xhtml$|\.tsh$|\.xsl$|\.xsd$/.test(targetUrl)) {
        return TP.DOM;
    }

    //  Yes, this might be null.
    return resultType;
};

//  ============================================================================
//  RESOURCE SAVE
//  ============================================================================

/*
Primitive functions supporting resource save operations. Note that the HTTP
versions require the assistance of the TIBET Development Server components
or an equivalent set of CGI scripts/Servlets on the server side while the
file-system versions require varying permissions.
*/

//  ----------------------------------------------------------------------------

TP.boot.$uriSave = function(targetUrl, fileContent, fileMode) {

    /**
     * @name $uriSave
     * @summary Saves the fileContent to the targetUrl provided. If fileMode is
     *     'w' then the existing contents of the file, if any, are replaced with
     *     the new content. If fileMode is 'a' then the new content is appended
     *     to any existing content. In both cases the file is created if it
     *     doesn't already exist.
     * @param {String} targetUrl URL of the target file.
     * @param {String} fileContent The content of the file to save.
     * @param {String} fileMode Write (w) or append (a).
     * @raises NotFound, AccessException,
     *     InvalidFileMode, PrivilegeException, UnsupportedFeature
     * @return {Boolean} True on success, false on failure.
     * @todo
     */

    var fname;

    if (targetUrl == null) {
        TP.boot.$stderr('InvalidURI');

        return false;
    }

    fname = TP.boot.$uriWithRoot(targetUrl);

    if (fname.toLowerCase().indexOf('file') === 0) {
        if (TP.sys.isUA('GECKO')) {
            return TP.boot.$uriSaveMozFile(fname, fileContent, fileMode);
        } else if (TP.sys.isUA('IE')) {
            return TP.boot.$uriSaveIEFile(fname, fileContent, fileMode);
        } else if (TP.sys.isUA('WEBKIT')) {
            return TP.boot.$uriSaveWebkitFile(fname, fileContent, fileMode);
        }
    } else {
        return TP.boot.$uriSaveHttp(fname, fileContent, fileMode);
    }

    return null;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriSaveIEFile = function(targetUrl, fileContent, fileMode) {

    /**
     * @name $uriSaveIEFile
     * @summary Saves the fileContent to the targetUrl provided. If fileMode is
     *     'w' then the existing contents of the file, if any, are replaced with
     *     the new content. If fileMode is 'a' then the new content is appended
     *     to any existing content. When using 'a' an error is thrown if the
     *     file doesn't exist. When using 'w' the file is created if it doesn't
     *     already exist.
     * @param {String} targetUrl URL of the target file.
     * @param {String} fileContent The content of the file to save.
     * @param {String} fileMode Write (w) or append (a).
     * @raises NotFound, InvalidFileMode,
     *     AccessException
     * @return {Boolean} True on success, false on failure.
     * @todo
     */

    var fname,
        file,
        fso,
        ts;

    fname = TP.boot.$uriMinusFileScheme(
                        TP.boot.$uriInLocalFormat(targetUrl));

    if (fileMode == null) {
        fileMode = 'w';
    }

    //  make sure that any spaces or other escaped characters in the file
    //  name get unescaped properly.
    fname = window.unescape(fname);

    try {
        fso = new ActiveXObject('Scripting.FileSystemObject');

        if (fileMode === 'w') {
            if (!fso.FileExists(fname)) {
                fso.CreateTextFile(fname);
            }

            file = fso.GetFile(fname);
            ts = file.OpenAsTextStream(2);  //  2 -> ForWriting
            ts.Write(fileContent);
            ts.Close();

            return true;
        } else if (fileMode === 'a') {
            if (fso.FileExists(fname)) {
                file = fso.GetFile(fname);
                ts = file.OpenAsTextStream(8);  //  8 -> ForAppending
                ts.Write(fileContent);
                ts.Close();

                return true;
            } else {
                TP.boot.$stderr('NotFound: ' + fname);
            }
        } else {
            TP.boot.$stderr('InvalidFileMode: ' + fileMode);
        }
    } catch (e) {
        TP.boot.$stderr('AccessException: ' + fname,
                        TP.boot.$ec(e));
    }

    return false;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriSaveMozFile = function(targetUrl, fileContent, fileMode) {

    /**
     * @name $uriSaveMozFile
     * @summary Saves the fileContent to the targetUrl provided. If fileMode is
     *     'w' then the existing contents of the file, if any, are replaced with
     *     the new content. If fileMode is 'a' then the new content is appended
     *     to any existing content. When using 'a' an error is thrown if the
     *     file doesn't exist. When using 'w' the file is created if it doesn't
     *     already exist.
     * @param {String} targetUrl URL of the target file.
     * @param {String} fileContent The content of the file to save.
     * @param {String} fileMode Write (w) or append (a).
     * @raises NotFound, InvalidFileMode,
     *     AccessException, PrivilegeException
     * @return {Boolean} True on success, false on failure.
     * @todo
     */

    var FP,

        file,
        fname,
        flags,
        permissions,

        stream;

    if (fileMode == null) {
        fileMode = 'w';
    }

    //  file system access in Mozilla requires UniversalXPConnect
    try {
        if (TP.sys.cfg('log.privilege_requests')) {
            TP.boot.$stdout('Privilege request at TP.boot.$uriSaveMozFile',
                           TP.WARN);
        }

        netscape.security.PrivilegeManager.enablePrivilege(
                                            'UniversalXPConnect');
    } catch (e) {
        TP.boot.$stderr('PrivilegeException: ' + targetUrl,
                        TP.boot.$ec(e));

        return false;
    }

    //  mozilla-specific components, see Moz's FileUtils.js etc.
    try {
        FP = new Components.Constructor(
                    '@mozilla.org/file/local;1',
                    'nsILocalFile', 'initWithPath');

        /* eslint-disable space-in-brackets */
        stream = Components.classes[
            '@mozilla.org/network/file-output-stream;1'].createInstance(
                    Components.interfaces.nsIFileOutputStream);
        /* eslint-enable space-in-brackets */
    } catch (e) {
        TP.boot.$stderr('FileComponentError: ' + targetUrl,
                        TP.boot.$ec(e));

        return false;
    }

    //  adjust file name for platform and access path
    fname = TP.boot.$uriMinusFileScheme(
                                TP.boot.$uriInLocalFormat(targetUrl));

    //  make sure that any spaces or other escaped characters in the file
    //  name get unescaped properly.
    fname = window.unescape(fname);

    /* jshint bitwise:false */

    //  now for the fun part, files and transports and streams, oh my!
    try {
        /* eslint-disable no-octal */
        permissions = 0644;                 //  unix-style file mask
        /* eslint-enable no-octal */
        file = new FP(fname);
        if (fileMode === 'w') {
            flags = TP.MOZ_FILE_CREATE |
                    TP.MOZ_FILE_TRUNCATE |
                    TP.MOZ_FILE_WRONLY;

            stream.init(file, flags, permissions, null);
            stream.write(fileContent, fileContent.length);
            stream.flush();
            stream.close();

            return true;
        } else if (fileMode === 'a') {
            flags = TP.MOZ_FILE_APPEND |
                    TP.MOZ_FILE_SYNC |
                    TP.MOZ_FILE_RDWR;

            if (file.exists()) {
                stream.init(file, flags, permissions, null);
                stream.write(fileContent, fileContent.length);
                stream.flush();
                stream.close();

                return true;
            } else {
                TP.boot.$stderr('NotFound: ' + fname);
            }
        } else {
            TP.boot.$stderr('InvalidFileMode: ' + fileMode);
        }
    } catch (e) {
        TP.boot.$stderr('AccessException: ' + fname,
                        TP.boot.$ec(e));
    }

    /* jshint bitwise:true */

    return false;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriSaveWebkitFile = function(targetUrl, fileContent, fileMode) {

    /**
     * @name $uriSaveWebkitFile
     * @summary Saves the fileContent to the targetUrl provided. If fileMode is
     *     'w' then the existing contents of the file, if any, are replaced with
     *     the new content. If fileMode is 'a' then the new content is appended
     *     to any existing content. When using 'a' an error is thrown if the
     *     file doesn't exist. When using 'w' the file is created if it doesn't
     *     already exist.
     * @param {String} targetUrl URL of the target file.
     * @param {String} fileContent The content of the file to save.
     * @param {String} fileMode Write (w) or append (a).
     * @raises NotFound, InvalidFileMode,
     *     AccessException
     * @return {Boolean} True on success, false on failure.
     * @todo
     */

    TP.boot.$stderr('UnsupportedFeature: TP.boot.$uriSaveWebkitFile()');

    return false;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriSaveHttp = function(targetUrl, fileContent, fileMode) {

    /**
     * @name $uriSaveHttp
     * @summary Saves the fileContent to the targetUrl provided. If fileMode is
     *     'w' then the existing contents of the file, if any, are replaced with
     *     the new content. If fileMode is 'a' then the new content is appended
     *     to any existing content. When using 'a' an error is thrown if the
     *     file doesn't exist. When using 'w' the file is created if it doesn't
     *     already exist.
     * @param {String} targetUrl URL of the target file.
     * @param {String} fileContent The content of the file to save.
     * @param {String} fileMode Write (w) or append (a).
     * @raises HTTPError, AccessException
     * @return {Boolean} True on success, false on failure.
     * @todo
     */

    var path,
        url,
        httpObj;

    try {
        path = TP.boot.$uriExpandPath(targetUrl);

        httpObj = TP.boot.$httpCall(
                    path,
                    TP.HTTP_PUT,
                    ['Content-Type', 'text/plain'],
                    fileContent);

        if (httpObj.status === 200) {
            return true;
        } else {
            TP.boot.$stderr('HTTPError: ' + httpObj.status +
                            ' url: ' + url);
        }
    } catch (e) {
        TP.boot.$stderr('AccessException: ' + targetUrl,
                        TP.boot.$ec(e));
    }

    return false;
};

//  ============================================================================
//  DOM FUNCTIONS
//  ============================================================================

/*
Minimal functions to support boot system requirements for new documents.
*/

//  ----------------------------------------------------------------------------

TP.boot.$documentCreate = function(versionNumber) {

    /**
     * @name $documentCreate
     * @summary Creates a DOM document element for use.
     * @param {Number} versionNumber A specific version number which must be
     *     returned as a minimum version.
     * @return {XMLDocument} A new XML document.
     */

    if (TP.sys.isUA('IE')) {
        return TP.boot.$documentCreateIE(versionNumber);
    } else {
        return document.implementation.createDocument('', '', null);
    }

    return null;
};

//  ----------------------------------------------------------------------------

TP.boot.$documentCreateIE = function(versionNumber) {

    /**
     * @name $documentCreateIE
     * @summary Creates a DOM document element for use.
     * @param {Number} versionNumber A specific version number which must be
     *     returned as a minimum version.
     * @return {XMLDocument} A new XML document.
     */

    var doc,

        versions,
        len,
        i;

    if (versionNumber != null && typeof(versionNumber) === 'number') {
        //  asked for a specific version...
        switch (versionNumber) {
            case 2:

                doc = new ActiveXObject('Msxml2.DOMDocument');

                break;

            case 3:

                doc = new ActiveXObject('Msxml2.DOMDocument.3.0');

                break;

            /*
            NB: MSXML versions 4 and 5 are not recommended by Microsoft
            case 4:
                doc = new ActiveXObject('Msxml2.DOMDocument.4.0');
                break;
            case 5:
                doc = new ActiveXObject('Msxml2.DOMDocument.5.0');
                break;
            */

            case 6:

                doc = new ActiveXObject('Msxml2.DOMDocument.6.0');

                break;

            default:

                doc = new ActiveXObject('Msxml2.DOMDocument.3.0');

                break;
        }
    } else {
        //  attempt to get the latest and greatest version possible
        //  NB: DOMDocument versions 4 and 5 are not recommended by
        //  Microsoft, so we don't create them.
        versions = ['Msxml2.DOMDocument.6.0',
                        //'Msxml2.DOMDocument.5.0',
                        //'Msxml2.DOMDocument.4.0',
                        'Msxml2.DOMDocument.3.0',
                        'Msxml2.DOMDocument'];
        len = versions.length;

        for (i = 0; i < len; i++) {
            try {
                doc = new ActiveXObject(versions[i]);
                break;
            } catch (e) {
            }
        }
    }

    doc.resolveExternals = false;
    doc.validateOnParse = false;
    doc.async = false;

    doc.setProperty('SelectionLanguage', 'XPath');
    doc.setProperty('ProhibitDTD', false);

    return doc;
};

//  ----------------------------------------------------------------------------

TP.boot.$documentGetElementById = function(xmldoc, id) {
    return xmldoc.evaluate('//*[@id="' + id + '"]', xmldoc,
        function () {
            return 'http://www.w3.org/XML/1998/namespace';
        },
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null).singleNodeValue;
};

//  ----------------------------------------------------------------------------

TP.boot.$nodeAppendChild = function(aNode, newNode, shouldThrow) {

    /**
     * @name $nodeAppendChild
     * @summary Appends the newNode to the supplied node.
     * @param {Node} aNode The node to append the child node to.
     * @param {Node} newNode The node to append to aNode.
     * @param {Boolean} shouldThrow True to cause errors to throw a native Error
     *     so outer catch blocks will trigger.
     * @return {Node} The new node. This may be a different node than what was
     *     supplied to this routine, as the node might have been imported.
     * @todo
     */

    var nodeDoc,
        theNode;

    try {
        //  Appending content with syntax errors to the head, as when
        //  doing a source import, won't throw (so catch blocks won't
        //  work),  but the onerror hook will set a non-zero $STATUS.
        $STATUS = 0;
        $ERROR = null;

        if (TP.sys.isUA('IE')) {
            aNode.appendChild(newNode);
            theNode = newNode;
        } else {
            if (aNode.nodeType === Node.DOCUMENT_NODE) {
                nodeDoc = aNode;
            } else {
                nodeDoc = aNode.ownerDocument;
            }

            if (nodeDoc !== newNode.ownerDocument) {
                theNode = nodeDoc.importNode(newNode, true);
            } else {
                theNode = newNode;
            }

            aNode.appendChild(theNode);
        }
    } catch (e) {
        $ERROR = e;
    } finally {
        if ($ERROR) {
            if (shouldThrow) {
                throw $ERROR;
            }
        } else if ($STATUS !== 0) {
            //  an error of some kind occurred
            if (shouldThrow) {
                throw new Error('DOMAppendException');
            }
        }
    }

    return theNode;
};

//  ----------------------------------------------------------------------------

TP.boot.$nodeInsertBefore = function(aNode, newNode, insertionPointNode) {

    /**
     * @name $nodeInsertBefore
     * @summary Inserts the newNode into the child content of the supplied node
     *     before the supplied insertion point node. If insertionPointNode is
     *     null, then the new node is just appended to the child content of the
     *     supplied node.
     * @param {Node} anElement The node to insert the child content into.
     * @param {Node} newNode The node to insert into aNode.
     * @param {Node} insertionPointNode The node to use as an insertion point.
     *     The new content will be inserted before this point.
     * @return {Node} The new node. This may be a different node than what was
     *     supplied to this routine, as the node might have been imported.
     * @todo
     */

    var nodeDoc,
        theNode;

    if (TP.sys.isUA('IE')) {
        aNode.insertBefore(newNode, insertionPointNode);
    } else {
        if (aNode.nodeType === Node.DOCUMENT_NODE) {
            nodeDoc = aNode;
        } else {
            nodeDoc = aNode.ownerDocument;
        }

        if (nodeDoc !== newNode.ownerDocument) {
            theNode = nodeDoc.importNode(newNode, true);
        } else {
            theNode = newNode;
        }

        aNode.insertBefore(theNode, insertionPointNode);
    }

    return theNode;
};

//  ----------------------------------------------------------------------------

TP.boot.$nodeReplaceChild = function(aNode, newNode, oldNode) {

    /**
     * @name $nodeReplaceChild
     * @summary Replaces the oldNode in the supplied node with the newNode.
     * @param {Node} aNode The node to replace the child in.
     * @param {Node} newNode The node to replace oldNode with.
     * @param {Node} oldNode The node to be replaced with newNode.
     * @return {Node} The new node. This may be a different node than what was
     *     supplied to this routine, as the node might have been imported.
     * @todo
     */

    var nodeDoc,
        theNode;

    if (TP.sys.isUA('IE')) {
        aNode.replaceChild(newNode, oldNode);
    } else {
        if (aNode.nodeType === Node.DOCUMENT_NODE) {
            nodeDoc = aNode;
        } else {
            nodeDoc = aNode.ownerDocument;
        }

        if (nodeDoc !== newNode.ownerDocument) {
            theNode = nodeDoc.importNode(newNode, true);
        } else {
            theNode = newNode;
        }

        aNode.replaceChild(theNode, oldNode);
    }

    return theNode;
};

//  ============================================================================
//  NODE/STRING CONVERSION
//  ============================================================================

/*
nodeAsString and documentFromString processing to help with XML processing
*/

//  ----------------------------------------------------------------------------

TP.boot.$documentFromString = function(aString) {

    /**
     * @name $documentFromString
     * @summary Parses aString and returns the XML node representing the root
     *     element of the string's DOM representation.
     * @param {String} aString The source string to be parsed.
     * @return {Node}
     */

    if (TP.sys.isUA('IE')) {
        return TP.boot.$documentFromStringIE(aString);
    } else {
        return TP.boot.$documentFromStringCommon(aString);
    }

    return;
};

//  ----------------------------------------------------------------------------

//  parse once by defining externally to the function we'll use this in
if (TP.sys.isUA('GECKO')) {
    TP.boot.$$xmlParseErrorMsgMatcher =
        /XML Parsing Error: ([^\n]+)\nLocation: [^\n]+\nLine Number (\d+), Column (\d+)/;
} else if (TP.sys.isUA('WEBKIT')) {
    TP.boot.$$xmlParseErrorMsgMatcher =
        /error on line (\d+) at column (\d+): ([^<]+)/;
}

//  ----------------------------------------------------------------------------

TP.boot.$documentFromStringCommon = function(aString) {

    /**
     * @name $documentFromStringCommon
     * @summary Parses aString and returns the XML node representing the root
     *     element of the string's DOM representation.
     * @param {String} aString The source string to be parsed.
     * @return {XMLDocument} The XML document created from the supplied String.
     */

    var parser,
        xmlDoc,

        errorElement,
        errorMatchResults;

    parser = new DOMParser();
    xmlDoc = parser.parseFromString(aString, 'application/xml');

    if (TP.boot.$isValid(errorElement =
                        xmlDoc.getElementsByTagName('parsererror')[0])) {
        errorMatchResults = TP.boot.$$xmlParseErrorMsgMatcher.exec(
                                        errorElement.firstChild.nodeValue);

        //  don't log, we use this call in logging
        return null;
    }

    return xmlDoc;
};

//  ----------------------------------------------------------------------------

TP.boot.$documentFromStringIE = function(aString, prohibitDTD) {

    /**
     * @name $documentFromStringIE
     * @summary Parses aString and returns the XML node representing the root
     *     element of the string's DOM representation.
     * @param {String} aString The source string to be parsed.
     * @param {Boolean} prohibitDTD Turn off ability to parse in documents with
     *     DTDs.
     * @return {XMLDocument} The XML document created from the supplied String.
     * @todo
     */

    var xmlDoc,

        successfulParse,
        parseErrorObj,
        prohibit;

    xmlDoc = TP.boot.$documentCreate();

    prohibit = (prohibitDTD == null) ? false : prohibitDTD;

    xmlDoc.setProperty('ProhibitDTD', prohibit);

    successfulParse = xmlDoc.loadXML(aString);

    if (successfulParse === false) {
        parseErrorObj = xmlDoc.parseError;

        //  don't log, we use this call in logging
        return null;
    }

    return xmlDoc;
};

//  ----------------------------------------------------------------------------

TP.boot.$nodeAsString = function(aNode) {

    /**
     * @name $nodeAsString
     * @summary Returns the string representation of aNode.
     * @param {Node} aNode The node to transform.
     * @return {String} The String representation of the supplied Node.
     */

    if (TP.sys.isUA('IE')) {
        return TP.boot.$nodeAsStringIE(aNode);
    } else {
        return TP.boot.$nodeAsStringCommon(aNode);
    }

    return '';
};

//  ----------------------------------------------------------------------------

TP.boot.$nodeAsStringCommon = function(aNode) {

    /**
     * @name $nodeAsStringMoz
     * @summary Returns the string representation of aNode.
     * @param {Node} aNode The node to transform.
     * @return {String} The String representation of the supplied Node.
     */

    var str;

    if (aNode == null) {
        return '';
    }

    try {
        str = (new XMLSerializer()).serializeToString(aNode);

        return str;
    } catch (e) {
        return '';
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$nodeAsStringIE = function(aNode) {

    /**
     * @name $nodeAsStringIE
     * @summary Returns the string representation of aNode.
     * @param {Node} aNode The node to transform.
     * @return {String} The String representation of the supplied Node.
     */

    if (aNode != null && aNode.xml != null) {
        return aNode.xml;
    }

    return '';
};

//  ============================================================================
//  WINDOWING / DISPLAY
//  ============================================================================

TP.boot.$currentDocumentLocation = function() {

    /**
     * @name $currentDocumentLocation
     * @summary Returns the enclosing document's location, minus the docname
     *     itself and any parameters on the URI.
     * @return {String} The document's location.
     */

    var str,
        ndx;

    str = decodeURI(window.location.toString());
    str = str.split(/[#?]/)[0];

    ndx = str.lastIndexOf('/');
    if (ndx !== TP.NOT_FOUND) {
        return str.slice(0, ndx);
    } else {
        return str;
    }
};

//  ----------------------------------------------------------------------------

TP.sys.getWindowById = function(anID, aWindow) {

    /**
     * @name getWindowById
     * @summary Returns a reference to the window with the ID provided. This
     *     method tries a number of variations to locate a window whose name may
     *     be '.' separated without actually using the open call because we
     *     don't want the side effect of opening a window if the named one
     *     doesn't exist.
     * @param {String} anID A window/frame name.
     * @param {Window} aWindow A native window to root the search.
     * @return {Window} A native window reference.
     * @todo
     */

    var id,
        parts,
        elem,

        win,

        arr,
        len,
        i,

        current,
        next,

        opener,

        cWin;

    if (!anID) {
        return;
    }

    cWin = aWindow || window;

    //  most common cases in TIBET are 'top' and the aliases 'uicanvas' and
    //  'uiroot'
    switch (anID) {
        case 'top':

            return cWin.top;

        case 'uiroot':
        case 'UIROOT':

            elem = cWin.document.getElementById(anID);
            if (TP.boot.$isValid(elem) &&
                TP.boot.$isValid(elem.contentWindow)) {
                return elem.contentWindow;
            }

            return;

        case 'uicanvas':
        case 'UICANVAS':

            if (typeof(TP.sys.getUICanvas) === 'function') {
                //  This call will recurse back into this method, but with
                //  the real window name.
                return TP.sys.getUICanvas(true);
            }

            return;

        case 'parent':

            return parent;

        case 'opener':

            return cWin.opener;

        case 'self':
        case 'window':

            return cWin;

        default:

            break;
    }

    //  not a string? might be a window already
    if (typeof(anID) !== 'string') {
        if (TP.boot.$isWindow(anID)) {
            return anID;
        }

        return;
    }

    //  These slots are set when TP.core.Window objects are created.

    //  second common case is window_N based on new window creation
    if (TP.SCREEN_PREFIX_REGEX.test(anID) === true) {
        if (TP.boot.$isWindow(win = TP.global[top.name + '.UIROOT.' + anID])) {
            return win;
        }
    }

    //  another common case is window_N based on new window creation
    if (TP.WINDOW_PREFIX_REGEX.test(anID) === true) {
        if (TP.boot.$isWindow(win = TP.global[anID])) {
            return win;
        }
    }

    //  if we got a TIBET URI then we've got to split out the canvas ID.
    //  this also isn't recommended practice but the test is quick enough
    if (anID.indexOf('tibet:') === 0) {
        //  have to split into parts to get canvas ID. if we don't match its
        //  actually an invalid ID. if we match but it's empty then its
        //  shorthand for the current uicanvas
        if (TP.boot.$isValid(parts = anID.match(TP.TIBET_URI_SPLITTER))) {
            //  whole, jid, resource, canvas, path, pointer

            //  if there is a 'path', then this is not just a TIBET URI to a
            //  Window, so we exit here, returning nothing
            if (parts[4] != null && parts[4] !== '') {
                return;
            }

            id = parts[3] || 'uicanvas';

            if (id.toLowerCase() === 'uicanvas') {
                if (typeof(TP.sys.getUICanvas) === 'function') {
                    return TP.sys.getUICanvas();
                }
                return;
            }

            if (id.toLowerCase() === 'uiroot') {
                if (typeof(TP.sys.getUIRoot) === 'function') {
                    return TP.sys.getUIRoot();
                }

                return;
            }
        } else {
            return;
        }
    } else {
        id = anID;
    }

    //  normalize paths to dot-separated syntax
    id = id.replace(/\//g, '.');

    //  watch out for certain pathologies
    if (TP.BAD_WINDOW_ID_REGEX.test(id)) {
        return;
    }

    //  if it's not a window path (a.b.c format) check the obvious places
    if (/\./.test(id) !== true) {
        if (cWin.name === id) {
            return cWin;
        }

        if (cWin.parent.name === id) {
            return cWin.parent;
        }

        if (top.name === id) {
            return top;
        }

        if (TP.boot.$isWindow(win = cWin[id])) {
            return win;
        }

        if (TP.boot.$isWindow(win = cWin.parent[id])) {
            return win;
        }

        if (TP.boot.$isWindow(win = cWin.top[id])) {
            return win;
        }

        if (cWin.opener != null) {
            if (cWin.opener.name === id) {
                return cWin.opener;
            }

            if (TP.boot.$isWindow(win = cWin.opener[id])) {
                return win;
            }
        }

        //  no '.' and we've looked "everywhere" unless it's an IFRAME
        //  window...
        if ((win = cWin.document.getElementById(id)) != null) {
            try {
                return win.contentWindow;
            } catch (e) {
            }
        }

        return;
    }

    //  try iterating, stopping at each level to check for a window IFRAME
    arr = id.split('.');
    len = arr.length;
    current = cWin;

    for (i = 0; i < len; i++) {
        //  see if its a slot on the window object itself. If not, use a
        //  recursive lookup.
        next = current[arr[i]];
        if (!TP.boot.$isWindow(next)) {
            next = TP.sys.getWindowById(arr[i], current);

            if (next) {
                current = next;
                if (!TP.boot.$isWindow(current)) {
                    break;
                }
            } else {
                current = null;
                break;
            }
        } else {
            current = next;
        }
    }

    if (TP.boot.$isWindow(current)) {
        return current;
    }

    //  try openers. this is largely here to help new windows find TIBET
    opener = cWin.opener;
    if (opener != null &&
        opener !== cWin &&
        typeof(TP.windowIsInstrumented) === 'function') {
        if (!TP.windowIsInstrumented(opener)) {
            opener.TP.sys = TP.sys;
        }

        return opener.TP.sys.getWindowById(anID);
    }

    return;
};

//  ----------------------------------------------------------------------------

TP.windowIsInstrumented = function(nativeWindow) {

    /**
     * @name windowIsInstrumented
     * @summary Returns true if the window provided has been instrumented with
     *     TIBET base window functionality. If no window is provided this method
     *     returns true since the receiving window is clearly instrumented :).
     * @param {Window} nativeWindow A window to test. If none is provided the
     *     receiver is tested.
     * @return {Boolean} Whether or not the window is instrumented.
     */

    //  if no window is passed in treat it like a query for local window
    if (nativeWindow == null) {
        return window.$$instrumented === true;
    }

    //  check out the window...might not be a window ;)
    if (typeof(nativeWindow.location) === 'undefined') {
        return false;
    }

    if (nativeWindow.$$instrumented === true) {
        return true;
    }

    return false;
};

//  ============================================================================
//  DHTML PRIMITIVES
//  ============================================================================

/*
The simple DHTML primitives needed to manage startup processes like showing
a simple progress bar or displaying a console-style output log.

NOTE that these are trivial and not likely to work in all circumstances, but
then again they're only intended to get us through the initial boot
sequence.  After that the versions in the kernel take over.
*/

//  ----------------------------------------------------------------------------

TP.boot.$elementAddClass = function(anElement, aClassname) {

    /**
     * @name $elementAddClass
     * @summary Adds a CSS class name to the element if it is not already
     *     present.
     * @param {Element} anElement The element to add the CSS class to.
     * @param {String} aClassname The CSS class name to add.
     * @raises InvalidElement,InvalidString
     * @return {Element} The element the supplied class was added to.
     * @todo
     */

    var cls;

    if (TP.boot.$notValid(anElement)) {
        return;
    }

    if (TP.boot.$elementHasClass(anElement, aClassname)) {
        return anElement;
    }

    cls = anElement.className;
    if (!cls) {
        anElement.className = aClassname;
    } else {
        anElement.className = cls + ' ' + aClassname;
    }

    return anElement;
};

//  ----------------------------------------------------------------------------

TP.boot.$elementHasClass = function(anElement, aClassname) {

    var re,
        cls;

    if (TP.boot.$notValid(anElement)) {
        return;
    }

    //  NOTE: make sure that the class name is either first, last, or
    //  surrounded by whitespace
    re = new RegExp('(^|\\s)' + aClassname + '(\\s|$)');

    cls = anElement.className;

    return re.test(cls);
};

//  ----------------------------------------------------------------------------

TP.boot.$elementReplaceClass = function(anElement, aPattern, aClassname) {

    /**
     * @name $elementReplaceClass
     * @param {RegExp|String} aPattern A string (used as a literal pattern) or a
     *     regular expression to match against existing class names.
     */

    var re,
        cls,
        parts;

    if (TP.boot.$notValid(anElement)) {
        return;
    }

    if (typeof aPattern === 'string') {
        re = new RegExp('(^|\\s)' + aPattern + '(\\s|$)');
    } else {
        re = aPattern;
    }

    cls = anElement.className;

    // If pattern doesn't match this is a simple add operation.
    if (!re.test(cls)) {
        return TP.boot.$elementAddClass(anElement, aClassname);
    }

    // Find/remove the matching classname chunk(s)
    parts = cls.split(' ');
    parts = parts.filter(function(part) {
        return !re.test(part) && part !== aClassname;
    });
    parts.push(aClassname);
    anElement.className = parts.join(' ');

    return anElement;
};

//  ----------------------------------------------------------------------------

TP.boot.$elementSetInnerContent = function(anElement, theContent) {

    /**
     * @name $elementSetInnerContent
     * @summary Sets the 'inner content' of anElement.
     * @description This method sets the 'inner content' of anElement to
     *     theContent which means that just the contents of the element, not
     *     including its start and end tags, will be replaced with theContent.
     * @param {HTMLElement} anElement The element to set the 'inner content' of.
     * @param {String} theContent The content to replace the 'inner content' of
     *     anElement with.
     * @return {null}
     * @todo
     */

    if (anElement && anElement.ownerDocument) {
        anElement.innerHTML = theContent;
    }

    return;
};

//  ============================================================================
//  DISPLAY HELPERS
//  ============================================================================

TP.boot.$dump = function(anObject, aSeparator, htmlEscape, depth) {

    /**
     * @name anObject
     * @summary Dumps an object's key/value pairs in sorted order. This is used
     *     to produce output for configuration and environment data. By sorting
     *     the keys we make it a little easier to find specific properties
     *     quickly.
     * @param {Object} anObject The object to dump.
     * @param {String} aSeparator An optional separator string used to separate
     *     entries. Default is '\n'.
     * @return {String} A formatted object string.
     * @todo
     */

    var str,
        i,
        arr,
        len,
        keys,
        key,
        sep,
        val;

    // Don't dump primitives, only Object and Array-ish things.
    switch (typeof anObject) {
        case 'string':

            // Bit of a hack here, but we don't really want rafts of html
            // showing up in the log and certain types of request failures etc.
            // are full of 'target: ' where the target was a document.
            if (/<!DOCTYPE html><html/.test(anObject)) {
                str = anObject.replace(/\n/g, '__NEWLINE__');
                str = str.replace(/<!DOCTYPE html><html(.*)?<\/html>/g,
                                  '<html>...</html>');
                str = str.replace(/'__NEWLINE__'/g, '\n');
            } else {
                str = anObject;
            }

            if (htmlEscape === true) {
                return TP.boot.$htmlEscape(str);
            } else {
                return str;
            }
            break;
        case 'function':
        case 'number':
        case 'boolean':
            return anObject;
        default:
            if (anObject === null) {
                return 'null';
            }
            if (anObject === undefined) {
                return 'undefined';
            }
            if (anObject instanceof Date) {
                return anObject.toISOString();
            }
            if (anObject instanceof RegExp) {
                return anObject.toString();
            }
            if (TP.boot.$isValid(anObject.nodeType)) {
                return TP.boot.$htmlEscape(TP.boot.$nodeAsString(anObject));
            }
            break;
    }

    // For now we don't drill deeper than one level. Not all objects will
    // respond well to a simple string + obj form so call the root toString if
    // there's an exception ala 'Cannot convert object to primitive value'.
    if (depth && depth > 0) {
        try {
            return '' + anObject;
        } catch (e) {
            return Object.prototype.toString.call(anObject);
        }
    }

    sep = ' => ';
    if (htmlEscape === true) {
        sep = TP.boot.$htmlEscape(sep);
    }
    arr = [];

    if (anObject instanceof Array) {

        // Could use map() here but this works consistently.
        len = anObject.length;
        for (i = 0; i < len; i++) {
            arr.push(TP.boot.$dump(anObject[i], aSeparator, htmlEscape, 1));
        }

    } else {
        try {
            keys = Object.keys(anObject);
        } catch (e) {
            // Some objects don't even like Object.keys....sigh...
            return Object.prototype.toString.call(anObject);
        }
        keys.sort();

        len = keys.length;
        for (i = 0; i < len; i++) {
            key = keys[i];
            val = anObject[key];

            str = TP.boot.$dump(val, aSeparator, htmlEscape, 1);
            arr.push(key + sep + str);
        }
    }

    return arr.join(aSeparator || '\n');
};

//  ----------------------------------------------------------------------------

TP.boot.$htmlEscape = function(aString) {

    var result;

    result = aString.replace(/[<>'"]/g, function(aChar) {
        switch (aChar) {
            case    '<':
                return '&lt;';
            case    '>':
                return '&gt;';
            case    '\'':
                return '&apos;';
            case    '"':
                return '&quot;';
            default:
                break;
        }
    });

    //  Replace all '&' that are *not* part of an entity with '&amp;'
    result = result.replace(/&(?!([a-zA-Z]+|#[0-9]+);)/g, '&amp;');

    return result;
};

//  ----------------------------------------------------------------------------

TP.boot.$join = function(varargs) {

    /**
     * @name $join
     * @summary Returns a string built from joining the various arguments to
     *     the function.
     * @param {Object} varargs The first of a set of variable arguments.
     * @return {String}
     */

    //  NB: In modern browsers, going back to the old '+=' method of String
    //  concatenation seems to yield about a 40% performance gain.
    var str,
        len,
        i;

    str = '';

    len = arguments.length;
    for (i = 0; i < len; i++) {
        if (TP.boot.$isValid(arguments[i])) {
            str += arguments[i];
        }
    }

    return str;
};

//  ----------------------------------------------------------------------------

TP.boot.$lpad = function(obj, length, padChar) {

    /**
     * @name $lpad
     * @summary Returns a new String representing the obj with a leading number
     *     of padChar characters according to the supplied length.
     * @param {Object} obj The object to format with leading characters.
     * @param {Number} length The number of characters to pad the String
     *     representation with.
     * @param {String} padChar The pad character to use to pad the String
     *     representation.
     * @return {String}
     * @todo
     */

    var str,
        pad;

    str = '' + obj;
    pad = padChar || ' ';

    while (str.length < length) {
        str = pad + str;
    }

    return str;
};

//  ----------------------------------------------------------------------------

TP.boot.$quoted = function(aString) {
    return '\'' + aString.replace(/'/g, '\\\'') + '\'';
};

//  ----------------------------------------------------------------------------

TP.boot.$rpad = function(obj, length, padChar) {

    /**
     * @name $rpad
     * @summary Returns a new String representing the obj with a trailing number
     *     of padChar characters according to the supplied length.
     * @param {Object} obj The object to format with trailing characters.
     * @param {Number} length The number of characters to pad the String
     *     representation with.
     * @param {String} padChar The pad character to use to pad the String
     *     representation.
     * @return {String}
     * @todo
     */

    var str,
        pad;

    str = '' + obj;
    pad = padChar || ' ';

    while (str.length < length) {
        str = str + pad;
    }

    return str;
};

//  ----------------------------------------------------------------------------

TP.boot.$str = function(anObject, aSeparator) {

    /**
     * @name $str
     * @summary Returns a string representation of the object provided. This
     *     simple version is a basic wrapper for toString. The TIBET kernel
     *     provides a method which can produce more specialized responses to
     *     this request.
     * @param {Object} anObject The object whose string value is being
     *     requested.
     * @param {String} aSeparator The string to use as a record separator.
     * @return {String} A string of some form, even when empty.
     */

    if (anObject !== null) {
        if (anObject === undefined) {
            return 'undefined';
        }

        try {
            //  try to get decent string from Error objects
            if (typeof(anObject.message) === 'string') {
                return anObject.message;
            } else {
                return TP.boot.$dump(anObject, aSeparator || ', ');
            }
        } catch (e) {
            return '';
        }
    }

    return 'null';
};

//  ----------------------------------------------------------------------------

TP.boot.$trim = function(aString) {

    /**
     * @name $trim
     * @summary Returns a new String representing the parameter with any
     *     leading and trailing whitespace removed.
     * @param {String} aString The string to trim.
     * @return {String}
     */

    var str,
        ws,
        i;

    if (aString == null) {
        return;
    }

    str = aString.toString();
    str = str.replace(/^\s\s*/, '');

    ws = /\s/;
    i = str.length;

    while (ws.test(str.charAt(--i))) {
        void(0);
    }

    return str.slice(0, i + 1);
};

//  ============================================================================
//  SIMPLE LOG MESSAGE ANNOTATIONS
//  ============================================================================

TP.boot.Annotation = function(anObject, aMessage) {

    //  can't be null or undefined, or have empty annotation text.
    if (anObject == null || aMessage == null || aMessage === '') {
        throw new Error('InvalidParameter');
    }

    this.object = anObject;
    this.message = aMessage;
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.as = function(typeOrFormat, formatParams) {

    /**
     * @name as
     * @summary
     * @return {String}
     * @todo
     */

    var type,
        args;

    if (TP.boot.$notValid(type = TP.sys.require(typeOrFormat))) {
        return typeOrFormat.transform(this, formatParams);
    }

    //  if we got here we're either talking to a type that can't tell us
    //  what its name is (not good) or the receiver doesn't implement a
    //  decent as() variant for that type. In either case however all we can
    //  do is hope the type implements from() and we'll try that route.
    if (TP.canInvoke(type, 'from')) {
        switch (arguments.length) {
            case 1:
                return type.from(this);
            case 2:
                return type.from(this, formatParams);
            default:
                //  have to build up an argument array that includes the
                //  receiver as the first argument rather than the type
                args = TP.args(arguments);
                args.atPut(0, this);
                return type.from.apply(type, args);
        }
    }
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.getTypeName = function() {

    /**
     * @name getTypeName
     * @summary
     * @return {String}
     * @todo
     */

    return 'TP.boot.Annotation';
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.getSupertypes = function() {

    /**
     * @name getSupertypes
     * @summary
     * @return {String}
     * @todo
     */

    return [Object];
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.asDumpString = function() {

    /**
     * @name asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @return {String} A new String containing the dump string of the receiver.
     */

    return TP.boot.$join('TP.boot.Annotation :: ',
                            TP.boot.$str(this.object), ',',
                            TP.boot.$str(this.message));
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.asHTMLString = function() {

    /**
     * @name asHTMLString
     * @summary Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     */

    return TP.boot.$join(
            '<span class="TP_boot_Annotation">',
            '<span data-name="object">', TP.htmlstr(this.object), '<\/span>',
            '<span data-name="message">', TP.htmlstr(this.message), '<\/span>',
            '<\/span>');
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.asJSONSource = function() {

    /**
     * @name asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    return '{"type":"TP.boot.Annotation",' +
            '"data":{"object":' + TP.boot.$str(this.object).quoted('"') + ',' +
            '"message":' + TP.boot.$str(this.message).quoted('"') + '}}';
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.asPrettyString = function() {

    /**
     * @name asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty TP_boot_Annotation">' +
                '<dt>Type name<\/dt>' +
                '<dd class="pretty typename">' +
                    'TP.boot.Annotation' +
                '<\/dd>' +
                '<dt class="pretty key">object<\/dt>' +
                '<dd class="pretty value">' +
                    TP.boot.$str(this.object) +
                '<\/dd>' +
                '<dt class="pretty key">message<\/dt>' +
                '<dd class="pretty value">' +
                    TP.boot.$str(this.message) +
                '<\/dd>' +
                '<\/dl>';
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.asSource = function() {

    /**
     * @name asSource
     * @summary Returns the receiver as a TIBET source code string.
     * @return {String} An appropriate form for recreating the receiver.
     */

    return TP.boot.$join('TP.boot.$annotate(\'',
                            TP.boot.$str(this.object), '\',\'',
                            TP.boot.$str(this.message), '\')');
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.asXMLString = function() {

    /**
     * @name asXMLString
     * @summary Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     */

    return TP.boot.$join('<instance type="TP.boot.Annotation"',
                            ' object="', TP.boot.$str(this.object), '"',
                            ' message="', TP.boot.$str(this.message), '"\/>');
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.toString = function() {

    /**
     * @name toString
     * @summary Returns a string representation of the receiver.
     * @return {String}
     */

    return TP.boot.$join(TP.boot.$str(this.message),
                            ' [', TP.boot.$str(this.object), ']');
};

//  ----------------------------------------------------------------------------

TP.boot.$annotate = function(anObject, aMessage) {

    /**
     * @name $annotate
     * @summary Creates an annotated object, essentially a simple pairing
     *     between an object and an associated label or message. Often used for
     *     logging Node content without having to convert the Node into a string
     *     to bind it to an associated message.
     * @param {Object} anObject The object to annotate.
     * @param {String} aNote The note to annotate the object with.
     * @return {Object} An object whose keys include 'object' and 'message'
     *     such that a standard query can find those values.
     * @todo
     */

    if (anObject instanceof TP.boot.Annotation) {
        return anObject;
    }

    if (TP.boot.$notValid(anObject)) {
        TP.boot.$stderr('InvalidAnnotation: no object to annotate.');
        return;
    }

    return new TP.boot.Annotation(anObject, aMessage || anObject.message || '');
};

//  ----------------------------------------------------------------------------

TP.boot.$ec = function(anError, aMessage) {

    /**
     * @name $ec
     * @summary TP.core.Exception.create shortcut, later replaced by a
     *     full-featured version that ensures the resulting object can take
     *     advantage of TP.core.Exception's implementation of asString.
     * @param {Error} anError A native error object.
     * @param {String} aMessage A related string, usually a context-specific
     *     explanation of the native error.
     * @return {Object} An object whose keys include 'object' and 'message'
     *     such that a standard query can find those values.
     * @todo
     */

    return TP.boot.$annotate(anError, aMessage);
};

//  ============================================================================
//  Boot Reporters
//  ============================================================================

/*
 * Simple reporter functions which handle the details of output to different
 * targets. The two we need for certain are one for the console object found in
 * both browsers and Node.js and one for the TIBET boot UI if present.
 */

//  ----------------------------------------------------------------------------

TP.boot.$flushLog = function(force) {

    TP.boot.$flushUIBuffer(force);

    if (force === true) {
        TP.boot.$scrollUIBuffer();
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$scrollLog = function() {
    TP.boot.$scrollUIBuffer();
};

//  ----------------------------------------------------------------------------

TP.boot.$clearLog = function() {
    TP.boot.$clearUIBuffer();
};

//  ----------------------------------------------------------------------------

TP.boot.$$logReporter = function(entry, options) {
    var level,
        console,
        sep,
        esc,
        time,
        obj,
        name,
        delta,
        str,
        err,
        msg,
        dlimit;

    if (!entry) {
        return;
    }

    options = options || {};

    level = entry[TP.boot.LOG_ENTRY_LEVEL];

    // Track the highest non-system logging level we've seen.
    if (level > TP.boot.$$logpeak && level < TP.boot.SYSTEM) {
        TP.boot.$$logpeak = level;
    }

    if (!TP.boot.Log.canLogLevel(level)) {
        return;
    }

    time = entry[TP.boot.LOG_ENTRY_DATE];
    obj = entry[TP.boot.LOG_ENTRY_PAYLOAD];

    esc = TP.boot.$isValid(options.escape) ? options.escape : true;
    sep = TP.boot.$isValid(options.separator) ? options.separator : '\n';
    console = TP.boot.$isValid(options.console) ? options.console : false;

    // If the object is an annotation we've got to process it. Note that we
    // double the separator around object dumps to help offset key/value dump
    // data from the surrounding log headings. This helps dumped data stand out.
    if (obj instanceof TP.boot.Annotation) {
        str = sep + TP.boot.$dump(obj.message, sep, esc) +
            sep + sep + TP.boot.$dump(obj.object, sep, esc) + sep;
    } else if (typeof obj !== 'string') {
        if (TP.sys.hasKernel()) {
            if (TP.isKindOf(obj, TP.sig.Exception)) {
                str = TP.dump(obj);
                err = obj.getError();
                if (err && err.stack) {
                    str += '\n' + err.stack;
                }
            } else {
                str = TP.dump(obj);
            }
        }
        str = str || sep + sep + TP.boot.$dump(obj, sep, esc) + sep;
    } else {
        str = esc ? TP.boot.$htmlEscape(obj) : obj;
    }

    // Output format is;
    //
    //      time   delta    log level  message
    //
    //      000000 [+000] - level_name str
    //

    time = ('' + time.getTime()).slice(-6);
    delta = '';

    name = TP.boot.Log.getStringForLevel(level) || '';
    name = name.toLowerCase();

    if (TP.boot.$$loglevel === TP.DEBUG) {
        delta = entry[TP.boot.LOG_ENTRY_DELTA];
        dlimit = TP.sys.cfg('boot.delta_threshold');
        if (delta > dlimit) {
            TP.boot.$$bottlenecks += 1;
            delta = TP.boot.$style('[+' + delta + '] ', 'slow');
        } else {
            delta = TP.boot.$style('[+' + delta + '] ', 'delta');
        }
    }

    if (console) {
        msg = str;
    } else {
        msg = TP.boot.$style(time, 'time') + ' ' + delta + '- ' +
            TP.boot.$style(name + ' ' + str, name);
    }

    return msg;
};

//  ----------------------------------------------------------------------------

TP.boot.$consoleReporter = function(entry, options) {

    var msg,
        level;

    // Ignore attempts to log the entry to the console more than once.
    if (entry && entry.usedConsole) {
        return;
    }

    TP.sys.setcfg('log.color.mode', 'console');
    msg = TP.boot.$$logReporter(entry,
        {separator: '\n', escape: false, console: true});
    if (TP.boot.$notValid(msg)) {
        return;
    }

    level = entry[TP.boot.LOG_ENTRY_LEVEL];

    switch (level) {
    case TP.boot.TRACE:
        top.console.log(msg);
        break;
    case TP.boot.DEBUG:
        top.console.log(msg);
        break;
    case TP.boot.INFO:
        top.console.log(msg);
        break;
    case TP.boot.WARN:
        top.console.warn(msg);
        break;
    case TP.boot.ERROR:
        top.console.error(msg);
        break;
    case TP.boot.SEVERE:
        top.console.error(msg);
        break;
    case TP.boot.FATAL:
        top.console.error(msg);
        break;
    case TP.boot.SYSTEM:
        top.console.log(msg);
        break;
    default:
        top.console.log(msg);
        break;
    }

    entry.usedConsole = true;
};

//  ----------------------------------------------------------------------------

TP.boot.$bootuiReporter = function(entry, options) {

    var elem,
        msg,
        css,
        level;

    // If we've never output we have to "catch up" as it were and process each
    // of any queued entries to this point.
    if (!TP.boot.$consoleConfigured) {

        elem = TP.boot.$getBootLogElement();
        if (!TP.boot.$isElement(elem)) {
            return;
        }

        //  clear existing content
        elem.innerHTML = '';
        TP.boot.$consoleConfigured = true;
    }

    TP.sys.setcfg('log.color.mode', 'browser');
    msg = TP.boot.$$logReporter(entry,
        {separator: '<br/>', escape: true, console: false});
    if (TP.boot.$notValid(msg)) {
        return;
    }

    css = 'log-' +
        TP.boot.Log.getStringForLevel(TP.boot.$$logpeak).toLowerCase();
    if (TP.boot.$$logcss !== css) {
        TP.boot.$$logcss = css;
        TP.boot.$elementReplaceClass(TP.boot.$getProgressBarElement(),
                                     /log-/, TP.boot.$$logcss);
    }

    level = entry[TP.boot.LOG_ENTRY_LEVEL];

    switch (level) {
    case TP.boot.TRACE:
        TP.boot.$displayMessage(msg);
        break;
    case TP.boot.DEBUG:
        TP.boot.$displayMessage(msg);
        break;
    case TP.boot.INFO:
        TP.boot.$displayMessage(msg);
        break;
    case TP.boot.WARN:
        TP.boot.$displayMessage(msg);
        break;
    case TP.boot.ERROR:
        TP.boot.$displayMessage(msg, true);
        break;
    case TP.boot.SEVERE:
        TP.boot.$displayMessage(msg, true);
        break;
    case TP.boot.FATAL:
        TP.boot.$displayMessage(msg, true);
        break;
    case TP.boot.SYSTEM:
        TP.boot.$displayMessage(msg, true);
        break;
    default:
        TP.boot.$displayMessage(msg);
        break;
    }

    // Logging is usually the last step in a boot stoppage. If that's happening
    // we want to ensure we set any UI to 'done' which should help ensure that
    // it has scrollbars etc.
    try {
        if (TP.boot.shouldStop()) {
            elem = TP.boot.$getBootLogElement();
            if (TP.boot.$isElement(elem)) {
                TP.boot.$elementAddClass(elem.parentElement, 'done');
            }
        }
    } catch (e) {
        // this one we'll ignore.
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$phantomReporter = function(entry, options) {

    var msg,
        level;

    // Ignore attempts to log the entry to the console more than once.
    if (entry && entry.usedConsole) {
        // TODO: this may not be needed. Found a "flush" issue in the code
        // specific to the TP.shell() command's failure hook that may fix it
        // in which case we can remove this line.
        console.log('');    // force a flush of the console.
        return;
    }

    TP.sys.setcfg('log.color.mode', 'terminal');
    msg = TP.boot.$$logReporter(entry,
        {separator: '\n', escape: false, console: true});
    if (TP.boot.$notValid(msg)) {
        return;
    }

    level = entry[TP.boot.LOG_ENTRY_LEVEL];

    switch (level) {
    case TP.boot.TRACE:
        top.console.log('trace ' + msg);
        break;
    case TP.boot.DEBUG:
        top.console.log('debug ' + msg);
        break;
    case TP.boot.INFO:
        top.console.log('info ' + msg);
        break;
    case TP.boot.WARN:
        top.console.warn('warn ' + msg);
        break;
    case TP.boot.ERROR:
        top.console.error('error ' + msg);
        break;
    case TP.boot.SEVERE:
        top.console.error('severe ' + msg);
        break;
    case TP.boot.FATAL:
        top.console.error('fatal ' + msg);
        break;
    case TP.boot.SYSTEM:
        top.console.log('system ' + msg);
        break;
    default:
        top.console.log(msg);
        break;
    }

    entry.usedConsole = true;
};

//  ----------------------------------------------------------------------------

TP.boot.$silentReporter = function() {
    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$style = function(aString, aStyle) {

    var mode,
        styles,
        parts,
        color,
        codes,
        result;

    mode = TP.sys.cfg('log.color.mode');
    styles = TP.boot.$$styles[mode];

    try {
        if (TP.boot.$$PROP_KEY_REGEX.test(aStyle)) {
            result = '';

            parts = aStyle.split('.');
            parts.forEach(function(style) {
                color = TP.boot.$$theme[style];

                // Do we have a mapping for this color in our theme?
                if (TP.boot.$notValid(color)) {
                    return;
                }

                // If we had a color mapping in the theme, find the codes.
                codes = styles[color];
                if (TP.boot.$notValid(codes)) {
                    return;
                }

                result = codes[0] + (result || aString) + codes[1];
            });
        } else {

            // Do we have a mapping for this color in our theme?
            color = TP.boot.$$theme[aStyle];
            if (TP.boot.$notValid(color)) {
                return aString;
            }

            // If we had a color mapping in the theme, find the codes.
            codes = styles[color];
            if (TP.boot.$notValid(codes)) {
                return aString;
            }

            result = codes[0] + aString + codes[1];
        }
    } catch (e) {
        return aString;
    }

    return result;
};

//  ============================================================================
//  PRIMITIVE LOG DATA STRUCTURE
//  ============================================================================

/*
The various logging operations in TIBET make use of a common low-level type
that handles log entry management. We build that primitive type here so it
can be used to manage the boot log along with the rest of TIBET's logs.
*/

//  ----------------------------------------------------------------------------
//  Constructor
//  ----------------------------------------------------------------------------

TP.boot.Log = function() {

    /**
     * @name TP.boot.Log
     * @summary Contructor for a primitive log data structure. This construct
     *     is used by all TIBET logs although it is wrapped by higher-level
     *     objects once the kernel has loaded.
     * @return {Log} A new instance.
     */

    //  the array of all messages sent to the log
    this.messages = [];

    //  the current index representing which messages have been reported.
    this.index = 0;

    return this;
};

//  ----------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.boot.Log.canLogLevel = function(aLevel) {

    /**
     * @name canLogLevel
     * @synopsis Returns true if logging is set at or above aLevel.
     * @param {Constant} aLevel A logging level constant such as TP.INFO
     *     or TP.DEBUG. The default is TP.WARN.
     * @returns {Boolean} True if logging is active for the given level.
     */

    var level;

    level = TP.boot.$isValid(aLevel) ? aLevel : TP.WARN;
    level = typeof level === 'string' ? TP.boot[level] : level;

    return TP.boot.$$loglevel <= level;
};

//  ----------------------------------------------------------------------------

TP.boot.Log.getStringForLevel = function(aLogLevel) {

    /**
     * @name getStringForLevel
     * @summary Returns the string value for the logging level provided.
     * @param {Number} aLogLevel The level to check, defaults to the current
     *     level if no level is passed.
     * @return {String} The String representation of the boot log level.
     * @todo
     */

    // If inbound data is TP.INFO etc it's already a string...
    if (typeof aLogLevel === 'string') {
        return aLogLevel.toUpperCase();
    }

    switch (aLogLevel) {
        case TP.boot.TRACE:
            return 'TRACE';
        case TP.boot.DEBUG:
            return 'DEBUG';
        case TP.boot.INFO:
            return 'INFO';
        case TP.boot.WARN:
            return 'WARN';
        case TP.boot.ERROR:
            return 'ERROR';
        case TP.boot.SEVERE:
            return 'SEVERE';
        case TP.boot.FATAL:
            return 'FATAL';
        case TP.boot.SYSTEM:
            return 'SYSTEM';
        default:
            // Cap others at SYSTEM
            return 'SYSTEM';
    }
};

//  ------------------------------------------------------------------------

TP.boot.Log.isErrorLevel = function(aLevel) {

    /**
     * @name isErrorLevel
     * @synopsis Returns true if the level provided represents a form of error.
     * @param {Constant} aLevel A TP error level such as TP.SEVERE.
     * @returns {Boolean} True if the given level is considered an error.
     */

    var level;

    if (TP.boot.$notValid(aLevel)) {
        return false;
    }

    level = typeof aLevel === 'string' ? TP.boot[aLevel] : aLevel;

    return level >= TP.boot.ERROR && level < TP.boot.SYSTEM;
};

//  ------------------------------------------------------------------------

TP.boot.Log.isFatalCondition = function(aLevel, aStage) {

    /**
     * @name isFatalCondition
     * @synopsis Returns true if the level and stage combine to make the
     *     combination represent a fatal boot error.
     * @param {Constant} aLevel A TP error level such as TP.SEVERE.
     * @param {Constant} aStage A TP boot stage such as 'rendering'. Defaults to
     *     the current stage.
     * @returns {Boolean} True if the given pairing is considered fatal.
     */

    var info,
        level;

    // Non-errors are never fatal.
    if (!TP.boot.Log.isErrorLevel(aLevel)) {
        return false;
    }

    if (TP.boot.$notValid(aLevel)) {
        return false;
    }

    level = typeof aLevel === 'string' ? TP.boot[aLevel] : aLevel;

    if (level === TP.boot.FATAL) {
        TP.boot.$$stop = 'fatal error detected.';
        return true;
    }

    // Too many small things can add up to be fatal.
    if (TP.boot.$$errors > TP.sys.cfg('boot.error_max')) {
        TP.boot.$$stop = 'boot.error_max exceeded.';
        return true;
    }

    // Some stages mark any error as being fatal (rendering for example).
    info = TP.boot.$getStageInfo(aStage);
    if (TP.boot.$isValid(info) && info.fatal) {
        if (TP.sys.cfg('boot.fatalistic')) {
            TP.boot.$$stop = 'error in fatalistic stage.';
            return true;
        }
    }

    return false;
};

//  ----------------------------------------------------------------------------
//  Instance Methods
//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.asDumpString = function() {

    /**
     * @name asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @return {String} A new String containing the dump string of the receiver.
     */

    return TP.boot.$join('TP.boot.Log :: ', this.asString());
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.asHTMLString = function() {

    /**
     * @name asHTMLString
     * @summary Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     */

    return TP.boot.$join(
        '<span class="TP_boot_Log">',
            '<span data-name="messages">', TP.htmlstr(this.messages),
            '<\/span>',
        '<\/span>');
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.asJSONSource = function() {

    /**
     * @name asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    return '{"type":"TP.boot.Log",' +
            '"data":{"messages":' +
                TP.boot.$str(this.messages).quoted('"') +
            '}}';
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.asPrettyString = function() {

    /**
     * @name asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty TP_boot_Log">' +
                '<dt>Type name<\/dt>' +
                '<dd class="pretty typename">' +
                    'TP.boot.Log' +
                '<\/dd>' +
                '<dt class="pretty key">messages<\/dt>' +
                '<dd class="pretty value">' +
                    TP.boot.$str(this.messages) +
                '<\/dd>' +
                '<\/dl>';
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.asXMLString = function() {

    /**
     * @name asXMLString
     * @summary Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     */

    return TP.boot.$join(
                '<instance type="TP.boot.Log">',
                '<messages>', TP.xmlstr(this.messages), '<\/messages>',
                '<\/instance>');
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.flush = function() {

    while (this.index < this.messages.length) {
        this.report(this.messages[this.index]);
    }
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.getEntries = function() {

    /**
     * @name getEntries
     * @summary Returns an array containing individual log entries. The array
     *     should be considered read-only.
     * @return {Array}
     * @todo
     */

    return this.messages;
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.getSize = function() {

    /**
     * @name getSize
     * @summary Returns the size (in number of entries) of the log.
     * @return {Number} The number of log entries.
     */

    return this.messages.length;
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.getTypeName = function() {

    /**
     * @name getTypeName
     * @summary
     * @return {String}
     * @todo
     */

    return 'TP.boot.Log';
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.getSupertypes = function() {

    /**
     * @name getSupertypes
     * @summary
     * @return {String}
     * @todo
     */

    return [Object];
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.last = function() {

    /**
     * @name last
     * @summary Returns the last entry made in the log.
     * @return {Array} A log entry.
     * @todo
     */

    return this.messages[this.messages.length - 1];
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.log = function(anObject, aLogName, aLogLevel) {
    /**
     * @name log
     * @summary Creates a new log entry. The entry will include a timestamp as
     *     well as the log name, log level, and object given. The object isn't
     *     processed in any way, it is simply added to the log entry. It's up to
     *     consumers of the log to format the data in a log entry to meet their
     *     requirements.
     * @description The object being logged isn't required to meet any
     *     particular format requirements, however there are a couple of
     *     convenience functions in TIBET which make it easy to deal with common
     *     cases. For example, the TP.boot.$ec() function
     *     (TP.core.Exception.create() shortcut) is a useful way to combine an
     *     error message with an error object for later logging. A simpler
     *     TP.boot.$ec() which produces an ordered pair is used prior to the
     *     loading of TP.core.Exception to avoid bootstrapping problems.
     * @param {Object} anObject The object to log. Typically a string provided
     *     by the caller. NOTE that the object is _not_ processed by the log
     *     capturing calls, how it is displayed is a function of the logic you
     *     use to display the log.
     * @param {String} aLogName The log name (TP.IO_LOG, etc.) which qualifies
     *     the entry within the overall log. Default value is TP.ACTIVITY_LOG.
     * @param {Number} aLogLevel A TIBET log level, such as TP.INFO.
     * @return {Log} The receiver.
     * @todo
     */

    var entry,
        date,
        level,
        delta,
        msg;

    date = new Date();
    delta = 0;

    level = (typeof aLogLevel === 'string') ? TP.boot[aLogLevel] : aLogLevel;

    if (TP.boot.$$loglevel === TP.boot.TRACE) {
        if (this.messages.length > 1) {
            delta = date.getTime() -
                this.messages[this.messages.length - 1][0].getTime();
        }
    }

    //  NOTE order here should match TP.boot.LOG_ENTRY_* constants
    entry = [date, aLogName, level, anObject, delta];

    this.messages.push(entry);

    if (TP.boot.Log.isErrorLevel(level)) {
        TP.boot.$$errors += 1;
    }

    if (level === TP.boot.WARN) {
        TP.boot.$$warnings += 1;
    }

    // Call this first, so any reporter will be aware that the boot is about to
    // terminate.
    if (TP.boot.Log.isFatalCondition(level)) {

        // Flush anything queued during pre-config completion.
        this.flush();

        TP.boot.$flushLog(true);

        // Default to $$stop reason, otherwise output a generic message.
        if (TP.boot.$isEmpty(TP.boot.$$stop)) {
            TP.boot.$$stop = 'unspecified fatal condition';
        }
        msg = TP.boot.$$stop;

        // Queue to allow any other pending messages to clear.
        setTimeout(function() {
            try {
            TP.boot.$setStage('stopped',
                'Boot terminated: ' + msg);
            } catch (e) {
                // Ignore if we broke that, we're stopping.
            }
        }, 0);
    }

    // Until we've fully configured we don't output (unless we hit a fatal
    // warning above. That way we know the full boot log is going to the same
    // reporter, not a header to one and the rest to another if the user has
    // overridden the default setting.

    if (TP.boot.$hasReachedStage('expanding')) {
        this.flush();
    }

    return this;
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.report = function(entry) {

    /**
     * Writes a log entry using the currently configured reporter.
     * @param {Object} entry A boot log entry object.
     */

    var limit,
        level,
        reporterName,
        reporter;

    // incrementing our index ensures we don't try to report this entry again
    // during a flush() call.
    this.index = this.index + 1;

    // Always log errors entering the boot log to the console, while respecting
    // any limit set. The default limit is TP.boot.ERROR.
    limit = TP.boot[TP.sys.cfg('log.console_threshold')];
    level = entry[TP.boot.LOG_ENTRY_LEVEL];

    if (TP.boot.Log.isErrorLevel(level) && level >= limit) {
        TP.boot.$consoleReporter(entry, {console: true});
    }

    if (TP.sys.cfg('boot.context') === 'phantomjs') {
        reporterName = 'phantom';
    } else {
        reporterName = TP.sys.cfg('boot.reporter');
    }

    reporterName = '$' + reporterName + 'Reporter';
    reporter = TP.boot[reporterName];

    // If the reporter provided isn't real we'll again default to the console.
    if (TP.boot.$notValid(reporter)) {
        // Fake a warning and log to the native console, then output the
        // original if we haven't already.
        TP.boot.$consoleReporter(
            [new Date(), TP.BOOT_LOG, TP.boot.WARN,
                'Logging reporter \'' + reporter + '\' not found.']);
        TP.boot.$consoleReporter(entry);
    }

    try {
        TP.boot[reporterName](entry);
    } catch (e) {

        // One special case here is failed file launches due to security issues.
        // The goal in that case is to let the rest of the system do this
        // without spamming the error log with all the security warnings.
        if (window.location.protocol.indexOf('file') === 0) {
            if (/[sS]ecurity|[bB]locked/.test(e.message)) {
                TP.boot.$consoleReporter(entry);
                return;
            }
        }

        // If we don't count these the cycle can continue without respecting
        // boot.error_max.
        TP.boot.$$errors += 1;

        // Can you tell we really want you to see these messages yet? ;)
        TP.boot.$consoleReporter(
            [new Date(), TP.BOOT_LOG, TP.boot.ERROR,
                'Error in reporter \'' + reporterName + '\': ' + e.message]);
        TP.boot.$consoleReporter(entry);
    }
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.shift = function() {

    /**
     * @name shift
     * @summary Shifts the first message off the log, allowing the log to
     *     shrink in size by one entry. This method is often called to keep log
     *     sizes from exceeding configured limits.
     * @return {Array} A log entry.
     * @todo
     */

    return this.messages.shift();
};

//  ============================================================================
//  TIBET BOOT LOG
//  ============================================================================

/*
When this system is used to boot TIBET the bootlog can be acquired from
the TIBET environment in a fashion consistent with all other TIBET logs.
*/

//  ----------------------------------------------------------------------------

if (TP.sys.$bootlog == null) {
    TP.sys.$bootlog = new TP.boot.Log();
}

//  ----------------------------------------------------------------------------

TP.sys.getBootLog = function() {

    /**
     * @name getBootLog
     * @summary Returns the system boot log. This will contain any messages
     *     generated during boot processing, assuming the application was booted
     *     using the TIBET boot system.
     * @return {TP.boot.Log} The boot log object, a primitive instance
     *     supporting limited string output routines.
     */

    return TP.sys.$bootlog;
};

//  ----------------------------------------------------------------------------

TP.boot.log = function(anObject, aLogLevel) {

    /**
     * @name log
     * @summary Adds an entry in the boot log for anObject, associating it with
     *     the style provided. Note that the object logged in this fashion is
     *     just captured, not formatted. How an object appears is a function of
     *     the particular log viewing logic used to display the log.
     * @param {Object} anObject The object to log.
     * @param {Number} aLogLevel The logging level to use.
     * @return {null}
     * @todo
     */

    var level;

    level = (aLogLevel == null) ? TP.INFO : aLogLevel;

    TP.sys.$bootlog.log(anObject,
                            TP.BOOT_LOG,
                            level);
    return;
};

//  ----------------------------------------------------------------------------
//  UI ELEMENT ACQUISITION
//  ----------------------------------------------------------------------------

TP.boot.$consoleConfigured = false;

//  ----------------------------------------------------------------------------

TP.boot.$getBootElement = function(id, name) {

    /**
     * @name $getBootElement
     * @summary Returns the boot element referenced by the configuration
     *     parameter 'boot.{{id}}' which should be cached in TP.boot[name].
     * @return {HTMLElement} The HTML element specified.
     */

    var uiboot,
        elemId,
        elem;

    elem = TP.boot[name];
    if (TP.boot.$isValid(elem)) {
        return TP.boot[name];
    }

    uiboot = TP.sys.cfg('boot.uiboot');
    elemId = TP.sys.cfg('boot.' + id);
    elem = TP.boot.$getUIElement(uiboot, elemId);

    if (TP.boot.$notValid(elem)) {
        TP.boot[name] = TP.NOT_FOUND;
        return;
    }

    TP.boot[name] = elem;
    return TP.boot[name];
};

//  ----------------------------------------------------------------------------

TP.boot.$getBootHeadElement = function() {

    /**
     * @name $getBootHeadElement
     * @summary Returns the boot heading display element used for showing the
     *     current top-level boot message.
     * @return {HTMLElement} The HTML element specified.
     */

    return TP.boot.$getBootElement('uihead', '$$uiHead');
};

//  ----------------------------------------------------------------------------

TP.boot.$getBootImageElement = function() {

    /**
     * @name $getBootImageElement
     * @summary Returns the boot image element used to highlight current status.
     * @return {HTMLElement} The HTML element specified.
     */

    return TP.boot.$getBootElement('uiimage', '$$uiImage');
};

//  ----------------------------------------------------------------------------

TP.boot.$getBootInputElement = function() {

    /**
     * @name $getBootInputElement
     * @summary Returns the boot log element used as a display console.
     * @return {HTMLElement} The HTML element displaying boot console output.
     */

    return TP.boot.$getBootElement('uiinput', '$$uiInput');
};

//  ----------------------------------------------------------------------------

TP.boot.$getBootLogElement = function() {

    /**
     * @name $getBootLogElement
     * @summary Returns the boot log element used as a display console.
     * @return {HTMLElement} The HTML element displaying boot console output.
     */

    return TP.boot.$getBootElement('uilog', '$$uiLog');
};

//  ----------------------------------------------------------------------------

TP.boot.$getProgressBarElement = function() {

    /**
     * @name $getProgressBarElement
     * @summary Returns the progress bar element, which contains the overall
     *     prgress bar content element.
     * @return {HTMLElement} The HTML element displaying the 'progress bar'.
     */

    return TP.boot.$getBootElement('uipercent', '$$uiProgress');
};

//  ----------------------------------------------------------------------------

TP.boot.$getBootSubheadElement = function() {

    /**
     * @name $getBootSubheadElement
     * @summary Returns the boot log element used to display subheading data.
     * @return {HTMLElement} The HTML element displaying boot console output.
     */

    return TP.boot.$getBootElement('uisubhead', '$$uiSubhead');
};

//  ----------------------------------------------------------------------------

TP.boot.$getUIElement = function(varargs) {

    /**
     * Locates and returns an element based on the ID or IDs provided as
     * arguments.
     * @param {String} varargs One or more arguments containing string IDs.
     */

    // TODO: work with access paths as well.

    var ids,
        i,
        len,
        id,
        root,
        elem;

    root = document;

    // Don't assume we don't have access path components in the list of
    // arguments. Split them so we build a full-descent path.
    ids = [];
    len = arguments.length;
    for (i = 0; i < len; i++) {
        ids = ids.concat(arguments[i].split('.'));
    }

    len = ids.length;
    for (i = 0; i < len; i++) {
        id = ids[i];
        elem = root.getElementById(id);
        if (!elem) {
            return;
        }

        // If we're out of ids we're at the end, even if that's an IFRAME.
        if (i === len - 1) {
            return elem;
        }

        if (elem.contentWindow) {
            // If we're holding an IFRAME we need to drill down into that via
            // its content document.
            root = elem.contentWindow.document;
        } else {
            // Standard element. That's a problem since they don't have a
            // getElementById call...
            return;
        }
    }
};

//  ----------------------------------------------------------------------------

TP.boot.getUIBoot = function() {
    var id;

    id = TP.sys.cfg('boot.uiboot');
    return TP.boot.$getUIElement(id);
};

//  ----------------------------------------------------------------------------

TP.boot.getUIRoot = function() {
    var id;

    id = TP.sys.cfg('tibet.uiroot');
    return TP.boot.$getUIElement(id);
};

//  ----------------------------------------------------------------------------

TP.boot.$releaseUIElements = function() {

    /**
     * @name $releaseUIElements
     * @summary Releases any cached UI references created during startup.
     * @return {null}
     */

    TP.boot.$$uiHead = null;
    TP.boot.$$uiImage = null;
    TP.boot.$$uiInput = null;
    TP.boot.$$uiLog = null;
    TP.boot.$$uiPath = null;
    TP.boot.$$uiProgress = null;

    return;
};

//  ----------------------------------------------------------------------------
//  BOOT UI DISPLAY
//  ----------------------------------------------------------------------------

TP.boot.$computeLogBufferSize = function(force) {
    var level,
        size;

        size = TP.boot.$$logbufsize;
        if (force !== true && TP.boot.$isValid(size)) {
            return size;
        }

        size = parseInt(TP.sys.cfg('log.buffersize'), 10);
        size = isNaN(size) ? 1 : size;

        level = TP.boot.$$loglevel;

        switch (level) {
            case 0:         // trace
                size = size * 2;
                break;
            case 1:         //  info
            case 2:         //  warn
            case 3:         //  error
            case 4:         //  severe
                size = Math.max(Math.floor(size / 2), size);
                break;
            case 5:         //  fatal
            case 6:         //  system
                size = 1;
                break;
            default:
                size = 1;
                break;
        }

        TP.boot.$$logbufsize = size;

        return size;
};

//  ----------------------------------------------------------------------------

TP.boot.$flushUIBuffer = function(force) {
    var elem,
        buffer,
        bufSize;

    elem = TP.boot.$getBootLogElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    buffer = TP.boot.$$msgBuffer;
    if (TP.boot.$notValid(buffer)) {
        TP.boot.$$msgBuffer = buffer =
            elem.ownerDocument.createDocumentFragment();
    }

    bufSize = TP.boot.$$logbufsize || TP.boot.$computeLogBufferSize();

    if (buffer.childNodes.length > 0 &&
        (force === true || buffer.childNodes.length === bufSize)) {
        TP.boot.$nodeAppendChild(elem, buffer);
        TP.boot.$$msgBuffer = buffer =
            elem.ownerDocument.createDocumentFragment();
    }

    return buffer;
};

//  ----------------------------------------------------------------------------

TP.boot.$clearUIBuffer = function() {
    var elem;

    elem = TP.boot.$getBootLogElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    elem.innerHTML = '';

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$scrollUIBuffer = function() {
    var elem;

    elem = TP.boot.$getBootLogElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    elem.parentElement.scrollTop = elem.parentElement.scrollHeight;

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$displayImage = function(aUrl) {
    var elem;

    elem = TP.boot.$getBootImageElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    elem.src = aUrl;
};

//  ----------------------------------------------------------------------------

TP.boot.$displayMessage = function(aString, flush) {

    var elem,
        buffer,
        message,
        msgNode;

    elem = TP.boot.$getBootLogElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    if (!TP.boot.$isElement(TP.boot.$$msgTemplate)) {
        msgNode = TP.boot.$documentFromString(
            '<div xmlns="http://www.w3.org/1999/xhtml"><div></div></div>');
        if (!msgNode) {
            top.console.log('Unable to create log message template.');
        }
        TP.boot.$$msgTemplate = msgNode.firstChild.firstChild;
    }

    message = aString || '';

    msgNode = TP.boot.$$msgTemplate.cloneNode(true);
    try {
        msgNode.insertAdjacentHTML('beforeEnd', message);
    } catch (e) {
        msgNode = TP.boot.$documentFromString(
            '<div xmlns="http://www.w3.org/1999/xhtml"><div><pre>' +
            message + '</pre></div></div>');
        if (!msgNode) {
            msgNode = TP.boot.$documentFromString(
                '<div xmlns="http://www.w3.org/1999/xhtml"><div><pre>' +
                TP.boot.$htmlEscape(message) + '</pre></div></div>');
            if (!msgNode) {
                top.console.error('Unable to create log message element for...');
                top.console.log(message);
            } else {
                msgNode = msgNode.firstChild.firstChild;
            }
        } else {
            msgNode = msgNode.firstChild.firstChild;
        }
    }

    if (msgNode) {
        buffer = TP.boot.$flushUIBuffer(TP.boot.shouldStop());
        TP.boot.$nodeAppendChild(buffer, msgNode);
    }

    // If asked, flush the brand new message, even if it's now the only one in
    // the buffer. (This is true for errors/system output by default).
    if (flush) {
        TP.boot.$flushUIBuffer(true);
        TP.boot.$scrollUIBuffer();
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$displayProgress = function() {

    var elem,
        workload,
        percent,
        stage,
        index;

    elem = TP.boot.$getProgressBarElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    if (TP.sys.cfg('boot.reporter') !== 'bootui') {
        return;
    }

    stage = TP.boot.$getStage();

    if (!TP.boot.$$bootnodes) {
        return;
    } else {
        workload = TP.boot.$$workload;
        index = TP.boot.$$bootindex;
        percent = Math.round(index / workload * 100);
    }

    // Don't go further if we'd be setting same value.
    if (percent === TP.boot.$$percent) {
        return;
    }

    TP.boot.$$percent = percent;

    TP.boot.$elementReplaceClass(elem, /log-/, TP.boot.$$logcss);

    if (percent === 100) {
        // Avoid issues with margin etc, rely on right: 0;
        elem.style.width = 'auto';
        elem.style.right = 0;
    } else {
        elem.style.width = percent.toFixed() + '%';
    }

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$displayStage = function(aString) {
    var elem;

    elem = TP.boot.$getBootHeadElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    elem.innerHTML = aString;
};

//  ----------------------------------------------------------------------------

TP.boot.$displayStatus = function(aString) {
    var elem;

    elem = TP.boot.$getBootSubheadElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    elem.innerHTML = aString;
};

//  ----------------------------------------------------------------------------
//  SHOW/HIDE UI
//  ----------------------------------------------------------------------------

TP.boot.hideUIBoot = function() {
    var elem,
        id;

    id = TP.sys.cfg('boot.uiboot');

    // If the boot and root ui are the same ignore this request. It has to be
    // done by manipulating the uiroot instead.
    if (id === TP.sys.cfg('tibet.uiroot')) {
        return;
    }

    elem = TP.boot.$getUIElement(id);
    if (TP.boot.$isValid(elem)) {
        if (TP.boot.$isValid(elem.frameElement)) {
            elem = elem.frameElement;
        }
        // NOTE we use display: none here so that devtools etc. will properly
        // find elements when using inspect element.
        elem.style.display = 'none';
    }

    TP.byId('UIROOT', top).focus();
};

//  ----------------------------------------------------------------------------

TP.boot.hideUIRoot = function() {
    var elem,
        id;

    id = TP.sys.cfg('tibet.uiroot');
    elem = TP.boot.$getUIElement(id);

    if (TP.boot.$isValid(elem)) {
        if (TP.boot.$isValid(elem.frameElement)) {
            elem = elem.frameElement;
        }
        elem.style.visibility = 'hidden';
    }
};

//  ----------------------------------------------------------------------------

TP.sys.showBootLog = function(reporter, level) {

    /**
     * @name showBootLog
     * @summary Dump the bootlog to the current target location. By default this
     *     is routed to the consoleReporter.
     * @return {null}
     */

    var lvl,
        rep,
        name,
        entries;

    name = '$' + (reporter || 'console') + 'Reporter';
    rep = TP.boot[name];

    if (TP.boot.$notValid(rep)) {
        TP.boot.$consoleReporter(
            [new Date(), TP.BOOT_LOG, TP.boot.WARN,
                'Boot reporter \'' + reporter + '\' not found.']);
        return;
    }

    // By default dump the entire log.
    lvl = TP.boot.$isValid(level) ? level : TP.DEBUG;
    lvl = typeof lvl === 'string' ? TP.boot[lvl] : lvl;

    entries = TP.sys.getBootLog().getEntries();
    entries.forEach(function(entry) {

        if (entry[TP.boot.LOG_ENTRY_LEVEL] < lvl) {
            return;
        }

        TP.boot[name](entry);
    });

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.showUIBoot = function() {
    var elem,
        id;

    id = TP.sys.cfg('boot.uiboot');
    elem = TP.boot.$getUIElement(id);

    if (TP.boot.$isValid(elem)) {
        if (TP.boot.$isValid(elem.frameElement)) {
            elem = elem.frameElement;
        }
        elem.style.display = 'block';
    }

    elem.focus();
};

//  ------------------------------------------------------------------------

TP.boot.showUIRoot = function() {

    /**
     * @name showUIRoot
     * @synopsis Displays the current tibet.uiroot element in the
     *     application's main window.
     * @return {null}
     */

    var elem,
        id;

    id = TP.sys.cfg('tibet.uiroot');
    elem = TP.boot.$getUIElement(id);

    if (TP.boot.$isValid(elem)) {
        if (TP.boot.$isValid(elem.frameElement)) {
            elem = elem.frameElement;
        }
        elem.style.visibility = 'visible';
    }

    TP.boot.hideUIBoot();

    elem.focus();

    return;
};

//  ------------------------------------------------------------------------

TP.boot.toggleUI = function() {

    /**
     * @name toggleUI
     * @synopsis Toggles the UI between UIRoot and UIBoot.
     * @return {null}
     */

    var elem,
        id;

    id = TP.sys.cfg('tibet.uiroot');
    elem = TP.boot.$getUIElement(id);

    if (TP.boot.$isValid(elem)) {
        if (TP.boot.$isValid(elem.frameElement)) {
            elem = elem.frameElement;
        }

        if (elem.style.visibility === 'visible') {
            TP.boot.showUIBoot();
            TP.boot.hideUIRoot();
        } else {
            TP.boot.showUIRoot();
            TP.boot.hideUIBoot();
        }
    }

    return;
};

//  ============================================================================
//  LOG LEVEL TESTING
//  ============================================================================

/*
 *  Utility functions to help limit message construction overhead when needed.
 *
 *  You don't have to use these if message-building for a particular log call
 *  isn't high (just a string) since the level-specific methods such as TP.trace
 *  etc. must limit based on level as well. They are useful when the message to
 *  build would require a lot more overhead, or if you'd like to be able to
 *  eventually strip the message from production code (since the pattern of
 *  usage for these is idiomatic in TIBET and can be scanned/removed via tools).
 *
 *  TP.ifTrace() ? TP.trace(...) : 0;
 *  TP.ifDebug() ? TP.debug(...) : 0;
 *  TP.ifInfo() ? TP.info(...) : 0;
 *  TP.ifWarn() ? TP.warn(...) : 0;
 *  TP.ifError() ? TP.error(...) : 0;
 *  TP.ifSevere() ? TP.severe(...) : 0;
 *  TP.ifFatal() ? TP.fatal(...) : 0;
 *  TP.ifSystem() ? TP.system(...) : 0;
*/

//  ------------------------------------------------------------------------

TP.ifTrace = function(aLogName) {

    /**
     * @name ifTrace
     * @synopsis Returns true if logging is enabled for TP.TRACE level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>TP.ifTrace() ? TP.trace(...) : 0;code> This idiom can help
     *     performance in cases where message construction overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if trace-level logging is active.
     * @todo
     */

    return TP.boot.$$loglevel <= TP.boot.TRACE;
};

//  ------------------------------------------------------------------------

TP.ifDebug = function(aLogName) {

    /**
     * @name ifDebug
     * @synopsis Returns true if logging is enabled for TP.DEBUG level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>TP.ifDebug() ? TP.debug(...) : 0;code> This idiom can help
     *     performance in cases where message construction overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if debug-level logging is active.
     * @todo
     */

    return TP.boot.$$loglevel <= TP.boot.DEBUG;
};

//  ------------------------------------------------------------------------

TP.ifInfo = function(aLogName) {

    /**
     * @name ifInfo
     * @synopsis Returns true if logging is enabled for TP.INFO level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>TP.ifInfo() ? TP.info(...) : 0;code> This idiom can help
     *     performance in cases where message construction overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if info-level logging is active.
     * @todo
     */

    return TP.boot.$$loglevel <= TP.boot.INFO;
};

//  ------------------------------------------------------------------------

TP.ifWarn = function(aLogName) {

    /**
     * @name ifWarn
     * @synopsis Returns true if logging is enabled for TP.WARN level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>TP.ifWarn() ? TP.warn(...) : 0;code> This idiom can help
     *     performance in cases where message construction overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if warn-level logging is active.
     * @todo
     */

    return TP.boot.$$loglevel <= TP.boot.WARN;
};

//  ------------------------------------------------------------------------

TP.ifError = function(aLogName) {

    /**
     * @name ifError
     * @synopsis Returns true if logging is enabled for TP.boot.ERROR level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>TP.ifError() ? TP.error(...) : 0;code> This idiom can help
     *     performance in cases where message construction overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if error-level logging is active.
     * @todo
     */

    return TP.boot.$$loglevel <= TP.boot.ERROR;
};

//  ------------------------------------------------------------------------

TP.ifSevere = function(aLogName) {

    /**
     * @name ifSevere
     * @synopsis Returns true if logging is enabled for TP.SEVERE level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>TP.ifSevere() ? TP.severe(...) : 0;code> This idiom can help
     *     performance in cases where message construction overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if severe-level logging is active.
     * @todo
     */

    return TP.boot.$$loglevel <= TP.boot.SEVERE;
};

//  ------------------------------------------------------------------------

TP.ifFatal = function(aLogName) {

    /**
     * @name ifFatal
     * @synopsis Returns true if logging is enabled for TP.FATAL level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>TP.ifFatal() ? TP.fatal(...) : 0;code> This idiom can help
     *     performance in cases where message construction overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if fatal-level logging is active.
     * @todo
     */

    return TP.boot.$$loglevel <= TP.boot.FATAL;
};

//  ------------------------------------------------------------------------

TP.ifSystem = function(aLogName) {

    /**
     * @name ifSystem
     * @synopsis Returns true if logging is enabled for TP.SYSTEM level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>TP.ifSystem() ? TP.system(...) : 0;code> This idiom can help
     *     performance in cases where message construction overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if system-level logging is active.
     * @todo
     */

    return TP.boot.$$loglevel <= TP.boot.SYSTEM;
};

//  ============================================================================
//  LOG PRIMITIVES
//  ============================================================================

TP.$$log = function(argList, aLogLevel) {

    /**
     * @name $$log
     * @summary Shared routine for routing a logging call such as TP.trace to
     *     either a boot-level routing or a post-startup routine. The final
     *     logging is ultimately handled by TP.boot.$std[out|err] or by the
     *     TP.log infrastructure if the kernel has loaded and started.
     * @param {Arguments} argList A list of arguments from a logging call.
     * @param {Number} aLogLevel TP.INFO or a similar level name.
     * @todo
     */

    if (TP.sys.hasStarted()) {
        return TP.sys.$$log(argList, aLogLevel);
    } else {
        return TP.boot.$$log(argList, aLogLevel);
    }
};

//  ------------------------------------------------------------------------

TP.trace = function(varargs) {

    /**
     * @name trace
     * @synopsis Logs anObject at TP.TRACE level, if active.
     * @param {Object} varargs One or more arguments. The last argument is
     *     checked as a possible log name, all other values are considered parts
     *     of the final message to be logged.
     */


    return TP.$$log(arguments, TP.TRACE);
};

//  ------------------------------------------------------------------------

TP.debug = function(varargs) {

    /**
     * @name debug
     * @synopsis Logs anObject at TP.DEBUG level, if active.
     * @param {Object} varargs One or more arguments. The last argument is
     *     checked as a possible log name, all other values are considered parts
     *     of the final message to be logged.
     */


    return TP.$$log(arguments, TP.DEBUG);
};

//  ------------------------------------------------------------------------

TP.info = function(varargs) {

    /**
     * @name info
     * @synopsis Logs anObject at TP.INFO level, if active.
     * @param {Object} varargs One or more arguments. The last argument is
     *     checked as a possible log name, all other values are considered parts
     *     of the final message to be logged.
     */


    return TP.$$log(arguments, TP.INFO);
};

//  ------------------------------------------------------------------------

TP.warn = function(varargs) {

    /**
     * @name warn
     * @synopsis Logs anObject at TP.WARN level, if active.
     * @param {Object} varargs One or more arguments. The last argument is
     *     checked as a possible log name, all other values are considered parts
     *     of the final message to be logged.
     */


    return TP.$$log(arguments, TP.WARN);
};

//  ------------------------------------------------------------------------

TP.error = function(varargs) {

    /**
     * @name error
     * @synopsis Logs anObject at TP.ERROR level, if active.
     * @param {Object} varargs One or more arguments. The last argument is
     *     checked as a possible log name, all other values are considered parts
     *     of the final message to be logged.
     */


    return TP.$$log(arguments, TP.ERROR);
};

//  ------------------------------------------------------------------------

TP.severe = function(varargs) {

    /**
     * @name severe
     * @synopsis Logs anObject at TP.SEVERE level, if active.
     * @param {Object} varargs One or more arguments. The last argument is
     *     checked as a possible log name, all other values are considered parts
     *     of the final message to be logged.
     */


    return TP.$$log(arguments, TP.SEVERE);
};

//  ------------------------------------------------------------------------

TP.fatal = function(varargs) {

    /**
     * @name fatal
     * @synopsis Logs anObject at TP.FATAL level, if active.
     * @param {Object} varargs One or more arguments. The last argument is
     *     checked as a possible log name, all other values are considered parts
     *     of the final message to be logged.
     */


    return TP.$$log(arguments, TP.FATAL);
};

//  ------------------------------------------------------------------------

TP.system = function(varargs) {

    /**
     * @name system
     * @synopsis Logs anObject at TP.SYSTEM level, if active.
     * @param {Object} varargs One or more arguments. The last argument is
     *     checked as a possible log name, all other values are considered parts
     *     of the final message to be logged.
     */


    return TP.$$log(arguments, TP.SYSTEM);
};

//  ============================================================================
//  BOOT STAGES
//  ============================================================================

TP.boot.$getBootStats = function() {

    return '' + TP.boot.$$totalwork + ' imports, ' +
        TP.boot.$$errors + ' errors, ' +
        TP.boot.$$warnings + ' warnings, ' +
        TP.boot.$$bottlenecks + ' bottlenecks.';
};

//  ----------------------------------------------------------------------------

TP.boot.$getStage = function() {
    return TP.boot.$$stage;
};

//  ----------------------------------------------------------------------------

TP.boot.$getStageInfo = function(aStage) {

    var stage;

    stage = aStage || TP.boot.$$stage;
    return TP.boot.$$stages[stage];
};

//  ----------------------------------------------------------------------------

TP.boot.$hasReachedStage = function(aStage) {

    var target,
        current;

    target = TP.boot.$$stageorder.indexOf(aStage);
    current = TP.boot.$$stageorder.indexOf(TP.boot.$$stage);

    return target <= current;
};

//  ----------------------------------------------------------------------------

TP.boot.$setStage = function(aStage, aReason) {

    /**
     * @name $setStage
     * @summary Sets the current boot stage and reports it to the log.
     * @param {String} aStage A valid boot stage. This list is somewhat flexible
     *     but common stages include: config, config_*, phase_one, phase_two,
     *     phase_*_complete, activation, starting, and running :).
     * @param {String} aReason Optional text currently used only when stage is
     *     'stopped' to provide the termination reason.
     * @return {String} The current stage after the set completes.
     */

    var info,
        prior,
        prefix,
        stagetime,
        head,
        sub,
        image;

    // Once we're stopped that's it, ignore further updates.
    if (TP.boot.$$stage === 'stopped') {
        return;
    }

    // Verify the stage is one we recognize.
    info = TP.boot.$getStageInfo(aStage);
    if (TP.boot.$notValid(info)) {
        TP.boot.$stderr('Invalid boot stage: ' + aStage);
        return;
    }

    // Ignore requests to 'go backwards' or to set the same stage.
    if (TP.boot.$$stageorder.indexOf(aStage) <
        TP.boot.$$stageorder.indexOf(TP.boot.$$stage)) {
        return;
    }

    // Update the current stage now that we know we're valid. We capture the
    // prior stage so we can output summary data for it below.
    prior = TP.boot.$$stage;
    TP.boot.$$stage = aStage;

    if (aStage !== 'prelaunch') {
        //  output time spent in the stage we're leaving. NOTE NOTE NOTE you
        //  must do this computation after updating the current stage.
        stagetime = TP.boot.$getStageTime(prior);

        if (prior === 'paused') {
            TP.boot.$stdout('', TP.SYSTEM);
            prefix = 'Paused for ';
        } else {
            prefix = 'Completed in ';
        }
        TP.boot.$stdout(prefix + stagetime + 'ms', TP.SYSTEM);
    }

    TP.boot.$stdout('', TP.SYSTEM);
    //TP.boot.$stdout(TP.sys.cfg('boot.uisubsection'), TP.SYSTEM);
    TP.boot.$stdout('--- ' + info.log, TP.SYSTEM);
    //TP.boot.$stdout(TP.sys.cfg('boot.uisubsection'), TP.SYSTEM);
    TP.boot.$stdout('', TP.SYSTEM);

    // Capture the time we reached this stage. this is key for reporting the
    // time spent in the current (now prior) stage below.
    info.entered = new Date();

    head = info.head;
    if (TP.boot.$notEmpty(head)) {
        TP.boot.$displayStage(head);
    }

    sub = info.sub;
    if (TP.boot.$notEmpty(sub)) {
        TP.boot.$displayStatus(sub);
    }

    image = info.image;
    if (TP.boot.$notEmpty(image)) {
        // Image is provided as a TIBET URL, ~lib_img etc. so we need to replace
        // that with the proper prefix before setting as the img element's src.

        if (image.charAt(0) === '~') {
            image = TP.boot.$uriExpandPath(image);
        }
        TP.boot.$displayImage(image);
    }

    // If the stage has a 'hook' function run it.
    if (typeof info.hook === 'function') {
        info.hook(aStage, aReason);
    }

    // One last thing is dealing with the termination phases, started and
    // stopped. Each needs some special handling.

    if (TP.boot.$$stage === 'liftoff') {

        TP.boot.$stdout('Launched in ' +
            (TP.boot.$getStageTime('started', 'prelaunch') -
                TP.boot.$getStageTime('paused')) +
            'ms with ' + TP.boot.$getBootStats(), TP.SYSTEM);

        TP.boot.$stdout('', TP.SYSTEM);
        TP.boot.$stdout(TP.sys.cfg('boot.uisection'), TP.SYSTEM);

    } else if (TP.boot.$$stage === 'stopped') {

        TP.boot.$stdout(aReason, TP.SYSTEM);
        TP.boot.$stdout('', TP.SYSTEM);
        TP.boot.$stdout('Stopped after ' +
            (TP.boot.$getStageTime('stopped', 'prelaunch') -
                TP.boot.$getStageTime('paused')) +
            'ms with ' + TP.boot.$getBootStats(), TP.SYSTEM);
        TP.boot.$stdout('', TP.SYSTEM);
        TP.boot.$stdout(TP.sys.cfg('boot.uisection'), TP.SYSTEM);
    }

    TP.boot.$flushLog(true);

    return TP.boot.$$stage;
};

//  ----------------------------------------------------------------------------

TP.boot.$getNextStage = function(aStage) {
    var stage,
        index;

    stage = aStage || TP.boot.$$stage;
    index = TP.boot.$$stageorder.indexOf(stage);
    if (index === TP.NOT_FOUND ||
        (index + 1 === TP.boot.$$stageorder.length))  {
        return;
    }

    return TP.boot.$$stageorder[index + 1];
};

//  ----------------------------------------------------------------------------

TP.boot.$getPriorStage = function(aStage) {
    var stage,
        index;

    stage = aStage || TP.boot.$$stage;
    index = TP.boot.$$stageorder.indexOf(stage);
    if (index === TP.NOT_FOUND || index === 0)  {
        return;
    }

    return TP.boot.$$stageorder[index - 1];
};

//  ----------------------------------------------------------------------------

TP.boot.$getStageTime = function(aStage, startStage) {

    /**
     * Returns the amount of time a stage took relative to the startStage or the
     * prior stage. If the stage isn't complete this method returns a rough time
     * based on the time of the call.
     * @param {String} aStage The stage to report on. Defaults to current stage.
     * @param {String} startStage The stage to compute from. Defaults to the
     *     stage prior to aStage.
     * @return {Number} An elapsed time value in milliseconds.
     */

    var stage,
        next,
        start,
        stageinfo,
        stagetime,
        startinfo,
        starttime,
        elapsed;

    //  computation is actually based on the _next stages'_ entry time or the
    //  time of this call - the entry time of either this stage or some
    //  alternative start stage. this is due to the fact we store entered times
    //  in each stage, not elapsed times.

    // Default the stage setting, then capture the next stage or current time
    // data as the time we'll use for the largest of the two time values.
    stage = aStage || TP.boot.$$stage;
    next = TP.boot.$getNextStage(stage);
    stageinfo = TP.boot.$getStageInfo(next);
    if (TP.boot.$notValid(stageinfo)) {
        return 0;
    } else if (TP.boot.$notValid(stageinfo.entered)) {
        stagetime = new Date();
    } else {
        stagetime = stageinfo.entered;
    }

    // Default the start stage to the current stage. Again, this is done since
    // our start time is captured in stage info, not elapsed or end time.
    start = startStage || stage;
    startinfo = TP.boot.$getStageInfo(start);
    if (TP.boot.$notValid(startinfo)) {
        return 0;
    } else if (TP.boot.$notValid(startinfo.entered)) {
        return 0;
    } else {
        starttime = startinfo.entered;
    }

    // Simple value is current - start in milliseconds.
    elapsed = Math.abs(stagetime.getTime() - starttime.getTime());

    return elapsed;
};

//  ============================================================================
//  URL CONFIGURATION FUNCTIONS
//  ============================================================================

TP.boot.$getArgumentPrimitive = function(value) {
    if (TP.boot.$notValid(value)) {
        return value;
    }

    // Try to convert to number, boolean, regex,
    if (TP.boot.NUMBER_REGEX.test(value)) {
        return 1 * value;
    } else if (TP.boot.BOOLEAN_REGEX.test(value)) {
        return value === 'true';
    } else if (TP.boot.REGEX_REGEX.test(value)) {
        return new RegExp(value.slice(1, -1));
    } else if (TP.boot.OBJECT_REGEX.test(value)) {
        try {
            JSON.parse(value);
        } catch (e) {
            return value;
        }
    } else {
        return value;
    }
};

//  ----------------------------------------------------------------------------

TP.boot.getURLArguments = function(url) {

    /**
     * @name getURLArguments
     * @summary Parses the URL for any TIBET-specific argument block. When
     *     parsing the hash is checked for any & segment and that segment is
     *     split just as if it were a set of server parameters. For example,
     *     http://localhost/index.html#foo&boot.debug=true results in the
     *     argument object containing {'boot.debug':true};
     * @param {string} url The url string to decode for arguments.
     * @return {Object}
     */

    var hash,
        params,
        args;

    // Process any hash portion of the URL string.
    if (!/#/.test(url)) {
        return {};
    }
    hash = url.slice(url.indexOf('#') + 1);
    hash = decodeURIComponent(hash);

    args = {};
    params = hash.split('&');
    params.forEach(function(item) {
        var parts,
            key,
            value;

        parts = item.split('=');
        key = parts[0];
        value = parts[1];

        if (parts.length > 1) {
            if ((value.length > 1) &&
                    (/^".*"$/.test(value) || /^'.*'$/.test(value))) {
                value = value.slice(1, -1);
            }
        } else {
            key = item;
            value = true;
        }

        args[key] = TP.boot.$getArgumentPrimitive(value);
    });

    return args;
};

//  ----------------------------------------------------------------------------

TP.boot.getURLBookmark = function(url) {

    /**
     * @name getURLBookmark
     * @summary Parses the URL for a bootable bookmark hash reference.
     * @param {string} url The url string to decode for arguments.
     * @return {string} The bookmark, if any.
     */

    var hash;

    // Process the hash portion of the URL string.
    if (!/#/.test(url)) {
        return;
    }
    hash = url.slice(url.indexOf('#'));

    // Any part of the hash which is formatted to match server-side parameter
    // syntax will be treated as client-side parameters. The bookmark portion of
    // the hash must be non-empty.
    if (/&/.test(hash)) {
        hash = hash.slice(0, hash.indexOf('&'));
    }

    return hash;
};

//  ============================================================================
//  ROOT PATHS
//  ============================================================================

/*
TIBET is "dual path" oriented, meaning it thinks in terms of an "app root"
and a "lib root" so that your code and the TIBET code can vary independently
without too many maintenance issues. Using separate paths for APP and LIB
code lets you either share a codebase, or point your application to a new
release of TIBET for testing without altering directory structures, making
extra copies, or other typical approaches.
*/

//  ----------------------------------------------------------------------------

TP.boot.$getAppHead = function() {

    /**
     * @name $getAppHead
     * @summary Returns the portion of the launch location just above whichever
     *     file actually triggered the launch sequence. Always computed from the
     *     window.location (if available).
     * @return {String} The computed path.
     */

    var path,
        offset,
        parts,
        keys,
        key,
        lib,
        i,
        len;

    if (TP.boot.$$apphead != null) {
        return TP.boot.$$apphead;
    }

    // Compute from the window location. This presumes window is a real slot
    // (which means it won't work on Node.js etc by default).
    path = decodeURI(window.location.toString());
    path = path.split(/[#?]/)[0];

    // From a semantic viewpoint the app head can't be inside the library
    // area, it has to be above it, typically where we'd think of app root
    keys = [TP.sys.cfg('boot.tibetdir'), TP.sys.cfg('boot.tibetinf')];
    len = keys.length;
    for (i = 0; i < len; i++) {
        key = '/' + keys[i] + '/';
        if (path.indexOf(key) !== -1) {
            TP.boot.$$apphead = path.slice(0, path.indexOf(key));
            return TP.boot.$$apphead;
        }
    }

    // Didn't find a typical project library location on the path. Check to see
    // if we're _in_ the library.
    lib = TP.sys.cfg('boot.libtest') || TP.sys.cfg('boot.tibetlib');
    if (path.indexOf('/' + lib + '/') !== -1) {
        TP.boot.$$apphead = path.slice(0,
            path.indexOf('/' + lib + '/') + lib.length + 1);
        return TP.boot.$$apphead;
    }

    // Should have found boot.tibetlib but just in case we can just use an
    // offset from the current window location (minus noise for # etc.)
    offset = TP.sys.getcfg('path.head_offset');
    if (TP.boot.$notEmpty(offset)) {
        TP.boot.$$apphead = TP.boot.$uriCollapsePath(
            TP.boot.$uriJoinPaths(path, offset));
        return TP.boot.$$apphead;
    }

    // If we're not launching from somewhere below the typical library root we
    // try to work from the last portion of the path prior to any hash value.
    parts = path.split('/');
    if (parts[parts.length - 1].match(/\./)) {
        parts.length = parts.length - 1;
    }
    path = parts.join('/');

    TP.boot.$$apphead = path;
    return path;
};

//  ----------------------------------------------------------------------------

TP.boot.$getAppRoot = function() {

    /**
     * @name $getAppRoot
     * @summary Returns the root path for the application, the point from which
     *     most if not all "app path" resolution occurs. Unless this has been
     *     defined otherwise the return value is computed based on the value
     *     found via $getAppHead. If the application launch path includes a
     *     reference to node_modules the app root is presumed to be the location
     *     containing node_modules and it is adjusted accordingly.
     * @return {String} The computed path.
     */

    var root;

    //  first check for a cached value. this is what's used during booting
    if (TP.boot.$$approot != null) {
        return TP.boot.$$approot;
    }

    //  if specified it should be an absolute path we can expand and use
    root = TP.sys.cfg('path.app_root');
    if (TP.boot.$notEmpty(root)) {
        return TP.boot.$setAppRoot(root);
    }

    // If app root isn't going to match up with app head it's going to typically
    // be set via launch parameters, url parameters, or via tibet.json. We can
    // set it initially here and it'll be reset once those are processed.
    return TP.boot.$setAppRoot(TP.boot.$getAppHead());
};

//  ----------------------------------------------------------------------------

TP.boot.$getLibRoot = function() {

    /**
     * @name $getLibRoot
     * @summary Returns the root path for the TIBET codebase.
     * @description When the value for path.lib_root is not specified this
     *     method will try to compute one. The computation can be altered via
     *     the boot.libcomp setting.
     * @return {String} The root path for the TIBET codebase.
     * @todo
     */

    var comp,
        root,
        loc,
        test,
        ndx,
        path,
        parts,
        scripts,
        i,
        len;

    //  first check for a cached value. this is what's used during booting
    if (TP.boot.$$libroot != null) {
        return TP.boot.$$libroot;
    }

    //  if specified it should be an absolute path we can expand and use
    root = TP.sys.cfg('path.lib_root');
    if (TP.boot.$notEmpty(root)) {
        return TP.boot.$setLibRoot(root);
    }

    // Default starting point is the current window location minus any fragment
    // and file reference.
    loc = decodeURI(window.location.toString());
    root = loc.split(/[#?]/)[0];

    parts = root.split('/');
    if (parts[parts.length - 1].match(/\./)) {
        parts.length = parts.length - 1;
    }
    root = parts.join('/');

    comp = TP.sys.cfg('boot.libcomp');
    switch (comp) {
    case 'apphead':
        // force to match app_head.
        return TP.boot.$setLibRoot(TP.boot.$getAppHead());

    case 'approot':
        // force to match app_root.
        return TP.boot.$setLibRoot(TP.boot.$getAppRoot());

    case 'frozen':
        // frozen applications typically have TIBET-INF/tibet in them
        path = TP.boot.$uriJoinPaths(
                TP.boot.$uriJoinPaths(root, TP.sys.cfg('boot.tibetinf')),
                TP.sys.cfg('boot.tibetlib'));
        return TP.boot.$setLibRoot(path);

    case 'indexed':
        // find location match using a string index on window location.
        test = TP.sys.cfg('boot.libtest') || TP.sys.cfg('boot.tibetlib');
        if (TP.boot.$notEmpty(test)) {
            ndx = root.lastIndexOf(test);
            if (ndx !== -1) {
                ndx += test.length + 1;
                path = root.slice(0, ndx);
                return TP.boot.$setLibRoot(path);
            }
        }
        break;

    case 'location':
        // force to last 'collection' in the window location.
        return TP.boot.$setLibRoot(root);

    case 'tibetdir':
        // npmdir applications typically have node_modules/tibet in them
        path = TP.boot.$uriJoinPaths(
                TP.boot.$uriJoinPaths(root, TP.sys.cfg('boot.tibetdir')),
                TP.sys.cfg('boot.tibetlib'));
        return TP.boot.$setLibRoot(path);

        /* eslint-disable no-fallthrough */
    case 'script':
        void(0);
        /* falls through */
    default:
        /* eslint-enable no-fallthrough */

        // Find script tags and turn into an array instead of collection.
        scripts = Array.prototype.slice.call(
            document.getElementsByTagName('script'), 0);
        len = scripts.length;
        for (i = 0; i < len; i++) {
            if (/tibet_init/.test(scripts[i].src)) {
                path = scripts[i].src;
                break;
            }
        }

        // Combine current path with the src path in case of relative path
        // specification (common) and we should end up with a workable offset.
        if (TP.boot.$notEmpty(path)) {
            return TP.boot.$setLibRoot(
                TP.boot.$uriCollapsePath(
                    TP.boot.$uriJoinPaths(TP.boot.$uriJoinPaths(root, path),
                    TP.sys.cfg('boot.initoffset'))));
        }

        break;
    }

    if (TP.boot.$isValid(TP.boot.$$libroot)) {
        return TP.boot.$$libroot;
    }

    TP.boot.shouldStop('unable to compute lib_root');
    TP.boot.$stderr('TP.boot.$getLibRoot() unable to find/compute libroot.',
                   TP.FATAL);
};

//  ----------------------------------------------------------------------------

TP.boot.$getRootPath = function() {

    /**
     * @name $getRootPath
     * @summary Returns the currently active root path for the codebase.
     * @return {String}
     */

    var path,
        debug;

    if (TP.boot.$$rootpath != null) {
        return TP.boot.$$rootpath;
    }

    path = TP.boot.$getLibRoot();

    //  won't cache until we're sure we've gotten a libroot value
    if (path != null) {
        //  cache the value for repeated use
        TP.boot.$$rootpath = path;
    }

    debug = TP.sys.cfg('debug.path');
    if (debug && TP.boot.$$debug) {
        TP.boot.$stdout('TP.boot.$getRootPath() computed rootpath: ' +
                        TP.boot.$$rootpath, TP.DEBUG);
    }

    return path;
};

//  ----------------------------------------------------------------------------

TP.boot.$setAppRoot = function(aPath) {

    /**
     * @name $setAppRoot
     * @summary Sets the application root path, the path used as a base path
     *     for any relative path computations for application content.
     * @param {String} aPath A new root path for application content.
     * @return {String} The expanded path value.
     */

    var path,
        debug;

    path = TP.boot.$uriExpandPath(aPath);
    path = decodeURI(path);
    TP.boot.$$approot = path;

    TP.sys.setcfg('path.app_root', path);

    debug = TP.sys.cfg('debug.path');
    if (debug && TP.boot.$$debug) {
        TP.boot.$stdout('TP.boot.$setAppRoot() defined approot: ' + path,
                        TP.DEBUG);
    }

    return TP.boot.$$approot;
};

//  ----------------------------------------------------------------------------

TP.boot.$setLibRoot = function(aPath) {

    /**
     * @name $setLibRoot
     * @summary Sets the library root path, the path used as a base path for
     *     any relative path computations for library content.
     * @param {String} aPath A new root path for library content.
     * @return {String} The expanded path value.
     */

    var path,
        debug;

    path = TP.boot.$uriExpandPath(aPath);
    path = decodeURI(path);
    TP.boot.$$libroot = path;

    TP.sys.setcfg('path.lib_root', path);

    debug = TP.sys.cfg('debug.path');
    if (debug && TP.boot.$$debug) {
        TP.boot.$stdout('TP.boot.$setLibRoot() defined libroot: ' + path,
                        TP.DEBUG);
    }

    return TP.boot.$$libroot;
};

//  ============================================================================
//  CONFIGURATION FUNCTIONS
//  ============================================================================

TP.boot.$configurePackage = function() {

    /**
     * @name $configurePackage
     * @summary Locates the package file if at all possible. The search checks
     *     both boot.profile and boot.package with profile taking precedence.
     *     Note that boot.profile can also override boot.config if it includes a
     *     barename. The profile 'development#team-tibet' for example will load
     *     the development profile file and use the team-tibet config. The value
     *     for boot.package on the other hand is a pure URL to the package file.
     * @todo
     */

    var profile,
        package,
        config,
        parts,
        file,
        xml,
        err;

    // First phase is about giving boot.profile precedence over boot.package.
    profile = TP.sys.cfg('boot.profile');
    if (TP.boot.$isEmpty(profile)) {
        TP.boot.$stdout('Empty boot.profile. Checking for boot.package.',
            TP.DEBUG);

        package = TP.sys.cfg('boot.package');
        if (TP.boot.$isEmpty(package)) {

            TP.boot.$stdout('Empty boot.package. Defaulting to standard.xml.',
                TP.DEBUG);

            package = 'standard.xml';
        } else {
            TP.boot.$stdout('Found boot.package. Using: ' + package,
                TP.DEBUG);
        }
    } else {
        TP.boot.$stdout('Found boot.profile. Using: ' + profile, TP.DEBUG);
    }

    // Second phase is processing any boot.profile if found to update any
    // boot.package and boot.config values contained in the profile.
    if (TP.boot.$notEmpty(profile)) {

        // If we see # it's a package#config description. Split and update the
        // proper elements as needed.
        if (/#/.test(profile)) {
            parts = profile.split('#');
            package = parts[0];

            config = TP.sys.cfg('boot.config');
            if (config !== parts[1]) {

                // If the existing config isn't empty we're about to change it.
                // Don't do that without writing a warning to the logs.
                if (TP.boot.$notEmpty(config)) {
                    TP.boot.$stdout(
                        'Overriding boot.config (' + config +
                        ') with profile#config: ' + parts[1], TP.WARN);
                }

                // Configuration mismatch. We'll go with the one on the
                // profile...because we're in an IF whose condition is that
                // there was no boot.package spec'd to go with boot.config.
                TP.sys.setcfg('boot.config', parts[1]);
            }
        } else {
            package = profile;
        }
    }

    // Packages should always be .xml files. If we're defaulting from user input
    // tho we don't assume they added that to either profile or package name.
    if (/\.xml$/.test(package) !== true) {
        package += '.xml';
    }

    // If the package spec isn't absolute we need to join it with a
    // directory or other prefix so we can find the actual resource.
    if (!TP.boot.$uriIsAbsolute(package)) {
        package = TP.boot.$uriJoinPaths('~app_cfg', package);
    }

    // Warn if we're overriding package info
    if (package !== TP.sys.cfg('boot.package') &&
        TP.boot.$notEmpty(TP.sys.cfg('boot.package'))) {
        TP.boot.$stdout(
            'Overriding boot.package (' + TP.sys.cfg('boot.package') +
            ') with profile#config: ' + package, TP.WARN);
    }

    file = TP.boot.$uriExpandPath(package);
    TP.boot.$stdout('Loading package: ' + file, TP.DEBUG);

    xml = TP.boot.$uriLoad(file, TP.DOM, 'manifest', false);
    if (xml) {
        TP.boot.$$bootxml = xml;
        TP.boot.$$bootfile = file;
    } else {

        err = 'Boot package \'' + package + '\' not found in: ' + file;
        TP.boot.$stderr(err, TP.FATAL);

        throw new Error(err);
    }

    return xml;
};

//  ----------------------------------------------------------------------------

TP.boot.$configureBootstrap = function() {

    /**
     * @name $configureBootstrap
     * @summary Configures any boot properties based on the current project
     *     (tibet.json) file provided that loading that file works.
     * @todo
     */

    var file,
        str,
        obj,
        logpath;

    // Launch parameters can be provided directly to the launch command such
    // that the bootstrap file isn't needed. If that's the case we can skip
    // loading the file and cut out one more HTTP call.
    if (TP.sys.cfg('boot.nobootstrap')) {
        return;
    }

    file = TP.boot.$uriJoinPaths('~app', TP.sys.cfg('boot.bootstrap'));
    logpath = TP.boot.$uriInTIBETFormat(file);

    file = TP.boot.$uriExpandPath(file);

    try {
        TP.boot.$stdout('Loading bootstrap: ' + logpath, TP.DEBUG);
        str = TP.boot.$uriLoad(file, TP.TEXT, 'source');
        if (!str) {
            TP.boot.$stderr('Failed to load: ' + file, TP.FATAL);
        }
        obj = JSON.parse(str);
    } catch (e) {
        TP.boot.$stderr('Failed to load: ' + logpath,
            TP.boot.$ec(e), TP.FATAL);
        return;
    }

    // Process the values in the bootstrap file to push them into the system
    // configuration.
    TP.boot.$configureOptions(obj);

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$configureEnvironment = function() {

    /**
     * @name $configureEnvironment
     * @summary Defines a number of 'environment' variables which support
     *     conditional processing of tasks/targets. These variables are set
     *     based browser and feature-detection techniques as needed to try to
     *     describe the environment accurately.
     * @return {null}
     */

    //  start with platform
    TP.boot.$$setenv('tibet.userAgent', navigator.userAgent);

    TP.boot.$$setenv('tibet.platform', TP.$platform);
    TP.boot.$$setenv('tibet.' + TP.$platform, TP.$platform);

    //  some platforms report with version, handle registering them without
    //  a version for more generic checks manually here.
    if (TP.$platform.indexOf('win') === 0) {
        TP.boot.$$setenv('tibet.win', 'win');
    }

    if (TP.$platform.indexOf('mac') === 0) {
        TP.boot.$$setenv('tibet.mac', 'mac');
    }

    if (TP.$platform.indexOf('*nix') === 0) {
        TP.boot.$$setenv('tibet.*nix', '*nix');
    }

    //  configure the default explicit browser slot(s)
    TP.boot.$$setenv('tibet.browser', TP.$browser);
    TP.boot.$$setenv('tibet.browserIdent', TP.$browserIdent);
    TP.boot.$$setenv('tibet.browserMajor', TP.$browserMajor);
    TP.boot.$$setenv('tibet.browserMinor', TP.$browserMinor);
    TP.boot.$$setenv('tibet.browserBuild', TP.$browserBuild);
    TP.boot.$$setenv('tibet.browserPatch', TP.$browserPatch);

    TP.boot.$$setenv('tibet.browserUI', TP.$browserUI);
    TP.boot.$$setenv('tibet.browserUIIdent', TP.$browserUIIdent);
    TP.boot.$$setenv('tibet.browserUIMajor', TP.$browserUIMajor);
    TP.boot.$$setenv('tibet.browserUIMinor', TP.$browserUIMinor);
    TP.boot.$$setenv('tibet.browserUIBuild', TP.$browserUIBuild);
    TP.boot.$$setenv('tibet.browserUIPatch', TP.$browserUIPatch);

    //  xml processing
    TP.boot.$$setenv('tibet.msxml', TP.$msxml);

    //  language
    TP.boot.$$setenv('tibet.xmllang',
                        TP.$language.toLowerCase());
    TP.boot.$$setenv('tibet.' + TP.$language.toLowerCase(),
                        TP.$language.toLowerCase());

    TP.sys.setcfg('tibet.offline', !TP.sys.isHTTPBased());

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$configureLocalCache = function(shouldWarn) {

    /**
     * @name $configureLocalCache
     * @summary Configures local cache storage if boot.localcache is true.
     * @description The local cache is used heavily during booting to optimize
     *     load times and HTTP access overhead, but is also leveraged by TIBET's
     *     content processing pipeline for storing processed markup and style
     *     data. NOTE that this method may alter the value of the
     *     boot.localcache flag if no cache-capable infrastructure can be
     *     found/accessed in the current browser.
     * @param {Boolean} shouldWarn Should warnings be output? Normally true, but
     *     since this routine is called more than once we turn them off in some
     *     circumstances.
     * @return {null}
     */

    var pname,
        version,
        msg;

    //  if the cache is off then there's no real work to do, we check that
    //  flag anywhere we might be doing cache-related work.
    if (!TP.sys.cfg('boot.localcache')) {
        return;
    }

    //  configure storage in whatever form we can so we can support
    //  the localcache requirement(s). NOTE that this won't access DOM
    //  storage unless booting from HTTP due to oversight on the part of the
    //  various browser implementers.
    TP.boot.$setupDOMStorage();

    if (TP.boot.$notValid(TP.$BOOT_STORAGE)) {
        if (shouldWarn !== false) {
            //  should have been able to configure cache, particularly when
            //  we're trying to launch over HTTP (since DOM Storage should
            //  be there), so record failure when HTTP-based as an error.
            msg = 'Unable to configure storage, disabling local cache.';

            if (TP.sys.isHTTPBased()) {
                TP.boot.$stderr(msg);
            } else {
                //  file-based launches are often restricted from accessing
                //  DOM storage, but we can get to the file system so it's
                //  unlikely to have a huge impact.
                TP.boot.$stdout(msg, TP.WARN);
            }
        }

        //  force the cache control flag to false so we don't try to use the
        //  cache anywhere else.
        TP.sys.setcfg('boot.localcache', false);

        return;
    }

    //  how the cache is actually leveraged and updated is a factor of the
    //  cache mode, which can be "versioned" (leveraging a version string
    //  check), "synchronized" (use Last-Modified data), "manual" (refresh
    //  nodes that are specifically marked), "stale" (where the cache is
    //  effectively forced to update completely), and "fresh" where the
    //  cache is presumed to be correct regardless of its true state).
    switch (TP.sys.cfg('boot.cachemode')) {
        case 'versioned':

            TP.boot.$stdout('Configuring \'versioned\' local cache.',
                TP.DEBUG);

            //  versioned caches check the package's version as defined in
            //  the root manifest file against the cached version for the
            //  application. the result of that comparison drive how the
            //  various cache detail flags are set.
            pname = TP.sys.cfg('project.name');
            version = TP.sys.cfg('project.version');

            TP.$BOOT_STORAGE.get(
                pname + '_cache_version',
                function(content) {

                    TP.boot.$configureVersionedCache(content, version);
                });

            break;

        case 'synchronized':

            TP.boot.$stdout('Configuring \'synchronized\' local cache.',
                            TP.DEBUG);

            //  a synchronized cache means we update every file based on
            //  Last-Modified data to keep the cache synchronized with any
            //  changes on the server.
            TP.sys.setcfg('import.source', 'modified');

            break;

        case 'manual':

            TP.boot.$stdout('Configuring \'manual\' local cache.',
                TP.DEBUG);

            //  a manual cache means the manifest nodes to update will be
            //  marked manually as needing a refresh. This approach provides
            //  the most control but is harder to maintain for developers.
            TP.sys.setcfg('import.source', 'marked');

            break;

        case 'stale':

            TP.boot.$stdout('Configuring \'stale\' local cache.',
                TP.DEBUG);

            //  a stale cache means we don't even want to consider metadata
            //  regarding Last-Modified dates for source. all flags are set
            //  to force full refresh of the cache to occur.
            TP.sys.setcfg('import.source', 'remote');

            //  If the user said that the cache is 'stale', then just empty
            //  it in preparation for reloading.
            TP.$BOOT_STORAGE.removeAll(TP.NOOP);

            break;

        case 'fresh':

            TP.boot.$stdout('Configuring \'fresh\' local cache.',
                TP.DEBUG);

            //  cache is considered current without checks of any kind.
            TP.sys.setcfg('import.manifests', true);
            TP.sys.setcfg('import.metadata', true);
            TP.sys.setcfg('import.source', 'local');

            break;

        default:

            //  invalid cache mode, treat like an invalid cache
            TP.boot.$stderr('Invalid local cache mode: ' +
                TP.sys.cfg('boot.cachemode'), TP.ERROR);
            TP.boot.$stdout('Disabling local cache.', TP.WARN);

            TP.sys.setcfg('boot.localcache', false);

            break;
    }

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$configureVersionedCache = function(cacheVersion, rootVersion) {

    /**
     * @name $configureVersionedCache
     * @summary Configures cache import properties based on comparison of the
     *     version strings provided. The cache version is typically read from
     *     the local cache using the current application name while the
     *     rootVersion is read from the tibet.xml file.
     * @description The comparison of version strings is usually done using a
     *     common format of major.minor.build.patch. The level at which the
     *     version string first changes defines the nature of the overall cache
     *     update that will be performed.
     *
     *     Since there are four components to a version string there are four
     *     types of cache update which can be configured by manipulating the
     *     version string. A major update invalidates the entire cache,
     *     effectively mirroring a "stale" cache setting. A minor update tries
     *     to preserve as much of the cache as possible while updating with the
     *     latest content (mirroring a "synchronized" cache). A build update
     *     implies a primarily configuration-related change in which individual
     *     files to update are marked (mirroring a "manual" cache setting). A
     *     patch update preserves all existing content and simply invalidates
     *     the build information and presumes that one or more files won't be
     *     found in the current cache (the patch files).
     * @param {The} cacheVersion cached content's version string.
     * @param {The} rootVersion root packages's version string.
     * @return {null}
     * @todo
     */

    var rootParts,
        cacheParts;

    // Since cache config can be async sometimes we'll see cache messaging after
    // a 'stop', which makes things look a bit strange. Just stop.
    if (TP.boot.shouldStop()) {
        return;
    }

    if (!cacheVersion) {
        TP.boot.$stdout('No local cache version string found.', TP.DEBUG);
        TP.boot.$stdout('Simulating \'empty\' local cache.', TP.DEBUG);

        //  no cache or empty version string, consider cache invalid.
        TP.sys.setcfg('import.source', 'remote');

        return;
    }

    if (!rootVersion) {
        TP.boot.$stdout('No target version string found.', TP.DEBUG);
        TP.boot.$stdout('Simulating \'manual\' local cache.', TP.DEBUG);

        //  no target version for the root package, consider cache valid but
        //  check individual nodes for version/update information.
        TP.sys.setcfg('import.source', 'marked');

        return;
    }

    //  if the strings are the same, regardless of their form, then we
    //  consider the cache to be current in all respects.
    if (cacheVersion === rootVersion) {
        TP.boot.$stdout('Cache and target versions match.', TP.DEBUG);
        TP.boot.$stdout('Simulating \'fresh\' local cache.', TP.DEBUG);

        TP.sys.setcfg('import.manifests', true);
        TP.sys.setcfg('import.metadata', true);
        TP.sys.setcfg('import.source', 'local');

        return;
    }

    //  the version strings need to be 'well-formed' for remaining logic to
    //  work properly since it relies on testing relative magnitudes.

    //  if the target version isn't recognized, but it differs from the
    //  current cached version, we consider that a "major update" since we
    //  have no other data to go by.
    if (!TP.TIBET_VERSION_SPLITTER.test(rootVersion)) {
        TP.boot.$stderr('Unrecognized target version format: ' +
                        rootVersion);
        TP.boot.$stdout('Simulating \'stale\' local cache.', TP.DEBUG);

        TP.sys.setcfg('import.source', 'remote');

        return;
    }

    //  if the root version is recognized but the cache version isn't then
    //  we can presume this is a major update and configure the cache
    //  accordingly.
    if (!TP.TIBET_VERSION_SPLITTER.test(cacheVersion)) {
        TP.boot.$stderr('Unrecognized cache version format: ' +
                        cacheVersion);
        TP.boot.$stdout('Simulating \'stale\' local cache.', TP.DEBUG);

        TP.sys.setcfg('import.source', 'remote');

        return;
    }

    //  both versions appear to be in the right format if we got this far,
    //  so the next stage is to split them and start comparing chunks to
    //  determine the nature of the update
    cacheParts = TP.TIBET_VERSION_SPLITTER.match(cacheVersion);
    rootParts = TP.TIBET_VERSION_SPLITTER.match(rootVersion);

    if (rootParts[1] > cacheParts[1]) {
        //  major update
        TP.boot.$stderr(TP.boot.$join('Major version change from ',
                        cacheParts[1], ' to ', rootParts[1]));

        TP.boot.$stdout('Simulating \'stale\' local cache.', TP.DEBUG);

        TP.sys.setcfg('import.source', 'remote');

        return;
    }

    if (rootParts[2] > cacheParts[2]) {
        //  minor update
        TP.boot.$stderr(TP.boot.$join('Minor version change from ',
                        cacheParts[2], ' to ', rootParts[2]));

        TP.boot.$stdout('Simulating \'synchronized\' local cache.',
            TP.DEBUG);

        TP.sys.setcfg('import.source', 'modified');

        return;
    }

    if (rootParts[3] > cacheParts[3]) {
        //  build update
        TP.boot.$stderr(TP.boot.$join('Build version change from ',
                        cacheParts[3], ' to ', rootParts[3]));

        TP.boot.$stdout('Simulating \'manual\' local cache.', TP.DEBUG);

        TP.sys.setcfg('import.source', 'marked');

        return;
    }

    if (rootParts[4] > cacheParts[4]) {
        //  build update
        TP.boot.$stderr(TP.boot.$join('Patch version change from ',
                        cacheParts[4], ' to ', rootParts[4]));

        TP.boot.$stdout('Simulating \'fresh\' local cache.', TP.DEBUG);

        TP.sys.setcfg('import.source', 'local');

        return;
    }

/*
    //  regardless of how the prior step went, be sure we store the version
    //  we'll be caching as a result of this launch.
    TP.$BOOT_STORAGE.set(pname + '_cache_version', version, TP.NOOP);
*/

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$configureOptions = function(anObject) {

    Object.keys(anObject).forEach(function(key) {
        var value;

        value = anObject[key];
        // If the value isn't a primitive we assume the key is a prefix and that
        // we need to nest the data appropriately.
        if (Object.prototype.toString.call(value) === '[object Object]') {
            Object.keys(value).forEach(function(subkey) {
                var name;

                name = key + '.' + subkey;
                TP.sys.setcfg(name, value[subkey]);

                TP.boot.$stdout('$configureOption ' + name + ' = ' +
                    value[subkey], TP.DEBUG);

                // Update cached values as needed.
                if (name === 'path.app_root') {
                    TP.boot.$stdout('Overriding path.app_root cache with: ' +
                        value[subkey], TP.DEBUG);
                    TP.boot.$$approot = TP.boot.$uriExpandPath(value[subkey]);
                } else if (name === 'path.lib_root') {
                    TP.boot.$stdout('Overriding path.lib_root cache with: ' +
                        value[subkey], TP.DEBUG);
                    TP.boot.$$libroot = TP.boot.$uriExpandPath(value[subkey]);
                }
            });
        } else {
            TP.sys.setcfg(key, value);
        }
    });
};

//  ----------------------------------------------------------------------------

TP.boot.$$configureOverrides = function(options, activate) {

    /**
     * @name $$configureOverrides
     * @summary Processes any arg values that the user may have set,
     *     allowing them to override certain boot properties. Common overrides
     *     include debug, verbose, and display. The args for environment
     *     setting are processed individually by the $configureBootstrap
     *     function prior to loading the environment-specific configuration.
     * @param {Object} options An object containing option values.
     *
     * @return {null}
     */

    var keys,
        overrides;

    if (TP.boot.$notValid(options)) {
        return;
    }

    keys = Object.keys(options);

    // If we've been here already then merge in any new values being provided.
    overrides = TP.sys.overrides;
    if (TP.boot.$isValid(overrides)) {
        // Two key phases here are launch() params and URL values. URL values
        // come second (so we can honor boot.nourlargs from launch()) but do
        // outrank launch parameters when they exist so we just map over.
        keys.forEach(function(key) {
            var value = options[key];

            if (Object.prototype.toString.call(value) === '[object Object]') {
                Object.keys(value).forEach(function(subkey) {
                    var name = key + '.' + subkey;

                    overrides[name] = value[subkey];
                });
            } else {
                overrides[key] = value;
            }
        });
    }

    // Set the actual configuration values for anything we've been provided
    keys.forEach(function(key) {
        var value = options[key];

        if (Object.prototype.toString.call(value) === '[object Object]') {
            Object.keys(value).forEach(function(subkey) {
                var name = key + '.' + subkey;

                TP.boot.$stdout('Setting override for: ' + name + ' to: \'' +
                    value[subkey] + '\'', TP.DEBUG);

                TP.sys.setcfg(name, value[subkey], false, true);
            });
        } else {
            TP.boot.$stdout('Setting override for: ' + key + ' to: \'' +
                value + '\'', TP.DEBUG);
            TP.sys.setcfg(key, value, false, true);
        }
    });

    TP.boot.$$argsDone = activate;

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$configureProject = function() {

    var doc,
        package;

    doc = TP.boot.$$bootxml;
    package = doc.getElementsByTagName('package')[0];

    if (TP.boot.$isEmpty(package)) {
        //  Going to have problems. Without package data we have no home page
        //  name etc. so we'll have to default to something.
        TP.sys.setcfg('project.name', 'default');
        TP.sys.setcfg('project.version', '0.0.1');
    } else {
        //  project.* values track the name, controller type and version for the
        //  current project
        TP.sys.setcfg('project.name',
            package.getAttribute('name'));
        TP.sys.setcfg('project.controller',
            package.getAttribute('controller'));
        TP.sys.setcfg('project.version',
            package.getAttribute('version') || '0.0.1');
    }

    if (TP.boot.$notValid(TP.sys.cfg('project.rootpage'))) {
        TP.sys.setcfg('project.rootpage', '~app_html/UIROOT.xhtml');
    }

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$configureTarget = function() {

    /**
     * @name $configureTarget
     * @return {null}
     */

    var doc,
        config;

    //  if we don't have a config property we'll try to get default
    config = TP.sys.cfg('boot.config');

    if (TP.boot.$isEmpty(config)) {
        doc = TP.boot.$$bootxml;
        config = TP.boot.$getDefaultConfig(doc);
        TP.sys.setcfg('boot.config', config);
    }

    TP.boot.$$bootconfig = config;

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$updateDependentVars = function() {

    var level;

    // Logging level drives how the UI looks, so it needs to be updated.
    level = TP.sys.cfg('boot.level');
    if (typeof level === 'string') {
        if (level.toUpperCase() in TP.boot) {
            level = TP.boot[level.toUpperCase()];
        } else {
            TP.boot.$stdout('Invalid boot.level: ' + level +
                '. Forcing to TP.WARN', TP.WARN);
            level = TP.boot.WARN;
        }
    } else if (typeof level !== 'number') {
        TP.boot.$stdout('Invalid boot.level: ' + level +
            '. Forcing to TP.WARN', TP.WARN);
        level = TP.boot.WARN;
    }

    if (level < TP.boot.ALL || level > TP.boot.OFF) {
        // Reset and warn.
        TP.sys.setcfg('boot.level', TP.WARN, false, true);
        TP.boot.$$loglevel = TP.boot.WARN;
        TP.boot.$computeLogBufferSize();
            TP.boot.$stdout('Invalid boot.level: ' + level +
                '. Forcing to TP.WARN', TP.WARN);
    } else {
        TP.boot.$$loglevel = level;
    }

    // Debugging and verbosity flags control visible output in the logs.
    TP.$DEBUG = TP.sys.cfg('tibet.$debug', false);
    TP.$VERBOSE = TP.sys.cfg('tibet.$verbose', false);
    TP.$$DEBUG = TP.sys.cfg('tibet.$$debug', false);
    TP.$$VERBOSE = TP.sys.cfg('tibet.$$verbose', false);

    TP.boot.$debug = TP.sys.cfg('boot.$debug', false);
    TP.boot.$verbose = TP.sys.cfg('boot.$verbose', false);
    TP.boot.$$debug = TP.sys.cfg('boot.$$debug', false);
    TP.boot.$$verbose = TP.sys.cfg('boot.$$verbose', false);

    //  one key thing regarding proper booting is that when we're not using
    //  twophase booting we'll set phasetwo to true at the configuration
    //  level so that no node filtering of phase two nodes is done. the
    //  result is that the system thinks we're in both phase one and phase
    //  two from a node filtering perspective
    TP.sys.setcfg('boot.phasetwo', TP.sys.cfg('boot.twophase') === false);

    // Reconfigure the color scheme based on any updates to the log colors.
    TP.boot.$$theme = {
        trace: TP.sys.cfg('log.color.trace'),
        info: TP.sys.cfg('log.color.info'),
        warn: TP.sys.cfg('log.color.warn'),
        error: TP.sys.cfg('log.color.error'),
        fatal: TP.sys.cfg('log.color.fatal'),
        severe: TP.sys.cfg('log.color.severe'),
        system: TP.sys.cfg('log.color.system'),

        time: TP.sys.cfg('log.color.time'),
        delta: TP.sys.cfg('log.color.delta'),
        slow: TP.sys.cfg('log.color.slow'),
        debug: TP.sys.cfg('log.color.debug'),
        verbose: TP.sys.cfg('log.color.verbose')
    };
};

//  ============================================================================
//  MANIFEST EXPANSION FUNCTIONS
//  ============================================================================

TP.boot.$ifUnlessPassed = function(aNode) {

    /**
     * @name $ifUnlessPassed
     * @summary Tests if and unless conditions on the node, returning true if
     *     the node passes and should be retained based on those conditions.
     *     This test is typically used to filter for the current browser
     *     environment based on TP.sys.isUA()-style tests.
     * @param {Node} aNode
     * @return {Boolean}
     */

    var j,
        condition,
        conditions,
        key,
        value,
        node,
        invalid;

    node = aNode;

    if (node.nodeType === Node.ELEMENT_NODE) {
        invalid = false;

        //  process any unless="a b c" entries on the node
        if ((condition = node.getAttribute('unless')) != null) {
            conditions = condition.split(' ');
            for (j = 0; j < conditions.length; j++) {
                key = TP.boot.$trim(conditions[j]);

                if (TP.boot.$$KV_REGEX.test(key)) {
                    key = key.split('=');
                    value = TP.boot.$getArgumentPrimitive(
                        TP.boot.$trim(key[1]));
                    key = TP.boot.$trim(key[0]);
                } else {
                    value = true;
                }

                //  special case for common filter based on TP.sys.isUA()
                if (TP.boot.$$USER_AGENT_REGEX.test(key)) {
                    condition = TP.sys.isUA.apply(this, key.split('.'));
                } else {
                    condition = TP.sys.cfg(key, TP.sys.env(key));
                }

                if (condition === value) {
                    invalid = true;
                    break;
                }
            }
        }

        //  process any if="a b c" entries on the node
        if ((condition = node.getAttribute('if')) != null) {
            conditions = condition.split(' ');
            for (j = 0; j < conditions.length; j++) {
                key = TP.boot.$trim(conditions[j]);

                if (TP.boot.$$KV_REGEX.test(key)) {
                    key = key.split('=');
                    value = TP.boot.$getArgumentPrimitive(
                        TP.boot.$trim(key[1]));
                    key = TP.boot.$trim(key[0]);
                } else {
                    value = true;
                }

                //  special case for common filter based on TP.sys.isUA()
                if (TP.boot.$$USER_AGENT_REGEX.test(key)) {
                    condition = TP.sys.isUA.apply(this, key.split('.'));
                } else {
                    condition = TP.sys.cfg(key, TP.sys.env(key));
                }

                if (TP.boot.$notValid(condition) || condition !== value) {
                    invalid = true;
                    break;
                }
            }
        }
    }

    return !invalid;
};

//  ----------------------------------------------------------------------------

TP.boot.$getElementCount = function(aNodeList) {

    /**
     * @name $getElementCount
     * @summary Returns the count of elements in a node list.
     * @param {Nodelist} aNodeList A native nodelist or array of nodes.
     * @return {Number} The number of element nodes in the list.
     */

    var node,
        count;

    count = 0;
    node = aNodeList[0];

    if (node.nodeType === Node.ELEMENT_NODE) {
        count++;
    }

    while ((node = node.nextSibling) != null) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            count++;
        }
    }

    return count;
};

//  ----------------------------------------------------------------------------

TP.boot.$uniqueNodeList = function(aNodeArray) {

    /**
     * @name $uniqueNodeList
     * @summary Removes any duplicates from the array provided so that
     *     subsequent loads of the list don't try to load things twice.
     * @param {Array } aNodeArray
     * @return {Array} The supplied Array of nodes filtered for duplicates.
     * @todo
     */

    var i,
        arr,
        dict,
        node,
        debug,
        len,
        key,
        src;

    debug = TP.sys.cfg('debug.node');
    arr = [];

    if (aNodeArray == null) {
        if (debug && TP.boot.$$verbose) {
            TP.boot.$stderr(
                    'TP.boot.$uniqueNodeList(): invalid node array.');
        }

        return arr;
    }

    dict = TP.boot.$$scripts;
    len = aNodeArray.length;

    for (i = 0; i < len; i++) {
        node = aNodeArray[i];

        if (node.nodeType === Node.ELEMENT_NODE) {
            switch (node.tagName.toLowerCase()) {
                case 'script':

                    //  not null, not empty string
                    if ((src = node.getAttribute('src')) != null) {
                        key = TP.boot.$uriExpandPath(src);

                        if (dict[key] == null) {
                            dict[key] = src;
                            arr.push(node);
                        } else {
                            if (debug && TP.boot.$$verbose) {
                                TP.boot.$stdout(
                                    TP.boot.$join(
                                        'TP.boot.$uniqueNodeList() ',
                                        'removing duplicate: ',
                                        src), TP.DEBUG);
                            }
                        }
                    } else {   //  null/empty means should have cdata
                        arr.push(node);
                    }

                    break;

                default:

                    //  echo and other tag names are pushed along
                    arr.push(node);

                    break;
            }
        }
    }

    return arr;
};

//  ============================================================================
//  LOCAL STORAGE
//  ============================================================================

/*
*/

//  ----------------------------------------------------------------------------

TP.$BOOT_STORAGE = null;
TP.$BOOT_STORAGE_TYPE = null;
TP.$BOOT_STORAGE_NAME = '$BOOT_STORAGE';

TP.$BOOT_STORAGE_LOCALSTORAGE = 1;

//  ----------------------------------------------------------------------------

TP.boot.$escapeStorageName = function(aName) {

    return aName.replace(/_/g, '__').replace(/ /g, '_s');
};

//  ----------------------------------------------------------------------------

TP.boot.$initializeLocalStorage = function() {

    /**
     * @name $initializeLocalStorage
     * @summary Initializes the 'local' storage mechanism (found on IE8, Safari
     *     4, and Firefox 3.5) and returns a storage wrapper object to be able
     *     to get/set/remove/removeAll objects from the storage.
     * @return {Object|null} The storage 'wrapper' object or null if the
     *     storage couldn't be initialized.
     */

    var internalStore,
            storageObj;

    internalStore = window.localStorage;

    if (TP.boot.$notValid(internalStore)) {
        return null;
    }

    storageObj =
    {
        internalStore: internalStore,

        //  10MB limit on IE, 5MB limit on Moz / Safari
        size: TP.sys.isUA('IE') ? 10 * 1024 * 1024 : 5 * 1024 * 1024,

        _formatKey: function(aKey) {

                    return TP.boot.$escapeStorageName(TP.$BOOT_STORAGE_NAME) +
                            '_' +
                            TP.boot.$escapeStorageName(aKey);
                },

        get: function(aKey, aCallbackFunction) {

                    var theKey;

                    theKey = this._formatKey(aKey);

                    aCallbackFunction(this.internalStore.getItem(theKey),
                                        aKey);

                    return this.internalStore.getItem(theKey);
                },

        set: function(aKey, aValue, aCallbackFunction) {

                    var theKey;

                    theKey = this._formatKey(aKey);

                    try {
                        this.internalStore.setItem(theKey, aValue);
                    } catch (e) {
                        if (/maximum size reached/.test(e.message)) {
                            //  turn off the cache
                            TP.sys.setcfg('boot.localcache', false);
                        }

                        TP.boot.$stderr('Storage Error: ' + e.message + '.',
                                        TP.boot.$ec(e));
                    }

                    aCallbackFunction(aValue, aKey);
                },

        remove: function(aKey, aCallbackFunction) {

                    var theKey,
                            currentValue;

                    theKey = this._formatKey(aKey);

                    currentValue = this.internalStore.getItem(theKey);
                    this.internalStore.removeItem(theKey);

                    aCallbackFunction(currentValue, aKey);
                },
        removeAll: function(aCallbackFunction) {

                    this.internalStore.clear();

                    aCallbackFunction();
                }
    };

    TP.$BOOT_STORAGE = storageObj;
    TP.$BOOT_STORAGE_TYPE = TP.$BOOT_STORAGE_LOCALSTORAGE;

    return storageObj;
};

//  ----------------------------------------------------------------------------

TP.boot.$setupDOMStorage = function() {

    /**
     * @name $setupDOMStorage
     * @summary Sets up the 'dom storage' - that is, the storage mechanism that
     *     allows TIBET to cache itself locally into a programmer-controlled
     *     cache.
     * @return {Boolean} Whether or not the dom storage could be set up.
     */

    if (TP.boot.$isValid(TP.$BOOT_STORAGE)) {
        return true;
    }

    return TP.boot.$isValid(TP.boot.$initializeLocalStorage());
};

//  ============================================================================
//  IMPORT FUNCTIONS
//  ============================================================================

/*
*/

//  ----------------------------------------------------------------------------

TP.boot.$sourceImport = function(jsSrc, targetDoc, srcUrl, aCallback,
                                    shouldThrow) {
    /**
     * @name $sourceImport
     * @summary Imports a script text which loads and integrates JS. This
     *     returns the script node used for the import. Note that the import
     *     call is synchronous, ensuring that the code is loaded prior to
     *     returning.
     * @param {String} jsSrc The JavaScript source to import.
     * @param {Document} targetDoc The HTML document that the script source will
     *     be imported into.
     * @param {String} srcUrl The source URL that the script came from (useful
     *     for debugging purposes). This defaults to 'inline' if its not
     *     supplied.
     * @param {Function} aCallback A function to invoke when done.
     * @param {Boolean} shouldThrow True to cause errors to throw a native Error
     *     so outer catch blocks will trigger.
     * @return {HTMLElement} The new 'script' element that was created to
     *     import the code.
     * @todo
     */

    var elem,
        result,

        scriptDoc,
        scriptHead,

        scriptUrl,

        tn;

    if (jsSrc == null) {
        if (srcUrl) {
            TP.boot.$stderr('Invalid script source. No content for ' +
                            TP.boot.$uriInTIBETFormat(srcUrl));
        } else {
            TP.boot.$stderr('Invalid script source.');
        }

        return null;
    }

    //  load the source the 'DOM way' so we get commented source
    elem = TP.boot.$$scriptTemplate.cloneNode(true);
    TP.boot.$loadNode = elem;

    //  ensure we keep track of the proper package/config information
    TP.boot.$loadNode.setAttribute('load_package',
                                    TP.sys.cfg('load.package', ''));
    TP.boot.$loadNode.setAttribute('load_config',
                                    TP.sys.cfg('load.config', ''));

    scriptDoc = TP.boot.$isValid(targetDoc) ?
                        targetDoc :
                        document;

    scriptHead = TP.boot.$isValid(targetDoc) ?
                        scriptDoc.getElementsByTagName('head')[0] :
                        TP.boot.$$head;

    scriptUrl = TP.boot.$isValid(srcUrl) ? srcUrl : 'inline';

    //  set a reference so when/if this errors out we'll get the right
    //  url reference
    TP.boot.$$onerrorURL = scriptUrl;

    try {
        if (TP.sys.isUA('IE')) {
            //  set the 'text' property of the new script element. this
            //  loads the code synchronously and makes it available to the
            //  system.
            elem.text = jsSrc;
        } else {
            tn = scriptDoc.createTextNode(jsSrc);
            TP.boot.$nodeAppendChild(elem, tn);
        }

        //  since we're not using the src attribute put the url on the
        //  source attribute, which TIBET uses as an alternative
        elem.setAttribute('source', scriptUrl);

        result = TP.boot.$nodeAppendChild(scriptHead, elem);
    } catch (e) {
        $ERROR = e;
    } finally {
        //  appends with source code that has syntax errors or other issues
        //  won't trigger Error conditions we can catch, but they will hit
        //  the onerror hook so we can check $STATUS and proceed from there.
        if ($ERROR) {
            if (shouldThrow) {
                throw $ERROR;
            }
        } else if (!result || $STATUS !== 0) {
            TP.boot.$loadNode = null;

            if (shouldThrow === true) {
                if (scriptUrl === 'inline') {
                    throw new Error('Import failed in: ' + jsSrc);
                } else {
                    throw new Error('Import failed for: ' + scriptUrl);
                }
            } else {
                if (scriptUrl === 'inline') {
                    TP.boot.$stderr('Import failed in: ' + jsSrc);
                } else {
                    TP.boot.$stderr('Import failed for: ' + scriptUrl);
                }
            }

            return null;
        }

        //  clear the onerror url reference
        TP.boot.$$onerrorURL = null;
    }

    //  if we were successful then invoke the callback function
    if (typeof(aCallback) === 'function') {
        aCallback(result, $STATUS !== 0);
    }

    return result;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriImport = function(targetUrl, aCallback, shouldThrow, isPackage) {

    /**
     * @name $uriImport
     * @summary Imports a target script which loads and integrates JS with the
     *     currently running "image".
     * @param {String} targetUrl URL of the target resource.
     * @param {Function} aCallback A function to invoke when done.
     * @param {Boolean} shouldThrow True to cause errors to throw a native Error
     *     so outer catch blocks will trigger.
     * @param {Boolean} isPackage True if the resource being imported is a
     *     package-level resource. This can impact cache storage logic.
     * @return {HTMLElement} The new 'script' element that was created to
     *     import the code.
     * @todo
     */

    var src,
        msg;

    if (targetUrl == null) {
        TP.boot.$stderr('InvalidURI');

        return null;
    }

    msg = 'Requested source URL not found: ';

    //  we pass actual responsibility for locating the source text to the
    //  uriLoad call, but we need to tell it that we're looking for source
    //  code so that it can make the proper decisions about cache lookup
    src = TP.boot.$uriLoad(targetUrl, TP.TEXT, 'source', true, isPackage);
    if (src == null) {
        if (shouldThrow === true) {
            throw new Error(msg + targetUrl + '.');
        } else if (shouldThrow === false) {
            //  if throw flag is explicitly false then we don't consider
            //  this to be an error, we just report it.
            TP.boot.$stdout(msg + targetUrl + '.', TP.DEBUG);
        } else {
            TP.boot.$stderr(msg + targetUrl + '.');
        }

        return null;
    }

    return TP.boot.$sourceImport(src, null, targetUrl,
                                    aCallback, shouldThrow);
};

//  ----------------------------------------------------------------------------

TP.boot.$importApplication = function() {

    /**
     * @name $importApplication
     * @summary Dynamically imports application content.
     * @description This method makes heavy use of the config/build file
     *     information to construct a list of script files and inline source
     *     code to import/execute to create a running application image in the
     *     browser. Note that this method 'chains' its parts via setTimeout so
     *     that interim output can be displayed. This helps to avoid long delays
     *     without user feedback.
     * @return {null}
     */

    TP.boot.$setStage('importing');

    TP.boot.$$importPhaseOne();

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$$importComplete = function() {

    /**
     * @name $$importComplete
     * @summary Finalizes an import sequence. Called internally by the
     *     $importComponents routine.
     * @return {null}
     */

    var stage,
        win;

    //  if we've been 'importing' and the list is now empty then we're
    //  done with whatever phase we've been processing
    stage = TP.boot.$getStage();
    if (stage === 'import_phase_one' || stage === 'import_phase_two') {

        //  if TIBET has already started then this import was being done
        //  after the initial boot process so we're finished. if we're
        //  still in the startup/boot phase we've got more to do
        if (TP.sys.hasLoaded() !== true) {
            //  when we boot in two phases we've got to be sure we keep
            //  things moving forward until the entire boot is complete
            if (TP.sys.cfg('boot.twophase') === true) {
                //  NOTE that this test relies on the hook file for a
                //  "phase two page" to _NOT_ update the cfg parameter.
                //  When they load these pages set a window global in
                //  the UI frame and queue a monitor to observe the boot
                if (TP.sys.cfg('boot.phasetwo') === true) {

                    //  if we had been processing phase two then we're
                    //  done and can trigger application startup
                    TP.boot.$stdout(
                            'Phase-two component loading complete.');

                    TP.sys.hasLoaded(true);
                    TP.boot.$setStage('import_complete');

                    return TP.boot.main();
                } else {
                    TP.boot.$stdout(
                            'Phase-one component loading complete.');

                    //  NOTE that this is a possible cul-de-sac since if
                    //  no phase two page ever loads we'll just sit.
                    //  TODO: trigger a boot timer here to force a timeout

                    //  basically the question is simply what happens last,
                    //  either we finish with phase one after the phase two
                    //  page has loaded, or we finish before it. if we
                    //  finish after it arrives we can just keep right on
                    //  moving, but we want to call the function in that
                    //  frame to ensure that the page initializes
                    win = TP.sys.getWindowById(TP.sys.cfg('tibet.uiroot'));

                    if (win) {
                        if (win.$$phasetwo === true ||
                            window.$$phasetwo === true) {
                            //  if the page didn't find TIBET the function
                            //  we want to call won't be configured, and we
                            //  do it manually
                            if (TP.boot.bootPhaseTwo) {
                                TP.boot.bootPhaseTwo();
                            } else {
                                TP.boot.initializeCanvas();
                                TP.boot.$$importPhaseTwo();
                            }

                            return;
                        }
                    } else {
                        //debugger;
                        void(0);
                    }

                    //  if we didn't find a phase two page waiting for us
                    //  then we'll just pause and wait for it. when it
                    //  arrives it will see that we're paused and it will
                    //  trigger the final phase of booting
                    TP.boot.$setStage('import_paused');
                }
            } else {
                //  if we've been booting in a single stage then we're
                //  done since all nodes are computed at one time. the
                //  next thing is to trigger the main function and get
                //  the application logic started
                TP.boot.$setStage('import_complete');

                return TP.boot.main();
            }
        } else {
            //  this branch is invoked when components load after the TIBET
            //  boot process has occurred, meaning any newly booted content
            //  is effectively an "add-on"...
            TP.boot.$stdout('Loading add-on components complete.');

            TP.boot.$setStage('import_complete');
        }

        //  turn off reporting to bootlog via TP.boot.$stderr.
        TP.boot.$stderr = TP.boot.STDERR_NULL;
    } else {
        //debugger;
        void(0);
    }

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$importComponents = function(loadSync) {

    /**
     * @name $importComponents
     * @summary Dynamically imports a set of application elements read from a
     *     list of 'bootnodes' configured by the invoking function. This boot
     *     node list is a shared property on TP.boot so only one import sequence
     *     can be running at a time. Normally you'd call importPackage instead
     *     of this routine to trigger imports.
     * @param {Boolean} loadSync Should the import be done synchronously or not?
     *     Default is false so that each file is loaded via a short setTimeout.
     * @return {null}
     * @todo
     */

    var j,
        tn,
        ch,
        msg,
        level,
        nd,
        callback,
        elem,
        srcpath,
        sync,
        len,
        image,
        logpackage,
        logpath,
        source,
        cache;

    TP.boot.$loadNode = null;
    TP.boot.$loadPath = null;
    TP.boot.$loadCached = null;

    if (TP.boot.shouldStop()) {
        return;
    }

    if (TP.boot.$$bootnodes == null) {
        if (TP.boot.$debug && TP.boot.$verbose) {
            TP.boot.shouldStop('invalid component list.');
            TP.boot.$stderr(
                'TP.boot.$importComponents() ' +
                'terminated: invalid component list.', TP.FATAL);
        }
        return;
    }

    //  NOTE the shared list and index access here. This solves some of the
    //  issues around async booting without using a closure to hold it all.
    nd = TP.boot.$$bootnodes[TP.boot.$$bootindex];

    //  if we're out of nodes we can wrap things up :)
    if (TP.boot.$$bootnodes.length === 0 || nd == null) {
        return TP.boot.$$importComplete();
    }

    //  default the first time through to whatever might be configured
    sync = (loadSync == null) ? TP.sys.cfg('tibet.sync') : loadSync;

    //  keep our value so we're consistent in phase two if we're twophase
    TP.boot.$$loadsync = sync;

    //  only handle four cases here: scripts, inline source, echo tags, and
    //  config scripts. the node array should have already been expanded to
    //  'flatten' packages into place.
    tn = nd.tagName.toLowerCase();

    logpackage = nd.getAttribute('load_package');
    if (logpackage) {
        logpackage = TP.boot.$uriInTIBETFormat(logpackage).replace(
                            '.xml', '');
    }

    if (tn === 'script') {
        //  first step is to configure for proper feedback, even when the
        //  node we're processing may be deferred.
        if ((srcpath = nd.getAttribute('src')) != null) {

            //  skip duplicate imports. this normally only happens if a script
            //  ends up in both phase one and phase two for some reason (usually
            //  oversight in not properly setting up phase filters in the
            //  package).
            if (TP.boot.$$scripts[srcpath]) {

                //  re-invoke manually so we move on to the next boot node
                TP.boot.$$bootindex += 1;
                TP.boot.$displayProgress();

                if (sync) {
                    TP.boot.$importComponents(sync);
                } else {
                    setTimeout(TP.boot.$$importAsync, 0);
                }
                return;

            } else {
                TP.boot.$$scripts[srcpath] = true;
            }

            //  update the script setting so we know who's current
            TP.boot.$$script = srcpath;

            //  adjust our log path to show shorthand package/config data
            logpath = TP.boot.$join(
                        logpackage,
                        '::' +
                        nd.getAttribute('load_config'),
                        ' ',
                        srcpath.slice(srcpath.lastIndexOf('/') + 1));

            //  ignore script nodes marked defer, they'll be dyna-loaded
            //  by TIBET on request
            if (TP.sys.cfg('boot.defer') === true &&
                (nd.getAttribute('defer') === 'true' ||
                nd.getAttribute('load_deferred') === 'true')) {
                if (TP.boot.$verbose) {
                    TP.boot.$stdout('Deferring ' + logpath, TP.DEBUG);
                } else {
                    TP.boot.$stdout('Deferring ' + srcpath, TP.DEBUG);
                }

                //  re-invoke manually so we move on to the next boot node
                TP.boot.$$bootindex += 1;
                TP.boot.$displayProgress();

                if (sync) {
                    TP.boot.$importComponents(sync);
                } else {
                    setTimeout(TP.boot.$$importAsync, 0);
                }

                return;
            }
        } else {   //  tibet:script with inline code
            //  update the script setting so we know who's current
            TP.boot.$$script = 'inline';

            //  adjust our log path to show shorthand package/config data
            logpath = TP.boot.$join(logpackage,
                            '::',
                            nd.getAttribute('load_config'),
                            ' inline <', tn, '> source');
        }

        //  if we've reached this point then we're not deferring the node so
        //  get the logging and prep work done in anticipation of having the
        //  source to actually load. Doing this here avoids having to have
        //  an overly complex callback function when we've got to go over
        //  the wire to get the actual source before we can import.
        TP.boot.$stdout('Loading ' + (srcpath ? srcpath : logpath),
            TP.DEBUG);

        //  trigger the appropriate "will" hook
        if (srcpath) {
            TP.boot.$loadPath = srcpath;
            TP.boot.$$loadpaths.push(srcpath);
        } else {
            TP.boot.$loadPath = null;
        }

        //  set the configuration values so the sourceImport call will have
        //  the information from the current node being processed
        TP.sys.setcfg('load.package',
                        nd.getAttribute('load_package') || '');
        TP.sys.setcfg('load.config',
                        nd.getAttribute('load_config') || '');

        //  In some sense the rest of this is all about getting the source
        //  code to import, either inlined, from the local cache, or from
        //  the original location, in either condensed or commented format.
        //  Once the source is available we can then treat it consistently
        //  by invoking the sourceImport call to do the actual work.

        if ((srcpath = nd.getAttribute('src')) != null) {
            //  debuggers like Firebuggy have issues with script nodes that
            //  have inline source instead of file references (or they did
            //  at the time of this writing) so we allow for the option to
            //  do dom-based import here to support source-level debugging
            //  to occur. we'll keep our comments about buggy debuggers to
            //  ourselves...mostly.
            if (TP.sys.cfg('import.usingdom')) {
                elem = TP.boot.$$scriptTemplate.cloneNode(true);
                elem.setAttribute(
                            'load_package',
                            nd.getAttribute('load_package') || '');
                elem.setAttribute(
                            'load_config',
                            nd.getAttribute('load_config') || '');

                TP.boot.$loadNode = elem;

                callback = function(event) {


                    TP.boot.$loadNode = null;

                    TP.boot.$$bootindex += 1;
                    TP.boot.$displayProgress();

                    if (sync) {
                        TP.boot.$importComponents(sync);
                    } else {
                        setTimeout(TP.boot.$$importAsync, 0);
                    }
                };

                if (TP.sys.isUA('IE')) {
                    elem.onreadystatechange = function() {

                        if (elem.readyState === 'loaded' ||
                            elem.readyState === 'complete') {
                            callback();
                        }
                    };
                } else {
                    elem.onload = callback;
                }

                if (TP.sys.cfg('import.check_404')) {
                    if (!TP.boot.$uriExists(TP.boot.$loadPath)) {
                        TP.boot.$stderr('404 (Not Found): ' +
                            TP.boot.$loadPath);
                        return;
                    }
                }

                elem.setAttribute('src', TP.boot.$loadPath);

                //  append it into the 'head' element so that it starts the
                //  loading process. If there is an error, it will be
                //  reported via the 'onerror' hook.
                TP.boot.$nodeAppendChild(TP.boot.$$head, elem);
                //TP.boot.$$head.appendChild(elem);

                return;
            }

            //  if source is local, remote, or modified no node-specific
            //  data is necessary to determine cacheability, but when we're
            //  in marked mode we have to look at the node to see if it's
            //  listed for refresh or not.
            cache = true;
            if (TP.sys.cfg('import.source') === 'marked') {
                //  TODO:   do we want to use a different attribute name
                //  here? or perhaps require a version string match?
                if (nd.getAttribute('refresh') !== 'true') {
                    cache = false;
                }
            }
            source = TP.boot.$uriLoad(TP.boot.$loadPath, TP.TEXT,
                                        'source', cache);
        } else {
            source = '';

            //  inline source code...NOTE that we don't normalize because if
            //  we do that some browsers like to replace CDATA sections with
            //  text nodes in a blatant disregard for standards.
            len = nd.childNodes.length;
            for (j = 0; j < len; j++) {
                ch = nd.childNodes[j];

                if (ch.nodeType === Node.CDATA_SECTION_NODE) {
                    source += ch.nodeValue || '';
                    source = TP.boot.$trim(source);
                }
            }
        }

        //  if we were handling inline code or code we found in the cache
        //  then we can import it directly now.
        try {
            TP.boot.$sourceImport(source, null, TP.boot.$loadPath);
        } catch (e) {
            //  Required for IE
        } finally {
            TP.boot.$loadNode = null;
        }

    } else if (tn === 'tibet_image') {
        //  preload images if we're configured to do that
        if (TP.sys.cfg('boot.import_images')) {
            if ((srcpath = nd.getAttribute('src')) != null) {
                logpath = TP.boot.$join(
                        logpackage,
                        '::',
                        nd.getAttribute('load_config'),
                        ' ',
                        srcpath.slice(srcpath.lastIndexOf('/') + 1));

                TP.boot.$stdout('Preloading image ' + logpath, TP.DEBUG);

                image = new Image();
                image.src = srcpath;
            }
        }
    } else if (tn === 'echo') {
        //  note we do these regardless of debug/verbose settings

        level = 1 * (nd.getAttribute('level') || TP.boot.INFO);

        //  first check for content as an attribute
        if ((msg = nd.getAttribute('message')) != null) {
            TP.boot.$stdout(msg, level);
        } else {
            //  no attribute content, must be inside the tag
            nd.normalize();
            msg = '';

            if (nd.firstChild != null) {
                msg = nd.firstChild.nodeValue || '';
                msg = TP.boot.$trim(msg);
            }

            TP.boot.$stdout(msg, level);
        }

    } else {
        //  unsupported tag name, for now we'll just ignore it
        void(0);
    }

    //  reset the script setting
    TP.boot.$$script = null;

    //  re-invoke manually so we move on to the next boot node
    TP.boot.$$bootindex += 1;
    TP.boot.$displayProgress();

    if (sync) {
        TP.boot.$importComponents(sync);
    } else {
        setTimeout(TP.boot.$$importAsync, 0);
    }

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$$importPhase = function() {

    var package,
        config,
        nodelist;

    // Get the list of filtered nodes by listing the assets. This action causes
    // whatever config is in place to be used to filter the expanded package.

    package = TP.boot.$$bootfile;
    config = TP.sys.cfg('boot.config');

    nodelist = TP.boot.$listPackageAssets(package, config);

    // remaining list is our workload for actual importing
    TP.boot.$stdout('Importing ' + nodelist.length + ' components.',
                   TP.SYSTEM);

    TP.boot.$$bootnodes = nodelist;
    TP.boot.$$bootindex = 0;

    TP.boot.$$workload = nodelist.length;

    //  TODO: this should happen based on a return value being provided.
    window.$$phasetwo = true;

    TP.boot.$importComponents();
/*

    TP.boot.$$importComplete();
*/

};

//  ----------------------------------------------------------------------------

TP.boot.$$importPhaseOne = function() {

    /**
     * @name $$importPhaseOne
     * @summary Imports any elements of the original boot file/config that were
     *     specific to phase one.
     * @return {Number} The number of phase one nodes imported.
     */

    TP.boot.$setStage('import_phase_one');

    //  always phaseone here, phasetwo is set to filter out phase-two nodes
    //  when we're not doing two-phased booting so we get all nodes.
    TP.sys.setcfg('boot.phaseone', true);
    TP.sys.setcfg('boot.phasetwo', TP.sys.cfg('boot.twophase') === false);

    TP.boot.$$importPhase();

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$$importPhaseTwo = function(manifest) {

    /**
     * @name $$importPhaseTwo
     * @summary Imports any elements of the original boot file/config that were
     *     specific to phase two.
     * @return {Number} The number of phase two nodes imported.
     */

    if (TP.sys.cfg('boot.twophase') !== true) {
        return;
    }

    TP.boot.$setStage('import_phase_two');

    //  update our configuration to reflect our new state or the import
    //  will continue to filter out phase-two nodes
    TP.sys.setcfg('boot.phaseone', false);
    TP.sys.setcfg('boot.phasetwo', true);

    TP.boot.$$importPhase();

    return;
};

//  ============================================================================
//  5.0 IMPORT FUNCTIONS
//  ============================================================================

TP.boot.$config = function() {

    /**
     * @name $config
     * @summary Configures various aspects of the boot system prior to final
     * expansion and importing of the application's components.
     * @todo
     */

    TP.boot.$setStage('configuring');

    //  loads the bootstrap file which typically contains profile and lib_root
    //  data. with those two values the system can find the primary package and
    //  configuration that will ultimately drive what we load.
    TP.boot.$configureBootstrap();

    // Update any cached variable content. We do this each time we've read in
    // new configuration values regardless of their source.
    TP.boot.$updateDependentVars();

    //  find and initially process the boot package/config we'll be booting.
    TP.boot.$configurePackage();

    // Update any cached variable content. We do this each time we've read in
    // new configuration values regardless of their source.
    TP.boot.$updateDependentVars();

    //  setup any local cache storage and adjust settings for import/export
    TP.boot.$configureLocalCache();

    //  ensure we know what the proper package config value is going to be
    TP.boot.$configureTarget();

    //  set project.* properties necessary for final startup of the UI.
    TP.boot.$configureProject();

    //  log the environment settings.
    if (TP.sys.cfg('log.bootenv')) {
        TP.boot.$stdout(TP.sys.cfg('boot.uichunked'), TP.DEBUG);
        TP.boot.$stdout('TIBET Environment Variables', TP.DEBUG);
        TP.boot.$stdout(TP.sys.cfg('boot.uichunked'), TP.DEBUG);
        TP.boot.$stdout(TP.sys.environment, TP.DEBUG);
    }

    //  log configuration settings and any overrides from the user.
    if (TP.sys.cfg('log.bootcfg')) {
        TP.boot.$stdout(TP.sys.cfg('boot.uichunked'), TP.DEBUG);
        TP.boot.$stdout('TIBET Configuration Variables', TP.DEBUG);
        TP.boot.$stdout(TP.sys.cfg('boot.uichunked'), TP.DEBUG);
        TP.boot.$stdout(TP.sys.configuration, TP.DEBUG);

        TP.boot.$stdout(TP.sys.cfg('boot.uichunked'), TP.DEBUG);
        TP.boot.$stdout('TIBET Configuration Overrides', TP.DEBUG);
        TP.boot.$stdout(TP.sys.cfg('boot.uichunked'), TP.DEBUG);
        TP.boot.$stdout(TP.sys.overrides, TP.DEBUG);
    }

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$expand = function() {

    var file,
        config;

    TP.boot.$setStage('expanding');

    file = TP.boot.$$bootfile;
    config = TP.sys.cfg('boot.config');

    TP.boot.$stdout('Expanding package#config: ' + file + '#' + config,
                   TP.DEBUG);
    TP.boot.$expandPackage(file, config);

    return;
};

//  ----------------------------------------------------------------------------
//  ----------------------------------------------------------------------------
//  ----------------------------------------------------------------------------
//  ----------------------------------------------------------------------------

TP.boot.$$configs = [];
TP.boot.$$packageStack = [];

TP.boot.$$assets = {};
TP.boot.$$packages = {};
TP.boot.$$paths = {};

TP.boot.$$assets_list = null;


/**
 * Expands a single package configuration, resolving any embedded package
 * references and virtual paths which might be included.
 * @param {Element} anElement The config node to process and expand.
 */
TP.boot.$expandConfig = function(anElement) {

    var list;

    list = Array.prototype.slice.call(anElement.childNodes, 0);
    list.forEach(function(child) {

        var ref,
            src,
            config,
            key,
            name,
            elem,
            value,
            level,
            text,
            msg,
            str,
            doc;

        if (child.nodeType === 1) {

            switch (child.tagName) {
                case 'config':
                    ref = child.getAttribute('ref');
                    ref = TP.boot.$expandReference(ref);
                    config = TP.boot.$documentGetElementById(
                        anElement.ownerDocument, ref);
                    if (TP.boot.$notValid(config)) {
                        throw new Error('<config> not found: ' +
                            TP.boot.$getCurrentPackage() + '#' + ref);
                    }

                    key = TP.boot.$getCurrentPackage() + '#' + ref;
                    if (TP.boot.$$configs.indexOf(key) !== -1) {
                        // A duplicate/circular reference of some type.
                        TP.boot.$stderr(
                            'Ignoring duplicate reference to: ' + key);
                        break;
                    }

                    TP.boot.$$configs.push(key);
                    TP.boot.$expandConfig(config);

                    break;
                case 'echo':
                    value = child.getAttribute('message');
                    if (TP.boot.$isEmpty(value)) {
                        try {
                            child.normalize();
                            text = child.childNodes[0];
                            value = text.data;
                        } catch (e) {
                            throw new Error('Unable to find message: ' +
                                TP.boot.$nodeAsString(child));
                        }
                    }

                    level = child.getAttribute('level');
                    if (TP.boot.$notEmpty(level)) {
                        level = ', ' + level;
                    } else {
                        level = '';
                    }

                    try {
                        str = '<script><![CDATA[' +
                            'TP.boot.$stdout(\'' +
                                value.replace(/'/g, '\'') +
                            '\'' + level + ');' +
                            ']]></script>';
                        doc = TP.boot.$documentFromString(str);
                        elem = doc.childNodes[0];

                        value = child.getAttribute('if');
                        if (TP.boot.$notEmpty(value)) {
                            elem.setAttribute('if', value);
                        }

                        value = child.getAttribute('unless');
                        if (TP.boot.$notEmpty(value)) {
                            elem.setAttribute('unless', value);
                        }

                        child.parentNode.replaceChild(elem, child);

                    } catch (e) {
                        msg = e.message;
                        throw new Error('Error expanding: ' +
                            TP.boot.$nodeAsString(child) +
                            msg);
                    }

                    break;
              case 'img':
                    // similar to default case but we need to avoid messing with
                    // data urls.
                    src = child.getAttribute('src');
                    if (TP.boot.$notEmpty(src) && src.indexOf('data:') !== 0) {
                        src = TP.boot.$getFullPath(child, src);
                        child.setAttribute('src', src);
                    }
                    break;
                case 'package':
                    src = child.getAttribute('src');
                    src = TP.boot.$getFullPath(child, src);
                    child.setAttribute('src', src);

                    config = child.getAttribute('config');
                    if (TP.boot.$notEmpty(config)) {
                        config = TP.boot.$expandReference(config);
                        child.setAttribute('config', config);
                    }

                    key = src + '#' + config;
                    if (TP.boot.$$configs.indexOf(key) !== -1) {
                        // A duplicate/circular reference of some type.
                        TP.boot.$stderr(
                            'Ignoring duplicate reference to: ' + key);
                        break;
                    }

                    TP.boot.$$configs.push(key);
                    TP.boot.$expandPackage(src, config);

                    break;
                case 'property':
                    name = child.getAttribute('name');
                    value = child.getAttribute('value');

                    if (TP.boot.$notEmpty(name) && TP.boot.$notEmpty(value)) {
                        value = TP.boot.$getArgumentPrimitive(value);
                        if (typeof value === 'string') {
                            value = TP.boot.$quoted(value);
                        }
                        try {
                            str = '<script><![CDATA[' +
                                'TP.sys.setcfg(' +
                                '\'' + name + '\', ' + value +
                                ');' +
                                ']]></script>';
                            doc = TP.boot.$documentFromString(str);
                            elem = doc.childNodes[0];

                            value = child.getAttribute('if');
                            if (TP.boot.$notEmpty(value)) {
                                elem.setAttribute('if', value);
                            }

                            value = child.getAttribute('unless');
                            if (TP.boot.$notEmpty(value)) {
                                elem.setAttribute('unless', value);
                            }

                            child.parentNode.replaceChild(elem, child);

                        } catch (e) {
                            msg = e.message;
                            throw new Error('Error expanding: ' +
                                TP.boot.$nodeAsString(child) +
                                msg);
                        }
                    }

                    break;
                case 'script':
                    /* falls through */
                case 'style':
                    /* falls through */
                case 'template':
                    /* falls through */
                default:
                    src = child.getAttribute('href');
                    if (TP.boot.$notEmpty(src)) {
                        src = TP.boot.$getFullPath(child, src);
                        child.setAttribute('href', src);
                    }
                    src = child.getAttribute('src');
                    if (TP.boot.$notEmpty(src)) {
                        src = TP.boot.$getFullPath(child, src);
                        child.setAttribute('src', src);
                    }
                    break;
            }
        }
    });
};


/**
 * Expands a package, resolving any embedded package references and virtual
 * paths which might be included.
 * @param {String} aPath The path to the package manifest file to be processed.
 * @param {String} aConfig The config ID within the package to be expanded.
 * @return {Document} An xml document containing the expanded configuration.
 */
TP.boot.$expandPackage = function(aPath, aConfig) {

    var expanded,   // The expanded path equivalent.
        doc,        // The xml DOM document object after parse.
        config,     // The ultimate config ID being used.
        node,       // Result of searching for our config by ID.
        package,    // The package node from the XML doc.
        msg;        // Error message construction variable.

    expanded = TP.boot.$isEmpty(aPath) ? TP.sys.cfg('boot.package') : aPath;
    expanded = TP.boot.$expandPath(expanded);

    TP.boot.$pushPackage(expanded);

    try {
        // If we've been through this package once before we can skip reading
        // and parsing the XML and jump directly to processing the config.
        doc = TP.boot.$$packages[expanded];
        if (!doc) {

            doc = TP.boot.$uriLoad(expanded, TP.DOM, 'manifest', true);
            if (!doc) {
                throw new Error('Unable to read package: ' + expanded);
            }

            TP.boot.$$packages[expanded] = doc;
        }

        // If the package isn't valid stop right here.
        package = doc.getElementsByTagName('package')[0];
        if (TP.boot.$notValid(package)) {
            return;
        }

        // Verify package has a name and version, otherwise it's not valid.
        if (TP.boot.$isEmpty(package.getAttribute('name'))) {
            throw new Error('Missing name on package: ' +
                TP.boot.$nodeAsString(package));
        }

        if (TP.boot.$isEmpty(aConfig)) {
            config = TP.boot.$getDefaultConfig(doc);
        } else {
            config = aConfig;
        }

        node = TP.boot.$documentGetElementById(doc, config);
        if (!node) {
            throw new Error('<config> not found: ' +
                TP.boot.$getCurrentPackage() + '#' + config);
        }

        // Note that this may ultimately result in calls back into this routine
        // if the config in question has embedded package references.
        TP.boot.$expandConfig(node);
    } catch (e) {
        msg = e.message;
        throw new Error('Error expanding package: ' + expanded + '. ' + msg);
    } finally {
        TP.boot.$popPackage();
    }

    return doc;
};


/**
 * Expands a TIBET virtual path to its equivalent non-virtual path.
 * @param {String} aPath The path to be expanded.
 * @return {String} The fully-expanded path value.
 */
TP.boot.$expandPath = function(aPath) {

    var path,
        parts,
        virtual;

    // If we've done this one before just return it.
    path = TP.boot.$$paths[aPath];
    if (path) {
        return path;
    }

    // TIBET virtual paths all start with '~'
    if (aPath.indexOf('~') === 0) {

        if (aPath === '~') {
            return TP.boot.$getAppHead();
        } else if (aPath === '~app' ||
                   aPath === '~app_root') {
            return TP.boot.$getAppRoot();
        } else if (aPath === '~tibet' ||
                   aPath === '~lib' ||
                   aPath === '~lib_root') {
            return TP.boot.$getLibRoot();
        } else {
            parts = aPath.split('/');
            virtual = parts.shift();

            // If the path was ~/...something it's app_root prefixed.
            if (virtual === '~') {
                path = TP.boot.$getAppHead();
            } else if (virtual === '~app' ||
                virtual === '~app_root') {
                path = TP.boot.$getAppRoot();
            } else if (virtual === '~tibet' ||
                       virtual === '~lib' ||
                       virtual === '~lib_root') {
                path = TP.boot.$getLibRoot();
            } else {
                // Keys are of the form: path.app_root etc. so adjust.
                path = TP.sys.cfg('path.' + virtual.slice(1));
                if (!path) {
                    throw new Error('Virtual path not found: ' + virtual);
                }
            }

            parts.unshift(path);
            path = parts.join('/');
        }

        // Paths can expand into other virtual paths, so keep going until we
        // no longer get back a virtual path.
        if (path.indexOf('~') === 0) {
            if (path === aPath) {
                throw new Error('Virtual path is circular: ' + path);
            } else {
                path = TP.boot.$expandPath(path);
            }
        }

    } else {
        path = aPath;
    }

    // Cache the result so we avoid doing any path more than once.
    TP.boot.$$paths[aPath] = path;

    return path;
};


/**
 * Looks up a configuration reference and provides its value. This routine is
 * specifically concerned with expanding embedded property references from
 * TIBET's setcfg/getcfg operations. For command-line processing the values
 * should be provided to the instance when it is created.
 * @param {String} aRef A potential property value reference to expand.
 * @return {String} The expanded value, or the original string value.
 */
TP.boot.$expandReference = function(aRef) {

    var ref;

    if (aRef && aRef.indexOf('{') === 0) {
        ref = TP.sys.cfg(aRef.slice(1, -1));
        if (TP.boot.$isEmpty(ref)) {
            TP.boot.$stderr('Unresolved property reference: ' + aRef);
            return aRef;
        }
        return ref;
    } else {
        return aRef;
    }
};


/**
 * Returns the file name of the currently processing package.
 * @return {string} The package file name.
 */
TP.boot.$getCurrentPackage = function() {
    return TP.boot.$$packageStack[0];
};


/**
 * Returns the default configuration from the package document provided.
 * @param {Document} aPackageDoc The XML package document to use for defaulting.
 * @return {String} The configuration ID which is the default.
 */
TP.boot.$getDefaultConfig = function(aPackageDoc) {

    var package;

    package = aPackageDoc.getElementsByTagName('package')[0];
    if (TP.boot.$notValid(package)) {
        throw new Error('<package> tag missing.');
    }
    // TODO: make this default of 'base' a constant?
    return package.getAttribute('default') || 'base';
};


/**
 * Returns a full path by using any basedir information in anElement and
 * blending it with any virtual or relative path information from aPath.
 * @param {Element} anElement The element from which to begin basedir lookups.
 * @param {String} aPath The path to resolve into a full path.
 * @return {string} The fully-expanded path.
 */
TP.boot.$getFullPath = function(anElement, aPath) {

    var elem,
        base;

    if (TP.boot.$isEmpty(aPath)) {
        return;
    }

    if (TP.boot.$uriIsVirtual(aPath)) {
        return TP.boot.$uriExpandPath(aPath);
    }

    if (TP.boot.$uriIsAbsolute(aPath)) {
        return aPath;
    }

    elem = anElement;
    while (elem) {
        base = elem.getAttribute('basedir');
        if (TP.boot.$notEmpty(base)) {
            return TP.boot.$uriExpandPath(TP.boot.$uriJoinPaths(base, aPath));
        }
        elem = elem.parentNode;
    }
};


/**
 * Returns true if the element's tag name passes any asset-type filtering which
 * is in place. Asset filtering is done via tag name.
 * @param {Element} anElement The element to filter.
 */
TP.boot.$ifAssetPassed = function(anElement) {
    var tag,
        result;

    tag = anElement.tagName;

    // No assets option? Not filtering.
    if (TP.boot.$isEmpty(TP.sys.cfg('boot.assets'))) {
        return true;
    }

    // Can't traverse if we don't always clear these two.
    if (tag === 'package' || tag === 'config') {
        return true;
    }

    if (TP.boot.$notValid(TP.boot.$$assets_list)) {
        TP.boot.$$assets_list = TP.boot.$$assets.split(' ');
    }

    result = TP.boot.$$assets_list.indexOf(tag) !== -1;

    return result;
};


/**
 */
TP.boot.$ifUnlessPassedLite = function(anElement) {

    /**
     * Tests if and unless conditions on the node, returning true if the node
     * passes and should be retained based on those conditions.
     * @param {Node} anElement The element to test.
     * @return {Boolean} True if the element passes the filtering tests.
     */

    var i,
        condition,
        conditions,
        key,
        invalid;

    invalid = false;

    //  process any unless="a b c" entries on the element
    condition = anElement.getAttribute('unless');
    if (TP.boot.$notEmpty(condition)) {
        conditions = condition.split(' ');
        for (i = 0; i < conditions.length; i++) {
            key = conditions[i].trim();
            condition = TP.sys.cfg(key);
            if (condition === true) {
                invalid = true;
                break;
            }
        }
    }

    //  process any if="a b c" entries on the element
    condition = anElement.getAttribute('if');
    if (TP.boot.$notEmpty(condition)) {
        conditions = condition.split(' ');
        for (i = 0; i < conditions.length; i++) {
            key = conditions[i].trim();

            condition = TP.sys.cfg(key);
            if (TP.boot.$notValid(condition) || condition === false) {
                invalid = true;
                break;
            }
        }
    }

    return !invalid;
};


/**
 * Lists assets from a package configuration. The assets will be concatenated
 * into aList if the list is provided (aList is used during recursive calls from
 * within this routine to build up the list).
 * @param {Element} anElement The config element to begin listing from.
 * @param {Array.<>} aList The array of asset descriptions to expand upon.
 * @return {Array.<>} The asset array.
 */
TP.boot.$listConfigAssets = function(anElement, aList) {

    var list,
        result;

    // If aList is empty we're starting fresh which means we need a fresh
    // asset-uniquing dictionary.
    if (TP.boot.$notValid(aList)) {
        TP.boot.$$assets = {};
    }
    result = aList || [];

    // Don't assume the config itself shouldn't be filtered.
    if (!TP.boot.$ifUnlessPassed(anElement)) {
        return result;
    }

    list = Array.prototype.slice.call(anElement.childNodes, 0);
    list.forEach(function(child) {

        var ref,
            src,
            config;

        if (child.nodeType === 1) {

            if (!TP.boot.$ifUnlessPassed(child)) {
                return;
            }

            if (!TP.boot.$ifAssetPassed(child)) {
                return;
            }

            switch (child.tagName) {
                case 'config':
                    ref = child.getAttribute('ref');

                    config = TP.boot.$documentGetElementById(
                        anElement.ownerDocument, ref);
                    if (TP.boot.$notValid(config)) {
                        throw new Error('<config> not found: ' + ref);
                    }
                    TP.boot.$listConfigAssets(config, result);
                    break;
                case 'echo':
                    // Shouldn't exist, these should have been converted into
                    // <script> tags calling TP.boot.$stdout.
                    break;
                case 'package':
                    src = child.getAttribute('src');
                    config = child.getAttribute('config');

                    if (TP.boot.$isEmpty(src)) {
                        throw new Error('<package> missing src: ' +
                            TP.boot.$nodeAsString(child));
                    }

                    TP.boot.$listPackageAssets(src, config, result);
                    break;
                case 'property':
                    child.setAttribute('load_package',
                        TP.boot.$getCurrentPackage());
                    child.setAttribute('load_config',
                        anElement.getAttribute('id'));
                    result.push(child);
                    break;
                case 'img':
                    /* falls through */
                case 'script':
                    /* falls through */
                case 'style':
                    /* falls through */
                case 'template':
                    /* falls through */
                default:
                    src = child.getAttribute('src') ||
                        child.getAttribute('href');
                    if (TP.boot.$notEmpty(src)) {
                        // Unique the things we push by checking and caching
                        // entries as we go.
                        if (TP.boot.$notValid(TP.boot.$$assets[src])) {
                            TP.boot.$$assets[src] = src;
                            child.setAttribute('load_package',
                                TP.boot.$getCurrentPackage());
                            child.setAttribute('load_config',
                                anElement.getAttribute('id'));
                            result.push(child);
                        } else {
                            TP.boot.$stdout('Skipping duplicate asset: ' + src,
                                           TP.WARN);
                        }
                    } else {
                        child.setAttribute('load_package',
                            TP.boot.$getCurrentPackage());
                        child.setAttribute('load_config',
                            anElement.getAttribute('id'));
                        result.push(child);
                    }
                    break;
            }
        }
    });

    return result;
};


/**
 * Lists assets from a package configuration. The assets will be concatenated
 * into aList if the list is provided (aList is used during recursive calls from
 * within this routine to build up the list).
 * @param {string} aPath The path to the package manifest to list.
 * @param {string} aConfig The ID of the config in the package to list.
 * @param {Array.<>} aList The array of asset descriptions to expand upon.
 * @return {Array.<>} The asset array.
 */
TP.boot.$listPackageAssets = function(aPath, aConfig, aList) {

    var path,
        config,
        doc,
        node,
        result;

    path = TP.boot.$isEmpty(aPath) ? TP.sys.cfg('boot.package') : aPath;
    path = TP.boot.$expandPath(path);

    TP.boot.$pushPackage(path);

    try {
        doc = TP.boot.$$packages[path];
        if (TP.boot.$notValid(doc)) {
            throw new Error('Can not list unexpanded package: ' + aPath);
        }

        // Determine the configuration we'll be listing.
        if (TP.boot.$isEmpty(aConfig)) {
            config = TP.boot.$getDefaultConfig(doc);
        } else {
            config = aConfig;
        }

        node = TP.boot.$documentGetElementById(doc, config);
        if (TP.boot.$notValid(node)) {
            throw new Error('<config> not found: ' + path + '#' + config);
        }

        // If aList is empty we're starting fresh which means we need a fresh
        // asset-uniquing dictionary.
        if (!aList) {
            TP.boot.$$assets = {};
        }
        result = aList || [];
        TP.boot.$listConfigAssets(node, result);
    } finally {
        TP.boot.$popPackage(aPath);
    }

    return result;
};


/**
 * Pops an entry off the current stack of packages which are being processed as
 * part of an expansion.
 */
TP.boot.$popPackage = function() {
    return TP.boot.$$packageStack.shift();
};


/**
 * Pushes a package path onto the currently processing package name stack.
 * @param {string} aPath The package's full path.
 */
TP.boot.$pushPackage = function(aPath) {
    TP.boot.$$packageStack.unshift(aPath);
};


//  ----------------------------------------------------------------------------
//  ----------------------------------------------------------------------------
//  ----------------------------------------------------------------------------
//  ----------------------------------------------------------------------------

TP.boot.$import = function() {

    TP.boot.$setStage('importing');

    // Clear script dictionary. This will be used to unique across all imports.
    TP.boot.$$scripts = {};

    TP.boot.$$importPhaseOne();

    return;
};

//  ============================================================================
//  BOOT FUNCTIONS
//  ============================================================================

TP.boot.boot = function() {

    /**
     * @name boot
     * @summary Triggers the actual boot process. This function is typically
     *     invoked by the launch() function after all pre-configuration work has
     *     been completed and the boot UI elements have been found/initialized.
     * @todo
     */

    //  perform any additional configuration work necessary before we boot.
    TP.boot.$config();

    //  expand the manifest in preparation for importing components.
    TP.boot.$expand();

    //  import based on expanded package. startup is invoked once the async
    //  import process completes.
    TP.boot.$import();

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.launch = function(options) {

    /**
     * @name launch
     * @summary Launches a new TIBET application. By default TIBET launches with
     *     the boot console visible, without using a login page, and assuming
     *     defaults for all other boot-prefixed startup parameters. The options
     *     here allow you to change any setting you like, however these settings
     *     are overridden by any placed on the URL unless you specify nourlargs
     *     in this option list (which is useful in certain production setups).
     * @param {Object} options A set of options which control the boot process.
     *     Common keys used by this function include 'uselogin' and 'parallel'.
     *     Other keys are passed through to boot(), config() et al.
     * @return {Window} The window the application launched in.
     * @todo
     */

    var nologin;

    TP.boot.$$launchOptions = options;

    //  set up the environment variables appropriate for the browser. this
    //  information can then help drive the remaining parts of the process
    TP.boot.$configureEnvironment();

    //  Process each option provided as a configuration parameter setting.
    //  NOTE that this has to happen before we setStage since that triggers
    //  things like app_root and lib_root computations which must be allowed to
    //  vary via launch options.
    if (options) {
        TP.boot.$$configureOverrides(options);
        TP.boot.$updateDependentVars();
    }

    //TP.boot.$stdout(TP.sys.cfg('boot.uisection'), TP.SYSTEM);
    TP.boot.$stdout('TIBET Boot System (TBS) v' + TP.boot.$bootversion,
                    TP.SYSTEM);
    //TP.boot.$stdout(TP.sys.cfg('boot.uisection'), TP.SYSTEM);

    try {
        //  set the initial stage. this will also capture a start time.
        TP.boot.$setStage('prelaunch');
    } catch (e) {
        if (window.location.protocol.indexOf('file') === 0) {
            // File launch issue.
            if (TP.sys.isUA('chrome')) {
                TP.boot.$stderr(
                    'File launch aborted. ' +
                    'On Chrome you need to start the browser with ' +
                    'the --allow-file-access-from-files flag.',
                    TP.FATAL);
            } else if (TP.sys.isUA('firefox')) {
                TP.boot.$stderr(
                    'File launch aborted. ' +
                    'On Firefox you must set the config flag ' +
                    '\'security.fileuri.strict_origin_policy\' to false,' +
                    ' via about:config, quit the browser and restart.',
                    TP.FATAL);
            } else {
                TP.boot.$stderr(
                    'File launch aborted. Check browser security settings.',
                    TP.FATAL);
            }
            return;
        }
    }

    // If the browser is considered obsolete we can stop right now.
    if (TP.sys.isObsolete()) {
        TP.boot.$stderr('Obsolete browser/platform: ' + TP.$agent +
            '. Boot sequence terminated.', TP.FATAL);
        return;
    }

    // If the initial coded launch options didn't tell us to ignore the URL
    // we'll process it for any overrides and update based on any changes. The
    // argument 'true' here tells the system to activate override checking.
    if (TP.sys.cfg('boot.nourlargs') !== true) {
        TP.boot.$$configureOverrides(
            TP.boot.getURLArguments(top.location.toString()), true);
        TP.boot.$updateDependentVars();
    }

    //  Regardless of any ignore URL arg settings avoid cycling when the
    //  login page was the first page into the user interface (double-click,
    //  bookmark, shortcut, etc.)
// TODO: rename 'L' property to be more unique
    nologin = /\?L=false/.test(window.location.toString());
    TP.sys.setcfg('boot.uselogin', !nologin);

    //  now that both option lists have been set we can proceed with the
    //  startup sequence.

    //  don't boot TIBET twice into the same window hierarchy, check to make
    //  sure we don't already see the $$tibet window reference
    if (window.$$tibet !== null && window.$$tibet !== window) {
        //  make sure the user sees this
        TP.boot.$stderr('Found existing TIBET image in ' +
            (typeof(window.$$tibet.getFullName) === 'function') ?
                window.$$tibet.getFullName() :
                window.$$tibet.name +
                '. Boot sequence terminated.', TP.FATAL);
        return;
    }

    //  warn about unsupported platforms but don't halt the boot process
    if (!TP.sys.isSupported()) {
        TP.boot.$stderr('Unsupported browser/platform: ' + TP.$agent +
        '. You may experience problems.');
    }

    // configure the UI root. Once this is confirmed (which may require async
    // processing) the rest of the boot sequence will continue.
    TP.boot.$uiRootConfig();
};

//  ----------------------------------------------------------------------------

TP.boot.main = function() {

    /**
     * @name main
     * @summary Invoked when all booting has been completed. The primary
     *     purpose of this function is to hide any boot-time display content
     *     and then invoke the TP.sys.activate method to cause the system to
     *     initialize.
     * @return {null}
     */

    var elem;

    elem = TP.boot.$getBootLogElement();
    if (TP.boot.$isElement(elem)) {
        elem.parentElement.className = 'edge done';
    }

    if (TP.boot.shouldStop()) {
        TP.boot.$flushLog(true);
        return;
    }

    if (TP.sys.cfg('boot.pause')) {
        TP.boot.$setStage('paused');
        TP.boot.$displayStatus('Paused via boot.pause setting.');
        return;
    }

    if (TP.boot.$$logpeak > TP.boot.WARN && TP.sys.cfg('boot.pause_on_error')) {
        TP.boot.$setStage('paused');
        TP.boot.$displayStatus('Paused via boot.pause_on_error w/boot errors.');
        return;
    }

    TP.boot.$activate();
};

//  ----------------------------------------------------------------------------

TP.boot.$activate = function() {

    TP.boot.$setStage('activating');

    try {
        //  ---
        //  protect the codebase from inadvertent exits
        //  ---

        //  Note that this logic is here for the Mozilla and IE browsers.
        //  Webkit-based browsers (Safari and Chrome) use a different
        //  mechanism that requires this hook to be placed on all visible
        //  windows and iframes. That logic has been written to look for the
        //  same property on the top-level window as Mozilla and IE
        //  handlers, so the logic has the same effect.
        TP.windowInstallOnBeforeUnloadHook(window);

        //  make sure that the application knows about online/offline
        //  events.
        TP.windowInstallOnlineOfflineHook(window);

        //  make sure that the application knows about document visibility
        //  events.
        TP.windowInstallDocumentVisibilityHook(window);

        try {
            //  now that app really did load, tell the TP.sys object to
            //  activate its loaded components. Methods downstream of this
            //  call will complete the boot sequence from within the kernel.
            TP.sys.activate();
        } catch (e2) {
            TP.boot.$stderr('Error activating application.',
                TP.boot.$ec(e2));
        }
    } catch (e) {
        TP.boot.$stderr('Error activating application.', TP.boot.$ec(e));
    }

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$stageAction = function() {

    /**
     * Responds to actions from within the various boot display pages. When a
     * particular stage pauses the UI this routine is typically attached as the
     * onclick handler for one or more components in the UI. The user can
     * restart and/or resume the boot sequence by triggering this handler.
     */

    switch (TP.boot.$getStage()) {
        case 'paused':
            TP.boot.$$restarttime = new Date();
            TP.boot.$stdout('Startup process reengaged by user.',
                TP.SYSTEM);
            TP.boot.$activate();
            break;
        case 'import_paused':
            // Happens in two-phase booting when waiting for login to return us
            // a hook file to trigger the second phase of the boot process.
            // TODO: is there a 'user accessible' trigger we want to add here?
            break;
        default:
            break;
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$uiRootConfig = function() {

    /**
     * @name $uiRootConfig
     * @summary Confirms a UIROOT can be found, and configures one it necessary.
     *     Configuration requires asynchronous loading so this routine is the
     *     first half of a pair of routines, the other being $uiRootReady.
     * @todo
     */

    var uiRootID,
        uiFrame,
        lastBodyChildren,
        lastBodyChild,
        isXHTML,
        path,
        iFrameWrapper,
        elemDoc;

    // Look for the designated (or default) UI root frame.
    uiRootID = TP.sys.cfg('tibet.uiroot') || 'UIROOT';
    uiFrame = TP.boot.$getUIElement(uiRootID);

    // If the frame is found this is simple and synchronous. Just invoke the
    // second stage routine directly.
    if (TP.boot.$isValid(uiFrame)) {
        TP.boot.$uiRootReady();
        return;
    }

    TP.boot.$stdout('Unable to locate ' + uiRootID + ', generating it.',
        TP.DEBUG);

    // TODO: Verify we need this instead of just body.appendChild. We used
    // to have to work around a bug in IE.
    lastBodyChildren = document.body.children;
    lastBodyChild = lastBodyChildren[lastBodyChildren.length - 1];

    isXHTML = /\.xhtml/.test(TP.sys.$pathname);
    if (isXHTML) {
        //  Create an XHTML version of the iframe

        //  Create a wrapper span and then set the 'innerHTML' of it
        //  to an iframe. This causes the underlying iframe
        //  document, etc. to be created.

        //  We create a 'span' wrapper for the root iframe, mostly
        //  because it's necessary when creating the XHTML version
        //  of the iframe.
        iFrameWrapper = document.createElement('span');
        lastBodyChild.parentNode.insertBefore(iFrameWrapper,
                                                lastBodyChild);

        //  Set the innerHTML of the span wrapper. This will create
        //  the iframe. Then set the 'src' attribute to a 'data:'
        //  URL containing an encoded XHTML document.
        iFrameWrapper.innerHTML = '<iframe id="' + uiRootID + '">';
        path = TP.boot.$uriExpandPath(TP.sys.cfg('tibet.iframepage'));
        iFrameWrapper.firstChild.setAttribute('src', path);

        iFrameWrapper.firstChild.onload = function() {

            var elemDoc;

            //  grab the 'object' element by ID - that'll be the
            //  root 'iframe'.
            uiFrame = document.getElementById(uiRootID);
            elemDoc = uiFrame.contentDocument;

            //  For some reason, these properties don't get wired on
            //  any browser.
            uiFrame.contentWindow = elemDoc.defaultView;
            window.frames[uiRootID] = elemDoc.defaultView;

            TP.boot.$uiRootReady();
        };

    } else {
        //  Create an HTML version of the iframe

        //  dynamically generate the internal IFRAME element
        uiFrame = document.createElement('iframe');
        uiFrame.setAttribute('id', uiRootID);

        //  Make IE happy - no bezeled borders!
        uiFrame.setAttribute('frameborder', '0');

        lastBodyChild.parentNode.insertBefore(uiFrame, lastBodyChild);

        elemDoc = uiFrame.contentDocument;
        elemDoc.open('text/html', 'replace');
        elemDoc.write('<html><head></head><body></body></html>');
        elemDoc.close();

        TP.boot.$uiRootReady();
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$uiRootReady = function() {

    /**
     * @name $uiRootReady
     * @summary Called to complete the process of launching a new TIBET
     *     application once the UI root frame is loaded.
     * @todo
     */

    var uiRootID,
        win,
        login,
        parallel,
        file;

    uiRootID = TP.sys.cfg('tibet.uiroot') || 'UIROOT';
    win = TP.sys.getWindowById(uiRootID);

    if (TP.boot.$notValid(win)) {
        TP.boot.$stdout(
            'Unable to locate uiroot, defaulting to current window.',
            TP.WARN);
        win = window;
    }

    login = TP.sys.cfg('boot.uselogin');
    if (login !== true) {
        //  without a login sequence there won't be a page coming back to
        //  say that we're authenticated for phase two, we have to do that
        //  manually here.
        win.$$phasetwo = true;

        TP.boot.boot();
    } else {
        //  login was explicitly true
        file = TP.sys.cfg('boot.loginpage');
        file = TP.boot.$uriExpandPath(file);

        parallel = TP.sys.cfg('boot.parallel');
        if (parallel === false) {
            //  sequential login means we don't start booting, we just
            //  have to put the login page into place and rely on the page
            //  that comes back to re-start the boot sequence without
            //  needing a login (since it just completed)...

            //  NOTE 'window' here, not win, is intentional
            window.location.replace(file);
        } else {
            //  parallel booting means we'll put the login page into the
            //  ui canvas while booting in the background. The login
            //  response must set $$phasetwo to allow booting to proceed
            //  beyond the first phase.
            TP.boot.showUICanvas(file);
            TP.boot.boot();
        }
    }

    return;
};


//  ============================================================================
//  Export
//  ============================================================================

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = TP;
    }
    exports.TP = TP;
    exports.APP = APP;
} else {
    root.TP = TP;
    root.APP = APP;
}

}(this));

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
