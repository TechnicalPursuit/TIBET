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
 *     bringing over dependencies which aren't needed for deployment.
 */
//  ========================================================================

/*eslint indent:0*/

(function() {

'use strict';

var CLI,
    beautify,
    Parent,
    Cmd;


CLI = require('./_cli');
beautify = require('js-beautify').js_beautify;


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
'Freezes the current application\'s TIBET library in ~app_inf.\n\n' +

'By default ~app_inf refers to TIBET-INF, the default location for\n' +
'package data, custom commands, etc. TIBET is configured to allow\n' +
'a version of TIBET to be frozen into TIBET-INF/tibet rather than\n' +
'in node_modules/tibet to support deployments where the use of the\n' +
'node_modules directory would be unnecessary or excessive.\n\n' +

'Flags allow you to control the scope of what is frozen. Since the\n' +
'freeze command is only concerned with the TIBET library these flags\n' +
'focus on whether you want minified TIBET bundles, all TIBET bundles,\n' +
'raw source for dynamic development, or some combination of those.\n\n' +

'The --tibet parameter takes a bundle name minus any tibet_ prefix\n' +
'For example, \'--tibet full\' will freeze the tibet_full bundle.\n' +
'This flag defaults to the value \'base\' so tibet_base is frozen.\n\n' +

'The --minify flag controls whether you freeze minified source code\n' +
'and is used in conjunction with the --tibet flag to filter bundles.\n' +
'The default value is true, so only minified code is frozen by default.\n\n' +

'The --zipped flag controls whether zipped copies are preserved or\n' +
'pruned. This flag works after any minify processing so if you set both\n' +
'minify and zipped you will retain .min.js.gz files.\n\n' +

'The --all flag overrides any filtering of bundle content and preserves\n' +
'all bundles of TIBET source found in the ~lib_build directory.\n\n' +

'The --raw flag causes the current TIBET source tree to be copied into\n' +
'the target directory. This option supports dynamic development with\n' +
'TIBET source code but does have a performance impact.\n\n';

'Using \ttibet freeze\' without parameters will freeze the current copy\n' +
'of tibet_base.min.js along with the load and hook files needed to boot.\n\n';


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
    Parent.prototype.PARSE_OPTIONS);
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

    // Construct the target location for TIBET code.
    infroot = path.join(app_inf, 'tibet');
    sh.mkdir(infroot);
    err = sh.error();
    if (err) {
        if (!this.options.force) {
            if (/already exists/i.test(err)) {
                this.warn('Project already frozen. Use --force to re-freeze.');
            } else {
                this.error('Error creating target directory. ' +
                    'Use --force to attempt to rebuild.');
            }
            return 1;
        }
        this.warn('--force specified, cleansing/rebuilding target directory.');
        err = sh.rm('-rf', infroot);
        if (err) {
            this.error('Error removing target directory: ' + err);
            return 1;
        }
        sh.mkdir(infroot);
        err = sh.error();
        if (err) {
            this.error('Error creating target directory: ' + err);
            return 1;
        }
    }

    //  ---
    //  freeze (aka copy)
    //  ---

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

    this.log('freezing runtime library resources...');
    sh.cp('-R', path.join(app_npm, 'tibet', 'etc'), infroot);
    err = sh.error();
    if (err) {
        this.error('Error cloning tibet/etc: ' + err);
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
    } else {
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

    //  ---
    //  prune unwanted/unused files
    //  ---

    if (!this.options.all) {

        this.log('pruning unnecessary source rollups...');

        bundle = this.options.tibet;

        list.forEach(function(fname) {

            // TODO: come up with a better solution. For now the one file we
            // don't want to remove by default is tibet_developer.min.js since
            // the various phantomjs commands use that one.
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
            // bundles. (NOTE phantom-based commands retain tibet_developer).
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
    beautify(JSON.stringify(json)).to(file);


    this.info('Application frozen. TIBET now boots from ' + infroot + '.');
};


module.exports = Cmd;

}());
