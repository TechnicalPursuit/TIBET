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

/*eslint no-process-exit:0*/
(function() {

'use strict';

var CLI,
    beautify,
    chalk,
    dom,
    sh,
    eslint,
    Parent,
    Cmd;


CLI = require('./_cli');

beautify = require('js-beautify').js_beautify;
chalk = require('chalk');
dom = require('xmldom');
sh = require('shelljs');
eslint = require('eslint');


//  ---
//  Type Construction
//  ---

Parent = require('./package');

// NOTE we don't inherit from _cmd, but from package.
Cmd = function() {};
Cmd.prototype = new Parent();

//  ---
//  Type Attributes
//  ---

Cmd.CONFIG = '~app/.eslintrc';


/**
 * The context viable for this command.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;


//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Runs a variety of lint tools on files specified in a package#config.\n\n' +

'--scan tells the linter to scan the directory tree and ignore any\n' +
'package#config specification. Without this flag only files found\n' +
'in the project package files will be linted, making it easy to lint\n' +
'only those files your project actually makes direct use of.\n\n' +

'--quiet tells the linter to suppress warnings if possible.\n\n' +

'--stop tells the linter to stop after the first file with errors.\n\n' +

'[package-opts] refers to valid options for a TIBET Package object.\n' +
'These include --package, --config, --phase, --assets, etc.\n' +
'The package#config defaults to ~app_cfg/app.xml and its default\n' +
'config (usually #base) so your typical configuration is linted.\n' +
'See help on the \'tibet package\' command for more information.\n\n' +

'[eslint-opts] refers to --esconfig, --esrules, and --esformat which\n' +
'let you configure eslint to meet your specific needs. The linter will\n' +
'automatically take advantage of a .eslintrc file in your project.\n\n' +

'[csslint-opts] refers to --cssconfig which allows you to specify a\n' +
'specific .csslintrc file whose content should be used. The lint command\n' +
'relies on .csslintrc as used by the csslint command line. The default\n' +
'file is the one in your project, followed by the TIBET library version.\n\n' +

'All of the linters can be disabled individually by using a --no- prefix.\n' +
'For example: --no-csslint --no-eslint --no-jsonlint --no-xmllint will turn\n' +
'off all the currently supported linters.\n\n';


/**
 * Command argument parsing options.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['scan', 'stop', 'all', 'list', 'nodes', 'reset',
            'csslint', 'eslint', 'jsonlint', 'xmllint', 'quiet'],
        'string': ['esconfig', 'esrules', 'esformat', 'cssconfig',
            'package', 'config', 'phase'],
        'default': {
            cssslint: true,
            eslint: true,
            jsonlint: true,
            xmllint: true,
            nodes: true
        }
    },
    Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * A list of valid extensions for JavaScript source content.
 * @type {Array.<String>}
 */
Cmd.prototype.JS_EXTENSIONS = ['js', 'jscript'];

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
    'tibet lint [--scan] [--stop] [package-opts] [eslint-opts] [csslint-opts]';


//  ---
//  Instance Methods
//  ---

/**
 * Processes any csslint command line options, processes any csslintrc content,
 * and returns a 'ruleset' appropriate for the csslint.verify() call.
 * @returns {Object} A csslint-compatible ruleset object.
 */
Cmd.prototype.configureCSSLintOptions = function() {
    var file,
        text,
        lines,
        rules,
        csslint;

    csslint = require('csslint').CSSLint;
    rules = csslint.getRuleset();

    if (this.options.cssconfig) {
        file = CLI.expandPath(this.options.cssconfig);
    } else {
        file = CLI.expandPath('~app/.csslintrc');
        if (!sh.test('-f', file)) {
            file = CLI.expandPath('~lib/.csslintrc');
            if (!sh.test('-f', file)) {
                return rules;
            }
        }
    }

    // Unlike grunt's version we use the same format the CLI version of csslint
    // requires, which is a text file with option flags.
    text = sh.cat(file);
    if (!text) {
        this.error('Unable to read ' + file);
        throw new Error();
    }

    lines = text.split('\n').filter(function(line) {
        return line.match(/errors|warnings|ignore/);
    });

    lines.forEach(function(line) {
        var parts,
            keys;

        parts = line.split('=');
        keys = parts[1].split(',');

        switch (parts[0]) {
            case '--ignore':
                keys.forEach(function(key) {
                    rules[key] = 0;
                });
                break;
            case '--warnings':
                keys.forEach(function(key) {
                    rules[key] = 1;
                });
                break;
            case '--errors':
                keys.forEach(function(key) {
                    rules[key] = 2;
                });
                break;
        }
    });

    return rules;
};


/**
 * Processes the command line options and maps the proper settings into their
 * corresponding eslint command arguments.
 * @returns {Object} The options specific to running eslint.
 */
Cmd.prototype.configureEslintOptions = function() {

    var args;

    args = ['node', 'eslint'];

    if (this.options.esconfig) {
        args.push('-c ' + this.options.esconfig);
    }

    if (this.options.esformat) {
        args.push('-f ' + this.options.esformat);
    }

    if (this.options.esrules) {
        args.push('-r ' + this.options.esrules);
    }

    if (this.options.quiet) {
        args.push('--quiet true');
    }

    if (this.options.reset) {
        args.push('--reset');
    }

    return args;
};


/**
 * Performs lint processing, verifying TIBET's xml configuration files
 * first, then any assets listed as part of the project in its manifest(s).
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var list,       // The result list of asset references.
        files,
        result;

    this.configurePackageOptions();

    // Build up the list of files to be processed either by scanning the
    // directory or by leveraging package#config data.
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
        }

        this.verbose('scanning package list...');
        list = this.getPackageAssetList();
    }

    // Once we have a list we need to pull it apart into lists we can pass to
    // each of the unique parsers. This is a bit more efficient than trying to
    // handle each file individually in whatever order we might come across it.
    files = this.executeForEach(list);

    if (this.options.csslint) {
        result = this.validateCSSFiles(files.css);
        if (this.options.stop && result.errors !== 0) {
            return this.summarize(result);
        }
    }

    if (this.options.jsonlint) {
        result = this.validateJSONFiles(files.json, result);
        if (this.options.stop && result.errors !== 0) {
            return this.summarize(result);
        }
    }

    if (this.options.eslint) {
        result = this.validateSourceFiles(files.js, result);
        if (this.options.stop && result.errors !== 0) {
            return this.summarize(result);
        }
    }

    if (this.options.xmllint) {
        result = this.validateXMLFiles(files.xml, result);
        if (this.options.stop && result.errors !== 0) {
            return this.summarize(result);
        }
    }

    this.summarize(result);

    if (result.errors > 0) {
        throw new Error();
    }
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
        files;

    cmd = this;
    files = {
        css: [],
        js: [],
        json: [],
        xml: []
    };

    try {
        list.forEach(function(item) {
            var src,
                ext;
                /*
                args,
                engine,
                result;
                */

            if (cmd.options.nodes) {
                if (item.getAttribute('no-lint') === 'true') {
                    return;
                }
                // Depending on the nature of the resource there are two
                // canonical attributes likely to point to the source file.
                src = item.getAttribute('src') || item.getAttribute('href');
            } else {
                src = item;
            }

            if (src) {
                // Skip minified files regardless of their type.
                if (src.match(/\.min\./)) {
                    cmd.verbose('skipping minified file: ' + src);
                    return;
                }

                ext = src.slice(src.lastIndexOf('.') + 1);
                if (ext === 'css') {
                    files.css.push(src);
                } else if (ext === 'json') {
                    files.json.push(src);
                } else if (cmd.JS_EXTENSIONS.indexOf(ext) !== -1) {
                    files.js.push(src);
                } else if (cmd.XML_EXTENSIONS.indexOf(ext) !== -1) {
                    files.xml.push(src);
                } else {
                    cmd.verbose('skipping unsupported file: ' + src);
                }

            } else if (cmd.options.nodes) {
                // Nodes, but no src attribute. Inline source.
                cmd.verbose('skipping inline source...');
                cmd.debug(item.textContent.trim(), true);

                /*
                 * It's possible to feed source to eslint now but it's not
                 * particularly useful since inline source rarely fits the
                 * form of a full source file of content.
                 */
                /*
                args = cmd.configureEslintOptions();

                engine = new eslint.CLIEngine(args);
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
 * Returns a list of assets based on scanning the project directory structure.
 * Any node_modules directory content will be ignored.
 * @returns {Array} The list of project assets found in the directory tree.
 */
Cmd.prototype.getScannedAssetList = function() {

    var dir,
        list;

    this.verbose('scanning directory tree...');

    dir = CLI.getAppHead();

    list = sh.find(dir).filter(function(file) {
        return !sh.test('-d', file) &&
            !file.match(/node_modules/);
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

    // Force the most comprehensive package#config we can given our context.
    if (CLI.inProject()) {
        if (CLI.notValid(this.pkgOpts.package)) {
            this.pkgOpts.package = '~app_cfg/standard.xml';
        }
    } else if (CLI.inLibrary()) {
        if (CLI.notValid(this.pkgOpts.package)) {
            this.pkgOpts.package = '~lib_cfg/TIBET.xml';
        }
    }

    if (CLI.notValid(this.pkgOpts.config)) {
        this.pkgOpts.config = 'test';
    }

    this.debug('pkgOpts: ' + beautify(JSON.stringify(this.pkgOpts)), true);
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
        results;

    cmd = this;
    errors = 0;
    warnings = 0;

    results = result.results;

    results.forEach(function(result) {
        var messages,
            file;

        file = result.filePath;
        messages = result.messages;

        if (messages.length === 0) {
            cmd.verbose(chalk.underline(file));
            return;
        }

        // Filter for errors vs. warnings.
        messages = messages.filter(function(message) {
            return message.fatal || message.severity === 2;
        });
        errors = messages.length;
        warnings = result.messages.length - errors;

        if (cmd.options.quiet) {
            // If we're only doing output when an error exists we're done if no
            // errors were found.
            if (errors === 0) {
                cmd.verbose(chalk.underline(file));
                return;
            }
        } else {
            // If we're not in quiet-mode reset to the full message list since
            // we'll be outputting both errors and warnings.
            messages = result.messages;
        }

        if (errors > 0) {
            cmd.error(chalk.underline(file));
        } else {
            cmd.warn(chalk.underline(file));
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
                prefix += chalk.red('error   ');
            } else {
                prefix += chalk.yellow('warn    ');
            }

            str = prefix + cmd.rpad(message.message.trim(), 62) + ' ' +
                chalk.grey(message.ruleId);

            cmd.log(str);
        });
    });

    return {warnings: warnings, errors: errors};
};


/**
 * Outputs summary information about how the overall lint run ran.
 * @param {Object} results A container with error 'count' and 'files' count.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.summarize = function(results) {

    var msg;

    if (!this.options.list) {
        msg = '' + results.errors + ' errors, ' +
            results.warnings + ' warnings in ' +
            results.checked + ' of ' +
            results.files + ' files.';

        if (results.errors !== 0) {
            this.error(msg);
        } else if (results.warnings !== 0) {
            this.warn(msg);
        } else {
            this.log(msg);
        }
    }
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
        files;

    if (CLI.inLibrary()) {
        cfg = '~lib_cfg';
    } else {
        cfg = '~app_cfg';
    }

    if (!this.options.list) {
        this.verbose('checking ' + cfg + ' package files...');
    }

    cfgdir = CLI.expandPath(cfg);

    files = sh.find(cfgdir).filter(function(file) {
        return !sh.test('-d', file) &&
            file.match(/\.xml$/);
    });

    return this.validateXMLFiles(files);
};


/**
 * Runs the csslint utility on one or more css files.
 * @param {Array|String} files A single file name or array of them.
 * @param {Object} results An object supporting collection of summary results
 *     across multiple lint passes.
 * @returns {Object} A results container with error 'count' and 'files' count.
 */
Cmd.prototype.validateCSSFiles = function(files, results) {

    var cmd,
        formatter,
        ruleset,
        csslint;

    csslint = require('csslint').CSSLint;

    cmd = this;
    results = results || {checked: 0, errors: 0, warnings: 0, files: 0};

    files = Array.isArray(files) ? files : [files];
    results.files += files.length;

    /*
     * Inline formatting helper function for csslint message objects.
     */
    formatter = function(aMessage) {
        var msg;

        msg = '';
        msg += 'Line ' + aMessage.line;
        msg += ':' + aMessage.col;

        msg = (/undefined/.test(msg)) ? 'General' : msg;
        msg += ' - ' + aMessage.message;

        return msg;
    };

    // Configure the rules to be leveraged. This is a bit of a mess so
    // we've put it in a separate function...
    ruleset = this.configureCSSLintOptions();

    // Process the files. Use 'some' so we can support --stop.
    files.some(function(file) {
        var text,
            result;

        cmd.verbose(chalk.underline(file));
        results.checked += 1;

        text = sh.cat(file);
        if (!text) {
            results.errors += 1;
            cmd.error('Unable to read ' + file);
        } else {
            result = csslint.verify(text, ruleset);
            if (result.messages.length > 0) {
                cmd.log(file);
                result.messages.forEach(function(message) {
                    var str;

                    str = formatter(message);
                    switch (message.type.toLowerCase()) {
                        case 'error':
                            results.errors += 1;
                            if (!cmd.options.list) {
                                cmd.error(str);
                            }
                            break;
                        case 'warning':
                            results.warnings += 1;
                            if (!cmd.options.list && !cmd.options.quiet) {
                                cmd.warn(str);
                            }
                            break;
                        default:
                            if (!cmd.options.list && !cmd.options.quiet) {
                                cmd.log(str);
                            }
                            break;
                    }
                });
            }
        }

        // True will end the loop but we only do that if we're doing
        // stop-on-first processing.
        if (cmd.options.stop) {
            return results.errors > 0;
        } else {
            return false;
        }
    });

    return results;
};

/**
 * Performs a simple well-formed-ness check on one or more JSON files.
 * @param {Array|String} files A single file name or array of them.
 * @param {Object} results An object supporting collection of summary results
 *     across multiple lint passes.
 * @returns {Object} A results container with error 'count' and 'files' count.
 */
Cmd.prototype.validateJSONFiles = function(files, results) {

    var cmd;

    cmd = this;
    results = results || {checked: 0, errors: 0, warnings: 0, files: 0};

    files = Array.isArray(files) ? files : [files];
    results.files += files.length;

    files.some(function(file) {
        var text;

        cmd.verbose(chalk.underline(file));
        results.checked += 1;

        text = sh.cat(file);
        if (!text) {
            results.errors += 1;
            cmd.error('Unable to read ' + file);
        } else {
            try {
                JSON.parse(text);
            } catch (e) {
                results.errors += 1;
                cmd.log(file);
                cmd.error(e);
            }
        }

        // True will end the loop but we only do that if we're doing
        // stop-on-first processing.
        if (cmd.options.stop) {
            return results.errors > 0;
        } else {
            return false;
        }
    });

    return results;
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
        args,
        engine;

    cmd = this;
    args = this.configureEslintOptions();
    engine = new eslint.CLIEngine(args);

    results = results || {checked: 0, errors: 0, warnings: 0, files: 0};

    files = Array.isArray(files) ? files : [files];
    results.files += files.length;

    try {
        files.some(function(file) {
            var result,
                summary;

            result = engine.executeOnFiles([file]);
            results.checked += 1;

            // Rely on a common output routine. This is shared with output for
            // inline source done during executeForEach.
            summary = cmd.processEslintResult(result);
            results.errors = results.errors + summary.errors;
            results.warnings = results.warnings + summary.warnings;

            // True will end the loop but we only do that if we're doing
            // stop-on-first processing.
            if (cmd.options.stop) {
                return results.errors > 0;
            } else {
                return false;
            }
        });

    } catch (e) {
        if (!cmd.options.stop) {
            this.error(e.message);
            results.errors = results.errors + 1;
        }
    }

    return results;
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
        parser,
        current;

    cmd = this;
    results = results || {checked: 0, errors: 0, warnings: 0, files: 0};

    files = Array.isArray(files) ? files : [files];
    results.files += files.length;

    parser = new dom.DOMParser({
        locator: {},
        errorHandler: {
            error: function(msg) {
                results.errors += 1;
                cmd.error('Error in ' + current + ': ' + msg);
            },
            warn: function(msg) {
                results.warnings += 1;
                if (!cmd.options.quiet) {
                    cmd.warn('Warning in ' + current + ': ' + msg);
                }
            }
        }
    });

    // By using 'some' rather that forEach we can support --stop semantics.
    files.some(function(file) {
        var text,
            doc;

        current = file;
        cmd.verbose(chalk.underline(file));
        results.checked += 1;

        text = sh.cat(file);
        if (!text) {
            cmd.error('Unable to read ' + file);
            results.errors += 1;
        }

        try {
            doc = parser.parseFromString(text);
            if (!doc) {
                cmd.error(file);
                results.errors += 1;
            }
        } catch (e) {
            cmd.error(file);
            cmd.error(e.message);
            results.errors += 1;
        }

        // True will end the loop but we only do that if we're doing
        // stop-on-first processing.
        if (cmd.options.stop) {
            return results.errors > 0;
        } else {
            return false;
        }
    });

    return results;
};


module.exports = Cmd;

}());
