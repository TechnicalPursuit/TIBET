/**
 * @file _Package.js
 * @overview TIBET package/config processing. Routines here provide ways to get
 *     asset listings from TIBET package files and their configurations. This is
 *     a Node.js routine primarily focused on CLI support. The TIBET boot system
 *     has its own ability to leverage package file metadata for client code.
 * @author Scott Shattuck (ss)
 * @copyright Copyright (C) 1999-2014 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     open source waivers to keep your derivative work source code private.
 */

/* jshint node:true, onevar:false */
/* global TP:true */

;(function(root) {

var fs = require('fs'),
    path = require('path'),
    chalk = require('chalk'),
    sh = require('shelljs'),

    dom = require('xmldom'),
    parser = new dom.DOMParser(),
    serializer = new dom.XMLSerializer(),

    isEmpty = function(aReference) {
        return aReference === null || aReference === undefined ||
            aReference.length === 0;
    },
    isValid = function(aReference) {
        return aReference !== null && aReference !== undefined;
    },
    notEmpty = function(aReference) {
        return aReference !== null && aReference !== undefined &&
            aReference.length !== 0;
    },
    notValid = function(aReference) {
        return aReference === null || aReference === undefined;
    };

//  ---
//  Type Construction
//  ---

var Package = function(options) {

    var pkg;

    this.packageStack = [];
    this.configs = [];

    this.asset_paths = {};

    this.packages = {};
    this.paths = {};

    this.options = options || {};
    this.cfg = {};

    pkg = this;

    // NOTE, this is a global. Defined so we can load tibet_cfg.js via require()
    // and have it work. Also used to process tibet.json properties.
    TP = {};
    TP.sys = {};
    TP.sys.setcfg = function(property, value) {
        var name;

        name = property.replace(/\./g, '_');
        pkg.cfg[name] = value;
    };
    this.setcfg = TP.sys.setcfg;

    TP.sys.cfg = function(property) {
        var name;

        name = property.replace(/\./g, '_');
        return pkg.cfg[name];
    };
    this.cfg = TP.sys.cfg;

    // Load remaining TIBET configuration data for paths/virtual paths etc.
    this.loadTIBETBaseline();

    // Process local project file content into proper configuration data.
    this.setProjectOptions();

    // Process command-line flags to replace any loaded values with any values
    // the user (or invoking routine) provided directly.
    this.setRuntimeOptions();

    // Expand options into working properties.
    this.expandOptions();
};

//  ---
//  Type Attributes
//  ---

Package.BOOLEAN_REGEX = /^true$|^false$/;
Package.NUMBER_REGEX = /^\d*$/;
Package.OBJECT_REGEX = /^\{.*\}$/;
Package.REGEX_REGEX = /^\/.*\/$/;

Package.KV_REGEX = /=/;

/**
 * A map of element attributes that will be copied down during expansion.
 * @type {Array.<string>}
 */
Package.MAPPED_ATTRS = {
    'no-lint': true
};


/**
 * The default package file to process.
 * @type {string}
 */
Package.PACKAGE = '~app_inf/app.xml';

/**
 * A list of the options which are considered standard. Any option values not in
 * this list are treated as configuration parameters.
 */
Package.STANDARD_OPTIONS = [
    '$0',               // From command-line parsing process.
    '_',                // From command-line parsing process.

    'app_root',         // Where is the application root? Normally computed.
    'lib_root',         // Where is the library root? Normally computed.

    'include',          // Space-separated list of asset types to process.
    'exclude',          // Space-separated list of asset types to exclude.

    'scripts',          // Shorthand for include="echo property script"
    'styles',           // Shorthand for include="style"
    'images',           // Shorthand for include="img"

    'nodes',            // Output nodes (vs. urls). Default is true.

    'package',          // TIBET manifest/package file path.
    'config',           // Config to expand/list. Computable from package.
    'strict',           // Force name/version checks in manifests?

    'color',            // Log in color? Default is false.
    'silent',           // Suppress normal logging? Default is false.
    'verbose',          // Output verbose-level messages?

    'debug',            // Output debugging-level messages?
    'stack'             // Display stack on errors? Default is false.
];


/**
 * The filename used to assist in locating a project root directory.
 * @type {string}
 */
Package.PROJECT_FILE = 'tibet.json';


//  ---
//  Type Methods
//  ---


//  ---
//  Instance Attributes
//  ---

/**
 * The root location of the application being processed/packaged.
 * @type {string}
 */
Package.prototype.app_root = null;


/**
 * A cache of asset_paths which have already been listed. This is cleared with
 * each listing run and is used to unique the asset listings returned.
 * @type {Object.<string, string>}
 */
Package.prototype.asset_paths = null;


/**
 * Container for configuration parameter data similar to TP.sys.setcfg storage.
 * This ends up holding settings from tibet.json etc.
 */
Package.prototype.cfg = null;


/**
 * The package config we're processing.
 * @type {string}
 */
Package.prototype.config = null;


/**
 * A cache of configurations which have been processed. Used to ensure we don't
 * have circular references or perform duplicate work.
 */
Package.prototype.configs = null;


/**
 * Array of asset types to exclude from any output.
 * @type {Array.<string, string>}
 */
Package.prototype.excludes = null;


/**
 * Array of asset types to include in the output.
 * @type {Array.<string, string>}
 */
Package.prototype.includes = null;


/**
 * The root of the TIBET library being leveraged.
 * @type {string}
 */
Package.prototype.lib_root = null;


/**
 * The package we're processing.
 * @type {string}
 */
Package.prototype.package = null;


/**
 * A cache of packages which have already been processed. This helps ensure we
 * don't do work twice and don't have cirular references.
 * @type {Object.<string, string>}
 */
Package.prototype.packages = null;


/**
 * A stack whose 0-th element represents the currently processing package file.
 */
Package.prototype.packageStack = null;


/**
 * A cache of virtual paths and their fully expanded equivalents.
 * @type {Object.<string, string>}
 */
Package.prototype.paths = null;


/**
 * A dictionary of processing options for package/config expansion and listing.
 * @type {Object.<string, object>}
 */
Package.prototype.options = null;

//  ---
//  Instance Methods
//  ---

/**
 * Copies attributes from a source Element to a target Element.
 * @param {Element} sourceElem The source element to copy from.
 * @param {Element} targetElem The target element to copy to.
 * @param {Boolean} overwrite Whether to overwrite matching attributes [false].
 */
Package.prototype.copyAttributes = function (sourceElem, targetElem, overwrite) {
    var attrs;

    attrs = Array.prototype.slice.call(sourceElem.attributes, 0);
    attrs.forEach(function(attr) {
        if (!Package.MAPPED_ATTRS[attr.name]) {
            return;
        }

        if (overwrite === true) {
            targetElem.setAttribute(attr.name, attr.value);
        } else {
            if (isEmpty(targetElem.getAttribute(attr.name)) &&
                    notEmpty(attr.value)) {
                targetElem.setAttribute(attr.name, attr.value);
            }
        }
    });
};


/**
 * Logs a simple key => value representation of an object for debugging.
 * @param {Object} anObject The object to dump.
 */
Package.prototype.dump = function(anObject) {
    var pkg = this;

    Object.keys(anObject).sort().forEach(function(key) {
        pkg.log(key + ' => ' + anObject[key]);
    });
};


/**
 * Expands all configs within a particular package. This is useful as a way to
 * get a full list of all resources relative to a particular application. As a
 * result the resource list can help drive TIBET's command line tools.
 * @param {String} aPath The path to the package manifest file to be processed.
 * @return {Document} An xml document containing the expanded configuration.
 */
Package.prototype.expandAll = function(aPath) {

    var expanded;   // The expanded path equivalent.
    var doc;        // The xml DOM document object after parse.
    var xml;        // The xml string read from the top-level manifest.
    var package;    // The package node from the XML doc.
    var configs;    // The ultimate config ID being used.
    var pkg;        //
    var msg;

    expanded = notEmpty(aPath) ? aPath : (this.getcfg('package') || Package.PACKAGE);

    expanded = this.expandPath(expanded);

    this.pushPackage(expanded);

    try {
        // If we've been through this package once before we can skip reading
        // and parsing the XML and jump directly to processing the config.
        doc = this.packages[expanded];
        if (!doc) {
            if (!sh.test('-e', expanded)) {
                msg = 'Unable to find package: ' + expanded;
                throw new Error(msg);
            }

            xml = fs.readFileSync(expanded, {encoding: 'utf8'});
            if (!xml) {
                msg = 'Unable to read package: ' + expanded;
                throw new Error(msg);
            }

            doc = parser.parseFromString(xml);
            if (!doc) {
                msg = 'Error parsing: ' + expanded;
                throw new Error(msg);
            }

            this.packages[expanded] = doc;
        }

        // If the package isn't valid stop right here.
        package = doc.getElementsByTagName('package')[0];
        if (!package) {
            return;
        }

        // Verify package has a name and version, otherwise it's not valid.
        if (this.getcfg('strict') &&
            (isEmpty(package.getAttribute('name')) ||
            isEmpty(package.getAttribute('version')))) {
            msg = 'Missing name or version on package: ' +
                serializer.serializeToString(package);
            throw new Error(msg);
        }

        configs = Array.prototype.slice.call(
            doc.getElementsByTagName('config'), 0);

        pkg = this;

        configs.forEach(function(node) {
            pkg.expandConfig(node, true);
        });

    } catch (e) {
        msg = e.message;
        if (this.getcfg('stack')) {
            msg += ' ' + e.stack;
        }
        msg = 'Error expanding package: ' + expanded + '. ' + msg;
        throw new Error(msg);
    } finally {
        this.popPackage();
    }

    return doc;
};


/**
 * Expands a single package configuration, resolving any embedded package
 * references and virtual paths which might be included.
 * @param {Element} anElement The config node to process and expand.
 * @param {Boolean} expandAll True to cause full expansion of nested packages
 *     and configurations.
 */
Package.prototype.expandConfig = function(anElement, expandAll) {

    var pkg,
        list;

    pkg = this;

    this.verbose('Expanding: ' +
        this.getCurrentPackage() + '#' + anElement.getAttribute('id'));

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
            doc,
            echo;

        if (child.nodeType === 1) {

            pkg.copyAttributes(anElement, child);

            switch (child.tagName) {
                case 'config':
                    ref = child.getAttribute('ref');
                    ref = pkg.expandReference(ref);
                    config = anElement.ownerDocument.getElementById(ref);
                    if (notValid(config)) {
                        msg = '<config> not found: ' +
                            pkg.getCurrentPackage() + '#' + ref;
                        throw new Error(msg);
                    }

                    key = pkg.getCurrentPackage() + '#' + ref;
                    if (pkg.configs.indexOf(key) !== -1) {
                        pkg.verbose('Ignoring duplicate reference to: ' + key);
                        break;
                    }

                    pkg.configs.push(key);
                    pkg.expandConfig(config, expandAll);

                    break;
                case 'echo':
                    value = child.getAttribute('message');
                    if (isEmpty(value)) {
                        try {
                            child.normalize();
                            text = child.childNodes[0];
                            value = text.data;
                        } catch (e) {
                            throw new Error('Unable to find message: ' +
                                serializer.serializeToString(child));
                        }
                    }

                    level = child.getAttribute('level');
                    if (notEmpty(level)) {
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
                        doc = parser.parseFromString(str);
                        echo = doc.childNodes[0];
                        pkg.copyAttributes(anElement, echo);

                        child.parentNode.replaceChild(echo, child);

                    } catch (e) {
                        msg = e.message;
                        if (pkg.stack) {
                            msg += ' ' + e.stack;
                        }
                        throw new Error('Error expanding: ' +
                            serializer.serializeToString(child) +
                            msg);
                    }

                    value = child.getAttribute('if');
                    if (notEmpty(value)) {
                        echo.setAttribute('if', value);
                    }

                    value = child.getAttribute('unless');
                    if (notEmpty(value)) {
                        echo.setAttribute('unless', value);
                    }

                    break;
              case 'img':
                    // similar to default case but we need to avoid messing with
                    // data urls.
                    src = child.getAttribute('src');
                    if (notEmpty(src) && src.indexOf('data:') !== 0) {
                        src = pkg.getFullPath(child, src);
                        child.setAttribute('src', src);
                    }
                    break;
                case 'package':
                    src = child.getAttribute('src');
                    src = pkg.getFullPath(child, src);
                    child.setAttribute('src', src);

                    config = child.getAttribute('config');
                    if (notEmpty(config)) {
                        config = pkg.expandReference(config);
                        child.setAttribute('config', config);
                    }

                    key = src + '#' + config; // may be undefined, that's ok.
                    if (pkg.configs.indexOf(key) !== -1) {
                        pkg.verbose('Ignoring duplicate reference to: ' + key);
                        break;
                    }

                    pkg.configs.push(key);
                    if (expandAll) {
                        pkg.expandAll(src);
                    } else {
                        pkg.expandPackage(src, config, child);
                    }

                    break;
                case 'property':
                    name = child.getAttribute('name');
                    value = child.getAttribute('value');

                    if (notEmpty(name) && notEmpty(value)) {
                        try {
                            str = '<script><![CDATA[' +
                                'TP.sys.setcfg(' +
                                '\'' + name + '\', ' +
                                pkg.getArgumentPrimitive(value) +
                                ');' +
                                ']]></script>';
                            doc = parser.parseFromString(str);
                            elem = doc.childNodes[0];
                            pkg.copyAttributes(anElement, elem);

                            child.parentNode.replaceChild(elem, child);

                        } catch (e) {
                            msg = e.message;
                            throw new Error('Error expanding: ' +
                                serializer.serializeToString(child) +
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
                    if (notEmpty(src)) {
                        src = pkg.getFullPath(child, src);
                        child.setAttribute('href', src);
                    }
                    src = child.getAttribute('src');
                    if (notEmpty(src)) {
                        src = pkg.getFullPath(child, src);
                        child.setAttribute('src', src);
                    }
                    break;
            }
        }
    });
};


/**
 * Expands any default values for required parameters and ensures we default
 * those which weren't provided.
 */
Package.prototype.expandOptions = function() {
    var option;

    // ---
    // includes
    // ---

    this.includes = [];
    option = this.getcfg('include');
    if (notEmpty(option)) {
        this.includes.concat(option.split(' '));
    }

    option = this.getcfg('scripts');
    if (option) {
        this.includes.concat(['echo', 'property', 'script']);
    }

    option = this.getcfg('styles');
    if (option) {
        this.includes.concat(['style']);
    }

    option = this.getcfg('images');
    if (option) {
        this.includes.concat(['img']);
    }

    // ---
    // excludes
    // ---

    this.excludes = [];
    option = this.getcfg('exclude');
    if (notEmpty(option)) {
        this.excludes.concat(option.split(' '));
    }
};


/**
 * Expands a package, resolving any embedded package references and virtual
 * paths which might be included.
 * @param {String} aPath The path to the package manifest file to be processed.
 * @param {String} aConfig The config ID within the package to be expanded.
 * @param {Element} anElement The optional package element being processed.
 * @return {Document} An xml document containing the expanded configuration.
 */
Package.prototype.expandPackage = function(aPath, aConfig, anElement) {

    var expanded;   // The expanded path equivalent.
    var xml;        // The xml string read from the top-level manifest.
    var doc;        // The xml DOM document object after parse.
    var config;     // The ultimate config ID being used.
    var node;       // Result of searching for our config by ID.
    var package;    // The package node from the XML doc.
    var msg;        // Error message construction variable.

    expanded = notEmpty(aPath) ? aPath : (this.getcfg('package') || Package.PACKAGE);
    expanded = this.expandPath(expanded);

    this.pushPackage(expanded);

    try {
        // If we've been through this package once before we can skip reading
        // and parsing the XML and jump directly to processing the config.
        doc = this.packages[expanded];
        if (!doc) {
            if (!sh.test('-e', expanded)) {
                msg = 'Unable to find package: ' + expanded;
                throw new Error(msg);
            }

            xml = fs.readFileSync(expanded, {encoding: 'utf8'});
            if (!xml) {
                msg = 'Unable to read package: ' + expanded;
                throw new Error(msg);
            }

            doc = parser.parseFromString(xml);
            if (!doc) {
                msg = 'Error parsing: ' + expanded;
                throw new Error(msg);
            }

            this.packages[expanded] = doc;
        }

        // If the package isn't valid stop right here.
        package = doc.getElementsByTagName('package')[0];
        if (!package) {
            return;
        }

        // Verify package has a name and version, otherwise it's not valid.
        if (this.getcfg('strict') &&
            (isEmpty(package.getAttribute('name')) ||
            isEmpty(package.getAttribute('version')))) {
            msg = 'Missing name or version on package: ' +
                serializer.serializeToString(package);
            throw new Error(msg);
        }

        if (isEmpty(aConfig)) {
            if (notValid(this.config)) {
                this.config = this.getcfg('config') || this.getDefaultConfig(doc);
            }
            config = this.config;
        } else {
            config = aConfig;
        }

        node = doc.getElementById(config);
        if (!node) {
            msg = '<config> not found: ' +
                this.getCurrentPackage() + '#' + config;
            throw new Error(msg);
        }

        // Any properties on the current package element (if available) should
        // be carried over to the config in question.
        if (isValid(anElement)) {
            this.copyAttributes(anElement, node);
        }

        // Note that this may ultimately result in calls back into this routine
        // if the config in question has embedded package references.
        this.expandConfig(node);
    } catch (e) {
        msg = e.message;
        if (this.getcfg('stack')) {
            msg += ' ' + e.stack;
        }
        msg = 'Error expanding package: ' + expanded + '. ' + msg;
        throw new Error(msg);
    } finally {
        this.popPackage();
    }

    return doc;
};


/**
 * Expands a TIBET virtual path to its equivalent non-virtual path.
 * @param {String} aPath The path to be expanded.
 * @return {String} The fully-expanded path value.
 */
Package.prototype.expandPath = function(aPath) {

    var path,
        parts,
        virtual;

    // If we've done this one before just return it.
    path = this.paths[aPath];
    if (path) {
        return path;
    }

    // TIBET virtual paths all start with '~'
    if (aPath.indexOf('~') === 0) {

        if (aPath === '~' ||
            aPath === '~app' ||
            aPath === '~app_root') {
            return this.getAppRoot();
        } else if (aPath === '~tibet' ||
                   aPath === '~lib' ||
                   aPath === '~lib_root') {
            return this.getLibRoot();
        } else {
            parts = aPath.split('/');
            virtual = parts.shift();

            // If the path was ~/...something it's app_root prefixed.
            if (virtual === '~' ||
                virtual === '~app' ||
                virtual === '~app_root') {
                path = this.getAppRoot();
            } else if (virtual === '~tibet' ||
                       virtual === '~lib' ||
                       virtual === '~lib_root') {
                path = this.getLibRoot();
            } else {
                // Keys are of the form: path.app_root etc. so adjust.
                path = this.getcfg('path.' + virtual.slice(1));
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
            path = this.expandPath(path);
        }

    } else {
        path = aPath;
    }

    // Cache the result so we avoid doing any path more than once.
    this.paths[aPath] = path;

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
Package.prototype.expandReference = function(aRef) {

    var ref;

    if (aRef && aRef.indexOf('{') === 0) {
        ref = this.getcfg(aRef.slice(1, -1));
        if (isEmpty(ref)) {
            this.error('Unresolved property reference: ' + aRef);
            return aRef;
        }
        return ref;
    } else {
        return aRef;
    }
};


/**
 * Returns the application root directory, the path where the PROJECT_FILE is
 * found.
 */
Package.prototype.getAppRoot = function() {

    var cwd;        // Where are we being run?
    var file;       // What file are we looking for?

    // Return cached value if available.
    if (this.app_root) {
        return this.app_root;
    }

    // Check command line options and tibet.json configuration data. NOTE that
    // we can't use getcfg() here due to ordering/bootstrapping considerations.
    if (this.options && this.options.app_root) {
        this.app_root = this.options.app_root;
        return this.app_root;
    } else if (this.tibet && this.tibet.app_root) {
        this.app_root = this.tibet.app_root;
        return this.app_root;
    }

    // Walk the directory path from cwd "up" checking for the signifying file
    // which tells us we're in a TIBET project.
    cwd = process.cwd();
    file = Package.PROJECT_FILE;
    while (cwd.length > 0) {
        if (sh.test('-f', path.join(cwd, file))) {
            this.app_root = cwd;
            break;
        }
        cwd = cwd.slice(0, cwd.lastIndexOf(path.sep));
    }


    // Not everything happens in a project. Some things can still function with
    // respect to lib_root etc.
    if (notValid(this.app_root)) {
        this.debug('Unable to find app_root.');
        return;
    }

    this.debug('Using app_root: ' + this.app_root);

    return this.app_root;
};


/**
 * Returns the library root directory, the path where the tibet library is
 * found.
 */
Package.prototype.getLibRoot = function() {

    var app_root,
        root,
        testpath;

    // Return cached value if available.
    if (this.lib_root) {
        return this.lib_root;
    }

    // Check command line options and tibet.json configuration data. NOTE that
    // we can't use getcfg() here due to ordering/bootstrapping considerations.
    if (this.options && this.options.lib_root) {
        this.lib_root = this.options.lib_root;
        return this.lib_root;
    } else if (this.tibet && this.tibet.lib_root) {
        this.lib_root = this.tibet.lib_root;
        return this.lib_root;
    }

    // App root will be empty if we're not in a project.
    app_root = this.getAppRoot();
    if (notEmpty(app_root)) {
        root = app_root;
    } else {
        root = process.env.TIBET_HOME;
        if (isEmpty(root)) {
            this.debug('Unable to find lib_root.');
            return;
        }
    }

    testpath = path.join(root, 'node_modules');

    // Look around for node_modules, then try to find tibet3 and/or tibet.
    if (!sh.test('-e', testpath)) {
        // TODO: verify 'base/lib' is where we continue to put TIBET in projects
        // which aren't using Node.js for their servers. And make this a
        // constant once we've done that.
        testpath = path.join(root, 'TIBET-INF/base/lib/');
        if (sh.test('-e', testpath)) {
            this.lib_root = testpath;
            return this.lib_root;
        }
    } else {
        // TODO: remove '3' when ready.
        testpath = path.join(root, 'node_modules/tibet3');
        if (sh.test('-e', testpath)) {
            this.lib_root = testpath;
            return this.lib_root;
        }
    }

    // Another option is that we're in the TIBET lib itself...
    testpath = path.join(root, 'base/cfg/TIBET.xml');
    if (sh.test('-e', testpath)) {
        this.lib_root = root;
        return this.lib_root;
    }

    this.debug('Unable to find lib_root.');
};


/**
 * Return the primitive value from a string value. This routine can help to
 * process property tag values during expansion so we end up invoking setcfg
 * with the right kind of value.
 * @param {String} value The value to convert.
 * @return {Object} The converted value.
 */
Package.prototype.getArgumentPrimitive = function(value) {
    if (notValid(value)) {
        return value;
    }

    // Try to convert to number, boolean, regex,
    if (Package.NUMBER_REGEX.test(value)) {
        return 1 * value;
    } else if (Package.BOOLEAN_REGEX.test(value)) {
        return value === 'true';
    } else if (Package.REGEX_REGEX.test(value)) {
        return new RegExp(value.slice(1, -1));
    } else if (Package.OBJECT_REGEX.test(value)) {
        try {
            JSON.parse(value);
        } catch (e) {
            return value;
        }
    } else {
        return value;
    }
};


/**
 * A simple alternative to TP.sys.getcfg() used in the boot system and elsewhere
 * in TIBET. This version will look in command line options followed by any
 * loaded TIBET configuration data for the property in question.
 * @param {string} property The name of the property to look up.
 * @return {Object} The property value.
 */
Package.prototype.getcfg = function(property) {
    var name;
    var value;
    var keys;
    var cfg;
    var pkg;

    if (!property) {
        return this.cfg;
    }

    // Make simple access as fast as possible.
    value = this.cfg[property];
    if (value !== undefined) {
        return value;
    }

    // Secondary check is for prefixed lookups.
    if (/\./.test(property)) {
        name = property.replace(/\./g, '_');
        return this.cfg[name];
    }

    // When no '.' indicating a prefix we find all keys with a matching
    // prefix and return them.
    cfg = {};
    pkg = this;

    keys = Object.keys(this.cfg);
    keys.forEach(function(key) {
        if (key.indexOf(property) === 0) {
            cfg[key] = pkg.cfg[key];
        }
    });

    // Now, if we thought we were going after a set...but only found one (or
    // no) value, return just the individual lookup.
    if (Object.keys(cfg).length < 2) {
        return this.cfg[name];
    }

    return cfg;
};


/**
 * Returns the file name of the currently processing package.
 * @return {string} The package file name.
 */
Package.prototype.getCurrentPackage = function() {
    return this.packageStack[0];
};


/**
 * Returns the default configuration from the package document provided.
 * @param {Document} aPackageDoc The XML package document to use for defaulting.
 * @return {String} The configuration ID which is the default.
 */
Package.prototype.getDefaultConfig = function(aPackageDoc) {

    var package,
        msg;

    package = aPackageDoc.getElementsByTagName('package')[0];
    if (notValid(package)) {
        msg = '<package> tag missing: ' + path;
        throw new Error(msg);
    }
    // TODO: rename to 'all' in config files etc?
    // TODO: make this default of 'full' a constant?
    return package.getAttribute('default') || 'full';
};


/**
 * Returns a full path by using any basedir information in anElement and
 * blending it with any virtual or relative path information from aPath.
 * @param {Element} anElement The element from which to begin basedir lookups.
 * @param {String} aPath The path to resolve into a full path.
 * @return {string} The fully-expanded path.
 */
Package.prototype.getFullPath = function(anElement, aPath) {

    var elem,
        base;

    if (isEmpty(aPath)) {
        return;
    }

    if (this.isVirtualPath(aPath)) {
        return this.expandPath(aPath);
    }

    if (this.isAbsolutePath(aPath)) {
        return aPath;
    }

    elem = anElement;
    while (elem) {
        base = elem.getAttribute('basedir');
        if (notEmpty(base)) {
            return this.expandPath(path.join(base, aPath));
        }
        elem = elem.parentNode;
    }
};


/**
 * Returns a TIBET virtual path from its equivalent non-virtual path.
 * @param {String} aPath The path to be virtualized.
 * @return {String} The virtualized path value.
 */
Package.prototype.getVirtualPath = function(aPath) {

    var path,
        app_root = this.getAppRoot(),
        lib_root = this.getLibRoot();

    // Don't try to do this until we've computed the proper root paths.
    if (!app_root || !lib_root) {
      return aPath;
    }

    path = aPath.replace(this.expandPath('~app_cfg'), '~app_cfg');
    path = path.replace(this.expandPath('~lib_cfg'), '~lib_cfg');
    path = path.replace(this.expandPath('~app_src'), '~app_src');
    path = path.replace(this.expandPath('~lib_src'), '~lib_src');
    path = path.replace(this.expandPath('~'), '~');
    path = path.replace(this.expandPath('~tibet'), '~tibet');

    return path;
};


/**
 * Returns true if the element's tag name is specifically listed in the assets
 * to be output. This is necessary for proper package/config output since
 * they're always passed from a filtering perspective, but rarely output.
 * @param {Element} anElement The element to filter.
 */
Package.prototype.ifAssetListed = function(anElement) {
    var tag;

    if (notValid(anElement)) {
        return false;
    }
    tag = anElement.tagName;

    return this.includes.indexOf(tag) !== -1;
};


/**
 * Returns true if the element's tag name passes any asset-type filtering which
 * is in place. Asset filtering is done via tag name and controlled by the
 * include and exclude options and their content (or lack of it).
 * @param {Element} anElement The element to filter.
 */
Package.prototype.ifAssetPassed = function(anElement) {
    var tag;

    if (notValid(anElement)) {
        return false;
    }
    tag = anElement.tagName;

    // Can't traverse if we don't always clear these two.
    if (tag === 'package' || tag === 'config') {
        return true;
    }

    // Specifically excluded? That's simple enough.
    if (this.excludes.indexOf(tag) !== -1) {
        return false;
    }

    // Not excluded and we have no specific includes data? Passed.
    if (isEmpty(this.includes)) {
        return true;
    }

    return this.includes.indexOf(tag) !== -1;
};


/**
 */
Package.prototype.ifUnlessPassed = function(anElement) {

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
        value,
        invalid;

    invalid = false;

    //  process any unless="a b c" entries on the element
    condition = anElement.getAttribute('unless');
    if (notEmpty(condition)) {
        conditions = condition.split(' ');
        for (i = 0; i < conditions.length; i++) {
            key = conditions[i].trim();
            if (Package.KV_REGEX.test(key)) {
                key = key.split('=');
                value = this.getArgumentPrimitive(key[1].trim());
                key = key[0].trim();
            } else {
                value = true;
            }

            condition = this.getcfg(key);
            if (condition === value) {
                invalid = true;
                break;
            }
        }
    }

    //  process any if="a b c" entries on the element
    condition = anElement.getAttribute('if');
    if (notEmpty(condition)) {
        conditions = condition.split(' ');
        for (i = 0; i < conditions.length; i++) {
            key = conditions[i].trim();
            if (Package.KV_REGEX.test(key)) {
                key = key.split('=');
                value = this.getArgumentPrimitive(key[1].trim());
                key = key[0].trim();
            } else {
                value = true;
            }

            condition = this.getcfg(key);
            if (notValid(condition) || condition !== value) {
                invalid = true;
                break;
            }
        }
    }

    return !invalid;
};


/**
 * Returns true if the path provided appears to be an aboslute path. Note that
 * this will return true for TIBET virtual paths since they are absolute paths
 * when expanded.
 * @param {string} aPath The path to be tested.
 * @return {Boolean} True if the path is absolute.
 */
Package.prototype.isAbsolutePath = function(aPath) {
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
 * Returns true if the path provided appears to be a virtual path.
 * @param {string} aPath The path to be tested.
 * @return {Boolean} True if the path is virtual.
 */
Package.prototype.isVirtualPath = function(aPath) {
    return aPath.indexOf('~') === 0;
};


/**
 * Lists assets from a package. The assets will be concatenated into aList if
 * the list is provided (aList is used during recursive calls from within
 * this routine to build up the list).
 * @param {string} aPath The path to the package manifest to list.
 * @param {Array.<>} aList The array of asset descriptions to expand upon.
 * @return {Array.<>} The asset array.
 */
Package.prototype.listAllAssets = function(aPath, aList) {

    var path,
        configs,
        doc,
        result,
        pkg,
        msg;

    path = notEmpty(aPath) ? aPath : (this.getcfg('package') || Package.PACKAGE);
    path = this.expandPath(path);

    this.pushPackage(path);

    try {
        doc = this.packages[path];
        if (notValid(doc)) {
            msg = 'Unable to list unexpanded package: ' + aPath;
            throw new Error(msg);
        }

        // If aList is empty we're starting fresh which means we need a fresh
        // asset-uniquing dictionary.
        if (!aList) {
            this.assets = {};
        }
        result = aList || [];

        configs = Array.prototype.slice.call(
            doc.getElementsByTagName('config'), 0);

        pkg = this;

        configs.forEach(function(node) {
            pkg.listConfigAssets(node, result, true);
        });

    } finally {
        this.popPackage(path);
    }

    return result;
};


/**
 * Lists assets from a package configuration. The assets will be concatenated
 * into aList if the list is provided (aList is used during recursive calls from
 * within this routine to build up the list).
 * @param {Element} anElement The config element to begin listing from.
 * @param {Array.<>} aList The array of asset descriptions to expand upon.
 * @param {Boolean} listAll True to cause full listing of nested packages.
 * @return {Array.<>} The asset array.
 */
Package.prototype.listConfigAssets = function(anElement, aList, listAll) {

    var pkg,
        list,
        result;

    pkg = this;

    // If aList is empty we're starting fresh which means we need a fresh
    // asset-uniquing dictionary.
    if (notValid(aList)) {
        this.assets = {};
    }
    result = aList || [];

    // Don't assume the config itself shouldn't be filtered.
    if (!pkg.ifUnlessPassed(anElement)) {
        return result;
    }

    list = Array.prototype.slice.call(anElement.childNodes, 0);
    list.forEach(function(child) {

        var ref,
            src,
            key,
            config,
            nodes,
            msg;

        nodes = pkg.getcfg('nodes');

        if (child.nodeType === 1) {

            if (!pkg.ifUnlessPassed(child)) {
                pkg.debug('ifUnless filtered: ' +
                    serializer.serializeToString(child));
                return;
            }

            if (!pkg.ifAssetPassed(child)) {
                pkg.debug('ifAsset filtered: ' +
                    serializer.serializeToString(child));
                return;
            }

            switch (child.tagName) {
                case 'config':
                    ref = child.getAttribute('ref');

                    config = anElement.ownerDocument.getElementById(ref);
                    if (notValid(config)) {
                        msg = '<config> not found: ' + ref;
                        throw new Error(msg);
                    }

                    key = pkg.getCurrentPackage() + '#' + ref;
                    if (pkg.configs.indexOf(key) !== -1) {
                        pkg.verbose('Ignoring duplicate reference to: ' + key);
                        break;
                    }

                    pkg.configs.push(key);

                    if (pkg.ifAssetListed(child)) {
                        result.push(child);
                    }

                    pkg.listConfigAssets(config, result, listAll);
                    break;
                case 'echo':
                    // Shouldn't exist, these should have been converted into
                    // <script> tags calling TP.boot.$stdout.
                    break;
                case 'package':
                    src = child.getAttribute('src');
                    config = child.getAttribute('config');

                    if (isEmpty(src)) {
                        msg = '<package> missing src: ' +
                            serializer.serializeToString(child);
                        throw new Error(msg);
                    }

                    key = src + '#' + config; // may be undefined, that's ok.
                    if (pkg.configs.indexOf(key) !== -1) {
                        pkg.verbose('Ignoring duplicate reference to: ' + key);
                        break;
                    }

                    pkg.configs.push(key);

                    if (pkg.ifAssetListed(child)) {
                        result.push(child);
                    }

                    if (listAll) {
                        pkg.listAllAssets(src, result);
                    } else {
                        pkg.listPackageAssets(src, config, result);
                    }
                    break;
                case 'property':
                    // Shouldn't exist, these should have been converted into
                    // <script> tags calling TP.boot.$stdout. If it's still here
                    // then it's missing either a name or value attribute.
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
                    if (notEmpty(src)) {
                        // Unique the things we push by checking and caching
                        // entries as we go.
                        if (notValid(pkg.asset_paths[src])) {
                            pkg.asset_paths[src] = src;
                            if (nodes) {
                                child.setAttribute('load_package',
                                                  pkg.getCurrentPackage());
                                child.setAttribute('load_config',
                                                  anElement.getAttribute('id'));
                                result.push(child);
                            } else {
                                result.push(src);
                            }
                        } else {
                            pkg.verbose('Skipping duplicate asset: ' + src);
                        }
                    } else {
                        if (nodes) {
                            child.setAttribute('load_package',
                                              pkg.getCurrentPackage());
                            child.setAttribute('load_config',
                                              anElement.getAttribute('id'));
                            result.push(child);
                        }
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
Package.prototype.listPackageAssets = function(aPath, aConfig, aList) {

    var path,
        config,
        doc,
        node,
        result,
        msg;

    path = notEmpty(aPath) ? aPath : (this.getcfg('package') || Package.PACKAGE);
    path = this.expandPath(path);

    this.pushPackage(path);

    try {
        doc = this.packages[path];
        if (notValid(doc)) {
            msg = 'Unable to list unexpanded package: ' + aPath;
            throw new Error(msg);
        }

        // Determine the configuration we'll be listing. Note we rely on having
        // been through a defaulting process during package expansion to have
        // set this.config earlier.
        if (isEmpty(aConfig)) {
            config = this.config;
        } else {
            config = aConfig;
        }

        node = doc.getElementById(config);
        if (notValid(node)) {
            msg = '<config> not found: ' + config;
            throw new Error(msg);
        }

        // If aList is empty we're starting fresh which means we need a fresh
        // asset-uniquing dictionary.
        if (!aList) {
            this.asset_paths = {};
        }
        result = aList || [];
        this.listConfigAssets(node, result);
    } finally {
        this.popPackage(path);
    }

    return result;
};


/**
 * Loads baseline TIBET configuration data including default property settings
 * and virtual path definitions.
 */
Package.prototype.loadTIBETBaseline = function() {
    this.loadTIBETProperties();
};


/**
 * Loads TIBET's baseline properties. The settings of these properties can be
 * involved in filtering for if/unless testing. Properties loaded via this
 * approach can be overwritten by the tibet.json file and/or command line.
 */
Package.prototype.loadTIBETProperties = function() {

    var lib_root;

    lib_root = this.getLibRoot();

    // NOTE this relies upon TP.sys.setcfg having been properly configured.
    require(path.join(lib_root, 'base/lib/tibet/src/tibet_cfg.js'));
};


/**
 * Pops an entry off the current stack of packages which are being processed as
 * part of an expansion.
 */
Package.prototype.popPackage = function() {

    var path;

    path = this.packageStack.shift();

    // When we pop the last package off the stack we clear the config list. This
    // allows the expand and listing phases to both do uniquing via configs.
    if (this.packageStack.length === 0) {
        this.configs.length = 0;
    }

    this.verbose('Popping package: ' + path);

    return path;
};


/**
 * Pushes a package path onto the currently processing package name stack.
 * @param {string} aPath The package's full path.
 */
Package.prototype.pushPackage = function(aPath) {

    this.verbose('Pushing package: ' + aPath);

    this.packageStack.unshift(aPath);
};


/**
 * Processes any content from the local project file into proper configuration
 * parameter values.
 */
Package.prototype.setProjectOptions = function() {

    var pkg;
    var msg;

    // We need app root to load tibet.json, which hopefully has additional
    // configuration information we can leverage such as the lib_root path.
    try {
        root = this.getAppRoot();
        if (isEmpty(root)) {
            // If we're not in a project that's ok. Not everything
            // we'll do with a Package instance relies on being in a project.
            return;
        }
    } catch (e) {
        // Ignore if we're simply not in a project that's ok. Not everything
        // we'll do with a Package instance relies on being in a project.
        return;
    }

    try {
        this.tibet = require(path.join(root, Package.PROJECT_FILE)) || {};
    } catch (e) {
        msg = 'Error loading config file: ' + e.message;
        if (this.options.stack === true) {
            msg += ' ' + e.stack;
        }
        throw new Error(msg);
    }

    pkg = this;

    Object.keys(this.tibet).forEach(function(key) {
        var value;

        value = pkg.tibet[key];

        // If the value isn't a primitive it means the key was initially
        // provided with a prefix. We'll need to recreate that to store the
        // data properly.
        if (Object.prototype.toString.call(value) === '[object Object]') {

            Object.keys(value).forEach(function(subkey) {
                var name;

                name = key + '.' + subkey;
                TP.sys.setcfg(name, value[subkey]);
            });
        } else {
            TP.sys.setcfg(key, value);
        }
    });
};


/**
 * Processes any command line options and maps them into the overall
 * configuration map. This allows getcfg to be used as the single source of
 * information on what flags are set.
 */
Package.prototype.setRuntimeOptions = function() {

    var pkg;

    pkg = this;

    Object.keys(this.options).forEach(function(key) {
        var value;

        value = pkg.options[key];

        // If the value isn't a primitive it means the key was initially
        // provided with a prefix. We'll need to recreate that to store the
        // data properly.
        if (Object.prototype.toString.call(value) === '[object Object]') {
            Object.keys(value).forEach(function(subkey) {
                var name;

                name = key + '.' + subkey;
                TP.sys.setcfg(name, value[subkey]);
            });
        } else {
            TP.sys.setcfg(key, value);
        }
    });
};


//  ---
//  Logging API
//  ---

/*
 * Color theme:
 *
 *  log: 'grey',
 *  info: 'white',
 *  warn: 'yellow',
 *  error: 'red',
 *  debug: 'magenta',
 *  verbose: 'cyan',
 *  system: 'green'
 */

Package.prototype.log = function(msg) {
    if (this.getcfg('silent')) {
        return;
    }

    if (!this.getcfg('color')) {
        return console.log(msg);
    }
    console.log(chalk.grey(msg));
};

Package.prototype.info = function(msg) {
    if (this.getcfg('silent')) {
        return;
    }

    if (!this.getcfg('color')) {
        return console.info(msg);
    }
    console.info(chalk.white(msg));
};

Package.prototype.warn = function(msg) {
    if (this.getcfg('silent')) {
        return;
    }

    if (!this.getcfg('color')) {
        return console.warn(msg);
    }
    console.warn(chalk.yellow(msg));
};

Package.prototype.error = function(msg) {
    if (this.getcfg('silent')) {
        return;
    }

    if (!this.getcfg('color')) {
        return console.error(msg);
    }
    console.error(chalk.red(msg));
};

Package.prototype.debug = function(msg) {
    if (this.getcfg('silent')) {
        return;
    }

    if (!this.getcfg('debug')) {
        return;
    }

    if (!this.getcfg('color')) {
        return console.log(msg);
    }
    console.log(chalk.magenta(msg));
};

Package.prototype.verbose = function(msg) {
    if (this.getcfg('silent')) {
        return;
    }

    if (!this.getcfg('verbose')) {
        return;
    }

    if (!this.getcfg('color')) {
        return console.log(msg);
    }
    console.log(chalk.cyan(msg));
};

Package.prototype.system = function(msg) {
    if (this.getcfg('silent')) {
        return;
    }

    if (!this.getcfg('color')) {
        return console.log(msg);
    }
    console.log(chalk.green(msg));
};

//  ---
//  Export
//  ---

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = Package;
    }
    exports.Package = Package;
} else {
    root.Package = Package;
}

}(this));
