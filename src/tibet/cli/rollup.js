//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet rollup' command. This command inherits from 'tibet
 *     package' and works with a list of package asset nodes to process them
 *     into compressed and concatenated form for faster loading. See the tibet
 *     package command for more information on options.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0 */

(function() {

'use strict';

var CLI,
    fs,
    minify,
    Cmd;


CLI = require('./_cli');
fs = require('fs');

minify = require('babel-minify');

//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('./package'); // NOTE we inherit from package command.
Cmd.prototype = new Cmd.Parent();


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
Cmd.NAME = 'rollup';

//  ---
//  Instance Attributes
//  ---

/**
 * Command argument parsing options.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend({
    boolean: ['debug', 'headers', 'minify', 'clean'],
    string: ['package', 'config', 'phase', 'since'],
    default: {
        clean: false,
        color: false,
        debug: false,
        headers: true,
        package: CLI.inProject() ? '~app_cfg/main' : '~lib_cfg/TIBET',
        phase: CLI.inProject() ? 'two' : 'one',
        //  TODO:   don't hardcode this. should be a getcfg value or
        //  lookup, not something the command line parser fills in for us
        config: 'base'
    }
},
Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The timeout used for command invocation. Rollups can take a long time to
 * build and minify so we give this a generous amount of time.
 * @type {Number}
 */
Cmd.prototype.TIMEOUT = 1000 * 60 * 5;

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet rollup [package-opts] [--since] [--headers] [--minify] [--clean] [--debug]';


//  ---
//  Instance Methods
//  ---

/**
 * Produces a compressed package of code ready for inclusion in a production
 * package. Note that virtually everything defaults when running in a typical
 * TIBET application context. For processing the TIBET platform you must at
 * least provide a package name (since the platform doesn't keep its tibet.xml
 * in the typical application location under TIBET-INF).
 * @param {Array.<Node>} list An array of package asset nodes.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executeForEach = function(list) {
    var pkg,
        cmd,
        tmpdir,
        minifyOpts; // Options for minify

    cmd = this;
    pkg = this.package;

    if (CLI.inProject() && !CLI.isInitialized()) {
        return CLI.notInitialized();
    }

    //  Grab the temp directory path that we're going to use as the build cache
    //  (and create it if it's not there).
    tmpdir = CLI.joinPaths(CLI.sh.tempdir(),
        CLI.getcfg('tibet.rollup_cache'));

    if (!CLI.sh.test('-d', tmpdir)) {
        CLI.sh.mkdir('-p', tmpdir);
    }

    //  TODO:   provide a way to configure this from a config flag.
    minifyOpts = {
        //  Whitespace is automatic, mangling does 95% of the rest.
        mangle: true,
        keepFnName: true,
        keepClassName: true,

        //  Don't get fancy, it's just not worth the minor savings.
        booleans: false,
        builtIns: false,
        consecutiveAdds: false,
        deadcode: false,
        evaluate: false,
        flipComparisons: false,
        guards: false,
        infinity: false,
        memberExpressions: false,
        mergeVars: false,
        numericLiterals: false,
        propertyLiterals: false,
        regexpConstructors: false,
        removeConsole: false,
        removeDebugger: false,
        removeUndefined: false,
        replace: false,
        simplify: false,
        simplifyComparisons: false,
        typeConstructors: false,
        undefinedToVoid: false
    };

    this.debug('minifyOpts: ' + CLI.beautify(JSON.stringify(minifyOpts)));

    list.forEach(function(item) {
        var src,
            usecache,
            result,
            code,
            virtual,
            cachename;

        //  If this doesn't work it's a problem for any 'script' output.
        src = item.getAttribute('src') || item.getAttribute('href');

        if (src) {
            virtual = pkg.getVirtualPath(src);

            if (!CLI.sh.test('-e', src)) {
                throw new Error('NotFound: ' + src);
            }

            usecache = false;

            cachename = CLI.joinPaths(
                        tmpdir,
                        src.replace(/\//g, '_').replace(/\.js/, '.min.js'));

            //  If the file exists in the cache, check it's last modified
            //  date/time against the source file's last modified date/time. If
            //  the cache file is newer than the source file, then the source
            //  file hasn't changed and we can just use the cache file.
            if (CLI.sh.test('-e', cachename)) {
                if (CLI.isFileNewer(cachename, src)) {
                    usecache = true;
                }
            }

            cmd.debug('rolling up: ' + virtual);

            //  Don't minify .min.js files, assume they're done. Also respect
            //  either command-line option or element attribute to that effect.
            if (/\.min\.js$/.test(src) ||
                CLI.notEmpty(item.getAttribute('no-minify')) ||
                !cmd.options.minify) {
                code = fs.readFileSync(src, {encoding: 'utf8'});
            } else {
                if (usecache) {
                    code = fs.readFileSync(cachename, {encoding: 'utf8'});
                } else {
                    try {
                        code = fs.readFileSync(src, {encoding: 'utf8'});

                        result = minify(code, minifyOpts);
                        if (!result || !result.code) {
                            code = '';
                        } else {
                            code = result.code;
                        }

                        if (code && code[code.length - 1] !== ';') {
                            code += ';';
                        }

                        new CLI.sh.ShellString(code).to(cachename);
                    } catch (e) {
                        cmd.error('Error minifying ' + src + ': ' + e.message);
                        throw e;
                    }
                }
            }

            if (cmd.options.headers) {
                pkg.log('TP.boot.$$srcPath = \'' + virtual + '\';');
                pkg.log('TP.boot.$$srcPackage = \'' +
                        pkg.getVirtualPath(item.getAttribute('loadpkg')) +
                        '\';');
                pkg.log('TP.boot.$$srcConfig = \'' +
                        item.getAttribute('loadcfg') +
                        '\';');
            }

            if (cmd.options.debug !== true) {
                pkg.log(code);
            }

        } else {

            if (cmd.options.headers) {
                pkg.log('TP.boot.$$srcPath = \'\';');
            }

            if (cmd.options.debug !== true) {
                pkg.log(item.textContent);
            }
        }
    });
};


/**
 * Performs any prereq processing before the invocation of executeForEach.
 * @param {Array.<Node>} list An array of package nodes.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executeListPrereqs = function(list) {
    var tmpdir,
        err,
        cmd,
        newer;

    cmd = this;

    //  Cleaning? Then remove any content in the cache.
    if (cmd.options.clean) {
        //  Grab the temp directory path that we're going to use as the build
        //  cache (and create it if it's not there).
        tmpdir = CLI.joinPaths(CLI.sh.tempdir(),
            CLI.getcfg('tibet.rollup_cache'));

        if (CLI.sh.test('-d', tmpdir)) {
            //  Empty the cache directory before we start processing files.
            err = CLI.sh.rm('-rf', tmpdir);
            if (CLI.sh.error()) {
                cmd.error('Error removing cache directory: ' + err.stderr);
                return 1;
            }
        }
    } else if (cmd.options.since) {

        //  If there's a 'since' value it means we're being asked to do a
        //  conditional rollup. If any of the files are newer than the timestamp
        //  then we let it all continue, otherwise we essentially terminate the
        //  rollup so the invoking routine (usually a build) can just use the
        //  existing rollup target (which presumably provided the timestamp).
        newer = list.filter(function(item) {
            var src,
                fullpath;

            //  If this doesn't work it's a problem for any 'script' output.
            src = item.getAttribute('src') || item.getAttribute('href');
            if (!src) {
                return false;
            }

            fullpath = CLI.expandPath(src);
            if (!CLI.sh.test('-e', fullpath)) {
                return false;
            }

            //  Make sure we treat --since as a number.
            return CLI.isFileNewer(fullpath, Number(cmd.options.since));
        });

        if (CLI.isEmpty(newer)) {
            //  String values will just be logged and processing will end.
            return 'no source changes --since=' + cmd.options.since;
        } else {
            return newer.map(function(item) {
                return item.getAttribute('src') || item.getAttribute('href') ||
                    'inline';
            });
        }
    }

    return list;
};


/**
 * Perform any last-minute changes to the package options before creation of the
 * internal Package instance. Intended to be overridden by custom subcommands.
 */
Cmd.prototype.finalizePackageOptions = function() {

    // Force nodes to be true for this particular subcommand. Better to handle
    // the unwrapping ourselves so we have complete access to all
    // metadata and/or child node content.
    this.pkgOpts.nodes = true;

    //  Never try to roll up image or resource tags. Images are binary (so
    //  should be more cache API level) and resources are inlined via the
    //  resource command/config (or are cached using the cache API).
    this.pkgOpts.images = false;
    this.pkgOpts.resources = false;

    this.debug('pkgOpts: ' + CLI.beautify(JSON.stringify(this.pkgOpts)));
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
 * Top-level processing of the package to produce an asset list. For this type
 * and subtypes of the package command you should look to the "executeForEach"
 * method for the actual node-by-node processing logic.
 * @returns {Number|Promise} The return code produced by running the command (a
 *     non-zero indicates an Error) or a Promise that resolves when the command
 *     finishes.
 */
Cmd.prototype.execute = function() {
    var list,
        result;

    this.configurePackageOptions();

    list = this.getPackageAssetList();

    //  NOTE we have an early-exit option here in case any aspect of the
    //  prereq processing tells us to stop. It's a bit of a hack but for
    //  debugging purposes we return an array of the files that are triggering
    //  the process to continue. If the result isn't an array then we treat it
    //  as a termination message.
    result = this.executeListPrereqs(list);
    if (!Array.isArray(result)) {
        console.log(result);
        return 0;
    }

    this.executeForEach(list);

    return 0;
};


module.exports = Cmd;

}());
