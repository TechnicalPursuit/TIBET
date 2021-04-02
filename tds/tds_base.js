/**
 * @overview Common functionality used by the TIBET Data Server and middleware.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/* eslint no-console:0, consistent-this:0 */

(function(root) {

    'use strict';

    var beautify,
        crypto,
        cors,
        handlebars,
        couch,
        winston,
        triplebeam,
        logFormats,
        logTransports,
        ip,
        Package,
        Color,
        Promise,
        hasAnsi,
        sh,
        TDS;

    beautify = require('js-beautify');
    triplebeam = require('triple-beam');
    cors = require('cors');
    handlebars = require('handlebars');
    Promise = require('bluebird');
    sh = require('shelljs');
    winston = require('winston');
    logFormats = winston.format;
    logTransports = winston.transports;
    ip = require('ip');

    // Load the package support to help with option/configuration data.
    Package = require('../etc/common/tibet_package');

    //  CouchDB utilities for couch and task processing.
    couch = require('../etc/helpers/couch_helpers.js');

    //  Utilities for common encrypt/decrypt logic in TDS and CLI.
    crypto = require('../etc/helpers/crypto_helpers.js');

    // Load color utilities for colorizing log messages etc.
    Color = require('../etc/common/tibet_color');
    hasAnsi = require('has-ansi');

    //  ---
    //  TIBET Data Server Root
    //  ---

    TDS = {};

    /**
     * The TIBET logo in ASCII-art form.
     * @type {String}
     */
    /* eslint-disable quotes */
    TDS.logo = "\n" +
        "                            ,`\n" +
        "                     __,~//`\n" +
        "  ,///,_       .~///////'`\n" +
        "      '//,   ///'`\n" +
        "         '/_/'\n" +
        "           `\n" +
        "   /////////////////     /////////////// ///\n" +
        "   `//'````````///      `//'```````````  '''\n" +
        "   ,/`          //      ,/'\n" +
        "  ,/___          /'    ,/_____\n" +
        " ///////;;,_     //   ,/////////;,_\n" +
        "          `'//,  '/            `'///,_\n" +
        "              `'/,/                '//,\n" +
        "                 `/,                  `/,\n" +
        "                   '                   `/\n" +
        "                                        '/\n" +
        "                                         /\n" +
        "                                         '\n";
    /* eslint-enable: quotes, no-multi-str */

    /**
     * Command line parsing options for the minimist module to use. These are
     * typically referenced in the server.js file for a project using the TDS.
     * @type {Object} A dictionary of command line argument options.
     */
    /* eslint-disable quote-props */
    TDS.PARSE_OPTIONS = {
        'boolean': ['color', 'debug', 'https', 'no-color'],
        'string': ['level'],
        'number': ['port', 'https_port'],
        'default': {
            color: true
        }
    };
    /* eslint-enable quote-props */

    /**
     * A temporary buffer used during early startup to buffer log messages.
     * @type {Array}
     */
    TDS._buffer = [];

    /**
     * Dictionary of currently active connections. Used to manage graceful
     * shutdown processing.
     * @type {Object}
     */
    TDS._connections = {};

    /**
     * The package instance assisting with configuration data loading/lookup.
     * @type {Package} A TIBET CLI package instance.
     */
    TDS._package = null;

    /**
     * A list of functions to run via the poststart processing hook.
     * @type {Array}
     */
    TDS._prologs = [];

    /**
     * A list of functions to run during TDS.shutdown operation.
     * @type {Array}
     */
    TDS._shutdownHooks = [];

    /**
     * A handle to the couch module for use by couch-related consumers.
     * @type {Object};
     */
    TDS.couch = couch;

    /**
     * A flag for whether this instance has a console level logger.
     * @type {Boolean}
     */
    TDS.$$hasConsole = null;

    /**
     * List of logging levels keyed by logging constant string. Used to look up
     * logging level value for output.
     * @type {Object}
     */
    TDS.levels = {
        all: 0,
        trace: 1,
        debug: 2,
        info: 3,
        warn: 4,
        error: 5,
        fatal: 6,
        system: 7,
        off: 8
    };

    /**
     * A handle to the bluebird Promise module for use in tasks/routes.
     * @type {Object}
     */
    TDS.Promise = Promise;

    /**
     * A common handle to the shelljs library for use in tasks/routes.
     * @type {Object}
     */
    TDS.shell = sh;

    /**
     * A common handle to the handlebars library for templating.
     * @type {Object}
     */
    TDS.template = handlebars;

    /*
     * Register a handlebars-style helper for outputting content in JSON format.
     * This is useful for debugging templates in particular.
     */
    TDS.template.registerHelper('json', function(context) {
        return JSON.stringify(context);
    });

    //  ---
    //  State checks
    //  ---

    TDS.ifDebug = function() {
        var level;

        //  If we can't tell we can't filter since we may be turning off logs.
        if (!TDS.logger) {
            return true;
        }

        level = TDS.cfg('tds.log.level').toLowerCase();

        return TDS.levels[level] <= TDS.levels.debug;
    };

    //  ---

    TDS.ifDev = function() {
        return TDS.getEnv() === 'development';
    };

    //  ---

    TDS.ifDryrun = function() {
        return TDS.cfg('tds.tws.dryrun') === true;
    };

    //  ---

    TDS.ifTrace = function() {
        var level;

        //  If we can't tell we can't filter since we may be turning off logs.
        if (!TDS.logger) {
            return true;
        }

        level = TDS.cfg('tds.log.level').toLowerCase();

        return TDS.levels[level] <= TDS.levels.trace;
    };

    //  ---
    //  Value checks
    //  ---

    TDS.isEmpty = function(aReference) {
        /* eslint-disable no-extra-parens */
        return aReference === null ||
            aReference === undefined ||
            aReference.length === 0 ||
            (typeof aReference === 'object' &&
            Object.keys(aReference).length === 0);
        /* eslint-enable no-extra-parens */
    };

    TDS.isFalse = function(aReference) {
        return aReference === false;
    };

    /**
     * Returns true if the object provided is an 'Object' as opposed to a
     * string, number, boolean, RegExp, Array, etc. In essense a check for
     * whether it's a hash of keys.
     * @param {Object} obj The object to test.
     * @returns {Boolean} True if the object is an Object.
     */
    TDS.isObject = function(obj) {
        return typeof obj === 'object' &&
            Object.prototype.toString.call(obj) === '[object Object]';
    };

    TDS.isTrue = function(aReference) {
        return aReference === true;
    };

    TDS.isValid = function(aReference) {
        return aReference !== null && aReference !== undefined;
    };

    TDS.notEmpty = function(aReference) {
        return aReference !== null && aReference !== undefined &&
            aReference.length !== 0;
    };

    TDS.notValid = function(aReference) {
        return aReference === null || aReference === undefined;
    };

    //  ---
    //  Core Utilities
    //  ---

    /**
     * Traverses an object path in dot-separated form. Either returns the value
     * found at that path or undefined. This routine helps avoid logic that has
     * to test each step in a path for common JSON request or parameter lookups.
     * @param {Object} obj The object whose properties should be traversed.
     * @param {String} objpath The dot-separated path to traverse.
     * @returns {Object} The value found at the end of the path.
     */
    TDS.access = function(obj, objpath) {
        var steps,
            target,
            i,
            len;

        if (TDS.notValid(obj)) {
            return;
        }

        if (TDS.isEmpty(objpath)) {
            return;
        }

        target = obj;

        steps = '' + objpath.split('.');
        len = steps.length;

        for (i = 0; i < len; i++) {
            if (TDS.isValid(target[steps[i]])) {
                target = target[steps[i]];
            } else {
                return;
            }
        }

        return target;
    };

    /**
     * Traverses an object, executing the supplied Functions at the appropriate
     * time, based on whether it is processing a 'branch' (i.e. a position in
     * the object that is holding another Object) or a 'leaf' (i.e. a position
     * in the object that is holding a non-Object).
     * @param {Object} obj The object whose properties should be traversed.
     * @param {Function} branchPreFunc The function that will be executed before
     * a 'branch' is traversed.
     * @param {Function} leafFunc The function that will be executed when a
     * 'leaf' is being processed.
     * @param {Function} branchPostFunc The function that will be executed after
     * a 'branch' is traversed.
     */
    TDS.performDrill = function(obj, branchPreFunc, leafFunc, branchPostFunc) {
        var traverse;

        if (TDS.notValid(obj)) {
            return;
        }

        if (TDS.notValid(branchPreFunc)) {
            return;
        }

        if (TDS.notValid(branchPostFunc)) {
            return;
        }

        if (TDS.notValid(leafFunc)) {
            return;
        }

        traverse = function(anObj) {
            var keys;

            keys = Object.keys(anObj);
            keys.forEach(
                function(aKey) {
                    if (TDS.isObject(anObj[aKey])) {
                        branchPreFunc(anObj, aKey);
                        traverse(anObj[aKey]);
                        branchPostFunc(anObj, aKey);
                    } else {
                        leafFunc(anObj, aKey);
                    }
                });
        };

        traverse(obj);
    };

    /**
     * Registers a function to be run during TDS.shutdown processing. Normally
     * used to close open connections etc.
     * @param {Function} hook A function taking the TDS instance as its only
     *     parameter.
     */
    TDS.addShutdownHook = function(hook) {
        TDS._shutdownHooks.push(hook);
    };

    /**
     * Writes the server announcement string and logo to the console.
     * @param {String} env The environment (development, production, etc).
     */
    TDS.announceTIBET = function(env) {
        var version;

        process.stdout.write(TDS.colorize(TDS.logo, 'logo'));

        //  Produce an initial announcement string with the current version/env.
        //  NOTE we build this one by hand since the logger won't be active when
        //  this message is normally being output.
        version = TDS.cfg('tibet.version') || '';
        process.stdout.write(
            TDS.colorize(Date.now(), 'stamp') +
            TDS.colorize(' [' +
                TDS.levels.system +
                '] ', 'system') +
            TDS.colorize('TDS ', 'tds') +
            TDS.colorize('TIBET Data Server ', 'version') +
            TDS.colorize(version ? version + ' ' : '', 'version') +
            TDS.colorize('(', 'dim') +
            TDS.colorize(env, 'env') +
            TDS.colorize(')', 'dim'));
    };

    /**
     * Writes the project startup announcement to the console.
     * @param {Logger} logger The logger instance to use for output.
     * @param {String} protocol The HTTP or HTTPS protocol the server is using.
     * @param {Number} port The port number the server is listening on.
     * @param {String} [env] Optional environment hint from invoking call.
     */
    TDS.announceStart = function(logger, protocol, port, env) {
        var project,

            allNodeIPs,
            v4NodeIPs,
            host,

            msg,

            builddir,
            artifacts,

            buildmsg,
            buildstr,
            lamastr,
            nonlamastr;

        project = TDS.colorize(TDS.cfg('npm.name') || '', 'project');
        project += ' ' + TDS.colorize(
                            TDS.cfg('npm.version') || '0.0.1', 'version');

        //  Determine the IP address (or hostname) to output for the server.
        host = TDS.cfg('tds.host');
        if (!host) {
            allNodeIPs = TDS.getNodeIPs();
            v4NodeIPs = allNodeIPs.filter(
                            function(anAddr) {
                                return ip.isV4Format(anAddr);
                            });
            host = v4NodeIPs[0];
        }
        if (!host) {
            host = '127.0.0.1';
        }

        //  First output the 'default' or 'prod' or 'build' version which
        //  should be the one all projects default to without any '@'
        //  parameters....but only if we see build artifacts.
        builddir = TDS.expandPath('~app_build');
        if (sh.test('-d', builddir)) {
            artifacts = sh.ls(builddir);
        } else {
            artifacts = [];
        }

        buildmsg = TDS.colorize('Project not built.' +
                    ' Run `tibet build --minify` for production url: ',
                                                                'warn') +
                    TDS.colorize(protocol + '://' + host +
                        (port === 80 ? '' : ':' + port), 'host');

        buildstr = project +
                    TDS.colorize(' @ ', 'dim') +
                    TDS.colorize(protocol + '://' + host +
                        (port === 80 ? '' : ':' + port), 'host') +
                    TDS.colorize(' (production build)', 'dim');

        lamastr = project +
                    TDS.colorize(' @ ', 'dim') +
                    TDS.colorize(protocol + '://' + host +
                        (port === 80 ? '' : ':' + port +
                         '#?boot.profile=development@developer'),
                        'host');

        nonlamastr = project +
                    TDS.colorize(' @ ', 'dim') +
                    TDS.colorize(protocol + '://' + host +
                        (port === 80 ? '' : ':' + port +
                         '#?boot.profile=development'),
                        'host');

        if (TDS.getEnv(env) !== 'development') {
            if (artifacts.length > 0) {
                //  Output a production link.
                msg = buildstr;

                logger.system(msg,
                    {
                        comp: 'TDS',
                        type: 'tds',
                        name: 'build'
                    });

                if (!TDS.hasConsole()) {
                    process.stdout.write(msg);
                }
            }
        } else if (TDS.getcfg('lama.enabled')) {
            //  And a lama-enabled link for those who want to run the lama.
            msg = lamastr;

            logger.system(msg,
                {
                    comp: 'TDS',
                    type: 'tds',
                    name: 'lama'
                });

            if (!TDS.hasConsole()) {
                process.stdout.write(msg);
            }

            if (artifacts.length > 0) {
                //  Output a production link.
                msg = buildstr;

                logger.system(msg,
                    {
                        comp: 'TDS',
                        type: 'tds',
                        name: 'build'
                    });

                if (!TDS.hasConsole()) {
                    process.stdout.write(msg);
                }
            } else {
                //  Output a message telling the user how to build.
                msg = buildmsg;

                logger.warn(msg,
                    {
                        comp: 'TDS',
                        type: 'tds',
                        name: 'build'
                    });

                if (!TDS.hasConsole()) {
                    process.stdout.write(msg);
                }
            }
        } else {
            //  Output a development link for non-lama operation ala the basic
            //  quickstart/essentials guide approach to development.
            msg = nonlamastr;

            logger.system(msg,
                {
                    comp: 'TDS',
                    type: 'tds',
                    name: 'dev'
                });

            if (!TDS.hasConsole()) {
                process.stdout.write(msg);
            }

            if (artifacts.length > 0) {
                //  Output a production link.
                msg = buildstr;

                logger.system(msg,
                    {
                        comp: 'TDS',
                        type: 'tds',
                        name: 'build'
                    });

                if (!TDS.hasConsole()) {
                    process.stdout.write(msg);
                }
            } else {
                //  Output a message telling the user how to build.
                msg = buildmsg;

                logger.warn(msg,
                    {
                        comp: 'TDS',
                        type: 'tds',
                        name: 'build'
                    });

                if (!TDS.hasConsole()) {
                    process.stdout.write(msg);
                }
            }
        }
    };

    /**
     * A common handle to the js-beautify routine for pretty-printing JSON to
     * the console or via the logger.
     * @param {Object|String} obj The object or string to beautify.
     * @returns {String} The beautified string.
     */
    TDS.beautify = function(obj) {
        var str;

        if (TDS.notValid(obj)) {
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
     * A useful variation on extend from other libs sufficient for parameter
     * block copies. The objects passed are expected to be simple JavaScript
     * objects. No checking is done to support more complex cases. Slots in the
     * target are only overwritten if they don't already exist. Only slots owned
     * by the source will be copied. Arrays are treated with some limited deep
     * copy semantics as well.
     * @param {Object} target The object which will potentially be modified.
     * @param {Object} source The object which provides new property values.
     * @returns {Object} The blended object.
     */
    TDS.blend = function(target, source) {

        if (!TDS.isValid(source)) {
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

        if (TDS.isValid(target)) {
            //  Target is primitive value. Don't replace.
            if (!TDS.isObject(target)) {
                return target;
            }

            //  Target is complex object, but source isn't.
            if (!TDS.isObject(source)) {
                return target;
            }
        } else {
            // Target not valid, source should overlay.
            return JSON.parse(JSON.stringify(source));
        }

        Object.keys(source).forEach(function(key) {
            if (key in target) {
                if (TDS.isObject(target[key])) {
                    TDS.blend(target[key], source[key]);
                } else if (Array.isArray(target[key])) {
                    TDS.blend(target[key], source[key]);
                }
                return;
            }

            //  Key isn't in target, build it out with source copy.
            if (Array.isArray(source[key])) {
                // Copy array/object slots deeply as needed.
                target[key] = TDS.blend([], source[key]);
            } else if (TDS.isObject(source[key])) {
                // Deeply copy other non-primitive objects.
                target[key] = TDS.blend({}, source[key]);
            } else {
                target[key] = source[key];
            }
        });

        return target;
    };

    /**
     * Provides a common handle to the 'cors' module for use in defining CORS
     * access for one or more routes.
     * @param {Object} [options] An object providing options to the 'cors'
     *     module. @see https://github.com/expressjs/cors for more info.
     * @returns {Object} The cors module result.
     */
    TDS.cors = function(options) {
        return cors(options);
    };

    /**
     * Helper to remove color codes that may have snuck in to output.
     * @param {String} data The string to strip color codes from.
     * @returns {String} The decolorized string.
     */
    TDS.decolorize = function(data) {
        var dat;

        dat = '' + data;

        /* eslint-disable no-control-regex */
        return dat.replace(
            /\u001b\[38;5;\d*m/g, '').replace(
            /\\u001b\[38;5;\d*m/g, '').replace(
            /\u001b\[\d*m/g, '').replace(
            /\\u001b\[\d*m/g, '');
        /* eslint-enable no-control-regex */
    };

    /**
     * Decrypts a block of text. The algoritm and encryption key are read from
     * the environment and if not found an exception is raised. NOTE that the
     * CLI must be configured to use the same parameters or operation may fail.
     * @param {String} text The text to encrypt.
     * @returns {String} The decrypted string.
     */
    TDS.decrypt = function(text) {
        return crypto.decrypt(text, this);
    };

    /**
     * Encrypts a block of text. The algorithm and encryption key are read from
     * the environment and if not found an exception is raised. NOTE that the
     * CLI must be configured to use the same parameters or operation may fail.
     * @param {String} text The text to encrypt.
     * @param {Buffer} [salt] Optional salt used when encrypting to determine a
     *     match with a prior encrypted value.
     * @returns {String} The encrypted string.
     */
    TDS.encrypt = function(text, salt) {
        return crypto.encrypt(text, salt, this);
    };

    /**
     * Escapes any RegExp metacharacters contained in the supplied String.
     * @param {String} str The string that contains the regexp.
     * @returns {String} The regexp string with all RegExp metacharacters
     *     escaped such that this string can be used to build a RegExp.
     */
    TDS.escapeRegExp = function(str) {
        var REGEX_DETECT_META_CHARS;

        REGEX_DETECT_META_CHARS = /([-[\]{}(\/)*+?.\\^$|,#\s]{1})/g;

        //  Replace any *unescaped* RegExp meta characters with an escaping
        //  backslash and that character.
        return str.replace(REGEX_DETECT_META_CHARS, '\\$1');
    };

    /**
     * Expands virtual paths using configuration data loaded from TIBET.
     * @param {String} aPath The virtual path to expand.
     * @returns {String} The expanded path.
     */
    TDS.expandPath = function(aPath) {
        this.initPackage();

        return TDS._package.expandPath(aPath);
    };

    /**
     * Flushes any log entries in the TDS 'prelog' buffer. The buffer is cleared
     * as a result of this call.
     * @param {Logger} logger The logger instance to flush via.
     */
    TDS.flush_log = function(logger) {
        if (!this._buffer) {
            return;
        }

        this._buffer.forEach(function(triple) {
            try {
                logger[triple[0]](triple[1], triple[2]);
            } catch (e) {
                console.error(e.message);
            }
        });
    };

    /**
     * Return the application head, the location serving as the top-level root.
     * @returns {String} The application head path.
     */
    TDS.getAppHead = function() {
        this.initPackage();

        return TDS._package.getAppHead();
    };

    /**
     * Return the application head, the location serving as the top-level root.
     * @returns {String} The application head path.
     */
    TDS.getAppRoot = function() {
        this.initPackage();

        return TDS._package.getAppRoot();
    };

    /**
     * Returns the value for a specific configuration property.
     * @param {String} property A configuration property name.
     * @param {Object} [aDefault] An optional default value to return
     *     if the original key isn't found.
     * @returns {Object} The property value, if found.
     */
    TDS.getcfg = function(property, aDefault) {
        this.initPackage();

        return TDS._package.getcfg(property, aDefault);
    };

    //  Alias for same syntax found in TIBET client.
    TDS.cfg = TDS.getcfg;

    /**
     * Returns a CouchDB connection reference, equivalent to the result object
     * returned by the 'server' method on this object. See @server for more info.
     * @param {Object} options A parameter block suitable for the
     *     getCouchParameters call which defines any couch and TIBET parameters
     *     necessary.
     * @returns {Object} An object implementing the 'use' command for DB access.
     */
    TDS.getCouchConnection = function(options) {
        var opts;

        opts = options || {};
        opts.requestor = opts.requestor || TDS;
        opts.cfg_root = opts.cfg_root || 'couch';

        return couch.getCouchConnection(opts);
    };

    /**
     * Returns a database object capable of accessing a specific CouchDB
     *     database via both synchronous and asynchronous (Promisified) methods.
     *     The async versions all end in 'Async'. See nano documentation.
     * @param {Object} options A parameter block suitable for the
     *     getCouchParameters call which defines any couch and TIBET parameters
     *     necessary.
     * @returns {Object} A database object implementing promisified versions of
     *     all nano database object methods.
     */
    TDS.getCouchDatabase = function(options) {
        var opts;

        opts = options || {};
        opts.requestor = opts.requestor || TDS;
        opts.cfg_root = opts.cfg_root || 'couch';

        return couch.getCouchDatabase(opts);
    };

    /**
     * Computes the common parameters needed by nano and/or other interfaces to
     * CouchDB. This includes the CouchDB URL, the target database name, and the
     * target design doc application name.
     * @returns {Object} An object with db_url, db_name, and db_app values.
     */
    TDS.getCouchParameters = function(options) {
        var opts;

        opts = options || {};
        opts.requestor = opts.requestor || TDS;
        opts.cfg_root = opts.cfg_root || 'couch';

        return couch.getCouchParameters(opts);
    };

    /**
     * Computes the URL needed by nano and/or other interfaces to access CouchDB.
     * @returns {String} The CouchDB URL including any basic auth information.
     */
    TDS.getCouchURL = function(options) {
        var opts;

        opts = options || {};
        opts.requestor = opts.requestor || TDS;
        opts.cfg_root = opts.cfg_root || 'couch';

        return couch.getCouchURL(opts);
    };

    /**
     * Returns the current process environment (or 'development' if not set).
     * @param {String} [env] Optional environment to force value to.
     * @returns {string} The environment string.
     */
    TDS.getEnv = function(env) {
        return env || process.env.NODE_ENV || 'development';
    };

    /**
     * Returns a list of non-internal IPv4 addresses for the current host.
     * @returns {Array.<String>} The best external IPv4 addresses found.
     */
    TDS.getNodeIPs = function() {
        var os,
            ifaces,
            addresses;

        os = require('os');
        ifaces = os.networkInterfaces();
        addresses = [];

        Object.keys(ifaces).forEach(function(ifname) {
            ifaces[ifname].forEach(function(iface) {
                addresses.push(iface.address);
            });
        });

        return addresses;
    };

    /**
     * Returns virtual paths based on configuration data loaded from TIBET.
     * @param {String} aPath The explicit path to virtualize.
     * @returns {String} The virtualized path.
     */
    TDS.getVirtualPath = function(aPath) {
        this.initPackage();

        return TDS._package.getVirtualPath(aPath);
    };

    /**
     * Combined setter/getter for whether the current server instance has a
     * console logger. This helps the TDS decide how to log certain startup
     * messages such as the host:port announcement as well as the shutdown
     * message if a clean shutdown is requested.
     */
    TDS.hasConsole = function(aFlag) {
        if (aFlag !== undefined) {
            TDS.$$hasConsole = new Boolean(aFlag);
        }

        return TDS.$$hasConsole;
    };

    /**
     * Initalizes the TDS package, providing it with any initialization options
     * needed such as app_root or lib_root. If the package has already been
     * configured this method simply returns.
     * @param {Object} options The package options to use.
     * @returns {Package} The package instance.
     */
    TDS.initPackage = function(options) {
        var opts;

        if (this._package) {
            if (TDS.notEmpty(options)) {
                this._package.setRuntimeOptions(options);
            }
            return this._package;
        }

        opts = options || {};
        this._options = opts;

        this._package = new Package(opts);

        //  Ensure we set up a color object for colorizing support as well.
        opts.scheme = opts.scheme || process.env.TIBET_TDS_SCHEME ||
            this._package.getcfg('tds.color.scheme') || 'ttychalk';
        opts.theme = opts.theme || process.env.TIBET_TDS_THEME ||
            this._package.getcfg('tds.color.theme') || 'default';

        this.color = new Color(opts);

        if (!this._package.getcfg('color')) {
            this.colorize = function(aString, aSpec) {
                return aString;
            };
        } else {
            this.colorize = function(aString, aSpec) {
                return this.color.colorize(aString, aSpec);
            };
        }
    };

    /**
     * Returns the joined path in an *OS independent* manner (i.e. with '/' as the
     * only separator).
     * @param {varargs} paths The paths to be joined.
     * @returns {String} The supplied paths joined together with a '/'.
     */
    TDS.joinPaths = function(paths) {
        return TDS._package.joinPaths.apply(TDS._package, arguments);
    };


    /**
     * Loads a specified list of plugins by scanning the plugin directory at the
     * root location provided. NOTE that this routine is not used to load
     * internal TDS plugins, that's done via each project's tds.js plugin.
     * @param {String} rootpath The root path containing the plugins.
     * @param {Array} plugins The list of plugins to load, in order.
     * @param {Object} options An object containing optional parameters to
     *     share with each plugin during initialization.
     */
    TDS.loadPlugins = function(rootpath, plugins, options) {

        plugins.forEach(function(plugin) {
            var fullpath,
                meta;

            meta = {
                comp: 'TDS',
                type: 'plugin',
                name: plugin
            };

            fullpath = TDS.joinPaths(rootpath, plugin);

            //  Skip directories
            if (TDS.shell.test('-d', fullpath)) {
                return;
            }

            //  Once logger is set we can start asking for contextual loggers.
            if (TDS.logger) {
                options.logger = TDS.logger.getContextualLogger(meta);
                TDS.logger.system('loading middleware', meta);
            }

            try {
                require(fullpath)(options);
            } catch (e) {
                if (TDS.logger) {
                    TDS.logger.error(e.message, meta);
                    TDS.ifDebug() ? TDS.logger.debug(e.stack, meta) : 0;
                } else {
                    console.error(e.message);
                    console.error(e.stack);
                }

                throw e;
            }
        });
    };

    /**
     * @method lpad
     * @summary Returns a new String representing the obj with a leading number
     *     of padChar characters according to the supplied length.
     * @param {Object} obj The object to format with leading characters.
     * @param {Number} length The number of characters to pad the String
     *     representation with.
     * @param {String} padChar The pad character to use to pad the String
     *     representation. Note that if the padChar is an entity such as &#160;
     *     it is counted as having length 1.
     * @returns {String} The 'left padded' String.
     */
    TDS.lpad = function(obj, length, padChar) {
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

    /**
     * The theme to use for any log formatting.
     * @type {String}
     */
    TDS.log_theme = TDS.cfg('tds.color.theme') || 'default';

    /**
     * The logging levels to use for winston.
     * NOTE winston's level #'s are inverted from TIBET's.
     * @type {Object}
     */
    TDS.log_levels = {
        trace: 6,
        debug: 5,
        info: 4,
        warn: 3,
        error: 2,
        fatal: 1,
        system: 0
    };

    /**
     * The color assignments to use for any log colorizing of TDS.log_levels.
     * @type {Object}
     */
    TDS.log_colors = {
        trace: TDS.getcfg('theme.' + TDS.log_theme + '.trace'),
        debug: TDS.getcfg('theme.' + TDS.log_theme + '.debug'),
        info: TDS.getcfg('theme.' + TDS.log_theme + '.info'),
        warn: TDS.getcfg('theme.' + TDS.log_theme + '.warn'),
        error: TDS.getcfg('theme.' + TDS.log_theme + '.error'),
        fatal: TDS.getcfg('theme.' + TDS.log_theme + '.fatal'),
        system: TDS.getcfg('theme.' + TDS.log_theme + '.system')
    };

    /**
     * A custom winston log formatter to remove any color-codes from log
     * messages. This is used to ensure the file-based logs for production etc.
     * don't include console color codes (in case the logger is colorizing).
     */
    TDS.log_decolorizer = logFormats(function(info, opts) {

        if (TDS.notValid(info)) {
            return false;
        }

        if (TDS.notEmpty(info.message)) {
            info.message = TDS.decolorize(info.message);
        }

        return info;
    });

    /**
     * NOTE the reason for the assignment approach here is that a different
     * logger can be provided during preload if necessary.
     */
    TDS.log_formatter = TDS.log_formatter || logFormats(function(info, opts) {
        var msg,
            comp,
            style,
            level,
            result;

        msg = '';

        //  Empty object? Ignore it.
        if (TDS.notValid(info)) {
            result = {};
            result[triplebeam.LEVEL] = 'system';
            result[triplebeam.MESSAGE] = '';
            return result;
        }

        info.time = info.time || Date.now();

        if (info._id && info.flow && info.owner) {
            msg = info.flow + '::' + info.owner +
                TDS.colorize(' (' + info._id + ')', 'dim');
        } else if (info.meta &&
                info.meta.req !== undefined &&
                info.meta.res !== undefined &&
                info.meta.responseTime !== undefined) {

            //  HTTP request logging
            style = ('' + info.meta.res.statusCode).charAt(0) + 'xx';
            level = info.meta.res.statusCode >= 400 ? 'error' : info.level;

            //  Similar to output for other messages but the 'level' can be
            //  adjusted if the status code is an error code.
            msg += TDS.colorize(info.time, 'stamp');
            msg += TDS.colorize(' [', level);
            msg += TDS.colorize(
                TDS.levels[level.toLowerCase()], level);
            msg += TDS.colorize('] ', level);

            msg += TDS.colorize(info.meta.req.method, style) + ' ' +
                TDS.colorize(info.meta.req.url, 'url') + ' ' +
                TDS.colorize(info.meta.res.statusCode, style) + ' ' +
                TDS.colorize(info.meta.responseTime + 'ms', 'ms');

        } else if (info.type) {
            comp = info.comp || 'TDS';

            style = info.level.toLowerCase();

            msg += TDS.colorize(info.time, 'stamp');
            msg += TDS.colorize(' [', style);
            msg += TDS.colorize(
                TDS.levels[info.level.toLowerCase()], style);
            msg += TDS.colorize('] ', style);

            //  For less-than-warning levels we stick with a dim message body.
            if (TDS.levels[info.level] < TDS.levels.warn) {
                style = 'dim';
            } else if (TDS.levels[info.level] >= TDS.levels.system) {
                //  But don't force 'system' to be used for message text.
                style = 'dim';
            }

            //  TIBET plugin, route, task, etc.
            msg += TDS.colorize(comp, comp.toLowerCase() || 'tds') + ' ' +
                (hasAnsi(info.message) ? info.message + ' ' :
                    TDS.colorize(info.message, info.style || style) + ' ') +
                TDS.colorize('(', 'dim') +
                TDS.colorize(info.name, info.type || 'dim') +
                TDS.colorize(')', 'dim');

        } else {
            //  Standard message string with no metadata.
            msg += ' ' + hasAnsi(info.message) ? info.message :
                TDS.colorize(info.message, 'data');
        }

        //  NOTE: it's important to use the symbols here.
        result = {};
        result[triplebeam.LEVEL] = info.level;
        result[triplebeam.MESSAGE] = msg;

        return result;
    });

    /**
     */
    TDS.log_transport = function(options) {
        var transport;

        transport = new logTransports.Console(options);

        transport.$$buffer = [];

        transport.$$write = function(callback) {
            var log,
                ok,
                my;

            my = this;

            if (my.$$buffer.length > 0) {
                log = my.$$buffer.splice(0, 25);
                log = log.map(function(item) {
                    let dat;
                    try {
                        dat = item[triplebeam.MESSAGE];
                    } catch (e) {
                        console.error(e.message);
                    }
                    return dat;
                });

                ok = process.stdout.write(log.join('\n'));
                if (!ok) {
                    process.nextTick(function() {
                        process.stdout.write('\n' + log.join('\n'));
                        if (callback) {
                            callback();
                        }
                    });
                } else if (callback) {
                    callback();
                }
            } else if (callback) {
                callback();
            }
        };

        //  Build a flush routine we can use to essentially "buffer" output so
        //  it doesn't consistently skip newline output. (process.stdout.write
        //  can return a 'not-ok' result).
        transport.flush = function(immediate, callback) {
            var my;

            if (immediate) {
                //  NOTE: don't pass callback here... leave it for the "cleanup"
                //  portion invoked by setTimeout below.
                this.$$write();
            }

            my = this;

            setTimeout(function() {
                my.$$write(callback);
            }, 100);
        };

        transport.log = function(info, callback) {
            this.$$buffer.push(info);
            this.flush(false, callback);
        };

        return transport;
    };

    /**
     */
    TDS.file_transport = function(options) {
        var transport;

        transport = new logTransports.File(options);

        return transport;
    };

    /**
     * Returns a version of the url provided with any user/pass information
     * masked out. This is used for prompts and logging to avoid having auth
     * info placed into a visible prompt or log entry.
     * @param {String} url The URL to mask.
     * @returns {String} The masked URL.
     */
    TDS.maskCouchAuth = function(url) {
        return couch.maskCouchAuth(url);
    };


    /**
     * Normalizes line endings on the supplied content. This deals with
     * situations where content on Windows has a carriage return and newline.
     * @param {String} content The content to be normalized
     * @returns {String} The normalized content.
     */
    TDS.normalizeLineEndings = function(content) {
        return TDS._package.normalizeLineEndings(content);
    };


    /**
     * Pushes an ordered pair of log level and message into the temporary log
     * buffer. This buffer is cleared once the logger plugin has loaded fully.
     * @param {Array.<Number, String>} pair The ordered pair containing a log
     *     level and message.
     */
    TDS.prelog = function(level, message, meta) {
        this._buffer.push(arguments);
    };

    /**
     * Push a function to be run by the TDS poststart logic.
     * @param {Function} hook The function to push into the postprocess list.
     */
    TDS.prolog = function(hook) {
        this._prologs.push(hook);
    };

    /**
     * Quotes a string for use in JSON or other quoted string contexts.
     * @param {String} aString The string to quote.
     * @param {String} [aQuoteChar='"'] Optional specifier of the type of quote
     *     to use for the string.
     * @returns {String} The quoted string.
     */
    TDS.quote = function(aString, aQuoteChar) {
        var qchar,
            str;

        if (aString.charAt(0) === '"' &&
                aString.charAt(aString.length - 1) === '"') {
            return aString;
        }

        if (aString.charAt(0) === "'" &&
                aString.charAt(aString.length - 1) === "'") {
            return aString;
        }

        //  Usually quoting for JSON so default to double quote here.
        qchar = aQuoteChar || '"';

        str = qchar;
        str += aString.replace(new RegExp(qchar, 'g'), '\\' + qchar);
        str += qchar;

        return str;
    };

    /**
     * @method registerServers
     * @summary Used to set up connection tracking so we can time out
     *     connnections if we receive a request to shutdown gracefully.
     */
    TDS.registerServers = function() {
        var connect;

        //  Helper function which ensures new connections are tracked and
        //  properly removed from tracking when they close.
        connect = function(connection) {
            var addr;

            addr = connection.remoteAddress + ':' + connection.remotePort;
            TDS._connections[addr] = connection;

            connection.on('close', function() {
                delete TDS._connections[addr];
            });

            connection.setTimeout(TDS.getcfg('tds.connection_timeout'));
        };

        if (TDS.httpsServer) {
            TDS.httpsServer.on('connection', connect);
        }

        if (TDS.httpServer) {
            TDS.httpServer.on('connection', connect);
        }
    };

    /**
     * @method rpad
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
    TDS.rpad = function(obj, length, padChar) {
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

    /**
     * Save a property value to the TDS server configuration file. Note that
     * this only operates on keys prefixed with 'tds'.
     * @param {String} property The property name to set/save.
     * @param {String} value The value to set.
     * @param {String} env The environment context ('development' etc).
     */
    TDS.savecfg = function(property, value, env) {
        var cfg,
            parts,
            part,
            str,
            chunk;

        if (property.indexOf('tds.') !== 0 && property.indexOf('tws.') !== 0) {
            return;
        }

        this.initPackage();

        //  Get current environment block.
        cfg = TDS._package.getServerConfig();
        chunk = cfg[env];

        //  Get list of property path entries without 'tds'.
        parts = property.split('.');
        parts.shift();

        //  Work through parts, building as we need to.
        part = parts.shift();
        while (part) {
            if (parts.length === 0) {
                //  part we have is 'leaf' level
                chunk[part] = value;
            } else {
                if (TDS.notValid(chunk[part])) {
                    chunk[part] = {};
                }
                chunk = chunk[part];
            }
            part = parts.shift();
        }

        //  Save the file content back out via shelljs interface.
        str = TDS.beautify(JSON.stringify(cfg));
        new sh.ShellString(str).to(TDS.expandPath('~/tds.json'));
    };

    /**
     * Set a configuration property to a specific value.
     * @param {String} property The property name to set.
     * @param {Object} value The property value to set.
     * @returns {Object} The value upon completion.
     */
    TDS.setcfg = function(property, value) {
        this.initPackage();

        return TDS._package.setcfg(property, value);
    };

    /**
     * Shuts down the TDS, letting any registered shutdown hooks run to close
     * connections etc.
     */
    TDS.shutdown = function(err, meta) {
        var hooks,
            code;

        //  Force connections to become aware of a timeout so they drop.
        TDS.timeoutConnections(meta);

        TDS.logger.system('shutting down TDS middleware', meta);
        if (!TDS.hasConsole()) {
            process.stdout.write(
                TDS.colorize('shutting down TDS middleware', 'error'));
        }

        code = err ? 1 : 0;

        hooks = TDS._shutdownHooks;
        hooks.forEach(function(func) {
            try {
                func(TDS, meta);
            } catch (e) {
                code = 1;
                TDS.logger.error(e.message, meta);
                if (!TDS.hasConsole()) {
                    process.stderr.write(e.message);
                }
            }
        });

        return code;
    };

    /**
     * @method timeoutConnections
     * @summary Notifies any active connections they should time out based on
     *     the tds.shutdown_timeout setting. This is only used during shutdown
     *     and can differ from any tds.connection_timeout value.
     */
    TDS.timeoutConnections = function(meta) {
        var timeout;

        timeout = TDS.getcfg('tds.shutdown_connections');

        TDS.logger.system('closing active TDS connections', meta);
        if (!TDS.hasConsole()) {
            process.stdout.write(
                TDS.colorize('closing active TDS connections', 'error'));
        }

        Object.keys(TDS._connections).forEach(function(key) {
            var connection;

            connection = TDS._connections[key];

            connection.setTimeout(timeout, function() {
                if (TDS._connections[key]) {
                    TDS._connections[key].destroy();
                }
            });
        });
    };

    /**
     * Removes any outer quotes from the string value provided.
     * @param {String} aString The string to unquote.
     * @returns {String} The unquoted string.
     */
    TDS.unquote = function(aString) {
        if (aString.length < 2) {
            return aString;
        }

        if (aString.charAt(0) === '"' &&
                aString.charAt(aString.length - 1) === '"') {
            return aString.slice(1, -1);
        }

        if (aString.charAt(0) === "'" &&
                aString.charAt(aString.length - 1) === "'") {
            return aString.slice(1, -1);
        }

        return aString;
    };

    /**
     * Export TDS reference.
     */
    module.exports = TDS;

}(this));
