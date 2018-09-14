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

/* eslint indent:0, consistent-this:0 */

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

Cmd = function() { /* init */ };
Cmd.Parent = require('./_dna');     // NOTE we inherit from 'dna' command.
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
 * with the current file's load path to create the absolute root path. NOTE here
 * the dna is below a command-specific subdirectory of dna/type.
 * @type {string}
 */
Cmd.prototype.DNA_ROOT = '../dna/type/';

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
    'tibet type [--name] [[<root>.]<namespace>:]<typename> [--supertype <typename>]' +
    ' [--dir <dirname>] [--dna <template>] [--package <pkgname>] [--config <cfgname>]';

//  ---
//  Instance Methods
//  ---

/**
 * Check arguments and configure default values prior to running prereqs.
 * @returns {Object}
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

    this.trace(CLI.beautify(JSON.stringify(obj)));

    CLI.blend(options, obj);

    if (!options.supertype) {
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
        options.supertype = root + '.' + ns + '.' + tail;
    }

    options.typename = root + '.' + ns + '.' + options.name;

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

    this.trace(CLI.beautify(JSON.stringify(options)));

    return 0;
};


/**
 * Clone the DNA content to a working directory prior to individual file
 * processing (templating etc.); This working directory will be processed
 * and/or relocated once the file content has been processed.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executeClone = function() {
    var options,
        result,
        renamer,
        arr,
        inProj,
        parts,
        dna,
        dnaroot,
        dnans,
        dnaname,
        root,
        ns,
        name,
        text;

    options = this.options;
    inProj = CLI.inProject();

    dna = path.basename(options.dna);

    if (!/:|\./.test(dna)) {
        return Cmd.Parent.prototype.executeClone.apply(this, arguments);
    }

    this.log('querying source type for resource data...');

    //  Have to use reflection to find the source file for the tag in question.
    //  Armed with that we can copy and then 'sed' references to the original
    //  tag into their new tag name counterparts.
    result = CLI.sh.exec('tibet resource --no-color --raw --type ' +
            dna, {
        silent: CLI.options.silent !== true
    });

    if (result.code !== 0) {
        throw new Error(result.output);
    }

    parts = dna.split(/[\.:]/g);
    switch (parts.length) {
        case 3:
            dnaroot = parts[0];
            dnans = parts[1];
            dnaname = parts[2];
            break;

        case 2:
            dnaroot = inProj ? 'APP' : 'TP';
            dnans = parts[0];
            dnaname = parts[1];
            break;

        case 1:
            dnaroot = inProj ? 'APP' : 'TP';
            if (inProj) {
                dnans = options.appname;
            } else {
                this.error('Cannot default namespace for lib tag: ' + name);
                return null;
            }
            dnaname = parts[0];
            break;

        default:
            break;
    }

    root = options.nsroot;
    ns = options.nsname;
    name = options.name;

    //  Helper function to attempt to rename any/all references to an old type
    //  name and update them with references to the new type name. This is a bit
    //  complex since references differ based on file type etc.
    renamer = function(content) {
        var regex;

        //  JS will have quoted references to the name during addSubtype calls
        //  and should then refer to the type via ROOT.ns.name references.
        //  XHTML and other markup can show things as ns:name for both tag and
        //  attribute references.
        //  CSS/LESS can have ns|name or [tibet|tag="ns:name"]-style references

        text = content;

        regex = new RegExp(dnaroot + '\\.' + dnans + '\\.' + dnaname, 'g');
        text = text.replace(regex, root + '.' + ns + '.' + name);

        regex = new RegExp('\\(\'' + dnaname + '\'\\)', 'g');
        text = text.replace(regex, '(\'' + name + '\')');

        regex = new RegExp(dnans + ':' + dnaname, 'g');
        text = text.replace(regex, ns + ':' + name);

        regex = new RegExp(dnans + '\\|' + dnaname, 'g');
        text = text.replace(regex, ns + '|' + name);

        return text;
    };

    //  Result output will include multiple lines. We want just those which
    //  begin with '~' since they represent virtual paths to the files we want.
    arr = result.output.split('\n');
    arr = arr.filter(function(item) {
        return item.charAt(0) === '~';
    });

    //  A little more complicated than just copying. We need to replace
    //  references to the original tag name with references to the new tag
    //  name. We need to rename the files. We need to escape embedded
    //  templating syntax portions so they'll get properly processed in
    //  their associated downstream steps.
    arr.forEach(function(item) {
        var fullpath,
            content,
            base,
            target;

        fullpath = CLI.expandPath(item);

        base = path.basename(fullpath);

        //  Don't try processing resources that are only hypothetical (computed
        //  but not confirmed).
        if (!CLI.sh.test('-e', fullpath)) {
            return;
        }

        //  Capture content of current dna file.
        content = CLI.sh.cat(fullpath);

        //  Rename embedded root.ns.name references of various forms.
        content = renamer(content);

        //  Deal with any embedded templating references so they're properly
        //  ready for the next phase.
        content = content.replace(/\{\{/g, '\\{{');

        //  Trick here is that some things like _test files can be overwritten
        //  if we rely purely on extension. We have to work with both extension
        //  and the actual filename and do a replace to come up with new file.
        target = base.replace(dnaroot, root).
            replace(dnans, ns).replace(dnaname, name);

        content.to(path.join(options.tmpdir, target));
    });

    return 0;
};


/**
 * Performs any updates to the application package that are needed. There are
 * differences in how we treat a "simple type" and a "tag". For tags we rely on
 * the tag having a separate package/config setup of its own so that is patched
 * in. For types we inject the individual assets into the application package.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executePackage = function() {
    if (this.options.bundled) {
        return this.executePackageBundled();
    } else {
        return this.executePackageCommon();
    }
};


/**
 * Processes package updates for a bundled component (typically a tag which has
 * its own package@config configuration.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executePackageBundled = function() {
    var options,
        code,
        cmd,
        dirty,
        written,
        pak,
        assets,
        dir,
        file,
        vpath,
        pkgName,
        pkgNode,
        configs;

    options = this.options;
    cmd = this;
    code = 0;

    this.log('adjusting package entries...');

    pkgName = options.pkgname;
    pkgNode = cmd.readPackageNode(pkgName);

    //  Bundled packages use their own config file. But we can simplify if
    //  the dir and type name are a match.
    dir = options.dir.slice(options.dir.lastIndexOf('/') + 1);
    if (dir === options.nsroot + '.' + options.nsname + '.' + options.name) {
        file = path.join(options.dir, path.sep);
    } else {
        file = path.join(options.dir,
            options.nsroot + '.' + options.nsname + '.' + options.name +
            '.xml');
    }
    vpath = CLI.getVirtualPath(file);

    configs = ['bundles'];

    configs.forEach(function(cfgName) {
        var pkgOpts,
            cfgNode,
            tag,
            str;

        //  Query against package doc so any nodes we create are coming from the
        //  same document instance. (If we use the helpers here we get a new one
        //  for each parse call).
        if (!(cfgNode = cmd.readConfigNode(pkgNode, cfgName))) {
            cmd.error('Unable to find ' + pkgName + '@' + cfgName);
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

        pak = new Package(pkgOpts);
        pak.expandPackage();
        assets = pak.listPackageAssets();
        assets = assets.map(function(asset) {
            return CLI.getVirtualPath(asset);
        });

        tag = 'package';
        str = '<' + tag + ' src="' + vpath + '"' + '/>';

        if (assets.indexOf(vpath) === -1) {
            dirty = true;
            cmd.addXMLEntry(cfgNode, '    ', str, '');
            cmd.log(str + ' (added)');
        } else {
            cmd.log(str + ' (exists)');
        }

    });

    //  ---

    if (dirty) {
        cmd.writePackageNode(pkgName, pkgNode);
        written = true;
    }

    if (written) {
        this.warn('New configuration entries created. Review/Rebuild as needed.');
    }

    this.executeCleanup(code);
    this.summarize();

    return code;
};


/**
 * Processes package changes for unbundled types, non-tag types such as
 * controllers, content types, etc. which don't have their own package file.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executePackageCommon = function() {
    var options,
        code,
        cmd,
        dirty,
        written,
        pak,
        assets,
        products,
        tests,
        pkgNode,
        pkgOpts,
        cfgName,
        pkgName,
        cfgNode;

    options = this.options;
    cmd = this;
    code = 0;

    this.log('adjusting package entries...');

    pkgName = options.pkgname;
    pkgNode = cmd.readPackageNode(pkgName);

    cfgName = options.cfgname;

    //  Rely on the package doc for node access. If we're missing the node in
    //  question we'll build it if possible.
    if (!(cfgNode = cmd.readConfigNode(pkgNode, cfgName))) {
        this.error('Unable to find ' + pkgName + '@' + cfgName);
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

    products = this.products || [];

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
        if (tag === 'script') {
            str = '<' + tag + ' src="' + value + '"/>';
        } else if (tag === 'resource') {
            str = '<' + tag + ' href="' + value + '"/>';
        }

        if (assets.indexOf(value) === -1) {
            dirty = true;
            cmd.addXMLEntry(cfgNode, '    ', str, '');
            cmd.log(str + ' (added)');
        } else {
            cmd.log(str + ' (exists)');
        }
    });

    //  ---
    //  tests
    //  ---

    cfgName = 'tests';

    //  This may build the node if not currently found.
    cfgNode = cmd.readConfigNode(pkgNode, cfgName, true);
    if (!cfgNode) {
        this.error('Unable to find ' + pkgName + '@' + cfgName);
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
        if (tag === 'script') {
            str = '<' + tag + ' src="' + value + '"/>';
        } else if (tag === 'resource') {
            str = '<' + tag + ' href="' + value + '"/>';
        }

        if (assets.indexOf(value) === -1) {
            dirty = true;
            cmd.addXMLEntry(cfgNode, '    ', str, '');
            cmd.log(str + ' (added)');
        } else {
            cmd.log(str + ' (exists)');
        }
    });

    if (dirty) {
        this.writePackageNode(pkgName, pkgNode);
        written = true;
    }

    if (written) {
        this.warn('New configuration entries created. Review/Rebuild as needed.');
    }

    this.executeCleanup(code);
    this.summarize();

    return code;
};


/**
 * Performs any post-processing necessary after executeProcess and prior to
 * executePosition. This is typically used to overlay base DNA content with
 * specific template or style content.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executePostProcess = function() {
    var options,
        code;

    options = this.options;
    code = 0;

    if (options.template) {
        code = this.overlayTemplate();
        if (code !== 0) {
            return code;
        }
    }

    if (options.style) {
        code = this.overlayStyle();
        if (code !== 0) {
            return code;
        }
    }

    return code;
};


/**
 * Overlays any current DNA-based CSS/LESS with the content defined by the
 * options.style value. This can be either static style text or a filename.
 */
Cmd.prototype.overlayStyle = function() {
    var options,
        content,
        fullpath,
        ext,
        code;

    options = this.options;

    //  Simple test to see if the style appears to be raw style text. If so
    //  we'll overlay the content of the less or css file with that text.
    if (/\{/.test(options.style)) {
        content = options.style;

        //  Since we'll potentially be overlaying file content from a clone
        //  operation we want to see whether there's a current less/css file.
        fullpath = CLI.expandPath(
            path.join(options.tmpdir, options.typename + '.less'));
        if (CLI.sh.test('-e', fullpath)) {
            ext = '.less';
        } else {
            fullpath = CLI.expandPath(
                path.join(options.tmpdir, options.typename + '.css'));
            if (CLI.sh.test('-e', fullpath)) {
                ext = '.css';
            } else {
                //  NOTE we default to LESS since css is valid less but the
                //  inverse is not true.
                ext = '.less';
            }
        }

    } else {
        //  Verify the style ref is a valid path to content.
        fullpath = CLI.expandPath(options.style);
        if (!CLI.sh.test('-e', fullpath)) {
            this.error('Unable to find stylesheet: ' + options.style);
            return 1;
        }

        content = CLI.sh.cat(fullpath);
        if (!content) {
            this.error('Unable to read stylesheet: ' + options.style);
            return 1;
        }

        ext = path.extname(fullpath);
    }

    //  We rely on a fairly strict naming convention to determine target file
    //  names. Use that here to get the target file.
    fullpath = CLI.expandPath(
        path.join(options.tmpdir, options.typename + ext));

    try {
        content.to(fullpath);
        code = 0;
    } catch (e) {
        code = 1;
    }

    return code;
};


/**
 * Overlays any current DNA-based XHTML template with the content defined by the
 * options.template value. This can be either static markup or a filename.
 */
Cmd.prototype.overlayTemplate = function() {
    var options,
        content,
        fullpath,
        code;

    options = this.options;

    //  Simple test to see if the template appears to be raw markup. If so
    //  we'll overlay the content of the xhtml file with that text.
    if (/</.test(options.template)) {
        content = options.template;
    } else {
        //  Verify the template is a valid path to content for the template.
        fullpath = CLI.expandPath(options.template);
        if (!CLI.sh.test('-e', fullpath)) {
            this.error('Unable to find template: ' + options.template);
            return 1;
        }

        content = CLI.sh.cat(fullpath);
        if (!content) {
            this.error('Unable to read template: ' + options.template);
            return 1;
        }
    }

    //  We rely on a fairly strict naming convention to determine target file
    //  names. Use that here to get the target file.
    fullpath = CLI.expandPath(
        path.join(options.tmpdir, options.typename + '.xhtml'));

    try {
        content.to(fullpath);
        code = 0;
    } catch (e) {
        code = 1;
    }

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
    dna = path.basename(options.dna);

    //  NOTE that we don't use the full path for the dna reference here to avoid
    //  embedding real paths in the output.
    obj = {};
    obj[this.TEMPLATE_KEY] = name;
    obj.dna = dna;

    obj.nsroot = options.nsroot;
    obj.nsname = options.nsname;

    params = CLI.blend(obj, options);
    this.params = params;

    this.trace(CLI.beautify(JSON.stringify(params)));

    return params;
};


/**
 * TODO
 */
Cmd.prototype.summarize = function() {
    var options;

    options = this.options;

    this.info('Type DNA \'' + path.basename(options.dna) +
        '\' cloned to ' + options.dirname +
        ' as \'' + options.name + '\'.');
};

module.exports = Cmd;

}());
