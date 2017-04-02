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
        path,
        handlebars,
        util,
        couch,
        winston,
        Package,
        Color,
        Promise,
        hasAnsi,
        TDS;

    beautify = require('js-beautify');
    crypto = require('crypto');
    cors = require('cors');
    path = require('path');
    handlebars = require('handlebars');
    Promise = require('bluebird');
    util = require('util');
    winston = require('winston');

    // Load the package support to help with option/configuration data.
    Package = require('../common/tibet_package');

    //  CouchDB utilities for couch and task processing.
    couch = require('../helpers/couch_helpers.js');

    // Load color utilities for colorizing log messages etc.
    Color = require('../common/tibet_color');
    hasAnsi = require('has-ansi');

    //  ---
    //  TIBET Data Server Root
    //  ---

    TDS = {};

    /**
     * The algorithm to use for encrypt/decrypt processing.
     * @type {String}
     */
    TDS.CRYPTO_ALGORITHM = 'aes-256-ctr';

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
        'boolean': ['color', 'debug', 'verbose'],
        'string': ['level', 'tds.log.level'],
        'number': ['port', 'tds.port'],
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
     * A handle to the crypto module for use in encryption/decryption.
     * @type {Object}
     */
    TDS.crypto = crypto;

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
     * @return {Object} The value found at the end of the path.
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
     */
    TDS.announceStart = function(logger, protocol, port) {
        var project;

        project = TDS.colorize(TDS.cfg('npm.name') || '', 'project');
        project += ' ' + TDS.colorize(TDS.cfg('npm.version') || '0.0.1', 'version');

        //  First output the 'default' or 'prod' or 'build' version which should
        //  be the one all projects default to without any '#' parameters.
        logger.system(project +
            TDS.colorize(' @ ', 'dim') +
            TDS.colorize(protocol + '://127.0.0.1' +
                (port === 80 ? '' : ':' + port), 'host'),
            {comp: 'TDS', type: 'tds', name: 'build'});

        //  Also output a 'development link' that will ensure app source and
        //  sherpa are loaded and ready for development.
        logger.system(project +
            TDS.colorize(' @ ', 'dim') +
            TDS.colorize(protocol + '://127.0.0.1' +
                (port === 80 ? '' : ':' + port + '#?boot.config=developer'),
                'host'),
            {comp: 'TDS', type: 'tds', name: 'sherpa'});
    };

    /**
     * A common handle to the js-beautify routine for pretty-printing JSON to
     * the console or via the logger.
     * @type {Function}
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
            return source;
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
     * Colorizes a string based on the current color.scheme and theme settings.
     * @param {String} aString The string to colorize.
     * @param {String} aSpec The theme element name (such as 'url' or
     *     'timestamp') whose style spec should be used.
     */
    TDS.colorize = function(aString, aSpec) {
        if (!this._options.color) {
            return aString;
        }
        return this.color.colorize(aString, aSpec);
    };

    /**
     * Provides a common handle to the 'cors' module for use in defining CORS
     * access for one or more routes.
     * @param {Object} [options] An object providing options to the 'cors'
     *     module. @see https://github.com/expressjs/cors for more info.
     */
    TDS.cors = function(options) {
        return cors(options);
    };

    /**
     * Decrypts a block of text using TDS.CRYPTO_ALGORITHM. The encryption key
     * is read from the environment and if not found an exception is raised.
     * @param {String} text The text to encrypt.
     */
    TDS.decrypt = function(text) {
        var key,
            cipher,
            decrypted;

        key = process.env.TDS_CRYPTO_KEY;
        if (TDS.isEmpty(key)) {
            throw new Error(
                'No key found for decryption. $ export TDS_CRYPTO_KEY="{{secret}}"');
        }

        cipher = TDS.crypto.createDecipher(TDS.CRYPTO_ALGORITHM, key);

        decrypted = cipher.update(text, 'hex', 'utf8');
        decrypted += cipher.final('utf8');

        return decrypted;
    };

    /**
     * Encrypts a block of text using TDS.CRYPTO_ALGORITHM. The encryption key
     * is read from the environment and if not found an exception is raised.
     * @param {String} text The text to encrypt.
     */
    TDS.encrypt = function(text) {
        var key,
            cipher,
            encrypted;

        key = process.env.TDS_CRYPTO_KEY;
        if (TDS.isEmpty(key)) {
            throw new Error(
                'No key found for encryption. $ export TDS_CRYPTO_KEY="{{secret}}"');
        }

        cipher = TDS.crypto.createCipher(TDS.CRYPTO_ALGORITHM, key);

        encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return encrypted;
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
     * @returns {Object} The property value, if found.
     */
    TDS.getcfg = function(property) {
        this.initPackage();

        return TDS._package.getcfg(property);
    };

    //  Alias for same syntax found in TIBET client.
    TDS.cfg = TDS.getcfg;

    /**
     * Computes the common parameters needed by nano and/or other interfaces to
     * CouchDB. This includes the CouchDB URL, the target database name, and the
     * target design doc application name.
     * @return {Object} An object with db_url, db_name, and db_app values.
     */
    TDS.getCouchParameters = function(options) {
        var opts;

        opts = options || {};
        opts.requestor = TDS;

        return couch.getCouchParameters(opts);
    };

    /**
     * Computes the URL needed by nano and/or other interfaces to access CouchDB.
     * @return {String} The CouchDB URL including any basic auth information.
     */
    TDS.getCouchURL = function(options) {
        var opts;

        opts = options || {};
        opts.requestor = TDS;

        return couch.getCouchURL(opts);
    };

    /**
     * Returns the current process environment (or 'development' if not set).
     * @returns {string} The environment string.
     */
    TDS.getNodeEnv = function() {
        return process.env.NODE_ENV || 'development';
    };

    /**
     * Returns a list of non-internal IPv4 addresses for the current host.
     * @return {Array.<String>} The best external IPv4 addresses found.
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
     * Initalizes the TDS package, providing it with any initialization options
     * needed such as app_root or lib_root. If the package has already been
     * configured this method simply returns.
     * @param {Object} options The package options to use.
     * @returns {Package} The package instance.
     */
    TDS.initPackage = function(options) {
        var opts;

        if (this._package) {
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
    };

    /**
     * Loads a specified list of plugins by scanning the plugin directory at the
     * root location provided.
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

            fullpath = path.join(rootpath, plugin);

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
                    TDS.logger.debug(e.stack, meta);
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
     * NOTE the reason for the assignment approach here is that a different
     * logger can be provided during preload if necessary.
     */
    TDS.log_formatter = TDS.log_formatter || function(obj) {
        var msg,
            comp,
            style,
            level;

        msg = '';

        if (TDS.notValid(obj)) {
            return '' + obj;
        }

        if (obj._id && obj.flow && obj.owner) {
            msg = obj.flow + '::' + obj.owner +
                TDS.colorize(' (' + obj._id + ')', 'dim');
        } else if (obj.type && obj.name &&
            (obj.comp || Object.keys(obj).length === 2)) {
            //  metadata...we can ignore this.
            return '';
        } else if (obj.meta &&
                obj.meta.req !== undefined &&
                obj.meta.res !== undefined &&
                obj.meta.responseTime !== undefined) {

            //  HTTP request logging
            style = ('' + obj.meta.res.statusCode).charAt(0) + 'xx';
            level = obj.meta.res.statusCode >= 400 ? 'error' : obj.level;

            //  Similar to output for other messages but the 'level' can be
            //  adjusted if the status code is an error code.
            msg += TDS.colorize(obj.time, 'stamp');
            msg += TDS.colorize(' [', level);
            msg += TDS.colorize(
                TDS.levels[level.toLowerCase()], level);
            msg += TDS.colorize('] ', level);

            msg += TDS.colorize(obj.meta.req.method, style) + ' ' +
                TDS.colorize(obj.meta.req.url, 'url') + ' ' +
                TDS.colorize(obj.meta.res.statusCode, style) + ' ' +
                TDS.colorize(obj.meta.responseTime + 'ms', 'ms');

        } else if (obj.meta && obj.meta.type) {
            comp = obj.meta.comp || 'TDS';

            style = obj.level.toLowerCase();

            msg += TDS.colorize(obj.time, 'stamp');
            msg += TDS.colorize(' [', style);
            msg += TDS.colorize(
                TDS.levels[obj.level.toLowerCase()], style);
            msg += TDS.colorize('] ', style);

            //  For non-error levels we stick with a dim message chunk default.
            if (TDS.levels[obj.level] < TDS.levels.error) {
                style = 'dim';
            } else if (TDS.levels[obj.level] >= TDS.levels.system) {
                //  But don't force 'system' to be used for message text.
                style = 'dim';
            }

            //  TIBET plugin, route, task, etc.
            msg += TDS.colorize(comp, comp.toLowerCase() || 'tds') + ' ' +
                (hasAnsi(obj.message) ? obj.message + ' ' :
                    TDS.colorize(obj.message, obj.meta.style || style) + ' ') +
                TDS.colorize('(', 'dim') +
                TDS.colorize(obj.meta.name, obj.meta.type || 'dim') +
                TDS.colorize(')', 'dim');

        } else {
            //  Standard message string with no metadata.
            msg += ' ' + hasAnsi(obj.message) ? obj.message :
                TDS.colorize(obj.message, 'data');
        }

        return msg;
    };

    /**
     * Flushes any log entries in the TDS 'prelog' buffer. The buffer is cleared
     * as a result of this call.
     * @param {Logger} logger The logger instance to flush via.
     */
    TDS.log_flush = function(logger) {
        if (!this._buffer) {
            return;
        }

        this._buffer.forEach(function(triple) {
            logger[triple[0]](triple[1], triple[2]);
        });
    };

    /**
     */
    TDS.log_transport = function(options) {
        this.options = options || {};
        this.level = options.level || 'info';
        this.name = 'TDSConsoleTransport';
        this.output = [];
    };
    util.inherits(TDS.log_transport, winston.Transport);

    /**
     */
    TDS.log_transport.prototype.flush = function(immediate) {
        var my;

        my = this;

        if (immediate) {
            process.stdout.write(
                my.output.map(function(item) {
                    return my.options.formatter(item);
                }).join('\n'));
        }

        setTimeout(function() {
            var log,
                ok;

            if (my.output.length > 0) {
                log = my.output.splice(0, 25);
                log = log.map(function(item) {
                    return my.options.formatter(item);
                });

                ok = process.stdout.write(log.join('\n'));
                if (!ok) {
                    process.nextTick(function() {
                        process.stdout.write('\n' + log.join('\n'));
                    });
                }
            }
        }, 100);
    };

    /**
     */
    TDS.log_transport.prototype.log = function(level, msg, meta, callback) {
        this.output.push({level: level, message: msg, meta: meta, time: Date.now()});
        this.flush();
        callback(null, true);
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
            chunk;

        if (property.indexOf('tds.') !== 0) {
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
        TDS.beautify(JSON.stringify(cfg)).to(TDS.expandPath('~/tds.json'));
    };

    /**
     * Set a configuration property to a specific value.
     * @param {String} property The property name to set.
     * @param {Object} value The property value to set.
     * @return {Object} The value upon completion.
     */
    TDS.setcfg = function(property, value) {
        this.initPackage();

        return TDS._package.setcfg(property, value);
    };

    /**
     * Removes any outer quotes from the string value provided.
     * @param {String} aString The string to unquote.
     * @return {String} The unquoted string.
     */
    TDS.unquote = function(aString) {
        if (aString.length < 2) {
            return aString;
        }

        if (aString.charAt(0) === '"' &&
                aString.charAt(aString.length - 1) === '"') {
            return aString.slice(0, -1);
        }

        if (aString.charAt(0) === "'" &&
                aString.charAt(aString.length - 1) === "'") {
            return aString.slice(0, -1);
        }

        return aString;
    };

    /**
     * Export TDS reference.
     */
    module.exports = TDS;

}(this));
