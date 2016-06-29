//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet resources' command. Lists resources that are needed
 *     by components of a particular package/config and optionally builds files
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
    less,
    Promise,
    Package,
    helpers,
    Parent,
    Cmd;


CLI = require('./_cli');
beautify = require('js-beautify').js_beautify;
chalk = require('chalk');
fs = require('fs');
path = require('path');
less = require('less');
sh = require('shelljs');
helpers = require('../../../etc/cli/config_helpers');
Promise = require('bluebird');
Package = require('../../../etc/cli/tibet-package.js');

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
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'resources';

//  ---
//  Instance Attributes
//  ---

/**
 * The list of resources to process as computed by the TSH :resources command.
 * Entries in this list which are missing are usually ignored since the list is
 * based on algorithmic computations, not necessarily explicit references.
 * @type {Array.<string>}
 */
Cmd.prototype.computed = [];

/**
 * The list of resources as derived from the `tibet package` command. These
 * values are explicitly mentioned in a package so if one is missing that's
 * considered an error. Computed resources that are missing are not.
 */
Cmd.prototype.specified = [];


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

    //  Get the list of resources from the package. These are explicit values.
    this.specified = this.generateResourceList();

    //  To work with computed resources we have to run our script via
    //  TSH using our parent's implementation. We'll then blend that with info
    //  from the package metadata.
    Parent.prototype.execute.call(this);

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

    //  Force command to NOT try to load resources since this can cause a
    //  circular failure condition where we're trying to boot TIBET to compute
    //  resources but we are missing resource files because...we haven't been
    //  able to run this command to completion...etc.
    arglist.push('--params=boot.resourced=false');

    return arglist;
};


/**
 * TODO
 */
Cmd.prototype.generateResourceList = function() {

    var list,       // The result list of asset references.
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
        filter,
        helper,
        packagePhase;

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

    helper = function(resource) {
        var fullpath;

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

        if (sh.test('-e', fullpath)) {
            //  If the file exists ensure it gets added to the filtered list.
            return true;
        } else {
            if (packagePhase) {
                cmd.error(resource  + ' (404) ');
            }

            return false;
        }
    };

    this.info('Filtering ' +
        (this.computed.length + this.specified.length) + ' potential resources...');

    //  Produce a filtered list by expanding the resource path and checking for
    //  its existence, adherence to filtering criteria, context, etc.
    this.filtered = this.computed.filter(helper);

    //  Filter the specified resource list and combine the two lists.
    packagePhase = true;
    this.filtered = this.filtered.concat(this.specified.filter(helper));

    if (!this.options.build) {

        this.info('Found ' + this.filtered.length + ' concrete resources...');

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

    this.info('Building ' + this.filtered.length + ' concrete resources...');

    //  We have a filtered list, the challenge now is to produce promises
    //  so we can manage async operations like compiling LESS files etc.
    this.promises = this.filtered.map(function(resource) {
        var fullpath;

        fullpath = CLI.expandPath(resource, true);

        return new Promise(function(resolve, reject) {
            var data,
                content,
                base,
                file,
                ext,
                methodName;

            //  Replace the resource name with a normalized variant.
            base = resource.slice(resource.indexOf('/') + 1).replace(/\//g, '.');
            file = path.join(buildpath, base);
            file += '.js';

            //  NOTE we wrap things in TIBET URI constructors and set their
            //  content to the original content, escaped for single-quoting.
            //  This effectively will pre-cache these values, avoiding HTTP.
            data = fs.readFileSync(fullpath, {encoding: 'utf8'});

            //  Dispatch to a proper handler which will resolve the promise once
            //  it completes any file-specific processing.
            ext = path.extname(fullpath).slice(1);
            ext = ext.charAt(0).toUpperCase() + ext.slice(1);
            methodName = 'process' + ext + 'Resource';
            if (typeof cmd[methodName] === 'function') {
                return cmd[methodName]({
                    resource: resource,
                    fullpath: fullpath,
                    base: base,
                    file: file,
                    data: data,
                    resolve: resolve,
                    reject: reject
                });
            } else {
                cmd.products.push([resource, file]);

                content = 'TP.uc(\'' + resource + '\').setContent(\n';
                content += CLI.quoted(data);
                content += '\n);';
                fs.writeFileSync(file, content);
                return resolve();
            }
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

        if (cmd.options.list || !cmd.options.build) {
            cmd.logConfigEntries();
        } else {
            cmd.updatePackage();
        }

    }).catch(function(err) {
        cmd.error(err);
    });
};


/*
 */
Cmd.prototype.processLessResource = function(options) {
    var cfg,
        cmd,
        lessOpts,
        vars;

    cmd = this;

    vars = {};

    //  Iterate over all of the 'path.' variables, getting each key and slicing
    //  the 'path.' part off of it. Any remaining periods ('.') in the key are
    //  replaced with '-'. Then, quote the value so that LESS doesn't have
    //  issues with spaces, etc.
    cfg = CLI.getcfg('path');
    Object.keys(cfg).forEach(
        function(aKey) {
            var val;

            //  If the cfg data has a real value for that key, get the key and
            //  slice off the 'path.' portion. Any remaining periods ('.') in
            //  the key are then replaced with '-'. Then, quote the value so
            //  that LESS doesn't have issues with spaces, etc.
            if (CLI.notEmpty(val = cfg[aKey])) {
                vars[aKey.slice(5).replace(/\./g, '-')] =
                    '"' + CLI.getVirtualPath(CLI.expandPath(val)) + '"';
            }
        });

    lessOpts = options.less || {};
    lessOpts.globalVars = vars;

    // this.debug('lessOpts: ' + beautify(JSON.stringify(lessOpts)));

    return less.render(options.data, lessOpts).then(function(output) {
        var content,
            rname,
            fname;

        rname = options.resource.replace(/\.less$/, '.css');
        fname = options.file.replace(/\.less\.js$/, '.css.js');

        cmd.products.push([options.resource, fname]);

        content = 'TP.uc(\'' + rname + '\').setContent(\n';
        content += CLI.quoted(output.css);
        content += '\n);';
        fs.writeFileSync(fname, content);

        return options.resolve();
    }).catch(function(err) {
        options.reject(err);
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
            cmd.computed.push(line);
        } else {
            //  Filter just to show TIBET lines
            if ((/tibet/i).test(line)) {
                //  NOTE we manually colorize since color is off to phantomjs to
                //  avoid problems trying to parse the output data.
                /* eslint-disable no-console */
                console.log(chalk.grey(line));
                /* eslint-enable no-console */
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
    var cmd,
        cond;

    cmd = this;

    if (this.products.length === 0) {
        return;
    }

    if (CLI.inProject()) {
        cond = 'boot.phase_two';
    } else if (CLI.inLibrary()) {
        cond = 'boot.phase_one';
    }

    this.warn('Configuration Entries (not saved):');
    this.info('<config id="resources"' +
            ' if="' + cond + '"' + '>');

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
        pak,
        assets,
        pkgOpts,
        cfgName,
        pkgName,
        cfgNode,
        condAttr,
        cond;

    cmd = this;

    if (CLI.inLibrary()) {
        pkgName = 'TIBET';
    } else {
        pkgName = this.options.package || this.package.getcfg('project.name');
    }

    if (pkgName.charAt(0) !== '~') {
        if (CLI.inProject()) {
            pkgName = path.join('~app_cfg', pkgName);
            cfgName = 'resources';
        } else {
            pkgName = path.join('~lib_cfg', pkgName);
            cfgName = 'resources';
        }
    }

    if (!/.xml$/.test(pkgName)) {
        pkgName = pkgName + '.xml';
    }

    this.log('Writing package resource entries...');

    //  This may build the node if not currently found.
    cfgNode = this.readConfigNode(pkgName, cfgName, true);
    if (!cfgNode) {
        throw new Error('Unable to find ' + pkgName + '#' + cfgName);
    }

    //  Ensure we have the right phase (in case we built the node)
    if (CLI.inProject()) {
        cond = 'boot.phase_two';
    } else if (CLI.inLibrary()) {
        cond = 'boot.phase_one';
    }

    condAttr = cfgNode.getAttribute('if');
    if (condAttr.indexOf(cond) === -1) {
        if (CLI.isEmpty(condAttr)) {
            cfgNode.setAttribute('if', cond);
        } else {
            cfgNode.setAttribute('if', condAttr + ' ' + cond);
            dirty = true;
        }
    }

    //  Ensure we have the resource filter on the node.
    cond = 'boot.resourced';
    condAttr = cfgNode.getAttribute('if');
    if (condAttr.indexOf(cond) === -1) {
        if (CLI.isEmpty(condAttr)) {
            cfgNode.setAttribute('if', cond);
        } else {
            cfgNode.setAttribute('if', condAttr + ' ' + cond);
            dirty = true;
        }
    }

    //  Get package information in expanded form so we can check against any
    //  potentially nested config structures. Being able to nest makes it easy
    //  to iterate while still being able to organize into different config
    //  bundles for different things (like sherpa vs. test vs. xctrls).
    pkgOpts = {
        "package": pkgName,
        "config": cfgName,
        "all": false,
        "scripts": true,        //  The magic one...without this...no output.
        "nodes": false,
        "phase": "all",
        "boot": {
            "phase_one": true,
            "phase_two": true
        }
    };

    pak = new Package(pkgOpts);
    pak.expandPackage();
    assets = pak.listPackageAssets();
    assets = assets.map(function(asset) {
        return CLI.getVirtualPath(asset);
    });

    //  Process the individual files, checking for existence and adding any that
    //  are missing from the resource config.
    this.products.forEach(function(pair) {
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
};

module.exports = Cmd;

}());
