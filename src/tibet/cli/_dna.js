//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview Common supertype for cloning-related operations like tibet clone
 *     and tibet type.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0 */

//  TODO
/* eslint-disable no-unreachable */

(function() {

'use strict';

var CLI,
    path,
    handlebars,
    helpers,
    Cmd;

CLI = require('./_cli');
path = require('path');
handlebars = require('handlebars');
helpers = require('../../../etc/helpers/config_helpers');

//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('./_cmd');
Cmd.prototype = new Cmd.Parent();

//  Augment our prototype with XML config methods.
helpers.extend(Cmd, CLI);

//  ---
//  Instance Attributes
//  ---

/**
 * The command execution context. Clone can only be done outside of a project.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.OUTSIDE;

/**
 * The name of the optional configuration file in DNA directories. This file is
 * read but not copied/processed during operation.
 * @type {String}
 */
Cmd.prototype.DNA_CONFIG = '__dna.json';

/**
 * The default template to use from the DNA_ROOT location.
 * @type {string}
 */
Cmd.prototype.DNA_DEFAULT = 'default';

/**
 * Where are the dna templates we should clone from? This value will be joined
 * with the current file's load path to create the absolute root path.
 * @type {string}
 */
Cmd.prototype.DNA_ROOT = CLI.joinPaths('..', '..', '..', '..', 'dna');

/**
 * Whether the command needs --force when a destination directory already
 * exists. Clone does, type commands don't.
 * @type {Boolean}
 */
Cmd.prototype.NEEDS_FORCE = true;

/**
 * A pattern used to determine if a resource can/should have config entries
 * added for it during packaging.
 */
Cmd.prototype.PACKAGED_RESOURCE = /.+\.(js|jscript|json|xml|xhtml|xsl|xsd|css)$/;

/**
 * Command argument parsing options.
 * @type {Object}
 */
/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend({
    boolean: ['force', 'list', 'update'],
    string: ['dir', 'dna', 'name', 'xmlns'],
    default: {
    }
},
Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * A list of products to be added to configuration data as needed.
 * @type {Array.<string>}
 */
Cmd.prototype.products = null;

/**
 * The name of the key for template substitutions. Default is 'appname'. Other
 * common options are 'typename' and 'tagname'.
 * @type {String}
 */
Cmd.prototype.TEMPLATE_KEY = 'appname';

//  ---
//  Instance Methods
//  ---

/**
 * Check arguments and configure default values prior to running prereqs.
 * @returns {Object}
 */
Cmd.prototype.configure = function() {
    throw new Error('MissingOverride');
};


/**
 * Returns a copyright string taken from the path.*_copyright_file content. This
 * file may contain it's own template parameter(s), most notably 'year'.
 */
Cmd.prototype.configureCopyright = function() {
    var params,
        virtual,
        fullpath,
        silent,
        template,
        content,
        data;

    //  Tricky part is "where are we"?
    if (CLI.inProject()) {
        virtual = '~app_copyright_file';
    } else if (CLI.inLibrary()) {
        virtual = '~lib_copyright_file';
    } else {
        //  NOTE this is a special ref for when we're cloning.
        virtual = '~dna_copyright_file';
    }

    fullpath = CLI.expandPath(virtual);
    silent = CLI.sh.config.silent;
    CLI.sh.config.silent = true;
    data = CLI.sh.cat(fullpath);
    CLI.sh.config.silent = silent;

    if (CLI.isEmpty(data)) {
        return CLI.getcfg('tibet.copyright_default', '');
    }

    //  Ensure it's "just a string" and not a ShellJS string object.
    data = data.toString();

    //  No templates? Return in string form.
    if (/{{/.test(data) !== true) {
        return data.toString().trim();
    }

    params = {
        year: new Date().getFullYear()
    };

    //  Templated (usually with {{year}} etc.
    try {
        template = handlebars.compile(data);
        if (!template) {
            throw new Error('InvalidCopyrightTemplate');
        }
    } catch (e) {
        CLI.error('Error compiling template ' + fullpath + ': ' +
            e.message);
        return CLI.getcfg('tibet.copyright_default', '');
    }

    try {
        content = template(params);
        if (!content) {
            throw new Error('InvalidContent');
        }
    } catch (e) {
        CLI.error('Error injecting template data in ' + fullpath +
            ': ' + e.message);
        return CLI.getcfg('tibet.copyright_default', '');
    }

    return content.toString().trim();
};


/**
 * Updates the receiver's configuration data based on any configuration data
 * pulled in from the DNA directory. This allows each dna template to provide
 * custom values for certain configuration parameters.
 * @param {Object} config The dna-specific configuration object.
 */
Cmd.prototype.configureForDNA = function(config) {
    return 0;
};


/**
 * Return a valid XMLNS uri value based on command line input and default values
 * which respect whether you are in a project or the library.
 * @param {String} appname The application name to use (defaults to --name or the
 *     current TIBET project name.
 * @returns {String} The xmlns URI.
 */
Cmd.prototype.configureXMLNS = function(appname) {
    var xmlns;

    //  Define an XMLNS value. This is used for CSS url() sections as well as
    //  any tag-related definitions. NOTE the value for lib is set to the value
    //  we use for 'tibet:' prefixes elsewhere in the library.
    xmlns = this.options.xmlns || CLI.getcfg('tibet.xmlns');
    if (CLI.notEmpty(xmlns)) {
        return xmlns;
    }

    return CLI.inLibrary() ?
            'http://www.technicalpursuit.com/1999/tibet' :
            'urn:app:' + (appname || this.options.appname || this.options.name);
};


/**
 * Runs the specific command in question.
 * @returns {Number|Promise} The return code produced by running the command (a
 *     non-zero indicates an Error) or a Promise that resolves when the command
 *     finishes.
 */
Cmd.prototype.execute = function() {
    var options,
        code;

    options = this.options;

    //  Just list if that option was specified.
    if (options.list) {
        return this.executeList();
    }

    //  Clone the dna to working destination directory.
    code = this.executeMakeWorkingDir();
    if (code !== 0) {
        return code;
    }

    //  Clone the dna to working destination directory.
    code = this.executeClone();
    if (code !== 0) {
        return code;
    }

    //  Process files in the working directory. This has async/event-driven
    //  activity so the remaining aspects (position, package, etc) are done from
    //  within the 'end' event handler in that routine.
    code = this.executeProcess();

    return code;
};


/**
 * Removes any working directory which might have been constructed.
 */
Cmd.prototype.executeCleanup = function(code, force) {
    var options,
        working,
        list,
        msg,
        err;

    options = this.options;
    working = options.tmpdir;

    if (!CLI.sh.test('-e', working)) {
        return;
    }

    msg = 'Cleaning up working directory';
    if (arguments.length > 0 && code !== 0) {
        this.warn(msg + ' after error.');
    } else {
        this.log(msg + '.');
    }

    //  Get a full list of remaining files in the working directory so we can
    //  test whether it's empty of actual content files.
    list = CLI.sh.ls('-RA', working).filter(function(file) {
        var fullpath;

        fullpath = CLI.joinPaths(working, file.toString());
        return !CLI.sh.test('-d', fullpath);
    });

    //  Force is true when cleaning an old working dir prior to execution.
    if (!force) {
        if (list.length > 0) {
            this.warn(list.length + ' file' + (list.length > 1 ? 's' : '') +
                ' not repositioned. Check working directory: ' +
                working);
            return 0;
        }
    }

    err = CLI.sh.rm('-rf', working);
    if (CLI.sh.error()) {
        this.error('Error removing working directory: ' + err.stderr);
        return 1;
    }

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
        dna,
        working,
        err,
        flags,

        silent,
        msg;

    options = this.options;
    dna = options.dna;

    working = options.tmpdir;

    // NOTE there are some minor quirks/deviations from how the same command
    // might work at the command line depending on your shell etc.
    flags = options.force ? '-r' : '-rn';

    err = CLI.sh.cp(flags, CLI.joinPaths(dna, '*'), working);
    if (CLI.sh.error()) {
        this.error('Error cloning dna directory: ' + err.stderr);
        this.executeCleanup(1);
        return 1;
    }

    silent = CLI.sh.config.silent;
    CLI.sh.config.silent = true;
    err = CLI.sh.cp(flags, CLI.joinPaths(dna, '.*'), working);
    CLI.sh.config.silent = silent;

    if (CLI.sh.error()) {
        msg = err.stderr;
        if (!/no such file/.test(msg)) {
            this.error('Error cloning dna directory: ' + msg);
            this.executeCleanup(1);
            return 1;
        }
    }

    //  Before we go any further we have to rename any directories which include
    //  template references themselves.
    return this.executeProcessDirs();
};


/**
 * List the available dna templates for this command.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executeList = function() {
    var dir,
        list,
        cmd;

    cmd = this;

    dir = CLI.joinPaths(module.filename, this.DNA_ROOT);
    if (CLI.sh.test('-d', dir)) {
        list = CLI.sh.ls('-A', dir);
        if (CLI.sh.error()) {
            this.error('Error checking dna directory: ' + list.stderr);
            return 1;
        }
    } else {
        cmd.info(dir);
    }

    if (list) {
        list.forEach(function(item) {
            var itemStr;

            itemStr = item.toString();

            if (itemStr.charAt(0) === '.' || itemStr.charAt(0) === '_') {
                return;
            }
            cmd.log(item);
        });
    }

    return 0;
};


/**
 * Create a working directory to clone and process for new content.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executeMakeWorkingDir = function() {
    var options,
        name,
        cwd,
        working,
        err;

    options = this.options;
    name = options.name;

    cwd = CLI.getCurrentDirectory();

    //  Start locally so it's easy to diff/merge from same parent.
    working = CLI.joinPaths(cwd, '_' + name + '_');
    options.tmpdir = working;

    if (CLI.sh.test('-e', working)) {
        if (!options.force) {
            this.error('Working directory already exists. Use --force to ignore.');
            return 1;
        } else {
            this.executeCleanup(0, true);
        }
    }

    err = CLI.sh.mkdir('-p', working);
    if (CLI.sh.error()) {
        this.error('Error creating working directory: ' + err.stderr);
        return 1;
    } else {
        this.log('working in: ' + working);
    }

    return 0;
};


/**
 * Performs any updates to the application package that are needed. The default
 * implementation simply returns.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executePackage = function() {
    var code;

    code = 0;

    this.log('adjusting package entries...');

    this.executeCleanup(code);

    this.summarize();

    return code;
};


/**
 * Repositions the working directory or directory content to the final
 *     destination location.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executePosition = function() {
    var options,
        dest,
        working,
        err,
        list,
        code,
        cmd;

    this.log('positioning files...');

    cmd = this;

    this.products = [];

    options = this.options;

    dest = options.dest;
    working = options.tmpdir;

    //  If the target dir doesn't exist we make that directory so we can then
    //  iterate across the working dir files via the logic below.
    if (!CLI.sh.test('-e', dest)) {
        cmd.verbose('creating target directory: ' + dest);
        err = CLI.sh.mkdir('-p', dest);
        if (CLI.sh.error()) {
            this.error('Error creating destination directory: ' + err.stderr);
            this.executeCleanup(code);
            return 1;
        }
    }

    code = 0;

    list = CLI.sh.ls('-RA', working);

    //  Move any directories that don't exist in target location. This will bulk
    //  move as many files as possible without interaction overhead.
    list.forEach(function(file) {
        var filename,

            fullpath,
            target;

        filename = file.toString();

        fullpath = CLI.joinPaths(working, filename);
        if (!CLI.sh.test('-d', fullpath)) {
            return;
        }

        //  Check for target directories and create as needed.
        target = CLI.joinPaths(dest, filename);
        cmd.verbose('checking directory: ' + target);
        if (!CLI.sh.test('-d', target)) {
            cmd.debug('moving directory: ' + filename);
            CLI.sh.mv('-n', fullpath, target);
        } else {
            cmd.verbose('directory exists');
        }
    });

    //  Rescan working directory for anything remaining after directory moves.
    list = CLI.sh.ls('-RA', working);

    list.forEach(function(file) {
        var filename,

            fullpath,
            target,
            skipped,
            exists,
            olddat,
            newdat,
            answer,
            err2;

        filename = file.toString();

        fullpath = CLI.joinPaths(working, filename);
        if (CLI.sh.test('-d', fullpath)) {
            //  Skip directories. We've moved any that didn't already exist. The
            //  remaining ones will hopefully be emptied by the time we invoke
            //  the cleanup routine.
            return;
        }

        if (!CLI.sh.test('-f', fullpath)) {
            cmd.warn('ignoring special file: ' + fullpath);
            CLI.sh.rm('-rf', fullpath);
            return;
        }

        //  Ignore any configuration file we see.
        if (path.basename(filename) === cmd.DNA_CONFIG) {
            //  Remove it so it doesn't make working dir look dirty.
            cmd.verbose('cleansing marker file: ' + filename);
            CLI.sh.rm('-rf', fullpath);
            return;
        }

        cmd.verbose('positioning file: ' + filename);

        skipped = false;
        target = CLI.joinPaths(dest, filename.replace(working, ''));
        exists = CLI.sh.test('-e', target);

        if (exists) {
            //  If they're the same we can provide a clearer set of messaging
            //  and avoid making it sound like we replaced/updated content.
            olddat = CLI.sh.cat(target).toString();
            newdat = CLI.sh.cat(fullpath).toString();
            if (olddat === newdat) {
                cmd.verbose('ignoring duplicate file: ' + fullpath);
                CLI.sh.rm('-rf', fullpath);
                return;
            }

            //  NOTE we put update first because we can use --force to cleanse a
            //  working dir but then rely on update for file positioning.
            if (options.update) {
                answer = CLI.prompt.question(
                    'Replace ' + filename + ' ? [n] ');
                if (answer.toLowerCase().charAt(0) === 'y') {
                    cmd.warn('updating existing file: ' + target);
                    err2 = CLI.sh.mv(fullpath, target);
                } else {
                    cmd.log('skipping conflicted file: ' + target);
                    skipped = true;
                }
            } else if (options.force) {
                cmd.warn('replacing existing file: ' + target);
                err2 = CLI.sh.mv(fullpath, target);
            } else {
                cmd.log('skipping existing file: ' + target);
                skipped = true;
            }
        } else {
            err2 = CLI.sh.mv('-n', fullpath, target);
        }

        if (!skipped) {
            if (CLI.sh.error()) {
                cmd.error('Error positioning file: ' + err2.stderr);
                return 1;
            }

            //  If we really added the file and it matches our "config-able"
            //  pattern add it to the products list used by updatePackage.
            if (cmd.PACKAGED_RESOURCE.test(target)) {
                cmd.verbose('tracking ' + target);
                cmd.products.push([filename, target]);
            }
        }
    });

    if (code === 0) {
        cmd.log('positioning complete...');
        code = cmd.executePackage();
    } else {
        cmd.executeCleanup(code);
    }

    return code;
};


/**
 * Performs any post-processing necessary after executeProcess and prior to
 * executePosition. This is typically used to overlay base DNA content with
 * specific template or style content.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executePostProcess = function() {
    return 0;
};


/**
 * Performs template processing on the content of the working directory.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executeProcess = function() {
    var options,
        badexts,
        badpaths,
        params,
        list,
        cmd,
        working,
        code;

    options = this.options;

    cmd = this;

    working = options.tmpdir;

    badexts = ['.bmp', '.png', '.gif', '.jpg', '.ico', '.jpeg', '.gz', '.br',
        '.woff', '.woff2'];
    badpaths = ['.DS_Store'];

    cmd.log('processing templates...');

    //  Delegate production of template parameters to the specific command.
    //  Common differences here are appname vs. typename (root.ns.type).
    params = this.getTemplateParameters();

    //  Get the list of files which are potential templating targets.
    list = CLI.sh.ls('-RA', working).filter(function(file) {
        var filename,

            fullpath;

        filename = file.toString();

        if (badexts.indexOf(path.extname(filename)) !== -1 ||
            badpaths.indexOf(path.basename(filename)) !== -1) {
console.log('skipping', filename);
            return false;
        }

        fullpath = CLI.joinPaths(working, filename);

        return CLI.sh.test('-f', fullpath);
    });

    code = 0;

    list.forEach(function(file) {
        var filename,

            fullpath,   //  Complete file name.
            content,    //  File content after template injection.
            data,       //  File data.
            template,   //  The template content.
            fileparam;  //  adjusted filename for template params.

        filename = file.toString();

        fullpath = CLI.joinPaths(working, filename);

        cmd.verbose('processing file: ' + fullpath);

        try {
            data = CLI.sh.cat(fullpath).toString();
            if (!data) {
                throw new Error('Empty');
            }
        } catch (e) {
            cmd.error('Error reading ' + fullpath + ': ' + e.message);
            code = 1;
            return;
        }

        try {
            template = handlebars.compile(data);
            if (!template) {
                throw new Error('InvalidTemplate');
            }
        } catch (e) {
            cmd.error('Error compiling template ' + fullpath + ': ' +
                e.message);
            code = 1;
            return;
        }

        fileparam = path.basename(filename);
        fileparam = fileparam.replace(path.extname(filename), '');
        fileparam = fileparam.split('_')[0] || fileparam.split('_')[1];
        params.filename = fileparam;

        try {
            content = template(params);
            if (!content) {
                throw new Error('InvalidContent');
            }
        } catch (e) {
            cmd.error('Error injecting template data in ' + fullpath +
                ': ' + e.message);
            code = 1;
            return;
        }

        if (data === content) {
            cmd.verbose('ignoring static file: ' + fullpath);
        } else {
            cmd.verbose('updating file: ' + fullpath);
            try {
                content = CLI.normalizeLineEndings(content);
                new CLI.sh.ShellString(content).to(fullpath);
            } catch (e) {
                cmd.error('Error writing file ' + fullpath + ': ' + e.message);
                code = 1;
                return;
            }
        }

        //  Allow command to process the file name and rename it from template
        //  format to final format as needed.
        code = cmd.executeRename(fullpath);
    });

    if (code === 0) {
        cmd.log('templating complete...');

        //  Do any post-processing necessary to refine/replace the baseline
        //  DNA before we reposition the working dir files.
        code = cmd.executePostProcess();
        if (code !== 0) {
            return;
        }

        //  Note that positioning will trigger package updates if successful
        //  so we don't need to do that here.
        code = cmd.executePosition();
    } else {
        cmd.executeCleanup(code);
    }

    return code;
};


/**
 * Performs template processing on directories in the working directory.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executeProcessDirs = function() {
    var options,
        cmd,
        working,
        params,
        dirs,
        keys;

    options = this.options;

    cmd = this;

    working = options.tmpdir;

    cmd.log('processing directories...');

    //  Delegate production of template parameters to the specific command.
    //  Common differences here are appname vs. typename (root.ns.type).
    params = this.getTemplateParameters();
    keys = Object.keys(params);

    dirs = CLI.sh.ls('-RA', working).filter(function(file) {
        var filename,

            passed,
            fullpath;

        filename = file.toString();

        fullpath = CLI.joinPaths(working, filename);
        if (!CLI.sh.test('-d', fullpath)) {
            return false;
        }

        passed = keys.some(function(key) {
            var regex;

            regex = new RegExp('__' + key + '__($|[^/])');
            return regex.test(fullpath);
        });

        return passed;
    });

    dirs.forEach(function(dir) {
        cmd.executeRename(CLI.joinPaths(working, dir));
    });

    return 0;
};


/**
 * Invoked by executeProcess on a file-by-file basis to optionally rename a
 * templated file to a permanent name.
 * @param {String} file The filename to check for renaming.
 */
Cmd.prototype.executeRename = function(file) {
    var params,
        regex,
        code,
        cmd,
        fname,
        newname;

    code = 0;

    cmd = this;

    fname = file;

    //  The parameters that feed templating for this command are the same things
    //  we can use in the renaming process to rename template files.
    params = this.getTemplateParameters();

    //  Force __home__.xhtml to rename to home.xhtml to avoid templating in that
    //  file from causing issues with linting etc.
    params.home = 'home';

    Object.keys(params).forEach(function(key) {
        var value;

        regex = new RegExp('__' + key + '__', 'g');

        value = params[key];

        // Rename the file if it also has a name which matches our
        // name that's templated.
        try {
            if (regex.test(fname)) {
                newname = fname.replace(regex, value);
                CLI.sh.mv('-n', fname, newname);
                fname = newname;
            }
        } catch (e) {
            cmd.error('Error renaming ' + fname + ': ' + e.message);
            code = 1;
        }
    });

    return code;
};


/**
 * Return the key/value pairs representing parameters necessary for templating
 * for this command.
 * @returns {Object} The key/value pairs templates will be expecting.
 */
Cmd.prototype.getTemplateParameters = function() {
    var options,
        obj,
        name,
        dna,
        xmlns,
        params;

    if (this.params) {
        return this.params;
    }

    options = this.options;

    name = options.name;
    dna = options.dna;
    xmlns = options.xmlns;

    //  NOTE that we don't use the full path for the dna reference here to avoid
    //  embedding real paths in the output.
    obj = {};
    obj[this.TEMPLATE_KEY] = name;
    obj.dna = dna.slice(dna.lastIndexOf('/') + 1);
    obj.xmlns = xmlns;

    obj.year = new Date().getFullYear();

    obj.copyright = this.configureCopyright();

    params = CLI.blend(obj, options);
    this.params = params;

    this.trace('template params:\n' + CLI.beautify(JSON.stringify(params)));

    return params;
};


/**
 * Verifies any prerequisites to running the execute() method. For this command
 * the primary validations are the DNA and destination directory checks.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.prereqs = function() {
    var options,
        code;

    options = this.options;

    //  Require at least a name to create via this operation.
    if (!options.name && !options.list) {
        this.usage();
        return 1;
    }

    //  Name has to be a valid JS identifier or it won't work in the various
    //  templates which ultimately generate client-side code.
    if (!CLI.isJSIdentifier(options.name) && !options.list) {
        this.error('Name must be a valid JS identifier: ' + options.name);
        this.usage();
        return 1;
    }

    code = this.verifyDNA();
    if (code === 0) {
        code = this.verifyDestination();
    }

    return code;
};


/**
 * Write a summary of what the command has done.
 */
Cmd.prototype.summarize = function() {
    return;
};


/**
 * Verifies that the destination location is proper for the current command.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.verifyDestination = function() {
    var options,
        dirname,
        cwd,
        dest,
        list,
        err;

    options = this.options;
    dirname = options.dir;

    //  ---
    //  Verify destination directory
    //  ---

    if (dirname === '.') {
        cwd = CLI.getCurrentDirectory();

        // Destination will be our current directory, and we'll end up adjusting
        // our dirname to be whatever the current directory name is.
        dest = cwd;
        options.dest = dest;

        dirname = dest.slice(dest.lastIndexOf('/') + 1);
        options.dir = dirname;

        list = CLI.sh.ls('-RA', dest);
        if (CLI.sh.error()) {
            this.error('Error checking destination directory: ' + list.stderr);
            return 1;
        }

        if (list.length !== 0 && this.NEEDS_FORCE) {
            if (options.update) {
                this.warn('--update specified, updating existing content.');
            } else if (options.force) {
                this.warn('--force specified, replacing existing content.');
            } else {
                this.error('Current directory is not empty. Use --force or --update.');
                return 1;
            }
        }
    } else {
        dest = CLI.expandPath(dirname);
        options.dest = dest;

        if (CLI.sh.test('-e', dest) && this.NEEDS_FORCE) {
            if (options.update) {
                this.warn('--update specified, conflicts will prompt.');
            } else if (options.force) {
                this.warn('--force specified, removing and rebuilding ' + dest);
                err = CLI.sh.rm('-rf', dest);
                if (CLI.sh.error()) {
                    this.error('Error removing destination directory: ' +
                                err.stderr);
                    return 1;
                }
            } else {
                this.error('Destination directory ' + dest +
                    ' already exists.' +
                    ' Use --update to patch, --force to replace.');
                return 1;
            }
        }
    }

    return 0;
};


/**
 * Verifies that the DNA directory is valid so it can be cloned.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.verifyDNA = function() {
    var dna,
        cwd,
        options,
        config,
        dnaconfig,
        template,
        content;

    options = this.options;
    dna = options.dna;

    //  ---
    //  Confirm the DNA
    //  ---

    if (CLI.isEmpty(dna)) {
        this.error('Invalid/empty dna: ' + dna);
        return 1;
    }

    //  DNA can be entered as 'typename' (ComputedTag) but we convert to
    //  lowercase to normalize for directory use.
    dna = dna.toLowerCase();

    //  If the dna reference is a tag name we leave the full scan to reflection
    //  during a later phase.
    if (/:|[a-zA-Z0-9]\./.test(dna)) {
        return this.configureForDNA({});
    }

    // If the dna reference doesn't include either a / or dot indicating a
    // path then we work strictly from the TIBET dna directory choices.
    if (/\.|\//.test(dna)) {
        // Try to resolve as an absolute reference.
        if (!CLI.sh.test('-e', dna)) {
            // Try to resolve as a relative reference.
            cwd = CLI.getCurrentDirectory();
            dna = CLI.joinPaths(cwd, dna);
            if (!CLI.sh.test('-e', dna)) {
                this.error('Unable to locate dna: ' + dna);
                return 1;
            }
            options.dna = dna;
        }
    } else {
        // Try to resolve as pre-built library dna.
        dna = CLI.joinPaths(module.filename, this.DNA_ROOT, dna);
        if (!CLI.sh.test('-e', dna)) {
            this.error('Unable to locate dna: ' + dna);
            return 1;
        }
        options.dna = dna;
    }

    //  Once we've verified the DNA we can try to load any DNA-specific
    //  configuration which is used to refine remaining processes.
    config = CLI.joinPaths(dna, this.DNA_CONFIG);
    if (CLI.sh.test('-e', config)) {
        try {
            dnaconfig = require(config);
        } catch (e) {
            this.error('Error loading DNA config: ' + e.message);
            return 1;
        }

        try {
            template = handlebars.compile(JSON.stringify(dnaconfig));
            if (!template) {
                throw new Error('InvalidTemplate');
            }
        } catch (e) {
            this.error('Error compiling template ' + config + ': ' +
                e.message);
            return 1;
        }

        try {
            content = template(this.options);
            if (!content) {
                throw new Error('InvalidConfig');
            }
        } catch (e) {
            this.error('Error injecting template data in ' + config +
                ': ' + e.message);
            return 1;
        }

        try {
            dnaconfig = JSON.parse(content);
        } catch (e) {
            this.error('Error parsing dna config: ' + config +
                ': ' + e.message);
            return 1;
        }

        this.trace('dna config: ' +
            CLI.beautify(JSON.stringify(dnaconfig)));

        return this.configureForDNA(dnaconfig);
    }

    return 0;
};


module.exports = Cmd;

}());
