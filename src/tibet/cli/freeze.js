//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet freeze' command. Copies and prunes the node_modules
 *     version of TIBET currently used by an application into the application's
 *     TIBET-INF directory. This allows the library to be added via Git or
 *     similar tools which might normally ignore node_modules and avoids
 *     the need for pushing node_modules content into TIBET+CouchDB databases.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0 */

(function() {

'use strict';

var CLI,
    helpers,
    Cmd;

CLI = require('./_cli');
helpers = require('../../../etc/helpers/make_helpers');

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
Cmd.NAME = 'freeze';

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
        'boolean': ['minify', 'source', 'all', 'standalone', 'zipped', 'brotlied'],
        'string': ['tibet'],
        'default': {
            all: true,
            minify: true
        }
    },
    Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet freeze [--tibet <bundle>] [--minify] [--all] [--source] [--zipped] [--brotlied]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var sh,
        path,

        cmd,
        err,
        app_inf,
        app_npm,
        infroot,
        libbase,
        libsrc,
        srcroot,

        lnflags,
        nmsrcdir,
        nmdestdir,
        srcdir,

        lnerr,
        file,
        json,
        list,
        bundle,
        profile,

        str,

        source,
        target;

    sh = require('shelljs');
    path = require('path');

    cmd = this;

    app_inf = CLI.expandPath('~app_inf');

    // Verify our intended target directory exists.
    if (!sh.test('-e', app_inf)) {
        this.error('Cannot find app_inf: ' + app_inf);
        return 1;
    }

    // Make sure we can find npm root directory (node_modules).
    app_npm = CLI.expandPath('~app_npm');
    if (!sh.test('-e', app_npm)) {
        this.error('Cannot find app_npm: ' + app_npm);
        this.warn('Verify `tibet init` has run and initialized the project.');
        return 1;
    }

    // Make sure we can find the bundled TIBET source packages.
    libbase = CLI.joinPaths(app_npm, 'tibet', 'lib');
    if (!sh.test('-e', libbase)) {
        this.error('Cannot find library root: ' + libbase);
        return 1;
    }

    // Make sure we can find the bundled TIBET source packages.
    libsrc = CLI.joinPaths(libbase, 'src');
    if (!sh.test('-e', libsrc)) {
        this.error('Cannot find library source: ' + libsrc);
        this.warn('Run `tibet build` in TIBET library to build packages.');
        return 1;
    }

    //  ---
    //  freeze (aka copy or link)
    //  ---

    infroot = CLI.joinPaths(app_inf, 'tibet');

    //  If the target is a link that's the `tibet init` state, so we'll skip
    //  prompting and move directly to removing it so we can mkdir below.
    if (sh.test('-L', infroot)) {
        err = sh.rm('-rf', infroot);
        if (sh.error()) {
            this.error('Error removing target link: ' + err.stderr);
            return 1;
        }
    } else if (sh.test('-d', infroot)) {

        //  Apparently already a true directory. Need the force option to remove
        //  "real files" from that location.
        if (!this.options.force) {
            this.warn('Project already frozen. Use --force to re-freeze.');
            return 1;
        } else {
            //  Exists but force is true...remove it.
            err = sh.rm('-rf', infroot);
            if (sh.error()) {
                this.error('Error removing target directory: ' + err.stderr);
                return 1;
            }
        }
    }

    //  Either it doesn't exist or force is true and it was removed...
    err = sh.mkdir(infroot);
    if (sh.error()) {
        this.error('Error creating target directory: ' + err.stderr);
        return 1;
    }

    this.log('freezing packaged library resources...');
    err = sh.cp('-Rn', libbase + '/', infroot);
    if (sh.error()) {
        this.error('Error cloning ' + libbase + ': ' + err.stderr);
        return 1;
    }

    srcroot = CLI.joinPaths(infroot, 'lib', 'src');
    list = sh.ls('-A', srcroot);

    if (sh.error()) {
        this.error('Error listing ' + srcroot + ': ' + list.stderr);
        this.warn('Verify `tibet build` has run and built library packages.');
        return 1;
    }

    this.log('freezing library dependencies...');
    err = sh.cp('-Rn', CLI.joinPaths(app_npm, 'tibet', 'deps') + '/', infroot);
    if (sh.error()) {
        this.error('Error cloning tibet/deps: ' + err.stderr);
        return 1;
    }

    this.log('freezing library support resources...');
    err = sh.cp('-Rn', CLI.joinPaths(app_npm, 'tibet', 'etc') + '/', infroot);
    if (sh.error()) {
        this.error('Error cloning tibet/etc: ' + err.stderr);
        return 1;
    }

    this.log('freezing standard library docs...');
    err = sh.cp('-Rn', CLI.joinPaths(app_npm, 'tibet', 'doc') + '/', infroot);
    if (sh.error()) {
        this.error('Error cloning tibet/doc: ' + err.stderr);
        return 1;
    }

    if (this.options.source) {
        this.log('freezing library source...');
        err = sh.cp('-Rn', CLI.joinPaths(app_npm, 'tibet', 'src') + '/', infroot);
        if (sh.error()) {
            this.error('Error cloning tibet/src: ' + err.stderr);
            return 1;
        }

        this.log('freezing library tests...');
        err = sh.cp('-Rn', CLI.joinPaths(app_npm, 'tibet', 'test') + '/', infroot);
        if (sh.error()) {
            this.error('Error cloning tibet/test: ' + err.stderr);
            return 1;
        }

        this.log('freezing library demos...');
        err = sh.cp('-Rn', CLI.joinPaths(app_npm, 'tibet', 'demo') + '/', infroot);
        if (sh.error()) {
            this.error('Error cloning tibet/demo: ' + err.stderr);
            return 1;
        }
    } else {
        this.log('freezing developer boot resources...');
        sh.mkdir('-p', CLI.joinPaths(infroot, 'src', 'tibet', 'boot'));
        err = sh.cp('-Rn',
                    CLI.joinPaths(app_npm, 'tibet', 'src', 'tibet', 'boot') + '/',
                    CLI.joinPaths(infroot, 'src', 'tibet'));
        if (sh.error()) {
            this.error('Error cloning tibet boot: ' + err.stderr);
            return 1;
        }

        this.log('freezing developer tool resources...');
        sh.mkdir('-p', CLI.joinPaths(infroot, 'src', 'tibet', 'tools'));
        err = sh.cp('-Rn',
                    CLI.joinPaths(app_npm, 'tibet', 'src', 'tibet', 'tools') + '/',
                    CLI.joinPaths(infroot, 'src', 'tibet'));
        if (sh.error()) {
            this.error('Error cloning tibet tools: ' + err.stderr);
            return 1;
        }
    }

    nmsrcdir = CLI.joinPaths(app_npm, 'tibet', 'node_modules');
    nmdestdir = CLI.joinPaths(infroot, 'node_modules');

    //  The user specified standalone, which means we currently copy the CLI and
    //  TDS code into the frozen app. We also make a *copy* (not a link) of
    //  TIBET's node_modules directory into the standalone project.
    if (this.options.standalone) {

        this.log('freezing developer cli resources...');
        sh.mkdir('-p', CLI.joinPaths(infroot, 'src', 'tibet', 'cli'));
        err = sh.cp('-Rn',
                    CLI.joinPaths(app_npm, 'tibet', 'src', 'tibet', 'cli') + '/',
                    CLI.joinPaths(infroot, 'src', 'tibet'));
        if (sh.error()) {
            this.error('Error cloning tibet cli: ' + err.stderr);
            return 1;
        }

        this.log('freezing developer tds resources...');
        sh.mkdir('-p', CLI.joinPaths(infroot, 'tds'));
        err = sh.cp('-Rn',
                    CLI.joinPaths(app_npm, 'tibet', 'tds') + '/',
                    infroot);
        if (sh.error()) {
            this.error('Error cloning tibet tds: ' + err.stderr);
            return 1;
        }

        this.log('freezing developer node_modules resources...');
        err = sh.cp('-Rn',
                    nmsrcdir + '/',
                    nmdestdir);

        if (sh.error()) {
            this.error('Error cloning tibet tds: ' + err.stderr);
            return 1;
        }

    } else {

        //  Since we're not standalone (source or not) we need to link TIBET's
        //  node_modules reference from TIBET into location so things like
        //  `tibet test` and `tibet reflect` will run on a frozen project.
        lnflags = '-s';
        if (this.options.force) {
            lnflags += 'f';
        }

        //  We want the project's node_modules/tibet/node_modules dir linked into
        //  place so CLI commands consistently find their dependencies.
        srcdir = path.relative(path.dirname(nmdestdir), nmsrcdir);

        lnerr = sh.ln(lnflags, srcdir, nmdestdir);

        if (sh.error()) {
            this.error('Error relinking npm resources: ' + lnerr.stderr);
        }
    }

    //  ---
    //  prune unwanted/unused files
    //  ---

    bundle = this.options.tibet;
    if (!bundle) {

        //  Compute the bundle based on what the 'tibet build' command would've
        //  put into our config as the project packaging profile (if 'tibet
        //  build was executed').
        profile = CLI.getcfg('project.packaging.profile');
        if (profile) {
            bundle = profile.slice(profile.lastIndexOf('@') + 1);
        }

        if (CLI.isEmpty(bundle)) {
            bundle = 'base';
        }
    }

    if (!this.options.all) {

        this.log('pruning unnecessary source rollups...');

        list.forEach(function(aFile) {

            var filename;

            filename = aFile.toString();

            // TODO: come up with a better solution. For now the two files we
            // don't want to remove by default (if tibet_developer.min.js
            // exists) is tibet_developer.min.js.gz or tibet_developer.min.js.br
            // since the various tsh-related commands use those
            if (/tibet_developer\.min\.js/.test(filename)) {
                if (/\.gz$/.test(filename)) {
                    sh.rm('-f', CLI.joinPaths(srcroot, filename));
                }
                if (/\.br/.test(filename)) {
                    sh.rm('-f', CLI.joinPaths(srcroot, filename));
                }
                return;
            }

            // Remove any minified/unminified copies we don't want.
            if (cmd.options.minify) {
                if (/\.min\./.test(filename) !== true) {
                    sh.rm('-f', CLI.joinPaths(srcroot, filename));
                }
            } else {
                if (/\.min\./.test(filename) === true) {
                    sh.rm('-f', CLI.joinPaths(srcroot, filename));
                }
            }

            // Remove any zipped/unzipped copies we don't want.
            if (cmd.options.zipped) {
                if (/\.gz$/.test(filename) !== true) {
                    sh.rm('-f', CLI.joinPaths(srcroot, filename));
                }
            } else {
                if (/\.gz$/.test(filename) === true) {
                    sh.rm('-f', CLI.joinPaths(srcroot, filename));
                }
            }

            // Remove any brotlied/unbrotlied copies we don't want.
            if (cmd.options.brotlied) {
                if (/\.br/.test(filename) !== true) {
                    sh.rm('-f', CLI.joinPaths(srcroot, filename));
                }
            } else {
                if (/\.br/.test(filename) === true) {
                    sh.rm('-f', CLI.joinPaths(srcroot, filename));
                }
            }

            // Never prune any remaining hook or loader file.
            if (/_hook\./.test(filename) || /_loader\./.test(filename)) {
                return;
            }

            //  Note that when source is specified no copies of bundled code are
            //  kept, only the hook and loader files which are always pulled from
            //  bundles.
            if (cmd.options.source) {
                sh.rm('-f', CLI.joinPaths(srcroot, filename));
            } else if (filename.indexOf('tibet_' + bundle + '.') === -1) {
                sh.rm('-f', CLI.joinPaths(srcroot, filename));
            }
        });
    }

    //  ---
    //  update lib_root
    //  ---

    this.log('updating project lib_root setting...');

    file = CLI.expandPath('~tibet_file');
    json = require(file);
    if (!json) {
        this.error('Unable to update lib_root in: ' + file);
        return 1;
    }
    if (!json.path) {
        json.path = {};
    }
    json.path.lib_root = '~app/TIBET-INF/tibet';

    //  SAVE the file (note the 'to()' call here...
    str = CLI.beautify(JSON.stringify(json));
    new sh.ShellString(str).to(file);

    //  ---
    //  Set new lib_root in runtime and flush all paths to force recomputation
    //  ---

    CLI.getPackage().lib_root = json.path.lib_root;
    CLI.getPackage().paths = {};

    //  ---
    //  Relink project build
    //  ---

    target = CLI.expandPath('~app_build');
    if (!sh.test('-d', target)) {
        this.warn('Couldn\'t find built project files but `tibet build` will' +
                    ' now use frozen library.');
        return 1;
    }

    source = CLI.expandPath('~lib_build');
    if (!sh.test('-d', source)) {
        this.error('~lib_build not found.');
        return 1;
    }

    helpers.link_apps_and_tibet(cmd, source, target, {config: bundle});

    //  ---
    //  Finished
    //  ---

    this.info('Application frozen. TIBET now boots from ' +
        CLI.getVirtualPath(infroot) + '.');

    return 0;
};


module.exports = Cmd;

}());
