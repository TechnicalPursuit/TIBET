//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The 'tibet init' command. Ensures package dependencies are
 *     properly installed and linked for TIBET project operation. The setup
 *     done by this command is designed to work effectively with the tibet
 *     freeze and thaw logic which toggle projects from linked use of TIBET
 *     via the node_modules directory to using TIBET-INF/tibet references.
 *
 *     NOTE that this command does a few things differently than you might
 *     expect, largely due to https://github.com/npm/npm/issues/10343.
 *     As that issue describes, using npm link in certain scenarios can
 *     corrupt the linked package's node_modules directory due to npm's
 *     flattening process. We try to minimize that effect in tibet init.
 */
//  ========================================================================

/* eslint indent:0, consistent-this:0 */

(function() {

'use strict';

var CLI,
    Cmd,
    fs,
    path;


CLI = require('./_cli');
path = require('path');
fs = require('fs');

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
 * The context viable for this command.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.INSIDE;

/**
 * The command name for this type.
 * @type {string}
 */
Cmd.NAME = 'init';

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
        'boolean': ['static'],
        'default': {
        }
    },
    Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet init [--static]';


//  ---
//  Instance Methods
//  ---

/**
 * Runs the command. For this type the goal is to provide easy startup of the
 * local TIBET server.
 * @returns {Number} A return code. Non-zero indicates an error.
 */
Cmd.prototype.execute = function() {

    var sh,     // The shelljs module.
        child,  // The child_process module.
        cmd,    // Closure'd var providing access to the command object.
        dna,
        wrapup,
        pkgpath,
        version,
        data,
        libbase,
        npmbase,
        lnflags,
        cperr,
        lnerr,
        rmerr;

    cmd = this;

    sh = require('shelljs');
    child = require('child_process');

    // We can only start if we're in a top-level Node.js project directory.
    if (!sh.test('-f', 'package.json')) {
        this.error(
            'Cannot init. No package.json found. Are you in a project?');
        return 1;
    }

    lnflags = '-s';
    if (this.options.force) {
        lnflags += 'f';
    }

    wrapup = function() {
        //  We also link TIBET library code into the TIBET-INF location
        //  to avoid pointing down into node_modules or having
        //  node_modules be a location potentially pushed to a remote
        //  deployment target.

        /*
        sh.ln(lnflags, path.join(
            CLI.expandPath(CLI.getAppHead()), 'node_modules/tibet'),
            path.join(
            CLI.expandPath(CLI.getAppRoot()), 'TIBET-INF/tibet'));
        */

        //  NB: The source path to the command here is used as a raw argument.
        //  In other words, the '../..' is *not* evaluated against the current
        //  working directory. It is used as is to create the link.
        fs.symlinkSync('../../node_modules/tibet',
                        'public/TIBET-INF/tibet');

        lnerr = sh.error();
        if (lnerr) {
            cmd.error('Error linking library launch directory: ' +
                lnerr);
        } else {
            cmd.log('TIBET development dependency linked.');
        }

        cmd.log('project initialized successfully.');
        cmd.info(
            'Use `tibet lint` to check for coding standard violations\n' +
            'Use `tibet test` to test your application\'s core features\n' +
            'Use `tibet build` to build production packages for deployment\n' +
            'Use `tibet start` to run your application.');
    };

    // If the node_modules directory doesn't exist (but we know there's a
    // package.json due to earlier check) it means 'npm install' was never run.
    // We have to do that before we can try to start the server.
    if (sh.test('-e', 'node_modules')) {
        if (!this.options.force) {
            this.warn('Project already initialized. ' +
                'Use --force to re-initialize.');
            return 1;
        }
        this.warn('--force specified...removing and rebuilding node_modules.');
        rmerr = sh.rm('-rf', 'node_modules');
        if (rmerr) {
            this.error('Error removing node_modules directory: ' + rmerr);
            return 1;
        }
    }

    dna = this.getcfg('tibet.dna');
    if (CLI.notEmpty(dna)) {
        dna = dna.slice(dna.lastIndexOf(path.sep) + 1);
        cmd.info('Initializing new \'' + dna + '\' project ' +
            this.getcfg('npm.name') + '...');
    } else {
        cmd.info('Initializing new project...');
    }

    cmd.log('installing package.json modules via `npm install`.');

    //  ---
    //  version capture (do this first)
    //  ---

    if (this.options.static) {
        pkgpath = path.join(__dirname, '../../../package.json');
        if (sh.test('-e', pkgpath)) {
            try {
                data = require(pkgpath);
            } catch (e) {
                cmd.error('Invalid library package.json: ' + e.message);
                return 1;
            }
            version = data.version;
        } else {
            cmd.error('Unable to find library package.json at ' + pkgpath);
            return 1;
        }
    }

    //  ---
    //  cleanse package.json
    //  ---

    //  For performance reasons and to avoid potential issues with #10343 we
    //  remove any references to the library in package.json. If we're using
    //  the static flag they'll be re-injected _after_ npm install.
    try {
        pkgpath = path.join(CLI.expandPath('~'), 'package.json');
        data = require(pkgpath);
    } catch (e) {
        cmd.error('Invalid project package.json: ' + e.message);
        return 1;
    }

    try {
        delete data.dependencies.tibet;
        delete data.devDependencies.tibet;
    } catch (e) {
        void 0;
    }

    CLI.beautify(JSON.stringify(data)).to(pkgpath);

    //  ---
    //  npm install...etc.
    //  ---

    child.exec('npm install', function(err, stdout, stderr) {

        if (err) {
            cmd.error('Failed to initialize: ' + stderr);
            throw new Error();
        }

        if (cmd.options.static) {

            cmd.log('installing static TIBET version ' + version +
                ' via `cp -R`.');

            //  Locate the library path, and normalize to lowercase to match
            //  standard npm expectations.
            libbase = path.join(__dirname, '../../..');
            libbase = libbase.replace(/\/TIBET$/, '/tibet');

            npmbase = CLI.expandPath('~app_npm');

            //  We already have a global installation, we can just copy that
            //  into place rather than undergoing all the npm overhead again.
            sh.cp('-R', libbase, npmbase);
            cperr = sh.error();
            if (cperr) {
                cmd.error('Error cloning ' + libbase + ': ' + cperr);
                return 1;
            }

            //  Save version into package.json for reference etc.
            data.dependencies.tibet = version;
            CLI.beautify(JSON.stringify(data)).to(pkgpath);

            wrapup();

        } else {

            //  We normally rely on link which gives us a dynamic link to
            //  whatever is currently in place as the global install of TIBET.
            cmd.log('linking TIBET into project via `npm link tibet`.');

            child.exec('npm link tibet', function(linkerr, linkstdout, linkstderr) {

                if (linkerr) {
                    cmd.error('Failed to initialize: ' + linkstderr);
                    cmd.warn(
                        '`git clone` TIBET 5.x, `npm link .` it, and retry.');
                    throw new Error();
                }

                wrapup();
            });
        }
    });

    return 0;
};

module.exports = Cmd;

}());

