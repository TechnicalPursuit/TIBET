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
    Cmd;

CLI = require('./_cli');

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
        'boolean': ['minify', 'raw', 'all', 'zipped'],
        'string': ['tibet'],
        'default': {
            all: true,
            minify: true,
            tibet: 'base'
        }
    },
    Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet freeze [--tibet <bundle>] [--minify] [--all] [--raw] [--zipped]';


//  ---
//  Instance Methods
//  ---

/**
 * Perform the actual command processing logic.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var path,
        sh,

        cmd,
        err,
        app_inf,
        app_npm,
        infroot,
        libbase,
        libsrc,
        srcroot,
        lnflags,
        lnerr,
        file,
        json,
        list,
        bundle;

    path = require('path');
    sh = require('shelljs');

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
    libbase = path.join(app_npm, 'tibet', 'lib');
    if (!sh.test('-e', libbase)) {
        this.error('Cannot find library root: ' + libbase);
        return 1;
    }

    // Make sure we can find the bundled TIBET source packages.
    libsrc = path.join(libbase, 'src');
    if (!sh.test('-e', libsrc)) {
        this.error('Cannot find library source: ' + libsrc);
        this.warn('Run `tibet build` in TIBET library to build packages.');
        return 1;
    }

    //  ---
    //  freeze (aka copy or link)
    //  ---

    infroot = path.join(app_inf, 'tibet');

    //  If the target is a link that's the `tibet init` state, so we'll skip
    //  prompting and move directly to removing it so we can mkdir below.
    if (sh.test('-L', infroot)) {
        err = sh.rm('-rf', infroot);
        if (err) {
            this.error('Error removing target link: ' + err);
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
            if (err) {
                this.error('Error removing target directory: ' + err);
                return 1;
            }
        }
    }

    //  Either it doesn't exist or force is true and it was removed...
    sh.mkdir(infroot);
    err = sh.error();
    if (err) {
        this.error('Error creating target directory: ' + err);
        return 1;
    }

    this.log('freezing packaged library resources...');
    sh.cp('-R', libbase, infroot);
    err = sh.error();
    if (err) {
        this.error('Error cloning ' + libbase + ': ' + err);
        return 1;
    }

    srcroot = path.join(infroot, 'lib', 'src');
    list = sh.ls('-A', srcroot);
    err = sh.error();
    if (sh.error()) {
        this.error('Error listing ' + srcroot + ': ' + err);
        this.warn('Verify `tibet build` has run and built library packages.');
        return 1;
    }

    this.log('freezing library dependencies...');
    sh.cp('-R', path.join(app_npm, 'tibet', 'deps'), infroot);
    err = sh.error();
    if (err) {
        this.error('Error cloning tibet/deps: ' + err);
        return 1;
    }

    this.log('freezing library support resources...');
    sh.cp('-R', path.join(app_npm, 'tibet', 'etc'), infroot);
    err = sh.error();
    if (err) {
        this.error('Error cloning tibet/etc: ' + err);
        return 1;
    }

    this.log('freezing standard library docs...');
    sh.cp('-R', path.join(app_npm, 'tibet', 'doc'), infroot);
    err = sh.error();
    if (err) {
        this.error('Error cloning tibet/doc: ' + err);
        return 1;
    }

    if (this.options.raw) {
        this.log('freezing raw library source...');
        sh.cp('-R', path.join(app_npm, 'tibet', 'src'), infroot);
        err = sh.error();
        if (err) {
            this.error('Error cloning tibet/src: ' + err);
            return 1;
        }

        this.log('freezing raw library tests...');
        sh.cp('-R', path.join(app_npm, 'tibet', 'test'), infroot);
        err = sh.error();
        if (err) {
            this.error('Error cloning tibet/test: ' + err);
            return 1;
        }

        this.log('freezing raw library demos...');
        sh.cp('-R', path.join(app_npm, 'tibet', 'demo'), infroot);
        err = sh.error();
        if (err) {
            this.error('Error cloning tibet/demo: ' + err);
            return 1;
        }
    } else {
        this.log('freezing developer boot resources...');
        sh.mkdir('-p', path.join(infroot, 'src', 'tibet', 'boot'));
        sh.cp('-R', path.join(app_npm, 'tibet', 'src', 'tibet', 'boot'),
            path.join(infroot, 'src', 'tibet'));
        err = sh.error();
        if (err) {
            this.error('Error cloning tibet boot: ' + err);
            return 1;
        }

        this.log('freezing developer tool resources...');
        sh.mkdir('-p', path.join(infroot, 'src', 'tibet', 'tools'));
        sh.cp('-R', path.join(app_npm, 'tibet', 'src', 'tibet', 'tools'),
            path.join(infroot, 'src', 'tibet'));
        err = sh.error();
        if (err) {
            this.error('Error cloning tibet tools: ' + err);
            return 1;
        }
    }

    //  Raw or not, we need to link a node_modules reference from TIBET into
    //  location so things like `tibet test` and `tibet reflect` will run on a
    //  frozen project.
    lnflags = '-s';
    if (this.options.force) {
        lnflags += 'f';
    }

    //  We want the project's node_modules/tibet/node_modules dir linked into
    //  place so CLI commands consistently find their dependencies.
    sh.ln(lnflags, path.join(app_npm, 'tibet', 'node_modules'),
        path.join(infroot, 'node_modules'));
    lnerr = sh.error();
    if (lnerr) {
        this.error('Error relinking npm resources: ' + lnerr);
    }

    //  ---
    //  prune unwanted/unused files
    //  ---

    if (!this.options.all) {

        this.log('pruning unnecessary source rollups...');

        bundle = this.options.tibet;

        list.forEach(function(fname) {

            // TODO: come up with a better solution. For now the one file we
            // don't want to remove by default is tibet_developer.min.js
            // since the various tsh-related commands use that one.
            if (/tibet_developer\.min\.js/.test(fname)) {
                if (/\.gz$/.test(fname)) {
                    sh.rm('-f', path.join(srcroot, fname));
                }
                return;
            }

            // Remove any minified/unminified copies we don't want.
            if (cmd.options.minify) {
                if (/\.min\./.test(fname) !== true) {
                    sh.rm('-f', path.join(srcroot, fname));
                }
            } else {
                if (/\.min\./.test(fname) === true) {
                    sh.rm('-f', path.join(srcroot, fname));
                }
            }

            // Remove any zipped/unzipped copies we don't want.
            if (cmd.options.zipped) {
                if (/\.gz$/.test(fname) !== true) {
                    sh.rm('-f', path.join(srcroot, fname));
                }
            } else {
                if (/\.gz$/.test(fname) === true) {
                    sh.rm('-f', path.join(srcroot, fname));
                }
            }

            // Never prune any remaining hook or loader file.
            if (/_hook\./.test(fname) || /_loader\./.test(fname)) {
                return;
            }

            // Note that when raw is specified no copies of bundled code are
            // kept, only the hook and loader files which are always pulled from
            // bundles.
            if (cmd.options.raw) {
                sh.rm('-f', path.join(srcroot, fname));
            } else if (fname.indexOf('tibet_' + bundle + '.') === -1) {
                sh.rm('-f', path.join(srcroot, fname));
            }
        });
    }

    //  ---
    //  update lib_root
    //  ---

    this.log('updating embedded lib_root references...');

    list = sh.find('.').filter(function(fname) {
        return !fname.match('node_modules/tibet') &&
            !fname.match('TIBET-INF/tibet');
    });
    list = sh.grep('-l', 'node_modules/tibet', list);

    list.split('\n').forEach(function(fname) {
        if (fname) {
            sh.sed('-i', /node_modules\/tibet/g, 'TIBET-INF/tibet', fname);
        }
    });

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
    CLI.beautify(JSON.stringify(json)).to(file);

    this.info('Application frozen. TIBET now boots from ' +
        CLI.getVirtualPath(infroot) + '.');

    return 0;
};


module.exports = Cmd;

}());
