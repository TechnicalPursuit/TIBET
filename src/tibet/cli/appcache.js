//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet appcache' command provides control over the various
 *     aspects of html5 application manifest files.
 */
//  ========================================================================

/* eslint indent:0 */

(function() {

'use strict';

var CLI,
    sh,
    dom,
    parser,
    path,
    serializer,
    Cmd;

CLI = require('./_cli');
sh = require('shelljs');
path = require('path');
dom = require('xmldom');
parser = new dom.DOMParser();
serializer = new dom.XMLSerializer();

//  ---
//  Type Construction
//  ---

Cmd = function() { /* init */ };
Cmd.Parent = require('./_cmd');
Cmd.prototype = new Cmd.Parent();


//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.PROJECT;

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'appcache';

//  ---
//  Instance Attributes
//  ---

/**
 * The pattern used for locating the section specific to app files.
 * @type {RegExp}
 */
Cmd.prototype.APP_START_REGEX = /# !!! app/;

/**
 * The pattern used for locating the section specific to TIBET lib files.
 * @type {RegExp}
 */
Cmd.prototype.LIB_START_REGEX = /# !!! lib/;

/**
 * The pattern used to test for comments that should not be toggled.
 * @type {RegExp}
 */
Cmd.prototype.OFFLIMITS_REGEX = /# (!!!|---)/;

/**
 * The pattern used to ensure we get at least one viable command flag.
 * @type {RegExp}
 */
Cmd.prototype.REQUIRED_PARAMS_REGEX =
    /--(no-)*(develop|disable|enable|status|missing|rebuild|touch)($| )/;

/**
 * The pattern used for locating the line updated via --touch.
 * @type {RegExp}
 */
Cmd.prototype.TOUCH_ID_REGEX = /# !!! ID: (\d)+/;

/**
 * Command argument parsing options.
 * @type {Object}
 */

/* eslint-disable quote-props */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['develop', 'disable', 'enable', 'missing', 'rebuild',
            'status', 'touch'],
        'string': ['context', 'file'],
        'default': {
            context: 'app'
        }
    },
    Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE =
    'tibet appcache [--file <cachefile>] [--enable] [--disable] [--status] [--missing] [--develop] [--rebuild] [--touch] [--context]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var args,
        cachefile,
        appname;

    //  NOTE we don't use getArglist here since it's more concerned with
    //  processing known args against the defaults etc. and we want the true
    //  list of what was physically entered on the command line here.
    args = this.getArgv();

    if (!args.join(' ').match(this.REQUIRED_PARAMS_REGEX)) {
        args.unshift('--status');
    }

    // Verify our flags make sense. We're either doing enable/disable which
    // focus on the index file or we're doing missing/rebuild which focus
    // on the cache file itself.
    if ((this.options.enable || this.options.disable || this.options.status) &&
        (this.options.missing || this.options.rebuild)) {
        this.error(
            'Incompatible options: enable/disable/status + missing/rebuild.');
        return -1;
    }

    if (this.options.enable && this.options.disable) {
        this.error('Incompatible options: enable + disable.');
        return -1;
    }

    if (this.options.missing && this.options.rebuild) {
        this.error('Incompatible options: missing + rebuild.');
        return -1;
    }

    /* eslint-disable no-extra-parens */
    if ((this.options.enable || this.options.disable) && this.options.status) {
        this.options.status = null;
    }

    // Verify existence of the specified or default cache file. Even with
    // enable/disable we want to be sure the file we point to exists.
    if (this.options.file) {
        cachefile = this.options.file;
    } else {
        appname = CLI.getcfg('npm.name');
        cachefile = CLI.expandPath('~app/' + appname + '.appcache');
    }

    if (!sh.test('-e', cachefile)) {
        this.warn('Cannot find cache file: ' + CLI.getVirtualPath(cachefile));
        this.warn('Is this an HTTP(S) server-enabled project?');
        return -1;
    }

    // If we're doing a touch operation that's all we'll do.
    if (this.options.touch) {
        return this.executeTouch(cachefile);
    }

    // If we're enabling or disabling we need to find and check the
    // project.start_page. We want to confirm that the cache being referenced
    // matches and that the attribute isn't already configured as desired.
    if (this.options.enable || this.options.disable || this.options.status) {
        return this.executeIndexUpdate(cachefile);
    } else {
        return this.executeCacheUpdate(cachefile);
    }
};


/**
 * Perform the work specific to updating the actual cache file, or listing which
 * files may be missing from it.
 * @param {String} cachefile The name of the cache file being configured.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executeCacheUpdate = function(cachefile) {

    var text,
        lines,
        root,

        i,
        len,
        line,
        copy,

        id,
        changed,

        inapp,
        inlib,

        appEnd,
        appStart,
        libEnd,
        libStart,

        dir,
        regex,

        obsolete,

        libExist,
        libFiles,
        libMissing,

        appExist,
        appFiles,
        appMissing,

        newLines;

    text = this.validateCacheFile(cachefile);

    if (this.options.missing) {
        this.log('missing check only. no changes will be saved...');
    }

    // Sadly the spec crowd thought a pure text file was a good idea so we
    // have to parse/split/slice/dice/etc. to determine the current content
    // of the various cache sections.
    lines = text.split('\n');
    len = lines.length;

    appFiles = [];
    libFiles = [];

    inapp = false;
    inlib = false;

    changed = 0;
    obsolete = [];

    //  ---
    //  obsolete files
    //  ---

    for (i = 0; i < len; i++) {
        line = lines[i].trim();

        // If the line is blank ignore it.
        if (!line) {
            continue;
        }

        if (line.match(this.TOUCH_ID_REGEX)) {
            id = Date.now();
            lines[i] = '# !!! ID: ' + id;
            changed++;
        } else if (line.match(this.APP_START_REGEX)) {
            inapp = true;
            appStart = i;
            continue;
        } else if (line.match(this.LIB_START_REGEX)) {
            inlib = true;
            libStart = i;
            continue;
        } else if (line.match(this.OFFLIMITS_REGEX)) {
            continue;
        }

        // Once we hit another section we're done with the current section.
        if (line.match(/CACHE:/) ||
                line.match(/FALLBACK:/) ||
                line.match(/NETWORK:/)) {
            if (inapp) {
                inapp = false;
                appEnd = i;
            }
            if (inlib) {
                inlib = false;
                libEnd = i;
            }
        }

        if (inlib) {
            if (line.indexOf('#') === 0) {
                copy = line;
            }

            // Library content. We don't adjust these since the assumption is
            // the library isn't changing and won't need toggling on/off.
            while (line.indexOf('#') === 0) {
                // Remove comment for missing/rebuild file check...but don't
                // update the actual line, we don't adjust lib section content.
                line = line.slice(1).trim();
            }
            libFiles.push(line);

            // No copy means the file was uncommented.
            if (CLI.notValid(copy)) {
                if (!sh.test('-e', CLI.expandPath('~app/' + line))) {
                    obsolete.push(line);
                }
            }

        } else if (inapp) {

            // Application content. We alter these lines based on the state of
            // the --develop flag. During development app files are not cached
            // so we comment them out. Otherwise we uncomment them.

            if (this.options.develop) {

                if (line.indexOf('#') === 0) {
                    // Capture actual file name for missing/rebuild.
                    while (line.indexOf('#') === 0) {
                        line = line.slice(1).trim();
                    }

                } else {
                    // Update to be commented in place. File name is already
                    // uncommented for missing/rebuild checks.
                    lines[i] = '# ' + line;
                    changed++;

                    // If just doing a missing check we won't be saving any
                    // changes, meaning the line won't be updated to be
                    // commented out. Make sure it exists.
                    if (this.options.missing) {
                        if (!sh.test('-e', CLI.expandPath('~app/' + line))) {
                            obsolete.push(line);
                        }
                    }
                }

            } else {

                // All lines should be uncommented if they currently are
                // commented (but not masked), and we need to capture the proper
                // name in either case.
                if (line.indexOf('#') === 0) {

                    copy = line;

                    // Find the real name for use in missing checks...
                    while (line.indexOf('#') === 0) {
                        line = line.slice(1).trim();
                    }

                    // If the original wasn't masked then we can uncomment in
                    // the actual file location.
                    if (copy.indexOf('##') !== 0) {

                        // Verify all uncommented files can be found.
                        if (!sh.test('-e', CLI.expandPath('~app/' + line))) {
                            obsolete.push(line);
                        }

                        lines[i] = line;
                        changed++;
                    }
                } else {

                    // Verify all uncommented files can be found.
                    if (!sh.test('-e', CLI.expandPath('~app/' + line))) {
                        obsolete.push(line);
                    }
                }
            }

            appFiles.push(line);
        }
    }

    // Convert to normalized file path form...removing prefixing.
    root = CLI.expandPath('~app');

    //  ---
    //  lib missing
    //  ---

    //  Normally ignore lib (app developers won't be seeing changes here)
    if (this.options.context === 'lib' || this.options.context === 'all') {

        // Gather the content in lib_build. This is the only content we'll consider
        // cachable for the TIBET library from an automation perspective.
        dir = CLI.expandPath('~app_inf/tibet/lib');
        if (sh.test('-d', dir)) {
            libExist = sh.find(dir).filter(function(file) {
                return !sh.test('-d', file);
            });
        } else {
            this.warn('~lib_lib not found. Unable to compare lib files fully.');
            libExist = [];
        }

        regex = new RegExp('^' + path.sep);
        libExist = libExist.map(function(file) {
            return file.replace(root, '').replace(regex, '');
        });

        libMissing = libExist.filter(function(file) {
            return libFiles.indexOf(file) === -1;
        });
    } else {
        libMissing = [];
    }

    //  ---
    //  app missing
    //  ---

    //  Normally ignore lib (app developers won't be seeing changes here)
    if (this.options.context === 'app' || this.options.context === 'all') {

        // Scan app_build for any build artifacts specific to the application.
        dir = CLI.expandPath('~app_build');
        if (sh.test('-d', dir)) {
            appExist = sh.find(dir).filter(function(file) {
                return !sh.test('-d', file);
            });
        } else {
            this.warn('~app_build not found. Unable to compare app files fully.');
            appExist = [];
        }

        regex = new RegExp('^' + path.sep);
        appExist = appExist.map(function(file) {
            return file.replace(root, '').replace(regex, '');
        });

        appMissing = appExist.filter(function(file) {
            return appFiles.indexOf(file) === -1;
        });

        dir = CLI.expandPath('~app_inf');
        if (sh.test('-d', dir)) {

            //  Mask off cmd (cli support) and tibet (lib files) but let anything
            //  else in TIBET-INF (~app_inf default) serve as possible cache data.
            regex = new RegExp(
                path.sep + 'cmd' + path.sep + '|' +
                path.sep + 'tibet' + path.sep);

            appExist = sh.find(dir).filter(function(file) {
                return !sh.test('-d', file) && !regex.test(file);
            });
        } else {
            this.warn('~app_build not found. Unable to compare app files fully.');
            appExist = [];
        }

        regex = new RegExp('^' + path.sep);
        appExist = appExist.map(function(file) {
            return file.replace(root, '').replace(regex, '');
        });

        appMissing = appExist.filter(function(file) {
            return appFiles.indexOf(file) === -1;
        });

        // If we're in develop mode any new files we add should be added in
        // commented out form.
        if (this.options.develop) {
            appMissing = appMissing.map(function(file) {
                return '# ' + file;
            });
        }
    } else {
        appMissing = [];
    }

    //  ---
    //  output / update
    //  ---

    if (this.options.missing) {
        if (!libMissing.length && !appMissing.length && !obsolete.length) {
            this.log('No build files missing, no obsolete files.', 'success');
            return 0;
        }

        if (libMissing.length) {
            this.warn('Missing lib files:\n' + libMissing.join('\n'));
        }

        if (appMissing.length) {
            this.warn('Missing app files:\n' + appMissing.join('\n'));
        }

        if (obsolete.length) {
            this.warn('Obsolete/misspelled files:\n' + obsolete.join('\n'));
        }

        return 0;

    } else if (this.options.rebuild) {

        // If we're here we're rebuilding using information from the missing
        // file lists to update the cache content.
        newLines = lines;

        if (appStart && appEnd && appMissing.length) {
            appMissing.push('');        // blank line before next section.
            newLines = lines.slice(0, appEnd).concat(
                appMissing).concat(lines.slice(appEnd));

            this.info('saving ' + (appMissing.length - 1) +
                ' app-level appcache changes...');
            newLines.join('\n').to(cachefile);
        }

        if (libStart && libEnd && libMissing.length) {
            libMissing.push('');        // blank line before next section.
            newLines = lines.slice(0, libEnd).concat(
                libMissing).concat(lines.slice(libEnd));

            this.info('saving ' + (libMissing.length - 1) +
                ' lib-level appcache changes...');
            newLines.join('\n').to(cachefile);
        }

        if (obsolete.length) {
            this.warn('Obsolete/misspelled files:\n' + obsolete.join('\n'));
        }

    } else if (changed > 1) {

        if (obsolete.length) {
            this.warn('Obsolete/misspelled files:\n' + obsolete.join('\n'));
        }

        this.info('saving ' + (changed - 1) + ' appcache changes...');

        // If we changed more than just the ID (for touch purposes) save the
        // output, we toggled some comments for develop/non-develop mode.
        lines.join('\n').to(cachefile);

        this.log('application cache update complete.', 'success');
    } else {
        this.log('application cache did not require update.', 'success');
    }

    return 0;
};


/**
 * Perform the work specific to enabling/disabling the cache via the
 * project.start_page and/or handlebars html element manifest attribute setting.
 * @param {String} cachefile The name of the cache file being configured.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executeIndexUpdate = function(cachefile) {

    var startpage,
        file,
        text,
        doc,
        html,
        value,
        attrfile,
        novalue,
        operation;

    this.log('checking application cache status...');

    startpage = CLI.getcfg('project.start_page');

    file = CLI.expandPath('~/views/index.handlebars');
    if (!sh.test('-e', file)) {

        //  Static projects such as ghpages may not be vending via TDS.
        file = CLI.expandPath(startpage);
        if (!sh.test('-e', file)) {
            this.error('Cannot find ' + startpage);
            return -1;
        }
    }

    text = sh.cat(file);
    if (!text) {
        this.error('Unable to read index file content.');
        return -1;
    }

    doc = parser.parseFromString(text);

    if (!doc || CLI.isValid(doc.getElementsByTagName('parsererror')[0])) {
        this.error('Error parsing index file. Not well-formed?');
        return -1;
    }

    html = doc.getElementsByTagName('html')[0];
    if (!html) {
        this.error('Unable to locate html element.');
        return -1;
    }

    value = html.getAttribute('manifest');
    novalue = html.getAttribute('no-manifest');

    attrfile = '.' + cachefile.replace(CLI.expandPath('~app'), '');

    if (this.options.disable) {
        html.removeAttribute('manifest');
        html.setAttribute('no-manifest', attrfile);
    } else if (this.options.enable) {
        html.removeAttribute('no-manifest');
        html.setAttribute('manifest', attrfile);
    } else {    //  options.status
        if (value) {
            if (value === cachefile) {
                this.log('Application cache explicitly enabled.', 'success');
            } else {
                this.log('Application cache implicitly disabled.', 'success');
            }
        } else if (novalue) {
            this.log('Application cache explicitly disabled.', 'success');
        } else {
            this.log('Application cache implicitly disabled.', 'success');
        }
        return 0;
    }

    this.log('updating cache status...');

    // Write it back out...
    text = serializer.serializeToString(doc);
    if (!text) {
        this.error('Error serializing index file.');
        return -1;
    }

    // Serializer has a habit of not placing a newline after the DOCTYPE.
    text = text.replace(/html><html/, 'html>\n<html');
    text.to(file);

    operation = this.options.enable ? 'enabled' : 'disabled';

    if (this.options.enable) {
        this.warn('Remember first launch after enable initializes the cache.');
    } else {
        this.warn('Clear chrome://appcache-internals/ etc. to fully disable.');
    }

    this.log('Application cache ' + operation + '.', 'success');

    return 0;
};


/**
 * Updates the ID: value of the cache file, ensuring that it will refresh when
 * it is next checked.
 * @param {String} cachefile The name of the cache file being configured.
 */
Cmd.prototype.executeTouch = function(cachefile) {
    var text,
        lines,
        len,
        i,
        line,
        match,
        id;

    text = this.validateCacheFile(cachefile);

    this.log('updating cache ID value...');

    // Sadly the spec crowd thought a pure text file was a good idea so we
    // have to parse/split/slice/dice/etc. to determine the current content
    // of the various cache sections.
    lines = text.split('\n');
    len = lines.length;

    for (i = 0; i < len; i++) {
        line = lines[i].trim();

        match = line.match(this.TOUCH_ID_REGEX);
        if (CLI.isValid(match)) {
            id = Date.now();
            lines[i] = '# !!! ID: ' + id;
        }
    }

    lines.join('\n').to(cachefile);

    this.info('Application cache stamped with ID: ' + id);

    return 0;
};


/**
 * Ensures the content of the cache file matches the requirements of a valid
 * cache file that TIBET can manage. If the tests are successful the text of the
 * cache is returned for further processing.
 * @param {String} cachefile The name of the cache file being configured.
 * @returns {String} The file content.
 */
Cmd.prototype.validateCacheFile = function(cachefile) {

    var text;

    this.log('checking application cache content...');

    text = sh.cat(cachefile);
    if (!text) {
        throw new Error('Unable to read cache file: ' + cachefile);
    }

    if (!text) {
        throw new Error('Cache file not a valid HTML5 manifest.');
    }

    // Has to start with CACHE MANIFEST or it's not valid.
    if (!/^CACHE MANIFEST\n/.test(text)) {
        throw new Error('Cache file not a valid HTML5 manifest.');
    }

    // We rely on specific comment blocks so verify we can find them...
    if (!text.match(this.APP_START_REGEX) ||
        !text.match(this.LIB_START_REGEX)) {
        throw new Error('Cache file not a TIBET-managed manifest.');
    }

    return text;
};


module.exports = Cmd;

}());
