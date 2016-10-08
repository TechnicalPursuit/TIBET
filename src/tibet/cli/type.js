//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet type' command. Clones tag/type dna to create new
 *     application components.
 */
//  ========================================================================

/* eslint indent:0 */

(function() {

'use strict';

var CLI,
    path,
    Package,
    Cmd;

CLI = require('./_cli');
path = require('path');
Package = require('../../../etc/common/tibet_package.js');

//  ---
//  Type Construction
//  ---

Cmd = function() {};
Cmd.Parent = require('./_dna');
Cmd.prototype = new Cmd.Parent();

//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;

/**
 * Where are the dna templates we should clone from? This value will be joined
 * with the current file's load path to create the absolute root path.
 * @type {string}
 */
Cmd.prototype.DNA_ROOT = '../dna/';

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'type';

//  ---
//  Instance Attributes
//  ---

/**
 * Whether the command needs --force when a destination directory already
 * exists. Clone does, type commands don't.
 * @type {Boolean}
 */
Cmd.prototype.NEEDS_FORCE = false;

/**
 * The name of the default key for template substitutions.
 * @type {String}
 */
Cmd.prototype.TEMPLATE_KEY = 'typename';

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE =
    'tibet type [--name] [[<root>.]<namespace>:]<typename> [--dir <dirname>]' +
    ' [--dna <template>] [--package <pkgname>] [--config <cfgname>]';

//  ---
//  Instance Methods
//  ---

/**
 * Check arguments and configure default values prior to running prereqs.
 * @return {Object}
 */
Cmd.prototype.configure = function() {
    var options,
        name,
        parts,
        inProj;

    options = this.options;

    name = options._[1] || options.name || '';

    inProj = CLI.inProject();

    options.appname = options.appname ||
        inProj ? CLI.cfg('npm.name') : '';

    parts = name.split(/[\.:]/g);
    switch (parts.length) {
        case 3:
            options.nsroot = parts[0];
            options.nsname = parts[1];
            options.name = parts[2];
            break;

        case 2:
            options.nsroot = inProj ? 'APP' : 'TP';
            options.nsname = parts[0];
            options.name = parts[1];
            break;

        case 1:
            options.nsroot = inProj ? 'APP' : 'TP';
            if (inProj) {
                options.nsname = options.appname;
            } else {
                this.error('Cannot default namespace for lib tag: ' + name);
                return null;
            }
            options.name = parts[0];
            break;

        default:
            break;
    }

    options.dna = options.dna || this.DNA_DEFAULT;

    options[this.TEMPLATE_KEY] = options.name;

    return options;
};


/**
 * Updates the receiver's configuration data based on any configuration data
 * pulled in from the DNA directory. This allows each dna template to provide
 * custom values for certain configuration parameters.
 * @param {Object} config The dna-specific configuration object.
 */
Cmd.prototype.configureForDNA = function(config) {
    var options,
        inProj,
        inLib,
        root,
        ns,
        tail,
        dest,
        obj;

    options = this.options;

    inProj = CLI.inProject();
    inLib = CLI.inLibrary();

    obj = CLI.blend({}, options);

    if (inProj && config && config.APP) {
        obj = CLI.blend(obj, config.APP);
    } else if (inLib && config && config.LIB) {
        obj = CLI.blend(obj, config.LIB);
    }

    if (config && config.default) {
        obj = CLI.blend(obj, config.default);
    }

    this.verbose(CLI.beautify(JSON.stringify(obj)));

    CLI.blend(options, obj);

    if (!options.super) {
        root = options.nsroot;
        ns = options.nsname;
        tail = 'Object';
        if (inProj) {
            root = root || 'APP';
            ns = ns || options.appname;
        } else if (inLib) {
            root = root || 'TP';
            ns = ns || 'core';
        }
        options.super = root + '.' + ns + '.' + tail;
    }

    //  ---
    //  package/pkgname
    //  ---

    options.pkgname = options.pkgname || options.package;

    if (CLI.isEmpty(options.pkgname)) {
        options.pkgname = inProj ?
            '~app_cfg/' + CLI.getcfg('npm.name') + '.xml' :
            '~lib_cfg/lib_namespaces.xml';
    }

    if (options.pkgname.charAt(0) !== '~') {
        if (CLI.inProject()) {
            options.pkgname = path.join('~app_cfg', options.pkgname);
        } else {
            options.pkgname = path.join('~lib_cfg', options.pkgname);
        }
    }

    if (!/.xml$/.test(options.pkgname)) {
        options.pkgname = options.pkgname + '.xml';
    }

    if (options.pkgname.charAt(0) === '~') {
        options.pkgname = CLI.expandPath(options.pkgname);
    }

    //  ---
    //  config/cfgname
    //  ---

    options.cfgname = options.cfgname || options.config;
    if (CLI.isEmpty(options.cfgname)) {
        options.cfgname = inProj ? 'scripts' : options.nsname;
    }

    //  ---
    //  dir/dirname
    //  ---

    options.dirname = options._[2] || options.dirname || options.dir;

    if (CLI.isEmpty(options.dirname)) {

        options.dirname = inProj ? '~app_src/' :
            '~lib_src/' + options.nsname;

        options.dirname = path.join(options.dirname,
            options.nsname + '.' + options.name);

        dest = CLI.expandPath(options.dirname);
        options.dest = dest;
    }

    this.verbose(CLI.beautify(JSON.stringify(options)));

    return 0;
};


/**
 * Performs any updates to the application package that are needed. The default
 * implementation simply returns.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executePackage = function() {
    var options,
        code,
        cmd,
        dirty,
        written,
        pak,
        assets,
        products,
        tests,
        pkgOpts,
        cfgName,
        pkgName,
        cfgNode;

    options = this.options;
    cmd = this;
    code = 0;

    this.log('adjusting package entries...');

// ---

    pkgName = options.pkgname;
    cfgName = options.cfgname;

    //  This may build the node if not currently found.
    cfgNode = this.readConfigNode(pkgName, cfgName, true);
    if (!cfgNode) {
        this.error('Unable to find ' + pkgName + '#' + cfgName);
        return 1;
    }

    //  Get package information in expanded form so we can check against any
    //  potentially nested config structures. Being able to nest makes it easy
    //  to iterate while still being able to organize into different config
    //  bundles for different things (like sherpa vs. test vs. xctrls).
    pkgOpts = {
        package: pkgName,
        config: cfgName,
        all: false,
        scripts: true,        //  The magic one...without this...no output.
        resources: true,
        nodes: false,
        phase: 'all',
        boot: {
            phase_one: true,
            phase_two: true
        }
    };

    //  split products into code vs. test chunks since we use a different config
    //  for tests no matter what the product config name is.

    products = this.products;

    tests = products.filter(function(pair) {
        return /_test\.js$/.test(pair[1]);
    });

    //  Remove tests from the "scripts" list.
    products = products.filter(function(pair) {
        return !/_test\.js$/.test(pair[1]);
    });

    //  Also don't pass css/xhtml files that could be computed easily.
    products = products.filter(function(pair) {
        var script;

        if (/\.js$/.test(pair[1])) {
            return true;
        }

        script = pair[1].slice(0, pair[1].lastIndexOf('.')) + 'js';

        return products.some(function(item) {
            return item[1] === script;
        });
    });


    //  ---
    //  code/resources
    //  ---

    pak = new Package(pkgOpts);
    pak.expandPackage();
    assets = pak.listPackageAssets();
    assets = assets.map(function(asset) {
        return CLI.getVirtualPath(asset);
    });

    //  Process the individual files, checking for existence and adding any that
    //  are missing from the resource config.
    products.forEach(function(pair) {
        var value,
            file,
            tag,
            str;

        file = pair[1];
        value = CLI.getVirtualPath(file);
        tag = cmd.getTag(file);
        str = '<' + tag + ' src="' + value + '"/>';

        if (assets.indexOf(value) === -1) {
            dirty = true;
            cmd.addXMLLiteral(cfgNode, '\n');
            cmd.addXMLEntry(cfgNode, '    ', str, '');
            cmd.log(str + ' (added)');
        } else {
            cmd.log(str + ' (exists)');
        }
    });

    if (dirty) {
        this.addXMLLiteral(cfgNode, '\n');
        this.writeConfigNode(pkgName, cfgNode);
        written = true;
    }

    //  ---
    //  tests
    //  ---

    cfgName = 'tests';

    //  This may build the node if not currently found.
    cfgNode = this.readConfigNode(pkgName, cfgName, true);
    if (!cfgNode) {
        this.error('Unable to find ' + pkgName + '#' + cfgName);
        return 1;
    }

    pkgOpts.config = cfgName;
    pak = new Package(pkgOpts);
    pak.expandPackage();
    assets = pak.listPackageAssets();
    assets = assets.map(function(asset) {
        return CLI.getVirtualPath(asset);
    });

    //  Process the individual files, checking for existence and adding any that
    //  are missing from the resource config.
    tests.forEach(function(pair) {
        var value,
            file,
            tag,
            str;

        file = pair[1];
        value = CLI.getVirtualPath(file);
        tag = cmd.getTag(file);
        str = '<' + tag + ' src="' + value + '"/>';

        if (assets.indexOf(value) === -1) {
            dirty = true;
            cmd.addXMLLiteral(cfgNode, '\n');
            cmd.addXMLEntry(cfgNode, '    ', str, '');
            cmd.log(str + ' (added)');
        } else {
            cmd.log(str + ' (exists)');
        }
    });

    if (dirty) {
        this.addXMLLiteral(cfgNode, '\n');
        this.writeConfigNode(pkgName, cfgNode);
    }

    if (written) {
        this.warn('New configuration entries created. Review/Rebuild as needed.');
    }

// ---

    this.executeCleanup(code);

    this.info('Type DNA \'' + path.basename(options.dna) +
        '\' cloned to ' + options.dirname +
        ' as \'' + options.name + '\'.');

    return code;
};


/**
 * Returns the best tag to use in a TIBET <config> for the file provided. The
 * determination is based largely on file extension.
 * @param {String} file The file name to check.
 * @returns {String} The best tag name (usually script or resource).
 */
Cmd.prototype.getTag = function(file) {
    var tag;

    if (/\.js$|\.jscript$/.test(file)) {
        tag = 'script';
    } else {
        tag = 'resource';
    }

    return tag;
};


/**
 * TODO
 */
Cmd.prototype.getTemplateParameters = function() {
    var options,
        obj,
        name,
        dna,
        params;

    if (this.params) {
        return this.params;
    }

    options = this.options;

    name = options.name;
    dna = options.dna;

    //  NOTE that we don't use the full path for the dna reference here to avoid
    //  embedding real paths in the output.
    obj = {};
    obj[this.TEMPLATE_KEY] = name;
    obj.dna = dna.slice(dna.lastIndexOf(path.sep) + 1);

    obj.nsroot = options.nsroot;
    obj.nsname = options.nsname;

    params = CLI.blend(obj, options);
    this.params = params;

    this.verbose(CLI.beautify(JSON.stringify(params)));

    return params;
};


module.exports = Cmd;

}());
