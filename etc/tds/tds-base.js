/**
 * @overview Common functionality used by the TDS components.
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/* eslint no-console:0 */

(function() {

    'use strict';

    var Package,
        TDS;

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
        'string': ['app_root', 'config'],
        'number': ['tds.port'],
        'default': {}
    };
    /* eslint-enable quote-props */

    /**
     * The package instance assisting with configuration data loading/lookup.
     * @type {Package} A TIBET CLI package instance.
     */
    TDS._package = null;

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
     * Provides a useful 'skip' function for the Express logger. This will
     * filter out a lot of logging overhead that might otherwise occur when the
     * TDS is being accessed.
     * @returns {Boolean} true to skip logging the current request.
     */
    TDS.logFilter = function(req, res) {
        var url;

        url = TDS.getcfg('tds.watch.uri');

        // Don't log repeated calls to the watcher URL.
        if (req.path.indexOf(url) !== -1) {
            return true;
        }
    };

    module.exports = TDS;

}());

