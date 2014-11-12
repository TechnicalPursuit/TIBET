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

var CLI = require('./_cli');

var beautify = require('js-beautify').js_beautify;
var dom = require('xmldom');
var sh = require('shelljs');

//  ---
//  Type Construction
//  ---

var Parent = require('./package');

// NOTE we don't inherit from _cmd, but from package.
var Cmd = function(){};
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
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        boolean: ['scan', 'stop', 'all', 'silent', 'nodes', 'reset',
            'csslint', 'eslint', 'jsonlint', 'xmllint'],
        string: ['esconfig', 'esrules', 'esformat', 'cssconfig',
            'package', 'config', 'phase'],
        default: {
            cssslint: true,
            eslint: true,
            jsonlint: true,
            xmllint: true,
            nodes: true,
            silent: true
        }
    },
    Parent.prototype.PARSE_OPTIONS);

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
Cmd.prototype.XML_EXTENSIONS = [
    'atom', 'gpx', 'kml', 'rdf', 'rss', 'svg', 'tmx', 'tsh', 'xhtml', 'xml', 'xsd', 'xsl'];

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
 * @return {Object} A csslint-compatible ruleset object.
 */
Cmd.prototype.configureCSSLintOptions = function() {
    var file;
    var text;
    var lines;
    var rules;
    var csslint;

    csslint = require( 'csslint' ).CSSLint;
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
        var parts;
        var keys;

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
 * @return {Object} The options specific to running eslint.
 */
Cmd.prototype.configureEslintOptions = function() {

    var args;

    args = ['node', 'eslint'];

    if (this.options.esconfig) {
        args.push('-c' + this.options.esconfig);
    }

    if (this.options.esformat) {
        args.push('-f ' + this.options.esformat);
    }

    if (this.options.esrules) {
        args.push('-r ' + this.options.esrules);
    }

    if (this.options.reset) {
        args.push('--reset');
    }

    return args;
};


/**
 * Performs lint processing, verifying TIBET's xml configuration files
 * first, then any assets listed as part of the project in its manifest(s).
 * @return {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var list;       // The result list of asset references.
    var files;
    var result;

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
        if (result.count !== 0) {
            return result.count;
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
        if (this.options.stop && result.count !== 0) {
            return this.summarize(result);
        }
    }

    if (this.options.jsonlint) {
        result = this.validateJSONFiles(files.json, result);
        if (this.options.stop && result.count !== 0) {
            return this.summarize(result);
        }
    }

    if (this.options.eslint) {
        result = this.validateSourceFiles(files.js, result);
        if (this.options.stop && result.count !== 0) {
            return this.summarize(result);
        }
    }

    if (this.options.xmllint) {
        result = this.validateXMLFiles(files.xml, result);
        if (this.options.stop && result.count !== 0) {
            return this.summarize(result);
        }
    }

    return this.summarize(result);
};


/**
 * Sorts the contents of the list into a set of individual lists for each type
 * of validation we can perform. If the file doesn't have an extension, or the
 * extension doesn't match one of those considered valid by this command that
 * file will be filtered by this method.
 * @param {Array.<Node>} list An array of package asset nodes.
 * @return {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executeForEach = function(list) {

    var cmd;
    var files;

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
                cmd.warn('skipping inline source...');
                cmd.verbose(item.textContent);
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
 * @return {Array} The list of project assets found in the directory tree.
 */
Cmd.prototype.getScannedAssetList = function() {

    var dir;
    var list;

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

    this.debug('pkgOpts: ' + beautify(JSON.stringify(this.pkgOpts)), true);
};


/**
 * Outputs summary information about how the overall lint run ran.
 * @param {Object} results A container with error 'count' and 'files' count.
 * @return {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.summarize = function(results) {

    var msg;

    msg = '' + results.count + ' errors in ' + results.checked + ' of ' +
        results.files + ' files.';

    if (results.count !== 0) {
        this.error(msg);
    } else {
        this.log(msg);
    }

    return results.count;
};


/**
 * Verifies that the configuration files which are leveraged by the package
 * command, and hence which are prerequisites to proper functionality, are
 * themselves free of lint and well-formed.
 * @return {Object} A results container with error 'count' and 'files' count.
 */
Cmd.prototype.validateConfigFiles = function() {

    var cfg;
    var cfgdir;
    var files;

    if (CLI.inLibrary()) {
        cfg = '~lib_cfg';
    } else {
        cfg = '~app_cfg';
    }

    this.log('checking ' + cfg + ' package files...');

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
 * @return {Object} A results container with error 'count' and 'files' count.
 */
Cmd.prototype.validateCSSFiles = function(files, results) {

    var cmd;
    var formatter;
    var ruleset;
    var csslint;

    csslint = require( 'csslint' ).CSSLint;

    cmd = this;
    results = results || { checked: 0, count: 0, files: 0 };

    files = Array.isArray(files) ? files : [files];
    if (files.length) {
        this.verbose('linting ' + files.length + ' CSS file(s)...');
    }
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

    // Configure the linting rules to be leveraged. This is a bit of a mess so
    // we've put it in a separate function...
    ruleset = this.configureCSSLintOptions();

    // Process the files. Use 'some' so we can support --stop.
    files.some(function(file) {
        var text;
        var result;

        cmd.verbose('linting: ' + file + '...');

        results.checked += 1;

        text = sh.cat(file);
        if (!text) {
            results.count += 1;
            cmd.error('Unable to read ' + file);
        } else {
            result = csslint.verify(text, ruleset);
            if (result.messages.length > 0) {
                cmd.log('CSSLint in file: ' + file);
                result.messages.forEach(function(message) {
                    var str;

                    str = formatter(message);
                    switch (message.type.toLowerCase()) {
                        case 'error':
                            results.count += result.messages.length;
                            cmd.error(str);
                            break;
                        case 'warning':
                            cmd.warn(str);
                            break;
                        default:
                            cmd.log(str);
                            break;
                    }
                });
            }
        }

        // True will end the loop but we only do that if we're doing
        // stop-on-first style linting.
        if (cmd.options.stop) {
            return results.count >= 1;
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
 * @return {Object} A results container with error 'count' and 'files' count.
 */
Cmd.prototype.validateJSONFiles = function(files, results) {

    var cmd;

    cmd = this;
    results = results || { checked: 0, count: 0, files: 0 };

    files = Array.isArray(files) ? files : [files];
    if (files.length) {
        this.verbose('linting ' + files.length + ' JSON file(s)...');
    }
    results.files += files.length;

    files.some(function(file) {
        var text;

        cmd.verbose('linting: ' + file + '...');

        results.checked += 1;

        text = sh.cat(file);
        if (!text) {
            results.count += 1;
            cmd.error('Unable to read ' + file);
        } else {
            try {
                JSON.parse(text);
            } catch (e) {
                results.count += 1;
                cmd.log('JSON lint in file: ' + file);
                cmd.error(e);
            }
        }

        // True will end the loop but we only do that if we're doing
        // stop-on-first style linting.
        if (cmd.options.stop) {
            return results.count >= 1;
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
 * @return {Object} A results container with error 'count' and 'files' count.
 */
Cmd.prototype.validateSourceFiles = function(files, results) {

    var cmd;
    var args;
    var eslint;

    eslint = require('eslint');

    cmd = this;
    args = this.configureEslintOptions();
    results = results || { checked: 0, count: 0, files: 0 };

    files = Array.isArray(files) ? files : [files];
    if (files.length) {
        this.verbose('linting ' + files.length + ' source file(s)...');
    }
    results.files += files.length;

    try {
        files.some(function(file) {
            var result;

            cmd.verbose('linting: ' + file + '...');

            results.checked += 1;

            result = eslint.cli.execute(args.concat(file));
            results.count = results.count + result;

            // True will end the loop but we only do that if we're doing
            // stop-on-first style linting.
            if (cmd.options.stop) {
                return results.count >= 1;
            } else {
                return false;
            }
        });

    } catch (e) {
        if (!cmd.options.stop) {
            this.error(e.message);
            results.count = results.count + 1;
        }
    }

    return results;
};


/**
 * Performs a simple well-formed-ness check on one or more XML files.
 * @param {Array|String} files A single file name or array of them.
 * @param {Object} results An object supporting collection of summary results
 *     across multiple lint passes.
 * @return {Object} A results container with error 'count' and 'files' count.
 */
Cmd.prototype.validateXMLFiles = function(files, results) {

    var cmd;
    var parser;
    var current;

    cmd = this;
    results = results || { checked: 0, count: 0, files: 0 };

    files = Array.isArray(files) ? files : [files];
    if (files.length) {
        this.verbose('linting ' + files.length + ' XML file(s)...');
    }
    results.files += files.length;

    parser = new dom.DOMParser({
        locator: {},
        errorHandler: {
            error: function(msg) {
                results.count += 1;
                cmd.error('Error in ' + current + ': ' + msg);
            },
           warn: function(msg) {
                cmd.warn('Warning in ' + current + ': ' + msg);
           }
        }
    });

    // By using 'some' rather that forEach we can support --stop semantics.
    files.some(function(file) {
        var text;
        var doc;

        current = file;
        cmd.verbose('linting ' + file + '...');

        results.checked += 1;

        text = sh.cat(file);
        if (!text) {
            cmd.error('Unable to read ' + file);
            results.count += 1;
        }

        try {
            doc = parser.parseFromString(text);
            if (!doc) {
                cmd.error('Error in ' + file + '. Not well-formed?');
                results.count += 1;
            }
        } catch (e) {
            cmd.error('Error parsing ' + file + ': ' +  e.message);
            results.count += 1;
        }

        // True will end the loop but we only do that if we're doing
        // stop-on-first style linting.
        if (cmd.options.stop) {
            return results.count >= 1;
        } else {
            return false;
        }
    });

    return results;
};


module.exports = Cmd;

}());
