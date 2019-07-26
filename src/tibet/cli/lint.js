//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet lint' command. Checks a package/config's script files
 *     for lint. TIBET uses eslint, a configurable linter supporting custom
 *     rulesets, to perform the actual linting process.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0 */

(function() {

'use strict';

var CLI,
    path,
    sh,
    eslint,
    parseString,
    Promise,
    Cmd;


CLI = require('./_cli');

Promise = require('bluebird');
path = require('path');
parseString = require('xml2js').parseString;
sh = require('shelljs');
eslint = require('eslint');


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
Cmd.NAME = 'lint';

/**
 * The file path used to track last run timestamp.
 * @type {String}
 */
Cmd.LAST_RUN_DATA = '~/.tibetlint.json';

//  ---
//  Instance Attributes
//  ---

/**
 * Command argument parsing options.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['scan', 'stop', 'list', 'nodes', 'quiet',
            'style', 'js', 'json', 'xml', 'only', 'force'],
        'string': ['esconfig', 'esrules', 'esignore', 'styleconfig',
            'package', 'config', 'phase', 'filter', 'context'],
        'default': {
            style: true,
            js: true,
            json: true,
            xml: true,
            nodes: true,
            scan: CLI.inLibrary()
        }
    },
    Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * A list of valid extensions for JavaScript source content.
 * @type {Array.<String>}
 */
Cmd.prototype.JS_EXTENSIONS = ['js', 'jscript'];


/**
 * A list of valid extensions for style-related source content.
 * @type {Array.<String>}
 */
Cmd.prototype.STYLE_EXTENSIONS = ['css', 'less', 'sass'];

/**
 * A list of supported XML file extensions which will be checked for well-formed
 * content during processing.
 * @type {Array.<String>}
 */
Cmd.prototype.XML_EXTENSIONS = ['atom', 'gpx', 'kml', 'rdf', 'rss', 'svg',
    'tmx', 'tsh', 'xhtml', 'xml', 'xsd', 'xsl'];

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE =
    'tibet lint [[--filter] <filter>] [--context=app|lib|all] [--scan] [--stop] [package-opts] [eslint-opts] [stylelint-opts]';


//  ---
//  Instance Methods
//  ---

/**
 * Processes the command line options and maps the proper settings into their
 * corresponding eslint command arguments.
 * @returns {Object} The options specific to running eslint.
 */
Cmd.prototype.configureEslintOptions = function() {

    var opts;

    opts = {};

    if (this.options.esconfig) {
        opts.configFile = this.options.esconfig;
    } else {
        opts.configFile = CLI.expandPath('~/.eslintrc');
    }

    if (this.options.esrules) {
        opts.rulePaths = this.options.esrules.split(' ');
    }

    if (this.options.esignore) {
        opts.ignorePath = this.options.esignore;
    } else {
        opts.ignorePath = CLI.expandPath('~/.eslintignore');
    }

    return opts;
};


/**
 * Processes any stylelint command line options and returns configuration data
 * appropriate for the stylelint node.js API call.
 * @returns {Object} A stylelint-compatible configuration object.
 */
Cmd.prototype.configureStylelintOptions = function() {
    var file,
        config;

    config = {};

    //  Determine the best location of the stylelintrc file, from command line,
    //  application root, or library root.
    if (this.options.styleconfig) {
        config.configFile = CLI.expandPath(this.options.styleconfig);
    } else {
        file = CLI.expandPath('~/.stylelintrc');
        if (!sh.test('-f', file)) {
            file = CLI.expandPath('~lib/.stylelintrc');
            if (sh.test('-f', file)) {
                config.configFile = file;
            }
        } else {
            config.configFile = file;
        }
    }

    config.configBasedir = path.dirname(config.configFile);

    return config;
};


/**
 * Returns a freshly initialized "results" object for use by one or more
 * linters.
 */
Cmd.prototype.constructResults = function() {
    return {
        linty: 0,
        errors: 0,
        warnings: 0,
        checked: 0,
        unchanged: 0,
        filtered: 0,
        files: 0
    };
};

/**
 * Performs lint processing, verifying TIBET's xml configuration files
 * first, then any assets listed as part of the project in its manifest(s).
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var list,       // The result list of asset references.
        files,
        result,
        args,
        key,
        cmd;

    cmd = this;

    this.configurePackageOptions();

    if (CLI.isEmpty(this.options.context)) {
        if (CLI.inLibrary()) {
            this.options.context = 'lib';
        } else if (CLI.inProject()) {
            this.options.context = 'app';
        } else {
            this.options.context = 'all';
        }
    }

    //  Special case for a single '.' so it behaves like ESLint et. al.
    if (this.options.filter === '.') {
        this.options.filter = null;
        this.options.scan = true;
        this.options.force = true;
    }

    //  If we have 'only' specified we should be setting all but one value for
    //  'type' to false.
    if (this.options.only) {
        args = this.getArgv();

        this.options.style = false;
        this.options.js = false;
        this.options.json = false;
        this.options.xml = false;

        args.some(function(arg) {
            var opts;

            opts = ['js', 'json', 'style', 'xml'];
            if (opts.indexOf(arg.slice(2)) !== -1) {
                key = arg;
                return true;
            }

            return false;
        });

        if (!key) {
            throw new Error('Invalid argument combination.');
        }

        this.options[key.slice(2)] = true;
    }

    result = this.constructResults();

    // Build up the list of files to be processed either by scanning the
    // directory or by leveraging package@config data.
    if (this.options.scan) {

        // If we're scanning we won't get nodes, so turn that option off.
        this.options.nodes = false;

        list = this.getScannedAssetList();
    } else {

        // Verify that the package files are in decent shape before we attempt
        // to actually use any of them.
        result = this.validateConfigFiles();
        if (result.errors !== 0) {
            return result.errors;
        } else {
            //  RESET result to avoid counting config files in final output.
            result = this.constructResults();
        }

        this.verbose('reading package list...');
        list = this.getPackageAssetList();
    }

    result.files = list.length;
    list = this.filterAssetList(list);
    result.filtered = result.files - list.length;
    list = this.filterUnchangedAssets(list);
    result.unchanged = result.files - result.filtered - list.length;

    // Once we have a list we need to pull it apart into lists we can pass to
    // each of the unique parsers. This is a bit more efficient than trying to
    // handle each file individually in whatever order we might come across it.
    files = this.executeForEach(list);

    if (this.options.js) {
        result = this.validateSourceFiles(files.js, result);
        if (this.options.stop && result.errors !== 0) {
            return this.summarize(result);
        }
    }

    if (this.options.json) {
        result = this.validateJSONFiles(files.json, result);
        if (this.options.stop && result.errors !== 0) {
            return this.summarize(result);
        }
    }

    if (this.options.xml) {
        result = this.validateXMLFiles(files.xml, result);
        if (this.options.stop && result.errors !== 0) {
            return this.summarize(result);
        }
    }

    //  For now we do style last since it's Promise-based and will force async
    //  processing. We simplify by just having it summarize when it's done.
    if (this.options.style) {

        this.validateStyleFiles(files.style, result).then(function(data) {
            var res;

            res = cmd.summarize(data);
            if (res.errors > 0) {
                throw new Error();
            }
        },
        function(err) {
            cmd.error(err);
            throw new Error();
        }).catch(function(err) {
            cmd.error(err);
            throw new Error();
        });

    } else {

        //  If not doing promise-based logic for style then wrapup.
        this.summarize(result);
        if (result.errors > 0) {
            throw new Error();
        }
    }

    return 0;
};


/**
 * Sorts the contents of the list into a set of individual lists for each type
 * of validation we can perform. If the file doesn't have an extension, or the
 * extension doesn't match one of those considered valid by this command that
 * file will be filtered by this method.
 * @param {Array.<Node>} list An array of package asset nodes.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executeForEach = function(list) {

    var cmd,
        files,
        jsexts,
        styleexts,
        xmlexts;

    cmd = this;
    files = {
        style: [],
        js: [],
        json: [],
        xml: []
    };

    jsexts = CLI.blend(CLI.blend([], CLI.getcfg('cli.lint.js_extensions')),
        cmd.JS_EXTENSIONS);
    styleexts = CLI.blend(CLI.blend([], CLI.getcfg('cli.lint.style_extensions')),
        cmd.STYLE_EXTENSIONS);
    xmlexts = CLI.blend(CLI.blend([], CLI.getcfg('cli.lint.xml_extensions')),
        cmd.XML_EXTENSIONS);

    try {
        list.forEach(function(item) {
            var src,
                ext;

                /*
                opts,
                engine,
                result;
                */

            if (cmd.options.nodes) {
                // Depending on the nature of the resource there are two
                // canonical attributes likely to point to the source file.
                src = item.getAttribute('src') || item.getAttribute('href');
            } else {
                src = item;
            }

            if (src) {
                // Skip minified files regardless of their type.
                if (src.match(/\.min\./)) {
                    cmd.verbose(src + ' # minified');
                    return;
                }

                // Skip minified files regardless of their type.
                if (src.match(/__(.+)__/)) {
                    cmd.verbose(src + ' # template');
                    return;
                }

                ext = src.slice(src.lastIndexOf('.') + 1);
                if (styleexts.indexOf(ext) !== -1) {
                    files.style.push(src);
                } else if (ext === 'json') {
                    files.json.push(src);
                } else if (jsexts.indexOf(ext) !== -1) {
                    files.js.push(src);
                } else if (xmlexts.indexOf(ext) !== -1) {
                    files.xml.push(src);
                } else {
                    cmd.verbose(src + ' # unlintable');
                }

            } else if (cmd.options.nodes) {
                // Nodes, but no src attribute. Inline source.
                cmd.verbose('<script> # inline source');
                cmd.trace(item.textContent.trim());

                /*
                 * It's possible to feed source to eslint now but it's not
                 * particularly useful since inline source rarely fits the
                 * form of a full source file of content.
                 */
                /*
                opts = cmd.configureEslintOptions();

                engine = new eslint.CLIEngine(opts);
                result = engine.executeOnText(item.textContent);

                cmd.processEslintResult(result);
                */
            }
        });
    } catch (e) {
        if (!cmd.options.stop) {
            this.error(e.message);
        }
    }

    return files;
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
 * Filters an asset list for context and pattern restrictions.
 * @param {Array.<string>} list The asset list to be filtered.
 * @returns {Array.<string>} The filtered list.
 */
Cmd.prototype.filterAssetList = function(list) {
    var filter,
        pattern,
        prefix,
        cmd;

    this.verbose('filtering asset list...');

    if (!Array.isArray(list) || list.length < 1) {
        return [];
    }

    if (CLI.notEmpty(this.options.filter)) {
        filter = this.options.filter;
    } else {
        // The options._ object holds non-qualified parameters. [0] is the
        // command name. [1] should be the "filter" if any.
        filter = this.options._[1];
    }

    if (CLI.notEmpty(filter)) {
        //  Simple directory search requires a leading '.' to signify.
        if (filter.charAt(0) === '.') {
            filter = filter === '.' ? process.cwd() : path.join(process.cwd(), filter);
        }
        pattern = CLI.stringAsRegExp(filter);
    }

    //  Use context to set a file prefix we can compare against.
    if (this.options.context === 'app') {
        prefix = CLI.expandPath('~');
    } else if (this.options.context === 'lib') {
        prefix = CLI.expandPath('~lib');
    }

    cmd = this;

    return list.filter(function(item) {
        var src;

        if (cmd.options.nodes) {
            // Depending on the nature of the resource there are two
            // canonical attributes likely to point to the source file.
            src = item.getAttribute('src') || item.getAttribute('href');

            //  If there's no value it must be an inline node. Ignore.
            if (CLI.isEmpty(src)) {
                cmd.verbose(src + ' # filtered (inline)');
                return false;
            }
        } else {
            src = item;
        }

        //  NEVER lint the build directory content. It's almost guaranteed to
        //  have lint due to compression tools etc.
        if (CLI.getVirtualPath(src).indexOf('app_build') !== -1) {
            cmd.verbose(src + ' # filtered (build)');
            return false;
        }

        if (CLI.isEmpty(path.extname(src))) {
            cmd.verbose(src + ' # filtered (no extension)');
            return false;
        }

        src = CLI.expandPath(src);
        if (CLI.notEmpty(prefix) && src.indexOf(prefix) !== 0) {
            cmd.verbose(src + ' # filtered (context)');
            return false;
        }

        //  Never lint the last run data file... it's always fresh.
        if (src === CLI.expandPath(Cmd.LAST_RUN_DATA)) {
            cmd.verbose(src + ' # filtered (internal)');
            return false;
        }

        //  Filter files based on input pattern/filter data.
        if (CLI.notEmpty(filter)) {
            if (CLI.notEmpty(pattern)) {
                if (!pattern.test(src)) {
                    cmd.verbose(src + ' # filtered (pattern)');
                    return false;
                }
            } else {
                if (src.indexOf(filter) === -1) {
                    cmd.verbose(src + ' # filtered (filter)');
                    return false;
                }
            }
        }
        return true;
    });
};


/**
 * Filters an asset list for unchanged files. Any files whose
 * modified date is earlier than the last time lint was run
 * or the various package/tool files driving the linter changed
 * are removed from the list of files to be linted.
 * @param {Array.<string>} list The asset list to be filtered.
 * @returns {Array.<string>} The filtered list.
 */
Cmd.prototype.filterUnchangedAssets = function(list) {
    var data,
        lastpath,
        lastrun,
        cmd;

    if (this.options.force) {
        return list;
    }

    this.verbose('filtering unchanged assets...');

    if (!Array.isArray(list) || list.length < 1) {
        return [];
    }

    cmd = this;

    //  If we're not forcing lint we can skip files not changed since the last
    //  run...if we know when the last run occurred.
    lastpath = CLI.expandPath(Cmd.LAST_RUN_DATA);
    if (CLI.sh.test('-e', lastpath)) {
        data = CLI.sh.cat(lastpath);
        if (data) {
            try {
                data = JSON.parse(data);
                lastrun = data.lastrun;
            } catch (e) {
                CLI.error('Unable to parse last run info: ' + e.message);
                lastrun = 0;
            }
        }
    }
    lastrun = lastrun === void 0 ? 0 : lastrun;
    lastrun = new Date(lastrun);

    return list.filter(function(item) {
        var src,
            newer;

        if (cmd.options.nodes) {
            // Depending on the nature of the resource there are two
            // canonical attributes likely to point to the source file.
            src = item.getAttribute('src') || item.getAttribute('href');
        } else {
            src = item;
        }

        if (CLI.isEmpty(src)) {
            return false;
        }

        src = CLI.expandPath(src);

        //  If the file didn't pass cleanly on the last pass we always
        //  recheck. Yes, the source may not have changed, but this is an
        //  easy way to ensure each run reminds you what's broken/linty.
        if (data && data.recheck && data.recheck.indexOf(src) !== -1) {
            return true;
        }

        newer = CLI.isFileNewer(src, lastrun);
        if (!newer) {
            cmd.verbose(src + ' # filtered (unchanged)');
        }
        return newer;
    });
};


/**
 * Returns a list of assets based on scanning the project directory structure.
 * Any node_modules directory content will be ignored.
 * @returns {Array} The list of project assets found in the directory tree.
 */
Cmd.prototype.getScannedAssetList = function() {

    var dir,
        file,
        /* eslint-disable no-unused-vars */
        ignores,
        lib,
        /* eslint-enable no-unused-vars */
        list,
        root;

    dir = CLI.getAppHead();

    file = CLI.expandPath('~/.eslintignore');
    if (sh.test('-e', file)) {
        ignores = sh.cat(file);
    } else {
        ignores = '';
    }

    //  If we got an unlabeled argument in position 1 consider it the directory
    //  path to be scanned. we allow this to be a virtual path provided that the
    //  user properly quoted it to get it past shell expansion.
    root = this.options._[1];
    if (CLI.notEmpty(root)) {
        if (root === '.') {
            dir = process.cwd();
        } else {
            dir = CLI.expandPath(root);
            if (dir.charAt(0) !== '/') {
                dir = path.join(process.cwd(), root);
            }
        }
    }
    this.verbose('scanning ' + dir + '...');

    lib = CLI.inLibrary();
    list = sh.find(dir).filter(function(fname) {
        if (sh.test('-d', fname) ||
            fname.match(/node_modules|.git|.svn/)) {
            return false;
        }

        //  Don't scan into frozen library source when in a project.
        if (!lib) {
            return !fname.match(/TIBET-INF\/tibet/);
        }

        //  TODO:   add glob checks against ignores list

        return true;
    });

    return list;
};


/**
 * Perform any last-minute changes to the package options before creation of the
 * internal Package instance. Intended to be overridden but custom subcommands.
 */
Cmd.prototype.finalizePackageOptions = function() {

    // Force nodes to be true for this particular subcommand. Better to handle
    // the unwrapping ourselves so we have complete access to all
    // metadata and/or child node content.
    this.pkgOpts.nodes = true;

    //  We're linting :)
    this.pkgOpts.noattrmasks = ['lint'];

    // Force the most comprehensive package@config we can given our context.
    if (CLI.inProject()) {
        if (CLI.notValid(this.pkgOpts.package)) {
            this.pkgOpts.package = CLI.getcfg('boot.default_package') ||
                CLI.PACKAGE_FILE;
        }
    } else if (CLI.inLibrary()) {
        if (CLI.notValid(this.pkgOpts.package)) {
            this.pkgOpts.package = '~lib_cfg/TIBET.xml';
        }
    }

    if (CLI.notValid(this.pkgOpts.config)) {
        this.pkgOpts.config = 'developer';
    }

    this.trace('pkgOpts: ' + CLI.beautify(this.pkgOpts));
};


/**
 * Handles output for an ESLint CLIEngine result object.
 * @param {Object} result The result object is of the form:
 *         result: { results: [ { filePath: "a path...", messages: [ ... ] } };
 *     Where a message is of the form:
 *         message: { line: n, column: n, ruleId: s, message: s,
 *              fatal: b, severity: n };
 *     Fatal or severity === 2 messages are considered errors, severity 1 is a
 *     warning message (similar to the values set when controlling rules).
 */
Cmd.prototype.processEslintResult = function(result) {
    var cmd,
        errors,
        warnings,
        results,
        recheck,
        summary;

    cmd = this;
    errors = 0;
    warnings = 0;

    recheck = [];

    results = result.results;

    results.forEach(function(entry) {
        var messages,
            file;

        file = entry.filePath;
        messages = entry.messages;

        if (messages.length === 0) {
            cmd.verbose('');
            cmd.verbose(file, 'lintpass');
            return;
        }

        // Filter for errors vs. warnings.
        messages = messages.filter(function(message) {
            return message.fatal || message.severity === 2;
        });
        errors = messages.length;
        warnings = entry.messages.length - errors;

        //  Add any file that doesn't pass cleanly to the recheck list.
        if (errors + warnings > 0) {
            recheck.push(file);
        }

        if (cmd.options.quiet) {
            // If we're only doing output when an error exists we're done if no
            // errors were found.
            if (errors === 0) {
                cmd.verbose('');
                cmd.verbose(file, 'lintpass');
                return;
            }
        } else {
            // If we're not in quiet-mode reset to the full message list since
            // we'll be outputting both errors and warnings.
            messages = entry.messages;
        }

        if (errors > 0) {
            cmd.error('');
            cmd.error(file, 'underline');
        } else {
            cmd.warn('');
            cmd.warn(file, 'underline');
        }

        // If we're only listing file names we're done now :)
        if (cmd.options.list) {
            return;
        }

        messages.forEach(function(message) {
            var str,
                prefix;

            prefix = cmd.lpad(message.line, 5) + ':' +
                cmd.rpad(message.column || '', 5);

            if (message.fatal || message.severity === 2) {
                prefix += cmd.colorize('error   ', 'error');
            } else {
                prefix += cmd.colorize('warn    ', 'warn');
            }

            str = prefix + cmd.rpad(message.message.trim(), 62) + ' ' +
                cmd.colorize(message.ruleId, 'dim');

            cmd.log(str);
        });
    });

    summary = {
        warnings: warnings,
        errors: errors,
        linty: 0,
        recheck: recheck
    };

    if (warnings + errors > 0) {
        summary.linty = 1;
    }

    return summary;
};


/**
 * Handles output for an Stylelint result object.
 * @param {Object} result The result object is of the form:
 *     { source: "a path...", errored: true, ignored: false,
 *          warnings: [ ... ], deprecations: [], invalidOptionWarnings: [] }
 *     Where a warning is of the form:
 *         warning: { line: n, column: n, rule: s, text: s,
 *              severity: n };
 *      Severity can be 'error', 'warning'
 */
Cmd.prototype.processStylelintResult = function(result) {
    var cmd,
        file,
        messages,
        summary;

    cmd = this;
    summary = {
        errors: 0,
        warnings: 0,
        linty: 0,
        recheck: []
    };

    file = result.source;
    messages = result.warnings; //  poorly named in stylelint

    if (messages.length === 0) {
        cmd.verbose('');
        cmd.verbose(file, 'lintpass');
        return summary;
    }

    // Filter for errors vs. warnings.
    messages = messages.filter(function(message) {
        return message.severity === 'error';
    });
    summary.errors = messages.length;
    summary.warnings = result.warnings.length - summary.errors;

    //  Add any file that doesn't pass cleanly to the recheck list.
    if (summary.errors + summary.warnings > 1) {
        summary.recheck.push(file);
    }

    if (cmd.options.quiet) {
        // If we're only doing output when an error exists we're done if no
        // errors were found.
        if (summary.errors === 0) {
            cmd.verbose('');
            cmd.verbose(file, 'lintpass');
            return summary;
        }
    } else {
        // If we're not in quiet-mode reset to the full message list since
        // we'll be outputting both errors and warnings.
        messages = result.warnings;
    }

    if (summary.errors > 0) {
        cmd.error('');
        cmd.error(file, 'underline');
    } else {
        cmd.warn('');
        cmd.warn(file, 'underline');
    }
    summary.linty = 1;

    // If we're only listing file names we're done now :)
    if (cmd.options.list) {
        return summary;
    }

    messages.forEach(function(message) {
        var str,
            text,
            prefix;

        prefix = cmd.lpad(message.line, 5) + ':' +
            cmd.rpad(message.column || '', 5);

        if (message.severity === 'error') {
            prefix += cmd.colorize('error   ', 'error');
        } else {
            prefix += cmd.colorize('warn    ', 'warn');
        }

        //  Text from stylelint includes rule...strip that off so we can format
        //  consistently with eslint.

        text = message.text.replace('(' + message.rule + ')', '');
        str = prefix + cmd.rpad(text.trim(), 62) + ' ' +
            cmd.colorize(message.rule, 'dim');

        cmd.log(str);
    });

    return summary;
};


/**
 * Outputs summary information about how the overall lint run ran.
 * @param {Object} results A container with error 'count' and 'files' count.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.summarize = function(results) {

    var msg,
        lastpath;

    if (!this.options.list) {
        this.log('');
        msg = '' + this.colorize(
            'checked ' + results.checked + ' of ' +
            results.files + ' total files',
        'dim');
        this.log(msg);

        msg = this.colorize('(' +
            results.filtered + ' filtered, ' +
            results.unchanged + ' unchanged)',
        'dim');
        this.log(msg);

        msg = '' +
            this.colorize(results.errors + ' errors',
                results.errors ? 'error' : 'success') +
            this.colorize(', ', results.errors ? 'error' : 'success') +
            this.colorize(results.warnings + ' warnings',
                results.warnings ? 'warn' : 'success');
        if (results.errors + results.warnings) {
            msg = msg + this.colorize(' in ' + results.linty + ' files.',
                results.errors ? 'error' : 'warn');
        } else {
            msg = msg + this.colorize('. Clean!', 'success');
        }
        this.log(msg);
    }

    results.lastrun = Date.now();
    lastpath = CLI.expandPath(Cmd.LAST_RUN_DATA);
    CLI.beautify(JSON.stringify(results)).to(lastpath);

    //  If any errors the ultimate return value will be non-zero.
    return results.errors;
};


/**
 * Verifies that the configuration files which are leveraged by the package
 * command, and hence which are prerequisites to proper functionality, are
 * themselves free of lint and well-formed.
 * @returns {Object} A results container with error 'count' and 'files' count.
 */
Cmd.prototype.validateConfigFiles = function() {

    var cfg,
        cfgdir,
        files,
        filter,
        pattern;

    if (CLI.inLibrary()) {
        cfg = '~lib_cfg';
    } else {
        cfg = '~app_cfg';
    }

    if (!this.options.list) {
        this.verbose('checking ' + cfg + ' package files...');
    }

    if (CLI.notEmpty(this.options.filter)) {
        filter = this.options.filter;
    } else {
        // The options._ object holds non-qualified parameters. [0] is the
        // command name. [1] should be the "filter" if any.
        filter = this.options._[1];
        if (filter === '.') {
            filter = '';
        }
    }

    if (CLI.notEmpty(filter)) {
        pattern = CLI.stringAsRegExp(filter);
    }

    cfgdir = CLI.expandPath(cfg);

    files = sh.find(cfgdir).filter(function(file) {
        if (CLI.notEmpty(pattern)) {
            return pattern.test(file) &&
                !sh.test('-d', file) &&
                file.match(/\.xml$/);
        } else {
            return !sh.test('-d', file) &&
                file.match(/\.xml$/);
        }
    });

    return this.validateXMLFiles(files);
};


/**
 * Performs a simple well-formed-ness check on one or more JSON files.
 * @param {Array|String} files A single file name or array of them.
 * @param {Object} results An object supporting collection of summary results
 *     across multiple lint passes.
 * @returns {Object} A results container with error 'count' and 'files' count.
 */
Cmd.prototype.validateJSONFiles = function(files, results) {

    var cmd,
        res,
        jsonFiles;

    cmd = this;
    res = results || this.constructResults();
    res.recheck = res.recheck || [];

    jsonFiles = Array.isArray(files) ? files : [files];
    res.checked += jsonFiles.length;

    jsonFiles.some(
        function(file) {
            var text;

            cmd.verbose('');
            cmd.verbose(file, 'lintpass');

            text = sh.cat(file);
            if (!text) {
                res.linty += 1;
                res.errors += 1;
                res.recheck.push(file);
                cmd.error('Unable to read ' + file);
            } else {
                //  Watch out for files that serve as templates. These will have
                //  \{{blah}} forms which won't parse correctly.
                if (/\\{{/.test(text)) {
                    text = text.replace(/\\{{/g, '{{');
                }
                try {
                    JSON.parse(text);
                } catch (e) {
                    res.linty += 1;
                    res.errors += 1;
                    res.recheck.push(file);
                    cmd.log(file);
                    cmd.error(e);
                }
            }

            // True will end the loop but we only do that if we're doing
            // stop-on-first processing.
            if (cmd.options.stop) {
                return res.errors > 0;
            } else {
                return false;
            }
        });

    return res;
};


/**
 * Runs the eslint utility on one or more JavaScript source files.
 * @param {Array|String} files A single file name or array of them.
 * @param {Object} results An object supporting collection of summary results
 *     across multiple lint passes.
 * @returns {Object} A results container with error 'count' and 'files' count.
 */
Cmd.prototype.validateSourceFiles = function(files, results) {

    var cmd,
        opts,
        engine,
        res,
        srcFiles;

    cmd = this;
    opts = this.configureEslintOptions();
    engine = new eslint.CLIEngine(opts);

    res = results || this.constructResults();
    res.recheck = res.recheck || [];

    srcFiles = Array.isArray(files) ? files : [files];
    res.checked += srcFiles.length;

    try {
        srcFiles.some(
            function(file) {
                var result,
                    summary;

                if (engine.isPathIgnored(file)) {
                    return false;
                }

                result = engine.executeOnFiles([file]);

                // Rely on a common output routine. This is shared with output
                // for inline source done during executeForEach.
                summary = cmd.processEslintResult(result);
                res.errors = res.errors + summary.errors;
                res.warnings = res.warnings + summary.warnings;
                res.linty = res.linty + summary.linty;
                res.recheck = res.recheck.concat(summary.recheck);

                // True will end the loop but we only do that if we're doing
                // stop-on-first processing.
                if (cmd.options.stop) {
                    return res.errors > 0;
                } else {
                    return false;
                }
            });

    } catch (e) {
        if (!cmd.options.stop) {
            this.error(e.message);
            res.errors = res.errors + 1;
        }
    }

    return res;
};


/**
 * Runs the stylelint utility on one or more style-related files. Unlike the
 * other validation operations the underlying stylelint module doesn't have a
 * synchronous API so this method leverages Promises to coordinate. It also
 * expects a list of globs rather than a list of file names...so we have to do
 * the iteration manually.
 * @param {Array|String} files A single file name or array of them.
 * @param {Object} results An object supporting collection of summary results
 *     across multiple lint passes.
 * @returns {Promise} A promise that resolves when all processing is complete.
 */
Cmd.prototype.validateStyleFiles = function(files, results) {

    var cmd,
        res,
        styleFiles,
        config,
        stylelint,
        deferred,
        checkfile;

    stylelint = require('stylelint');

    cmd = this;
    res = results || this.constructResults();
    res.recheck = res.recheck || [];

    styleFiles = Array.isArray(files) ? files : [files];
    res.checked += styleFiles.length;

    //  Configure the rules to be leveraged. This is a bit of a mess so
    //  we've put it in a separate function...
    config = this.configureStylelintOptions();

    //  Assign a no-op formatter. We do the actual formatting on the final
    //  result data in the calling routine, not during stylelint process.
    config.formatter = function(stylelintResult) {
        return '';  //  string to avoid issues building output
    };

    //  Create a deferred promise we can return to the caller and resolve once
    //  our iteration is complete.
    deferred = Promise.pending();

    //  Recursive function which runs stylelint.lint and ultimately resolves the
    //  `deferred` promise when no more files exist...or the first one comes up
    //  with errors.
    checkfile = function() {
        var file;

        file = styleFiles.shift();
        if (!file) {
            deferred.resolve(res);
            return;
        }

        config.code = sh.cat(file);
        config.codeFilename = file;

        stylelint.lint(config).then(function(result) {
            var data,
                summary;

            if (result.results.length > 0) {

                data = result.results[0];
                summary = cmd.processStylelintResult(data);
                res.errors = res.errors + summary.errors;
                res.warnings = res.warnings + summary.warnings;
                res.linty = res.linty + summary.linty;

                if (summary.errors || summary.warnings) {
                    res.recheck.push(file);
                }

                if (res.errors > 0 && cmd.options.stop) {
                    deferred.resolve(res);
                    return;
                }
            }

            checkfile();

        }).catch(function(err) {
            deferred.reject(err);
        });
    };

    checkfile();

    return deferred.promise;
};


/**
 * Performs a simple well-formed-ness check on one or more XML files.
 * @param {Array|String} files A single file name or array of them.
 * @param {Object} results An object supporting collection of summary results
 *     across multiple lint passes.
 * @returns {Object} A results container with error 'count' and 'files' count.
 */
Cmd.prototype.validateXMLFiles = function(files, results) {

    var cmd,
        res,
        xmlFiles;

    cmd = this;
    res = results || this.constructResults();

    xmlFiles = Array.isArray(files) ? files : [files];
    res.checked += xmlFiles.length;

    // By using 'some' rather that forEach we can support --stop semantics.
    xmlFiles.some(
        function(file) {
            var text;

            cmd.verbose('');
            cmd.verbose(file, 'lintpass');

            text = sh.cat(file);
            if (!text) {
                cmd.error('Unable to read ' + file);
                res.linty += 1;
                res.errors += 1;
                res.recheck.push(file);
            }

            try {
                parseString(text, function(err, result) {
                    if (err) {
                        res.linty += 1;
                        res.errors += 1;
                        cmd.error('Error in ' + file + ': ' + err);
                        res.recheck.push(file);
                    }
                });
            } catch (e) {
                cmd.error(file);
                cmd.error(e.message);
                res.linty += 1;
                res.errors += 1;
                res.recheck.push(file);
            }

            // True will end the loop but we only do that if we're doing
            // stop-on-first processing.
            if (cmd.options.stop) {
                return res.errors > 0;
            } else {
                return false;
            }
        });

    return res;
};


module.exports = Cmd;

}());
