//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The TIBET command-line harness. Logic here is focused on command
 *     identification, initial argument processing, command file loading, and
 *     common utilities for commands. If a command isn't found the CLI will
 *     check for a TIBET-style make target followed by a grunt or gulp
 *     task to perform the work.
 */
//  ========================================================================

/*
 * STANDARD OPTIONS:
 *      app_root        // Where is the application root? Normally computed.
 *      lib_root        // Where is the library root? Normally computed.
 *
 *      color           // Display colored output. Default is true.
 *      verbose         // Provide more verbose output. Default is false.
 *      silent          // Run without providing any output. Default is false.
 *
 *      level           // Set an explicit logging level. Default is 'info'.
 *      debug           // Set logging level to debug. Default is false.
 *      stack           // Dump stack with error messages? Default is false.
 *
 *      help            // Display help on the command. Default is false.
 *      usage           // Display usage of the command. Default is false.
 */

/* eslint camelcase:0, consistent-return:0, no-process-exit:0, no-cond-assign:0, indent:0, consistent-this:0 */
(function() {

'use strict';

var path,
    fs,
    sh,
    beautify,
    minimist,
    prompt,
    Color,
    Logger,
    Package,
    CLI;

fs = require('fs');
path = require('path');
sh = require('shelljs');
minimist = require('minimist');
prompt = require('readline-sync');
beautify = require('js-beautify').js_beautify;

//  ---
//  Object Construction
//  ---

/**
 * The Command Line object. This object is fairly simply. It parses a command
 * line to determine if there's a viable command name present. If the command
 * name can be identified it tries to load a file with that name from the local
 * directory to process the command. If the command cannot be found an attempt
 * is made to invoke a task of that name using grunt or gulp as a fallback tool.
 * @type {Object}
 */
CLI = {};


//  ---
//  Object Attributes
//  ---

//  Convenience references to common modules.
CLI.sh = sh;

/**
 * The max number of characters per line in the item lists for commands like
 * `help` and `make`.
 * @type {number}
 */
CLI.CHARS_PER_LINE = 55;


/**
 * The set of viable execution contexts for commands.
 * @type {Object.<string,string>}
 */
CLI.CONTEXTS = {
    ANY: 'any',
    PROJECT: 'project',
    LIBRARY: 'library',
    NONLIB: 'nonlib',
    INSIDE: 'inside',
    OUTSIDE: 'outside'
};


/**
 * File indicating we're in a git project.
 * @type {string}
 */
CLI.GIT_FILE = '.git';


/**
 * Grunt fallback requires that we find this file to be sure we're in a
 * grunt-enabled project. Also, grunt's executable must be installed (which
 * TIBET does NOT do by default).
 * @type {string}
 */
CLI.GRUNT_FILE = 'Gruntfile.js';


/**
 * Gulp fallback requires that we find this file to be sure we're in a
 * gulp-enabled project. Also, gulp's executable must be installed (which TIBET
 * does NOT do by default).
 * @type {string}
 */
CLI.GULP_FILE = 'gulpfile.js';


/**
 * The default `make` file for TIBET projects. Functions exported from this file
 * are potential fallbacks for cli commands. NOTE that this is targeted at the
 * launch root location, not app root or lib root.
 * @type {string}
 */
CLI.MAKE_FILE = '~app_cmd/make/makefile.js';


/**
 * The name of the npm package file.
 * @type {string}
 */
CLI.NPM_FILE = 'package.json';


/**
 * The name of the default TIBET package configuration file. This value should
 * be kept in sync with the tibet_cfg value for boot.default_package.
 * @type {string}
 */
CLI.PACKAGE_FILE = '~app_cfg/main.xml';

/**
 * Command argument parsing options for minimist. The defaults handle the common
 * flags but can be overridden if the command needs to define specific ones.
 * @type {Object}
 */

/* eslint-disable quote-props */
CLI.PARSE_OPTIONS = {
    'boolean': ['color', 'help', 'usage', 'debug', 'stack', 'verbose',
        'initpath', 'completion', 'tds-cli', 'force'],
    'string': ['app_root', 'lib_root', 'level'],
    'default': {
        color: true
    }
};
/* eslint-enable quote-props */


/**
 * The default project file for TIBET projects. Existence of this file in a
 * directory is used by TIBET's command line to signify that we're inside a
 * TIBET project.
 * @type {string}
 */
CLI.PROJECT_FILE = 'tibet.json';


/**
 * Optional configuration data typically passed into run() via tibet 'binary'.
 * @type {Object}
 */
CLI.config = {};


/**
 * Command options, typically populated by parameters found in process.argv.
 * @type {Object}
 */
CLI.options = {};


/**
 * The package instance used for CLI-level package processing. Considered
 * internal since it has specific configuration options which may not be
 * suitable for use by individual commands.
 * @type {Package}
 */
CLI._package = null;


//  ---
//  Common Logging
//  ---

/*
 * Maps the functions from the common logger into methods that are easier for
 * individual commands to access. See tibet_logger.js for more details.
 */

CLI.$log = function(level, msg, spec) {
    if (this.options['tds-cli'] || this.getArgv().indexOf('--tds-cli') !== -1) {
        this.$tdsclilog(level, msg, spec);
    } else {
        this.logger[level](msg, spec);
    }
};

/**
 */
CLI.$tdsclilog = function(level, msg, spec) {
    var obj,
        ok;

    ok = true;
    if (['error', 'fatal'].indexOf(level) !== -1) {
        ok = false;
    }

    obj = {
        ok: ok,
        level: level
    };

    if (ok) {
        obj.data = msg;
    } else {
        obj.error = 'error';
        obj.reason = msg;
    }

    this.logger[level](JSON.stringify(obj), spec);
};

/* eslint-disable no-console */
CLI.trace = function(msg, spec) {
    this.$log('trace', msg, spec);
};

CLI.debug = function(msg, spec) {
    this.$log('debug', msg, spec);
};

CLI.info = function(msg, spec) {
    this.$log('info', msg, spec);
};

CLI.warn = function(msg, spec) {
    this.$log('warn', msg, spec);
};

CLI.error = function(msg, spec) {
    this.$log('error', msg, spec);
};

CLI.fatal = function(msg, spec) {
    this.$log('fatal', msg, spec);
};

CLI.system = function(msg, spec) {
    this.$log('system', msg, spec);
};

CLI.log = function(msg, spec, level) {
    this.$log('log', msg, spec);
};

CLI.verbose = function(msg, spec) {
    this.$log('verbose', msg, spec);
};
/* eslint-enable no-console */


//  ---
//  Value checks
//  ---

CLI.isEmpty = function(aReference) {
    /* eslint-disable no-extra-parens */
    return aReference === null ||
        aReference === undefined ||
        aReference.length === 0 ||
        (typeof aReference === 'object' &&
        Object.keys(aReference).length === 0);
    /* eslint-enable no-extra-parens */
};

CLI.isFalse = function(aReference) {
    return aReference === false;
};

/**
 * Returns true if the string provided is a valid JS identifier.
 * @param {String} aString The string value to test.
 * @returns {Boolean} true if the string would make a valid JS identifier.
 */
CLI.isJSIdentifier = function(aString) {

    if (typeof aString !== 'string') {
        return false;
    }

    //  Strictly speaking the '.' here is not part of a valid individual
    //  identifier name...but we allow for JS identifier "paths".
    return /^[a-zA-Z_$]{1}[.a-zA-Z0-9_$]*$/.test(aString);
};

/**
 * Returns true if the object provided is an 'Object' as opposed to a string,
 * number, boolean, RegExp, Array, etc. In essense a check for whether it's a
 * hash of keys.
 * @param {Object} obj The object to test.
 * @returns {Boolean} True if the object is an Object.
 */
CLI.isObject = function(obj) {
    return typeof obj === 'object' &&
        Object.prototype.toString.call(obj) === '[object Object]';
};

/**
 * Check an object to see if it's truly a plain object and not an instance of
 * some more complex prototype chain.
 */
CLI.isPlainObject = function(obj) {

    if (obj === null ||
        obj === undefined ||
        typeof obj !== 'object' ||
        obj.nodeType ||
        obj.moveBy) {
        return false;
    }

    if (obj.constructor && !Object.prototype.hasOwnProperty.call(
            obj.constructor.prototype, 'isPrototypeOf')) {
        return false;
    }

    return true;
};

CLI.isTrue = function(aReference) {
    return aReference === true;
};

CLI.isValid = function(aReference) {
    return aReference !== null && aReference !== undefined;
};

CLI.notEmpty = function(aReference) {
    return aReference !== null && aReference !== undefined &&
        aReference.length !== 0;
};

CLI.notValid = function(aReference) {
    return aReference === null || aReference === undefined;
};

//  ---
//  Value comparisons
//  ---

/**
 * Compares two file modification times and returns true if the first file is
 * newer than the second. This routine is often used to check whether a target
 * generated file needs to be refreshed from a source file.
 * @param {String} fileOne The "source" file in most comparisons.
 * @param {String|Date} fileTwoOrDate The "target" file in most comparisons, or
 *     a date to compare fileOne against.
 * @returns {Boolean} true if fileOne has changed more recently than the
 *     fileTwoOrDate value provided.
 */
CLI.isFileNewer = function(fileOne, fileTwoOrDate) {
    var pathOne,
        pathTwo,
        statsOne,
        statsTwo,
        dateOne,
        dateTwo;

    try {
        pathOne = CLI.expandPath(fileOne);
        statsOne = fs.statSync(pathOne);
    } catch (e) {
        CLI.error('Unable to stat file: ' + e.message);

        //  NOTE that we default to true here. Most callers care about
        //  regenerating a target file so we assume the work needs to be done
        //  any time we can't be sure.
        return true;
    }
    dateOne = new Date(statsOne.mtime);

    if (typeof fileTwoOrDate === 'string') {
        pathTwo = CLI.expandPath(fileTwoOrDate);
        try {
            statsTwo = fs.statSync(pathTwo);
        } catch (e) {
            //  NOTE we don't even report an error here...a lot of times the
            //  target file may not exist (it's often a generated target).
            return true;
        }
        dateTwo = new Date(statsTwo.mtime);
    } else if (typeof fileTwoOrDate.getTime === 'function') {
        dateTwo = fileTwoOrDate;
    } else {
        CLI.error('Invalid parameter for fileTwoOrDate: ' + fileTwoOrDate);
        return true;
    }

    return dateOne.getTime() > dateTwo.getTime();
};

/**
 * Compares two object structures and attempts to determine if they are a rough
 * match in JSON terms by iterating over keys and checking values. NOTE that the
 * semantics of checking JSON equality differ from the standard semantics of JS.
 * We only care whether serialized strings would differ but we can't rely on the
 * JSON.stringify call since keys aren't ordered.
 * @param {Object} objOne The first object in the comparison.
 * @param {Object} objTwo The second object in the comparison.
 * @returns {Boolean} true if the objects have the same key/value content.
 */
CLI.isSameJSON = function(objOne, objTwo) {
    var first,
        second,
        fkeys,
        skeys;

    //  Two keys pointing to 'null' have the same "string" values.
    if (objOne === null) {
        return objTwo === null;
    }

    if (objTwo === null) {
        return objOne === null;
    }

    //  If they're not the same type they can't be equal.
    if (typeof objOne !== typeof objTwo) {
        return false;
    }

    //  If values are identical up we're good.
    if (objOne === objTwo) {
        return true;
    }

    //  Normalize the objects in JSON terms by serializing/parsing. This has the
    //  effect of taking things like NaN and converting them to null, taking
    //  Date objects and turning them into numbers, etc.
    try {
        first = JSON.parse(JSON.stringify(objOne));
        second = JSON.parse(JSON.stringify(objTwo));
    } catch (e) {
        //  Can't compare. Assume false.
        return false;
    }

    //  If they're not objects they're primitive and unequal.
    if (typeof first !== 'object') {
        return false;
    }

    //  If they're not both Object or both Array they're unequal.
    /* eslint-disable no-extra-parens */
    if ((Array.isArray(first) && !Array.isArray(second)) ||
        (!Array.isArray(first) && Array.isArray(second))) {
        return false;
    }
    /* eslint-enable no-extra-parens */

    try {
        fkeys = Object.keys(first).sort();
        skeys = Object.keys(second).sort();
    } catch (e) {
        //  If either of the objects are not capable of returning a set of keys
        //  then at least one is non-object and we're talking about inequality.
        return false;
    }

    //  Sort the keys and compare. If the keysets differ we're also inequal.
    if (fkeys.toString() !== skeys.toString()) {
        return false;
    }

    //  Recursively check values at the next level. Any mismatches will fail the
    //  test and trigger a false return.
    return !fkeys.some(function(key) {
        return !CLI.isSameJSON(first[key], second[key]);
    });
};

//  ---
//  Utilities
//  ---

/**
 * A common handle to the js-beautify routine for pretty-printing JSON to
 * the console or via the logger.
 * @type {Function}
 */
CLI.beautify = function(obj) {
    var str;

    if (CLI.notValid(obj)) {
        return obj;
    }

    if (typeof obj !== 'string') {
        try {
            str = JSON.stringify(obj);
        } catch (e) {
            str = '' + obj;
        }
    } else {
        str = obj;
    }

    return beautify(str);
};


/**
 * A useful variation on extend from other libs sufficient for parameter block
 * copies. The objects passed are expected to be simple JavaScript objects. No
 * checking is done to support more complex cases. Slots in the target are only
 * overwritten if they don't already exist. Only slots owned by the source will
 * be copied. Arrays are treated with some limited deep copy semantics as well.
 * @param {Object} target The object which will potentially be modified.
 * @param {Object} source The object which provides new property values.
 */
CLI.blend = function(target, source) {

    if (this.notValid(source)) {
        return target;
    }

    if (Array.isArray(target)) {
        if (!Array.isArray(source)) {
            return target;
        }

        // Both arrays. Blend as best we can.
        source.forEach(function(item, index) {
            //  Items that don't appear in the list get pushed.
            if (target.indexOf(item) === -1) {
                target.push(item);
            }
        });

        return target;
    }

    if (this.isValid(target)) {
        //  Target is primitive value. Don't replace.
        if (!this.isObject(target)) {
            return target;
        }

        //  Target is complex object, but source isn't.
        if (!this.isObject(source)) {
            return target;
        }
    } else {
        // Target not valid, source should overlay.
        return JSON.parse(JSON.stringify(source));
    }

    //  We only want to iterate on keys (essentially descend) if the object
    //  provide is a POJO, not an instance of some more complex type.
    if (!CLI.isPlainObject(source)) {
        return source;
    }

    Object.keys(source).forEach(function(key) {
        if (key in target) {
            if (CLI.isObject(target[key])) {
                CLI.blend(target[key], source[key]);
            } else if (Array.isArray(target[key])) {
                CLI.blend(target[key], source[key]);
            }
            return;
        }

        //  Key isn't in target, build it out with source copy.
        if (Array.isArray(source[key])) {
            // Copy array/object slots deeply as needed.
            target[key] = CLI.blend([], source[key]);
        } else if (CLI.isObject(source[key])) {
            // Deeply copy other non-primitive objects.
            target[key] = CLI.blend({}, source[key]);
        } else {
            target[key] = source[key];
        }
    });

    return target;
};


/**
 * Returns true if the current context is appropriate for the command to run.
 * The primary response here is based on "context" in that some commands are
 * only useful within a project, some must be outside a project, and some can be
 * run from any location.
 * @param {Object} CmdType The command type to check.
 * @returns {Boolean} True if the command is runnable.
 */
CLI.canRun = function(CmdType) {

    var context;

    context = CmdType.CONTEXT;

    // Simple case if the context is "anywhere".
    if (context === CLI.CONTEXTS.ANY) {
        return true;
    }

    switch (context) {
        case CLI.CONTEXTS.PROJECT:
            return this.inProject(CmdType);
        case CLI.CONTEXTS.LIBRARY:
            return this.inLibrary(CmdType);
        case CLI.CONTEXTS.NONLIB:
            return this.inProject(CmdType) || !this.inLibrary(CmdType);
        case CLI.CONTEXTS.INSIDE:
            return this.inProject(CmdType) || this.inLibrary(CmdType);
        case CLI.CONTEXTS.OUTSIDE:
            return !this.inProject(CmdType) && !this.inLibrary(CmdType);
        default:
            return false;
    }
};


/**
 * Cleanses a string, removing control and non-printable characters, essentially
 * restricting it to just printable ASCII and Extended ASCII characters. Escape
 * codes are also trimmed by default to assist with working with potentially
 * colorized string values.
 * @param {String} input The input string to cleanse.
 * @param {Boolean} [escapes=true] False to turn off cleansing of escape codes.
 * @returns {String} The cleansed string.
 */
CLI.clean = function(input, escapes) {
    var str,
        chars,
        cleansed;

    if (!input) {
        return '';
    }

    //  Convert any Buffer or String objects as needed.
    str = '' + input;

    if (escapes !== false) {
        //  Escape codes look like '[blah...m' where 'blah' is chunks of
        //  semi-color separated numbers. We want to strip those off.
        str = str.trim().replace(/\[([0-9]|;)*m/g, '');
    }

    //  check for control characters etc.
    chars = str.split('');

    cleansed = chars.filter(function(c) {
        var code;

        code = c.charCodeAt(0);

        //  a bit nasty, but seems to work even with &nbsp;
        if (c <= ' ' || code === 160) {
            //  control characters are largely stripped when found but
            //  we do handle certain forms of whitespace to preserve
            //  semantics.

            if (c === ' ' || code === 160) {
                //  space
                return true;
            } else if (c === '\t') {
                //  tab
                return true;
            } else if (c === '\n') {
                //  newline
                return true;
            } else if (c === '\r') {
                //  the _other_ newline
                return true;
            }

            //  control character...not valid.
            return false;
        }

        //  Trim to ASCII and Extended ASCII minus 'DEL'
        return code >= 32 && code !== 127 && code <= 255;
    });

    return cleansed.join('');
};


/**
 * Returns a function representing a curried version of the provided function.
 */
CLI.curry = function(method) {
    var args;

    //  Arg list other than the original method to be curried.
    args = Array.prototype.slice.call(arguments, 1);

    return function() {
        /* eslint-disable no-invalid-this */
        return method.apply(this, args.concat(
            Array.prototype.slice.call(arguments, 0)));
        /* eslint-enable no-invalid-this */
    };
};


/**
 * Returns a list of entries in sources list not found in removals list.
 * @param {Array} removals The list of items to remove.
 * @param {Array} sources The list of items to filter.
 * @returns {Array} The items in sources not in removals.
 */
CLI.subtract = function(removals, sources) {
    return sources.filter(function(option) {
        return removals.indexOf(option) === -1;
    });
};


/**
 * Returns a string whose whitespace constructs (in JavaScript terms) have been
 * escaped so the string can be processed properly when quoted.
 * @param {String} aString The string to be escaped.
 * @returns {String} The escaped string.
 */
CLI.escapeWhitespace = function(aString) {
    var str;

    //  doubling escapes means we'll always have an even number in the
    //  string so they come back in properly when eval'd
    str = aString.replace(/\\/g, '\\\\');

    //  convert anything that might give us an auto-semicolonoscopy ;)
    str = str.replace(/\n/g, '\\n');
    str = str.replace(/\r/g, '\\r');

    //  other common escapes should also be updated to their JS rep
    str = str.replace(/\t/g, '\\t');

    return str;
};


/**
 * Expands a TIBET virtual path to its equivalent non-virtual path.
 * @param {String} aPath The path to be expanded.
 * @param {Boolean} silent True to turn off errors for non-existent paths.
 * @returns {String} The fully-expanded path value.
 */
CLI.expandPath = function(aPath, silent) {
    return this._package.expandPath(aPath, silent);
};


/**
 * Returns the application root directory, the path where the PROJECT_FILE is
 * found. This path is then used by many commands as a "root" for relative path
 * computations.
 * @returns {string} The application root directory.
 */
CLI.getAppRoot = function() {
    return this._package.getAppRoot();
};


/**
 * Returns the application launch root also referred to as the 'app head'. This
 * is the location where the tibet.json and/or package.json files are found
 * for the current context. This value is always computed and never set via
 * property values. The virtual path for this root is '~' or '~/'. The search
 * for this location works upward from the current directory to attempt to find
 * either a PROJECT_FILE or NPM_FILE. If that fails the search is done relative
 * to the module.filename, ie. the tibet_package.js file location itself.
 */
CLI.getAppHead = function() {
    return this._package.getAppHead();
};


/**
 * Returns an array of actual arguments from the command line. This is useful
 * for comparing with the getArglist results or capturing specific arguments for
 * use in a child process. Note that argv[0] is the command name.
 * @returns {Array.<String>} The argv list.
 */
CLI.getArgv = function() {
    var argv;

    argv = process.argv;
    argv = argv.slice(2);

    return argv;
};


/**
 * Returns the current process environment (or 'development' if not set).
 * Defaults to any command line value followed by NODE_ENV.
 * @returns {string} The environment string.
 */
CLI.getEnv = function() {
    return this.options.env || process.env.NODE_ENV || 'development';
};


/**
 * Returns the library root directory, the path where the TIBET library is
 * found. In combination with the application root this path is one of the
 * critical paths for proper operation.
 * @returns {string} The library root directory.
 */
CLI.getLibRoot = function() {
    return this._package.getLibRoot();
};


/**
 * Returns the configuration values currently in force. Leverages the logic in a
 * TIBET Package object for the loading/processing of default TIBET parameters.
 * If no property is provided the entire set of configuration values is
 * returned.
 * @param {string} property A specific property value to check.
 * @param {Object} [aDefault] Optional value to default the lookup to.
 * @returns {Object} The property value, or the entire configuration object.
 */
CLI.getcfg = function(property, aDefault) {
    return this._package.getcfg(property, aDefault);
};
CLI.cfg = CLI.getcfg;


/**
 * Searches from the current directory location upward in an attempt to find
 * the node_modules directory which should identify an initialized project.
 * @returns {String} The path to the node_modules directory if found.
 */
CLI.getNpmPath = function() {
    var base,
        current;

    base = process.cwd();
    current = path.join(base, 'node_modules');

    while (current && current !== 'node_modules') {
        if (sh.test('-e', current)) {
            return current;
        }
        base = base.slice(0, base.lastIndexOf(path.sep));
        current = path.join(base, 'node_modules');
    }

    return CLI.notInitialized();
};


/**
 * Returns a list of options for the specified command. Options are typically
 * prefixed with '--' in the result.
 * @param {String} command The command name to check for options.
 * @returns {Array.<string>} The list of options.
 */
CLI.getCommandOptions = function(command) {
    var cmdPath,
        CmdType,
        cmd,
        options,
        locals,
        list;

    cmdPath = this.getCommandPath(command);

    // Load the command type
    try {
        CmdType = require(cmdPath);
        if (typeof CmdType.initialize === 'function') {
            try {
                CmdType.initialize();
            } catch (e) {
                return this.handleError(e, 'initializing', command);
            }
        }
        cmd = new CmdType();
    } catch (e) {
        return this.handleError(e, 'loading', command);
    }

    //  Get the local (common) options for all commands via CLI options.
    locals = [];
    options = CLI.PARSE_OPTIONS;
    ['boolean', 'string', 'number'].forEach(function(key) {
        var names;

        names = options[key];
        if (CLI.isValid(names)) {
            locals = locals.concat(names);
        }
    });

    locals = locals.map(function(option) {
        return '--' + option;
    });

    //  Get the list from the command. We access the prototype since we want the
    //  functionality to be inherited from _cmd if possible.
    list = cmd.getCompletionOptions();

    return CLI.subtract(locals, list);
};


/**
 * Searches a set of paths including ~app_cmd and ~lib_cmd for an implementation
 * file for the named command.
 * @param {string} command The command to find, such as 'start'.
 * @returns {?string} The path to the command, if found.
 */
CLI.getCommandPath = function(command) {

    var roots,      // The directory roots we'll search.
        i,
        len,
        base,
        file;

    // First check is for "built-in" commands. If it's one of those we'll use
    // that without troubling ourselves with trying to load Package etc.
    base = __dirname;
    file = path.join(base, command + '.js');
    if (sh.test('-f', file)) {
        return file;
    }

    // If we're in a project but not initialized make sure they do that first.
    if (this.inProject()) {
        if (!CLI.getNpmPath()) {
            return CLI.notInitialized();
        }
    }

    roots = ['~app_cmd', '~lib_cmd'];
    len = roots.length;

    for (i = 0; i < len; i++) {
        base = this._package.expandPath(roots[i]);
        file = path.join(base, command + '.js');
        if (sh.test('-f', file)) {
            return file;
        }
    }
};


/**
 * Returns a sorted list of known command names from the application and library
 * command locations.
 * @returns {Array.<string>} An array of command names.
 */
CLI.getCommands = function() {
    var base,
        roots,
        len,
        i,
        files;

    roots = ['~app_cmd', '~lib_src/tibet/cli', '~lib_cmd'];
    len = roots.length;
    files = [];

    for (i = 0; i < len; i++) {
        base = this._package.expandPath(roots[i]);
        if (sh.test('-d', base)) {
            files = files.concat(sh.find(base).filter(function(fname) {
                var name;

                if (sh.test('-d', fname)) {
                    return false;
                }

                name = path.basename(fname, '.js');
                if (name.charAt(0) === '_') {
                    return false;
                }

                return true;
            }));
        }
    }

    files = files.map(function(fname) {
        return path.basename(fname, '.js');
    });

    return files.sort();
};


/**
 * Returns the targets exported from any makefile in the application. If
 * the makefile file isn't loaded yet this call will attempt to load it.
 * @returns {Array.<String>} The list of available make target names.
 */
CLI.getMakeTargets = function() {
    var Make;

    Make = require('./make');
    Make.initialize();

    return Make.getTargetNames();
};


/**
 * Returns a reference to the current package instance which handles information
 * like configuration properties etc.
 * @returns {Package} The receiver's package instance.
 */
CLI.getPackage = function() {
    return this._package;
};


/**
 * Returns the name of the current project as defined in the Package.NPM_FILE.
 * @returns {String} The project name.
 */
CLI.getProjectName = function() {
    return this.config.npm.name;
};


/**
 * Returns a virtual path version of a particular path.
 * @param {String} aPath The path to be virtualized.
 * @returns {string} The virtual version of the path.
 */
CLI.getVirtualPath = function(aPath) {
    return this._package.getVirtualPath(aPath);
};


/**
 * Checks the known list of TIBET makefile targets for a specific target.
 * @param {string} target The target name to search for.
 * @returns {boolean} True if the target is found.
 */
CLI.hasMakeTarget = function(target) {
    var Make;

    Make = require('./make');
    Make.initialize();

    return Make.hasTarget(target);
};


/**
 * Returns a default value if a particular value is undefined, else returns the
 * original value. Useful for defaulting optional parameters.
 * @param {Object} suspectValue The value to test.
 * @param {Object} defaultValue The value to default to when suspect is undef.
 * @returns {Object} The suspect or default value.
 */
CLI.ifUndefined = function(suspectValue, defaultValue) {

    if (suspectValue === undefined) {
        return defaultValue;
    }

    return suspectValue;
};

/**
 * Returns true if the project appears to be using git.
 * @returns {Boolean} true if a CLI.GIT_FILE and git executable are found.
 */
CLI.inGitProject = function() {

    var cwd,        // Where are we being run?
        file;       // What file are we looking for?

    cwd = process.cwd();
    file = this.GIT_FILE;

    return sh.test('-f', path.join(cwd, file)) && sh.which('git');
};


/**
 * Returns true if the project appears to be using Grunt as a build tool.
 * @returns {Boolean} true if a CLI.GRUNT_FILE and Grunt binary are found.
 */
CLI.inGruntProject = function() {

    var cwd,        // Where are we being run?
        file;       // What file are we looking for?

    cwd = process.cwd();
    file = this.GRUNT_FILE;

    return sh.test('-f', path.join(cwd, file)) &&
        (sh.which('grunt') ||
         sh.test('-f', path.join(cwd, './node_modules/.bin/grunt')));
};


/**
 * Returns true if the project appears to be using Gulp as a build tool.
 * @returns {Boolean} true if a CLI.GULP_FILE and gulp binary are found.
 */
CLI.inGulpProject = function() {

    var cwd,        // Where are we being run?
        file;       // What file are we looking for?

    cwd = process.cwd();
    file = this.GULP_FILE;

    return sh.test('-f', path.join(cwd, file)) &&
        (sh.which('gulp') ||
        sh.test('-f', path.join(cwd, './node_modules/.bin/gulp')));
};


/**
 * Initializes the package instance we'll use for path resolution and package
 * processing.
 */
CLI.initPackage = function() {
    if (this._package) {
        return;
    }

    Package = require('../../../etc/common/tibet_package');
    this._package = new Package(this.options);

    this.config.tibet = this._package.getProjectConfig();
    this.config.tds = this._package.getServerConfig();
    this.config.npm = this._package.getPackageConfig();

    //  Set up options for creating a proper color instance.
    this.options.scheme = this.options.scheme || process.env.TIBET_CLI_SCHEME ||
        this._package.getcfg('cli.color.scheme') || 'ttychalk';
    this.options.theme = this.options.theme || process.env.TIBET_CLI_THEME ||
        this._package.getcfg('cli.color.theme') || 'default';
};


/**
 * Returns true if the command context is the TIBET library.
 * @param {Object} CmdType The command type currently being processed.
 * @returns {Boolean} True if the current context is inside the TIBET library.
 */
CLI.inLibrary = function(CmdType) {
    return this._package.inLibrary();
};


/**
 * Returns true if the command is currently being invoked from within a project
 * directory, false if it's being run outside of one. Some commands like 'start'
 * operate differently when they are invoked outside vs. inside of a project
 * directory. Some commands are only valid outside. Some are only valid inside.
 * @param {Object} CmdType The command type currently being processed.
 * @returns {Boolean} True if the current context is inside a TIBET project.
 */
CLI.inProject = function(CmdType) {
    var silent;

    silent = CmdType && CmdType.NAME === 'help';

    return this._package.inProject(silent);
};


/**
 * Returns true if the path provided appears to be an aboslute path. Note that
 * this will return true for TIBET virtual paths since they are absolute paths
 * when expanded.
 * @param {string} aPath The path to be tested.
 * @returns {Boolean} True if the path is absolute.
 */
CLI.isAbsolutePath = function(aPath) {
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


/**
 * Returns true if the current operation is happening in a project (inProject)
 * and that project has been initialized (has node_modules etc).
 * @returns {Boolean} True if the current context is in an initialized project.
 */
CLI.isInitialized = function() {
    if (!this.inProject()) {
        return false;
    }

    return this._package.isInitialized();
};


/**
 * Outputs a list of items, formatting them to indent and wrap properly.
 * @param {Array.<string>} aList The list of items to output.
 */
CLI.logItems = function(aList) {

    var limit,
        buffer,
        line,
        cmd;

    limit = this.CHARS_PER_LINE;

    buffer = '';
    if (aList && aList.length > 0) {
        line = '\t';
        /* eslint-disable no-extra-parens */
        while ((cmd = aList.shift())) {
            if (line.length + cmd.length > limit) {
                buffer += line + '\n';
                line = '\t';
            }
            line += cmd + ' ';
        }
        /* eslint-enable no-extra-parens */
        buffer += line;
    }

    this.info(buffer);
};


/**
 * Returns a new String representing the obj with a leading number of padChar
 * characters according to the supplied length.
 * @param {Object} obj The object to format with leading characters.
 * @param {Number} length The number of characters to pad the String
 *     representation with.
 * @param {String} padChar The pad character to use to pad the String
 *     representation.
 * @returns {String}
 */
CLI.lpad = function(obj, length, padChar) {

    var str,
        pad;

    str = '' + obj;
    pad = padChar || ' ';

    while (str.length < length) {
        str = pad + str;
    }

    return str;
};


/**
 * Outputs a standard error message and exits. This function is typically called
 * by commands that require project initialization to run properly.
 */
CLI.notInitialized = function() {
    this.error('Project may not be initialized. Run `tibet init` and retry.');
    process.exit(1);
};


/**
 * A common prompting interface accessible via CLI.prompt or Cmd.prompt. (See
 * _cmd.js for the mapping).
 */
CLI.prompt = prompt;


/**
 * Returns the receiver as a quoted string with embedded quotes
 * escaped. The default quote character is a single quote in keeping
 * with TIBET coding standards which use single quoted strings for
 * JavaScript and double quoted strings for *ML.
 * @param {String} aString The string to be quoted.
 * @param {String} aQuoteChar A quoting character to use. Default is "'"
 *     (single quote/apostrophe).
 * @returns {String} The string as a quoted string.
 */
CLI.quoted = function(aString, aQuoteChar) {
    var quote,
        re,
        str;

    quote = aQuoteChar || '\'';
    re = new RegExp(quote, 'g');

    //  presume if we're quoted we're already ok (and we're not a single
    //  character length)

    //  if we're quoted already (make sure to check we're not a 1 character
    //  String), we're already ok.
    if (aString.charAt(0) === quote &&
        aString.charAt(aString.length - 1) === quote &&
        this.length > 1) {
        //  already quoted :)
        return aString;
    }

    //  Escape any JavaScript 'code constructs' (i.e. newlines, returns, tab
    //  characters, etc.)
    str = CLI.escapeWhitespace(aString);

    //  now we can escape any quotes that are left and put on our outer
    //  quotation marks
    str = str.replace(re, '\\' + quote);

    return quote + str + quote;
};


/**
 * Returns a new String representing the obj with a trailing number of padChar
 * characters according to the supplied length.
 * @param {Object} obj The object to format with trailing characters.
 * @param {Number} length The number of characters to pad the String
 *     representation with.
 * @param {String} padChar The pad character to use to pad the String
 *     representation.
 * @returns {String}
 */
CLI.rpad = function(obj, length, padChar) {

    var str,
        pad;

    str = '' + obj;
    pad = padChar || ' ';

    while (str.length < length) {
        str = str + pad;
    }

    return str;
};


/**
 * Sets a configuration value. Leverages the logic in a TIBET Package object for
 * the processing of TIBET configuration data.
 * @param {String|Object} property A specific property name to be updated.
 * @param {Object} [value] A specific property value to set.
 */
CLI.setcfg = function(property, value) {
    return this._package.setcfg(property, value);
};


/**
 * Parses a string and attempts to produce a workable regular expression which
 * would match that string. This is primarily used to take input parameters of
 * the form /foo/gi etc. (Javascript source code format) and produce RegExp's.
 * @param {String} aString The input string to produce a regex from.
 * @returns {RegExp} The matching regular expression, if one can be built.
 */
CLI.stringAsRegExp = function(aString) {
    var escape,
        str,
        fallback,
        attrs,
        tail;

    escape = /([-[\]{}(\/)*+?.\\^$|,#\s]{1})/g;

    str = CLI.unquote(aString);
    if (str.charAt(0) !== '/' || str.lastIndexOf('/') === 0) {
        try {
            return new RegExp(str.replace(escape, '\\$1'));
        } catch (e) {
            return;
        }
    }

    attrs = '';
    tail = str.slice(str.lastIndexOf('/') + 1);
    if (CLI.notEmpty(tail)) {
        attrs += tail;
    }
    fallback = str;
    str = str.slice(1, str.lastIndexOf('/'));

    try {
        return new RegExp(str.replace(escape, '\\$1'), attrs);
    } catch (e) {
        return new RegExp(fallback.replace(escape, '\\$1'));
    }
};


/**
 * Returns the input string with any single or double quotes removed. This is
 * often used to get the true string value of a quoted parameter.
 * @param {String} aString The string to unquote.
 * @returns {String} The unquoted string.
 */
CLI.unquote = function(aString) {
    var str;

    str = '' + aString;

    if (str.charAt(0) === '"' && str.charAt(str.length - 1) === '"') {
        str = str.slice(1, -1);

        return str.replace(/\\"/g, '"');
    }

    if (str.charAt(0) === '\'' && str.charAt(str.length - 1) === '\'') {
        str = str.slice(1, -1);

        return str.replace(/\\'/g, '\'');
    }

    return str;
};

//  ---
//  Command Execution
//  ---

/**
 * Performs standard error handling for catch blocks to avoid duplication of
 * processing for empty messages, stack inclusion, etc.
 * @param {Error} e The error object.
 * @param {string} phase The phase of command processing.
 * @param {string} command The command that failed.
 * @param {Boolean} exit Set to false to avoid exiting the process.
 */
CLI.handleError = function(e, phase, command, exit) {
    var msg,
        str;

    try {

        msg = e.message || '';

        // Some downstream throw calls are empty so they can do their own
        // messaging but still convey they failed. Skip messaging in those cases
        // unless we're also asked to dump the stack.
        if (this.options.stack) {
            msg += ' ' + e.stack;
        } else if (!msg) {
            return 1;
        }

        // Try to avoid Error... Error... messages being built up.
        if (!/^Error/i.test(msg)) {
            str = 'Error';
            str += ' ' + (phase ? phase : 'running');
            str += ' ' + (command ? command : 'command');
            str += ': ' + msg;
            msg = str;
        }

        this.error(msg);

    } finally {
        if (exit !== false) {
            process.exit(1);
        }
    }
};


/**
 * Executes the current command line, parsing the command line and invoking the
 * appropriate command in response. Command instances are invoked via their
 * `execute` method. See the _cmd.js documentation for more detail.
 * @param {Object} config An object containing context/config information.
 */
CLI.run = function(config) {

    var cfg,
        command,        // the first non-option argument, the command name.
        cmdPath;        // the command path (for use with require())

    //  Need to do a cautious merge here. The initPackage data should be in
    //  this.config when we invoke run. We don't want to lose it. We want to
    //  treat it like defaults that could be overwritten by things in config.
    cfg = config || {};
    this.config = this.config || {};
    this.config = CLI.blend(this.config, cfg);

    //  ---
    //  Process the command-line arguments to find the command name.
    //  ---

    // Slice 2 here to remove 'node tibet' from the front. Also ensure that our
    // binary (boolean) flags are identified as such to avoid parsing glitches.
    this.options = minimist(process.argv.slice(2),
        this.PARSE_OPTIONS) || {_: []};

    if (this.options.initpath) {
        /* eslint-disable no-console */
        console.log(
            path.join(__dirname,
                '..', '..', '..',
                'bin', 'tibetinit.sh'));
        /* eslint-enable no-console */
        process.exit(0);
    }

    //  Get color instance configured to support colorizing.
    Color = require('../../../etc/common/tibet_color');
    this.color = new Color(this.options);
    this.colorize = this.color.colorize.bind(this.color);

    Logger = require('../../../etc/common/tibet_logger');
    this.logger = new Logger(this.options);

    if (this.options.completion) {
        this.runComplete();
        return;
    }

    command = this.options._[0];
    if (!command) {
        // Empty commands often indicate a --flag of some kind on the tibet
        // command itself. Check for the ones we support here.
        // NB: don't change these to value tests, we just want existence.
        if (this.options.version) {
            command = 'version';
        } else if (this.options.initpath) {
            this.log(
                path.join(__dirname,
                    '..', '..', '..',
                    'bin', 'tibetinit.sh'),
                'no-color');    //  NOTE we turn off any colorizing since this
                                //  is often invoked by the shell autocomplete
                                //  configuration scripts which parse output.
            process.exit(0);
        } else {
            this.runHelp('tibet');
            return;
        }
    }

    // Don't run commands that are prefixed, they're considered 'cli internals'.
    if (command.charAt(0) === '_' && !this.options.force) {
        this.error('Cannot directly run private command: ' + command);
        process.exit(1);
    }

    //  ---
    //  Help check
    //  ---

    if (this.options.help) {
        return this.runHelp(command);
    }

    //  ---
    //  Verify the command is valid.
    //  ---

    // Search app_cmd, lib_cmd_ etc. for the command implementation.
    cmdPath = this.getCommandPath(command);

    // Not a 'native TIBET command' so try handling via fallback logic.
    if (!cmdPath) {
        return this.runFallback(command);
    }

    return this.runCommand(command, cmdPath);
};


/**
 * Executes a named command which should be found at cmdPath. Command instances
 * are invoked via their `execute` method. See the _cmd.js documentation for
 * more detail. In some cases the command can be passed as a command line (as
 * with runViaMake). In that case the argv parsed is the one created by
 * splitting the command string to remove the initial command rather than
 * process.argv.
 * @param {string} command The command name and optional arguments.
 * @param {string} cmdPath The path used to require the command implementation.
 */
CLI.runCommand = function(command, cmdPath) {

    var CmdType,
        cmd,
        msg,
        parts,
        argv,
        result;

    // Load the command type
    try {
        CmdType = require(cmdPath);
    } catch (e) {
        this.debug('cmdPath: ' + cmdPath);
        return this.handleError(e, 'loading', command);
    }

    // Initialize the type if it has an initializer.
    if (typeof CmdType.initialize === 'function') {
        try {
            CmdType.initialize();
        } catch (e) {
            return this.handleError(e, 'initializing', command);
        }
    }

    // Instantiate the command instance. Note no arguments here.
    try {
        cmd = new CmdType();
    } catch (e) {
        return this.handleError(e, 'instantiating', command);
    }

    parts = command.split(' ');
    if (parts.length > 1) {
        argv = parts.slice(1);
    } else {
        argv = process.argv.slice(2);
    }

    this.options = minimist(argv,
        cmd.PARSE_OPTIONS) || {_: []};

    //  Parse/reparse as available. This lets commands like make etc. ensure
    //  they got all arguments on the command line parsed properly.
    if (typeof cmd.reparse === 'function') {
        cmd.reparse(this.options);
    }

    // If we're not dumping help or usage check context. We can't really run to
    // completion if we're not in the right context.
    if (!this.options.usage && !this.options.help) {
        if (!this.canRun(CmdType)) {
            switch (CmdType.CONTEXT) {
                case CLI.CONTEXTS.PROJECT:
                    msg = 'in a TIBET project.';
                    break;
                case CLI.CONTEXTS.LIBRARY:
                    msg = 'in the TIBET library.';
                    break;
                case CLI.CONTEXTS.INSIDE:
                    msg = 'in a TIBET project or within the TIBET library.';
                    break;
                case CLI.CONTEXTS.OUTSIDE:
                    msg = 'outside a TIBET project or the TIBET library.';
                    break;
                default:
                    msg = 'in a different context.';
                    break;
            }
            this.error('Command must be run ' + msg);
            return 1;
        }
    }

    //  Dispatch the command. It will parse the command
    //  line again itself so it can be certain of flag values.
    try {
        result = cmd.run(argv);
        if (typeof result === 'number') {
            if (result !== 0) {
                /* eslint-disable no-process-exit */
                process.exit(result);
                /* eslint-enable no-process-exit */
            }
        // } else {
        // TODO:    reactivate this after reviewing all commands/promises.
            // this.warn(command + ' returned non-numeric status value');
        }
    } catch (e) {
        return this.handleError(e, 'processing', command);
    }
};


/**
 * Processes potential autocompletion matches and logs a list of options to
 * display in the Bash or Zsh shells.
 */
CLI.runComplete = function() {
    var words,
        word,
        prev,
        targets,
        list;

    list = [];

    targets = this.getMakeTargets() || [];
    list = this.getCommands();
    list = list.concat(targets.filter(function(name) {
        return name.charAt(0) !== '_';
    }));

    words = this.options._[0].split(' ');
    if (words[0] === 'tibet') {
        words = words.slice(1);
    }

    if (words.length < 2) {
        prev = '';
        word = words[words.length - 1];
    } else {
        prev = words[words.length - 2];
        word = words[words.length - 1];
    }

    if (!prev) {

        //  First potential 'command' so match all options.
        list = list.filter(function(item) {
            return item.indexOf(word) === 0;
        });

        if (list.length === 1) {
            //  only one match
            list = ['onematch', list[0]];
        }

    } else {

        if (CLI.notEmpty(this.getCommandPath(prev))) {

            //  Real command. We can load it and ask for options.
            list = this.getCommandOptions(prev);

        } else if (this.hasMakeTarget(prev)) {

            //  Make target. No additional help from target. Just standard
            //  options from the make command.
            list = this.getCommandOptions('make');

        } else {
            //  Not a command or make target...oops.
            list = [];
        }
    }

    this.log(list.join('\n'));

    process.exit(0);
};


/**
 * Runs a series of checks for fallback options from 'make' to grunt to
 * gulp (in that order).
 * @param {string} command The command to attempt to execute.
 */
CLI.runFallback = function(command) {

    if (!this.inProject() && !this.inLibrary()) {
        this.error('Command not found: ' + command + '.');
        process.exit(1);
    }

    // If there's no node_modules in place (and hence no tibet, grunt, or gulp
    // that are local) suggest they run `tibet init` first.
    if (!CLI.getNpmPath()) {
        this.notInitialized();
        return;
    }

    // Make option is our first choice for non-command operations.
    if (this.hasMakeTarget(command)) {
        this.warn('Delegating to \'tibet make ' + command + '\'');
        return this.runViaMake(command);
    }

    // If we find both a grunt executable and a gruntfile we can try grunt.
    if (this.inGruntProject(command)) {
        this.warn('Attempting \'grunt ' + command + '\'');
        return this.runViaGrunt(command);
    }

    // If we find both a gulp executable and a gulpfile we can try gulp.
    if (this.inGulpProject()) {
        this.warn('Attempting \'gulp ' + command + '\'');
        return this.runViaGulp(command);
    }

    this.error('Command not found: ' + command + '.');
    process.exit(1);
};


/**
 * Executes the help command with the topic provided.
 * @param {string} topic The help topic to display, if available.
 */
CLI.runHelp = function(topic) {
    return this.runCommand('help', path.join(__dirname, 'help.js'));
};


/**
 * Executes a command by delegating to 'grunt' and treating the command name as
 * a grunt task name.
 * @param {string} command The command to attempt to execute.
 */
CLI.runViaGrunt = function(command) {

    var cmd,        // Binding reference.
        str,        // Command string we'll be executing via grunt.
        child;      // spawned child process for grunt execution.

    cmd = this;

    str = process.argv.slice(2).join(' ');
    this.debug('running: ' + str);

    child = require('child_process').spawn('grunt',
        process.argv.slice(2),
        {cwd: this.getAppHead()}
    );

    child.stdout.on('data', function(data) {
        var msg;

        msg = '' + data;
        cmd.log(msg);
    });

    child.stderr.on('data', function(data) {
        var msg;

        msg = '' + data;
        cmd.error(msg);
    });

    child.on('error', function(err) {
        cmd.error('' + err.message);
    });

    child.on('exit', function(code) {
        process.exit(code);
    });

    return;
};


/**
 * Executes a command by delegating to 'gulp' and treating the command name as
 * a gulp task name.
 * @param {string} command The command to attempt to execute.
 */
CLI.runViaGulp = function(command) {

    var cmd,        // Binding reference.
        str,        // Command string we'll be executing via gulp.
        child;      // spawned child process for gulp execution.

    cmd = this;

    str = process.argv.slice(2).join(' ');
    this.debug('running: ' + str);

    child = require('child_process').spawn('gulp',
        process.argv.slice(2),
        {cwd: cmd.getAppHead()}
    );

    child.stdout.on('data', function(data) {
        var msg;

        msg = '' + data;
        cmd.log(msg);
    });

    child.stderr.on('data', function(data) {
        var msg;

        msg = '' + data;
        cmd.error(msg);
    });

    child.on('error', function(err) {
        cmd.error('' + err.message);
    });

    child.on('exit', function(code) {
        process.exit(code);
    });

    return;
};


/**
 * Executes a command by delegating to `tibet make` and executing the command as
 * a make target.
 * @param {string} command The command to attempt to execute.
 */
CLI.runViaMake = function(command) {
    var args;

    // Delegate to the same runCommand used for all other common commands. Note
    // that the only difference to the `make` command is that it won't be able
    // to parse quite the same command line from process.argv. Note we use the
    // command provided and essentially slice off node, tibet, and the original
    // command name here to allow for redispatch.
    args = process.argv.slice(3);
    this.runCommand('make ' + command + (args ? ' ' + args.join(' ') : ''),
        path.join(__dirname, 'make.js'));
};


try {
    CLI.initPackage();
} catch (e) {
    /* eslint-disable no-console */
    console.error(e.message);
    /* eslint-enable no-console */
}

module.exports = CLI;

}());
