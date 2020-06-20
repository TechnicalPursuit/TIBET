//  ============================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ============================================================================

/**
 * @overview The central portion of the tibet_loader boot script. This file
 *     contains the logic for processing TIBET package files and loading their
 *     configured scripts, properties, and other elements. A number of functions
 *     are also included here to help determine the browser environment and to
 *     provide default UI during the startup process.
 */

/* global ActiveXObject:false,
          netscape:false,
          Components:false,
          $ERROR:true,
          $STATUS:true
*/

/* eslint new-cap:0, no-alert:0, indent:0, eqeqeq:0 */
(function(root) {

    TP = root.TP || this.TP;

    //  If we can't find the TP reference, or we're part of tibet_loader and
    //  we're loading due to a location change that should route we exit.
    if (!TP || TP.$$nested_loader) {
        return;
    }

//  ============================================================================
//  Electron Overrides / Updates
//  ============================================================================

/*
 * Electron lets you load as if you're in chrome, but any module that is
 * checking for require, module, or exports per CommonJS etc. will fail to do
 * what's right for a browser. We remap those calls here and then remove them
 * from the global context.
 */
if (TP.sys.cfg('boot.context') === 'electron') {

    TP.extern.define = root.define;
    TP.extern.exports = root.exports;
    TP.extern.module = root.module;
    TP.extern.process = root.process;
    TP.extern.require = root.require;

    delete root.define;
    delete root.exports;
    delete root.module;
    delete root.process;
    delete root.require;
}

/*
console.log(navigator.userAgent);
console.log(TP.sys.cfg('boot.context'));
*/

//  ============================================================================
//  tibet_cfg Overrides / Updates
//  ============================================================================

//  NOTE this is the 'initial setting' which is used through the point where the
//  system can load configuration data and run TP.boot.$updateDependentVars.
TP.boot.$$buildTheme = function(aName) {
    var cfg,
        name,
        theme;

    name = aName || 'default';
    theme = {};
    cfg = TP.sys.cfg('theme.' + name);
    Object.keys(cfg).forEach(function(key) {
        var style;

        style = key.split('.')[2];
        if (style) {
            theme[style] = cfg[key];
        }
    });
    return theme;
};
TP.boot.$$theme = TP.boot.$$buildTheme();

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
     * @method hasFeature
     * @summary Returns true if the named feature is a feature of the current
     *     system. The feature list is populated primarily during TIBET startup
     *     and kernel finalization.
     * @param {String} aFeatureName The feature name, typically provided as a
     *     constant from a published list of names.
     * @param {Boolean} retest Whether or not to ignore any cached value.
     * @returns {Boolean} True if the feature is available.
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
    if (typeof (testFunc = TP.sys.$featureTests[aFeatureName]) === 'function') {
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
     * @method addFeatureTest
     * @summary Adds a feature test under the name provided. If testNow is
     *     true, the test is performed immediately.
     * @param {String} aFeatureName The feature name, typically provided as a
     *     constant from a published list of names.
     * @param {Function} featureTest The feature test function to execute.
     * @param {Boolean} testNow Whether or not to execute the test immediately
     *     instead of waiting until the first time the test is used.
     * @returns {Boolean} The result of the test if 'testNow' is specified.
     */

    TP.sys.$featureTests[aFeatureName] = featureTest;

    //  Install a system property getter to return platform feature values on
    //  'TP.has'
    TP.sys.installSystemPropertyGetter(
        TP.has,
        aFeatureName,
        function(aName) {
            return TP.sys.hasFeature(aName);
        });

    if (testNow) {
        return TP.boot.hasFeature(aFeatureName);
    }
};

//  ----------------------------------------------------------------------------

TP.sys.hasFeatureTest = function(aFeatureName) {

    /**
     * @method hasFeatureTest
     * @summary Returns whether or not a particular feature test exists.
     * @param {String} aFeatureName The feature name, typically provided as a
     *     constant from a published list of names.
     * @returns {Boolean} True if the feature test is defined.
     */

    /* eslint-disable no-extra-parens */
    return (typeof TP.sys.$featureTests[aFeatureName] === 'function');
    /* eslint-enable no-extra-parens */
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

TP.sys.addFeatureTest('karma',
                        function() {
                            return TP.isValid(
                                TP.sys.getLaunchWindow()[
                                    TP.sys.cfg('karma.slot', '__karma__')
                                ]);
                        });

//  ----------------------------------------------------------------------------
//  Package Checking
//  ----------------------------------------------------------------------------

TP.sys.hasPackage = function(aPackageFile, aConfig) {

    /**
     * @method hasPackage
     * @summary Returns true if the named package/config pair has been
     *     loaded. If the config isn't defined then the 'base' config is
     *     assumed. NOTE that the 'full' config is always checked and if that
     *     config has been loaded it is assumed that any specific config has
     *     also been loaded.
     * @param {String} aPackageFile A package filename, which should typically
     *     be a .xml file in the lib_cfg or app_cfg path.
     * @param {String} aConfig A specific config name. Default is 'full'.
     * @returns {Boolean} True if the package/config has been loaded.
     */

    var config;

    config = aConfig || 'base';

    //  if the full config has loaded we presume all other configs were a
    //  part of that and that the config is available
    if (TP.boot.$$packages[aPackageFile + '@' + 'full'] === true) {
        return true;
    }

    return TP.boot.$$packages[aPackageFile + '@' + config] === true;
};

//  ============================================================================
//  STDIO Hooks
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
     * @method STDERR_ALERT
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
     * @method STDERR_BREAK
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
     * @method STDERR_LOG
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
            //  object/string to log
            break;
        case 2:
            //  object/string + either an annotation/context or log level
            /* eslint-disable no-extra-parens */
            if (TP.boot.$isNumber(obj) && obj <= TP.boot.LOG_NAMES.length) {
                lvl = obj;
            } else if (TP.boot.$isString(obj) &&
                    TP.boot.LOG_NAMES.indexOf(obj) !== -1) {
                lvl = TP.boot[obj];
            } else {
                ann = obj;
            }
            /* eslint-enable no-extra-parens */
            break;
        default:
            //  all three, or more but we ignore past 3.
            ann = obj;
            lvl = level;
            break;
    }

    //  If level wasn't explicitly set above we'll set it now.
    if (TP.boot.$notValid(lvl)) {
        lvl = TP.ERROR;
    }

    log = msg;

    //  If there's annotation data we need to consider that, or relay it as
    //  context data if it's an arguments array.
    if (TP.boot.$isValid(ann)) {
        if (TP.boot.$isArgumentArray(ann)) {
            ctx = ann;
        } else if (ann instanceof TP.boot.Annotation) {
            log = ann;
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
     * @method STDERR_NOTIFY
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
     * @method STDERR_NULL
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
     * @method STDIN_CONFIRM
     * @summary Requests confirmation of an operation.
     * @param {String} msg The confirmation request message.
     * @returns {Boolean} True if the operation was confirmed.
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
     * @method STDIN_PROMPT
     * @summary Prompts the user for a value, returning either the user-entered
     * value or a default value.
     * @param {String} msg The input request message.
     * @param {Object} def The default object to display/use.
     * @returns {Boolean} The value the user chooses.
     */

    var input;

    input = window.prompt(msg == null ? '?' : msg,
                            def == null ? '' : def);
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
     * @method STDOUT_ALERT
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
     * @method STDOUT_LOG
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
            //  object/string to log
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

    //  If there's annotation data we need to consider that, or relay it as
    //  context data if it's an arguments array.
    if (TP.boot.$isValid(ann)) {
        if (TP.boot.$isArgumentArray(ann)) {
            ctx = ann;
        } else if (ann instanceof TP.boot.Annotation) {
            log = ann;
        } else {
            log = TP.boot.$annotate(ann, msg);
        }
    }

    TP.boot.log(log, lvl, ctx);

    return;
};

TP.boot.STDOUT_NOTIFY = function(msg, obj, level) {

    /**
     * @method STDOUT_NOTIFY
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
     * @method $$log
     * @summary Directs logging output to either stderr or stdout based on
     *     logging level.
     * @param {arguments} argList A list of arguments from a logging call.
     * @param {Number} aLogLevel TP.INFO or a similar level name.
     */

    var level,
        message,
        i;

    //  Get level in numeric form so we can test leveling below.
    level = aLogLevel;
    if (!TP.boot.$isValid(level)) {
        level = TP.INFO;
    }

    level = TP.boot[level.toUpperCase()];

    message = [];
    for (i = 0; i < argList.length; i++) {
        message.push(TP.boot.$stringify(argList[i]));
    }
    message = message.join(' ');

    if (level >= TP.boot.ERROR && level < TP.boot.SYSTEM) {
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
     * @method onerror
     * @summary Captures global errors and outputs them appropriately. This
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
     */

    var file,
        path,
        str;

    try {
        file = TP.boot.$$onerrorURL;
        path = file == null ? url : file;

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
        //  don't let log errors trigger recursion, but don't bury them either.
        top.console.error('Error logging onerror: ' + e.message);
        top.console.error(str || msg);
    }

    //  set a non-zero status to signify that an error occurred to callers
    //  which won't see a native Error in a catch block
    $STATUS = TP.FAILED;

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
 * NOTE that the code below is _really old_ and probably in need of an update
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

//  NOTE that these 3 are temporary and will be deleted once detect is done.
TP.$versions = null;
TP.$major = null;
TP.$minor = null;

TP.$$assignBrowser = function(aString) {

    var parts;

    parts = aString.split('.');

    TP.$browserIdent = aString;

    TP.$browserMajor = parseInt(parts[0] == null ? 0 : parts[0], 10);
    TP.$browserMinor = parseInt(parts[1] == null ? 0 : parts[1], 10);
    TP.$browserBuild = parseInt(parts[2] == null ? 0 : parts[2], 10);

    TP.$browserPatch = parts[3] == null ? 0 : parts[3];
};

TP.$$assignBrowserUI = function(aString) {

    var str,
        parts;

    //  Webkit suddenly decided to add '+' to the tail of their version
    //  numbers, just to make things more interesting I'm sure.
    str = aString.replace('+', '');
    parts = str.split('.');

    TP.$browserUIIdent = aString;

    TP.$browserUIMajor = parseInt(parts[0] == null ? 0 : parts[0], 10);
    TP.$browserUIMinor = parseInt(parts[1] == null ? 0 : parts[1], 10);
    TP.$browserUIBuild = parseInt(parts[2] == null ? 0 : parts[2], 10);

    TP.$browserUIPatch = parts[3] == null ? 0 : parts[3];
};

//  ----------------------------------------------------------------------------

//  capture default value for the browser, we'll adjust below.
TP.$browser = navigator.userAgent;

//  convert all characters to lowercase to simplify certain tests
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

delete TP.$versions;

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
    } else if (TP.$agent.indexOf('nt 6.1') !== -1) {
        TP.$platform = 'win7';
    } else if (TP.$agent.indexOf('nt 6.2') !== -1) {
        TP.$platform = 'win8';
    } else if (TP.$agent.indexOf('nt 6.3') !== -1) {
        TP.$platform = 'win8.1';
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

/* eslint-disable no-extra-parens */
if ((TP.$agent.indexOf('chrome/') !== -1) ||
    (TP.$agent.indexOf('crios/') !== -1) ||
    (TP.$agent.indexOf('gsa/') !== -1)) {
/* eslint-enable no-extra-parens */
    //  Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.2.149.27 Safari/525.13

    //  chrome is WebKit-based for GUI, but has a different JS engine.

    //  TODO:   check for spoofing via object-testing for V8 etc?

    if (TP.$agent.indexOf('opr/') !== -1) {
        TP.$browser = 'opera';
    } else {
        TP.$browser = 'chrome';
    }
    TP.$browserUI = 'webkit';
    TP.$browserSuffix = 'Webkit';

    //  capture chrome number for browser version numbering
    TP.$$match = TP.$agent.match(/chrome\/([^ ]*?) /);
    if (TP.$$match != null) {
        TP.$$assignBrowser(TP.$$match[1]);
    }

    TP.$$match = TP.$agent.match(/crios\/([^ ]*?) /);
    if (TP.$$match != null) {
        TP.$$assignBrowser(TP.$$match[1]);
    }

    TP.$$match = TP.$agent.match(/gsa\/([^ ]*?) /);
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
} else if (TP.$agent.indexOf('firefox/') !== -1 ||
            TP.$agent.indexOf('fxios/') !== -1 ||
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
        //  and mobile is fxios
        if (TP.$agent.indexOf('fxios') !== -1) {
            TP.$browser = 'fxios';
            TP.$$match = TP.$agent.match(/fxios\/([^ ]*?)($| )/);
        } else if (TP.$agent.indexOf('minefield') !== -1) {
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
} else if (TP.$agent.indexOf('opera/') !== -1) {
        TP.$browser = 'opera';
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
} else if (TP.$agent.indexOf('msie') !== -1) {
    //  This is only for old versions of IE that TIBET doesn't support (IE < 11)
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
} else if (TP.$agent.indexOf('trident') !== -1) {

    //  IE11+ use the 'trident' token in the UA exclusively.

    TP.$browser = 'ie';
    TP.$browserUI = 'trident';
    TP.$browserSuffix = 'IE';

    //  version is number (ala 11.0) behind 'rv:'
    TP.$$match = TP.$agent.match(/rv:([\d.]+)/);
    if (TP.$$match != null) {
        TP.$$assignBrowser(TP.$$match[1]);
    }

    //  Trident numbers aren't accessible from JS, but they map as
    //  follows:
    if (TP.$browserMajor === 11) {
        TP.$$assignBrowserUI('7.0.0.0');
    }
}

//  ----------------------------------------------------------------------------
//  DETECTION QUERIES
//  ----------------------------------------------------------------------------

TP.sys.getBrowser = function() {

    /**
     * @method getBrowser
     * @summary Returns the standard 'browser' string, typically one of:
     *     'firefox', 'ie', 'safari', 'chrome'.
     * @returns {String} The String representing the 'browser'.
     */

    if (TP.$browser === 'fxios') {
        return 'firefox';
    }

    if (TP.$browser === 'crios' || TP.$browser === 'gsa') {
        return 'chrome';
    }

    return TP.$browser;
};

//  ----------------------------------------------------------------------------

TP.sys.getBrowserUI = function() {

    /**
     * @method getBrowserUI
     * @summary Returns the standard 'browser UI' string, typically one of:
     *     'gecko', 'trident', 'webkit'.
     * @returns {String} The String representing the 'browser UI'.
     */

    return TP.$browserUI;
};

//  ----------------------------------------------------------------------------

TP.sys.isMac = function() {

    /**
     * @method isMac
     * @summary Returns whether or not we're running on a Mac.
     * @returns {Boolean} Whether or not we're running on a Mac.
     */

    return TP.$platform.indexOf('mac') === 0;
};

//  ----------------------------------------------------------------------------

TP.sys.isNix = function() {

    /**
     * @method isNix
     * @summary Returns whether or not we're running on some variant of *nix.
     * @returns {Boolean} Whether or not we're running on some variant of *nix.
     */

    return TP.$platform.indexOf('*nix') === 0;
};

//  ----------------------------------------------------------------------------

TP.sys.isWin = function() {

    /**
     * @method isWin
     * @summary Returns whether or not we're running on some variant of Windows.
     * @returns {Boolean} Whether or not we're running on some variant of
     *     Windows.
     */

    return TP.$platform.indexOf('win') === 0 ||
            TP.$platform.indexOf('vista') === 0;
};

//  ----------------------------------------------------------------------------

TP.sys.isUA = function(browser, varargs) {

    /**
     * @method isUA
     * @summary Tests the current user agent (UA) for a specific version, or a
     *     version equal-to-or-above (TP.UP) or equal-to-or-below (TP.DOWN) a
     *     specified version number.
     * @param {String} browser The browser or browser UI string, typically one
     *     of: 'ie', 'safari', 'chrome', 'firefox', 'trident', 'webkit', or
     *     'gecko'.
     * @param {arguments} varargs The remaining arguments can range from 0 to 5
     *     in length where the arguments are major, minor, patchMajor,
     *     patchMinor, and comparison respectively. The first 4 are numbers used
     *     to specify a version to varying degrees of detail. The comparison
     *     value should be a string, either TP.UP or TP.DOWN, which defines how
     *     the version testing should be done.
     * @returns {Boolean} True if the current browser matches the test criteria.
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

    comparison = comparison != null ? comparison.toUpperCase() : null;

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

TP.sys.inDeveloperMode = function() {

    /**
     * @method inDeveloperMode
     * @summary Whether or not the system is running in a 'developer mode'. That
     *     is, is a boot profile or boot package loaded and running such that
     *     certain developer mode flags and other utilities are enabled.
     * @returns {Boolean} Whether or not we are currently running in a
     *     'developer mode'.
     */

    var package;

    //  Compute whether we're booting the developer target or not.
    package = TP.sys.cfg('boot.package') || '';

    return /development/.test(package);
};

//  ----------------------------------------------------------------------------

TP.sys.needsLoadingIndicator = function() {

    /**
     * @method needsLoadingIndicator
     * @summary Whether or not some sort of loading indication needs to be
     *     presented to the user. For bigger packages, such as 'developer' and
     *     'contributor', we need to display to the user that TIBET is still
     *     loading.
     * @returns {Boolean} Whether or not we need a visual indicator that we're
     *     loading.
     */

    /*
    var profile;

    //  We currently only show a loading indicator during boot if we're running
    //  in a developer mode. Otherwise, the boot process is so fast that it's
    //  not worth it :-).
    profile = TP.sys.cfg('boot.profile') || '';

    return /(developer|contributor)/.test(profile);
    */

    //  It turns out that, on very slow connections, even the non-developer boot
    //  is slow enough that, especially if the app is using logins, we need to
    //  show this screen.
    return true;
};

//  ----------------------------------------------------------------------------
//  SUPPORTED PLATFORM TRACKING
//  ----------------------------------------------------------------------------

TP.sys.isObsolete = function() {

    /**
     * @method isObsolete
     * @summary Returns whether or not TIBET considers the current browser to be
     *     obsolete. Any browser not appearing to be ECMAScript-5 compliant is
     *     considered to be obsolete. Obsolete browsers refuse to boot TIBET.
     * @returns {Boolean} Whether TIBET considers the browser obsolete.
     */

    //  simple check for rough ECMAScript 5 compliance.
    if (typeof Object.keys !== 'function' ||
        typeof Object.defineProperty !== 'function') {
        return true;
    }

    return false;
};

//  ----------------------------------------------------------------------------

TP.sys.isSupported = function() {

    /**
     * @method isSupported
     * @summary Returns whether or not TIBET is supported in the browser that
     *     is currently trying to execute it. Supported browsers boot without
     *     any warnings. Obsolete browsers refuse to boot. "Unsupported" which
     *     is the gap between obsolete and supported (or those which aren't in
     *     the primary browser list) boot with warnings.
     * @returns {Boolean} Whether or not TIBET is supported in the currently
     *     executing browser.
     */

    var context,
        cfg,
        options,
        len,
        i,
        config,
        flag;

    TP.boot.$stdout('User agent: ' + TP.$browser + '/' + TP.$browserMajor +
        '.' + TP.$browserMinor, TP.boot.SYSTEM);
    TP.boot.$stdout('', TP.SYSTEM);

    //  Headless and Electron checks are based on boot.context from tibet_cfg.
    context = TP.sys.cfg('boot.context');
    if (TP.sys.cfg('boot.supported_contexts').indexOf(context) !== -1) {
        //  Don't assume success for browsers. We do further checks below.
        if (context !== 'browser') {
            return true;
        }
    }

    cfg = TP.sys.cfg('boot.supported_browsers');

    //  Browser name must be a key in the supported data set.
    //  NOTE we use the call here so it can deal with "spoofs" (fxios etc)
    if (!(TP.sys.getBrowser() in cfg)) {
        return false;
    }

    //  Data should be an array of configuration blocks. Each block can
    //  either accept or deny access.
    //  NOTE we use the _SLOT_ here so we look up _exact_ parameters.
    options = cfg[TP.$browser];
    len = options.length;

    //  If no specific option list but browser key is found it's considered
    //  supported across all known versions.
    if (len === 0) {
        return true;
    }

    flag = true;

    for (i = 0; i < len; i++) {
        config = options[i];

        //  Must at least match major version.

        /* eslint-disable no-extra-parens */
        if ('major' in config && TP.$browserMajor >= Number(config.major)) {
            if ('minor' in config) {
                if (TP.$browserMinor >= Number(config.minor)) {
        /* eslint-enable no-extra-parens */
                    //  Major passed, minor passed. We're good.
                    flag = flag && true;
                } else {
                    //  Major passed, minor failed.
                    flag = flag && false;
                }
            } else {
                //  Major passed, no minor exists. We're good.
                flag = flag && true;
            }
        } else {
            //  No major version, or major versions don't match up.
            flag = flag && false;
        }
    }

    return flag;
};

//  ============================================================================
//  LOAD INFORMATION
//  ============================================================================

/*
It's common to need information about the location from which TIBET was loaded.
This set of functions provides access to the host, port, protocol, and pathname
which were used to load TIBET, as well as the 'launch path'.
*/

//  first define whether we were loaded from file url or a web server
TP.sys.$httpBased = window.location.protocol.indexOf('file') !== 0;

TP.sys.$scheme = window.location.protocol.slice(0, -1);
TP.sys.$pathname = decodeURI(window.location.pathname);

if (TP.sys.$httpBased) {
    TP.sys.$host = window.location.hostname;
    /* eslint-disable no-extra-parens */
    TP.sys.$port = (window.location.port === '' ||
                    window.location.port == null) ?
                            80 :
                            window.location.port;
    /* eslint-enable no-extra-parens */
} else {
    TP.sys.$host = '';
    TP.sys.$port = '';
}

//  ----------------------------------------------------------------------------

TP.sys.isHTTPBased = function() {

    /**
     * @method isHTTPBased
     * @summary Returns true if the TIBET codebase was loaded via HTTP.
     * @returns {Boolean} Whether or not the TIBET codebase was loaded over
     *     HTTP.
     */

    return TP.sys.$httpBased;
};

//  ----------------------------------------------------------------------------

TP.sys.isHTTPSBased = function() {

    /**
     * @method isHTTPSBased
     * @summary Returns true if the TIBET codebase was loaded via HTTPS.
     * @returns {Boolean} Whether or not the TIBET codebase was loaded over
     *     HTTPS.
     */

    return TP.sys.$httpBased && TP.sys.$scheme === 'https';
};

//  ----------------------------------------------------------------------------

TP.sys.isSecureContext = function() {

    /**
     * @method isSecureContext
     * @summary Returns true if the TIBET codebase is running in a 'secure
     *     context' (i.e. vended over HTTPS protocol or from localhost).
     * @returns {Boolean} Whether or not the TIBET codebase was loaded over
     *     HTTPS.
     */

    return TP.sys.isHTTPSBased() || TP.sys.$host === 'localhost';
};

//  ----------------------------------------------------------------------------

TP.sys.getLaunchDocument = function(aWindow) {

    /**
     * @method getLaunchDocument
     * @summary Returns the actual launch document. Normally this would just be
     *     the current 'document' but in the case of Karma for example it may be
     *     a document nested under a link import.
     * @param {Window} [aWindow=TP.sys.getLaunchWindow()] The window to scan.
     * @returns {Document} The document containing the TIBET launch script.
     */

    var win,
        arr,
        node;

    if (TP.sys.$launchDoc) {
        return TP.sys.$launchDoc;
    }

    win = aWindow || TP.sys.getLaunchWindow();
    if (win[TP.sys.cfg('karma.slot', '__karma__')]) {

        //  good chance we're not actually in window.document but in some nested
        //  iframe/link import context. in that case we won't find the script
        //  node containing the loader in the expected location.
        node = TP.sys.getLaunchNode(win.document);
        if (node) {
            TP.sys.$launchDoc = win.document;
            return TP.sys.$launchDoc;
        }

        //  Didn't find it. Karma often uses a link with rel='import' so look
        //  for that instead.
        arr = win.document.getElementsByTagName('link');
        arr = Array.prototype.slice.call(arr, 0);
        arr = arr.filter(
                function(item) {
                    return item.getAttribute('rel') === 'import';
                });

        //  There's a list of imports so we need to look into those for
        //  documents that may contain our load script.
        arr.some(
            function(item) {
                var script;

                if (item.import &&
                    item.import.nodeType === Node.DOCUMENT_NODE) {

                    script = TP.sys.getLaunchNode(item.import);
                    if (script) {
                        TP.sys.$launchDoc = item.import;
                        return true;
                    }
                }
                return false;
            });

        if (TP.sys.$launchDoc) {
            return TP.sys.$launchDoc;
        }
    }

    TP.sys.$launchDoc = document;

    return TP.sys.$launchDoc;
};

//  ----------------------------------------------------------------------------

TP.sys.getLaunchNode = function(aDocument) {

    /**
     * @method getLaunchNode
     * @summary Tries to locate the script node in the document which loaded
     *     the TIBET codebase.
     * @param {Document} [aDocument=TP.sys.getLaunchDocument()] The document to
     *     scan.
     * @returns {Element} The element containing the TIBET launch script.
     */

    var arr,
        doc;

    doc = aDocument || TP.sys.getLaunchDocument();

    //  Scan document for script nodes and filter for tibet_loader references.
    arr = doc.getElementsByTagName('script');
    arr = Array.prototype.slice.call(arr, 0);
    arr = arr.filter(
            function(item) {
                var src;

                src = item.getAttribute('src');
                return src && src.indexOf('tibet_loader') !== -1;
            });

    return arr[0];
};

//  ----------------------------------------------------------------------------

TP.sys.getLaunchRoot = function() {

    /**
     * @method getLaunchRoot
     * @summary Returns the "launch root", either the web server's root or the
     *     root of the file system from which the current app was launched.
     * @returns {String} The root path that the TIBET codebase was launched
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
        str = TP.sys.getLaunchScheme() + '://' + TP.sys.getLaunchHost();
        if (TP.boot.$isValid(port = TP.sys.getLaunchPort()) &&
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

TP.sys.getLaunchURL = function() {

    /**
     * @method getLaunchURL
     * Returns the full URL string the application initially used to launch.
     * @returns {String} The original launch URL.
     */

    if (!TP.sys.$launchURL) {
        TP.sys.$launchURL = window.location.toString();
        if (TP.sys.$launchURL.charAt(TP.sys.$launchURL.length - 1) === '/') {
            TP.sys.$launchURL = TP.sys.$launchURL.slice(0, -1);
        }
    }

    return TP.sys.$launchURL;
};

//  ----------------------------------------------------------------------------

TP.sys.getLaunchWindow = function() {

    /**
     * @method getLaunchWindow
     * @summary Returns the actual launch window, that is the native window
     *     reference containing the overall application.
     * @returns {Window} The launch Window.
     */

    return window.$$TIBET;
};

//  ----------------------------------------------------------------------------

TP.sys.getHomeURL = function(checkSession) {

    /**
     * @method getHomeURL
     * Returns the full URL string the application used as its home page.
     * @param {Boolean} [checkSession=false] Whether the routine should check
     *     startup session parameters or not. When true the return value will
     *     prioritize session storage and/or session.home_page over normal
     *     values for project.home_page et. al. This is largely used during
     *     startup to get the page to load in the canvas, even though it's not
     *     the "standard" home page for the app.
     * @returns {String} The home page URL.
     */

    var homeURL;

    if (checkSession && top.sessionStorage) {
        homeURL = top.sessionStorage.getItem('TIBET.project.home_page');

        //  This is a "one time use" value. Clear after fetching.
        top.sessionStorage.removeItem('TIBET.project.home_page');
    }

    //  NOTE that the session.home_page value is set during startup to preserve
    //  any value found in session storage before clearing it to avoid incorrect
    //  home page computation on startup.
    if (checkSession) {
        homeURL = homeURL || TP.sys.cfg('session.home_page');
    }

    homeURL = homeURL || TP.sys.cfg('project.home_page');

    if (TP.sys.cfg('sherpa.enabled')) {
        homeURL = homeURL || TP.sys.cfg('path.sherpa_screen_0');
    }

    homeURL = homeURL || TP.sys.cfg('path.blank_page');

    return homeURL;
};

//  ----------------------------------------------------------------------------

TP.sys.getLaunchHost = function() {

    /**
     * @method getLaunchHost
     * @summary Returns the hostname from which TIBET was loaded.
     * @returns {String} The host from which TIBET was loaded.
     */

    return TP.sys.$host;
};

//  ----------------------------------------------------------------------------

TP.sys.getLaunchPathname = function() {

    /**
     * @method getLaunchPathname
     * @summary Returns the pathname from which TIBET was loaded.
     * @returns {String} The pathname from which TIBET was loaded.
     */

    return TP.sys.$pathname;
};

//  ----------------------------------------------------------------------------

TP.sys.getLaunchPort = function() {

    /**
     * @method getLaunchPort
     * @summary Returns the port number string from which TIBET was loaded. If
     *     no port number was specified in the load URL this string is empty.
     * @returns {Number} The port number from which TIBET was loaded.
     */

    return TP.sys.$port;
};

//  ----------------------------------------------------------------------------

TP.sys.getLaunchScheme = function() {

    /**
     * @method getLaunchScheme
     * @summary Returns the scheme used when TIBET was loaded. This is
     *     typically http or https which allows TIBET to determine if a secure
     *     connection is required as the default for future connections to the
     *     server.
     * @returns {String} The protocol used when TIBET was loaded.
     */

    return TP.sys.$scheme;
};

//  ============================================================================
//  HTTP PRIMITIVES
//  ============================================================================

/**
 *  HTTP protocol support primitives. These provide the foundation for the
 *  HTTP-based content operations specific to booting. Full-featured versions of
 *  these are also found in the TIBET kernel, which adds support for a number of
 *  more advanced features.
 */

//  ----------------------------------------------------------------------------

TP.boot.$httpCall = function(targetUrl, callType, callHeaders, callUri) {

    /**
     * @method $httpCall
     * @summary Performs an XMLHTTPRequest based on the information provided.
     *     NOTE again that this version is specific to the boot system where
     *     synchronous loads are actually what's desired/required to ensure
     *     proper load sequencing.
     * @param {String} targetUrl The request's target URL.
     * @param {String} callType One of the valid HTTP call types such as
     *     TP.HTTP_HEAD, or TP.HTTP_GET.
     * @param {String[][]} callHeaders Key/value pairs to be used as request
     *     headers. Note that this call automatically uses no-cache headers. We
     *     use an array to avoid issues with loading TIBET and adding additional
     *     elements to Object.prototype. NOTE: that this differs from the
     *     kernel's $httpCall API which uses a hash.
     * @param {String} callUri Optional URI data for the call. Often used for
     *     GET/POST calls to provide CGI parameter strings, etc.
     * @exception Error Various HTTP-related errors.
     * @returns {XMLHTTPRequest} The request object used for the call.
     */

    var i,
        httpObj,
        len;

    if (targetUrl == null) {
        TP.boot.$httpError('InvalidURL: ' + targetUrl);
        return;
    }

    if (callType == null) {
        TP.boot.$httpError('InvalidCallType: ' + callType);
        return;
    }

    //  same domain? if not we'll need permission to do this
    if (TP.sys.isUA('GECKO') &&
        targetUrl.indexOf(TP.sys.getLaunchRoot()) !== 0) {
        try {
            if (TP.sys.cfg('log.privilege_requests')) {
                TP.boot.$stdout('Privilege request at TP.boot.$httpCall',
                                TP.WARN);
            }

            netscape.security.PrivilegeManager.enablePrivilege(
                                                'UniversalBrowserRead');
        } catch (e) {
            TP.boot.$httpError('PrivilegeException. url: ' + targetUrl,
                TP.boot.$ec(e));
            return;
        }
    }

    try {
        httpObj = TP.boot.$httpConstruct();
    } catch (e) {
        TP.boot.$httpError(
            'RequestObjectError.  url: ' + targetUrl, TP.boot.$ec(e));
        return;
    }

    try {
        httpObj.open(callType, targetUrl, false);
    } catch (e) {
        TP.boot.$httpError(
            'RequestOpenError. url: ' + targetUrl, TP.boot.$ec(e));
        return;
    }

    //  process any headers, note we always bypass caches if possible
    try {
        httpObj.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        if (callHeaders != null) {
            len = callHeaders.length;
            for (i = 0; i < len; i = i + 2) {
                httpObj.setRequestHeader(callHeaders[i],
                                            callHeaders[i + 1]);
            }
        }
    } catch (e) {
        TP.boot.$httpError('HeaderConfigurationError. url: ' + targetUrl,
            TP.boot.$ec(e));
        return;
    }

    //  isolate the actual send call for finer-grained error handling
    try {
        if (TP.sys.cfg('debug.http')) {
            TP.boot.$stdout('TP.boot.$httpCall() targetUrl: ' +
                targetUrl, TP.DEBUG);
            TP.boot.$stdout('TP.boot.$httpCall() callType: ' +
                callType, TP.DEBUG);
            TP.boot.$stdout('TP.boot.$httpCall() callUri: ' +
                (callUri != null ? callUri : 'n/a'), TP.DEBUG);
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
        TP.boot.$httpError('HTTPCallException: url: ' + targetUrl,
            TP.boot.$ec(e));
        return;
    }

    return httpObj;
};

//  ----------------------------------------------------------------------------

TP.boot.$httpConstruct = function() {

    /**
     * @method $httpConstruct
     * @summary Returns a platform-specific XMLHttpRequest object for use.
     * @returns {XMLHttpRequest} A new XMLHttpRequest object.
     */

    var request;

    request = new XMLHttpRequest();

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
     * @method $httpError
     * @summary Throws an error containing aString, and optionally logs the
     *     string to TP.boot.$stderr. This allows debug mode to control
     *     whether all such calls are logged at the low level, while allowing
     *     catch blocks in higher-level calls to handle errors silently when not
     *     in debug mode.
     * @param {String} aString The error message, if any.
     * @param {Object} errObj An optional Error object, as creatd by the
     *     TP.boot.$ec() call.
     * @exception Error Throws an Error containing aString.
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

TP.boot.$parseURIParameters = function(uriParams) {

    /**
     * @method $parseURIParameters
     * @summary Processes a URL parameter string and returns it in dictionary
     *     form meaning key/value pairs in an object.
     * @param {String} uriParams The URI parameter string to process.
     * @returns {Object} The parameters in primitive object key/value form.
     */

    var params,
        args;

    args = {};
    params = uriParams.split('&');
    params.forEach(function(item) {
        var parts,
            key,
            value;

        /* eslint-disable no-div-regex */
        if (/=/.test(item)) {
        /* eslint-enable no-div-regex */
            parts = item.split('=');
            key = parts[0];
            value = parts[1];

            //  Strip any external quoting off value.
            if (value.length > 1 &&
                    (/^".*"$/.test(value) || /^'.*'$/.test(value))) {
                value = value.slice(1, -1);
            }
        } else {
            key = item;
            value = true;
        }

        value = decodeURIComponent(value);

        args[key] = TP.boot.$getArgumentPrimitive(value);
    });

    return args;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriCollapsePath = function(aPath) {

    /**
     * @method $uriCollapsePath
     * @summary Collapses a URI path to remove any embedded . or .. segments
     *     which may exist.
     * @param {String} aPath The path to collapse.
     * @returns {String} The path with any . or .. collapsed.
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
     * @method $uriExpandPath
     * @summary Returns the expanded form of the TIBET '~' (tilde) path
     *     provided. Variable values in the path (~[varname]/) are expanded
     *     using the corresponding TP.sys.cfg(path.varname) lookup. NOTE the
     *     'path.' prefixing here. All path variables are expected to be
     *     registered under a path.app_* or path.lib_* style key to help
     *     maintain lookup conventions.
     * @param {String} aPath The TIBET path to expand.
     * @returns {String} A newly constructed path string.
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
        //  Launch root doesn't include a trailing slash, so avoid possible
        //  recursion via uriJoinPaths and just concatenate.
        return TP.sys.getLaunchRoot() + aPath;
    }

    if (/^[a-zA-Z]{1}:/.test(aPath)) {
        //  Launch root doesn't include a trailing slash, so avoid possible
        //  recursion via uriJoinPaths and just concatenate.
        return TP.sys.getLaunchRoot() + aPath.slice(2);
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

            if (typeof value === 'string') {
                //  If we're replacing something of the form ~variable/stuff we
                //  don't want to get something of the form value//stuff back so
                //  we trim off any trailing '/' on the value.
                if (path !== '~' + variable) {
                    if (value.charAt(value.length - 1) === '/') {
                        value = value.slice(0, -1);
                    }
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

    if (path.charAt(path.length - 1) === '/') {
        path = path.slice(0, -1);
    }

    //  variable expansions can sometimes create additional ~ paths
    if (path !== aPath && path.indexOf('~') === 0) {
        path = TP.boot.$uriExpandPath(path);
    }

    //  remove any relative segments before caching
    path = TP.boot.$uriCollapsePath(path);

    //  Cache the expanded value so we don't do this work again.
    TP.boot.$$fullPaths[aPath] = path;

    return path;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriFragmentParameters = function(uri, textOnly) {

    /**
     * @method $uriFragmentParameters
     * @summary Parses the given URI for any TIBET-specific argument block.
     *     The URI hash is checked for any & segment and that segment is
     *     split just as if it were a set of server parameters. For example,
     *     http://localhost/index.html#foo&boot.debug=true results in the
     *     argument object containing {'boot.debug':true};
     * @param {String} uri The URI to process.
     * @param {Boolean} [textOnly=false] Return just the text parameter string
     *     if any.
     * @returns {Object} An object containing the parsed URI fragment
     *     parameters.
     */

    var hash,
        params,
        args;

    //  Process any hash portion of the URI string.
    if (!/#/.test(uri)) {
        return {};
    }
    hash = uri.slice(uri.indexOf('#') + 1);
    hash = decodeURIComponent(hash);

    args = {};
    if (hash.indexOf('?') === -1) {
        return args;
    } else {
        params = hash.slice(hash.indexOf('?') + 1);
        if (textOnly) {
            return params;
        }
    }

    if (params) {
        return TP.boot.$parseURIParameters(params);
    }

    return textOnly ? '' : {};
};

//  ----------------------------------------------------------------------------

TP.boot.$uriInLocalFormat = function(aPath) {

    /**
     * @method $uriInLocalFormat
     * @summary Returns the path with proper adjustments made to represent a
     *     valid file on the current platform.
     * @param {String} aPath The path to adjust.
     * @returns {String} The supplied path adjusted to be a 'proper URL' for the
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

//  Cache for TIBET Formatted URIs. We look these up a lot during booting.
TP.boot.$$tibetURIS = {};

//  Cache for TIBET path keys. We don't need to compute these each time. Note
//  that this is set to null because of the logic in the
//  TP.boot.$uriInTIBETFormat method.
TP.boot.$$pathKeys = null;

//  ----------------------------------------------------------------------------

TP.boot.$uriInTIBETFormat = function(aPath) {

    /**
     * @method $uriInTIBETFormat
     * @summary Returns the path with typical TIBET prefixes for app_cfg,
     *     lib_cfg, app_root, and lib_root replaced with their TIBET aliases.
     *     This is typically used to shorten log output.
     * @param {String} aPath The URI path to process.
     * @returns {String} The supplied path with typical TIBET prefixes.
     */

    var boot,
        path,
        cfg,
        matches,
        match,
        replacement,
        keys;

    if (!aPath) {
        return aPath;
    }

    //  Don't try to do this until we've computed the proper root paths.
    if (!TP.boot.$$approot || !TP.boot.$$libroot) {
        return aPath;
    }

    path = TP.boot.$$tibetURIS[aPath];
    if (path) {
        return path;
    }
    path = aPath;

    boot = TP.boot;
    cfg = TP.sys.getcfg();

    TP.boot.$$pathKeys = TP.boot.$$pathKeys ||
        Object.keys(cfg).filter(function(key) {
            return /path\.(lib_|app_)/.test(key) && cfg.at(key);
        });
    keys = TP.boot.$$pathKeys;

    //  Goal here is to find all keys which provide a match and then select the
    //  one that matches the longest string...that's the "best fit"...with one
    //  exception. We're looking for a valid "path", not a "key" so if the key
    //  matches the entire string we reject it.
    matches = [];
    keys.forEach(function(key) {
        var value;

        value = boot.$uriExpandPath(cfg.at(key));
        if (path.indexOf(value) === 0 && path !== value) {
            matches.push([key, value]);
        }
    });

    switch (matches.length) {
        case 0:
            break;
        case 1:
            match = matches[0][1];
            replacement = matches[0][0];
            if (match.charAt(match.length - 1) === '/') {
                path = path.replace(match, replacement + '/');
            } else {
                path = path.replace(match, replacement);
            }
            break;
        default:
            //  Sort matches by value length and use the longest one.
            matches.sort(function(a, b) {
                if (a[1].length > b[1].length) {
                    return -1;
                } else if (b[1].length > a[1].length) {
                    return 1;
                } else {
                    //  lib comes before app...
                    if (a[0].indexOf('path.lib') !== -1 &&
                            b[0].indexOf('path.app') !== -1) {
                        return -1;
                    } else if (b[0].indexOf('path.lib') !== -1 &&
                            a[0].indexOf('path.app') !== -1) {
                        return 1;
                    }
                    return 0;
                }
            });
            match = matches[0][1];
            replacement = matches[0][0];
            if (match.charAt(match.length - 1) === '/') {
                path = path.replace(match, replacement + '/');
            } else {
                path = path.replace(match, replacement);
            }
            break;
    }

    path = path.replace(/^path\./, '~');

    //  Process any "last chance" conversion options.
    path = path.replace(this.$uriExpandPath('~lib'), '~lib');
    path = path.replace(this.$uriExpandPath('~app'), '~app');
    path = path.replace(this.$uriExpandPath('~'), '~');

    if (path.indexOf('/') !== -1 && path !== aPath) {
        path = TP.boot.$uriInTIBETFormat(path);
    }

    TP.boot.$$tibetURIS[aPath] = path;

    return path;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriIsAbsolute = function(aPath) {

    /**
     * Returns true if the path provided appears to be an absolute path. Note
     * that this will return true for TIBET virtual paths since they are
     * absolute paths when expanded.
     * @param {string} aPath The path to be tested.
     * @returns {Boolean} True if the path is absolute.
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
     * @returns {Boolean} True if the path is virtual.
     */

    return aPath.indexOf('~') === 0;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriJoinPaths = function(firstPath, secondPath) {

    /**
     * @method uriJoinPaths
     * @summary Returns the two path components joined appropriately. Note that
     *     the second path has precedence, meaning that if the second path
     *     appears to be an absolute path the first path isn't used.
     * @param {String} firstPath The 'root' path.
     * @param {String} secondPath The 'tail' path.
     * @returns {String} The two supplied paths joined together.
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
    if (secondPath.indexOf('/') === 0 || /^[a-zA-Z]{1}:/.test(secondPath)) {
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
    while (second.indexOf('..') === 0) {
        if (second.charAt(2) === '/') {
            second = second.slice(3, second.length);
        } else {
            second = second.slice(2, second.length);
        }
        first = first.slice(0, first.lastIndexOf('/'));
    }

    //  join the resulting chunks while paying attention to separator(s).
    if (first.charAt(first.length - 1) === '/') {
        if (second.charAt(0) === '/') {
            val = first + second.slice(1);
        } else if (second.charAt(0) === '#') {
            val = first.slice(-1) + second;
        } else {
            val = first + second;
        }
    } else {
        //  First does not end in '/'...
        if (second.charAt(0) === '/') {
            val = first + second;
        } else if (second.charAt(0) === '#') {
            val = first + second;
        } else {
            val = first + '/' + second;
        }
    }

    return val;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriMinusFileScheme = function(aPath) {

    /**
     * @method $uriMinusFileScheme
     * @summary Returns the filename trimmed of any leading file://[/] chars.
     *     This is often necessary for proper use based on host platform.
     * @param {String} aPath The path to trim.
     * @returns {String} The path trimmed of any leading file://[/] characters.
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
     * @method $uriPlusFileScheme
     * @summary Returns the filename padded with leading file://[/] chars. This
     *     is often necessary for proper use based on host platform.
     * @param {String} aPath The path to pad.
     * @returns {String} The supplied path padded with the proper leading
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
     * @method uriRelativeToPath
     * @summary Returns a "relativized" version of the firstPath at it relates
     *     to the second path. In essence, what path would you have to append to
     *     the secondPath to acquire the resource defined by the first path.
     * @summary This method is a core method for helping stored files remain
     *     "relocatable". When storing TIBET metadata or processed pages their
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
     * @returns {String} The relativized version of firstPath.
     */

    var file,
        first,
        second,
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
    if (first.length > 1 && first.lastIndexOf('/') === first.length - 1) {
        //  if the first path ended in a '/' we can safely remove it since
        //  it's the same directory path with or without the trailing /
        first = first.slice(0, -1);
    }

    //  normalize the second path next

    if (filePath === true) {
        //  forced to interpret second path as a file path, so if there's
        //  any / in the second path we use that as the point of trimming
        //  the last segment
        if (second.lastIndexOf('/') !== TP.NOT_FOUND) {
            if (second.lastIndexOf('/') === second.length - 1) {
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
        if (second.lastIndexOf('/') === second.length - 1) {
            second = second.slice(0, -1);
        }
    } else {
        //  try to determine if the second path is a file path or a
        //  directory path...the easiest check is does it end with a '/',
        //  after which we can check for an extension on the last portion
        if (second.lastIndexOf('/') === second.length - 1) {
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

        if (/^[a-zA-Z]{1}:/.test(path)) {
            //  NB: We start after the colon
            path = path.slice(2);
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
     * @method $uriWithRoot
     * @summary Returns the path provided with any additional root information
     * which is necessary to create a full path name. The root used is the
     * result of calling TP.boot.$getAppHead().
     * @param {String} targetUrl A url to expand as needed.
     * @param {String} aRoot The root path to use. Default is app head.
     * @returns {String} The url - after ensuring a root exists.
     */

    var url,
        base;

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
        base = TP.boot.$getAppHead();
    } else {
        base = aRoot;
    }

    return TP.boot.$uriJoinPaths(base, targetUrl);
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

TP.boot.$uriLoad = async function(targetUrl, resultType, targetType) {

    /**
     * @method $uriLoad
     * @summary Loads the content of a targetUrl, returning that content as
     *     either XML or text depending on the desired resultType.
     * @param {String} targetUrl URL of the target resource.
     * @param {TP.DOM|TP.TEXT} resultType Result as a DOM node or TEXT.
     * @param {String} targetType The nature of the target, 'source' or
     *     'manifest' are common values here.
     * @returns {XMLDocument|String} The XML document or String that was loaded
     *     from the targetUrl.
     */

    var returnType,
        result;

    if (targetUrl == null) {
        TP.boot.$stderr('InvalidURI');

        return null;
    }

    //  compute common result type from input and targetUrl extension.
    returnType = TP.boot.$uriResultType(targetUrl, resultType);

    if (targetUrl.toLowerCase().indexOf('file') === 0) {
        if (TP.sys.cfg('boot.moz_xpcom')) {
            //  if the uriLoadCommonFile has to switch into privilege mode
            //  for Moz/FF3+ then the flag will redirect so we don't waste
            //  time trying HTTP, we'll go straight to XPCOM
            result = TP.boot.$uriLoadMozFile(targetUrl, returnType);
        } else {
            result = TP.boot.$uriLoadCommonFile(targetUrl, returnType);
        }
    } else {
        result = await TP.boot.$uriLoadCommonHttp(targetUrl, returnType);
    }

    return result;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLoadCommonFile = function(targetUrl, resultType) {

    /**
     * @method $uriLoadCommonFile
     * @summary Loads (reads and produces an XML document for) targetUrl.
     * @param {String} targetUrl URL of the target file.
     * @param {TP.DOM|TP.TEXT} resultType Result as a DOM node or TEXT.
     * @returns {XMLDocument|String} The XML document or String that was loaded
     *     from the targetUrl.
     */

    var returnType,
        httpObj;

    returnType = TP.boot.$uriResultType(targetUrl, resultType);

    httpObj = TP.boot.$httpConstruct();

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

            return TP.boot.$uriLoadMozFile(targetUrl, returnType);
        }

        return null;
    }

    return TP.boot.$uriResult(httpObj.responseText, returnType);
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLoadIEFile = function(targetUrl, resultType) {

    /**
     * @method $uriLoadIEFile
     * @summary Loads (reads and produces an XML document for) targetUrl.
     * @param {String} targetUrl URL of the target file.
     * @param {TP.DOM|TP.TEXT} resultType Result as a DOM node or TEXT.
     * @returns {XMLDocument|String} The XML document or String that was loaded
     *     from the targetUrl.
     */

    var returnType,

        doc,

        httpObj;

    returnType = TP.boot.$uriResultType(targetUrl, resultType);

    if (returnType === TP.DOM) {
        //  leverage IE's ActiveX DOMDocument's ability to load synchronously
        doc = TP.boot.$activeXDocumentConstructIE();
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

        httpObj = TP.boot.$httpConstruct();

        try {
            httpObj.open(TP.HTTP_GET, targetUrl, false);
            httpObj.send(null);
        } catch (e) {
            //  An exception is thrown with 'The system cannot locate the
            //  resource specified' if file isn't there
            return null;
        }

        return TP.boot.$uriResult(httpObj.responseText, returnType);
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLoadMozFile = function(targetUrl, resultType) {

    /**
     * @method uriLoadMozFile
     * @summary Loads (reads and produces an XML document for) targetUrl. This
     *     version is specific to Mozilla 1.3+ browsers.
     * @param {String} targetUrl URL of the target file.
     * @param {TP.DOM|TP.TEXT} resultType Result as a DOM node or TEXT.
     * @exception URINotFound
     * @exception AccessViolation
     * @exception DOMParseException
     * @exception PrivilegeViolation
     * @exception URIComponentException
     * @returns {XMLDocument|String} The XML document or String that was loaded
     *     from the targetUrl.
     * @since 2.0
     */

    var returnType,

        FP,
        IOS,
        IS,

        file,
        fname,

        channel,
        stream,

        text;

    returnType = TP.boot.$uriResultType(targetUrl, resultType);

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

        /* eslint-disable array-bracket-spacing */
        IOS = Components.classes[
            '@mozilla.org/network/io-service;1'].getService(
                    Components.interfaces.nsIIOService);
        /* eslint-enable array-bracket-spacing */

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

            return TP.boot.$uriResult(text, returnType);
        }
    } catch (e) {
        TP.boot.$stderr('AccessViolation: ' + targetUrl,
                        TP.boot.$ec(e));

        return;
    }

    return null;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLoadCommonHttp = async function(targetUrl, resultType) {

    /**
     * @method $uriLoadCommonHttp
     * @summary Loads (reads and produces an XML document for) targetUrl.
     * @param {String} targetUrl URL of the target resource.
     * @param {TP.DOM|TP.TEXT} resultType Result as a DOM node or TEXT.
     * @returns {XMLDocument|String} The XML document or String that was loaded
     *     from the targetUrl.
     */

    var returnType,
        req,
        res,
        text;

    returnType = TP.boot.$uriResultType(targetUrl, resultType);

    try {
        req = new Request(
                    targetUrl,
                    {
                        method: TP.HTTP_GET
                    });

        res = await fetch(req);
        text = await res.text();

        if (res.status === 200) {
            return TP.boot.$uriResult(text, returnType);
        } else if (res.status === 304) {
            return null;
        } else if (res.status === 0) {
            if (/^chrome-extension/.test(targetUrl) && text !== null) {
                return TP.boot.$uriResult(text, returnType);
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
     * @method $uriResult
     * @summary Returns the proper result object given the result text and
     *     result type, typically from an XMLHTTPRequest's responseText.
     * @param {String} text The response text to process.
     * @param {TP.DOM|TP.TEXT|null} type The result type desired.
     * @returns {String|Document} An XML document or the response text.
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
    if (TP.boot.$isValid(doc) && doc.childNodes.length > 0) {
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
     * @method $uriResultType
     * @summary Returns a reasonable result type, TP.TEXT or TP.DOM, based on
     *     examination of the targetUrl's extension. The extensions for XML are
     *     kept in TP.boot.$xmlMimes so if a match isn't happening check there.
     *     If a resultType is provided it is always returned as the result.
     * @param {String} targetUrl A url to define a result type for.
     * @param {TP.DOM|TP.TEXT} [resultType] A result type constant.
     * @returns {Number} TP.DOM|TP.TEXT
     */

    var ext;

    if (TP.boot.$isValid(resultType)) {
        return resultType;
    }

    //  We slice 1 past the last index of since we want to slice off the '.' as
    //  well.
    ext = targetUrl.slice(targetUrl.lastIndexOf('.') + 1);

    if (TP.boot.$notEmpty(TP.boot.$xmlMimes[ext])) {
        return TP.DOM;
    }

    return TP.TEXT;
};

//  ============================================================================
//  DOM FUNCTIONS
//  ============================================================================

/*
Minimal functions to support boot system requirements for new documents.
*/

//  ----------------------------------------------------------------------------

TP.boot.$activeXDocumentConstructIE = function(versionNumber) {

    /**
     * @method $activeXDocumentConstructIE
     * @summary Creates a DOM document element for use.
     * @param {Number} versionNumber A specific version number which must be
     *     returned as a minimum version.
     * @returns {XMLDocument} A new XML document.
     */

    var doc,

        versions,
        len,
        i;

    if (versionNumber != null && typeof versionNumber === 'number') {
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
                        // 'Msxml2.DOMDocument.5.0',
                        // 'Msxml2.DOMDocument.4.0',
                        'Msxml2.DOMDocument.3.0',
                        'Msxml2.DOMDocument'];
        len = versions.length;

        for (i = 0; i < len; i++) {
            try {
                doc = new ActiveXObject(versions[i]);
                break;
            } catch (e) {
                //  empty
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

TP.boot.$documentAddCSSStyleElement = function(aDocument, styleText) {

    /**
     * @method $documentAddCSSStyleElement
     * @summary Adds a 'style' element to the target document with the
     *     optionally provided styleText as the rule text.
     * @param {Document} [aDocument=TP.sys.getLaunchDocument()] The document
     *     to which the new style element should be added.
     * @param {String} [styleText] The optional rule text to use in the newly
     *     created style element.
     * @returns {HTMLElement} The new style element that was added.
     */

    var doc,
        head,
        elem,
        text;

    doc = aDocument || TP.sys.getLaunchDocument();
    head = doc.getElementsByTagName('head')[0];

    if (TP.boot.$notValid(head)) {
        return;
    }

    //  Create the new 'style' element.
    elem = doc.createElement('style');
    elem.setAttribute('type', 'text/css');

    elem = head.appendChild(elem);

    if (TP.boot.$isString(styleText)) {
        text = elem.firstChild;
        if (TP.boot.$notValid(text)) {
            elem.appendChild(doc.createTextNode(styleText));
        } else {
            elem.nodeValue = styleText;
        }
    }

    return elem;
};

//  ----------------------------------------------------------------------------

TP.boot.$documentConstruct = function(versionNumber) {

    /**
     * @method $documentConstruct
     * @summary Creates a DOM document element for use.
     * @param {Number} versionNumber A specific version number which must be
     *     returned as a minimum version.
     * @returns {XMLDocument} A new XML document.
     */

    return document.implementation.createDocument('', '', null);
};

//  ----------------------------------------------------------------------------

TP.boot.$documentGetElementById = function(xmldoc, id) {

    /**
     * @method $documentGetElementById
     * @summary Returns a descendant element of the document provided which has
     *     the ID given.
     * @param {XMLDocument} xmldoc The document to query.
     * @param {String} id The ID of the element to find.
     * @returns {Element} The found element or undefined.
     */

    return xmldoc.querySelector('*[id="' + id + '"]');
};

//  ----------------------------------------------------------------------------

TP.boot.$documentGetWindow = function(aDocument) {

    /**
     * @method $documentGetWindow
     * @summary Returns the document's window if possible. This routine will try
     *     both standard defaultView and HTML Import approaches.
     * @param {Document} aDocument The document to query for window.
     * @returns {Window} The window object or undefined.
     */

    var win;

    try {
        win = aDocument.defaultView ||
                aDocument.currentScript.ownerDocument.defaultView;
    } catch (e) {
        //  Ignore if we can't traverse the path above.
        void 0;
    }

    return win;
};

//  ----------------------------------------------------------------------------

TP.boot.$$nodeAppendError = function(errEvent) {

    /**
     * @method $$nodeAppendError
     * @summary An error handler for $nodeAppendChild onerror hook processing.
     *     Many errors can be caught by the global onerror handler but a missing
     *     file cannot be trapped that way, you have to use a local onerror hook
     *     on the script node itself.
     */

    //  NOTE the setTimeout here is to keep Chrome DevTools from crashing.
    setTimeout(function() {
        TP.boot.$stderr('Error locating ' + errEvent.target.src, TP.FATAL);
        $STATUS = TP.FAILED;
    }, 0);
};

//  ----------------------------------------------------------------------------

TP.boot.$nodeAppendChild = function(aNode, newNode, shouldThrow) {

    /**
     * @method $nodeAppendChild
     * @summary Appends the newNode to the supplied node.
     * @param {Node} aNode The node to append the child node to.
     * @param {Node} newNode The node to append to aNode.
     * @param {Boolean} shouldThrow True to cause errors to throw a native Error
     *     so outer catch blocks will trigger.
     * @returns {Node} The new node. This may be a different node than what was
     *     supplied to this routine, as the node might have been imported.
     */

    var nodeDoc,
        theNode;

    try {
        //  Appending content with syntax errors to the head, as when
        //  doing a source import, won't throw (so catch blocks won't
        //  work),  but the onerror hook will set a non-zero $STATUS.
        $STATUS = 0;
        $ERROR = null;

        //  Files that are missing entirely need an onerror hook to catch them
        //  and report properly.
        newNode.onerror = TP.boot.$$nodeAppendError;

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
    } catch (e) {
        $ERROR = e;
    } finally {
        /* eslint-disable no-unsafe-finally */
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
        /* eslint-enable no-unsafe-finally */
    }

    return theNode;
};

//  ----------------------------------------------------------------------------

TP.boot.$nodeInsertBefore = function(aNode, newNode, insertionPointNode) {

    /**
     * @method $nodeInsertBefore
     * @summary Inserts the newNode into the child content of the supplied node
     *     before the supplied insertion point node. If insertionPointNode is
     *     null, then the new node is just appended to the child content of the
     *     supplied node.
     * @param {Node} anElement The node to insert the child content into.
     * @param {Node} newNode The node to insert into aNode.
     * @param {Node} insertionPointNode The node to use as an insertion point.
     *     The new content will be inserted before this point.
     * @returns {Node} The new node. This may be a different node than what was
     *     supplied to this routine, as the node might have been imported.
     */

    var nodeDoc,
        theNode;

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

    return theNode;
};

//  ----------------------------------------------------------------------------

TP.boot.$nodeReplaceChild = function(aNode, newNode, oldNode) {

    /**
     * @method $nodeReplaceChild
     * @summary Replaces the oldNode in the supplied node with the newNode.
     * @param {Node} aNode The node to replace the child in.
     * @param {Node} newNode The node to replace oldNode with.
     * @param {Node} oldNode The node to be replaced with newNode.
     * @returns {Node} The new node. This may be a different node than what was
     *     supplied to this routine, as the node might have been imported.
     */

    var nodeDoc,
        theNode;

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

    return theNode;
};

//  ============================================================================
//  NODE/STRING CONVERSION
//  ============================================================================

/*
nodeAsString and documentFromString processing to help with XML processing
*/

//  ----------------------------------------------------------------------------

TP.boot.$documentFromString = function(aString, shouldThrow) {

    /**
     * @method $documentFromString
     * @summary Parses aString and returns the XML node representing the root
     *     element of the string's DOM representation.
     * @param {String} aString The source string to be parsed.
     * @param {Boolean} [shouldThrow=false] Should parse errors throw?
     * @returns {Node}
     */

    return TP.boot.$documentFromStringCommon(aString, shouldThrow);
};

//  ----------------------------------------------------------------------------

//  parse once by defining externally to the function we'll use this in
if (TP.sys.isUA('GECKO')) {
    TP.boot.$$xmlParseErrorMsgMatcher =
        /XML Parsing Error: ([^\n]+)\nLocation: [^\n]+\nLine Number (\d+), Column (\d+)/;
} else { // if (TP.sys.isUA('WEBKIT')) {
    TP.boot.$$xmlParseErrorMsgMatcher =
        /error on line (\d+) at column (\d+): ([^<]+)/;
}

//  ----------------------------------------------------------------------------

TP.boot.$documentFromStringCommon = function(aString, shouldThrow) {

    /**
     * @method $documentFromStringCommon
     * @summary Parses aString and returns the XML node representing the root
     *     element of the string's DOM representation.
     * @param {String} aString The source string to be parsed.
     * @param {Boolean} [shouldThrow=false] Should parse errors throw?
     * @returns {XMLDocument} The XML document created from the supplied String.
     */

    var parser,
        xmlDoc,
        str,
        errorElement,
        errorMatchResults;

    parser = new DOMParser();
    xmlDoc = parser.parseFromString(aString, 'application/xml');
    if (TP.boot.$isValid(errorElement =
            xmlDoc.getElementsByTagName('parsererror')[0])) {

        str = TP.boot.$nodeAsString(errorElement);
        errorMatchResults = TP.boot.$$xmlParseErrorMsgMatcher.exec(str);

        if (TP.boot.$isValid(errorMatchResults)) {
            str = errorMatchResults[0];
        }

        if (shouldThrow) {
            throw new Error(str);
        }

        //  don't log, we use this call in logging - but go ahead and output to
        //  the browser console

        /* eslint-disable no-console */
        console.log(str);
        /* eslint-enable no-console */

        return null;
    }

    return xmlDoc;
};

//  ----------------------------------------------------------------------------

TP.boot.$documentFromStringIE = function(aString, shouldThrow) {

    /**
     * @method $documentFromStringIE
     * @summary Parses aString and returns the XML node representing the root
     *     element of the string's DOM representation.
     * @param {String} aString The source string to be parsed.
     * @param {Boolean} [shouldThrow=false] Should parse errors throw?
     * @returns {XMLDocument} The XML document created from the supplied String.
     */

    var xmlDoc,

        successfulParse,
        parseErrorObj;

    xmlDoc = TP.boot.$activeXDocumentConstructIE();

    successfulParse = xmlDoc.loadXML(aString);

    if (successfulParse === false) {
        parseErrorObj = xmlDoc.parseError;

        if (shouldThrow) {
            throw new Error(parseErrorObj);
        }

        //  don't log, we use this call in logging - but go ahead and output to
        //  the browser console
        /* eslint-disable no-console */
        console.log(parseErrorObj);
        /* eslint-enable no-console */

        return null;
    }

    return xmlDoc;
};

//  ----------------------------------------------------------------------------

TP.boot.$nodeAsString = function(aNode) {

    /**
     * @method $nodeAsString
     * @summary Returns the string representation of aNode.
     * @param {Node} aNode The node to transform.
     * @returns {String} The String representation of the supplied Node.
     */

    return TP.boot.$nodeAsStringCommon(aNode);
};

//  ----------------------------------------------------------------------------

TP.boot.$nodeAsStringCommon = function(aNode) {

    /**
     * @method $nodeAsStringMoz
     * @summary Returns the string representation of aNode.
     * @param {Node} aNode The node to transform.
     * @returns {String} The String representation of the supplied Node.
     */

    var str;

    if (aNode == null) {
        return '';
    }

    try {
        str = new XMLSerializer().serializeToString(aNode);

        return str;
    } catch (e) {
        return '';
    }
};

//  ============================================================================
//  WINDOWING / DISPLAY
//  ============================================================================

TP.boot.$currentDocumentLocation = function() {

    /**
     * @method $currentDocumentLocation
     * @summary Returns the enclosing document's location, minus the docname
     *     itself and any parameters on the URI.
     * @returns {String} The document's location.
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
     * @method getWindowById
     * @summary Returns a reference to the window with the ID provided. This
     *     method tries a number of variations to locate a window whose name may
     *     be '.' separated without actually using the open call because we
     *     don't want the side effect of opening a window if the named one
     *     doesn't exist.
     * @param {String} anID A window/frame name.
     * @param {Window} aWindow A native window to root the search.
     * @returns {Window} A native window reference.
     */

    var context,
        parts,
        id,
        arr,
        current,
        frame,
        doc,
        win,
        next,
        name;

    //  not a string? might be a window already
    if (typeof anID !== 'string') {
        if (TP.boot.$isWindow(anID)) {
            return anID;
        }
        return;
    }

    //  Default is we work from the launch window downward, which means we may
    //  not find things rooted at top if we didn't boot into top.
    context = aWindow || TP.sys.getLaunchWindow();

    //  Three most common names in typical TIBET code (top, UIBOOT, UIROOT):
    switch (anID.toLowerCase()) {
        case 'top':
            return top;
        case 'uiroot':
            frame = TP.boot.getUIRoot();
            if (frame) {
                doc = frame.contentDocument;
                if (doc !== undefined) {
                    return doc.defaultView;
                }
            }
            return;
        case 'uiboot':
            frame = TP.boot.getUIBoot();
            if (frame) {
                doc = frame.contentDocument;
                if (doc !== undefined) {
                    return doc.defaultView;
                }
            }
            return;
        default:
            break;
    }

    //  shortcut for UIROOT and UIROOT.SCREEN_0 which are common lookups based
    //  on the canvas in either standard or sherpa-enabled operation.
    if (TP.boot.$isWindow(context[anID])) {
        return context[anID];
    } else if (TP.boot.$isElement(context[anID])) {
        return context[anID].contentWindow;
    } else if (/UIROOT.SCREEN_0/.test(anID)) {
        return context.UIROOT && context.UIROOT.SCREEN_0;
    }

    //  if we got a TIBET URI then we've got to split out the canvas ID.
    if (anID.indexOf('tibet:') === 0) {
        //  have to split into parts to get canvas ID. if we don't match its
        //  actually an invalid ID. if we match but path is empty then its
        //  shorthand for the current uicanvas
        if (TP.boot.$isValid(parts = anID.match(TP.TIBET_URI_SPLITTER))) {
            //  whole, jid, resource, canvas, path, pointer

            //  if there is a 'path', then this is not just a TIBET URI to a
            //  Window, so we exit here, returning nothing
            if (parts[4] != null && parts[4] !== '') {
                return;
            }

            id = parts[3] || 'uicanvas';
        } else {
            return;
        }
    } else {
        id = anID;
    }

    //  UICANVAS is special since it's a virtual name for another window. We
    //  need the actual window name.
    if (id === 'uicanvas' || id === 'UICANVAS') {
        if (typeof TP.sys.getUICanvasName === 'function') {
            id = TP.sys.getUICanvasName();
        } else {
            //  Not booted yet. No real way to know but we can guess UIBOOT.
            win = TP.boot.getUIBoot();
            if (TP.boot.$isWindow(win)) {
                return win;
            }
            return;
        }
    }

    //  Normalize any path-style names to dot-separated syntax.
    id = id.replace(/\//g, '.');

    //  Watch out for certain pathologies found in some TIBET URIs.
    if (TP.BAD_WINDOW_ID_REGEX.test(id)) {
        return;
    }

    //  And the other obvious things...
    if (context.name === id) {
        return context;
    }

    //  Iterate, stopping at each level to check for a window IFRAME and/or name
    //  value since things like top.name aren't globals you can find otherwise.
    arr = id.split('.');
    current = context;

    /* eslint-disable no-cond-assign */
    while (name = arr.shift()) {
        if (current.name === name) {
            continue;
        }

        next = current[name];
        if (TP.boot.$isWindow(next)) {
            current = next;
            continue;
        } else if (TP.boot.$isElement(next) &&
                TP.boot.$isWindow(next.contentWindow)) {
            current = next.contentWindow;
            continue;
        }

        next = current.document.getElementById(name);
        if (TP.boot.$isElement(next) &&
                TP.boot.$isWindow(next.contentWindow)) {
            current = next.contentWindow;
            continue;
        }

        //  Not found, bail out.
        return;
    }
    /* eslint-enable no-cond-assign */

    return current;
};

//  ----------------------------------------------------------------------------

TP.windowIsInstrumented = function(nativeWindow) {

    /**
     * @method windowIsInstrumented
     * @summary Returns true if the window provided has been instrumented with
     *     TIBET base window functionality. If no window is provided this method
     *     returns true since the receiving window is clearly instrumented :).
     * @param {Window} nativeWindow A window to test. If none is provided the
     *     receiver is tested.
     * @returns {Boolean} Whether or not the window is instrumented.
     */

    //  if no window is passed in treat it like a query for local window
    if (nativeWindow == null) {
        return window.$$instrumented === true;
    }

    //  check out the window...might not be a window ;)
    if (typeof nativeWindow.location === 'undefined') {
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
The simple DHTML primitives needed to manage startup processes like showing a
simple progress bar or displaying a console-style output log.

NOTE that these are trivial and not likely to work in all circumstances, but
then again they're only intended to get us through the initial boot sequence.
After that the versions in the kernel take over.
*/

//  ----------------------------------------------------------------------------

TP.boot.$elementAddClass = function(anElement, aClassname) {

    /**
     * @method $elementAddClass
     * @summary Adds a CSS class name to the element if it is not already
     *     present.
     * @param {Element} anElement The element to add the CSS class to.
     * @param {String} aClassname The CSS class name to add.
     * @exception InvalidElement
     * @exception InvalidString
     * @returns {HTMLElement} The element the supplied class was added to.
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

    /**
     * @method $elementHasClass
     * @summary Returns true if the element has the CSS class name specified.
     * @param {Element} anElement The element to test.
     * @param {String} className The CSS class name to test for.
     * @exception TP.sig.InvalidElement
     * @returns {Boolean} Whether or not the element has the supplied CSS class.
     */

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
     * @method elementReplaceClass
     * @summary Replaces the old CSS class name in anElement's 'className' CSS
     *     class list with the new CSS class name.
     * @param {Element} anElement DOM Node of type Node.ELEMENT_NODE.
     * @param {String} oldClassName The CSS class name to replace.
     * @param {String} newClassName The CSS class name to replace it with.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidString
     * @returns {HTMLElement} The element.
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

    //  If pattern doesn't match this is a simple add operation.
    if (!re.test(cls)) {
        return TP.boot.$elementAddClass(anElement, aClassname);
    }

    //  Find/remove the matching classname chunk(s)
    parts = cls.split(' ');
    parts = parts.filter(
                function(part) {
                    return !re.test(part) && part !== aClassname;
                });
    parts.push(aClassname);

    anElement.className = parts.join(' ');

    return anElement;
};

//  ----------------------------------------------------------------------------

TP.boot.$elementSetInnerContent = function(anElement, theContent) {

    /**
     * @method $elementSetInnerContent
     * @summary Sets the 'inner content' of anElement.
     * @summary This method sets the 'inner content' of anElement to
     *     theContent which means that just the contents of the element, not
     *     including its start and end tags, will be replaced with theContent.
     * @param {HTMLElement} anElement The element to set the 'inner content' of.
     * @param {String} theContent The content to replace the 'inner content' of
     *     anElement with.
     */

    if (anElement && anElement.ownerDocument) {
        anElement.innerHTML = theContent;
    }
};

//  ============================================================================
//  DISPLAY HELPERS
//  ============================================================================

TP.boot.$stringify = function(anObject, aSeparator, shouldEscape, depth) {

    /**
     * @method anObject
     * @summary Dumps an object's key/value pairs in sorted order. This is used
     *     to produce output for configuration and environment data. By sorting
     *     the keys we make it a little easier to find specific properties
     *     quickly.
     * @param {Object} anObject The object to dump.
     * @param {String} [aSeparator] An optional separator string used to
     *     separate entries. Default is '\n'.
     * @param {Boolean} [shouldEscape=false] Whether or not to escape XML
     *     constructs.
     * @param {Number} [depth] The recursion 'depth' to dump an object to. If
     *     this is not specified, this method may recurse indefinitely.
     * @returns {String} A formatted object string.
     */

    var str,
        i,
        arr,
        len,
        keys,
        key,
        sep,
        val,
        type;

    //  Try this, but know that you may get 'object' for things that aren't
    //  primitive values for String, Number, etc.
    type = typeof anObject;

    switch (type) {
        case 'string':

            //  Bit of a hack here, but we don't really want rafts of html
            //  showing up in the log and certain types of request failures etc.
            //  are full of 'target: ' where the target was a document.
            if (/<!DOCTYPE html><html/.test(anObject)) {
                str = anObject.replace(/\n/g, '__NEWLINE__');
                str = str.replace(/<!DOCTYPE html><html(.*)?<\/html>/g,
                                  '<html>...</html>');
                str = str.replace(/'__NEWLINE__'/g, '\n');
            } else {
                str = anObject;
            }

            if (shouldEscape === true) {
                return TP.boot.$xmlEscape(str);
            } else {
                return str;
            }
        case 'number':
            //  isNaN lies: isNaN({}) => true. Welcome to JavaScript.
            if (isNaN(anObject) && anObject.constructor === Number) {
                return 'NaN';
            } else {
                return '' + anObject;
            }
        case 'boolean':
            return anObject;
        case 'function':
            //  Have to try catch even this due to libs like sinon that override
            //  toString and then throw if you try to serialize the "class".
            try {
                str = anObject.toString();
            } catch (e) {
                str = Object.prototype.toString.call(anObject);
            }
            if (shouldEscape === true) {
                return '<pre><![CDATA[' + str +
                    ']]></pre>';
            } else {
                return str;
            }
        default:
            if (anObject === null) {
                return 'null';
            }

            if (anObject === undefined) {
                return 'undefined';
            }

            if (anObject instanceof String) {
                return '' + anObject;
            }

            if (anObject instanceof Boolean) {
                return '' + anObject;
            }

            if (anObject instanceof Number) {
                return '' + anObject;
            }

            if (anObject instanceof Date) {
                return anObject.toISOString();
            }

            if (anObject instanceof RegExp) {
                try {
                    str = anObject.toString();
                } catch (e) {
                    str = Object.prototype.toString.call(anObject);
                }

                if (shouldEscape === true) {
                    return TP.boot.$xmlEscape(str);
                } else {
                    return str;
                }
            }

            if (anObject instanceof Error) {
                str = anObject.message || anObject.name;
                if (shouldEscape === true) {
                    return TP.boot.$xmlEscape(str);
                } else {
                    return str;
                }
            }

            if (anObject instanceof TP.boot.Annotation) {
                //  TODO: Do we want the object portion here as well?
                str = anObject.message;
                if (shouldEscape === true) {
                    return TP.boot.$xmlEscape(str) +
                        TP.boot.$xmlEscape(TP.boot.$stringify(anObject.object));
                } else {
                    return str + TP.boot.$stringify(anObject.object);
                }
            }

            if (TP.boot.$isValid(anObject.nodeType)) {
                return TP.boot.$xmlEscape(TP.boot.$nodeAsString(anObject));
            }

            //  isNaN lies: isNaN({}) => true. Welcome to JavaScript. Oh...but
            //  it gets better. If you run isNaN on the wrong thing it'll throw
            //  an exception about being unable to convert to a primitive.
            try {
                if (isNaN(anObject) && anObject.constructor === Number) {
                    return 'NaN';
                }
            } catch (e) {
                void 0;
            }

            break;
    }

    //  For now we don't drill deeper than one level. Not all objects will
    //  respond well to a simple string + obj form so call the root toString if
    //  there's an exception ala 'Cannot convert object to primitive value'.
    if (depth && depth > 0) {
        if (anObject.getName) {
            return anObject.getName();
        }
        try {
            str = anObject.asString();
        } catch (e) {
            try {
                str = Object.prototype.toString.call(anObject);
            } catch (e2) {
                return '[object Object]';
            }
        }

        if (shouldEscape === true) {
            return TP.boot.$xmlEscape(str);
        } else {
            return str;
        }
    }

    sep = ' => ';
    if (shouldEscape === true) {
        sep = TP.boot.$xmlEscape(sep);
    }
    arr = [];

    if (anObject instanceof Array) {

        //  Could use map() here but this works consistently.
        len = anObject.length;
        for (i = 0; i < len; i++) {
            arr.push(TP.boot.$stringify(anObject[i], aSeparator, shouldEscape, 1));
        }

    } else {

        if (typeof anObject.getKeys === 'function') {
            keys = anObject.getKeys();
        } else {
            try {
                keys = Object.keys(anObject);
            } catch (e) {
                try {
                    //  Some objects don't even like Object.keys....sigh...
                    return Object.prototype.toString.call(anObject);
                } catch (e2) {
                    return '[object Object]';
                }
            }
        }

        keys.sort();

        len = keys.length;
        if (len === 0) {
            arr.push('{}');
        } else {
            for (i = 0; i < len; i++) {
                key = keys[i];
                if (/^\$\$/.test(key)) {
                    continue;
                }
                if (typeof anObject.at === 'function') {
                    val = anObject.at(key);
                } else {
                    val = anObject[key];
                }

                str = TP.boot.$stringify(val, aSeparator, shouldEscape, 1);
                arr.push(key + sep + str);
            }
        }
    }

    return arr.join(aSeparator || '\n');
};

//  ----------------------------------------------------------------------------

TP.boot.$xmlEscape = function(aString) {

    /**
     * @method $xmlEscape
     * @summary Converts the supplied String into a String where any XML
     *     entities have been converted into their escaped equivalent (i.e. have
     *     been "entitified")
     * @param {String} aString The String to escape.
     * @returns {String} The receiver with escaped XML entities.
     */

    var result;

    result = aString.replace(/[<>'"]/g, function(aChar) {
        switch (aChar) {
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '\'':
                return '&apos;';
            case '"':
                return '&quot;';
            default:
                break;
        }
    });

    //  Replace all '&' that are *not* part of an entity with '&amp;'
    result = result.replace(/&(?!([a-zA-Z]+|#(x)?[0-9]+);)/g, '&amp;');

    //  Replace &nbsp; with &#160;.
    result = result.replace(/&nbsp;/g, '&#160;');

    return result;
};

//  ----------------------------------------------------------------------------

TP.boot.$join = function(varargs) {

    /**
     * @method $join
     * @summary Returns a string built from joining the various arguments to
     *     the function.
     * @param {arguments} varargs The first of a set of variable arguments.
     * @returns {String} A String built from the joined arguments.
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
     * @method $lpad
     * @summary Returns a new String representing the obj with a leading number
     *     of padChar characters according to the supplied length.
     * @param {Object} obj The object to format with leading characters.
     * @param {Number} length The number of characters to pad the String
     *     representation with.
     * @param {String} padChar The pad character to use to pad the String
     *     representation.
     * @returns {String} The 'left padded' String.
     */

    var str,
        pad,
        count;

    str = '' + obj;

    if (!length) {
        return str;
    }

    pad = padChar || ' ';
    count = length - str.length;

    while (count--) {
        str = pad + str;
    }

    return str;
};

//  ----------------------------------------------------------------------------

TP.boot.$quoted = function(aString) {

    /**
     * @method $quoted
     * @summary Returns the supplied String as a quoted String with embedded
     *     quotes escaped. The quote character used is a single quote in keeping
     *     with TIBET coding standards which use single quoted strings for
     *     JavaScript and double quoted strings for *ML.
     * @param {String} aString The String to quote.
     * @returns {String} The string as a quoted string.
     */

    return '\'' + aString.replace(/'/g, '\\\'') + '\'';
};

//  ----------------------------------------------------------------------------

TP.boot.$rpad = function(obj, length, padChar) {

    /**
     * @method $rpad
     * @summary Returns a new String representing the obj with a trailing number
     *     of padChar characters according to the supplied length.
     * @param {Object} obj The object to format with trailing characters.
     * @param {Number} length The number of characters to pad the String
     *     representation with.
     * @param {String} padChar The pad character to use to pad the String
     *     representation. Note that if the padChar is an entity such as &#160;
     *     it is counted as having length 1.
     * @returns {String} The 'right padded' String.
     */

    var str,
        pad,
        count;

    str = '' + obj;

    if (!length) {
        return str;
    }

    pad = padChar || ' ';
    count = length - str.length;

    while (count--) {
        str = str + pad;
    }

    return str;
};

//  ----------------------------------------------------------------------------

TP.boot.$str = function(anObject, aSeparator) {

    /**
     * @method $str
     * @summary Returns a string representation of the object provided. This
     *     simple version is a basic wrapper for toString. The TIBET kernel
     *     provides a method which can produce more specialized responses to
     *     this request.
     * @param {Object} anObject The object whose string value is being
     *     requested.
     * @param {String} aSeparator The string to use as a record separator.
     * @returns {String} A string of some form, even when empty.
     */

    if (anObject !== null) {
        if (anObject === undefined) {
            return 'undefined';
        }

        try {
            //  try to get decent string from Error objects
            if (typeof anObject.message === 'string') {
                return anObject.message;
            } else {
                return TP.boot.$stringify(anObject, aSeparator || ', ');
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
     * @method $trim
     * @summary Returns a new String representing the parameter with any
     *     leading and trailing whitespace removed.
     * @param {String} aString The string to trim.
     * @returns {String} The String with whitespace trimmed.
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
        void 0;
    }

    return str.slice(0, i + 1);
};

//  ============================================================================
//  SIMPLE LOG MESSAGE ANNOTATIONS
//  ============================================================================

TP.boot.Annotation = function(anObject, aMessage) {

    /**
     * @method TP.boot.Annotation
     * @summary Contructor for a log message annotations. This construct
     *     is used by all TIBET logs although it is wrapped by higher-level
     *     objects once the kernel has loaded.
     * @returns {TP.boot.Annotation} A new instance.
     */

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
     * @method as
     * @summary Returns the receiver formatted to the type or format provided.
     * @param {Object} typeOrFormat The type, typename, or format to use.
     * @param {TP.core.Hash} formatParams Option parameters for the formatting
     *     process.
     * @returns {String} The receiver formatted to the type or format provided.
     */

    var type,
        args;

    if (TP.boot.$notValid(type = TP.sys.getTypeByName(typeOrFormat))) {
        return typeOrFormat.transform(this, formatParams);
    }

    //  if we got here we're either talking to a type that can't tell us
    //  what its name is (not good) or the receiver doesn't implement a
    //  decent as() variant for that type. In either case however all we can
    //  do is hope the type implements from() and we'll try that approach.
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

TP.boot.Annotation.prototype.asDumpString = function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    return TP.boot.$join('[TP.boot.Annotation :: ',
                            TP.boot.$str(this.object), ',',
                            TP.boot.$str(this.message), ']');
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.asHTMLString = function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     */

    return TP.boot.$join(
            '<span class="TP_boot_Annotation">',
            '<span data-name="object">', TP.htmlstr(this.object), '</span>',
            '<span data-name="message">', TP.htmlstr(this.message), '</span>',
            '</span>');
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.asJSONSource = function() {

    /**
     * @method asJSONSource
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
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty TP_boot_Annotation">' +
                '<dt>Type name</dt>' +
                '<dd class="pretty typename">' +
                    'TP.boot.Annotation' +
                '</dd>' +
                '<dt class="pretty key">object</dt>' +
                '<dd class="pretty value">' +
                    TP.boot.$str(this.object) +
                '</dd>' +
                '<dt class="pretty key">message</dt>' +
                '<dd class="pretty value">' +
                    TP.boot.$str(this.message) +
                '</dd>' +
                '</dl>';
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.asSource = function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    return TP.boot.$join('TP.boot.$annotate(\'',
                            TP.boot.$str(this.object), '\',\'',
                            TP.boot.$str(this.message), '\')');
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.asString = function() {

    /**
     * @method asString
     * @summary Returns the receiver as a simple string. Just the message is
     *     used for this.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    return '' + this.message;
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.asXMLString = function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     */

    return TP.boot.$join('<instance type="TP.boot.Annotation"',
                            ' object="', TP.boot.$str(this.object), '"',
                            ' message="', TP.boot.$str(this.message), '"/>');
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.get = function(attributeName) {

    /**
     * Returns the value of the attribute name provided.
     * @param {String} attributeName The name of the slot to return.
     * @returns {Object} The value of the slot name.
     */

    return this[attributeName];
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.getTypeName = function() {

    /**
     * @method getTypeName
     * @summary Returns the receiver's type name.
     * @returns {String} The receiver's type name.
     */

    return 'TP.boot.Annotation';
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.getSupertypes = function() {

    /**
     * @method getSupertypes
     * @summary Returns an Array of the receiver's supertypes.
     * @returns {Object[]} The Array of the receiver's supertypes.
     */

    return [Object];
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.toString = function() {

    /**
     * @method toString
     * @summary Returns a String representation of the receiver.
     * @returns {String} The String representation of the receiver.
     */

    return TP.boot.$join(TP.boot.$str(this.message),
                            ' [', TP.boot.$str(this.object), ']');
};

//  ----------------------------------------------------------------------------

TP.boot.$annotate = function(anObject, aMessage) {

    /**
     * @method $annotate
     * @summary Creates an annotated object, essentially a simple pairing
     *     between an object and an associated label or message. Often used for
     *     logging Node content without having to convert the Node into a string
     *     to bind it to an associated message.
     * @param {Object} anObject The object to annotate.
     * @param {String} aNote The note to annotate the object with.
     * @returns {Object} An object whose keys include 'object' and 'message'
     *     such that a standard query can find those values.
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
     * @method $ec
     * @summary TP.core.Exception.create shortcut, later replaced by a
     *     full-featured version that ensures the resulting object can take
     *     advantage of TP.core.Exception's implementation of asString.
     * @param {Error} anError A native error object.
     * @param {String} aMessage A related string, usually a context-specific
     *     explanation of the native error.
     * @returns {Object} An object whose keys include 'object' and 'message'
     *     such that a standard query can find those values.
     */

    return TP.boot.$annotate(anError, aMessage);
};

//  ============================================================================
//  Boot Log
//  ============================================================================

/*
 * Methods to manage the boot log.
 */

TP.boot.$flushLog = function(forceUIUpdate) {

    /**
     * @method $flushLog
     * @summary Flushes the current log entries into the GUI element
     *     representing the log and scrolls that element.
     * @param {Boolean} [forceUIUpdate=false] Whether or not to force a UI
     *     update whether the GUI buffer size has been reached or not.
     */

    //  NB: This only really flushes the UI buffer if the buffer size has been
    //  reached or forceUIUpdate is true.
    TP.boot.$flushUIBuffer(forceUIUpdate);

    if (forceUIUpdate) {
        TP.boot.$scrollUIBuffer();
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$scrollLog = function() {

    /**
     * @method $scrollLog
     * @summary Scrolls the boot log to the end of its content.
     */

    TP.boot.$scrollUIBuffer();
};

//  ----------------------------------------------------------------------------

TP.boot.$clearLog = function() {

    /**
     * @method $clearLog
     * @summary Clears the boot log of its current content.
     */

    TP.boot.$clearUIBuffer();
};

//  ============================================================================
//  Boot Reporting helpers
//  ============================================================================

/*
 * Reporter helper functions which format and style boot log entries.
 */

//  ----------------------------------------------------------------------------

TP.boot.$$formatLogEntry = function(entry, options) {

    /**
     * @method $$formatLogEntry
     * @summary A method that generates a String representation of the
     *     supplied entry in 'TIBET standard' format.
     * @param {Number[]} entry A log entry with information at indexes that
     *     match TP.boot.LOG_ENTRY_* constants.
     * @param {Object} options A hash of formatting options:
     *     [options.separator] {String} A String used to separate entries. The
     *         default is '\n'.
     *     [options.escape=false] {Boolean} Whether or not to escape XML
     *         constructs.
     *     [options.console=false] {Boolean} Whether or not this content is
     *         destined for a plain JS console and should therefore not be
     *         colorized, etc. NOTE that this is normally invoked via either
     *         puppeteer or Electron and those components are responsible for
     *         colorizing text _after_ it is sent from the client.
     * @returns {String} The formatted log entry.
     */

    var opts,

        level,
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
        dlimit,
        colorize;

    if (!entry) {
        return;
    }

    opts = options || {};

    level = entry[TP.boot.LOG_ENTRY_LEVEL];

    //  Track the highest non-system logging level we've seen.
    if (level > TP.boot.$$logpeak && level < TP.boot.SYSTEM) {
        TP.boot.$$logpeak = level;
    }

    if (!TP.boot.Log.canLogLevel(level)) {
        return;
    }

    time = entry[TP.boot.LOG_ENTRY_DATE];
    obj = entry[TP.boot.LOG_ENTRY_PAYLOAD];

    sep = TP.boot.$isValid(opts.separator) ? opts.separator : '\n';
    esc = TP.boot.$isValid(opts.escape) ? opts.escape : true;

    console = TP.boot.$isValid(opts.console) ? opts.console : false;

    //  If the object is an annotation we've got to process it. Note that we
    //  double the separator around object dumps to help offset key/value dump
    //  data from the surrounding log headings. This helps dumped data stand
    //  out.
    if (obj instanceof TP.boot.Annotation) {
        if (obj.object instanceof Error) {
            str = obj.message + '\n' + obj.object.stack;
        } else {
            str = sep + TP.boot.$stringify(obj.message, sep, esc) +
                sep + sep + TP.boot.$stringify(obj.object, sep, esc) + sep;
        }
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
        str = str || sep + sep + TP.boot.$stringify(obj, sep, esc) + sep;
    } else {
        str = esc ? TP.boot.$xmlEscape(obj) : obj;
    }

    //  ---
    //  colorizing
    //  ---

    //  Bit of a hack...should do at the point of origin...but for now this
    //  works well enough.
    str = str.replace(/(\d+ms)/g, TP.boot.$colorize('$1', 'ms'));
    if (str.indexOf('--- ') === 0 || str.indexOf('TIBET Boot System') === 0) {
        str = TP.boot.$colorize(str, 'task');
    }

    //  ---
    //  timestamp etc.
    //  ---

    time = '' + time.getTime();
    delta = '';

    name = TP.boot.Log.getStringForLevel(level) || '';
    name = name.toLowerCase();

    colorize = TP.boot.$colorize;

    if (TP.boot.$$loglevel === TP.DEBUG) {
        delta = entry[TP.boot.LOG_ENTRY_DELTA];
        dlimit = TP.sys.cfg('boot.delta_threshold');
        if (delta > dlimit) {
            TP.boot.$$bottlenecks += 1;
            delta = colorize('+' + delta + 'ms', 'slow');
        } else {
            delta = colorize('+' + delta + 'ms ', 'delta');
        }
    }

    if (console) {
        msg = str;
    } else {
        msg = colorize(time, 'stamp') + ' ' +
            (delta ? delta + ' ' : '') +
            colorize('[', name) +
            colorize(TP.boot[name.toUpperCase()], name) +
            colorize(']', name) + ' ' +
            str;
    }

    return msg;
};

//  ----------------------------------------------------------------------------

TP.boot.$colorize = function(aString, aSpec) {

    /**
     * @method $colorize
     * @summary A method that styles the supplied String according to the
     *     setting of the current color mode and the supplied theme name.
     * @param {String} aString The String to style.
     * @param {String} aSpec The name of the style specification to use.
     *     String. This will normally come from one of the definitions in
     *     TP.boot.$$theme but can also be a dot ('.') separated list of those
     *     names for styling with multiple themes (i.e. 'trace.time').
     * @returns {String} The stylized String.
     */

    var mode,
        styles,
        spec,
        parts,
        result;

    //  Color mode defines browser vs. console style entries.
    mode = TP.sys.cfg('color.mode');
    styles = TP.boot.$$styles[mode];

    //  Do we have a mapping for this color in our theme?
    spec = TP.boot.$$theme[aSpec];
    if (TP.boot.$notValid(spec)) {
        return aString;
    }

    result = '';

    //  We support chained style names in the spec so split and iterate.
    parts = spec.split('.');
    parts.forEach(
        function(style) {
            var entry;

            entry = styles[style];

            //  Do we have a mapping for this style in our style map?
            if (TP.boot.$notValid(entry)) {
                return;
            }

        result = entry[0] + (result || aString) + entry[1];
    });

    return result;
};

//  ============================================================================
//  Boot Reporters
//  ============================================================================

/*
 * Simple reporter functions which handle the details of output to different
 * targets. The two we need for certain are one for the console object found in
 * both browsers and Node.js and one for the TIBET boot UI if present.
 */

TP.boot.$consoleReporter = function(entry) {

    /**
     * @method $$consoleReporter
     * @summary A reporter method that generates a String representation of the
     *     supplied entry in 'JavaScript console.*() functions standard' format
     *     and outputs that via the appropriate console.*() function.
     * @param {Number[]} A log entry with information at indexes that match
     *     TP.boot.LOG_ENTRY_* constants.
     */

    var msg,
        level;

    TP.sys.setcfg('color.mode', 'console');
    msg = TP.boot.$$formatLogEntry(
        entry,
        {
            separator: '\n',
            escape: false,
            console: true
        });
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
};

//  ----------------------------------------------------------------------------

TP.boot.$bootuiReporter = function(entry) {

    /**
     * @method $$bootuiReporter
     * @summary A reporter method that generates a String representation of the
     *     supplied entry in 'TIBET boot log standard' format and outputs that
     *     to wherever the TIBET boot log is being displayed.
     * @param {Number[]} A log entry with information at indexes that match
     *     TP.boot.LOG_ENTRY_* constants.
     */

    var elem,
        msg,
        css,
        level;

    //  If we've never output we have to "catch up" as it were and process each
    //  of any queued entries to this point.
    if (!TP.boot.$consoleConfigured) {

        elem = TP.boot.$getBootLogElement();
        if (!TP.boot.$isVisible(elem)) {
            return;
        }

        //  clear existing content
        elem.innerHTML = '';
        TP.boot.$consoleConfigured = true;
    }

    TP.sys.setcfg('color.mode', 'browser');
    msg = TP.boot.$$formatLogEntry(
        entry,
        {
            separator: '<br/>',
            escape: false,
            console: false
        });
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

    //  Logging is usually the last step in a boot stoppage. If that's happening
    //  we want to ensure we set any UI to 'done' which should help ensure that
    //  it has scrollbars etc.
    try {
        if (TP.boot.shouldStop()) {
            elem = TP.boot.$getBootLogElement();
            if (!TP.boot.$isVisible(elem)) {
                TP.boot.$elementAddClass(elem.parentElement, 'done');
            }
        }
    } catch (e) {
        //  this one we'll ignore.
        //  empty
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$headlessReporter = function(entry) {

    /**
     * @method $$headlessReporter
     * @summary A reporter method that generates a String representation of the
     *     supplied entry in 'JavaScript console.*() functions standard' format
     *     and outputs that via the appropriate console.*() function.
     * @param {Number[]} A log entry with information at indexes that match
     *     TP.boot.LOG_ENTRY_* constants.
     */

    var msg,
        level;

    //  Ignore attempts to log the entry to the console more than once.
    if (entry && entry.usedConsole) {
        //  TODO: this may not be needed. Found a "flush" issue in the code
        //  specific to the TP.shellExec() command's failure hook that may fix
        //  it in which case we can remove this line.
        /* eslint-disable no-console */
        console.log('');    //  force a flush of the console.
        /* eslint-enable no-console */

        return;
    }

    TP.sys.setcfg('color.mode', 'console');
    msg = TP.boot.$$formatLogEntry(
        entry,
        {
            separator: '\n',
            escape: false,
            console: true
        });
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

TP.boot.$silentReporter = function(entry) {

    /**
     * @method $$silentReporter
     * @summary A reporter method that reports nothing.
     * @param {Number[]} A log entry with information at indexes that match
     *     TP.boot.LOG_ENTRY_* constants.
     */

    return;
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
     * @method TP.boot.Log
     * @summary Contructor for a primitive log data structure. This construct
     *     is used by all TIBET logs although it is wrapped by higher-level
     *     objects once the kernel has loaded.
     * @returns {TP.boot.Log} A new instance.
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
     * @method canLogLevel
     * @summary Returns true if logging is set at or above aLevel.
     * @param {Number} aLevel A logging level constant such as TP.INFO
     *     or TP.DEBUG. The default is TP.WARN.
     * @returns {Boolean} True if logging is active for the given level.
     */

    var level;

    level = TP.boot.$isValid(aLevel) ? aLevel : TP.WARN;
    level = typeof level === 'string' ? TP.boot[level.toUpperCase()] : level;

    return TP.boot.$$loglevel <= level;
};

//  ----------------------------------------------------------------------------

TP.boot.Log.getStringForLevel = function(aLogLevel) {

    /**
     * @method getStringForLevel
     * @summary Returns the string value for the logging level provided.
     * @param {Number} aLogLevel The level to check, defaults to the current
     *     level if no level is passed.
     * @returns {String} The String representation of the boot log level.
     */

    //  If inbound data is TP.INFO etc it's already a string...
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
        case TP.boot.FATAL:
            return 'FATAL';
        case TP.boot.SYSTEM:
            return 'SYSTEM';
        default:
            //  Cap others at SYSTEM
            return 'SYSTEM';
    }
};

//  ------------------------------------------------------------------------

TP.boot.Log.isErrorLevel = function(aLevel) {

    /**
     * @method isErrorLevel
     * @summary Returns true if the level provided represents a form of error.
     * @param {Number} aLevel A TP error level such as TP.FATAL.
     * @returns {Boolean} True if the given level is considered an error.
     */

    var level;

    if (TP.boot.$notValid(aLevel)) {
        return false;
    }

    level = typeof aLevel === 'string' ? TP.boot[aLevel.toUpperCase()] : aLevel;

    return level >= TP.boot.ERROR && level < TP.boot.SYSTEM;
};

//  ------------------------------------------------------------------------

TP.boot.Log.isFatalCondition = function(aLevel, aStage) {

    /**
     * @method isFatalCondition
     * @summary Returns true if the level and stage combine to make the
     *     combination represent a fatal boot error.
     * @param {Number} aLevel A TP error level such as TP.FATAL.
     * @param {Object} aStage A TP boot stage such as 'rendering'. Possible
     *     values are found on TP.boot.$$stages. Defaults to the current stage.
     * @returns {Boolean} True if the given pairing is considered fatal.
     */

    var info,
        level;

    //  Non-errors are never fatal.
    if (!TP.boot.Log.isErrorLevel(aLevel)) {
        return false;
    }

    if (TP.boot.$notValid(aLevel)) {
        return false;
    }

    level = typeof aLevel === 'string' ? TP.boot[aLevel.toUpperCase()] : aLevel;

    if (level === TP.boot.FATAL) {
        TP.boot.$$stop = 'fatal error detected.';
        return true;
    }

    //  Too many small things can add up to be fatal.
    if (TP.boot.$$errors > TP.sys.cfg('boot.error_max')) {
        TP.boot.$$stop = 'boot.error_max exceeded.';
        return true;
    }

    //  Some stages mark any error as being fatal (rendering for example).
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

TP.boot.Log.prototype.asDumpString = function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the receiver.
     */

    return TP.boot.$join('TP.boot.Log :: ', this.asString());
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.asHTMLString = function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     */

    return TP.boot.$join(
        '<span class="TP_boot_Log">',
            '<span data-name="messages">', TP.htmlstr(this.messages),
            '</span>',
        '</span>');
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.asJSONSource = function() {

    /**
     * @method asJSONSource
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
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty TP_boot_Log">' +
                '<dt>Type name</dt>' +
                '<dd class="pretty typename">' +
                    'TP.boot.Log' +
                '</dd>' +
                '<dt class="pretty key">messages</dt>' +
                '<dd class="pretty value">' +
                    TP.boot.$str(this.messages) +
                '</dd>' +
                '</dl>';
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.asString = function() {

    /**
     * @method asString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @returns {String} A new String containing the dump string of the receiver.
     */

    return TP.boot.$str(this.messages);
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.asXMLString = function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     */

    return TP.boot.$join(
                '<instance type="TP.boot.Log">',
                '<messages>', TP.xmlstr(this.messages), '</messages>',
                '</instance>');
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.flush = function() {

    //  TODO: send report the list of nodes so it can optimize by using a single
    //  fragment for the injection.
    while (this.index < this.messages.length) {
        this.report(this.messages[this.index]);
    }
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.getEntries = function() {

    /**
     * @method getEntries
     * @summary Returns an array containing individual log entries. The array
     *     should be considered read-only.
     * @returns {String[][]} The Array containing individual log entries.
     */

    return this.messages;
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.getSize = function() {

    /**
     * @method getSize
     * @summary Returns the size (in number of entries) of the log.
     * @returns {Number} The number of log entries.
     */

    return this.messages.length;
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.getTypeName = function() {

    /**
     * @method getTypeName
     * @summary Returns the receiver's type name.
     * @returns {String} The receiver's type name.
     */

    return 'TP.boot.Log';
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.getSupertypes = function() {

    /**
     * @method getSupertypes
     * @summary Returns an Array of the receiver's supertypes.
     * @returns {Object[]} The Array of the receiver's supertypes.
     */

    return [Object];
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.last = function() {

    /**
     * @method last
     * @summary Returns the last entry made in the log.
     * @returns {String[]} A log entry.
     */

    return this.messages[this.messages.length - 1];
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.log = function(anObject, aLogName, aLogLevel) {

    /**
     * @method log
     * @summary Creates a new log entry. The entry will include a timestamp as
     *     well as the log name, log level, and object given. The object isn't
     *     processed in any way, it is simply added to the log entry. It's up to
     *     consumers of the log to format the data in a log entry to meet their
     *     requirements.
     * @summary The object being logged isn't required to meet any
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
     * @returns {Log} The receiver.
     */

    var entry,
        date,
        level,
        delta,
        msg;

    date = new Date();
    delta = 0;

    level = typeof aLogLevel === 'string' ? TP.boot[aLogLevel] : aLogLevel;

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

    //  Call this first, so any reporter will be aware that the boot is about to
    //  terminate.
    if (TP.boot.Log.isFatalCondition(level)) {

        //  Flush anything queued during pre-config completion.
        this.flush();

        TP.boot.$flushLog(true);

        //  Default to $$stop reason, otherwise output a generic message.
        if (TP.boot.$isEmpty(TP.boot.$$stop)) {
            TP.boot.$$stop = 'unspecified fatal condition';
        }
        msg = TP.boot.$$stop;

        //  Queue to allow any other pending messages to clear.
        setTimeout(function() {
            try {
                TP.boot.$setStage('stopped', 'Boot terminated: ' + msg);
            } catch (e) {
                //  Ignore if we broke that, we're stopping.
                //  empty
            }
        }, 0);
    }

    //  Until we've fully configured we don't output (unless we hit a fatal
    //  warning above. That way we know the full boot log is going to the same
    //  reporter, not a header to one and the rest to another if the user has
    //  overridden the default setting.

    if (TP.boot.$hasReachedStage('expanding')) {
        this.flush();
    }

    return this;
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.report = function(entry) {

    /**
     * @method report
     * @summary Writes a log entry using the currently configured reporter.
     * @param {Number[]} entry A log entry with information at indexes that
     *     match TP.boot.LOG_ENTRY_* constants.
     */

    var limit,
        level,
        reporterName,
        reporter;

    //  incrementing our index ensures we don't try to report this entry again
    //  during a flush() call.
    this.index = this.index + 1;

    //  Always log errors entering the boot log to the console, while respecting
    //  any limit set. The default limit is TP.boot.ERROR.
    limit = TP.boot[TP.sys.cfg('log.console_threshold')];
    level = entry[TP.boot.LOG_ENTRY_LEVEL];

    if (TP.boot.Log.isErrorLevel(level) && level >= limit ||
            TP.sys.cfg('boot.console_log')) {
        TP.boot.$consoleReporter(
            entry,
            {
                console: true
            });
    }

    if (TP.sys.cfg('boot.context') === 'headless') {
        reporterName = 'headless';
    } else {
        reporterName = TP.sys.cfg('boot.reporter');
    }

    reporterName = '$' + reporterName + 'Reporter';
    reporter = TP.boot[reporterName];

    //  If the reporter provided isn't real we'll again default to the console.
    if (TP.boot.$notValid(reporter)) {
        //  Fake a warning and log to the native console, then output the
        //  original if we haven't already.
        TP.boot.$consoleReporter(
            [new Date(), TP.BOOT_LOG, TP.boot.WARN,
                'Logging reporter \'' + reporter + '\' not found.']);
        TP.boot.$consoleReporter(entry);
    }

    try {
        TP.boot[reporterName](entry);
    } catch (e) {

        //  One special case here is failed file launches due to security
        //  issues.
        //  The goal in that case is to let the rest of the system do this
        //  without spamming the error log with all the security warnings.
        if (window.location.protocol.indexOf('file') === 0) {
            if (/[sS]ecurity|[bB]locked/.test(e.message)) {
                TP.boot.$consoleReporter(entry);
                return;
            }
        }

        //  If we don't count these the cycle can continue without respecting
        //  boot.error_max.
        TP.boot.$$errors += 1;

        //  Can you tell we really want you to see these messages yet? ;)
        TP.boot.$consoleReporter(
            [new Date(), TP.BOOT_LOG, TP.boot.ERROR,
                'Error in reporter \'' + reporterName + '\': ' + e.message]);
        TP.boot.$consoleReporter(entry);
    }
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.shift = function() {

    /**
     * @method shift
     * @summary Shifts the first message off the log, allowing the log to
     *     shrink in size by one entry. This method is often called to keep log
     *     sizes from exceeding configured limits.
     * @returns {String[]} A log entry.
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
     * @method getBootLog
     * @summary Returns the system boot log. This will contain any messages
     *     generated during boot processing, assuming the application was booted
     *     using the TIBET boot system.
     * @returns {TP.boot.Log} The boot log object, a primitive instance
     *     supporting limited string output routines.
     */

    return TP.sys.$bootlog;
};

//  ----------------------------------------------------------------------------

TP.boot.log = function(anObject, aLogLevel) {

    /**
     * @method log
     * @summary Adds an entry in the boot log for anObject, associating it with
     *     the style provided. Note that the object logged in this fashion is
     *     just captured, not formatted. How an object appears is a function of
     *     the particular log viewing logic used to display the log.
     * @param {Object} anObject The object to log.
     * @param {Number} aLogLevel The logging level to use.
     */

    var level;

    level = aLogLevel == null ? TP.INFO : aLogLevel;

    TP.sys.$bootlog.log(anObject,
                            TP.BOOT_LOG,
                            level);
};

//  ----------------------------------------------------------------------------
//  UI ELEMENT ACQUISITION
//  ------------------------------------------------------------------------

TP.boot.$byId = function(anID) {

    /**
     * @method $byId
     * @summary The de-facto standard $ function, a simple wrapper for
     *     document.getElementById.
     * @param {String|Element} anID The string ID to locate, or an element
     *     (which will be returned).
     * @returns {HTMLElement}
     */

    if (typeof anID === 'string') {
        return document.getElementById(anID);
    }

    return anID;
};

//  ----------------------------------------------------------------------------

TP.boot.$consoleConfigured = false;

//  ----------------------------------------------------------------------------

TP.boot.$getBootElement = function(id, name) {

    /**
     * @method $getBootElement
     * @summary Returns the boot element referenced by the configuration
     *     parameter 'boot.{{id}}' which should be cached in TP.boot[name].
     * @returns {HTMLElement} The HTML element specified.
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
     * @method $getBootHeadElement
     * @summary Returns the boot heading display element used for showing the
     *     current top-level boot message.
     * @returns {HTMLElement} The HTML element specified.
     */

    return TP.boot.$getBootElement('uihead', '$$uiHead');
};

//  ----------------------------------------------------------------------------

TP.boot.$getBootImageElement = function() {

    /**
     * @method $getBootImageElement
     * @summary Returns the boot image element used to highlight current status.
     * @returns {HTMLElement} The HTML element specified.
     */

    return TP.boot.$getBootElement('uiimage', '$$uiImage');
};

//  ----------------------------------------------------------------------------

TP.boot.$getBootInputElement = function() {

    /**
     * @method $getBootInputElement
     * @summary Returns the boot log element used as a display console.
     * @returns {HTMLElement} The HTML element displaying boot console output.
     */

    return TP.boot.$getBootElement('uiinput', '$$uiInput');
};

//  ----------------------------------------------------------------------------

TP.boot.$getBootLogElement = function() {

    /**
     * @method $getBootLogElement
     * @summary Returns the boot log element used as a display console.
     * @returns {HTMLElement} The HTML element displaying boot console output.
     */

    return TP.boot.$getBootElement('uilog', '$$uiLog');
};

//  ----------------------------------------------------------------------------

TP.boot.$getProgressBarElement = function() {

    /**
     * @method $getProgressBarElement
     * @summary Returns the progress bar element, which contains the overall
     *     prgress bar content element.
     * @returns {HTMLElement} The HTML element displaying the 'progress bar'.
     */

    return TP.boot.$getBootElement('uipercent', '$$uiProgress');
};

//  ----------------------------------------------------------------------------

TP.boot.$getBootSubheadElement = function() {

    /**
     * @method $getBootSubheadElement
     * @summary Returns the boot log element used to display subheading data.
     * @returns {HTMLElement} The HTML element displaying boot console output.
     */

    return TP.boot.$getBootElement('uisubhead', '$$uiSubhead');
};

//  ----------------------------------------------------------------------------

TP.boot.$getUIElement = function(varargs) {

    /**
     * @method $getUIElement
     * @summary Locates and returns an element based on the ID provided
     *     as arguments. If multiple arguments are provided, they are used to
     *     traverse downward through a chain of iframe documents, with each ID,
     *     except for the final one, matching the IDs of embedded iframes.
     * @param {arguments} varargs One or more arguments containing string IDs.
     * @returns {HTMLElement} The HTML element matching the ID or IDs provided.
     */

    //  TODO: work with access paths as well.

    var ids,
        i,
        len,
        id,
        doc,
        elem;

    doc = TP.sys.getLaunchDocument();

    //  Don't assume we don't have access path components in the list of
    //  arguments. Split them so we build a full-descent path.
    ids = [];
    len = arguments.length;
    for (i = 0; i < len; i++) {
        ids = ids.concat(arguments[i].split('.'));
    }

    len = ids.length;
    for (i = 0; i < len; i++) {
        id = ids[i];

        elem = doc.getElementById(id);
        if (!elem) {
            return;
        }

        //  If we're out of ids we're at the end, even if that's an IFRAME.
        if (i === len - 1) {
            return elem;
        }

        if (elem.contentWindow) {
            //  If we're holding an IFRAME we need to drill down into that via
            //  its content document.
            doc = elem.contentWindow.document;
        } else {
            //  Standard element. That's a problem since they don't have a
            //  getElementById call...
            return;
        }
    }
};

//  ----------------------------------------------------------------------------

TP.boot.getUIBoot = function() {

    /**
     * @method getUIBoot
     * @summary Returns the iframe element holding TIBET's boot infrastructure.
     * @returns {HTMLIFrameElement} The HTML iframe element holding TIBET's boot
     *     infrastructure.
     */

    var id;

    id = TP.sys.cfg('boot.uiboot');

    return TP.boot.$getUIElement(id);
};

//  ----------------------------------------------------------------------------

TP.boot.getUIRoot = function() {

    /**
     * @method getUIRoot
     * @summary Returns the iframe element holding TIBET's root GUI.
     * @returns {HTMLIFrameElement} The HTML iframe element holding TIBET's root
     *     GUI.
     */

    var id;

    id = TP.sys.cfg('tibet.uiroot');

    return TP.boot.$getUIElement(id);
};

//  ----------------------------------------------------------------------------

TP.boot.$releaseUIElements = function() {

    /**
     * @method $releaseUIElements
     * @summary Releases any cached UI references created during startup.
     */

    TP.boot.$$uiHead = null;
    TP.boot.$$uiImage = null;
    TP.boot.$$uiInput = null;
    TP.boot.$$uiLog = null;
    TP.boot.$$uiPath = null;
    TP.boot.$$uiProgress = null;
    TP.boot.$$uiSubhead = null;
};

//  ----------------------------------------------------------------------------
//  BOOT UI DISPLAY
//  ----------------------------------------------------------------------------

TP.boot.$computeLogBufferSize = function(forceUIUpdate) {

    /**
     * @method $computeLogBufferSize
     * @summary Computes the size of the log buffer. This is used by other
     *     logging machinery to determine log flushing intervals.
     * @param {Boolean} [forceUIUpdate=false] Whether or not to force a UI
     *     update whether the GUI buffer size has been reached or not.
     * @returns {Number} The current size that the log buffer should be.
     */

    var level,
        size;

    size = TP.boot.$$logbufsize;
    if (forceUIUpdate !== true && TP.boot.$isValid(size)) {
        return size;
    }

    size = parseInt(TP.sys.cfg('log.buffer_size'), 10);
    size = isNaN(size) ? 1 : size;

    level = TP.boot.$$loglevel;

    switch (level) {
        case 0:         //  all
        case 1:         //  trace
        case 2:         //  debug
            size = size * 2;
            break;
        case 3:         //  info
        case 4:         //  warn
        case 5:         //  error
        case 6:         //  fatal
            size = Math.max(Math.floor(size / 2), size);
            break;
        case 7:         //  system
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

TP.boot.$flushUIBuffer = function(forceUIUpdate) {

    /**
     * @method $flushUIBuffer
     * @summary Flushes the current log entries into the GUI element
     *     representing the log, but only if the GUI buffer size has been
     *     reached or forceUIUpdate is true.
     * @param {Boolean} [forceUIUpdate=false] Whether or not to force a UI
     *     update whether the GUI buffer size has been reached or not.
     * @returns {HTMLElement} The element representing boot system's message
     *     buffer.
     */

    var elem,
        buffer,
        bufSize;

    //  Grab the element displaying the boot log. If it's not visible, there's
    //  nothing to do here so just return.
    elem = TP.boot.$getBootLogElement();
    if (!TP.boot.$isVisible(elem)) {
        return;
    }

    buffer = TP.boot.$$msgBuffer;
    if (TP.boot.$notValid(buffer)) {
        buffer = elem.ownerDocument.createDocumentFragment();
        TP.boot.$$msgBuffer = buffer;
    }

    bufSize = TP.boot.$$logbufsize || TP.boot.$computeLogBufferSize();

    //  If there are child nodes in the buffer and the forceUIUpdate flag is
    //  true or we've reached the buffer size under which we're supposed to
    //  flush, then go ahead and update the GUI.
    if (buffer.childNodes.length > 0 &&
        (forceUIUpdate === true || buffer.childNodes.length === bufSize)) {

        TP.boot.$nodeAppendChild(elem, buffer);

        //  Reset by allocating a new DocumentFragment to hold future log
        //  entries.
        buffer = elem.ownerDocument.createDocumentFragment();
        TP.boot.$$msgBuffer = buffer;
    }

    return buffer;
};

//  ----------------------------------------------------------------------------

TP.boot.$clearUIBuffer = function() {

    /**
     * @method $clearUIBuffer
     * @summary Clears the GUI responsible for displaying the log buffer.
     */

    var elem;

    elem = TP.boot.$getBootLogElement();
    if (!TP.boot.$isVisible(elem)) {
        return;
    }

    elem.innerHTML = '';

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$scrollUIBuffer = function() {

    /**
     * @method $scrollUIBuffer
     * @summary Scrolls the GUI responsible for displaying the log buffer to the
     *     end of its content.
     */

    var elem;

    elem = TP.boot.$getBootLogElement();
    if (!TP.boot.$isVisible(elem)) {
        return;
    }

    elem.parentElement.scrollTop = elem.parentElement.scrollHeight;

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$displayImage = function(aUrl) {

    /**
     * @method $displayImage
     * @summary Displays the image referenced by the supplied URL on the 'boot
     *     image' part of the boot page.
     * @param {String} aUrl The URL to the image to display.
     */

    var elem;

    elem = TP.boot.$getBootImageElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    elem.src = aUrl;
};

//  ----------------------------------------------------------------------------

TP.boot.$displayMessage = function(aString, flush) {

    /**
     * @method $displayMessage
     * @summary Adds aString to the current boot log display, if available. This
     *     method is the low-level method responsible for adding to the boot UI
     *     output.
     * @param {String} aString The string of content to be added.
     * @param {Boolean} flush True to flush the log prior to output.
     * @returns {Node} The node appended to the UI.
     */

    var elem,
        buffer,
        message,
        msgNode;

    elem = TP.boot.$getBootLogElement();
    if (!TP.boot.$isVisible(elem)) {
        return;
    }

    if (!TP.boot.$isElement(TP.boot.$$msgTemplate)) {
        msgNode = TP.boot.$documentFromString(
            '<div xmlns="http://www.w3.org/1999/xhtml"><div></div></div>');
        if (!msgNode) {
            top.console.error('Unable to create log message template.');

            buffer = TP.boot.$flushUIBuffer(TP.boot.shouldStop());

            msgNode = elem.ownerDocument.createTextNode(
                'Unable to create log message template.');
            msgNode = TP.boot.$nodeAppendChild(buffer, msgNode);

            TP.boot.$scrollUIBuffer();

            return msgNode;
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
                TP.boot.$xmlEscape(message) + '</pre></div></div>');

            if (!msgNode) {
                top.console.error('Unable to create log message element.');
                top.console.error(message);

                buffer = TP.boot.$flushUIBuffer(TP.boot.shouldStop());
                msgNode = elem.ownerDocument.createTextNode(
                    'Unable to create log message element. ' +
                    'See JavaScript console.');
                msgNode = TP.boot.$nodeAppendChild(buffer, msgNode);

                TP.boot.$scrollUIBuffer();

                return msgNode;

            } else {
                msgNode = msgNode.firstChild.firstChild;
            }

        } else {
            msgNode = msgNode.firstChild.firstChild;
        }
    }

    if (msgNode) {
        buffer = TP.boot.$flushUIBuffer(TP.boot.shouldStop());
        msgNode = TP.boot.$nodeAppendChild(buffer, msgNode);
    }

    //  TODO: verify if we need to keep the flush flag. Without it content shows
    //  up in the boot UI which may not flush properly.

    //  If asked, flush the brand new message, even if it's now the only one in
    //  the buffer. (This is true for errors/system output by default).
    // if (flush) {
        TP.boot.$flushUIBuffer(true);
        TP.boot.$scrollUIBuffer();
    // }

    return msgNode;
};

//  ----------------------------------------------------------------------------

TP.boot.$displayProgress = function() {

    /**
     * @method $displayProgress
     * @summary Updates the 'progress bar' version of the boot system to show
     *     the system booting.
     */

    var elem,
        workload,
        percent,
        index;

    elem = TP.boot.$getProgressBarElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    if (TP.sys.cfg('boot.reporter') !== 'bootui') {
        return;
    }

    if (!TP.boot.$$bootnodes) {
        return;
    } else {
        workload = TP.boot.$$workload;
        index = TP.boot.$$bootindex;
        percent = Math.round(index / workload * 100);
    }

    //  Don't go further if we'd be setting same value.
    if (percent === TP.boot.$$percent) {
        return;
    }

    TP.boot.$$percent = percent;

    TP.boot.$elementReplaceClass(elem, /log-/, TP.boot.$$logcss);

    if (percent === 100) {
        //  Avoid issues with margin etc, rely on right: 0;
        elem.style.width = 'auto';
        elem.style.right = 0;
    } else {
        elem.style.width = percent.toFixed() + '%';
    }

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$displayStage = function(aString) {

    /**
     * @method $displayStage
     * @summary Updates the 'stage text' version of the boot system to show
     *     the system booting.
     */

    var elem;

    elem = TP.boot.$getBootHeadElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    elem.innerHTML = aString;
};

//  ----------------------------------------------------------------------------

TP.boot.$displayStatus = function(aString) {

    /**
     * @method $displayStatus
     * @summary Updates the 'status text' version of the boot system to show
     *     the system booting.
     */

    var elem;

    elem = TP.boot.$getBootSubheadElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    elem.innerHTML = aString;
};

//  ----------------------------------------------------------------------------
//  SHOW/HIDE UI
//  ------------------------------------------------------------------------

TP.boot.hideContent = function(anID) {

    /**
     * @method hideContent
     * @summary Hides the identified element, or the current content
     *     element if no element is specified.
     * @param {String|Element} anID The element whose content should be
     *     hidden.
     */

    var elem;

    if (TP.boot.$isValid(elem =
            TP.boot.$byId(anID || TP.boot.$$currentContentID))) {
        elem.style.display = 'none';
        if (TP.boot.$$currentContentID === anID) {
            TP.boot.$$currentContentID = null;
        }
    }
};

//  ----------------------------------------------------------------------------

TP.boot.hideUIBoot = function() {

    /**
     * @method hideUIBoot
     * @summary Hides the iframe element holding TIBET's boot infrastructure and
     *     focuses TIBET's root GUI iframe.
     */

    var elem,
        id;

    id = TP.sys.cfg('boot.uiboot');

    //  If the boot and root ui are the same ignore this request. It has to be
    //  done by manipulating the uiroot instead.
    if (id === TP.sys.cfg('tibet.uiroot')) {
        return;
    }

    elem = TP.boot.$getUIElement(id);
    if (TP.boot.$isValid(elem)) {
        if (TP.boot.$isValid(elem.frameElement)) {
            elem = elem.frameElement;
        }

        //  NOTE we use display: none here so that devtools etc. will properly
        //  find elements when using inspect element.
        elem.style.display = 'none';
    }

    TP.boot.$byId('UIROOT').focus();
};

//  ----------------------------------------------------------------------------

TP.boot.hideUIRoot = function() {

    /**
     * @method hideUIRoot
     * @summary Hides the iframe element holding TIBET's root GUI.
     */

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

TP.boot.showUIBoot = function() {

    /**
     * @method showUIBoot
     * @summary Displays the current tibet.uiboot element in the application's
     *     main window.
     */

    var elem,
        id;

    id = TP.sys.cfg('boot.uiboot');
    elem = TP.boot.$getUIElement(id);

    if (!TP.boot.$isValid(elem) || TP.boot.$notValid(elem.contentDocument)) {
        return;
    }

    if (TP.boot.$isValid(elem.frameElement)) {
        elem = elem.frameElement;
    }
    //  Be sure to activate the log. That's the essential UI for having
    //  shown the boot UI.
    TP.boot.$elementAddClass(elem.contentDocument.body, 'showlog');

    elem.style.display = 'block';
    elem.style.visibility = 'visible';

    elem.focus();
};

//  ------------------------------------------------------------------------

TP.boot.showUICanvas = function(aURI) {

    /**
     * @method showUICanvas
     * @summary Displays the current tibet.uicanvas element in the
     *     application's main window. If aURI is provided the content of
     *     that URI is placed in the canvas.
     * @param {String} aURI The URI whose content should be loaded and
     *     displayed.
     */

    var win,
        file;

    win = TP.sys.getWindowById(TP.sys.cfg('tibet.uicanvas'));
    if (TP.boot.$isValid(win)) {
        if (TP.boot.$isValid(aURI)) {
            file = TP.boot.$uriExpandPath(aURI);

            //  pretend this page never hit the history
            win.location.replace(file);
        }

        //  make sure iframes are visible when used in this fashion
        if (TP.boot.$isValid(win.frameElement)) {
            win.frameElement.style.visibility = 'visible';
        }
    }

    TP.boot.hideUIBoot();
};

//  ------------------------------------------------------------------------

TP.boot.showUIConsole = function() {

    /**
     * @method showUIConsole
     * @summary Displays the current tibet.uiconsole element in the
     *     application's main window.
     */

    var doc,
        elem;

    elem = TP.boot.getUIBoot();
    if (!elem) {
        return;
    }

    doc = elem.contentWindow.document;
    if (!doc) {
        return;
    }

    //  Turn off splash display.
    elem = doc.getElementById(TP.sys.cfg('boot.uisplash'));
    if (elem) {
        elem.style.display = 'none';
    }

    //  Turn on console display.
    elem = doc.getElementById(TP.sys.cfg('boot.uiconsole'));
    if (elem) {
        elem.style.display = 'block';
        elem.style.visibility = 'visible';
    }

    //  Force log display to the last entry.
    TP.boot.$flushLog(true);
    TP.boot.$scrollLog();
};

//  ------------------------------------------------------------------------

TP.boot.showUIRoot = function() {

    /**
     * @method showUIRoot
     * @summary Displays the current tibet.uiroot element in the
     *     application's main window.
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
};

//  ------------------------------------------------------------------------

TP.boot.toggleUI = function() {

    /**
     * @method toggleUI
     * @summary Toggles the UI between UIRoot and UIBoot.
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
};

//  ----------------------------------------------------------------------------

TP.sys.writeBootLog = function(level, reporter) {

    /**
     * @method writeBootLog
     * @summary Dump the bootlog to the current target location. By default this
     *     is directed to the consoleReporter.
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

    //  By default dump the entire log.
    lvl = TP.boot.$isValid(level) ? level : TP.DEBUG;
    lvl = typeof lvl === 'string' ? TP.boot[lvl] : lvl;

    entries = TP.sys.getBootLog().getEntries();
    entries.forEach(function(entry) {

        if (entry[TP.boot.LOG_ENTRY_LEVEL] < lvl) {
            return;
        }

        TP.boot[name](entry);
    });
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
 *  TP.ifFatal() ? TP.fatal(...) : 0;
 *  TP.ifSystem() ? TP.system(...) : 0;
*/

//  ------------------------------------------------------------------------

TP.ifTrace = function(aLogName) {

    /**
     * @method ifTrace
     * @summary Returns true if logging is enabled for TP.TRACE level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>TP.ifTrace() ? TP.trace(...) : 0;code> This idiom can help
     *     performance in cases where message construction overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if trace-level logging is active.
     */

    return TP.boot.$$loglevel <= TP.boot.TRACE;
};

//  ------------------------------------------------------------------------

TP.ifDebug = function(aLogName) {

    /**
     * @method ifDebug
     * @summary Returns true if logging is enabled for TP.DEBUG level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>TP.ifDebug() ? TP.debug(...) : 0;code> This idiom can help
     *     performance in cases where message construction overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if debug-level logging is active.
     */

    return TP.boot.$$loglevel <= TP.boot.DEBUG;
};

//  ------------------------------------------------------------------------

TP.ifInfo = function(aLogName) {

    /**
     * @method ifInfo
     * @summary Returns true if logging is enabled for TP.INFO level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>TP.ifInfo() ? TP.info(...) : 0;code> This idiom can help
     *     performance in cases where message construction overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if info-level logging is active.
     */

    return TP.boot.$$loglevel <= TP.boot.INFO;
};

//  ------------------------------------------------------------------------

TP.ifWarn = function(aLogName) {

    /**
     * @method ifWarn
     * @summary Returns true if logging is enabled for TP.WARN level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>TP.ifWarn() ? TP.warn(...) : 0;code> This idiom can help
     *     performance in cases where message construction overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if warn-level logging is active.
     */

    return TP.boot.$$loglevel <= TP.boot.WARN;
};

//  ------------------------------------------------------------------------

TP.ifError = function(aLogName) {

    /**
     * @method ifError
     * @summary Returns true if logging is enabled for TP.boot.ERROR level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>TP.ifError() ? TP.error(...) : 0;code> This idiom can help
     *     performance in cases where message construction overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if error-level logging is active.
     */

    return TP.boot.$$loglevel <= TP.boot.ERROR;
};

//  ------------------------------------------------------------------------

TP.ifFatal = function(aLogName) {

    /**
     * @method ifFatal
     * @summary Returns true if logging is enabled for TP.FATAL level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>TP.ifFatal() ? TP.fatal(...) : 0;code> This idiom can help
     *     performance in cases where message construction overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if fatal-level logging is active.
     */

    return TP.boot.$$loglevel <= TP.boot.FATAL;
};

//  ------------------------------------------------------------------------

TP.ifSystem = function(aLogName) {

    /**
     * @method ifSystem
     * @summary Returns true if logging is enabled for TP.SYSTEM level
     *     for the specified log, or the current default log. This function
     *     is commonly used in the idiomatic expression:
     *     <code>TP.ifSystem() ? TP.system(...) : 0;code> This idiom can help
     *     performance in cases where message construction overhead is high.
     * @param {String} aLogName An optional log name to check for level.
     * @returns {Boolean} True if system-level logging is active.
     */

    return TP.boot.$$loglevel <= TP.boot.SYSTEM;
};

//  ============================================================================
//  LOG PRIMITIVES
//  ============================================================================

TP.$$log = function(argList, aLogLevel, logRoot) {

    /**
     * @method $$log
     * @summary Shared routine for routing a logging call such as TP.trace to
     *     either a boot-level routing or a post-startup routine. The final
     *     logging is ultimately handled by TP.boot.$std[out|err] or by the
     *     TP.log infrastructure if the kernel has loaded and started.
     * @param {arguments} argList A list of arguments from a logging call.
     * @param {Number} aLogLevel TP.INFO or a similar level name.
     * @param {Object} logRoot The root logger to use (TP or APP usually).
     */

    if (TP.sys.hasStarted()) {
        return TP.sys.$$log(argList, aLogLevel, logRoot);
    } else {
        return TP.boot.$$log(argList, aLogLevel, logRoot);
    }
};

//  ------------------------------------------------------------------------

TP.trace = function(varargs) {

    /**
     * @method trace
     * @summary Logs anObject at TP.TRACE level, if active.
     * @param {arguments} varargs One or more arguments. The last argument is
     *     checked as a possible log name, all other values are considered parts
     *     of the final message to be logged.
     */

    return TP.$$log(arguments, TP.TRACE, this);
};

//  ------------------------------------------------------------------------

TP.debug = function(varargs) {

    /**
     * @method debug
     * @summary Logs anObject at TP.DEBUG level, if active.
     * @param {arguments} varargs One or more arguments. The last argument is
     *     checked as a possible log name, all other values are considered parts
     *     of the final message to be logged.
     */

    return TP.$$log(arguments, TP.DEBUG, this);
};

//  ------------------------------------------------------------------------

TP.info = function(varargs) {

    /**
     * @method info
     * @summary Logs anObject at TP.INFO level, if active.
     * @param {arguments} varargs One or more arguments. The last argument is
     *     checked as a possible log name, all other values are considered parts
     *     of the final message to be logged.
     */

    return TP.$$log(arguments, TP.INFO, this);
};

//  ------------------------------------------------------------------------

TP.warn = function(varargs) {

    /**
     * @method warn
     * @summary Logs anObject at TP.WARN level, if active.
     * @param {arguments} varargs One or more arguments. The last argument is
     *     checked as a possible log name, all other values are considered parts
     *     of the final message to be logged.
     */


    return TP.$$log(arguments, TP.WARN, this);
};

//  ------------------------------------------------------------------------

TP.error = function(varargs) {

    /**
     * @method error
     * @summary Logs anObject at TP.ERROR level, if active.
     * @param {arguments} varargs One or more arguments. The last argument is
     *     checked as a possible log name, all other values are considered parts
     *     of the final message to be logged.
     */

    return TP.$$log(arguments, TP.ERROR, this);
};

//  ------------------------------------------------------------------------

TP.fatal = function(varargs) {

    /**
     * @method fatal
     * @summary Logs anObject at TP.FATAL level, if active.
     * @param {arguments} varargs One or more arguments. The last argument is
     *     checked as a possible log name, all other values are considered parts
     *     of the final message to be logged.
     */

    return TP.$$log(arguments, TP.FATAL, this);
};

//  ------------------------------------------------------------------------

TP.system = function(varargs) {

    /**
     * @method system
     * @summary Logs anObject at TP.SYSTEM level, if active.
     * @param {arguments} varargs One or more arguments. The last argument is
     *     checked as a possible log name, all other values are considered parts
     *     of the final message to be logged.
     */

    return TP.$$log(arguments, TP.SYSTEM, this);
};

//  ============================================================================
//  BOOT STAGES
//  ============================================================================

TP.boot.$getBootStats = function() {

    return '' + TP.boot.$$totalwork + ' unique imports, ' +
        TP.boot.$$errors + ' errors, ' +
        TP.boot.$$warnings + ' warnings, ' +
        TP.boot.$$bottlenecks + ' bottlenecks.';
};

//  ----------------------------------------------------------------------------

TP.boot.$getStage = function() {

    /**
     * @method $getStage
     * @summary Returns the current boot stage.
     * @returns {String} The current boot stage.
     */

    return TP.boot.$$stage;
};

//  ----------------------------------------------------------------------------

TP.boot.$getStageInfo = function(aStage) {

    /**
     * @method $getStageInfo
     * @summary Returns information about the supplied boot stage.
     * @param {String} aStage A valid boot stage. This list is somewhat flexible
     *     but common stages include: config, config_*, phase_one, phase_two,
     *     phase_*_complete, activation, starting, and running :).
     * @returns {Object} Information about the supplied stage. Keys include:
     *     'log', 'entered', 'head', 'sub', 'image', 'hook'.
     */

    var stage;

    stage = aStage || TP.boot.$$stage;

    return TP.boot.$$stages[stage];
};

//  ----------------------------------------------------------------------------

TP.boot.$hasReachedStage = function(aStage) {

    /**
     * @method $hasReachedStage
     * @summary Returns whether or not the system has reached the supplied stage
     *     in the booting process.
     * @param {String} aStage A valid boot stage. This list is somewhat flexible
     *     but common stages include: config, config_*, phase_one, phase_two,
     *     phase_*_complete, activation, starting, and running :).
     * @returns {Boolean} Whether or not the system has reached the supplied
     *     stage.
     */

    var target,
        current;

    target = TP.boot.$$stageorder.indexOf(aStage);
    current = TP.boot.$$stageorder.indexOf(TP.boot.$$stage);

    return target <= current;
};

//  ----------------------------------------------------------------------------

TP.boot.$setStage = function(aStage, aReason) {

    /**
     * @method $setStage
     * @summary Sets the current boot stage and reports it to the log.
     * @param {String} aStage A valid boot stage. This list is somewhat flexible
     *     but common stages include: config, config_*, phase_one, phase_two,
     *     phase_*_complete, activation, starting, and running :).
     * @param {String} aReason Optional text currently used only when stage is
     *     'stopped' to provide the termination reason.
     * @returns {String} The current stage after the set completes.
     */

    var info,
        prior,
        prefix,
        stagetime,
        head,
        sub,
        image;

    //  Once we're stopped that's it, ignore further updates.
    if (TP.boot.$$stage === 'stopped') {
        return;
    }

    //  Verify the stage is one we recognize.
    info = TP.boot.$getStageInfo(aStage);
    if (TP.boot.$notValid(info)) {
        TP.boot.$stderr('Invalid boot stage: ' + aStage);
        return;
    }

    //  Ignore requests to 'go backwards' or to set the same stage.
    if (TP.boot.$$stageorder.indexOf(aStage) <
        TP.boot.$$stageorder.indexOf(TP.boot.$$stage)) {
        return;
    }

    //  Update the current stage now that we know we're valid. We capture the
    //  prior stage so we can output summary data for it below.
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
        TP.boot.$stdout(prefix + stagetime + 'ms.', TP.SYSTEM);
    }

    TP.boot.$stdout('', TP.SYSTEM);
    // TP.boot.$stdout(TP.sys.cfg('boot.uisubsection'), TP.SYSTEM);
    TP.boot.$stdout('--- ' + info.log, TP.SYSTEM);
    // TP.boot.$stdout(TP.sys.cfg('boot.uisubsection'), TP.SYSTEM);
    TP.boot.$stdout('', TP.SYSTEM);

    //  Capture the time we reached this stage. this is key for reporting the
    //  time spent in the current (now prior) stage below.
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
        //  Image is provided as a TIBET URL, ~lib_media etc. so we need to
        //  replace that with the proper prefix before setting as the image
        //  element's src.

        if (image.charAt(0) === '~') {
            image = TP.boot.$uriExpandPath(image);
        }
        TP.boot.$displayImage(image);
    }

    //  If the stage has a 'hook' function run it.
    if (typeof info.hook === 'function') {
        info.hook(aStage, aReason);
    }

    //  One last thing is dealing with the termination phases, started and
    //  stopped. Each needs some special handling.

    if (TP.boot.$$stage === 'liftoff') {

        TP.boot.$stdout('' +
            (TP.boot.$getStageTime('started', 'prelaunch') -
                TP.boot.$getStageTime('paused')) +
            'ms: ' + TP.boot.$getBootStats(), TP.SYSTEM);

        // TP.boot.$stdout('', TP.SYSTEM);
        // TP.boot.$stdout(TP.sys.cfg('boot.uisection'), TP.SYSTEM);

    } else if (TP.boot.$$stage === 'stopped') {

        TP.boot.$stdout(aReason, TP.SYSTEM);
        TP.boot.$stdout('', TP.SYSTEM);
        TP.boot.$stdout('Stopped after ' +
            (TP.boot.$getStageTime('stopped', 'prelaunch') -
                TP.boot.$getStageTime('paused')) +
            'ms with ' + TP.boot.$getBootStats(), TP.SYSTEM);
        // TP.boot.$stdout('', TP.SYSTEM);
        // TP.boot.$stdout(TP.sys.cfg('boot.uisection'), TP.SYSTEM);

        TP.boot.showUIConsole();
    }

    TP.boot.$flushLog(true);

    return TP.boot.$$stage;
};

//  ----------------------------------------------------------------------------

TP.boot.$getNextStage = function(aStage) {

    /**
     * @method $getNextStage
     * @summary Returns the stage that follows the supplied stage in the boot
     *     process.
     * @param {String} aStage A valid boot stage. This list is somewhat flexible
     *     but common stages include: config, config_*, phase_one, phase_two,
     *     phase_*_complete, activation, starting, and running :).
     * @returns {String} The stage that follows the supplied stage in the
     *     boot process.
     */

    var stage,
        index;

    stage = aStage || TP.boot.$$stage;
    index = TP.boot.$$stageorder.indexOf(stage);
    if (index === TP.NOT_FOUND ||
        index + 1 === TP.boot.$$stageorder.length) {
        return;
    }

    return TP.boot.$$stageorder[index + 1];
};

//  ----------------------------------------------------------------------------

TP.boot.$getPriorStage = function(aStage) {

    /**
     * @method $getPriorStage
     * @summary Returns the stage that precedes the supplied stage in the boot
     *     process.
     * @param {String} aStage A valid boot stage. This list is somewhat flexible
     *     but common stages include: config, config_*, phase_one, phase_two,
     *     phase_*_complete, activation, starting, and running :).
     * @returns {String} The stage that precedes the supplied stage in the
     *     boot process.
     */

    var stage,
        index;

    stage = aStage || TP.boot.$$stage;
    index = TP.boot.$$stageorder.indexOf(stage);
    if (index === TP.NOT_FOUND || index === 0) {
        return;
    }

    return TP.boot.$$stageorder[index - 1];
};

//  ----------------------------------------------------------------------------

TP.boot.$getStageTime = function(aStage, startStage) {

    /**
     * @method $getStageTime
     * @summary Returns the amount of time a stage took relative to the
     *     startStage or the prior stage. If the stage isn't complete this
     *     method returns a rough time based on the time of the call.
     * @param {String} aStage The stage to report on. Defaults to current stage.
     * @param {String} startStage The stage to compute from. Defaults to the
     *     stage prior to aStage.
     * @returns {Number} An elapsed time value in milliseconds.
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

    //  Default the stage setting, then capture the next stage or current time
    //  data as the time we'll use for the largest of the two time values.
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

    //  Default the start stage to the current stage. Again, this is done since
    //  our start time is captured in stage info, not elapsed or end time.
    start = startStage || stage;
    startinfo = TP.boot.$getStageInfo(start);
    if (TP.boot.$notValid(startinfo)) {
        return 0;
    } else if (TP.boot.$notValid(startinfo.entered)) {
        return 0;
    } else {
        starttime = startinfo.entered;
    }

    //  Simple value is current - start in milliseconds.
    elapsed = Math.abs(stagetime.getTime() - starttime.getTime());

    return elapsed;
};

//  ============================================================================
//  URL CONFIGURATION FUNCTIONS
//  ============================================================================

TP.boot.$getArgumentPrimitive = function(value) {

    /**
     * @method $getArgumentPrimitive
     * @summary Returns the primitive value for the supplied value. This is
     *     useful for converting Strings representing Numbers, Booleans, RegExps
     *     and JSON values to their native JS values.
     * @param {String} value The String value to convert.
     * @returns {Number|Boolean|RegExp|Object} The converted value.
     */

    if (TP.boot.$notValid(value)) {
        return value;
    }

    if (typeof value !== 'string') {
        return value;
    }

    //  Try to convert to number, boolean, regex,
    if (TP.boot.NUMBER_REGEX.test(value)) {
        return Number(value);
    } else if (TP.boot.BOOLEAN_REGEX.test(value)) {
        return value === 'true';
    } else if (TP.boot.REGEX_REGEX.test(value)) {
        return new RegExp(value.slice(1, -1));
    } else if (TP.boot.OBJECT_REGEX.test(value)) {
        try {
            //  We don't return the value of JSON.parse() here because if we can
            //  make a real value from an Object structure, then it's not a
            //  primitive value.
            JSON.parse(value);
        } catch (e) {
            return value;
        }
    } else {
        return value;
    }
};

//  ============================================================================
//  ROOT PATHS
//  ============================================================================

/*
TIBET is "dual path" oriented, meaning it thinks in terms of an "app root" and a
"lib root" so that your code and the TIBET code can vary independently without
too many maintenance issues. Using separate paths for APP and LIB code lets you
either share a codebase, or point your application to a new release of TIBET for
testing without altering directory structures, making extra copies, or other
typical approaches.
*/

//  ----------------------------------------------------------------------------

TP.boot.$getAppHead = function() {

    /**
     * @method $getAppHead
     * @summary Returns the application "head", the location normally associated
     *     with '/' for HTTP launches but trickier to compute for file launches
     *     where it typically refers to the location containing the public app
     *     resources as identified by the boot.tibet_pub configuration value.
     *     The value here is typically computed from the window location to help
     *     identify the scheme and path to the file containing tibet_loader.js.
     * @returns {String} The computed path.
     */

    var path,
        node,
        head,
        index,
        parts,
        keys,
        key,
        lib,
        i,
        len;

    if (TP.boot.$$apphead != null) {
        return TP.boot.$$apphead;
    }

    //  App head is the location containing the public or node_modules directory
    //  in the majority of cases since these are the app_root and lib_root
    //  default locations and app_head is by definition their parent location.

    //  Compute from the window location, normally a reference to an index.html
    //  file somewhere below a host (but maybe a file:// reference as well).
    path = decodeURI(window.location.toString());
    path = path.split(/[#?]/)[0];

    //  A bit of a hack but no clear way around this. Karma will run its own web
    //  server and include a segment like '/base' for some reason. We have to
    //  adjust for that if we appear to be loading in a Karma environment. The
    //  only reasonably consistent way is to leverage the node containing the
    //  boot script itself, and process the path to that file to compute this.
    if (window[TP.sys.cfg('karma.slot', '__karma__')]) {

        node = TP.sys.getLaunchNode(TP.sys.getLaunchDocument());
        if (TP.boot.$isValid(node)) {
            path = node.getAttribute('src');
        }
        //  Combine current path with the src path in case of relative path
        //  specification (common) and we should end up with a workable
        //  offset.
        if (TP.boot.$notEmpty(path)) {
            path = TP.boot.$uriJoinPaths(path,
                TP.sys.cfg('boot.karma_offset'));
        }

        TP.boot.$$apphead = TP.boot.$uriJoinPaths(
            TP.sys.cfg('boot.karma_root'), path);

        return TP.boot.$$apphead;
    }

    //  Headless launches are unique in that they leverage a page that resides
    //  in the library (usually under node_modules) and therefore one that will
    //  not expose a tibet_pub reference. We have to add that in manually.
    if (TP.sys.cfg('boot.context') === 'headless') {

        index = path.indexOf(TP.sys.cfg('boot.libtest', '/etc/headless'));
        if (index !== -1) {
            head = path.slice(0, index);
            TP.boot.$$apphead = head;
// console.log('computed TP.boot.$$apphead: ' + TP.boot.$$apphead);
            return TP.boot.$$apphead;
        } else {
            index = path.indexOf('/node_modules');
            if (index !== -1) {
                head = path.slice(0, index);
                TP.boot.$$apphead = head;
// console.log('computed TP.boot.$$apphead: ' + TP.boot.$$apphead);
                return TP.boot.$$apphead;
            }
        }

        //  Fall through for other cases...headless launches are also file:
        //  launches so we'll rely on the logic below for remainder.
    }

    //  For file: launches the public directory or the node_modules directory
    //  is likely to be on the URI path.
    if (path.indexOf('file:') === 0) {
        keys = [TP.sys.cfg('boot.tibet_pub'), TP.sys.cfg('boot.tibet_dir')];
        len = keys.length;
        for (i = 0; i < len; i++) {
            key = '/' + keys[i] + '/';
            if (path.indexOf(key) !== -1) {
                TP.boot.$$apphead = path.slice(0, path.indexOf(key));
                return TP.boot.$$apphead;
            }
        }

        //  Didn't find a typical project library location on the path. Check to
        //  see if we're _in_ the library.
        lib = TP.sys.cfg('boot.libtest') || TP.sys.cfg('boot.tibet_lib');
        if (path.indexOf('/' + lib + '/') !== -1) {
            TP.boot.$$apphead = path.slice(0,
                path.indexOf('/' + lib + '/') + lib.length + 1);
            return TP.boot.$$apphead;
        }
    }

    //  HTTP or similar protocol where we're likely rooted from some host
    //  and a path directly to the index.html (or no visible path at all).

    //  In neither case will we normally find a public or node_modules
    //  directory reference on the URI. It'll usually just be whatever is
    //  the "collection path" that contains index.html, or the full path
    //  if we're basically looking at host:port[/].

    //  Process the path as a typical HTTP launch path which means finding the
    //  host:port portion (if any) or the final "collection path".
    parts = path.split('/');
    if (parts[parts.length - 1].match(/\./)) {
        parts.length = parts.length - 1;
    }
    path = parts.join('/');

    TP.boot.$$apphead = path;

    return TP.boot.$$apphead;
};

//  ----------------------------------------------------------------------------

TP.boot.$getAppRoot = function() {

    /**
     * @method $getAppRoot
     * @summary Returns the root path for the application, the point from which
     *     most if not all "app path" resolution occurs. Unless this has been
     *     defined otherwise the return value is computed based on the launch
     *     path and then adjusted relative to $getAppHead. If the launch path
     *     includes a reference to boot.tibet_pub the app root is presumed to be
     *     the location boot.tibet_pub and it is adjusted accordingly.
     * @returns {String} The computed path.
     */

    var approot,
        pub,
        path,
        params,
        index,
        keys,
        len,
        i,
        key;

    //  first check for a cached value. this is what's used during booting
    if (TP.boot.$$approot != null) {
        return TP.boot.$$approot;
    }

    //  if specified it should be an absolute path we can expand and use.
    approot = TP.sys.cfg('path.app_root');
    if (TP.boot.$notEmpty(approot)) {
        return TP.boot.$setAppRoot(approot);
    }

    //  Compute from the window location, normally a reference to an index.html
    //  file somewhere below a host (but maybe a file:// reference as well).
    path = decodeURI(window.location.toString());

    //  Headless launches are unique in that they leverage a page that resides
    //  in the library (usually under node_modules) and therefore one that will
    //  not expose a tibet_pub reference. We have to add that in manually.
    if (TP.sys.cfg('boot.context') === 'headless') {

        //  First look for help on the URL. TIBET's headless launch script is
        //  often invoked via CLI calls that augment the URI with app_root.
        params = TP.boot.$uriFragmentParameters(path);
        if (params['path.app_root']) {
            TP.boot.$$approot = TP.boot.$uriCollapsePath(
                TP.boot.$uriJoinPaths(TP.boot.$$apphead,
                    params['path.app_root']));
// console.log('supplied TP.boot.$$approot: ' + TP.boot.$$approot);
            return TP.boot.$$approot;
        }

        if (window[TP.sys.cfg('karma.slot', '__karma__')]) {
            pub = TP.boot.$uriJoinPaths(
                TP.sys.cfg('boot.karma_root'),
                TP.sys.getcfg('boot.tibet_pub'));
        } else {
            index = path.indexOf(TP.sys.cfg('boot.libtest', '/etc/headless'));
            if (index !== -1) {
                pub = '';
            } else {
                index = path.indexOf('/node_modules');
                if (index !== -1) {
                    pub = '';
                }
            }
            pub = TP.boot.$notValid(pub) ? TP.sys.getcfg('boot.tibet_pub') :
                pub;
        }

        if (!TP.boot.$$apphead) {
            TP.boot.$getAppHead();
        }
// console.log('current TP.boot.$$apphead: ' + TP.boot.$$apphead);
        TP.boot.$$approot = TP.boot.$uriCollapsePath(
            TP.boot.$uriJoinPaths(TP.boot.$$apphead, pub));
// console.log('computed headless TP.boot.$$approot: ' + TP.boot.$$approot);
        return TP.boot.$$approot;
    }

    //  Remaining path processing works with just the base path.
    path = path.split(/[#?]/)[0];

    //  Normally we want the location below public, but that will typically be
    //  found only when launching via the file system. When running from a
    //  typical web server the index.html file will be at '/' with no prefix for
    //  the public directory (since the TDS etc. normally root the server there.
    if (path.indexOf('file:') === 0) {
        keys = [TP.sys.cfg('boot.tibet_pub'), TP.sys.cfg('boot.tibet_inf')];
        len = keys.length;
        for (i = 0; i < len; i++) {
            key = '/' + keys[i] + '/';
            if (path.indexOf(key) !== -1) {
                TP.boot.$$approot = path.slice(0,
                    path.indexOf(key) + key.length);
// console.log('adjusted file: TP.boot.$$approot: ' + TP.boot.$$approot);
                return TP.boot.$$approot;
            }
        }
    }

    //  For HTTP launches where there's rarely an extra subdirectory we will
    //  almost always see app root and app head pointing to the same path.
    return TP.boot.$setAppRoot(TP.boot.$getAppHead());
};

//  ----------------------------------------------------------------------------

TP.boot.$getLibRoot = function() {

    /**
     * @method $getLibRoot
     * @summary Returns the root path for the TIBET codebase.
     * @description When the value for path.lib_root is not specified this
     *     method will try to compute one. The computation can be altered via
     *     the boot.libcomp setting.
     * @returns {String} The root path for the TIBET codebase.
     */

    var comp,
        libroot,
        loc,
        test,
        ndx,
        path,
        parts,
        node;

    //  first check for a cached value. this is what's used during booting
    if (TP.boot.$$libroot != null) {
        return TP.boot.$$libroot;
    }

    //  if specified it should be an absolute path we can expand and use
    libroot = TP.sys.cfg('path.lib_root');
    if (TP.boot.$notEmpty(libroot)) {
        return TP.boot.$setLibRoot(libroot);
    }

    //  Default starting point is the current window location minus any fragment
    //  and file reference.
    loc = decodeURI(window.location.toString());
    libroot = loc.split(/[#?]/)[0];

    parts = libroot.split('/');
    if (parts[parts.length - 1].match(/\./)) {
        parts.length = parts.length - 1;
    }
    libroot = parts.join('/');

    //  A bit of a hack but no clear way around this. Karma will run its own web
    //  server and include a segment like '/base' for some reason. We have to
    //  adjust for that if we appear to be loading in a Karma environment.
    if (window[TP.sys.cfg('karma.slot', '__karma__')]) {

        libroot = TP.boot.$uriJoinPaths(libroot, TP.sys.cfg('boot.karma_root'));
    }

    comp = TP.sys.cfg('boot.libcomp');

    switch (comp) {

        case 'apphead':
            //  force to match app_head.
            return TP.boot.$setLibRoot(TP.boot.$getAppHead());

        case 'approot':
            //  force to match app_root.
            return TP.boot.$setLibRoot(TP.boot.$getAppRoot());

        case 'frozen':
            //  frozen applications typically have TIBET-INF/tibet in them
            path = TP.boot.$uriJoinPaths(
                    TP.boot.$uriJoinPaths(
                                libroot, TP.sys.cfg('boot.tibet_inf')),
                    TP.sys.cfg('boot.tibet_lib'));

            return TP.boot.$setLibRoot(path);

        case 'indexed':
            //  find location match using a string index on window location.
            test = TP.sys.cfg('boot.libtest') || TP.sys.cfg('boot.tibet_lib');
            if (TP.boot.$notEmpty(test)) {
                ndx = libroot.lastIndexOf(test);
                if (ndx !== -1) {
                    ndx += test.length + 1;
                    path = libroot.slice(0, ndx);

                    return TP.boot.$setLibRoot(path);
                }
            }
            break;

        case 'location':
            //  force to last 'collection' in the window location.
            return TP.boot.$setLibRoot(libroot);

        case 'tibet_dir':
            //  npmdir applications typically have node_modules/tibet in them
            path = TP.boot.$uriJoinPaths(
                    TP.boot.$uriJoinPaths(
                                libroot, TP.sys.cfg('boot.tibet_dir')),
                    TP.sys.cfg('boot.tibet_lib'));

            return TP.boot.$setLibRoot(path);

            /* eslint-disable no-fallthrough */
        case 'script':
            void 0;
            /* falls through */
        default:
            /* eslint-enable no-fallthrough */

            node = TP.sys.getLaunchNode(TP.sys.getLaunchDocument());
            if (TP.boot.$isValid(node)) {
                path = node.getAttribute('src');
            }

            //  Combine current path with the src path in case of relative path
            //  specification (common) and we should end up with a workable
            //  offset.
            if (TP.boot.$notEmpty(path)) {
                return TP.boot.$setLibRoot(
                    TP.boot.$uriCollapsePath(
                        TP.boot.$uriJoinPaths(TP.boot.$uriJoinPaths(
                            libroot, path),
                        TP.sys.cfg('boot.loader_offset'))));
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
     * @method $getRootPath
     * @summary Returns the currently active root path for the codebase.
     * @returns {String} The currently active root path.
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
     * @method $setAppRoot
     * @summary Sets the application root path, the path used as a base path
     *     for any relative path computations for application content.
     * @param {String} aPath A new root path for application content.
     * @returns {String} The expanded path value.
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
     * @method $setLibRoot
     * @summary Sets the library root path, the path used as a base path for
     *     any relative path computations for library content.
     * @param {String} aPath A new root path for library content.
     * @returns {String} The expanded path value.
     */

    var path,
        debug;

    path = TP.boot.$uriExpandPath(aPath);
    path = decodeURI(path);

    if (path.charAt(path.length - 1) === '/') {
        path = path.slice(0, -1);
    }

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

TP.boot.$configurePackage = async function() {

    /**
     * @method $configurePackage
     * @summary Locates the package file if at all possible. The search checks
     *     both boot.profile and boot.package with profile taking precedence.
     *     Note that boot.profile can also override boot.config if it includes a
     *     barename. The profile 'development@team-tibet' for example will load
     *     the development profile file and use the team-tibet config. The value
     *     for boot.package on the other hand is a pure URL to the package file.
     * @returns {Document} The document containing the package XML.
     */

    var profile,
        package,
        pkgName,
        config,
        parts,
        file,
        xml,
        err;

    //  First step is about giving boot.profile precedence over boot.package.
    profile = TP.sys.cfg('boot.profile');
    if (TP.boot.$isEmpty(profile)) {
        TP.boot.$stdout('Empty boot.profile. Checking for boot.package.',
            TP.DEBUG);

        package = TP.sys.cfg('boot.package');
        if (TP.boot.$isEmpty(package)) {
            package = '~app_cfg/main.xml';

            TP.boot.$stdout('Empty boot.package. Defaulting to ' +
                package + '.', TP.DEBUG);
        } else {
            TP.boot.$stdout('Found boot.package. Using: ' + package,
                TP.DEBUG);
        }

        pkgName = package;
        if (pkgName.indexOf('/') !== -1) {
            pkgName = pkgName.slice(pkgName.lastIndexOf('/') + 1);
        }
        pkgName = pkgName.replace('.xml', '');

    } else {
        TP.boot.$stdout('Found boot.profile. Using: ' + profile, TP.DEBUG);
    }

    //  Second step is processing any boot.profile if found to update any
    //  boot.package and boot.config values contained in the profile.
    if (TP.boot.$notEmpty(profile)) {

        //  If we see @ it's a package@config description. Split and update the
        //  proper elements as needed.
        if (/@/.test(profile)) {
            parts = profile.split('@');
            package = parts[0];

            config = TP.sys.cfg('boot.config');
            if (config !== parts[1]) {

                //  If the existing config isn't empty we're about to change it.
                //  Don't do that without writing a warning to the logs.
                if (TP.boot.$notEmpty(config)) {
                    TP.boot.$stdout(
                        'Overriding boot.config (' + config +
                        ') with profile@config: ' + parts[1], TP.DEBUG);
                }

                //  Configuration mismatch. We'll go with the one on the
                //  profile...because we're in an IF whose condition is that
                //  there was no boot.package spec'd to go with boot.config.
                TP.sys.setcfg('boot.config', parts[1]);
            }
        } else {
            package = profile;
        }

        pkgName = package;
    }

    //  Packages should always be .xml files. If we're defaulting from user
    //  input though we don't assume they added that to either profile or
    //  package name.
    if (/\.xml$/.test(package) !== true) {
        package += '.xml';
    }

    //  If the package spec isn't absolute we need to join it with a
    //  directory or other prefix so we can find the actual resource.
    if (!TP.boot.$uriIsAbsolute(package)) {
        package = TP.boot.$uriJoinPaths('~app_cfg', package);
    }

    //  Warn if we're overriding package info
    if (package !== TP.sys.cfg('boot.package') &&
        TP.boot.$notEmpty(TP.sys.cfg('boot.package'))) {
        TP.boot.$stdout(
            'Overriding boot.package (' + TP.sys.cfg('boot.package') +
            ') with: ' + package, TP.WARN);
    }

    TP.sys.setcfg('boot.package', pkgName);

    file = TP.boot.$uriExpandPath(package);
    TP.boot.$stdout('Loading package: ' +
        TP.boot.$uriInTIBETFormat(file), TP.DEBUG);

    xml = await TP.boot.$uriLoad(file, TP.DOM, 'manifest');
    if (xml) {
        TP.boot.$$bootxml = xml;
        TP.boot.$$bootfile = file;
    } else {

        err = 'Boot package \'' + package + '\' not found in: ' + file;
        TP.boot.$stderr(err, TP.FATAL);

        throw new Error(err);
    }

    TP.boot.$stdout('Boot using: ' +
        TP.sys.getcfg('boot.package') + '@' +
        (TP.sys.getcfg('boot.config') || 'default'),
        TP.SYSTEM);

    return xml;
};

//  ----------------------------------------------------------------------------

TP.boot.$configureBootstrap = async function() {

    /**
     * @method $configureBootstrap
     * @summary Configures any boot properties based on the current project
     *     (tibet.json) file provided that loading that file works.
     */

    var file,
        str,
        obj,
        logpath;

    //  Launch parameters can be provided directly to the launch command such
    //  that the bootstrap file isn't needed. If that's the case we can skip
    //  loading the file and cut out one more HTTP call...or if we've already
    //  done this once during launch vs. boot processing.
    if (TP.sys.cfg('boot.no_tibet_file') || TP.boot.$$bootstrap) {
        return;
    }

// console.log('~app: ' + TP.boot.$uriExpandPath('~app'));

    file = TP.boot.$uriJoinPaths('~app', TP.sys.cfg('boot.tibet_file'));
// console.log('file before: ' + file);
    logpath = TP.boot.$uriInTIBETFormat(file);

    file = TP.boot.$uriExpandPath(file);
// console.log('file after: ' + file);

    try {
        TP.boot.$stdout('Loading TIBET project file: ' + logpath, TP.DEBUG);
        str = await TP.boot.$uriLoad(file, TP.TEXT, 'source');
        if (!str) {
            TP.boot.$stderr('Failed to load: ' + file, TP.FATAL);
        }
        obj = JSON.parse(str);

        //  Cache as bootstrap for reference.
        TP.boot.$$bootstrap = obj;

    } catch (e) {
        TP.boot.$stderr('Failed to load: ' + logpath,
            TP.boot.$ec(e), TP.FATAL);
        return;
    }

    //  Process the values in the tibet_file to push them into the system
    //  configuration.
    TP.boot.$configureOptions(obj);
};

//  ----------------------------------------------------------------------------

TP.boot.$configureEnvironment = function() {

    /**
     * @method $configureEnvironment
     * @summary Defines a number of 'environment' variables which support
     *     conditional processing of tasks/targets. These variables are set
     *     based browser and feature-detection techniques as needed to try to
     *     describe the environment accurately.
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

    //  language
    TP.boot.$$setenv('tibet.xmllang',
                        TP.$language.toLowerCase());
    TP.boot.$$setenv('tibet.' + TP.$language.toLowerCase(),
                        TP.$language.toLowerCase());

    TP.sys.setcfg('tibet.offline', !TP.sys.isHTTPBased());
};

//  ----------------------------------------------------------------------------

TP.boot.$configureOptions = function(anObject, aPrefix) {

    /**
     * @method $configureOptions
     * @summary Sets configuration options (i.e. 'cfg' variables') based on the
     *     supplied object. Note that this method can handle nested structures
     *     by recursing on the structure.
     * @param {Object} anObject An object containing key/value pairs that are
     *     used for 'cfg' variable names and values.
     * @param {String} [aPrefix=''] The key prefix to use to look up the value.
     */

    var prefix;

    //  Default the prefix to '', but if it's not empty, tack a '.' onto the end
    //  of it, since this must be a recursive call from ourself below to process
    //  a nested structure.
    prefix = aPrefix || '';
    if (prefix !== '') {
        prefix = prefix + '.';
    }

    Object.keys(anObject).forEach(
            function(key) {
                var name,
                    value;

                //  JSON comment - move on
                if (key.indexOf('//') === 0) {
                    return;
                }

                name = prefix + key;
                value = anObject[key];

                //  If the value isn't a primitive we assume the key is a prefix
                //  and that we need to nest the data appropriately.
                if (Object.prototype.toString.call(value) ===
                    '[object Object]') {

                    //  Note the recursive call to process the nested structure.
                    return TP.boot.$configureOptions(value, name);
                } else {
                    TP.boot.$stdout('$configureOption ' + name +
                                    ' = ' + value,
                                    TP.DEBUG);

                    TP.sys.setcfg(name, value);

                    //  Update cached values as needed.
                    if (name === 'path.app_root') {
                        TP.boot.$stdout(
                            'Overriding path.app_root cache with: ' + value,
                            TP.DEBUG);
                        TP.boot.$$approot = TP.boot.$uriExpandPath(value);
                    } else if (name === 'path.lib_root') {
                        TP.boot.$stdout(
                            'Overriding path.lib_root cache with: ' + value,
                            TP.DEBUG);
                        TP.boot.$$libroot = TP.boot.$uriExpandPath(value);
                    }
                }
            });
};

//  ----------------------------------------------------------------------------

TP.boot.$$configureOverrides = function(options, activate) {

    /**
     * @method $$configureOverrides
     * @summary Processes any arg values that the user may have set,
     *     allowing them to override certain boot properties. Common overrides
     *     include debug, verbose, and display. The args for environment
     *     setting are processed individually by the
     *     TP.boot.$configureBootstrap function prior to loading the
     *     environment-specific configuration.
     * @param {Object} options An object containing option values.
     * @param {Boolean} [activate=false] Whether or not to activate override
     *     checking.
     */

    var keys,
        overrides;

    if (TP.boot.$notValid(options)) {
        return;
    }

    keys = Object.keys(options);

    //  If we've been here already then merge in any new values being provided.
    overrides = TP.sys.overrides;
    if (TP.boot.$isValid(overrides)) {
        //  Two key steps here are launch() params and URL values. URL values
        //  come second (so we can honor boot.no_url_args from launch()) but do
        //  outrank launch parameters when they exist so we just map over.
        keys.forEach(
                function(key) {
                    var value;

                    value = options[key];

                    if (Object.prototype.toString.call(value) ===
                        '[object Object]') {
                        Object.keys(value).forEach(
                                function(subkey) {
                                    var name;

                                    name = key + '.' + subkey;

                                    overrides[name] = value[subkey];
                                });
                    } else {
                        overrides[key] = value;
                    }
                });
    }

    //  Set the actual configuration values for anything we've been provided
    keys.forEach(
            function(key) {
                var value;

                value = options[key];

                if (Object.prototype.toString.call(value) ===
                    '[object Object]') {

                    Object.keys(value).forEach(
                            function(subkey) {
                                var name;

                                name = key + '.' + subkey;

                                TP.boot.$stdout(
                                    'Overriding cfg for: ' + name +
                                    ' with: \'' +
                                    value[subkey] + '\'',
                                    TP.DEBUG);

                                TP.sys.setcfg(
                                        name, value[subkey], false, true);
                            });
                } else {

                    TP.boot.$stdout(
                        'Overriding cfg for: ' + key + ' with: \'' +
                        value + '\'',
                        TP.DEBUG);

                    TP.sys.setcfg(key, value, false, true);
                }
            });

    TP.boot.$$argsDone = activate;
};

//  ----------------------------------------------------------------------------

TP.boot.$configureProject = function() {

    /**
     * @method $$configureProject
     * @summary Sets the various project.* properties for the project, such as
     *     name, version and controller.
     */

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

    if (TP.boot.$notValid(TP.sys.cfg('project.root_page'))) {
        TP.sys.setcfg('project.root_page', '~boot_xhtml/UIROOT.xhtml');
    }

    if (TP.boot.$notValid(TP.sys.cfg('project.home_page'))) {
        TP.sys.setcfg('project.home_page', '~boot_xhtml/home.xhtml');
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$configureTarget = function() {

    /**
     * @method $configureTarget
     * @summary Sets the boot system's package config target.
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
};

//  ----------------------------------------------------------------------------

TP.boot.$configureUI = function() {

    /**
     * @method $configureUI
     * @summary Sets up the boot system's boot GUI. This uses the value of the
     *     cfg() variable 'boot.show_log' to determine whether the boot log
     *     should be visible or not.
     */

    var show,
        elem;

    elem = TP.boot.getUIBoot();
    if (!TP.boot.$isVisible(elem) || TP.boot.$notValid(elem.contentDocument)) {
        return;
    }

    show = TP.sys.cfg('boot.show_log');
    if (show === true || show === 'true') {
        TP.boot.$elementAddClass(elem.contentDocument.body, 'showlog');
    } else {
        TP.boot.$elementReplaceClass(elem.contentDocument.body, 'showlog', '');
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$updateDependentVars = function() {

    /**
     * @method $updateDependentVars
     * @summary Updates any variable dependencies that might have changed
     *     because of changes that might have been made to those variables when
     *     reading in new config data.
     */

    var level,
        scheme,
        theme;

    //  Logging level drives how the UI looks, so it needs to be updated.
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
        //  Reset and warn.
        TP.sys.setcfg('boot.level', TP.WARN, false, true);
        TP.boot.$$loglevel = TP.boot.WARN;
        TP.boot.$computeLogBufferSize();
            TP.boot.$stdout('Invalid boot.level: ' + level +
                '. Forcing to TP.WARN', TP.WARN);
    } else {
        TP.boot.$$loglevel = level;
    }

    //  Debugging and verbosity flags control visible output in the logs.
    TP.$DEBUG = TP.sys.cfg('tibet.$debug', false);
    TP.$VERBOSE = TP.sys.cfg('tibet.$verbose', false);
    TP.$$DEBUG = TP.sys.cfg('tibet.$$debug', false);
    TP.$$VERBOSE = TP.sys.cfg('tibet.$$verbose', false);

    TP.boot.$debug = TP.sys.cfg('boot.$debug', false);
    TP.boot.$verbose = TP.sys.cfg('boot.$verbose', false);
    TP.boot.$$debug = TP.sys.cfg('boot.$$debug', false);
    TP.boot.$$verbose = TP.sys.cfg('boot.$$verbose', false);

    //  one key thing regarding proper booting is that when we're not using
    //  two phase booting we'll set phase_two to true at the configuration
    //  level so that no node filtering of phase two nodes is done. the
    //  result is that the system thinks we're in both phase one and phase
    //  two from a node filtering perspective
    TP.sys.setcfg('boot.phase_two', TP.sys.cfg('boot.two_phase') === false);

    //  Reconfigure style color settings to match any updates to color scheme.
    scheme = TP.sys.cfg('boot.color.scheme');

    TP.boot.$$styles.browser.black[0] = '<span style="color:' +
        TP.sys.cfg('color.' + scheme + '.black') + ';">';
    TP.boot.$$styles.browser.red[0] = '<span style="color:' +
        TP.sys.cfg('color.' + scheme + '.red') + ';">';
    TP.boot.$$styles.browser.green[0] = '<span style="color:' +
        TP.sys.cfg('color.' + scheme + '.green') + ';">';
    TP.boot.$$styles.browser.yellow[0] = '<span style="color:' +
        TP.sys.cfg('color.' + scheme + '.yellow') + ';">';
    TP.boot.$$styles.browser.blue[0] = '<span style="color:' +
        TP.sys.cfg('color.' + scheme + '.blue') + ';">';
    TP.boot.$$styles.browser.magenta[0] = '<span style="color:' +
        TP.sys.cfg('color.' + scheme + '.magenta') + ';">';
    TP.boot.$$styles.browser.cyan[0] = '<span style="color:' +
        TP.sys.cfg('color.' + scheme + '.cyan') + ' ;">';
    TP.boot.$$styles.browser.white[0] = '<span style="color:' +
        TP.sys.cfg('color.' + scheme + '.white') + ';">';
    TP.boot.$$styles.browser.gray[0] = '<span style="color:' +
        TP.sys.cfg('color.' + scheme + '.gray') + ';">';

    TP.boot.$$styles.browser.bgBlack[0] = '<span style="background-color:' +
        TP.sys.cfg('color.' + scheme + '.bgBlack') + ';color:' +
        TP.sys.cfg('color.' + scheme + '.gray') + ';">';
    TP.boot.$$styles.browser.bgRed[0] = '<span style="background-color:' +
        TP.sys.cfg('color.' + scheme + '.bgRed') + ';color:' +
        TP.sys.cfg('color.' + scheme + '.fgText') + ';">';
    TP.boot.$$styles.browser.bgGreen[0] = '<span style="background-color:' +
        TP.sys.cfg('color.' + scheme + '.bgGreen') + ';color:' +
        TP.sys.cfg('color.' + scheme + '.fgText') + ';">';
    TP.boot.$$styles.browser.bgYellow[0] = '<span style="background-color:' +
        TP.sys.cfg('color.' + scheme + '.bgYellow') + ';color:' +
        TP.sys.cfg('color.' + scheme + '.fgText') + ';">';
    TP.boot.$$styles.browser.bgBlue[0] = '<span style="background-color:' +
        TP.sys.cfg('color.' + scheme + '.bgBlue') + ';color:' +
        TP.sys.cfg('color.' + scheme + '.fgText') + ';">';
    TP.boot.$$styles.browser.bgMagenta[0] = '<span style="background-color:' +
        TP.sys.cfg('color.' + scheme + '.bgMagenta') + ';color:' +
        TP.sys.cfg('color.' + scheme + '.fgText') + ';">';
    TP.boot.$$styles.browser.bgCyan[0] = '<span style="background-color:' +
        TP.sys.cfg('color.' + scheme + '.bgCyan') + ';color:' +
        TP.sys.cfg('color.' + scheme + '.fgText') + ';">';
    TP.boot.$$styles.browser.bgWhite[0] = '<span style="background-color:' +
        TP.sys.cfg('color.' + scheme + '.bgWhite') + ';color:' +
        TP.sys.cfg('color.' + scheme + '.fgText') + ';">';

    TP.boot.$$styles.browser.dim[0] =
        '<span style="color:' +
        TP.sys.cfg('color.' + scheme + '.dim') + ';">';
    TP.boot.$$styles.browser.reset[0] =
        '<span style="background-color:' +
        TP.sys.cfg('color.' + scheme + '.black') + ';color:' +
        TP.sys.cfg('color.' + scheme + '.white') + ';">';
    TP.boot.$$styles.browser.inverse[0] =
        '<span style="background-color:' +
        TP.sys.cfg('color.' + scheme + '.white') + ';color:' +
        TP.sys.cfg('color.' + scheme + '.black') + ';">';

    //  Adjust baseline boot.color.theme to the any updated settings.
    theme = TP.sys.cfg('boot.color.theme');
    TP.boot.$$theme = TP.boot.$$buildTheme(theme);

    //  Clear any cached UI elements in cases of turning off/altering boot UI.
    TP.boot.$releaseUIElements();
};

//  ============================================================================
//  MANIFEST EXPANSION FUNCTIONS
//  ============================================================================

TP.boot.$ifUnlessPassed = function(aNode) {

    /**
     * @method $ifUnlessPassed
     * @summary Tests if and unless conditions on the node, returning true if
     *     the node passes and should be retained based on those conditions.
     *     This test is typically used to filter for the current browser
     *     environment based on TP.sys.isUA()-style tests.
     * @param {Node} aNode The node to check for the if and unless conditions.
     * @returns {Boolean} Whether or not the node should be retained.
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
                    condition = TP.sys.cfg(key, TP.sys.env(key)) ||
                                TP.sys.hasFeature(key);
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
                    condition = TP.sys.cfg(key, TP.sys.env(key)) ||
                                TP.sys.hasFeature(key);
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
     * @method $getElementCount
     * @summary Returns the count of elements in a node list.
     * @param {Nodelist} aNodeList A native nodelist or array of nodes.
     * @returns {Number} The number of element nodes in the list.
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
     * @method $uniqueNodeList
     * @summary Removes any duplicates from the array provided so that
     *     subsequent loads of the list don't try to load things twice.
     * @param {Node[]} aNodeArray The Array of Nodes to unique for duplicates.
     * @returns {Node[]} The supplied Array of Nodes filtered for duplicates.
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
//  IMPORT FUNCTIONS
//  ============================================================================

TP.boot.$sourceUrlImport = function(scriptUrl, targetDoc, callback, shouldThrow) {

    /**
     * @method $sourceUrlImport
     * @summary Asynchronously integrates a URL of JS script into TIBET. This
     *     returns the script node used for the import.
     * @param {String} scriptUrl The source URL that the script will be loaded
     *     from.
     * @param {Document} targetDoc The HTML document that the script source will
     *     be imported into.
     * @param {Function} callback A function that will be called when the script
     *     has completed loading.
     * @param {Boolean} shouldThrow True to cause errors to throw a native Error
     *     so outer catch blocks will trigger.
     * @returns {HTMLElement} The new 'script' element that was created to
     *     import the code.
     */

    var elem,
        scriptDoc,
        scriptHead,
        result,
        handler;

    //  Don't load what we're already processing.
    /* eslint-disable no-extra-parens */
    if (scriptUrl &&
        (TP.boot.$$srcPath == TP.boot.$uriInTIBETFormat(scriptUrl))) {
    /* eslint-enable no-extra-parens */
        return;
    }

    if (scriptUrl == null) {
        TP.boot.$stderr('Invalid script source.');

        return null;
    }

    //  load the source the 'DOM way' so we get commented source
    elem = TP.boot.$$scriptTemplate.cloneNode(true);
    TP.boot.$$loadNode = elem;

    //  ensure we keep track of the proper package/config information
    TP.boot.$$loadNode.setAttribute('loadpkg',
                                    TP.sys.cfg('load.package', ''));
    TP.boot.$$loadNode.setAttribute('loadcfg',
                                    TP.sys.cfg('load.config', ''));
    TP.boot.$$loadNode.setAttribute('loadstage',
                                    TP.sys.cfg('load.stage', ''));

    TP.boot.$$loadNode.setAttribute('srcpkg',
                                    TP.sys.cfg('src.package', ''));
    TP.boot.$$loadNode.setAttribute('srccfg',
                                    TP.sys.cfg('src.config', ''));

    scriptDoc = TP.boot.$isValid(targetDoc) ?
                        targetDoc :
                        document;

    scriptHead = TP.boot.$isValid(targetDoc) ?
                        scriptDoc.getElementsByTagName('head')[0] :
                        TP.boot.$$head;

    //  set a reference so when/if this errors out we'll get the right url
    //  reference
    TP.boot.$$onerrorURL = scriptUrl;

    TP.boot.$$srcPath = TP.boot.$uriInTIBETFormat(scriptUrl);
    TP.boot.$$loadPath = TP.boot.$uriInTIBETFormat(scriptUrl);

    try {
        //  Set the 'src' attribute to the supplied script URL.
        elem.setAttribute('src', scriptUrl);

        //  Append the script element to the head. This will start the script's
        //  asynchronous loading process.
        result = TP.boot.$nodeAppendChild(scriptHead, elem);
    } catch (e) {
        $ERROR = e;
    } finally {
        /* eslint-disable no-unsafe-finally */
        //  appends with source code that has syntax errors or other issues
        //  won't trigger Error conditions we can catch, but they will hit
        //  the onerror hook so we can check $STATUS and proceed from there.
        if ($ERROR) {
            if (shouldThrow) {
                TP.boot.$$loadNode = null;
                TP.boot.$$srcPath = null;
                TP.boot.$$loadPath = null;

                throw $ERROR;
            }
        } else if (!result || $STATUS !== 0) {

            TP.boot.$$loadNode = null;
            TP.boot.$$srcPath = null;
            TP.boot.$$loadPath = null;

            if (shouldThrow === true) {
                throw new Error('Import failed for: ' + scriptUrl);
            } else {
                TP.boot.$stderr('Import failed for: ' + scriptUrl);
            }

            return null;
        }

        //  clear the onerror url reference
        TP.boot.$$onerrorURL = null;
        /* eslint-enable no-unsafe-finally */
    }

    handler = function(evt) {

        var postImports,
            sherpa,
            type,
            len,
            i;

        result.removeEventListener('load', handler, false);

        TP.boot.$$loadNode = null;
        TP.boot.$$srcPath = null;
        TP.boot.$$loadPath = null;

        //  if the system is already running we need to initialize any types
        //  that haven't had that done (invoking it on an previous type won't
        //  matter). We also signal if the sherpa is active to let it know about
        //  the type.
        if (TP.sys.hasStarted()) {

            //  Whether or not the Sherpa is loaded
            sherpa = TP.sys.hasFeature('sherpa');

            postImports = TP.boot.$$postImports;

            len = postImports.length;
            for (i = 0; i < len; i++) {

                type = postImports[i];

                try {
                    if (TP.canInvoke(type, 'initialize')) {
                        //  Put in a check here to make sure we don't initialize
                        //  a type twice.
                        if (type.isInitialized()) {
                            TP.warn('Type already initialized: ' +
                                        type.getName());
                        } else if (type.ownsMethod('initialize')) {
                            //  We only initialize types that *own* an
                            //  initialize method.
                            TP.trace('Initializing type: ' + type.getName());
                            type.initialize();
                        }
                    }

                    if (sherpa) {
                        TP.signal(type, 'TypeLoaded');
                    }
                } catch (e) {
                    TP.error('Type initialization failed: ' + e.message);
                }
            }
            TP.boot.$$postImports.length = 0;
        }

        if (typeof callback === 'function') {
            callback();
        }
    };

    result.addEventListener('load', handler, false);

    return result;
};

//  ----------------------------------------------------------------------------

TP.boot.$sourceImport = function(jsSrc, targetDoc, srcUrl, shouldThrow,
isECMAModule) {

    /**
     * @method $sourceImport
     * @summary Synchronously integrates a chunk of JS script text into TIBET.
     *     This returns the script node used for the import. Note that this
     *     import call is synchronous, ensuring that the code is loaded prior to
     *     returning.
     * @param {String} jsSrc The JavaScript source to import.
     * @param {Document} targetDoc The HTML document that the script source will
     *     be imported into.
     * @param {String} srcUrl The source URL that the script came from (useful
     *     for debugging purposes). This defaults to 'inline' if its not
     *     supplied.
     * @param {Boolean} shouldThrow True to cause errors to throw a native Error
     *     so outer catch blocks will trigger.
     * @param {Boolean} isECMAModule Whether or not the source being imported is
     *     an ECMAScript Module. If so, the script tag created to hold the
     *     supplied script file or text will have a 'type="module"' attribute.
     * @returns {HTMLElement} The new 'script' element that was created to
     *     import the code.
     */

    var elem,
        result,
        scriptDoc,
        scriptHead,
        scriptUrl,
        jsSrcUrl,
        oldScript,
        postImports,
        sherpa,
        type,
        len,
        i,
        tn;

    //  Don't load what we're already processing.
    /* eslint-disable no-extra-parens */
    if (srcUrl && (TP.boot.$$srcPath == TP.boot.$uriInTIBETFormat(srcUrl))) {
    /* eslint-enable no-extra-parens */
        return;
    }

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
    TP.boot.$$loadNode = elem;

    //  if this is an ECMA Module, set a 'type' of 'module' on the new script
    //  element.
    if (isECMAModule) {
        elem.setAttribute('type', 'module');
    }

    //  ensure we keep track of the proper package/config information
    TP.boot.$$loadNode.setAttribute('loadpkg',
                                    TP.sys.cfg('load.package', ''));
    TP.boot.$$loadNode.setAttribute('loadcfg',
                                    TP.sys.cfg('load.config', ''));
    TP.boot.$$loadNode.setAttribute('loadstage',
                                    TP.sys.cfg('load.stage', ''));

    TP.boot.$$loadNode.setAttribute('srcpkg',
                                    TP.sys.cfg('src.package', ''));
    TP.boot.$$loadNode.setAttribute('srccfg',
                                    TP.sys.cfg('src.config', ''));

    scriptDoc = TP.boot.$isValid(targetDoc) ?
                        targetDoc :
                        document;

    scriptHead = TP.boot.$isValid(targetDoc) ?
                        scriptDoc.getElementsByTagName('head')[0] :
                        TP.boot.$$head;

    scriptUrl = TP.boot.$isValid(srcUrl) ? srcUrl : 'inline';

    //  Patch for stack traces on text-injected code. See:
    //  https://bugs.webkit.org/show_bug.cgi?id=25475
    if (scriptUrl !== 'inline') {
        jsSrcUrl = '/' + '/' + '#' + ' sourceURL=' + scriptUrl + '\n\n' + jsSrc;
    } else {
        jsSrcUrl = jsSrc;
    }

    //  set a reference so when/if this errors out we'll get the right
    //  url reference
    TP.boot.$$onerrorURL = scriptUrl;

    TP.boot.$$srcPath = TP.boot.$uriInTIBETFormat(scriptUrl);
    TP.boot.$$loadPath = TP.boot.$uriInTIBETFormat(scriptUrl);

    try {
        //  first, check to see if we already have a 'script' node with a
        //  'source' attribute equal to scriptUrl. If we do, that means we've
        //  already brought this code in once and need to remove the old node
        oldScript = scriptHead.querySelector('*[source="' + scriptUrl + '"]');
        if (oldScript) {
            oldScript.parentNode.removeChild(oldScript);

            //  Make sure to copy over the ID - other TIBET machinery uses it
            elem.setAttribute('id', oldScript.getAttribute('id'));
        }

        tn = scriptDoc.createTextNode(jsSrcUrl);
        TP.boot.$nodeAppendChild(elem, tn);

        //  since we're not using the src attribute put the url on the
        //  source attribute, which TIBET uses as an alternative
        elem.setAttribute('source', scriptUrl);

        result = TP.boot.$nodeAppendChild(scriptHead, elem);
    } catch (e) {
        $ERROR = e;
    } finally {
        /* eslint-disable no-unsafe-finally */
        //  appends with source code that has syntax errors or other issues
        //  won't trigger Error conditions we can catch, but they will hit
        //  the onerror hook so we can check $STATUS and proceed from there.
        if ($ERROR) {
            if (shouldThrow) {
                TP.boot.$$loadNode = null;
                TP.boot.$$srcPath = null;
                TP.boot.$$loadPath = null;

                throw $ERROR;
            }
        } else if (!result || $STATUS !== 0) {

            TP.boot.$$loadNode = null;
            TP.boot.$$srcPath = null;
            TP.boot.$$loadPath = null;

            if (shouldThrow === true) {
                if (scriptUrl === 'inline') {
                    throw new Error('Import failed in: ' + jsSrcUrl);
                } else {
                    throw new Error('Import failed for: ' + scriptUrl);
                }
            } else {
                if (scriptUrl === 'inline') {
                    TP.boot.$stderr('Import failed in: ' + jsSrcUrl);
                } else {
                    TP.boot.$stderr('Import failed for: ' + scriptUrl);
                }
            }

            return null;
        }

        //  clear the onerror url reference
        TP.boot.$$onerrorURL = null;
        /* eslint-enable no-unsafe-finally */
    }

    TP.boot.$$loadNode = null;
    TP.boot.$$srcPath = null;
    TP.boot.$$loadPath = null;

    //  if the system is already running we need to initialize any types that
    //  haven't had that done (invoking it on an previous type won't matter).
    //  We also signal if the sherpa is active to let it know about the type.
    if (TP.sys.hasStarted()) {

        //  Whether or not the Sherpa is loaded
        sherpa = TP.sys.hasFeature('sherpa');

        postImports = TP.boot.$$postImports;

        len = postImports.length;
        for (i = 0; i < len; i++) {

            type = postImports[i];

            try {
                if (TP.canInvoke(type, 'initialize')) {
                    //  Put in a check here to make sure we don't initialize a
                    //  type twice.
                    if (type.isInitialized()) {
                        TP.warn('Type already initialized: ' + type.getName());
                    } else if (type.ownsMethod('initialize')) {
                        //  We only initialize types that *own* an initialize
                        //  method.
                        TP.trace('Initializing type: ' + type.getName());
                        type.initialize();
                    }
                }

                if (sherpa) {
                    TP.signal(type, 'TypeLoaded');
                }
            } catch (e) {
                TP.error('Type initialization failed: ' + e.message);
            }
        }
        TP.boot.$$postImports.length = 0;
    }

    return result;
};

//  ----------------------------------------------------------------------------

TP.boot.$$importComplete = async function() {

    /**
     * @method $$importComplete
     * @summary Finalizes an import sequence. Called internally by the
     *     $importComponents routine.
     */

    var stage,
        win,

        needsLoadingVisual,

        focusedElems,
        focusedElem;

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
            if (TP.sys.cfg('boot.two_phase') === true) {
                //  NOTE that this test relies on the hook file for a
                //  "phase two page" to _NOT_ update the cfg parameter.
                //  When they load these pages set a window global in
                //  the UI frame and queue a monitor to observe the boot.
                if (TP.sys.cfg('boot.phase_two') === true) {

                    TP.boot.$stdout('', TP.SYSTEM);

                    TP.sys.hasLoaded(true);

                    return TP.boot.main();
                } else {

                    TP.boot.$stdout('', TP.SYSTEM);

                    //  if we didn't find a phase two page waiting for us
                    //  then we'll just pause and wait for it. when it
                    //  arrives it will see that we're paused and it will
                    //  trigger the final phase of booting
                    TP.boot.$setStage('import_paused');

                    //  basically the question is simply what happens last,
                    //  either we finish with phase one after the phase two
                    //  page has loaded, or we finish before it. if we
                    //  finish after it arrives we can just keep right on
                    //  moving, but we want to call the function in that
                    //  frame to ensure that the page initializes
                    if (TP.sys.cfg('boot.use_login') &&
                            TP.sys.cfg('boot.parallel')) {
                        //  Parallel login means the window updated will be the
                        //  boot/splash screen, not the typical uiroot screen.
                        win = TP.sys.getWindowById(TP.sys.cfg('boot.uiboot'));
                    } else {
                        win = TP.sys.getWindowById(TP.sys.cfg('tibet.uiroot'));
                    }

                    //  If we're using a login page, then focus the element that
                    //  was last focused. Sometimes, based on what's happening
                    //  on boot, this field will have lost focus.
                    //  NB: We do this in a fairly primitive fashion
                    //  rather than using the prebuilt TIBET functionality to
                    //  focus the last focused element because we don't want to
                    //  invoke other TIBET machinery this early in the boot
                    //  process. In particular, we don't want an 'Application'
                    //  singleton object to be created prematurely before the
                    //  phase two, which very well may include an Application
                    //  subtype. It is this subtype that we actually want the
                    //  singleton to be created from.

                    if (TP.sys.cfg('boot.use_login')) {

                        needsLoadingVisual = TP.sys.needsLoadingIndicator();

                        if (TP.sys.cfg('boot.parallel') && needsLoadingVisual) {
                            TP.boot.getUIBoot().
                                    contentDocument.body.style.opacity = '';
                        }

                        //  First, see if we had a focused element while the
                        //  system was loading. We do this by querying for all
                        //  of the elements that had focus and focusing on the
                        //  last one. Note that we use this mechanism as the
                        //  most reliable way to determine which element was
                        //  focused, rather than relying on a singular 'had
                        //  focus' flag. It is the most reliable way.
                        focusedElems = TP.byCSSPath(
                                            '*[onceHadFocus]',
                                            win.document.documentElement,
                                            false,
                                            false);
                        focusedElem = focusedElems.last();

                        if (!TP.isElement(focusedElem)) {
                            //  There was no previously focused element. So
                            //  grab the first element under supplied element
                            //  that has an 'autofocus' attribute on it (the
                            //  value of that attribute is irrelevant).
                            focusedElem = TP.byCSSPath(
                                                '*[autofocus]',
                                                win.document.documentElement,
                                                true,
                                                false);
                        }

                        if (TP.isElement(focusedElem)) {
                            focusedElem.focus();
                        }
                    }

                    if (win) {
                        if (win.$$phase_two === true ||
                            window.$$phase_two === true) {
                            //  if the page didn't find TIBET the function
                            //  we want to call won't be configured, and we
                            //  do it manually
                            if (TP.boot.bootPhaseTwo) {
                                TP.boot.bootPhaseTwo();
                            } else {
                                await TP.boot.$$importPhaseTwo();
                            }

                            return;
                        }
                    } else {
                        void 0;
                    }
                }
            } else {
                //  if we've been booting in a single stage then we're
                //  done since all nodes are computed at one time. the
                //  next thing is to trigger the main function and get
                //  the application logic started

                return TP.boot.main();
            }
        } else {
            //  this branch is invoked when components load after the TIBET
            //  boot process has occurred, meaning any newly booted content
            //  is effectively an "add-on"...
            TP.boot.$stdout('Loading add-on components complete.');
        }

        //  turn off reporting to bootlog via TP.boot.$stderr.
        TP.boot.$stderr = TP.boot.STDERR_NULL;
    } else {
        void 0;
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$importComponents = async function(loadSync) {

    /**
     * @method $importComponents
     * @summary Dynamically imports a set of application elements read from a
     *     list of 'bootnodes' configured by the invoking function. This boot
     *     node list is a shared property on TP.boot so only one import sequence
     *     can be running at a time.
     * @param {Boolean} loadSync Should the import be done synchronously or not?
     *     Default is false so that each file is loaded via a short setTimeout.
     */

    var j,
        tn,
        ch,
        isECMAModule,
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
        source;

    TP.boot.$$loadNode = null;

    TP.boot.$$loadPath = null;
    TP.boot.$$loadPackage = null;
    TP.boot.$$loadConfig = null;
    //  NB: We do *not* reset TP.boot.$$stage to null here - bad things will
    //  happen.

    TP.boot.$$srcPath = null;
    TP.boot.$$srcPackage = null;
    TP.boot.$$srcConfig = null;

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
        //  We need to return here.
        /* eslint-disable no-return-await */
        return await TP.boot.$$importComplete();
        /* eslint-enable no-return-await */
    }

    //  default the first time through to whatever might be configured
    sync = loadSync == null ? TP.sys.cfg('tibet.sync') : loadSync;

    //  keep our value so we're consistent in phase two if we're two phase
    TP.boot.$$loadsync = sync;

    //  only handle four cases here: scripts, inline source, echo tags, and
    //  config scripts. the node array should have already been expanded to
    //  'flatten' packages into place.
    tn = nd.tagName.toLowerCase();

    logpackage = nd.getAttribute('loadpkg');
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
                    await TP.boot.$importComponents(sync);
                } else {
                    setTimeout(await TP.boot.$$importAsync, 0);
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
                        nd.getAttribute('loadcfg'),
                        ' ',
                        srcpath.slice(srcpath.lastIndexOf('/') + 1));

            //  ignore script nodes marked defer, they'll be dyna-loaded
            //  by TIBET on request
            if (TP.sys.cfg('boot.defer') === true &&
                (nd.getAttribute('defer') === 'true' ||
                nd.getAttribute('loaddefer') === 'true')) {
                if (TP.boot.$verbose) {
                    TP.boot.$stdout('Deferring ' + logpath, TP.DEBUG);
                } else {
                    TP.boot.$stdout('Deferring ' + srcpath, TP.DEBUG);
                }

                //  re-invoke manually so we move on to the next boot node
                TP.boot.$$bootindex += 1;
                TP.boot.$displayProgress();

                if (sync) {
                    await TP.boot.$importComponents(sync);
                } else {
                    setTimeout(await TP.boot.$$importAsync, 0);
                }

                return;
            }
        } else {   //  tibet:script with inline code
            //  update the script setting so we know who's current
            TP.boot.$$script = 'inline';

            //  adjust our log path to show shorthand package/config data
            logpath = TP.boot.$join(logpackage,
                            '::',
                            nd.getAttribute('loadcfg'),
                            ' inline ', tn, ' source');
        }

        //  if we've reached this point then we're not deferring the node so
        //  get the logging and prep work done in anticipation of having the
        //  source actually load. Doing this here avoids having to have an
        //  overly complex callback function when we've got to go over the wire
        //  to get the actual source before we can import.
        TP.boot.$stdout('Loading ' +
            TP.boot.$uriInTIBETFormat(srcpath ? srcpath : logpath),
            TP.DEBUG);

        //  trigger the appropriate "will" hook
        if (srcpath) {
            TP.boot.$$loadpaths.push(srcpath);

            //  load/src path are always in virtualized form
            TP.boot.$$srcPath = TP.boot.$uriInTIBETFormat(srcpath);
            TP.boot.$$loadPath = TP.boot.$$srcPath;
        } else {
            TP.boot.$$loadPath = null;
            TP.boot.$$srcPath = null;
        }

        TP.boot.$$loadPackage = nd.getAttribute('loadpkg') || '';
        TP.boot.$$loadConfig = nd.getAttribute('loadcfg') || '';

        TP.boot.$$srcPackage = TP.boot.$uriInTIBETFormat(TP.boot.$$loadPackage);
        TP.boot.$$srcConfig = TP.boot.$$loadConfig;

        //  set the configuration values so the sourceImport call will have
        //  the information from the current node being processed

        TP.sys.setcfg('load.package', TP.boot.$$loadPackage);
        TP.sys.setcfg('load.config', TP.boot.$$loadConfig);
        TP.sys.setcfg('load.stage', TP.boot.$$stage);

        TP.sys.setcfg('src.package', TP.boot.$$srcPackage);
        TP.sys.setcfg('src.config', TP.boot.$$srcConfig);

        //  In some sense the rest of this is all about getting the source code
        //  to import, either inlined, or from the original location, in either
        //  condensed or commented format.
        //  Once the source is available we can then treat it consistently by
        //  invoking the sourceImport call to do the actual work.

        isECMAModule = nd.getAttribute('type') === 'module';

        if ((srcpath = nd.getAttribute('src')) != null) {
            //  debuggers like Firebuggy have issues with script nodes that
            //  have inline source instead of file references (or they did
            //  at the time of this writing) so we allow for the option to
            //  do dom-based import here to support source-level debugging
            //  to occur. we'll keep our comments about buggy debuggers to
            //  ourselves...mostly.
            if (TP.sys.cfg('import.use_dom')) {
                elem = TP.boot.$$scriptTemplate.cloneNode(true);

                elem.setAttribute('loadpkg', TP.boot.$$loadPackage);
                elem.setAttribute('loadcfg', TP.boot.$$loadConfig);
                elem.setAttribute('loadstage', TP.boot.$$stage);

                elem.setAttribute('srcpkg', TP.boot.$$srcPackage);
                elem.setAttribute('srccfg', TP.boot.$$srcConfig);

                if (isECMAModule) {
                    elem.setAttribute('type', 'module');
                }

                TP.boot.$$loadNode = elem;

                callback = async function(event) {

                    TP.boot.$$loadNode = null;

                    TP.boot.$$bootindex += 1;
                    TP.boot.$displayProgress();

                    if (sync) {
                        await TP.boot.$importComponents(sync);
                    } else {
                        setTimeout(await TP.boot.$$importAsync, 0);
                    }
                };

                elem.onload = callback;

                elem.setAttribute('src', srcpath);

                //  append it into the 'head' element so that it starts the
                //  loading process. If there is an error, it will be
                //  reported via the 'onerror' hook.
                TP.boot.$nodeAppendChild(TP.boot.$$head, elem);

                return;
            }

            source = await TP.boot.$uriLoad(srcpath, TP.TEXT, 'source');
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

        //  if we were handling inline code then we can import it directly now.
        try {
            TP.boot.$sourceImport(source, null, srcpath, false, isECMAModule);
        } finally {
            TP.boot.$$loadNode = null;
        }

    } else if (tn === 'tibet_image') {
        //  preload images if we're configured to do that
        if (TP.sys.cfg('boot.import_images')) {
            if ((srcpath = nd.getAttribute('src')) != null) {
                logpath = TP.boot.$join(
                        logpackage,
                        '::',
                        nd.getAttribute('loadcfg'),
                        ' ',
                        srcpath.slice(srcpath.lastIndexOf('/') + 1));

                TP.boot.$stdout('Preloading image ' + logpath, TP.DEBUG);

                image = new Image();
                image.src = srcpath;
            }
        }
    } else if (tn === 'echo') {
        //  note we do these regardless of debug/verbose settings

        level = Number(nd.getAttribute('level') || TP.boot.INFO);

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
        void 0;
    }

    //  reset the script setting
    TP.boot.$$script = null;

    //  re-invoke manually so we move on to the next boot node
    TP.boot.$$bootindex += 1;
    TP.boot.$displayProgress();

    if (sync) {
        await TP.boot.$importComponents(sync);
    } else {
        setTimeout(await TP.boot.$$importAsync, 0);
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$$importPhase = async function() {

    /**
     * @method $$importPhase
     * @summary Imports the currently active phase. This method is called by
     *     TP.boot.$$importPhaseOne() and TP.boot.$$importPhaseTwo() and should
     *     be considered private.
     */

    var package,
        config,
        phase,
        nodelist;

    //  Get the list of filtered nodes by listing the assets. This action causes
    //  whatever config is in place to be used to filter the expanded package.

    package = TP.boot.$$bootfile;
    config = TP.sys.cfg('boot.config');
    phase = TP.sys.cfg('boot.phase_one') ? 'Phase One' : 'Phase Two';

    nodelist = await TP.boot.$listPackageAssets(package, config);

    //  remaining list is our workload for actual importing
    TP.boot.$stdout('Importing ' + nodelist.length + ' ' +
        phase + ' components.',
                   TP.SYSTEM);

    TP.boot.$$bootnodes = nodelist;
    TP.boot.$$bootindex = 0;

    TP.boot.$$workload = nodelist.length;
    TP.boot.$$totalwork += nodelist.length;

    await TP.boot.$importComponents();
};

//  ----------------------------------------------------------------------------

TP.boot.$$importPhaseOne = async function() {

    /**
     * @method $$importPhaseOne
     * @summary Imports any elements of the original boot file/config that were
     *     specific to phase one.
     */

    TP.boot.$setStage('import_phase_one');

    //  always phase_one here, phase_two is set to filter out phase_two nodes
    //  when we're not doing two-phased booting so we get all nodes.
    TP.sys.setcfg('boot.phase_one', true);
    TP.sys.setcfg('boot.phase_two', TP.sys.cfg('boot.two_phase') === false);

    await TP.boot.$$importPhase();
};

//  ----------------------------------------------------------------------------

TP.boot.$$importPhaseTwo = async function(manifest) {

    /**
     * @method $$importPhaseTwo
     * @summary Imports any elements of the original boot file/config that were
     *     specific to phase two.
     */

    if (TP.sys.cfg('boot.two_phase') !== true) {
        return;
    }

    TP.boot.$setStage('import_phase_two');

    //  update our configuration to reflect our new state or the import will
    //  continue to filter out phase two nodes
    TP.sys.setcfg('boot.phase_one', false);
    TP.sys.setcfg('boot.phase_two', true);

    await TP.boot.$$importPhase();
};

//  ============================================================================
//  5.0 IMPORT SUPPORT
//  ============================================================================

TP.boot.$$configs = [];
TP.boot.$$packagePathsStack = [];
TP.boot.$$packageStack = [];
TP.boot.$$postImports = [];

TP.boot.$$assets = {};
TP.boot.$$packages = {};
TP.boot.$$paths = {};

TP.boot.$$assets_list = null;

//  ----------------------------------------------------------------------------

TP.boot.$config = async function() {

    /**
     * @method $config
     * @summary Configures various aspects of the boot system prior to final
     *     expansion and importing of the application's components.
     */

    TP.boot.$setStage('configuring');
/*
    //  loads the tibet.json file which typically contains profile and lib_root
    //  data. with those two values the system can find the primary package and
    //  configuration that will ultimately drive what we load.
    TP.boot.$configureBootstrap();

    //  Update any cached variable content. We do this each time we've read in
    //  new configuration values regardless of their source.
    TP.boot.$updateDependentVars();
*/
    //  find and initially process the boot package/config we'll be booting.
    await TP.boot.$configurePackage();

    //  Update any cached variable content. We do this each time we've read in
    //  new configuration values regardless of their source.
    TP.boot.$updateDependentVars();

    //  ensure we know what the proper package config value is going to be
    TP.boot.$configureTarget();

    //  set project.* properties necessary for final startup of the UI.
    TP.boot.$configureProject();

    TP.boot.$configureUI();

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

    //  warn about unsupported platforms but don't halt the boot process
    if (!TP.sys.isSupported()) {
        if (TP.sys.cfg('boot.unsupported')) {
            TP.boot.$stderr('Unsupported browser/platform: ' + TP.$agent,
                TP.WARN);
        } else {
            TP.boot.$stderr('Unsupported browser/platform: ' + TP.$agent +
                '. Boot sequence terminated.', TP.FATAL);
        }
    }

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$expand = async function() {

    /**
     * @method expand
     * @summary Expands the entire package hierarchy, starting at the root for
     *     the whole application.
     */

    var file,
        config;

    TP.boot.$setStage('expanding');

    file = TP.boot.$$bootfile;
    config = TP.sys.cfg('boot.config');

    TP.boot.$stdout('Expanding package@config: ' + file + '@' + config,
                    TP.DEBUG);
    await TP.boot.$expandPackage(file, config);

    //  Property tags in the package may require us to update var config.
    TP.boot.$updateDependentVars();
};

//  ----------------------------------------------------------------------------

TP.boot.$expandConfig = async function(anElement, configName) {

    /**
     * @method expandConfig
     * @summary Expands a single package configuration, resolving any embedded
     *     package references and virtual paths which might be included.
     * @param {Element} anElement The config node to process and expand.
     * @param {String} [configName] A specific config name to expand.
     */

    var list,
        len,
        i,
        child,
        ref,
        src,
        config,
        cfg,
        key,
        pkg,
        name,
        elem,
        value,
        level,
        text,
        msg,
        str,
        doc;

    list = Array.prototype.slice.call(anElement.childNodes, 0);

    len = list.length;

    for (i = 0; i < len; i++) {

        child = list[i];

        if (child.nodeType === Node.ELEMENT_NODE) {

            switch (child.tagName) {

                case 'config':
                    ref = child.getAttribute('ref');
                    ref = TP.boot.$expandReference(ref);

                    cfg = child.getAttribute('config') ||
                            anElement.getAttribute('config');

                    //  First try to find one qualified by the config. We have
                    //  to clone them if qualified so they can live in the same
                    //  document.
                    if (TP.boot.$notEmpty(cfg)) {
                        config = anElement.ownerDocument.getElementById(
                            ref + '_' + cfg);
                        if (TP.boot.$notValid(config)) {
                            config =
                                anElement.ownerDocument.getElementById(
                                                                ref);
                            if (TP.boot.$notValid(config)) {
                                msg = 'config not found: ' +
                                    TP.boot.$getCurrentPackage() + '@' + ref;
                                throw new Error(msg);
                            }
                            config = config.cloneNode(true);
                            config.setAttribute('id', ref + '_' + cfg);
                            config.setAttribute('config', cfg);
                            config = TP.boot.$getPackageNode(
                                        anElement.ownerDocument).appendChild(
                                                                config);
                        }
                    } else {
                        config = anElement.ownerDocument.getElementById(ref);
                    }

                    if (TP.boot.$notValid(config)) {
                        throw new Error('config not found: ' + ref);
                    }

                    key = TP.boot.$getCurrentPackage() + '@' + ref;

                    if (TP.boot.$notEmpty(cfg)) {
                        key += '.' + cfg;
                    }

                    if (TP.boot.$$configs.indexOf(key) !== -1) {
                        //  A duplicate/circular reference of some type.
                        TP.boot.$stderr(
                            'Ignoring duplicate config reference to: ' +
                            key);
                        break;
                    }

                    TP.boot.$$configs.push(key);

                    //  Push the current package path onto the stack that we're
                    //  keeping.
                    TP.boot.$pushPackagePath(key);

                    //  Expand the config.
                    await TP.boot.$expandConfig(config, cfg);

                    //  Pop the last pushed package path - this is important to
                    //  keep a 'hierarchy' of paths as we go through.
                    TP.boot.$popPackagePath();

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
                                        value.replace(/'/g, '\\\'') +
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
                    /* falls through */
              case 'image':

                    //  similar to default case but we need to avoid messing
                    //  with data urls.
                    src = child.getAttribute('src');
                    if (TP.boot.$notEmpty(src) &&
                        src.indexOf('data:') !== 0) {

                        src = TP.boot.$getFullPath(child, src);
                        child.setAttribute('src', src);
                    }
                    break;

                case 'package':

                    src = child.getAttribute('src');

                    //  For packages we allow a kind of shorthand where you can
                    //  specify a directory (with a trailing /) and have that
                    //  imply a file in that directory with a '.xml' extension
                    //  and name matching the directory name. This is largely
                    //  for bundles.
                    if (src.charAt(src.length - 1) === '/') {
                        src = src.slice(0, -1);
                        text = src.slice(src.lastIndexOf('/'));
                        src = src + text + '.xml';
                    }

                    src = TP.boot.$getFullPath(child, src);
                    child.setAttribute('src', src);

                    config = child.getAttribute('config') ||
                        anElement.getAttribute('config') ||
                        'default';

                    if (TP.boot.$notEmpty(config)) {
                        config = TP.boot.$expandReference(config);
                    }

                    key = src + '@' + config;
                    if (TP.boot.$$configs.indexOf(key) !== -1) {
                        //  A duplicate/circular reference of some type.
                        TP.boot.$stdout(
                            'Ignoring duplicate package reference to: ' +
                            key,
                            TP.WARN);
                        break;
                    }

                    TP.boot.$$configs.push(key);

                    //  Push the current package path onto the stack that we're
                    //  keeping.
                    TP.boot.$pushPackagePath(key);

                    //  Expand the package and capture the package element.
                    pkg = await TP.boot.$expandPackage(src, config);

                    //  Capture the set of package chain paths onto the package
                    //  element.
                    pkg.PACKAGE_CHAIN_PATHS =
                                TP.boot.$$packagePathsStack.slice();

                    //  Pop the last pushed package path - this is important to
                    //  keep a 'hierarchy' of paths as we go through.
                    TP.boot.$popPackagePath();

                    break;

                case 'property':

                    name = child.getAttribute('name');
                    value = child.getAttribute('value');

                    if (TP.boot.$notEmpty(name) &&
                        TP.boot.$notEmpty(value)) {

                        value = TP.boot.$getArgumentPrimitive(value);

                        //  If the property is a boot property we need to set it
                        //  right now or it won't take effect.
                        if (name.indexOf('boot.') === 0) {
                            TP.sys.setcfg(name, value);
                        } else {
                            try {
                                str = '<script><![CDATA[' +
                                        'TP.sys.setcfg(' +
                                        '\'' + name + '\', ' +
                                        TP.boot.$quoted('' + value) +
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

                                child.parentNode.replaceChild(
                                                        elem, child);
                            } catch (e) {
                                msg = e.message;
                                throw new Error('Error expanding: ' +
                                    TP.boot.$nodeAsString(child) +
                                    msg);
                            }
                        }
                    }

                    break;
                case 'resource':
                    /* falls through */
                case 'script':
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
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$expandPackage = async function(aPath, aConfig) {

    /**
     * @method $expandPackage
     * @summary Expands a package, resolving any embedded package references and
     *     virtual paths which might be included.
     * @param {String} aPath The path to the package manifest file to be
     *     processed.
     * @param {String} aConfig The config ID within the package to be expanded.
     * @returns {Document} An xml document containing the expanded
     *     configuration.
     */

    var expanded,   //  The expanded path equivalent.
        doc,        //  The xml DOM document object after parse.
        config,     //  The ultimate config ID being used.
        node,       //  Result of searching for our config by ID.
        package,    //  The package node from the XML doc.
        txt,        //  Raw text value for unparsed XML file.
        msg;        //  Error message construction variable.

    expanded = TP.boot.$isEmpty(aPath) ? TP.sys.cfg('boot.package') : aPath;
    expanded = TP.boot.$expandPath(expanded);

    TP.boot.$pushPackage(expanded);

    try {
        //  If we've been through this package once before we can skip reading
        //  and parsing the XML and jump directly to processing the config.
        doc = TP.boot.$$packages[expanded];
        if (!doc) {

            //  During initial startup don't load the first package twice due to
            //  config() and expand() sequencing.
            if (expanded === TP.boot.$$bootfile) {
                doc = TP.boot.$$bootxml;
            } else {
                doc = await TP.boot.$uriLoad(expanded, TP.DOM, 'manifest');
            }

            if (!doc) {
                //  Usually an invalid XML file...try to provide parse info.
                txt = await TP.boot.$uriLoad(expanded, TP.TEXT, 'manifest');
                if (TP.boot.$isValid(txt)) {
                    doc = TP.boot.$documentFromString(txt, true);
                }

                if (!doc) {
                    throw new Error('Unable to read package: ' + expanded);
                }
            }

            TP.boot.$$packages[expanded] = doc;
        }

        //  If the package isn't valid stop right here.
        package = doc.getElementsByTagName('package')[0];
        if (TP.boot.$notValid(package)) {
            return;
        }

        //  Verify package has a name and version, otherwise it's not valid.
        if (TP.boot.$isEmpty(package.getAttribute('name'))) {
            throw new Error('Missing name on package: ' +
                TP.boot.$nodeAsString(package));
        }

        if (TP.boot.$isEmpty(aConfig) || aConfig === 'default') {
            config = TP.boot.$getDefaultConfig(doc);
        } else {
            config = aConfig;
        }

        node = TP.boot.$documentGetElementById(doc, config);
        if (!node) {
            throw new Error('config not found: ' +
                TP.boot.$getCurrentPackage() + '@' + config);
        }

        //  Note that this may ultimately result in calls back into this routine
        //  if the config in question has embedded package references.
        await TP.boot.$expandConfig(node, config);
    } catch (e) {
        msg = e.message;
        throw new Error('Error expanding package: ' + expanded + '. ' + msg);
    } finally {
        TP.boot.$popPackage();
    }

    return doc;
};

//  ----------------------------------------------------------------------------

TP.boot.$expandPath = function(aPath) {

    /**
     * @method $expandPath
     * @summary Expands a TIBET virtual path to its equivalent non-virtual path.
     * @param {String} aPath The path to be expanded.
     * @returns {String} The fully-expanded path value.
     */

    var path,
        parts,
        virtual;

    //  If we've done this one before just return it.
    path = TP.boot.$$paths[aPath];
    if (path) {
        return path;
    }

    //  TIBET virtual paths all start with '~'
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

            //  If the path was ~/...something it's app_head prefixed.
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
                //  Keys are of the form: path.app_root etc. so adjust.
                path = TP.sys.cfg('path.' + virtual.slice(1));
                if (!path) {
                    throw new Error('Virtual path not found: ' + virtual);
                }
            }

            parts.unshift(path);
            path = parts.join('/');
        }

        //  Paths can expand into other virtual paths, so keep going until we no
        //  longer get back a virtual path.
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

    //  Cache the result so we avoid doing any path more than once.
    TP.boot.$$paths[aPath] = path;

    return path;
};

//  ----------------------------------------------------------------------------

TP.boot.$expandReference = function(aRef) {

    /**
     * @method $expandReference
     * @summary Looks up a configuration reference and provides its value. This
     *     routine is specifically concerned with expanding embedded property
     *     references from TIBET's setcfg/getcfg operations. For command-line
     *     processing the values should be provided to the instance when it is
     *     created.
     * @param {String} aRef A potential property value reference to expand.
     * @returns {String} The expanded value, or the original string value.
     */

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

//  ----------------------------------------------------------------------------

TP.boot.$getCurrentPackage = function() {

    /**
     * @method $getCurrentPackage
     * @summary Returns the file name of the currently processing package.
     * @returns {string} The package file name.
     */

    return TP.boot.$$packageStack[0];
};

//  ----------------------------------------------------------------------------

TP.boot.$getDefaultConfig = function(aPackageDoc) {

    /**
     * @method $getDefaultConfig
     * @summary Returns the default configuration from the package document
     *     provided.
     * @param {Document} aPackageDoc The XML package document to use for
     *     defaulting.
     * @returns {String} The configuration ID which is the default.
     */

    var package;

    package = aPackageDoc.getElementsByTagName('package')[0];
    if (TP.boot.$notValid(package)) {
        throw new Error('package tag missing.');
    }

    //  TODO: make this default of 'base' a constant?
    return package.getAttribute('default') || 'base';
};

//  ----------------------------------------------------------------------------

TP.boot.$getFullPath = function(anElement, aPath) {

    /**
     * @method $getFullPath
     * @summary Returns a full path by using any basedir information in
     *     anElement and blending it with any virtual or relative path
     *     information from aPath.
     * @param {Element} anElement The element from which to begin basedir
     *     lookups.
     * @param {String} aPath The path to resolve into a full path.
     * @returns {String} The fully-expanded path.
     */

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

    return '';
};

//  ----------------------------------------------------------------------------

TP.boot.$getLoadedPackages = function() {

    /**
     * @method $getLoadedPackages
     * @summary Returns an array of unique package file names which were loaded.
     * @returns {String[]} The array of unique package names.
     */

    return Object.keys(TP.boot.$$paths).map(
                    function(path) {
                        return TP.boot.$uriInTIBETFormat(path);
                    });
};

//  ----------------------------------------------------------------------------

TP.boot.$getLoadedScripts = function() {

    /**
     * @method $getLoadedScripts
     * @summary Returns an array of the JavaScript source paths which have been
     *     loaded. The list is a copy of the core list to avoid inadvertent
     *     changes.
     * @returns {String[]} The array of loaded scripts.
     */

    return TP.boot.$$loadpaths.slice(0);
};

//  ----------------------------------------------------------------------------

TP.boot.$getPackageNode = function(aDocument) {

    /**
     * @method $getPackageNode
     * @summary Returns the package node from the document provided.
     * @param {Document} aDocument The XML package document to use.
     * @returns {Element} The package element.
     */

    return aDocument.getElementsByTagName('package')[0];
};

//  ----------------------------------------------------------------------------

TP.boot.$ifAssetPassed = function(anElement) {

    /**
     * @method $ifAssetPassed
     * @summary Returns true if the element's tag name passes any asset-type
     *     filtering which is in place. Asset filtering is done via tag name.
     * @param {Element} anElement The element to filter.
     * @returns {Boolean} Whether or not the element's tag name passes any
     *     assert-type filters.
     */

    var tag,
        result;

    tag = anElement.tagName;

    //  No assets option? Not filtering.
    if (TP.boot.$isEmpty(TP.sys.cfg('boot.assets'))) {
        return true;
    }

    //  Can't traverse if we don't always clear these two.
    if (tag === 'package' || tag === 'config') {
        return true;
    }

    if (TP.boot.$notValid(TP.boot.$$assets_list)) {
        TP.boot.$$assets_list = TP.boot.$$assets.split(' ');
    }

    result = TP.boot.$$assets_list.indexOf(tag) !== -1;

    return result;
};

//  ----------------------------------------------------------------------------

TP.boot.$isAlacarteResource = function(aPath, pkgChainPaths) {

    /**
     * @method $isAlacarteResource
     * @summary Tests whether or not the supplied path points to an alacarte
     *     resource - which is a resource that, although it is a TIBET library
     *     resource, is loaded piecemeal by the TIBET application.
     * @param {String} aPath The path to the resource being tested.
     * @param {String[]} pkgChainPaths The array of the 'chain' of package paths
     *     that loaded the resource.
     * @returns {boolean} Returns true if the supplied path points to an
     *     alacarte resource.
     */

    var path,

        isLibResource,

        len,
        i;

    if (!pkgChainPaths) {
        return false;
    }

    path = TP.boot.$expandPath(aPath);

    isLibResource = path.indexOf(TP.boot.$expandPath('~lib')) === 0;
    if (!isLibResource) {
        return false;
    }

    //  Iterate over the chain of package paths. If the 'tibet.xml' package
    //  is found somewhere in the chain, then it's being loaded as a regular
    //  library resource.
    len = pkgChainPaths.length;
    for (i = 0; i < len; i++) {
        if (pkgChainPaths[i].indexOf('tibet.xml') !== -1) {
            return false;
        }
    }

    //  Otherwise, it was a library resource but is not being loaded from a
    //  chain of paths that include 'tibet.xml', so it must be being loaded
    //  alacarte in the app.
    return true;
};

//  ----------------------------------------------------------------------------

TP.boot.$isLoadableScript = async function(aURI) {

    /**
     * @method $isLoadableScript
     * @summary Returns true if the URI provided is a script loaded as part of
     *     the current application's package@config settings.
     * @returns {String[]} The array of loaded scripts.
     */

    var uri,
        phaseOne,
        phaseTwo,
        loadables;

    uri = TP.boot.$uriExpandPath(aURI);

    try {
        phaseOne = TP.sys.cfg('boot.phase_one');
        phaseTwo = TP.sys.cfg('boot.phase_two');
        TP.sys.setcfg('boot.phase_one', true);
        TP.sys.setcfg('boot.phase_two', true);
        loadables = await TP.boot.$listPackageAssets(
            TP.boot.$$bootfile, TP.boot.$$bootconfig);
    } catch (e) {
        //  Could be an unloaded/unexpanded manifest...meaning we can't really
        //  tell about the nature of the script. Set up empty array which will
        //  force a false return value below.
        loadables = [];
    } finally {
        TP.sys.setcfg('boot.phase_one', phaseOne);
        TP.sys.setcfg('boot.phase_two', phaseTwo);
    }

    loadables = loadables.map(
                    function(node) {
                        return TP.uriExpandPath(node.getAttribute('src'));
                    });

    return loadables.indexOf(uri) !== -1;
};

//  ----------------------------------------------------------------------------

TP.boot.$isLoadedScript = function(aURI) {

    /**
     * @method $isLoadedScript
     * @summary Returns true if the URI provided is a script loaded as part of
     *     the current application's package@config settings.
     * @returns {boolean} Whether or not the URI points to a loaded script.
     */

    var uri;

    uri = TP.boot.$uriExpandPath(aURI);

    return TP.boot.$$loadpaths.indexOf(uri) !== -1;
};

//  ----------------------------------------------------------------------------

TP.boot.$listConfigAssets = async function(anElement, aList, configName, includePkgs, includeAlacarte) {

    /**
     * @method $listConfigAssets
     * @summary Lists assets from a package configuration. The assets will be
     *     concatenated into aList if the list is provided (aList is used during
     *     recursive calls from within this routine to build up the list).
     * @param {Element} anElement The config element to begin listing from.
     * @param {String[]} aList The array of asset descriptions to expand upon.
     * @param {String} [configName] Specific config name to expand, if any.
     * @param {Boolean} [includePkgs=false] Whether or not to include nested
     *     package nodes.
     * @param {Boolean} [includeAlacarte=true] Whether or not to include
     *     alacarte package entries.
     * @returns {String[]} The asset array.
     */

    var result,

        doc,

        list,

        len,
        i,
        child,

        ref,
        src,
        msg,
        cfg,
        text,
        config;

    //  If aList is empty we're starting fresh which means we need a fresh
    //  asset-uniquing dictionary.
    if (TP.boot.$notValid(aList)) {
        TP.boot.$$assets = {};
    }
    result = aList || [];

    //  Don't assume the config itself shouldn't be filtered.
    if (!TP.boot.$ifUnlessPassed(anElement)) {
        return result;
    }

    doc = anElement.ownerDocument;

    list = Array.prototype.slice.call(anElement.childNodes, 0);

    len = list.length;

    for (i = 0; i < len; i++) {

        child = list[i];

        if (child.nodeType === Node.ELEMENT_NODE) {

            if (!TP.boot.$ifUnlessPassed(child)) {
                continue;
            }

            if (!TP.boot.$ifAssetPassed(child)) {
                continue;
            }

            switch (child.tagName) {

                case 'config':
                    ref = child.getAttribute('ref');

                    cfg = child.getAttribute('config') ||
                        anElement.getAttribute('config');

                    //  First try to find one qualified by the config. We
                    //  have to clone them if qualified so they can live in
                    //  the same document.
                    if (TP.boot.$notEmpty(cfg)) {
                        config = doc.getElementById(ref + '_' + cfg);
                        if (TP.boot.$notValid(config)) {
                            config = doc.getElementById(ref);
                            if (TP.boot.$notValid(config)) {
                                msg = 'config not found: ' +
                                    TP.boot.$getCurrentPackage() + '@' + ref;
                                throw new Error(msg);
                            }
                            config = config.cloneNode(true);
                            config.setAttribute('id', ref + '_' + cfg);
                            config.setAttribute('config', cfg);
                            config = TP.boot.$getPackageNode(doc).appendChild(
                                                                    config);
                        }
                    } else {
                        config = doc.getElementById(ref);
                    }

                    if (TP.boot.$notValid(config)) {
                        throw new Error('config not found: ' + ref);
                    }

                    await TP.boot.$listConfigAssets(
                            config, result, cfg, includePkgs, includeAlacarte);

                    break;

                case 'echo':

                    //  Shouldn't exist, these should have been
                    //  converted into script tags calling
                    //  TP.boot.$stdout.
                    break;

                case 'package':

                    src = child.getAttribute('src');

                    //  For packages we allow a kind of shorthand where
                    //  you can specify a directory (with a trailing /)
                    //  and have that imply a file in that directory
                    //  with a '.xml' extension and name matching the
                    //  directory name. This is largely for bundles.
                    if (src.charAt(src.length - 1) === '/') {
                        src = src.slice(0, -1);
                        text = src.slice(src.lastIndexOf('/'));
                        src = src + text + '.xml';
                    }

                    config = child.getAttribute('config') ||
                        anElement.getAttribute('config') ||
                        'default';

                    if (TP.boot.$isEmpty(src)) {
                        throw new Error('package missing src: ' +
                            TP.boot.$nodeAsString(child));
                    }

                    //  Make sure to fully expand the path.
                    src = TP.boot.$getFullPath(child, src);

                    if (includePkgs) {
                        child.setAttribute('src', src);
                        result.push(child);
                    }

                    await TP.boot.$listPackageAssets(
                            src, config, result, includePkgs, includeAlacarte);

                    break;

                case 'property':

                    child.setAttribute('loadpkg',
                        TP.boot.$getCurrentPackage());
                    child.setAttribute('loadcfg',
                        anElement.getAttribute('id'));
                    child.setAttribute('loadstage',
                        TP.boot.$$stage);
                    child.setAttribute('srcpkg',
                        TP.boot.$getCurrentPackage());
                    child.setAttribute('srccfg',
                        anElement.getAttribute('id'));

                    result.push(child);

                    break;

                case 'image':
                    /* falls through */
                case 'img':
                    /* falls through */
                case 'script':
                    /* falls through */
                case 'resource':
                    /* falls through */
                default:

                    src = child.getAttribute('src') ||
                        child.getAttribute('href');

                    if (TP.boot.$notEmpty(src)) {

                        //  If we're not supposed to include alacarte resources
                        //  and it can be determined that the source path leads
                        //  to one, then just continue, skipping this resource.
                        if (includeAlacarte === false &&
                            TP.boot.$isAlacarteResource(
                                src, child.ownerDocument.PACKAGE_CHAIN_PATHS)) {
                            continue;
                        }

                        //  Make sure to fully expand the path.
                        src = TP.boot.$getFullPath(child, src);

                        //  Unique the things we push by checking and
                        //  caching entries as we go.
                        if (TP.boot.$notValid(TP.boot.$$assets[src])) {
                            TP.boot.$$assets[src] = src;

                            child.setAttribute('loadpkg',
                                TP.boot.$getCurrentPackage());
                            child.setAttribute('loadcfg',
                                anElement.getAttribute('id'));
                            child.setAttribute('loadstage',
                                TP.boot.$$stage);

                            child.setAttribute('srcpkg',
                                TP.boot.$getCurrentPackage());
                            child.setAttribute('srccfg',
                                anElement.getAttribute('id'));

                            result.push(child);
                        } else {
                            TP.boot.$stdout(
                                    'Skipping duplicate asset: ' + src,
                                    TP.WARN);
                        }
                    } else {
                        child.setAttribute('loadpkg',
                            TP.boot.$getCurrentPackage());
                        child.setAttribute('loadcfg',
                            anElement.getAttribute('id'));
                        child.setAttribute('loadstage',
                            TP.boot.$$stage);

                        child.setAttribute('srcpkg',
                            TP.boot.$getCurrentPackage());
                        child.setAttribute('srccfg',
                            anElement.getAttribute('id'));

                        result.push(child);
                    }

                    break;
            }
        }
    }

    return result;
};

//  ----------------------------------------------------------------------------

TP.boot.$listPackageAssets = async function(aPackage, aConfig, aList,
includePkgs, includeAlacarte) {

    /**
     * @method $listPackageAssets
     * @summary Lists assets from a package configuration. The assets will be
     *     concatenated into aList if the list is provided (aList is used
     *     during recursive calls from within this routine to build up the
     *     list).
     * @param {string} aPackage The package name or path to list.
     * @param {string} aConfig The ID of the config in the package to list.
     * @param {String[]} [aList] The array of asset descriptions to expand upon.
     * @param {Boolean} [includePkgs=false] Whether or not to include nested
     *     package nodes.
     * @param {Boolean} [includeAlacarte=true] Whether or not to include
     *     alacarte package entries.
     * @returns {String[]} The asset array.
     */

    var pkg,
        path,
        config,
        doc,
        node,
        result;

    pkg = TP.boot.$isEmpty(aPackage) ? TP.sys.cfg('boot.package') : aPackage;

    //  Package can be a name or a path. If it's a name we need to adjust it
    //  into something path-like we can then expand.
    if (pkg.indexOf('/') === -1) {
        path = TP.boot.$uriJoinPaths('~app_cfg', pkg);
    } else {
        path = pkg;
    }

    if (!/.xml$/.test(path)) {
        path = path + '.xml';
    }

    path = TP.boot.$expandPath(path);

    TP.boot.$pushPackage(path);

    try {
        doc = TP.boot.$$packages[path];
        if (TP.boot.$notValid(doc)) {
            //  Try to load it now...
            TP.boot.$$packages[path] =
                    await TP.boot.$uriLoad(path, TP.DOM, 'manifest');
            doc = TP.boot.$$packages[path];
            if (TP.boot.$notValid(doc)) {
                throw new Error('Can not list unexpanded package: ' + pkg);
            }
        }

        //  Determine the configuration we'll be listing.
        if (TP.boot.$isEmpty(aConfig) || aConfig === 'default') {
            config = TP.boot.$getDefaultConfig(doc);
        } else {
            config = aConfig;
        }

        node = TP.boot.$documentGetElementById(doc, config);
        if (TP.boot.$notValid(node)) {
            throw new Error('config not found: ' + path + '@' + config);
        }

        //  If aList is empty we're starting fresh which means we need a fresh
        //  asset-uniquing dictionary.
        if (!aList) {
            TP.boot.$$assets = {};
        }
        result = aList || [];
        await TP.boot.$listConfigAssets(
                        node, result, config, includePkgs, includeAlacarte);
    } finally {
        TP.boot.$popPackage();
    }

    return result;
};

//  ----------------------------------------------------------------------------

TP.boot.$popPackagePath = function() {

    /**
     * @method popPackagePath
     * @summary Pops an entry off the current stack of packages which are being
     *     processed as part of an expansion and returns it.
     */

    return TP.boot.$$packagePathsStack.pop();
};

//  ----------------------------------------------------------------------------

TP.boot.$pushPackagePath = function(aPath) {

    /**
     * @method $pushPackagePath
     * @summary Pushes a package path onto the currently processing package name
     *     stack.
     * @param {string} aPath The package's full path.
     */

    TP.boot.$$packagePathsStack.push(aPath);
};

//  ----------------------------------------------------------------------------

TP.boot.$popPackage = function() {

    /**
     * @method popPackage
     * @summary Pops an entry off the current stack of packages which are being
     *     processed as part of an expansion and returns it.
     */

    return TP.boot.$$packageStack.shift();
};

//  ----------------------------------------------------------------------------

TP.boot.$pushPackage = function(aPath) {

    /**
     * @method $pushPackage
     * @summary Pushes a package path onto the currently processing package name
     *     stack.
     * @param {string} aPath The package's full path.
     */

    TP.boot.$$packageStack.unshift(aPath);
};

//  ----------------------------------------------------------------------------

TP.boot.$pushPostImport = function(aType) {

    /**
     * @method $pushPostImport
     * @summary Adds a type object to the list of types to be processed once
     *     they finish loading entirely.
     * @param {Object} aType The type to be initialized/post-processed.
     */

    TP.boot.$$postImports.push(aType);
};

//  ----------------------------------------------------------------------------

TP.boot.$refreshPackages = async function(aURI) {

    /**
     * @method $refreshPackages
     * @summary Refreshes any package manifests currently loaded by system. Note
     *     that this re-expands all package manifest entries to ensure that all
     *     changes are properly propagated.
     * @param {string} [aURI] A specific URI to load rather than the entire set.
     */

    var packages,
        uri,
        keys,
        promises,
        stderr;

    packages = TP.boot.$$packages;
    if (aURI) {
        uri = TP.boot.$uriExpandPath(aURI);
        packages[uri] = await TP.boot.$uriLoad(uri, TP.DOM, 'manifest');
    } else {
        keys = Object.keys(packages);
        promises = keys.map(
                    function(key) {
                        return TP.boot.$uriLoad(key, TP.DOM, 'manifest');
                    });

        Promise.all(promises).then(
            function(response) {
                response.forEach(
                    function(aPackage, index) {
                        packages[keys.at(index)] = aPackage;
                    });
            });
    }

    //  Re-expand the resulting packages, but turn off any error reporting since
    //  this will trigger duplicate reference warnings.
    try {
        stderr = TP.boot.$stderr;
        TP.boot.$stderr = TP.boot.STDERR_NULL;
        await TP.boot.$expand();
    } finally {
        TP.boot.$stderr = stderr;
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$importApplication = async function() {

    /**
     * @method $importApplication
     * @summary Clears all currently loaded script entries and imports the whole
     *     application, starting with phase one.
     */

    //  Clear script dictionary. This will be used to unique across all imports.

    TP.boot.$$scripts = {};

    TP.boot.$$totalwork = 0;

    await TP.boot.$$importPhaseOne();
};

//  ============================================================================
//  CACHE FUNCTIONS
//  ============================================================================

TP.boot.populateCaches = async function(libCacheNeedsPopulating,
    appCacheNeedsPopulating) {

    /**
     * @method populateCaches
     * @summary Populates the lib and app caches with content by using the
     *     manifest files to determine what assets should be cached and which
     *     cache they should go into.
     * @param {boolean} libCacheNeedsPopulating Whether or not the lib cache
     *     needs to be populated.
     * @param {boolean} appCacheNeedsPopulating Whether or not the app cache
     *     needs to be populated.
     * @returns {Promise} A Promise that will resolve when the caches have
     *     finished populating.
     */

    var prebootLibPaths,
        prebootAppPaths,

        phaseOne,
        phaseTwo,

        package,
        config,

        nonTeamTIBETEnv,

        packageAssets,
        teamTIBETAssets,
        loadableAssets,

        loadablePaths,
        packagePaths,

        path,

        i,

        allPaths,

        libResourcePath,
        libPaths,

        appResourcePath,
        appPaths;

    //  Grab the 'built-in' preboot lib paths that were in the cfg() system and
    //  expand them.
    prebootLibPaths = TP.sys.cfg('path.preboot_lib_paths');
    prebootLibPaths = prebootLibPaths.map(
                        function(aPath) {
                            return TP.boot.$uriExpandPath(aPath);
                        });

    //  Grab the 'built-in' preboot app paths that were in the cfg() system and
    //  expand them.
    prebootAppPaths = TP.sys.cfg('path.preboot_app_paths');
    prebootAppPaths = prebootAppPaths.map(
                        function(aPath) {
                            return TP.boot.$uriExpandPath(aPath);
                        });

    //  Next, grab the paths of the module package files themselves.

    //  Grab the current values of 'boot.phase_one' and 'boot.phase_two' and
    //  then set them to true, so that the list of assets we get in the
    //  following steps think that we're obtaining resources for both phases.

    phaseOne = TP.sys.cfg('boot.phase_one');
    phaseTwo = TP.sys.cfg('boot.phase_two');

    TP.sys.setcfg('boot.phase_one', true);
    TP.sys.setcfg('boot.phase_two', true);

    //  Grab the package and config that the user booted with.
    package = TP.sys.cfg('boot.package');
    config = TP.sys.cfg('boot.config');

    //  Grab the list of resources using that package and config.
    packageAssets = await TP.boot.$listPackageAssets(
                                    package, config, null, false, false);

    //  If we're running in a non-Team TIBET environment, that means that we're
    //  running with at least the lib (and possibly the app) in a form where
    //  some of the resources are inlined. We need to get a list of all the
    //  'resource' tags using the package and config that the user booted with,
    //  but acting as if we're a member of Team TIBET so that we can traverse
    //  all of the applicable manifest entries to find applicable 'resource'
    //  tags.
    nonTeamTIBETEnv = TP.sys.getcfg('boot.teamtibet') !== true;
    if (nonTeamTIBETEnv) {

        //  Set the flag that members of Team TIBET use to load individual,
        //  non-inlined, resources.
        TP.sys.setcfg('boot.teamtibet', true);

        //  'production' means that we're interested in what the manifest
        //  system calls 'base'.
        if (config === 'production') {
            config = 'base';
        }

        //  Grab the list of resources using that package and config.
        teamTIBETAssets = await TP.boot.$listPackageAssets(
                                    package, config, null, false, false);

        //  Reset config in case we want to use it later.
        config = TP.sys.cfg('boot.config');

        //  Filter out the assets that are not 'resource' tags.
        teamTIBETAssets = teamTIBETAssets.filter(
                    function(anElem) {
                        return anElem.tagName === 'resource';
                    });

        //  Add those assets to the list of assets we already have.
        packageAssets = packageAssets.concat(teamTIBETAssets);

        //  Put the Team TIBET flag back.
        TP.sys.setcfg('boot.teamtibet', false);
    }

    //  Restore the previous values for 'boot.phase_one' and 'boot.phase_two'.
    TP.sys.setcfg('boot.phase_one', phaseOne);
    TP.sys.setcfg('boot.phase_two', phaseTwo);

    //  If the config isn't 'production', then we also cache the package
    //  definition files themselves. We don't do this in a production situation
    //  since the package definitions are unnecessary (everything has been
    //  inlined and/or flattened) and the package chain paths aren't available
    //  anyway.
    if (config !== 'production') {
        //  Grab the paths of the actual package manifest files themselves that
        //  were populated into TP.boot.$$packages when we did the processing
        //  above.
        packagePaths = Object.keys(TP.boot.$$packages);

        //  Remove the 'main.xml' package file from the list of files to cache.
        //  It's the one with the version number in it, so we never want to
        //  cache it (in our controlled cache anyway - we'll let the browser
        //  handle caching/re-fetching it based on regular browser heuristics).
        //  Also, we filter out 'alacarte resources' which are app-level
        //  resources but have lib-level paths since they are loaded in an
        //  alacarte fashion in the app config.
        for (i = 0; i < packagePaths.length; i++) {
            path = packagePaths[i];

            if (/main\.xml$/.test(path) ||
                TP.boot.$isAlacarteResource(
                    path, TP.boot.$$packages[path].PACKAGE_CHAIN_PATHS)) {
                packagePaths.splice(i, 1);
                i--;
            }
        }
    } else {
        packagePaths = [];
    }

    //  Next, grab the files referenced in those package files. These must be
    //  assets that have a 'src' or 'href' attribute and then a path is obtained
    //  and expanded from there.

    loadableAssets = packageAssets.filter(
                        function(anElem) {
                            return anElem.hasAttribute('src') ||
                                    anElem.hasAttribute('href');
                        });

    loadablePaths = loadableAssets.map(
                        function(anElem) {
                            var rawPath;

                            rawPath = anElem.getAttribute('src') ||
                                        anElem.getAttribute('href');
                            return TP.boot.$uriExpandPath(rawPath);
                        });

    //  Make sure that we're dealing with absolute paths.
    loadablePaths = loadablePaths.filter(
                        function(aPath) {
                            return TP.boot.$uriIsAbsolute(
                                    TP.boot.$uriExpandPath(aPath));
                        });

    //  Concatenate all of the paths together.
    allPaths = prebootLibPaths.concat(prebootAppPaths,
                                        packagePaths,
                                        loadablePaths);

    //  Separate lib vs. app paths into two groups to load into the two
    //  different caches.

    //  NOTE: We *include* the TIBET library file here, even though it's loaded
    //  from a link in the app directory and, therefore, has an app path prefix,
    //  not a lib path prefix. We do this so that the TIBET library file is
    //  cached with the rest of the library, not cached with the rest of the
    //  app. This is important in developer mode when the app developer wants
    //  the TIBET library to cache, but not their application source.

    //  Separate out the lib paths. These will be loaded into the lib file
    //  cache.
    libResourcePath = TP.sys.cfg('boot.lib_resource_path');
    libPaths = allPaths.filter(
                function(aPath) {
                    /* eslint-disable no-extra-parens */
                    return (aPath.startsWith(libResourcePath) &&
                            /\.\w+$/.test(aPath)) ||
                            /tibet.*\.min.js$/.test(aPath);
                    /* eslint-enable no-extra-parens */
                });

    //  Separate out the app paths. These will be loaded into the app file
    //  cache.
    appResourcePath = TP.sys.cfg('boot.app_resource_path');
    appPaths = allPaths.filter(
                function(aPath) {
                    return aPath.startsWith(appResourcePath) &&
                            !aPath.startsWith(libResourcePath) &&
                            /\.\w+$/.test(aPath) &&
                            !/tibet.*\.min.js$/.test(aPath);
                });

    return caches.open('TIBET_LIB_CACHE').then(
        function(cache) {
            var projectProfile;

            projectProfile = TP.sys.cfg('boot.profile') || 'main@production';
            top.localStorage.setItem(
                'TIBET.boot.cached_project_profile', projectProfile);

            if (libCacheNeedsPopulating) {
                return cache.addAll(libPaths);
            }
        }).then(function() {
            return caches.open('TIBET_APP_CACHE');
        }).then(function(cache) {
            if (appCacheNeedsPopulating) {
                //  Store the project name and version number into local storage
                //  so that we can find and compare against them in future
                //  loadings of this application.
                top.localStorage.setItem(
                    'TIBET.boot.cached_project_name',
                    TP.sys.cfg('project.name'));
                top.localStorage.setItem(
                    'TIBET.boot.cached_project_version',
                    TP.sys.cfg('project.version'));
                return cache.addAll(appPaths);
            }
        });
};

//  ----------------------------------------------------------------------------

TP.boot.configureAndPopulateCaches = function() {

    /**
     * @method configureAndPopulateCaches
     * @summary Configures the lib and app caches and populates them if
     *     necessary.
     * @description We have 3 different flag that control ServiceWorker caching
     * based on different scenarios:
     *
     * 1. TeamTIBET developer - Neither ServiceWorker cache is never used and
     *      all caches are checked upon each reload and cleared if they contain
     *      content.
     * 2. Application developer - The lib cache is used but the app cache is not
     *      and is checked upon each reload and cleared if it contains content.
     * 3. Application user - Both caches are used.
     */

    var path,

        libCacheRequests,
        appCacheRequests;

    //  Grab the lib resource path, defaulting it to the lib root and make sure
    //  it's expanded.
    path = TP.sys.cfg('boot.lib_resource_path', TP.boot.$getLibRoot());
    TP.sys.setcfg('boot.lib_resource_path', TP.boot.$uriExpandPath(path));

    //  Grab the app resource path, defaulting it to the app root and make sure
    //  it's expanded.
    path = TP.sys.cfg('boot.app_resource_path', TP.boot.$getAppRoot());
    TP.sys.setcfg('boot.app_resource_path', TP.boot.$uriExpandPath(path));

    //  Set up the Service Worker and then begin the process of populating the
    //  cache.
    return TP.boot.setupServiceWorker().then(function() {
                //  Open the lib file cache.
                return caches.open('TIBET_LIB_CACHE');
            }).then(function(cache) {
                return cache.keys();
            }).then(function(keys) {
                libCacheRequests = keys;
                //  Open the app file cache.
                return caches.open('TIBET_APP_CACHE');
            }).then(function(cache) {
                return cache.keys();
            }).then(function(keys) {
                var libCachePaths,
                    appCachePaths,

                    libCacheNeedsPopulating,
                    appCacheNeedsPopulating,

                    promise,

                    usingLogin,

                    libOutOfDate,
                    appOutOfDate,

                    removeLibCache,
                    removeAppCache,

                    projectProfile,
                    cachedProjectProfile,

                    projectName,
                    cachedProjectName,

                    projectVersion,
                    cachedProjectVersion;

                appCacheRequests = keys;

                libCachePaths = libCacheRequests.map(
                                    function(aRequest) {
                                        return aRequest.url;
                                    });

                appCachePaths = appCacheRequests.map(
                                    function(aRequest) {
                                        return aRequest.url;
                                    });

                //  Allocate a Promise to chain to below.
                promise = Promise.resolve();

                //  Now we have to decide whether or not to populate the caches
                //  based on flag settings and whether we found content in those
                //  caches.

                libCacheNeedsPopulating = false;
                appCacheNeedsPopulating = false;

                removeLibCache = false;
                removeAppCache = false;

                libOutOfDate = false;
                appOutOfDate = false;

                projectProfile = TP.sys.cfg('boot.profile') ||
                                    'main@production';

                cachedProjectProfile = top.localStorage.getItem(
                                        'TIBET.boot.cached_project_profile');

                //  If there was no cached version or it doesn't match the
                //  current version, set the flag that says the project is
                //  out of date and finally delete the app cache.
                if (TP.boot.$notValid(cachedProjectProfile) ||
                    cachedProjectProfile !== projectProfile) {

                    libOutOfDate = true;
                    appOutOfDate = true;

                    top.localStorage.removeItem(
                                        'TIBET.boot.cached_project_profile');

                    removeLibCache = true;
                    removeAppCache = true;
                }

                //  Grab the project name and version and an optional cached
                //  project name and version (which will have been put into
                //  localStorage when the app cache was populated). By comparing
                //  these, we'll know whether we need to flush the app cache
                //  and reload it.

                projectName = TP.sys.cfg('project.name');
                cachedProjectName = top.localStorage.getItem(
                                        'TIBET.boot.cached_project_name');

                projectVersion = TP.sys.cfg('project.version');
                cachedProjectVersion = top.localStorage.getItem(
                                        'TIBET.boot.cached_project_version');

                //  If there was no cached version or it doesn't match the
                //  current version, set the flag that says the project is
                //  out of date and finally delete the app cache.
                if (TP.boot.$notValid(cachedProjectName) ||
                    cachedProjectName !== projectName ||
                    TP.boot.$notValid(cachedProjectVersion) ||
                    cachedProjectVersion !== projectVersion) {

                    appOutOfDate = true;
                    top.localStorage.removeItem(
                                        'TIBET.boot.cached_project_name');
                    top.localStorage.removeItem(
                                        'TIBET.boot.cached_project_version');

                    removeAppCache = true;
                }

                if (TP.boot.shouldCacheLibFiles()) {
                    if (TP.boot.$isEmpty(libCachePaths) || libOutOfDate) {
                        libCacheNeedsPopulating = true;
                    }
                } else {
                    if (!TP.boot.$isEmpty(libCachePaths)) {
                        removeLibCache = true;
                    }
                }

                if (TP.boot.shouldCacheAppFiles()) {
                    if (TP.boot.$isEmpty(appCachePaths) || appOutOfDate) {
                        appCacheNeedsPopulating = true;
                    }
                } else {
                    if (!TP.boot.$isEmpty(appCachePaths)) {
                        removeAppCache = true;
                    }
                }

                if (removeLibCache) {
                    promise = promise.then(
                        function() {
                            return caches.delete('TIBET_LIB_CACHE');
                        });
                }

                if (removeAppCache) {
                    promise = promise.then(
                        function() {
                            return caches.delete('TIBET_APP_CACHE');
                        });
                }

                //  If we're an app that logs in, then we definitely do *not*
                //  want to populate the caches right now. The reason is that
                //  manifest files will be recursively fetched and that will
                //  include app-level manifest files that will *not* be vended
                //  until we actually log in (we will get the login page XHTML
                //  content instead). So we defer populating *both* caches right
                //  now until we have logged in.
                usingLogin = TP.sys.cfg('boot.use_login');

                if (usingLogin) {
                    TP.boot.$libCacheNeedsPopulatingAfterLogin =
                        libCacheNeedsPopulating;
                    TP.boot.$appCacheNeedsPopulatingAfterLogin =
                        appCacheNeedsPopulating;

                    libCacheNeedsPopulating = false;
                    appCacheNeedsPopulating = false;
                }

                //  If the cache doesn't need populating, we'll send a message
                //  over to the ServiceWorker telling it to turn caching on and
                //  we won't bother to populate the caches.
                if (!libCacheNeedsPopulating && !appCacheNeedsPopulating) {

                    //  First, make sure that if either the lib or app cache has
                    //  been configured to not cache (but, in this case, since
                    //  we're at this point in the code, the other cache *has*
                    //  been configured to cache), that that cache is emptied.

                    return promise.then(
                        function() {
                            return TP.boot.sendMessageToServiceWorker(
                                    navigator.serviceWorker.controller,
                                    {
                                        command: 'setcfgprop',
                                        payload: '{"boot.use_sw_cache":true}'
                                    });
                        });
                }

                //  If either one or both caches need populating, then we need
                //  to send a message to the ServiceWorker that it is *not*
                //  supposed to use the cache to vend files, since we're going
                //  to populate it now.
                return promise.then(function() {
                        return TP.boot.sendMessageToServiceWorker(
                                navigator.serviceWorker.controller,
                                {
                                    command: 'setcfgprop',
                                    payload: '{"boot.use_sw_cache":false}'
                                });
                    }).then(function() {
                        //  Populate one or both caches.
                        return TP.boot.populateCaches(
                                    libCacheNeedsPopulating,
                                    appCacheNeedsPopulating);
                    }).then(function() {
                        //  Now that the cache population is done, send a
                        //  message over to the ServiceWorker telling it to
                        //  turn caching back on.
                        return TP.boot.sendMessageToServiceWorker(
                                navigator.serviceWorker.controller,
                                {
                                    command: 'setcfgprop',
                                    payload: '{"boot.use_sw_cache":true}'
                                });
                    });
            });
};

//  ----------------------------------------------------------------------------

TP.boot.receiveMessageFromServiceWorker = function(msgObjContent) {

    /**
     * @method receiveMessageFromServiceWorker
     * @summary Receives a message (via postMessage) from the Service Worker.
     * @param {Object} msgObjContent The POJO object that contains data received
     *     from the service worker.
     */

    var moduleName,

        nsName,
        namespace;

    //  If the ServiceWorker asked us to create a module, then we try to compute
    //  a TIBET namespace from the payload it handed us (which would be an
    //  ECMA6-like file name) and message that namespace to create an ECMA6
    //  module of it's content.
    if (msgObjContent.command === 'createModule') {

        moduleName = msgObjContent.payload;
        if (TP.notEmpty(moduleName)) {

            //  Compute a namespace name. So 'TP_gui.js' becomes 'TP.gui'
            moduleName = TP.unescapeTypeName(moduleName);
            nsName = moduleName.slice(0, moduleName.lastIndexOf('.'));

            //  Try to grab the corresponding namespace object and, if it's
            //  real, cause it to build an ECMA6 module of its content. Note
            //  that it returns the text it builds in addition to adding it to a
            //  well-known cache. We return that text here for sending back (via
            //  a return postMessage) to the ServiceWorker.
            namespace = TP.bySystemId(nsName);
            if (TP.isNamespace(namespace)) {
                return namespace.definePseudoNativeModule();
            }
        }
    }
};

//  ----------------------------------------------------------------------------

TP.boot.sendMessageToServiceWorker = function(sender, msgObjContent) {

    /**
     * @method sendMessageToServiceWorker
     * @summary Sends a message (via postMessage) to the Service Worker.
     * @param {ServiceWorker} sender The service worker to post the message to.
     * @param {Object} msgObjContent The POJO object that contains data to send
     *     to the service worker.
     * @returns {Promise} A Promise that will resolve when the ServiceWorker has
     *     been sent the message and we have received a reply.
     */

    var listenerPromise;

    listenerPromise = new Promise(
        function(resolver, rejector) {
            var messageChannel;

            messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = function(event) {
                if (event.data.error) {
                    rejector(event.data.error);
                } else {
                    resolver(event.data);
                }
            };

            sender.postMessage(msgObjContent, [messageChannel.port2]);
        });

    return listenerPromise;
};

//  ----------------------------------------------------------------------------

TP.boot.setupServiceWorker = function() {

    /**
     * @method setupServiceWorker
     * @summary Sets up the Service Worker used by TIBET to control caching and
     *     provide other, more esoteric ;-), services.
     * @returns {Promise} A Promise that will resolve when the ServiceWorker is
     *     ready.
     */

    return navigator.serviceWorker.register(
        '/tibet_service_worker.min.js').then(
            function(registration) {
                //  Registration was successful
                TP.trace('TIBET ServiceWorker' +
                            ' initialization successful with' +
                            ' scope: ' + registration.scope);

                TP.boot.$$serviceWorkerRegistration = registration;

                //  We have to wait until the ServiceWorker is ready... and then
                //  we have to wait until it has a real controller via it's
                //  'controllerchange' event before we can continue.
                return navigator.serviceWorker.ready.then(
                        function() {
                            return new Promise(
                                function(resolver, rejector) {
                                    if (navigator.serviceWorker.controller) {
                                        resolver();
                                    }
                                    navigator.serviceWorker.addEventListener(
                                        'controllerchange',
                                        function() {
                                            resolver();
                                        });
                                });
                        }).then(function() {

                            //  Set up a 'message' handler that will listen for
                            //  messages from the service worker, call our
                            //  method and then post whatever result comes in on
                            //  the Promise back to the service worker.
                            navigator.serviceWorker.addEventListener(
                                'message',
                                function(event) {
                                    TP.boot.receiveMessageFromServiceWorker(
                                                    event.data).then(
                                       function(result) {
                                            event.ports[0].postMessage({
                                                error: null,
                                                msg: 'ok',
                                                payload: result
                                            });
                                       });
                                });
                        });

                }, function(err) {
                    //  Registration failed :(
                    TP.error('TIBET ServiceWorker' +
                                ' initialization failed' + err.message);
            }).then(function() {
                var cacheCfgBody;

                //  Compute a String from the current config data.
                cacheCfgBody = JSON.stringify(TP.sys.cfg());

                //  Send a message over to the Service Worker giving it all of
                //  the cfg data that we have.
                return TP.boot.sendMessageToServiceWorker(
                        navigator.serviceWorker.controller,
                        {
                            command: 'setcfg',
                            payload: cacheCfgBody
                        });
            });
};

//  ----------------------------------------------------------------------------

TP.boot.shouldCacheFiles = function() {

    /**
     * @method shouldCacheFiles
     * @summary Whether or not we should cache any type of file, lib or app.
     * @returns {Boolean} Whether or not to cache files at all.
     */

    //  If the 'master' cache flag is false, then we definitely return false
    //  here.
    if (TP.sys.cfg('boot.use_cache') === false) {
        return false;
    }

    //  If we're headless, even if we've been launched over HTTP, then we don't
    //  cache any files.
    if (TP.sys.cfg('boot.context') === 'headless') {
        return false;
    }

    //  If the user is running as a Team TIBET user, then we don't cache any
    //  files.
    if (TP.sys.getcfg('boot.teamtibet') === true) {
        return false;
    }

    return TP.sys.isHTTPBased();
};

//  ----------------------------------------------------------------------------

TP.boot.shouldCacheAppFiles = function() {

    /**
     * @method shouldCacheAppFiles
     * @summary Whether or not we should cache app files.
     * @returns {Boolean} Whether or not to cache app files.
     */

    //  If the 'master' cache flag is false, then we definitely return false
    //  here.
    if (TP.sys.cfg('boot.use_cache') === false) {
        return false;
    }

    //  If we're caching files at all, we cache app files as long as we're not
    //  in developer mode.
    if (TP.sys.inDeveloperMode() === true) {
        return false;
    }

    //  And we're HTTP based.
    return TP.sys.isHTTPBased();
};

//  ----------------------------------------------------------------------------

TP.boot.shouldCacheLibFiles = function() {

    /**
     * @method shouldCacheLibFiles
     * @summary Whether or not we should cache lib files.
     * @returns {Boolean} Whether or not to cache lib files.
     */

    //  If the 'master' cache flag is false, then we definitely return false
    //  here.
    if (TP.sys.cfg('boot.use_cache') === false) {
        return false;
    }

    //  If we're caching files at all, we cache lib files as long as we're HTTP
    //  based.
    return TP.sys.isHTTPBased();
};

//  ----------------------------------------------------------------------------

TP.boot.teardownCaches = function() {

    /**
     * @method teardownCaches
     * @summary Tears down both lib and app caches.
     */

    return caches.delete('TIBET_LIB_CACHE').then(
        function(cache) {
            return caches.delete('TIBET_APP_CACHE');
        });
};

//  ============================================================================
//  BOOT FUNCTIONS
//  ============================================================================

TP.boot.boot = function() {

    /**
     * @method boot
     * @summary Triggers the actual boot process. This function is typically
     *     invoked by the launch() function after all pre-configuration work has
     *     been completed and the boot UI elements have been found/initialized.
     */

    //  perform any additional configuration work necessary before we boot.
    TP.boot.$config().then(
        function() {
            //  expand the manifest in preparation for importing components.
            return TP.boot.$expand();
        }).then(function() {
            //  Caches will not be available in non-secure contexts. We need to
            //  test for them here.
            if (!TP.sys.isSecureContext()) {
                return;
            }

            //  check to see if we need to cache files. Note that this will set
            //  up a Service Worker.
            if (TP.boot.shouldCacheFiles()) {
                return TP.boot.configureAndPopulateCaches();
            } else {
                //  if we're not caching at all, then tear down any existing
                //  caches and set up a Service Worker since we may need it for
                //  non-caching capabilities.
                return TP.boot.teardownCaches().then(
                        function() {
                            return TP.boot.setupServiceWorker();
                        });
            }
        }).then(function() {
            //  import based on expanded package. startup is invoked once the
            //  async import process completes.
            return TP.boot.$importApplication();
        });
};

//  ----------------------------------------------------------------------------

TP.boot.launch = function(options) {

    /**
     * @method launch
     * @summary Launches a new TIBET application. By default TIBET launches with
     *     the boot console visible, without using a login page, and assuming
     *     defaults for all other boot-prefixed startup parameters. The options
     *     here allow you to change any setting you like, however these settings
     *     are overridden by any placed on the URL unless you specify
     *     boot.no_url_args in this option list (which is useful in certain
     *     production setups).
     * @param {Object} options A set of options which control the boot process.
     */

    var hash;

    //  Start logging...
    TP.boot.$stdout('TIBET Boot System (TBS) ' + TP.boot.$version,
                    TP.SYSTEM);
    TP.boot.$stdout('', TP.SYSTEM);

    //  If we're in the middle of a routine exercise care of having been loaded
    //  into a non-TOP frame exit after clearing that flag. The launch() call
    //  will have been triggered by the index.html file for a default TIBET app
    //  but we don't want to honor launch when we're not in TOP.
    if (TP.$$nested_loader) {
        delete TP.$$nested_loader;
        return;
    }

    //  If we're booting in response to a login page sequence we may have had
    //  client-side fragment information tucked away. Check for that and restore
    //  it if we find any (and clear it for any future processing).
    if (top.sessionStorage) {
        hash = top.sessionStorage.getItem('TIBET.boot.fragment');
        if (hash) {
            top.sessionStorage.removeItem('TIBET.boot.fragment');
            top.location.hash = hash;
        }
    }

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

    //  loads the tibet.json file which typically contains profile and lib_root
    //  data. with those two values the system can find the primary package and
    //  configuration that will ultimately drive what we load.
    TP.boot.$configureBootstrap().then(
        function() {

            //  Update any cached variable content. We do this each time we've
            //  read in new configuration values regardless of their source.
            TP.boot.$updateDependentVars();

            try {
                //  set the initial stage. this will also capture a start time.
                TP.boot.$setStage('prelaunch');
            } catch (e) {
                if (window.location.protocol.indexOf('file') === 0) {
                    //  File launch issue.
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
                            'File launch aborted. Check browser security' +
                            ' settings.',
                            TP.FATAL);
                    }
                    return;
                }
            }

            //  If the browser is considered obsolete we can stop right now.
            if (TP.sys.isObsolete()) {
                TP.boot.$stderr('Obsolete browser/platform: ' + TP.$agent +
                    '. Boot sequence terminated.', TP.FATAL);
                return;
            }

            //  If the initial coded launch options didn't tell us to ignore the
            //  URL we'll process it for any overrides and update based on any
            //  changes. The argument 'true' here tells the system to activate
            //  override checking.
            if (TP.sys.cfg('boot.no_url_args') !== true) {
                TP.boot.$$configureOverrides(
                    TP.boot.$uriFragmentParameters(
                                TP.sys.getLaunchURL()), true);
                TP.boot.$updateDependentVars();
            }

            //  Regardless of any ignore URL arg settings avoid cycling when the
            //  login page was the first page into the user interface
            //  (double-click, bookmark, shortcut, etc.)

            //  now that both option lists have been set we can proceed with the
            //  startup sequence.

            //  don't boot TIBET twice into the same window hierarchy, check to
            //  make sure we don't already see the $$TIBET window reference
            if (window.$$TIBET && window.$$TIBET !== window) {

                //  make sure the user sees this
                TP.boot.$stderr('Found existing TIBET image in ' +
                    (typeof window.$$TIBET.getFullName === 'function' ?
                        window.$$TIBET.getFullName() :
                        window.$$TIBET.name) +
                        '. Boot sequence terminated.', TP.FATAL);

                return;
            }

            //  configure the UI boot frame. This involves potentially
            //  creating/loading the frame so it may be async. On completion
            //  this routine will trigger the uiRootConfig routine to create the
            //  root UI frame in a similar way.
            TP.boot.$uiBootConfig();
        });
};

//  ----------------------------------------------------------------------------

TP.boot.main = function() {

    /**
     * @method main
     * @summary Invoked when all booting has been completed. The primary
     *     purpose of this function is to hide any boot-time display content
     *     and then invoke the TP.sys.activate method to cause the system to
     *     initialize.
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

    /**
     * @method $activate
     * @summary Invoked from TP.boot.main() to activate the application when the
     *     booting process is complete. This installs various
     *     window/system-level hooks and then tells the entire system to
     *     activate.
     */

    try {

        //  protect the codebase from inadvertent exits

        //  make sure that the application knows to prompt the user before
        //  quitting.
        //  NB: We no longer install this hook here because of a change in the
        //  way browsers present the onbeforeunload dialog box. They wait for
        //  one of a set of user gestures (click, key, etc. events) before
        //  allowing the dialog box to show. Therefore, we now install this
        //  after the first one of those events has fired. See
        //  TP.boot.$$documentSetup for more information.

        //  TP.windowInstallOnBeforeUnloadHook(window);

        //  make sure that the application knows to send the terminate signals
        //  before quitting.
        TP.windowInstallShutdownFinalizationHook(window);

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
            TP.boot.$stderr('Error initializing components.',
                TP.boot.$ec(e2));
        }
    } catch (e) {
        TP.boot.$stderr('Error initializing components.', TP.boot.$ec(e));
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$stageAction = async function() {

    /**
     * @method $stageAction
     * @summary Responds to actions from within the various boot display pages.
     *     When a particular stage pauses the UI this routine is typically
     *     attached as the onclick handler for one or more components in the UI.
     *     The user can restart and/or resume the boot sequence by triggering
     *     this handler.
     */

    switch (TP.boot.$getStage()) {

        case 'paused':

            TP.boot.$$restarttime = new Date();
            TP.boot.$stdout('Startup process re-engaged by user.',
                TP.SYSTEM);
            TP.boot.$activate();

            break;

        case 'import_paused':

            //  Happens in two-phase booting when waiting for login to return us
            //  a hook file to trigger the second phase of the boot process.
            TP.boot.$$restarttime = new Date();
            TP.boot.$stdout('Startup process re-engaged by user.',
                TP.SYSTEM);
            await TP.boot.$$importPhaseTwo();

            break;

        default:
            break;
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$uiBootConfig = function() {

    /**
     * @method $uiBootConfig
     * @summary Confirms a UIBOOT can be found, and configures one it necessary.
     *     Configuration requires asynchronous loading so this routine is the
     *     first half of a pair of routines, the other being $uiBootReady. The
     *     latter routine will trigger uiRootConfig to build the root iframe.
     */

    var uiBootID,
        uiFrame,
        lastBodyChildren,
        lastBodyChild,
        path,
        iFrameWrapper,
        launchDoc;

    //  Look for the designated (or default) UI boot frame.
    uiBootID = TP.sys.cfg('tibet.uiboot') || 'UIBOOT';
    uiFrame = TP.boot.$getUIElement(uiBootID);

    //  If the frame is found this is simple and synchronous. Just invoke the
    //  second stage routine directly.
    if (TP.boot.$isValid(uiFrame)) {
        TP.boot.$uiBootReady();
        return;
    }

    TP.boot.$stdout('Unable to locate ' + uiBootID + ', generating it.',
                    TP.DEBUG);

    launchDoc = TP.sys.getLaunchDocument();

    //  Inject a style node that will force primary content framing to 100%.
    TP.boot.$documentAddCSSStyleElement(
            launchDoc,
            'html,body,iframe {\n' +
            '   position: absolute;\n' +
            '   top: 0;\n' +
            '   left: 0;\n' +
            '   width: 100%;\n' +
            '   height: 100%;\n' +
            '   margin: 0;\n' +
            '   padding: 0;\n' +
            '   border: 0;\n' +
            '   overflow: hidden;\n' +
            '}\n');

    //  TODO: Verify we need this instead of just body.appendChild. We used
    //  to have to work around a bug in IE.
    lastBodyChildren = launchDoc.body.children;
    lastBodyChild = lastBodyChildren[lastBodyChildren.length - 1];

    //  ---
    //  Create an XHTML version of the iframe
    //  ---

    //  Create a wrapper span and then set the 'innerHTML' of it
    //  to an iframe. This causes the underlying iframe
    //  document, etc. to be created.

    //  We create a 'span' wrapper for the boot iframe, mostly
    //  because it's necessary when creating the XHTML version
    //  of the iframe.
    iFrameWrapper = launchDoc.createElement('span');
    lastBodyChild.parentNode.insertBefore(iFrameWrapper, lastBodyChild);

    //  Set the innerHTML of the span wrapper. This will create
    //  the iframe. Then set the 'src' attribute to a 'data:'
    //  URL containing an encoded XHTML document.
    iFrameWrapper.innerHTML = '<iframe id="' + uiBootID + '">';
    uiFrame = TP.boot.$nodeReplaceChild(
                        iFrameWrapper.parentNode,
                        iFrameWrapper.firstChild,
                        iFrameWrapper);

    path = TP.boot.$uriExpandPath(TP.sys.cfg('path.uiboot_page'));
    uiFrame.setAttribute('src', path);

    uiFrame.onload = function() {

        var doc;

        //  grab the 'object' element by ID - that'll be the
        //  boot 'iframe'.
        uiFrame = launchDoc.getElementById(uiBootID);
        doc = uiFrame.contentDocument;

        //  For some reason, these properties don't get wired on
        //  any browser.
        uiFrame.contentWindow = TP.boot.$documentGetWindow(doc);
        window.frames[uiBootID] = TP.boot.$documentGetWindow(doc);

        TP.boot.$uiBootReady();
    };
};

//  ----------------------------------------------------------------------------

TP.boot.$uiBootReady = function() {

    /**
     * @method $uiBootReady
     * @summary Called to complete the process of launching a new TIBET
     *     application once the UI boot frame is configured/loaded.
     */

    var bar;

    bar = TP.boot.$getProgressBarElement();
    if (bar) {
        bar.onclick = TP.boot.showUIConsole;
    }

    TP.boot.$uiRootConfig();
};

//  ----------------------------------------------------------------------------

TP.boot.$uiRootConfig = function() {

    /**
     * @method $uiRootConfig
     * @summary Confirms a UIROOT can be found, and configures one it necessary.
     *     Configuration requires asynchronous loading so this routine is the
     *     first half of a pair of routines, the other being $uiRootReady.
     */

    var uiRootID,
        uiFrame,
        uiBootID,
        uiBootFrame,
        path,
        iFrameWrapper,
        launchDoc;

    //  Look for the designated (or default) UI root frame.
    uiRootID = TP.sys.cfg('tibet.uiroot') || 'UIROOT';
    uiFrame = TP.boot.$getUIElement(uiRootID);

    //  If the frame is found this is simple and synchronous. Just invoke the
    //  second stage routine directly.
    if (TP.boot.$isValid(uiFrame)) {
        TP.boot.$uiRootReady();
        return;
    }

    TP.boot.$stdout('Unable to locate ' + uiRootID + ', generating it.',
        TP.DEBUG);

    launchDoc = TP.sys.getLaunchDocument();

    uiBootID = TP.sys.cfg('tibet.uiboot') || 'UIBOOT';
    uiBootFrame = TP.boot.$getUIElement(uiBootID);

    //  ---
    //  Create an XHTML version of the iframe
    //  ---

    //  Create a wrapper span and then set the 'innerHTML' of it
    //  to an iframe. This causes the underlying iframe
    //  document, etc. to be created.

    //  We create a 'span' wrapper for the root iframe, mostly
    //  because it's necessary when creating the XHTML version
    //  of the iframe, and insert before the boot UI to support
    //  how our visibility operations work re: toggling CSS.
    iFrameWrapper = launchDoc.createElement('span');
    uiBootFrame.parentNode.insertBefore(iFrameWrapper,
                                            uiBootFrame);

    //  Set the innerHTML of the span wrapper. This will create
    //  the iframe. Then set the 'src' attribute to a 'data:'
    //  URL containing an encoded XHTML document.
    iFrameWrapper.innerHTML = '<iframe id="' + uiRootID + '">';
    uiFrame = TP.boot.$nodeReplaceChild(
                        iFrameWrapper.parentNode,
                        iFrameWrapper.firstChild,
                        iFrameWrapper);

    //  NOTE we don't set a UI page here, just a blank placeholder.
    path = TP.boot.$uriExpandPath(TP.sys.cfg('path.iframe_page'));
    uiFrame.setAttribute('src', path);

    uiFrame.onload = function() {

        var doc;

        //  grab the 'object' element by ID - that'll be the
        //  root 'iframe'.
        uiFrame = launchDoc.getElementById(uiRootID);
        doc = uiFrame.contentDocument;

        //  For some reason, these properties don't get wired on
        //  any browser.
        uiFrame.contentWindow = TP.boot.$documentGetWindow(doc);
        window.frames[uiRootID] = TP.boot.$documentGetWindow(doc);

        TP.boot.$uiRootReady();
    };
};

//  ----------------------------------------------------------------------------

TP.boot.$uiRootReady = function() {

    /**
     * @method $uiRootReady
     * @summary Called to complete the process of launching a new TIBET
     *     application once the UI root frame is loaded.
     */

    var uiRootID,
        win,

        needsLoadingVisual,

        login,

        bootWin,
        fields,
        i;

    uiRootID = TP.sys.cfg('tibet.uiroot') || 'UIROOT';
    win = TP.sys.getWindowById(uiRootID);

    if (TP.boot.$notValid(win)) {
        TP.boot.$stdout(
            'Unable to locate uiroot, defaulting to current window.',
            TP.WARN);
        win = window;
    }

    //  If we're loading from HTTP we depend on the server to determine what
    //  we're up to. The only consideration we have in that case is whether we
    //  expect a second phase or not.
    if (TP.sys.isHTTPBased()) {

        login = TP.sys.cfg('boot.use_login');

        if (login !== true) {
            win.$$phase_two = true;
            TP.boot.boot();
        } else {

            needsLoadingVisual = TP.sys.needsLoadingIndicator();

            if (TP.sys.cfg('boot.parallel') && needsLoadingVisual) {
                TP.boot.getUIBoot().contentDocument.body.style.opacity = 0.5;
                TP.boot.getUIBoot().contentDocument.activeElement.blur();
            }

            //  Grab all of the 'input' elements in the page and install a
            //  capturing focus handler on them that will set their
            //  'onceHadFocus' flag. Note that we do *not* install a blur
            //  handler that would remove this flag. Doing so causes a lot of
            //  timing problems as we're in the middle of loading. So we just
            //  track the fields that once had focus and then focus on the last
            //  one that did after we're done loading.
            bootWin = TP.sys.getWindowById(TP.sys.cfg('boot.uiboot'));
            fields = bootWin.document.getElementsByTagName('input');

            /* eslint-disable no-loop-func */
            for (i = 0; i < fields.length; i++) {
                fields[i].addEventListener(
                    'focus',
                    function(evt) {
                        evt.target.setAttribute('onceHadFocus', true);
                        if (TP.boot.$hasReachedStage('import_paused') !==
                                                                    true) {
                            evt.target.blur();
                        }
                    },
                    true);
            }
            /* eslint-enable no-loop-func */

            //  If login is true then the server will be in control of the pages
            //  we receive. There are two models: single-phase and two-phase.
            //  If we're booting single-phase we probably had a pure login page
            //  and only on successful authentication was a page with the loader
            //  vended to the client. In two-phase we're loading and showing the
            //  login page at the same time and will only get a "keep booting"
            //  option when authentication passes. So two phase booting (aka
            //  parallel booting) means we want the phase_two flag turned off.
            win.$$phase_two = !TP.sys.cfg('boot.parallel');

            TP.boot.boot();
        }
    } else {
        //  Without logins and success pages we can't rely on a "second phase"
        //  component to trigger booting phase two so we set it explicitly.
        win.$$phase_two = true;
        TP.boot.boot();
    }
};

//  ----------------------------------------------------------------------------

}(this));

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
