//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet resources' command. Lists resources that are needed
 *     (computed) for a particular package/config and optionally builds files
 *     describing TP.core.URI instances which can be rolled up for loading.
 */
//  ========================================================================

/* eslint indent:0 */

(function() {

'use strict';

var CLI,
    beautify,
    chalk,
    fs,
    path,
    sh,
    helpers,
    Parent,
    Cmd;


CLI = require('./_cli');
beautify = require('js-beautify').js_beautify;
chalk = require('chalk');
fs = require('fs');
path = require('path');
sh = require('shelljs');
helpers = require('../../../etc/cli/config_helpers');

//  ---
//  Type Construction
//  ---

// NOTE this is a subtype of the 'tsh' command focused on running :test.
Parent = require('./tsh');

Cmd = function() {};
Cmd.prototype = new Parent();

//  Augment our prototype with XML config methods.
helpers.extend(Cmd, CLI);

//  ---
//  Type Attributes
//  ---


/**
 * The context viable for this command.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;


/**
 * The default path to the TIBET-specific phantomjs test runner.
 * @type {String}
 */
Cmd.DEFAULT_RUNNER = Parent.DEFAULT_RUNNER;


/**
 * The list of tags from TIBET packages which represent supported resources.
 * @type {Array.<String>}
 */
Cmd.RESOURCE_TAGS = ['resource', 'style', 'template'];


//  ---
//  Instance Attributes
//  ---

/**
 * The list of resources to process as computed by the TSH :resources command.
 * @type {Array.<string>}
 */
Cmd.prototype.resources = [];


/**
 * Command argument parsing options.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['build', 'list', 'computed', 'templates', 'styles', 'resources'],
        'string': ['package', 'config', 'include', 'exclude', 'filter'],
        'default': {
            computed: false,
            context: 'app'
        }
    },
    Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */


/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE = 'tibet resources [--build] [--computed] [package-opts]';


//  ---
//  Instance Methods
//  ---

/**
 * Configure the command options list post-parse.
 * @returns {Object} An options object usable by the command.
 */
Cmd.prototype.configure = function() {

    //  Adjust default values for "slices" based on command options. Normally
    //  all the slice options are off to avoid requiring --no- prefixing for
    //  the common cases.
    if (!this.options.resources &&
            !this.options.templates &&
            !this.options.styles) {
        //  Nothing specified, set them all to true, no filtering.
        this.options.resources = true;
        this.options.templates = true;
        this.options.styles = true;
    }

    //  Packager can process this...but it's an invalid flag for resources.
    this.options.scripts = null;

    return this.options;
};


/**
 * TODO
 */
Cmd.prototype.execute = function() {
    var cfgName,
        pkgName,
        pkg;

    //  If we're working with computed resources we have to run our script via
    //  TSH using our parent's implementation.
    if (this.options.computed) {
        Parent.prototype.execute.call(this);
    } else {
        //  Not computed, work with specifically package-listed resources only.
        this.resources = this.generateResourceList();
        this.processResources();
    }

    return;
};


/**
 * Performs any final processing of the argument list prior to execution. The
 * default implementation does nothing but subtypes can leverage this method
 * to ensure the command line meets their specific requirements.
 * @param {Array.<String>} arglist The argument list to finalize.
 * @returns {Array.<String>} The finalized argument list.
 */
Cmd.prototype.finalizeArglist = function(arglist) {

    //  Since we use the output from phantomjs to provide data we need it to be
    //  no-color, regardless of command setting for the command output itself.
    arglist.push('--no-color');

    return arglist;
};


/**
 * TODO
 */
Cmd.prototype.generateResourceList = function() {

    var Package,    // The tibet-package.js export.
        list,       // The result list of asset references.
        cmd;

    cmd = this;

    this.pkgOpts = CLI.blend({}, this.options);

    // If silent isn't explicitly set but we're doing a full expansion turn
    // silent on so we skip duplicate resource warnings.
    if (CLI.notValid(this.options.silent) && this.options.all) {
        this.pkgOpts.silent = true;
    }

    //  Default the phase based on project vs. library context.
    if (CLI.notValid(this.pkgOpts.phase)) {
        if (CLI.notValid(this.pkgOpts.context)) {
            if (CLI.inProject()) {
                this.pkgOpts.phase = 'two';
            } else if (CLI.inLibrary()) {
                this.pkgOpts.phase = 'one';
            }
        } else {
            this.pkgOpts.phase = this.pkgOpts.context;
        }
    }

    // Set boot phase defaults. If we don't manage these then most app package
    // runs will quietly filter out all their content nodes.
    this.pkgOpts.boot = this.pkgOpts.boot || {};
    switch (this.pkgOpts.phase) {
        case 'lib':
        case 'one':
            this.pkgOpts.boot.phase_one = true;
            this.pkgOpts.boot.phase_two = false;
            break;
        case 'app':
        case 'two':
            this.pkgOpts.boot.phase_one = false;
            this.pkgOpts.boot.phase_two = true;
            break;
        default:
            this.pkgOpts.boot.phase_one = true;
            this.pkgOpts.boot.phase_two = true;
            break;
    }

    if (!this.pkgOpts.package) {
        this.pkgOpts.package = CLI.getcfg('boot.package') ||
            CLI.getcfg('boot.default_package') ||
            CLI.PACKAGE_FILE;
    }

    this.debug('pkgOpts: ' + beautify(JSON.stringify(this.pkgOpts)));

    Package = require('../../../etc/cli/tibet-package.js');
    this.package = new Package(this.pkgOpts);

    if (this.pkgOpts.all || !this.pkgOpts.config) {
        this.package.expandAll();
        list = this.package.listAllAssets();
    } else {
        this.package.expandPackage();
        list = this.package.listPackageAssets();
    }

    return list.map(function(item) {
        return cmd.package.getVirtualPath(item);
    });;
};


/**
 * Computes and returns the TIBET Shell script command line to be run.
 * @returns {String} The TIBET Shell script command to execute.
 */
Cmd.prototype.getScript = function() {
    return ':resources';
};


/**
 * TODO
 */
Cmd.prototype.getTag = function(file) {
    var tag;

    if (/\.less$|\.css$/.test(file)) {
        tag = 'style';
    } else if (/\.(.*)ml$|\.svg$/.test(file)) {
        tag = 'template';
    } else if (/\.js|\.jscript/.test(file)) {
        tag = 'script';
    } else {
        tag = 'resource';
    }

    return tag;
};


/**
 * TODO
 */
Cmd.prototype.processResources = function() {
    var cmd,
        buildpath,
        libpath,
        filter;

    cmd = this;

    //  If we'll be building inline resources we need a build dir to put them
    //  in so make sure it's available.
    if (cmd.options.build) {
        if (CLI.inProject()) {
            buildpath = CLI.expandPath('~app_build');
        } else {
            buildpath = CLI.expandPath('~lib_build');
        }

        if (!sh.test('-d', buildpath)) {
            sh.mkdir(buildpath);
        }
    }

    if (CLI.notEmpty(this.options.filter)) {
        filter = CLI.stringAsRegExp(this.options.filter);
    }

    //  List we'll update with inlined resource products we've produced. This
    //  list is then used to update the appropriate manifest data file.
    this.products = [];

    libpath = CLI.expandPath('~lib');

    if (this.options.build) {
        this.info('Processing ' + this.resources.length + ' potential resources...');
    }

    this.resources.forEach(function(resource) {
        var fullpath,
            base,
            data,
            content,
            file;

        //  Check for paths that will expand properly, silence any errors.
        fullpath = CLI.expandPath(resource, true);
        if (!fullpath) {
            return;
        }

        //  Didn't expand? ignore it. Didn't process properly.
        if (fullpath === resource) {
            return;
        }

        //  filter based on context
        if (CLI.inProject()) {
            if (fullpath.indexOf(libpath) === 0) {
                return;
            }
        } else {
            if (fullpath.indexOf(libpath) !== 0) {
                return;
            }
        }

        //  deal with any filtering pattern
        if (CLI.notEmpty(filter)) {
            if (!filter.test(fullpath)) {
                return;
            }
        }

        //  if we're working with computed resources there won't have been any
        //  filtering based on asset tag type...so do that as best we can.
        if (cmd.options.computed) {

            if (!cmd.options.templates &&
                /\.(.*)ml$|\.svg$/.test(fullpath)) {
                return;
            }

            if (!cmd.options.styles &&
                /\.less$|\.css$/.test(fullpath)) {
                return;
            }
        }

        if (sh.test('-e', fullpath)) {

            if (!cmd.options.build) {
                cmd.info(resource);
                return;
            }

            data = fs.readFileSync(fullpath, {encoding: 'utf8'});

            //  NOTE we wrap things in TIBET URI constructors and set their
            //  content to the original content, escaped for single-quoting.
            //  This effectively will pre-cache these values, avoiding HTTP.
            content = 'TP.uc(\'' + resource + '\').setContent(\n';
            content += CLI.quoted(data);
            content += '\n);'

            //  Replace the resource name with a normalized variant.
            base = resource.slice(resource.indexOf('/') + 1).replace(/\//g, '.');
            file = path.join(buildpath, base);
            file += '.js';

            fs.writeFileSync(file, content);

            cmd.products.push([resource, file]);

        } else {
            cmd.log(resource + ' (404)');
            return;
        }
    });

    //  With a products list in place update the config file as needed.
    if (this.options.list || !this.options.package) {
        this.logConfigEntries();
    } else {
        this.updatePackage();
    }
};


/**
 * Performs post-processing of data captured by running the :resources command
 * in the client. This hook invokes the 'processResources' method to produce
 * either listings or inlined content for the resource list.
 */
Cmd.prototype.close = function(code) {

    this.processResources();

    /* eslint-disable no-process-exit */
    process.exit(code);
    /* eslint-enable no-process-exit */
};


/**
 * Captures each line of output from the client :resources command and stores it
 * for later processing in the 'close' method.
 */
Cmd.prototype.stdout = function(data) {
    var str,
        arr,
        cmd;

    cmd = this;
    str = ('' + data).trim();
    arr = str.split('\n');
    arr.forEach(function(line) {
        if (line.charAt(0) === '~') {
            cmd.resources.push(line);
        } else {
            //  Filter just to show TIBET lines
            if ((/tibet/i).test(line)) {
                //  NOTE we manually colorize since color is off to phantomjs to
                //  avoid problems trying to parse the output data.
                console.log(chalk.grey(line));
            }
        }
    })
};


/**
 * Writes configuration file entries to the console/log. This option is used by
 * default so consumers can manually copy/paste the entries into the desired
 * target configuration file(s).
 */
Cmd.prototype.logConfigEntries = function() {
    var cmd;

    cmd = this;

    if (this.products.length === 0) {
        return;
    }

    this.warn('Configuration Entries (not saved):');

    this.info('<config id="resources">');
    this.products.forEach(function(pair) {
        var tag,
            file;

        file = pair[0];
        tag = cmd.getTag(file);

        cmd.info('    <' + tag + ' href="' + CLI.getVirtualPath(file) + '"/>');
    });
    this.info('</config>');

    this.info('<config id="inlined">');
    this.products.forEach(function(pair) {
        cmd.info('    <script src="' + CLI.getVirtualPath(pair[1]) + '"/>');
    });
    this.info('</config>');
};


/**
 * Writes configuration entries to the package/config file related to the
 * context. There are two types of configuration updates, <resource> tags in
 * various forms, and <script> tags referencing inlined content.
 */
Cmd.prototype.updatePackage = function() {
    var cmd,
        dirty,
        cfgName,
        pkgName,
        cfgNode;

    cmd = this;

    pkgName = this.options.package;

    if (pkgName.charAt(0) !== '~') {
        if (CLI.inProject()) {
            pkgName = path.join('~app_cfg', pkgName);
        } else {
            pkgName = path.join('~lib_cfg', pkgName);
        }
    }

    if (!/.xml$/.test(pkgName)) {
        pkgName = pkgName + '.xml';
    }

    //  ---
    //  resource/style/template assets
    //  ---

    this.log('Writing package resource entries...');

    cfgName = 'resources';

    cfgNode = this.readConfigNode(pkgName, cfgName);
    if (!cfgNode) {
        throw new Error('Unable to find ' + pkgName + '#' + cfgName);
    }

    this.products.forEach(function(pair) {
        var value,
            file,
            tag,
            str;

        file = pair[0];
        value = CLI.getVirtualPath(file);
        tag = cmd.getTag(file);
        str = '<' + tag + ' href="' + value + '"/>';

        if (!cmd.hasXMLEntry(cfgNode, tag, 'href', value)) {
            cmd.info(str);

            dirty = true;
            cmd.addXMLLiteral(cfgNode, '\n');
            cmd.addXMLEntry(cfgNode, '    ', str, '');
        } else {
            cmd.log(str + ' (exists)');
        }
    });

    if (dirty) {
        this.addXMLLiteral(cfgNode, '\n');
        this.writeConfigNode(pkgName, cfgNode);
        dirty = false;
    }

    //  ---
    //  inlined cache entries
    //  ---

    this.log('Writing package inlined entries...');

    cfgName = 'inlined';

    cfgNode = this.readConfigNode(pkgName, cfgName);
    if (!cfgNode) {
        throw new Error('Unable to find ' + pkgName + '#' + cfgName);
    }

    this.products.forEach(function(pair) {
        var value,
            file,
            tag,
            str;

        file = pair[1];
        value = CLI.getVirtualPath(file);
        tag = cmd.getTag(file);
        str = '<' + tag + ' src="' + value + '"/>';

        if (!cmd.hasXMLEntry(cfgNode, tag, 'src', value)) {
            cmd.info(str);

            dirty = true;
            cmd.addXMLLiteral(cfgNode, '\n');
            cmd.addXMLEntry(cfgNode, '    ', str, '');
        } else {
            cmd.log(str + ' (exists)');
        }
    });

    if (dirty) {
        this.addXMLLiteral(cfgNode, '\n');
        this.writeConfigNode(pkgName, cfgNode);
    }
};

module.exports = Cmd;

}());
