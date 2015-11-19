//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet cache' command provides control over the various
 *     aspects of html5 application manifest files.
 */
//  ========================================================================

/*eslint indent:0*/

(function() {

'use strict';

var CLI,
    sh,
    dom,
    parser,
    serializer,
    Parent,
    Cmd;

CLI = require('./_cli');
sh = require('shelljs');
dom = require('xmldom');
parser = new dom.DOMParser();
serializer = new dom.XMLSerializer();

//  ---
//  Type Construction
//  ---

Parent = require('./_cmd');

Cmd = function() {};
Cmd.prototype = new Parent();


//  ---
//  Type Attributes
//  ---

/**
 * The command execution context.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.PROJECT;


//  ---
//  Instance Attributes
//  ---

/**
 * The command help string.
 * @type {string}
 */
Cmd.prototype.HELP =
'Provides control over HTML5 application manifests and their activation.\n\n' +

'TIBET projects include a manifest file named {appname}.appcache which is\n' +
'managed by this command by taking advantage of specific comment blocks\n' +
'which help delimit the content of the cache file for easier processing.\n\n' +

'Content checks are done against the files in ~app_build and ~lib_build.\n' +
'If your application should cache files outside of those directories you\n' +
'must add those entries manually. This command never removes entries so\n' +
'you can feel confident both editing the cache and using this command.\n\n' +

'The --file option provides a way to point to an application manifest other\n' +
'than {appname}.appcache. You will need this if you renamed the default app\n' +
'manifest file.\n\n' +

'Use --enable to update index.html to use the proper manifest value. When\n' +
'active the html element will have a manifest attribute, otherwise it will\n' +
'have a no-manifest attribute (which effectively turns off caching).\n\n' +

'Use --disable to update index.html to have a no-manifest attribute. This\n' +
'attribute name effectively will disable the cache. NOTE that if the cache\n' +
'was ever activated you must clear your browser\'s cache content and any\n' +
'browser-specific appcache (chrome://appcache-internals/) to fully disable.\n\n' +

'Use --develop to update the cache such that application file content is\n' +
'commented out so it will load dynamically via the network. Invert the flag\n' +
'via --no-develop to uncomment application section content to test your\n' +
'application running from the cache. Note --develop is on by default.\n\n' +

'Use --missing to list files in the application not in the manifest. This\n' +
'is a relatively simple scan looking for css, image, and other non-source\n' +
'files which might be useful to cache. For JavaScript the system presumes\n' +
'that only source files in ~app_build should be part of the cache.\n\n' +

'Use --rebuild to refresh the app and lib sections of the manifest. This is\n' +
'the only flag which edits the file content of the appcache itself. If the\n' +
'comment delimiters for app and lib sections are not present this operation\n' +
'will fail and output an appropriate error message. Use this option with a\n' +
'degree of caution since it will alter the content of your cache.\n\n' +

'Use --touch to update the embedded ID: {timestamp} value provided by the\n' +
'default cache template. This effectively changes the cache content which\n' +
'should have the effect of causing your browser to refresh the cache.\n\n';

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
    /--(no-)*(develop|disable|enable|status||missing|rebuild|touch)($| )/;

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
        'string': ['file'],
        'default': {
            status: true
        }
    },
    Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE =
    'tibet cache [--file <cachefile>] [--enable] [--disable] [--status] [--missing] [--develop] [--rebuild] [--touch]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var cachefile,
        appname;

    if (!this.getArglist().join(' ').match(this.REQUIRED_PARAMS_REGEX)) {
        return this.usage();
    }

    // Verify our flags make sense. We're either doing enable/disable which
    // focus on the index.html file or we're doing missing/rebuild which focus
    // on the cache file itself.
    if ((this.options.enable || this.options.disable || this.options.status) &&
        (this.options.missing || this.options.rebuild)) {
        this.error('Incompatible command flags.');
        throw new Error();
    }

    if (this.options.enable && this.options.disable) {
        this.error('Incompatible command flags.');
        throw new Error();
    }

    if (this.options.missing && this.options.rebuild) {
        this.error('Incompatible command flags.');
        throw new Error();
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

    //  resolve the cache file path relative to our current location
    cachefile = '.' + cachefile.replace(CLI.expandPath('~app'), '');

    if (!sh.test('-e', cachefile)) {
        this.error('Cannot find cache file: ' + cachefile);
        throw new Error();
    }

    // If we're doing a touch operation that's all we'll do.
    if (this.options.touch) {
        return this.executeTouch(cachefile);
    }

    // If we're enabling or disabling we need to find and check the index.html
    // file. We want to confirm that the cache being referenced matches and that
    // the attribute isn't already configured as desired.
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
        cwd,

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

        obsolete,

        libBuilt,
        libFiles,
        libMissing,

        appBuilt,
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
                if (!sh.test('-e', line)) {
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
                        if (!sh.test('-e', line)) {
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
                        if (!sh.test('-e', line)) {
                            obsolete.push(line);
                        }

                        lines[i] = line;
                        changed++;
                    }
                } else {

                    // Verify all uncommented files can be found.
                    if (!sh.test('-e', line)) {
                        obsolete.push(line);
                    }
                }
            }

            appFiles.push(line);
        }
    }

    cwd = process.cwd() + '/';

    // Gather the content in lib_build. This is the only content we'll consider
    // cachable for the TIBET library from an automation perspective.
    dir = CLI.expandPath('~lib_build');
    if (sh.test('-d', dir)) {
        libBuilt = sh.find(dir).filter(function(file) {
            return !sh.test('-d', file);
        });
    } else {
        this.warn('~lib_build not found. Unable to compare lib files fully.');
        libBuilt = [];
    }

    // Convert to normalized file path form...removing prefixing.
    libBuilt = libBuilt.map(function(file) {
        return file.replace(cwd, '');
    });

    libMissing = libBuilt.filter(function(file) {
        return libFiles.indexOf(file) === -1;
    });

    // Scan app_build for any build artifacts specific to the application.
    dir = CLI.expandPath('~app_build');
    if (sh.test('-d', dir)) {
        appBuilt = sh.find(dir).filter(function(file) {
            return !sh.test('-d', file);
        });
    } else {
        this.warn('~app_build not found. Unable to compare app files fully.');
        appBuilt = [];
    }

    appBuilt = appBuilt.map(function(file) {
        return file.replace(cwd, '');
    });

    appMissing = appBuilt.filter(function(file) {
        return appFiles.indexOf(file) === -1;
    });

    // If we're in develop mode any new files we add should be added in
    // commented out form.
    if (this.options.develop) {
        appMissing = appMissing.map(function(file) {
            return '# ' + file;
        });
    }

    if (this.options.missing) {
        if (!libMissing.length && !appMissing.length && !obsolete.length) {
            this.success('No build files missing, no obsolete files.');
            return;
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

        return;

    } else if (this.options.rebuild) {

        // If we're here we're rebuilding using information from the missing
        // file lists to update the cache content.
        newLines = lines;

        if (appStart && appEnd && appMissing.length) {
            appMissing.push('');        // blank line before next section.
            newLines = lines.slice(0, appEnd).concat(
                appMissing).concat(lines.slice(appEnd));
        }

        if (libStart && libEnd && libMissing.length) {
            libMissing.push('');        // blank line before next section.
            newLines = lines.slice(0, libEnd).concat(
                libMissing).concat(lines.slice(libEnd));
        }

        if (obsolete.length) {
            this.warn('Obsolete/misspelled files:\n' + obsolete.join('\n'));
        }

        /* eslint-disable no-extra-parens */
        this.info('saving ' +
            ((changed - 1) + appMissing.length + libMissing.length) +
            ' appcache changes...');
        /* eslint-enable no-extra-parens */

        newLines.join('\n').to(cachefile);

    } else if (changed > 1) {

        if (obsolete.length) {
            this.warn('Obsolete/misspelled files:\n' + obsolete.join('\n'));
        }

        this.info('saving ' + (changed - 1) + ' appcache changes...');

        // If we changed more than just the ID (for touch purposes) save the
        // output, we toggled some comments for develop/non-develop mode.
        lines.join('\n').to(cachefile);

        this.success('application cache update complete.');
    } else {
        this.success('application cache did not require update.');
    }

};


/**
 * Perform the work specific to enabling/disabling the cache via the index.html
 * file's html element manifest attribute setting.
 * @param {String} cachefile The name of the cache file being configured.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executeIndexUpdate = function(cachefile) {

    var text,
        doc,
        html,
        value,
        novalue,
        operation;

    this.log('checking application cache status...');

    if (!sh.test('-e', 'index.html')) {
        this.error('Cannot find index.html');
        throw new Error();
    }

    text = sh.cat('index.html');
    if (!text) {
        this.error('Unable to read index.html content.');
        throw new Error();
    }

    doc = parser.parseFromString(text);

    if (!doc || CLI.isValid(doc.getElementsByTagName('parsererror')[0])) {
        this.error('Error parsing index.html. Not well-formed?');
        throw new Error();
    }

    html = doc.getElementsByTagName('html')[0];
    if (!html) {
        this.error('Unable to locate html element.');
        throw new Error();
    }

    value = html.getAttribute('manifest');
    novalue = html.getAttribute('no-manifest');

    if (value && value === cachefile) {
        if (this.options.enable || this.options.status) {
            this.success('Application cache explicitly enabled.');
            return;
        }

        html.removeAttribute('manifest');
        html.setAttribute('no-manifest', cachefile);

    } else if (novalue && novalue === cachefile) {
        if (this.options.disable || this.options.status) {
            this.success('Application cache explicitly disabled.');
            return;
        }

        html.removeAttribute('no-manifest');
        html.setAttribute('manifest', cachefile);
    } else {
        // Neither attribute found, implicitly disabled.
        if (this.options.disable || this.options.status) {
            this.success('Application cache implicitly disabled.');
            return;
        }

        html.setAttribute('manifest', cachefile);
    }

    this.log('updating cache status...');

    // Write it back out...
    text = serializer.serializeToString(doc);
    if (!text) {
        this.error('Error serializing index.html.');
        throw new Error();
    }

    // Serializer has a habit of not placing a newline after the DOCTYPE.
    text = text.replace(/html><html/, 'html>\n<html');
    text.to('index.html');

    operation = this.options.enable ? 'enabled' : 'disabled';

    if (this.options.enable) {
        this.warn('Remember first launch after enable initializes the cache.');
    } else {
        this.warn('Clear chrome://appcache-internals/ etc. to fully disable.');
    }

    this.success('Application cache ' + operation + '.');
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
