//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet resource' command. Lists resources that are needed
 *     by components of a particular package/config and optionally builds files
 *     describing TP.uri.URI instances which can be rolled up for loading.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0 */

(function() {

'use strict';

var CLI,
    fs,
    path,
    sh,
    less,
    sass,
    Promise,
    Package,
    mm,
    helpers,
    Cmd;


CLI = require('./_cli');
fs = require('fs');
path = require('path');
less = require('less');
sass = require('node-sass');
sh = require('shelljs');
helpers = require('../../../etc/helpers/config_helpers');
Promise = require('bluebird');
Package = require('../../../etc/common/tibet_package.js');
mm = require('minimatch');

//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('./tsh');      // NOTE we inherit from 'tsh' command.
Cmd.prototype = new Cmd.Parent();


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
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'resource';

/**
 * A regex to match CSS @import statements. The URL can be found in group 2.
 * @type {regex}
 */
Cmd.CSS_IMPORT_RULE = /@import\s*(url\()?['"]?(.*?)['"]?(\))?;/g;

/**
 * List of regular expressions used to filter out "source code" from inlining.
 * @type {Array.<RegExp>}
 */
Cmd.NEEDS_PROCESSING = [
    /\.less$/,
    /\.sass$/,
    /\.scss$/,
    /\.coffee$/,
    /\.ts$/
];

Cmd.EXCLUDE_REPLACEMENTS = [
    [/\.less$/, 'css'],
    [/\.sass$/, 'css'],
    [/\.scss$/, 'css'],
    [/\.coffee$/, 'js'],
    [/\.ts$/, 'js']
];

Cmd.INLINED_RESOURCES = [
    /\.css$/,
    /\.xhtml$/,
    /\.xml$/,
    /\.json/
];


//  ---
//  Instance Attributes
//  ---

/**
 * The list of resources to process as computed by the TSH :resource command.
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
Cmd.prototype.PARSE_OPTIONS = CLI.blend({
    boolean: ['all', 'build', 'list', 'raw', 'silent'],
    string: ['context', 'filter', 'profile', 'type'],
    default: {
        build: false,
        list: false,
        raw: false,
        scripts: false,
        resources: true,
        images: false
    }
},
Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The timeout used for command invocation. Processing resources can take a
 * while so we default to 30 seconds.
 * @type {Number}
 */
Cmd.prototype.TIMEOUT = 30000;

/**
 * The command usage string.
 * @type {String}
 */
Cmd.prototype.USAGE = 'tibet resource [--type <tname>] [--filter <filter>]' +
    ' [--context=[\'app\'|\'lib\'|\'all\']]' +
    ' [--profile <pkgcfg>]' +
    ' [-all] [--build] [--list] [--raw] [--silent] [<package-opts>]';


//  ---
//  Instance Methods
//  ---

/**
 * Check arguments and configure default values prior to running prereqs.
 * @returns {Object} An options object usable by the command.
 */
Cmd.prototype.configure = function() {

    //  Force resources to true so we ensure package data scans for those as
    //  well as any scripts.
    this.options.resources = true;

    return this.options;
};


/**
 * Run the command, processing both specified and computed resources.
 */
Cmd.prototype.execute = function() {

    //  Get the list of resources from the package. These are explicit values.
    this.specified = this.generateResourceList();

    //  To work with computed resources we have to run our script via TSH using
    //  our parent's implementation. We'll then blend that with info from the
    //  package metadata.
    Cmd.Parent.prototype.execute.call(this);

    return 0;
};


/**
 * Performs any final processing of the argument list prior to execution. The
 * default implementation does nothing but subtypes can leverage this method
 * to ensure the command line meets their specific requirements.
 * @param {Array.<String>} arglist The argument list to finalize.
 * @returns {Array.<String>} The finalized argument list.
 */
Cmd.prototype.finalizeArglist = function(arglist) {
    var args,
        index,
        params;

    args = Cmd.Parent.prototype.finalizeArglist.call(this, arglist);

    //  Since we use the output from headless to provide data we need it to be
    //  no-color, regardless of command setting for the command output itself.
    index = args.indexOf('--color');
    if (index !== -1) {
        //  remove item since we'll be putting in an explicit --no-color
        args.splice(index, 1);
    }
    if (args.indexOf('--no-color') === -1) {
        args.push('--no-color');
    }

    //  Adjust timeout value to the larger of any value which might already
    //  exist or any provided locally.
    this.finalizeTimeout(arglist);

    params = args.filter(function(arg) {
        //  Don't let boot.inlined pass...we have to set to false or the
        //  resource command can't boot during build operations.
        return arg.indexOf('--boot.') === 0 &&
            arg.indexOf('--boot.inlined=') === -1;
    });
    params = params.map(function(arg) {
        return arg.slice(2);
    });
    params.push('boot.inlined=false');
    params = params.join('&');

    //  Force command to NOT try to load inlined resources since this can cause
    //  a circular failure condition where we're trying to boot TIBET to compute
    //  resources but we are missing resource files because...we haven't been
    //  able to run this command to completion...etc.
    args.push('--params=' + params);

    return args;
};


/**
 * Use package and configuration data to produce and return a list of specified
 * resources for the particular profile.
 * @returns {Array.<string>} The list of specified resources found.
 */
Cmd.prototype.generateResourceList = function() {

    var list,       // The result list of asset references.
        cmd,
        resources;

    cmd = this;

    this.pkgOpts = CLI.blend({}, this.options);

    // If silent isn't explicitly set but we're doing a full expansion turn
    // silent on so we skip duplicate resource warnings.
    if (CLI.notValid(this.options.silent) && this.options.all) {
        this.pkgOpts.silent = true;
    }

    //  Default the context based on project vs. library.
    if (CLI.notValid(this.pkgOpts.context)) {
        if (CLI.inProject()) {
            this.pkgOpts.context = 'app';
        } else if (CLI.inLibrary()) {
            this.pkgOpts.context = 'lib';
        }
    }

    //  Default the phase based on context.
    if (CLI.notValid(this.pkgOpts.phase)) {
        this.pkgOpts.phase = this.pkgOpts.context;
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

    //  Force our package queries to ignore inlined content and focus on
    //  resources which might require generation of the inlined resources.
    this.pkgOpts.boot.inlined = false;

    if (!this.pkgOpts.package) {
        this.pkgOpts.package = CLI.getcfg('boot.package') ||
            CLI.getcfg('boot.default_package') ||
            CLI.PACKAGE_FILE;
    }

    if (!this.pkgOpts.config) {
        this.pkgOpts.config = CLI.getcfg('boot.config') ||
            CLI.getcfg('boot.default_config') ||
            'full';
    }

    //  Ensure that we force our package to respect any config value we provide.
    this.pkgOpts.forceConfig = true;

    //  We need nodes to be able to access attributes like 'pattern' off of
    //  resource tags etc.
    this.pkgOpts.nodes = true;

    this.debug('pkgOpts: ' + CLI.beautify(JSON.stringify(this.pkgOpts)));

    this.package = new Package(this.pkgOpts);

    if (this.pkgOpts.all || !this.pkgOpts.config) {
        this.package.expandAll();
        list = this.package.listAllAssets();
    } else {
        this.package.expandPackage();
        list = this.package.listPackageAssets();
    }

    resources = [];
    list.forEach(function(item) {
        var src,
            pattern,
            filter;

        if (item.localName !== 'resource') {
            return;
        }

        if (item.hasAttribute('no-inline')) {
            return;
        }

        pattern = item.getAttribute('pattern');
        if (pattern) {
            try {
                filter = mm.filter(pattern);
                if (!filter) {
                    throw new Error('InvalidPattern');
                }
            } catch (e) {
                cmd.error('Unable to create glob function for: ' + pattern);
                throw e;
            }
        }

        src = cmd.package.expandPath(
            item.getAttribute('src') || item.getAttribute('href'));
        if (!sh.test('-d', src)) {
            resources.push(cmd.package.getVirtualPath(src));
            return;
        }

        list = sh.ls('-R', src);
        list = list.map(
                function(entry) {
                    return entry.toString();
                });

        if (filter) {
            list = list.filter(filter);
        }

        list.forEach(function(file) {
            var fullpath;

            fullpath = CLI.joinPaths(src, file);
            //  remove any directories in the list due to -R option
            if (sh.test('-d', fullpath)) {
                return;
            }

            resources.push(cmd.package.getVirtualPath(fullpath));
        });
    });

    return resources;
};


/**
 * Returns a list of options/flags/parameters suitable for command completion.
 * @returns {Array.<string>} The list of options for this command.
 */
Cmd.prototype.getCompletionOptions = function() {
    var list,
        plist;

        list = Cmd.Parent.prototype.getCompletionOptions.call(this);
        plist = Cmd.Parent.prototype.getCompletionOptions();

    return CLI.subtract(plist, list);
};


/**
 * Computes and returns the TIBET Shell script command line to be run.
 * @returns {String} The TIBET Shell script command to execute.
 */
Cmd.prototype.getScript = function() {
    var str,
        context;

    str = ':resource';

    if (this.options.type) {
        str += ' --type=\'' + this.options.type + '\'';
    }

    if (this.options.raw) {
        str += ' --raw';
    }

    //  Pass context. This is used to drive a load phase filter in the client.
    context = this.options.context || CLI.inProject() ? 'app' : 'lib';
    str += ' --context=' + context;

    //  Ensure we pass along any profile/package/config parameters (which are
    //  not boot variants) as part of the script itself.
    this.options.profile = this.getProfile();
    CLI.setcfg('profile', this.options.profile);

    str += ' --profile=\'' + this.options.profile + '\'';

    return str;
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
 * Process both specified and computed resources, determining which are actually
 * on the disk, processing them as needed, and outputting appropriate configs.
 */
Cmd.prototype.processResources = function() {
    var cmd,
        buildpath,
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

    helper = function(resource) {
        var fullpath,
            uri;

        //  Could be a JSON struct with a 'uri' property or a String
        uri = Array.isArray(resource) ? resource[0] : resource;

        if (!uri) {
            return false;
        }

        //  Check for paths that will expand properly, silence any errors.
        fullpath = CLI.expandPath(uri, true);
        if (!fullpath) {
            cmd.debug('filtered ' + uri + '. No fullpath...');
            return false;
        }

        //  Didn't expand? ignore it. Didn't process properly.
        if (fullpath === uri) {
            cmd.debug('filtered ' + uri + '. Path did not expand.');
            return false;
        }

        //  deal with any filtering pattern
        if (CLI.notEmpty(filter)) {
            if (!filter.test(fullpath)) {
                cmd.debug('filtered ' + uri + '. Filter match failed.');
                return false;
            }
        }

        if (sh.test('-e', fullpath)) {
            //  If the file exists ensure it gets added to the filtered list.
            return true;
        } else {
            if (packagePhase) {
                cmd.error(uri + ' (404) ');
            }

            cmd.debug('filtered ' + uri + '. Non-existent ' + fullpath);
            return false;
        }
    };

    if (!this.options.raw) {
        this.info('Filtering ' + this.computed.length + ' computed' +
                    ' and ' + this.specified.length + ' specified' +
                    ' resources...');
    }

    //  Produce a filtered list by expanding the resource path and checking for
    //  its existence, adherence to filtering criteria, context, etc.
    this.filtered = this.computed.filter(helper);

    //  Filter the specified resource list and combine the two lists (if not
    //  being asked for raw resource listings..which only use computed data)
    packagePhase = true;
    if (!this.options.raw) {
        this.filtered = this.filtered.concat(this.specified.filter(helper));
    }

    //  Normalize the paths to their best form.
    this.filtered = this.filtered.map(function(resource) {
        var uri;

        uri = Array.isArray(resource) ? resource[0] : resource;
        return CLI.getVirtualPath(CLI.expandPath(uri));
    });

    if (!this.options.build) {

        if (!this.options.raw) {
            this.info(
                'Found ' + this.filtered.length + ' concrete resources...');
        }

        this.filtered.forEach(function(resource) {
            var res,
                base,
                file;

            if (cmd.options.raw) {
                cmd.products.push([resource, resource]);
                return;
            }

            //  Don't include "source code" files as inlined resources...do the
            //  replacement to naming they'd normally do.
            res = resource;
            Cmd.EXCLUDE_REPLACEMENTS.forEach(function(pair) {
                res = res.replace(pair[0], '.' + pair[1]);
            });

            // base = res.slice(res.indexOf(path.sep) + 1).replace(
            //    /\//g, '-');
            base = resource.replace(/^~/, '').replace(/\//g, '-');
            file = CLI.joinPaths(buildpath, base);
            if (path.extname(file) !== '.js') {
                file += '.js';
            }

            cmd.products.push([resource, file]);
        });

        cmd.logConfigEntries();

        return Promise.resolve();
    }

    if (!this.options.raw) {
        this.info('Building ' + this.filtered.length + ' concrete resources...');
    }

    //  We have a filtered list, the challenge now is to produce promises
    //  so we can manage async operations like compiling LESS files etc.
    this.promises = this.filtered.map(function(resource) {
        var shouldInline,
            shouldProcess,
            fullpath;

        fullpath = CLI.expandPath(resource, true);

        //  Detect whether the resource should be inlined.
        shouldInline = Cmd.INLINED_RESOURCES.some(function(regex) {
            return regex.test(fullpath);
        });

        //  Detect whether the resource needs processing (i.e. SASS that needs
        //  to be converted to CSS).
        shouldProcess = Cmd.NEEDS_PROCESSING.some(function(regex) {
            return regex.test(fullpath);
        });

        //  If the resource shouldn't be inlined *and* isn't one that is
        //  processed, then make an entry with just the virtualized resource
        //  path itself and return a reflected, resolved Promise.
        if (!shouldInline && !shouldProcess) {
            cmd.products.push([resource, resource]);
            return Promise.resolve().reflect();
        }

        cmd.debug('Building ' + fullpath);

        return new Promise(function(resolve, reject) {
            var data,
                content,
                base,
                file,
                ext,
                methodName;

            //  Replace the resource name with a normalized variant.
            // base = resource.slice(resource.indexOf(path.sep) + 1).replace(
            //      /\//g, '-');
            base = resource.replace(/^~/, '').replace(/\//g, '-');
            file = CLI.joinPaths(buildpath, base);
            if (path.extname(file) !== '.js') {
                file += '.js';
            }

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

                content = CLI.normalizeLineEndings(content);

                fs.writeFileSync(file, content);

                return resolve();
            }
        }).reflect();
    });

    //  Invoked once all promises doing actual work have run. The inspections
    //  hold success/failure data from the list.
    return Promise.all(this.promises).then(function(inspections) {
        var code;

        code = 0;

        //  because we're using 'Promise.reflect' we don't really know
        //  the state of each individual promise yet...we have to check them.
        inspections.forEach(function(inspection, index) {
            var product,
                msg;

            product = cmd.products[index];
            if (inspection.isFulfilled()) {
                if (product) {
                    cmd.info(product[0]);
                }
            } else {
                code += 1;
                if (product) {
                    msg = product[0] + ' (' + inspection.reason() + ')';
                } else {
                    msg = inspection.reason();
                }
                cmd.error(msg);
            }
        });

        if (code !== 0) {
            cmd.error('Error(s) processing resources.');
            return code;
        }

        if (cmd.options.list || !cmd.options.build) {
            return cmd.logConfigEntries();
        } else {
            return cmd.updatePackage();
        }

    }).catch(function(err) {
        cmd.error(err);
    });
};


/*
 * Process LESS files.
 */
Cmd.prototype.processLessResource = function(options) {
    var cfg,
        cmd,
        lessOpts,
        vars;

    cmd = this;

    vars = {};

    try {
        //  Iterate over all of the 'path.' variables, getting each key and
        //  slicing the 'path.' part off of it. Any remaining periods ('.') in
        //  the key are replaced with '-'. Then, quote the value so that LESS
        //  doesn't have issues with spaces, etc.
        cfg = CLI.getcfg('path');
        Object.keys(cfg).forEach(
            function(aKey) {
                var val;

                //  If the cfg data has a real value for that key, get the key
                //  and slice off the 'path.' portion. Any remaining periods
                //  ('.') in the key are then replaced with '-'. Then, quote the
                //  value so that LESS doesn't have issues with spaces, etc.
                if (CLI.notEmpty(val = cfg[aKey])) {
                    //  NB: We don't map keys that point to values that are
                    //  Arrays.
                    if (!Array.isArray(val)) {
                        vars[aKey.slice(5).replace(/\./g, '-')] =
                            '"' + CLI.expandPath(val) + '"';
                    }
                }
            });

        lessOpts = options.less || {};
        lessOpts.globalVars = vars;
        lessOpts.paths = [];
        lessOpts.paths.push(path.dirname(options.fullpath));

        lessOpts.rootpath = path.dirname(options.fullpath);
    } catch (e) {
        options.reject(e);
        return;
    }

    return less.render(options.data, lessOpts).then(function(output) {
        var content,
            rname,
            fname,
            finaloutput;

        rname = options.resource.replace(/\.less$/, '.css');
        fname = options.file.replace(/\.less\.js$/, '.css.js');

        cmd.products.push([options.resource, fname]);

        //  adjust any @import statements in the source to have virtualized
        //  paths. Otherwise, we end up with absolute paths in our output, which
        //  causes problems for the runtime style machinery.
        finaloutput = output.css;
        finaloutput = finaloutput.replace(
                        Cmd.CSS_IMPORT_RULE,
                        function(wholeMatch, leadingText, importLoc) {
                            return '@import url("' +
                                    CLI.getVirtualPath(importLoc) +
                                    '");';
                        });

        content = 'TP.uc(\'' + rname + '\').setContent(\n';
        content += CLI.quoted(finaloutput);
        content += '\n);';

        content = CLI.normalizeLineEndings(content);

        fs.writeFileSync(fname, content);

        return options.resolve();
    },
    function(err) {
        options.reject(err);
    }).catch(function(err) {
        options.reject(err);
    });
};

/*
 * Process common-style SASS files.
 */
Cmd.prototype.processScssResource = function(options) {
    var cmd,

        vars,
        varStr,

        cfg,
        dataStr,

        resourcePath,

        opts;

    cmd = this;

    vars = {};

    varStr = '';

    try {
        //  Iterate over all of the 'path.' variables, getting each key and
        //  slicing the 'path.' part off of it. Any remaining periods ('.') in
        //  the key are replaced with '-'. Then, quote the value so that SASS
        //  doesn't have issues with spaces, etc.
        cfg = CLI.getcfg('path');
        Object.keys(cfg).forEach(
            function(aKey) {
                var val;

                //  If the cfg data has a real value for that key, get the key
                //  and slice off the 'path.' portion. Any remaining periods
                //  ('.') in the key are then replaced with '-'. Then, quote the
                //  value so that LESS doesn't have issues with spaces, etc.
                if (CLI.notEmpty(val = cfg[aKey])) {
                    //  NB: We don't map keys that point to values that are
                    //  Arrays.
                    if (!Array.isArray(val)) {
                        vars[aKey.slice(5).replace(/\./g, '-')] =
                            '"' + CLI.expandPath(val) + '"';
                    }
                }
            });

        Object.keys(vars).forEach(
            function(aVar) {
                varStr = '$' + aVar + ': ' + vars[aVar] + ';\n';
            });

    } catch (e) {
        options.reject(e);
        return;
    }

    dataStr = varStr + options.data;

    resourcePath = options.fullpath;
    resourcePath = resourcePath.slice(0, resourcePath.lastIndexOf('/') + 1);

    opts = {
        data: dataStr,
        includePaths: [resourcePath]
    };

    return sass.render(opts, function(error, output) {
        var content,
            rname,
            fname,
            finaloutput;

        if (error) {
            return options.reject(error);
        }

        rname = options.resource.replace(/\.scss$/, '.css');
        fname = options.file.replace(/\.scss\.js$/, '.css.js');

        cmd.products.push([options.resource, fname]);

        //  adjust any @import statements in the source to have virtualized
        //  paths. Otherwise, we end up with absolute paths in our output, which
        //  causes problems for the runtime style machinery.
        finaloutput = output.css.toString();
        finaloutput = finaloutput.replace(
                        Cmd.CSS_IMPORT_RULE,
                        function(wholeMatch, leadingText, importLoc) {
                            return '@import url("' +
                                    CLI.getVirtualPath(importLoc) +
                                    '");';
                        });

        content = 'TP.uc(\'' + rname + '\').setContent(\n';
        content += CLI.quoted(finaloutput);
        content += '\n);';

        content = CLI.normalizeLineEndings(content);

        fs.writeFileSync(fname, content);

        return options.resolve();
    });
};


/*
 * Alias for original-style SASS files.
 */
Cmd.prototype.processSassResource = Cmd.prototype.processScssResource;

/**
 * Perform the work necessary to produce a cached copy of an XML resource.
 * @param {Object} options The options list containing data including:
 *     resource: resource,
 *     fullpath: fullpath,
 *     base: base,
 *     file: file,
 *     data: data,
 *     resolve: resolve,
 *     reject: reject
 * @returns {Promise} A resolved/rejected Promise.
 */
Cmd.prototype.processXmlResource = function(options) {
    var cmd,
        data,
        resource,
        file,
        content;

    cmd = this;

    data = options.data;
    resource = options.resource;
    file = options.file;

    cmd.products.push([resource, file]);

    content = 'TP.uc(\'' + resource + '\').setContent(\n';
    content += CLI.quoted(data);
    content += '\n);';

    content = CLI.normalizeLineEndings(content);

    fs.writeFileSync(file, content);

    return options.resolve();
};

/**
 * Performs post-processing of data captured by running the :resources command
 * in the client. This hook invokes the 'processResources' method to produce
 * either listings or inlined content for the resource list.
 */
Cmd.prototype.close = function(code, browser) {

    /* eslint-disable no-process-exit */
    if (code !== undefined && code !== 0) {
        if (browser && browser.close) {
            browser.close();
        }
        process.exit(code);
    }

    this.processResources().then(function(exit) {
        if (browser && browser.close) {
            browser.close();
        }
        if (CLI.isValid(exit)) {
            process.exit(exit);
        }
        process.exit(0);
    }).catch(function(err) {
        process.exit(-1);
    });
};


/**
 * Captures each line of output from the client :resource command and stores it
 * for later processing in the 'close' method.
 */
Cmd.prototype.stdout = function(data) {
    var arr,
        cmd;

    if (CLI.notValid(data)) {
        return;
    }

    arr = Array.isArray(data) ? data : [data];

    cmd = this;

    arr.forEach(function(item) {
        var obj,
            line;

        line = item.data;

        //  Sometimes, there will be no line data because, depending on OS and
        //  process, undefined lines will have gotten written to stdout. Filter
        //  for those here.
        if (!line) {
            return;
        }

        //  Obj will be an Array with 3 parts:
        //  - The virtualized filename
        //  - The load stage that the file loaded in (CLI.PHASE_ONE or
        //  CLI.PHASE_TWO).
        //  - The name of the owner type that the resource is owned by.
        obj = line.split(CLI.JOIN);

        if (obj[0].charAt(0) === '~') {
            cmd.computed.push(obj);
        } else {
            //  NOTE we manually colorize since color is off to headless to
            //  avoid problems trying to parse the output data.
            /* eslint-disable no-console */
            console.log(cmd.colorize(line, 'dim'));
            /* eslint-enable no-console */
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

    if (!this.options.raw) {
        this.warn('Configuration Entries (not saved):');
        this.info('<config id="inlined"' +
            ' if="' + cond + ' boot.inlined"' + '>');
    }

    this.products.forEach(function(pair) {
        if (cmd.options.raw) {
            cmd.info(CLI.getVirtualPath(pair[1]));
            return;
        }

        cmd.info('    <script src="' + CLI.getVirtualPath(pair[1]) + '"/>');
    });

    if (!this.options.raw) {
        this.info('</config>');
    }
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

        inlineCfgName,
        inlineCfgNode,
        inlinePkgOpts,
        inlineAssets,

        resourceCfgName,
        resourceCfgNode,
        resourcePkgOpts,
        resourceAssets,

        pkgName,
        pkgNode,

        condAttr,
        cond,
        mainName,
        mainNode,
        version,
        newVersion;

    cmd = this;

    if (CLI.inLibrary()) {
        pkgName = 'TIBET';
    } else {
        pkgName = this.package.getcfg('project.name');
    }

    //  Now we fetch or build nodes for both the inline and resource sections of
    //  the config.
    if (pkgName.charAt(0) !== '~') {
        if (CLI.inProject()) {
            pkgName = CLI.joinPaths('~app_cfg', pkgName);
        } else {
            pkgName = CLI.joinPaths('~lib_cfg', pkgName);
        }
    }

    if (!/.xml$/.test(pkgName)) {
        pkgName = pkgName + '.xml';
    }

    pkgNode = cmd.readPackageNode(pkgName);

    this.log('Writing package resource entries...');

    //  ---
    //  SET UP INLINE CONFIG AND ASSETS
    //  ---

    //  This may build the node if not currently found.
    inlineCfgName = 'inlined';
    inlineCfgNode = this.readConfigNode(pkgNode, inlineCfgName, true);
    if (!inlineCfgNode) {
        throw new Error('Unable to find ' + pkgName + '@' + inlineCfgName);
    }

    //  Ensure we have the right phase (in case we built the node)
    if (CLI.inProject()) {
        cond = 'boot.phase_two';

        if (this.options.build) {
            mainName = CLI.joinPaths('~app_cfg', 'main.xml');
            mainNode = cmd.readPackageNode(mainName);

            version = mainNode.getAttribute('version');
            newVersion = this.package.getcfg('project.version') ||
                this.package.getcfg('npm.version');

            if (version !== newVersion) {
                //  update the "app package" version.
                pkgNode.setAttribute('version', newVersion);
                dirty = true;

                //  update the root (main) package as well.
                mainNode.setAttribute('version', newVersion);
                cmd.writePackageNode(mainName, mainNode);
            }
        }

    } else if (CLI.inLibrary()) {
        cond = 'boot.phase_one';
    }

    condAttr = inlineCfgNode.getAttribute('if');
    if (condAttr.indexOf(cond) === -1) {
        if (CLI.isEmpty(condAttr)) {
            inlineCfgNode.setAttribute('if', cond);
        } else {
            inlineCfgNode.setAttribute('if', condAttr + ' ' + cond);
            dirty = true;
        }
    }

    //  Ensure we have the resource filter on the node.
    cond = 'boot.inlined';
    condAttr = inlineCfgNode.getAttribute('if');
    if (condAttr.indexOf(cond) === -1) {
        if (CLI.isEmpty(condAttr)) {
            inlineCfgNode.setAttribute('if', cond);
        } else {
            inlineCfgNode.setAttribute('if', condAttr + ' ' + cond);
            dirty = true;
        }
    }

    //  Get package information in expanded form so we can check against any
    //  potentially nested config structures. Being able to nest makes it easy
    //  to iterate while still being able to organize into different config
    //  bundles for different things (like lama vs. test vs. xctrls).
    inlinePkgOpts = {
        package: pkgName,
        config: inlineCfgName,
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

    pak = new Package(inlinePkgOpts);
    pak.expandPackage();
    inlineAssets = pak.listPackageAssets();

    //  Normalize to TIBET format for comparison during product loop below.
    inlineAssets = inlineAssets.map(function(asset) {
        return CLI.getVirtualPath(asset);
    });

    //  ---
    //  SET UP RESOURCE CONFIG AND ASSETS
    //  ---

    //  This may build the node if not currently found.
    resourceCfgName = 'resources';
    resourceCfgNode = this.readConfigNode(pkgNode, resourceCfgName, true);
    if (!resourceCfgNode) {
        throw new Error('Unable to find ' + pkgName + '@' + resourceCfgName);
    }

    //  Get package information in expanded form so we can check against any
    //  potentially nested config structures. Being able to nest makes it easy
    //  to iterate while still being able to organize into different config
    //  bundles for different things (like lama vs. test vs. xctrls).
    resourcePkgOpts = {
        package: pkgName,
        config: resourceCfgName,
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

    pak = new Package(resourcePkgOpts);
    pak.expandPackage();
    resourceAssets = pak.listPackageAssets();

    //  Normalize to TIBET format for comparison during product loop below.
    resourceAssets = resourceAssets.map(function(asset) {
        return CLI.getVirtualPath(asset);
    });

    //  Process the individual files, checking for existence and adding any that
    //  are missing from the resource config.
    this.products.forEach(function(pair) {
        var file,
            value,
            exclude,
            node,
            assets,
            tag,
            str,
            inlined;

        file = pair[1];
        value = CLI.getVirtualPath(file);

        //  Don't include "source code" files that need processing as inlined
        //  resources...no point.
        exclude = Cmd.NEEDS_PROCESSING.some(function(regex) {
            //  NOTE we test output, not original file path here so we don't
            //  filter LESS that turned into CSS etc.
            return regex.test(pair[1]);
        });

        if (exclude) {
            return;
        }

        node = inlineCfgNode;
        assets = inlineAssets;

        tag = cmd.getTag(file);
        if (tag === 'script') {
            str = '<' + tag + ' src="' + value + '"/>';
        } else if (tag === 'resource') {
            str = '<' + tag + ' href="' + value + '"';

            inlined = Cmd.INLINED_RESOURCES.some(function(regex) {
                return regex.test(value);
            });

            if (!inlined) {
                str += ' no-inline="true"';
                node = resourceCfgNode;
                assets = resourceAssets;
            }

            str += '/>';
        }

        if (assets.indexOf(value) === -1) {
            dirty = true;
            cmd.addXMLEntry(node, '    ', str, '');
            cmd.log(str + ' (added)');
            assets.push(value);
        } else {
            void 0;
            // cmd.log(str + ' (exists)');
        }
    });

    if (dirty) {
        cmd.writePackageNode(pkgName, pkgNode);

        this.warn(
            'New configuration entries created. Review/Rebuild as needed.');
    }
};

module.exports = Cmd;

}());
