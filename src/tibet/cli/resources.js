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
    Promise,
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
Promise = require('bluebird');

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
        'boolean': ['build', 'list'],
        'default': {
            context: 'app',
            build: true,
            list: false,
            scripts: false,
            resources: true,
            images: false
        }
    },
    Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */


/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE = 'tibet resources [--build] [--list] [package-opts]';


//  ---
//  Instance Methods
//  ---

/**
 * Configure the command options list post-parse.
 * @returns {Object} An options object usable by the command.
 */
Cmd.prototype.configure = function() {

    //  Force resources to true so we ensure package data scans for those as
    //  well as any scripts.
    this.options.resources = true;

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
    });
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
Cmd.prototype.processResources = function() {
    var cmd,
        buildpath,
        libpath,
        filter;

    cmd = this;

    //  If we'll be building inline resources we need a build dir to put them
    //  in so make sure it's available.
    if (CLI.inProject()) {
        buildpath = CLI.expandPath('~app_build');
    } else {
        buildpath = CLI.expandPath('~lib_build');
    }

    if (cmd.options.build) {
        if (!sh.test('-d', buildpath)) {
            sh.mkdir(buildpath);
        }
    }

    //  Convert any filter spec we have into a normalized form.
    if (CLI.notEmpty(this.options.filter)) {
        filter = CLI.stringAsRegExp(this.options.filter);
    }

    //  List we'll update with inlined resource products we've produced. This
    //  list is then used to update the appropriate manifest data file.
    this.products = [];

    libpath = CLI.expandPath('~lib');

    //  Produce a filtered list by expanding the resource path and checking for
    //  its existence, adherence to filtering criteria, context, etc.
    this.filtered = this.resources.filter(function(resource) {
        var fullpath,
            base,
            data,
            content,
            file;

        //  Check for paths that will expand properly, silence any errors.
        fullpath = CLI.expandPath(resource, true);
        if (!fullpath) {
            return false;
        }

        //  Didn't expand? ignore it. Didn't process properly.
        if (fullpath === resource) {
            return false;
        }

        //  filter based on context
        if (CLI.inProject() && cmd.options.context !== 'lib') {
            if (fullpath.indexOf(libpath) === 0) {
                return false;
            }
        } else {
            if (fullpath.indexOf(libpath) !== 0) {
                return false;
            }
        }

        //  deal with any filtering pattern
        if (CLI.notEmpty(filter)) {
            if (!filter.test(fullpath)) {
                return false;
            }
        }

        //  if we're working with computed resources there won't have been any
        //  filtering based on asset tag type...so do that as best we can.
        if (cmd.options.computed) {

            if (!cmd.options.templates &&
                /\.(.*)ml$|\.svg$/.test(fullpath)) {
                return false;
            }

            if (!cmd.options.styles &&
                /\.less$|\.css$/.test(fullpath)) {
                return false;
            }
        }

        if (sh.test('-e', fullpath)) {

            //  If the file exists ensure it gets added to the filtered list.
            return true;

        } else {
            //  Report 404 (missing files) when not driving from a computed
            //  list. The computed list is assumed to almost always have 404s
            //  since it generates potential file names. The non-computed form
            //  will be using only package data so missing files are a "bug" we
            //  should report to the user.
            if (!cmd.options.computed) {
                cmd.log(resource + ' (404)');
            }

            return false;
        }
    });

    if (!this.options.build) {
        this.filtered.forEach(function(resource) {
            var base,
                file;

            base = resource.slice(resource.indexOf('/') + 1).replace(/\//g, '.');
            file = path.join(buildpath, base);
            file += '.js';

            cmd.products.push([resource, file]);
        });
        cmd.logConfigEntries();
        return Promise.resolve();
    }

    this.info('Processing ' + this.filtered.length + ' resources...');

    //  We have a filtered list, the challenge now is to produce promises
    //  so we can manage async operations like compiling LESS files etc.
    this.promises = this.filtered.map(function(resource) {
        var fullpath;

        fullpath = CLI.expandPath(resource, true);

        return new Promise(function(resolve, reject) {
            var data,
                content,
                base,
                file;

            //  Replace the resource name with a normalized variant.
            base = resource.slice(resource.indexOf('/') + 1).replace(/\//g, '.');
            file = path.join(buildpath, base);
            file += '.js';

            cmd.products.push([resource, file]);

if (/\.css$/.test(fullpath)) {
    throw new Error('blah');
}
            //  NOTE we wrap things in TIBET URI constructors and set their
            //  content to the original content, escaped for single-quoting.
            //  This effectively will pre-cache these values, avoiding HTTP.
            data = fs.readFileSync(fullpath, {encoding: 'utf8'});
            content = 'TP.uc(\'' + resource + '\').setContent(\n';
            content += CLI.quoted(data);
            content += '\n);';
            fs.writeFileSync(file, content);

            return resolve();
        }).reflect();
    });

    //  TODO
    return Promise.all(this.promises).then(function(inspections) {

        //  TODO:   because we're using 'Promise.reflect' we don't really know
        //  the state of each individual promise yet...we have to check them.
        inspections.forEach(function(inspection, index) {

            if (inspection.isFulfilled()) {
                cmd.info(cmd.products[index][0]);
            } else {
                cmd.error(cmd.products[index][0] +
                    ' (' + inspection.reason() + ')');
            }

        });
/*
        if (cmd.options.list || !cmd.options.package) {
            cmd.logConfigEntries();
        } else {
            cmd.updatePackage();
        }
*/
    }).catch(function(err) {

        cmd.error(err);
    });
};


/**
 * Performs post-processing of data captured by running the :resources command
 * in the client. This hook invokes the 'processResources' method to produce
 * either listings or inlined content for the resource list.
 */
Cmd.prototype.close = function(code) {

    /* eslint-disable no-process-exit */
    if (code !== undefined && code !== 0) {
        process.exit(code);
    }

    this.processResources().then(function() {
        process.exit(0);
    }).catch(function(err) {
        process.exit(-1);
    });
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
    });
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
