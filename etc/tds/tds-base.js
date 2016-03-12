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
        Package,
        sh,
        TDS;

    beautify = require('js-beautify');
    sh = require('shelljs');

    // Load the CLI's package support to help with option/configuration data.
    Package = require('../cli/tibet-package');

    //  ---
    //  TIBET Data Server Root
    //  ---

    TDS = {};

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
     * The package instance assisting with configuration data loading/lookup.
     * @type {Package} A TIBET CLI package instance.
     */
    TDS._package = null;

    /**
     * A common handle to the js-beautify routine for pretty-printing JSON to
     * the console or via the logger.
     * @type {Function}
     */
    TDS.beautify = beautify;

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
     * Returns true if the object provided is an 'Object' as opposed to a string,
     * number, boolean, RegExp, Array, etc. In essense a check for whether it's a
     * hash of keys.
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
            i,
            len,
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

    TDS.setcfg = function(property, value) {
        this.initPackage();

        return TDS._package.setcfg(property, value);
    };

    module.exports = TDS;

}(this));

