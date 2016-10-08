/**
 * @overview Common functionality used by the TIBET Data Server and middleware.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

(function(root) {

    'use strict';

    var beautify,
        crypto,
        handlebars,
        Package,
        TDS;

    beautify = require('js-beautify');
    crypto = require('crypto');
    handlebars = require('handlebars');

    // Load the CLI's package support to help with option/configuration data.
    Package = require('../cli/tibet-package');

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
     * Command line parsing options for the minimist module to use. These are
     * typically referenced in the server.js file for a project using the TDS.
     * @type {Object} A dictionary of command line argument options.
     */
    /* eslint-disable quote-props */
    TDS.PARSE_OPTIONS = {
        'boolean': ['verbose'],
        'string': ['debug', 'level', 'tds.log.level'],
        'number': ['port', 'tds.port'],
        'default': {}
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
     * A handle to the crypto module for use in encryption/decryption.
     * @type {Object}
     */
    TDS.crypto = crypto;

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
            throw new Error('No key found for decryption.');
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
            throw new Error('No key found for encryption.');
        }

        cipher = TDS.crypto.createCipher(TDS.CRYPTO_ALGORITHM, key);

        encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return encrypted;
    };

    /**
     * Flushes any log entries in the TDS 'prelog' buffer. The buffer is cleared
     * as a result of this call.
     * @param {Logger} logger The logger instance to flush via.
     */
    TDS.flushlog = function(logger) {
        if (!this._buffer) {
            return;
        }

        this._buffer.forEach(function(pair) {
            logger[pair[0]](pair[1]);
        });
    };

    /**
     * Pushes an ordered pair of log level and message into the temporary log
     * buffer. This buffer is cleared once the logger plugin has loaded fully.
     * @param {Array.<Number, String>} pair The ordered pair containing a log
     *     level and message.
     */
    TDS.prelog = function(pair) {
        this._buffer.push(pair);
    };

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
     */
    TDS.access = function(obj, path) {
        var steps,
            target,
            i,
            len;

        if (TDS.notValid(obj)) {
            return;
        }

        if (TDS.isEmpty(path)) {
            return;
        }

        target = obj;
        path = '' + path;

        steps = path.split('.');
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
        var opts,
            db_url,
            db_scheme,
            db_host,
            db_port,
            db_user,
            db_pass,
            db_name,
            db_app;

        opts = options || {};

        db_url = opts.db_url || TDS.getCouchURL(options);

        db_scheme = opts.db_scheme || TDS.getcfg('tds.couch.scheme') || 'http';
        db_host = opts.db_host || TDS.getcfg('tds.couch.host') || '127.0.0.1';
        db_port = opts.db_port || TDS.getcfg('tds.couch.port') === undefined ?
            '5984' : TDS.getcfg('tds.couch.port');

        db_user = opts.db_user || process.env.COUCH_USER;
        db_pass = opts.db_pass || process.env.COUCH_PASS;

        db_name = opts.db_name || process.env.COUCH_DATABASE;
        if (!db_name) {
            db_name = TDS.getcfg('tds.couch.db_name') || TDS.getcfg('npm.name');
        }

        db_app = opts.db_app || process.env.COUCH_APPNAME;
        if (!db_app) {
            db_app = TDS.getcfg('tds.couch.db_app') || 'tibet';
        }

        return {
            db_url: db_url,
            db_scheme: db_scheme,
            db_host: db_host,
            db_port: db_port,
            db_user: db_user,
            db_pass: db_pass,
            db_name: db_name,
            db_app: db_app
        };
    };

    /**
     * Computes the URL needed by nano and/or other interfaces to access CouchDB.
     * @return {String} The CouchDB URL including any basic auth information.
     */
    TDS.getCouchURL = function(options) {
        var opts,
            db_scheme,
            db_host,
            db_port,
            db_user,
            db_pass,
            db_url;

        opts = options || {};

        db_url = opts.db_url || process.env.COUCH_URL;
        if (!db_url) {
            //  Build up from config or defaults as needed.
            db_scheme = opts.db_scheme || TDS.getcfg('tds.couch.scheme') || 'http';
            db_host = opts.db_host || TDS.getcfg('tds.couch.host') || '127.0.0.1';
            db_port = opts.db_port || TDS.getcfg('tds.couch.port') === undefined ?
                '5984' : TDS.getcfg('tds.couch.port');

            db_user = opts.db_user || process.env.COUCH_USER;
            db_pass = opts.db_pass || process.env.COUCH_PASS;

            db_url = db_scheme + '://';
            if (db_user && db_pass) {
                db_url += db_user + ':' + db_pass + '@' + db_host;
            } else {
                db_url += db_host;
            }

            if (db_port) {
                db_url += ':' + db_port;
            }
        }

        return db_url;
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
        if (this._package) {
            return this._package;
        }

        this._package = new Package(options);
    };

    /**
     * Returns a version of the url provided with any user/pass information
     * masked out. This is used for prompts and logging to avoid having auth
     * info placed into a visible prompt or log entry.
     * @param {String} url The URL to mask.
     * @returns {String} The masked URL.
     */
    TDS.maskCouchAuth = function(url) {
        var regex,
            match,
            newurl;

        regex = /(.*)\/\/(.*):(.*)@(.*)/;

        if (!regex.test(url)) {
            return url;
        }

        match = regex.exec(url);
        newurl = match[1] + '//$COUCH_USER:$COUCH_PASS@' + match[4];

        return newurl;
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
     * Export TDS reference.
     */
    module.exports = TDS;

}(this));
