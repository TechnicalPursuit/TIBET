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
'attribute name effectively will disable the cache (although if the cache\n' +
'was ever activated you must clear your browser\'s cache content as well).\n\n' +

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
 * The string used for locating the line updated via --touch.
 * @type {String}
 */
Cmd.prototype.ID_REGEX = / ID: (\d)+/;

/**
 * Command argument parsing options.
 * @type {Object}
 */
Cmd.prototype.PARSE_OPTIONS = CLI.blend(
    {
        'boolean': ['develop', 'disable', 'enable', 'missing', 'rebuild', 'touch'],
        'string': ['file'],
        'default': {
            develop: true,
            disable: false,
            enable: false,
            missing: false,
            rebuild: false,
            touch: false
        }
    },
    Parent.prototype.PARSE_OPTIONS);

/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE =
    'tibet cache [--file <cachefile>] [--enable] [--disable] [--develop] [--missing] [--rebuild] [--touch]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @return {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var cachefile,
        appname;

    if (this.options.enable && !this.options.disable &&
            !this.options.missing && !this.options.rebuild &&
            !this.options.touch && !this.options.develop) {
        return this.usage();
    }

    // Verify our flags make sense. We're either doing enable/disable which
    // focus on the index.html file or we're doing missing/rebuild which focus
    // on the cache file itself.
    if ((this.options.enable || this.options.disable) &&
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

    // Verify existence of the specified or default cache file. Even with
    // enable/disable we want to be sure the file we point to exists.
    if (this.options.file) {
        cachefile = this.options.file;
    } else {
        appname = CLI.getcfg('npm.name');
        cachefile = appname + '.appcache';
    }

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
    if (this.options.enable || this.options.disable) {
        return this.executeIndexUpdate(cachefile);
    } else {
        return this.executeCacheUpdate(cachefile);
    }
};


/**
 * Perform the work specific to updating the actual cache file, or listing which
 * files may be missing from it.
 * @param {String} cachefile The name of the cache file being configured.
 * @return {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.executeCacheUpdate = function(cachefile) {

    var text,
        lines,
        cwd,

        i,
        len,
        start,
        end,
        line,

        dir,

        libBuilt,
        libFiles,
        libMissing,

        appBuilt,
        appFiles,
        appMissing,

        newLines;

    this.log('checking application cache content...');

    text = sh.cat(cachefile);
    if (!text) {
        this.error('Unable to read cache file: ' + cachefile);
        throw new Error();
    }

    // Sadly the spec crowd thought a pure text file was a good idea so we
    // have to parse/split/slice/dice/etc. to determine the current content
    // of the various cache sections.
    lines = text.split('\n');
    len = lines.length;

    // Has to start with CACHE MANIFEST or it's not valid.
    if (!lines[0].trim().match(/^CACHE MANIFEST$/)) {
        this.warn('Cache file not a valid HTML5 manifest.');
        throw new Error();
    }

    // If there's a CACHE: line it will define the start of the cache
    // entries, but it's optional.
    if (text.match(/CACHE:/)) {
        // Adjust our starting line to the line just beyond CACHE:
        start = 1;
        for (i = 1; i < len; i++) {
            line = lines[i].trim();
            if (line.match(/^CACHE:$/)) {
                start = i + 1;
                break;
            }
            start = i;
        }

        if (!start) {
            this.error('Unable to locate CACHE: start.');
            throw new Error();
        }

    } else {
        // Our starting index is the first line after CACHE MANIFEST
        start = 1;
    }

    appFiles = [];
    libFiles = [];

    end = len;
    for (i = start; i < len; i++) {
        line = lines[i].trim();

        // If the line is blank, or a comment, ignore it.
        if (!line || line.match(/^#/)) {
            continue;
        }

        // Once we hit another section we're done with the cache entries.
        if (line.match(/FALLBACK:/) || line.match(/NETWORK:/)) {
            end = i;
            break;
        }

        if (line.match(/TIBET-INF\/tibet/) || line.match(/node_modules\/tibet/)) {
            // Library content
            libFiles.push(line);
        } else {
            // Application content
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
        this.warn('~lib_build not found. Incomplete data for full check.');
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
        this.warn('~app_build not found. Incomplete data for full check.');
        appBuilt = [];
    }

    appBuilt = appBuilt.map(function(file) {
        return file.replace(cwd, '');
    });

    appMissing = appBuilt.filter(function(file) {
        return appFiles.indexOf(file) === -1;
    });

    if (this.options.missing) {
        if (!libMissing.length && !appMissing.length) {
            this.info('No build files missing from cache.');
            return;
        }

        if (libMissing.length) {
            this.warn('Missing lib files:\n' + libMissing.join('\n'));
        }

        if (appMissing.length) {
            this.warn('Missing app files:\n' + appMissing.join('\n'));
        }
        return;
    }

    // If we're here we're rebuilding using information from the missing file
    // lists to update the cache content.
    newLines = lines.slice(0, end).concat(
        libMissing).concat(
        appMissing).concat(
        lines.slice(end));

    newLines.join('\n').to(cachefile);

    this.info('application cache update complete.');
};


/**
 * Perform the work specific to enabling/disabling the cache via the index.html
 * file's html element manifest attribute setting.
 * @param {String} cachefile The name of the cache file being configured.
 * @return {Number} A return code. Non-zero indicates an error.
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
    if (!doc) {
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
        if (this.options.enable) {
            this.log('Application cache already enabled.');
            return;
        }

        html.removeAttribute('manifest');
        html.setAttribute('no-manifest', cachefile);

    } else if (novalue && novalue === cachefile) {
        if (this.options.disable) {
            this.log('Application cache already disabled.');
            return;
        }

        html.removeAttribute('no-manifest');
        html.setAttribute('manifest', cachefile);
    } else {
        // Neither attribute found, implicitly disabled.
        if (this.options.disable) {
            this.log('Application cache implicitly disabled.');
            return;
        }

        html.setAttribute('manifest', cachefile);
    }

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

    this.info('Application cache ' + operation + '.');
};


/**
 * Updates the ID: value of the cache file, ensuring that it will refresh when
 * it is next checked.
 */
Cmd.prototype.executeTouch = function(cachefile) {
    var text,
        lines,
        len,
        i,
        line,
        match,
        id;

    this.log('updating cache ID value...');

    text = sh.cat(cachefile);
    if (!text) {
        this.error('Unable to read cache file: ' + cachefile);
        throw new Error();
    }

    // Sadly the spec crowd thought a pure text file was a good idea so we
    // have to parse/split/slice/dice/etc. to determine the current content
    // of the various cache sections.
    lines = text.split('\n');
    len = lines.length;

    // Has to start with CACHE MANIFEST or it's not valid.
    if (!lines[0].trim().match(/^CACHE MANIFEST$/)) {
        this.warn('Cache file not a valid HTML5 manifest.');
        throw new Error();
    }

    for (i = 0; i < len; i++) {
        line = lines[i].trim();

        match = line.match(this.ID_REGEX);
        if (CLI.isValid(match)) {
            id = Date.now();
            lines[i] = '# ID: ' + id;
        }
    }

    lines.join('\n').to(cachefile);

    this.info('Application cache stamped with ID: ' + id);
};


module.exports = Cmd;

}());
