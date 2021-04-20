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
 * The context viable for this command.
 * @type {Cmd.CONTEXTS}
 */
Cmd.CONTEXT = CLI.CONTEXTS.ANY;

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
Cmd.prototype.PARSE_OPTIONS = CLI.blend({
    boolean: ['force', 'freeze', 'tibet'],
    default: {
    }
},
Cmd.Parent.prototype.PARSE_OPTIONS);
/* eslint-enable quote-props */


/**
 * The command usage string.
 * @type {string}
 */
Cmd.prototype.USAGE = 'tibet init [--freeze] [--force] [--tibet]';


//  ---
//  Instance Methods
//  ---

/**
 * Runs the command. For this type the goal is to provide easy startup of the
 * local TIBET server.
 * @returns {Number|Promise} The return code produced by running the command (a
 *     non-zero indicates an Error) or a Promise that resolves when the command
 *     finishes.
 */
Cmd.prototype.execute = function() {

    var sh,     // The shelljs module.
        child,  // The child_process module.
        cmd,    // Closure'd var providing access to the command object.
        dna,
        wrapup,
        str,
        pkgpath,
        version,
        data,
        libbase,
        npmbase,
        cperr,
        rmerr;

    cmd = this;

    if (!CLI.inProject()) {
        return this.initTIBET();
    }

    sh = require('shelljs');
    child = require('child_process');

    cmd.debug('head: ' + CLI.getAppHead());
    cmd.debug('root: ' + CLI.expandPath(CLI.getAppRoot()));
    cmd.debug('inf: ' + CLI.expandPath('~app_inf'));
    cmd.debug('node: ' + CLI.getNpmPath());

    // We can only start if we're in a top-level Node.js project directory.
    if (!sh.test('-f', CLI.NPM_FILE)) {
        this.error(
            'No ' + CLI.NPM_FILE +
            ' in current directory. Are you in a project root?');
        return 1;
    }

    wrapup = function() {

        var infpath,
            toppath,
            npmpath,
            steps,
            linkfrom,
            linkto,
            lnerr,
            i;

        //  We also link TIBET library code into the TIBET-INF location
        //  to avoid pointing down into node_modules or having
        //  node_modules be a location potentially pushed to a remote
        //  deployment target.

        //  find the inf directory (TIBET-INF usually) so we can compute
        //  proper relative path (NOTE: not all projects have a 'public'
        //  segment, only those with a TDS which serves files.)
        toppath = CLI.expandPath('~');
        infpath = CLI.expandPath('~app_inf');
        npmpath = CLI.getNpmPath();

        cmd.debug('toppath: ' + toppath);
        cmd.debug('infpath: ' + infpath);
        cmd.debug('npmpath: ' + npmpath);

        //  We'll ultimately need to use the distance from the INF directory to
        //  the shared root as the offset "count" e.g. how many ".." segments do
        //  we need?
        infpath = infpath.replace(toppath, '').slice(1); // slice off '/'
        npmpath = npmpath.replace(toppath, '').slice(1); // slice off '/'

        //  something like public/TIBET-INF/tibet
        linkfrom = CLI.joinPaths(infpath, 'tibet');
        //  something like node_modules/tibet
        linkto = CLI.joinPaths(npmpath, 'tibet');

        steps = linkfrom.split('/').length - linkto.split('/').length + 1;

        for (i = 0; i < steps; i++) {
            linkto = CLI.joinPaths('..', linkto);
        }

        cmd.debug('linkfrom: ' + linkfrom);
        cmd.debug('linkto: ' + linkto);
        cmd.debug('steps: ' + steps);

        if (sh.test('-e', linkfrom)) {
            if (!cmd.options.force) {
                //  not being asked to force-rebuild the link
                cmd.warn(infpath + ' exists. skipping link without --force.');
                return;
            }

            //  force the link by removing here and falling through...
            lnerr = sh.rm('-f', linkfrom);
            if (sh.error()) {
                cmd.error('Error removing ' + linkfrom + ': ' + lnerr.stderr);
                return 1;
            }
        }

        //  NB: The source path to the command here is used as a raw argument.
        //  In other words, the '../..' is *not* evaluated against the current
        //  working directory. It is used as is to create the link.
        lnerr = sh.ln('-sf', linkto, linkfrom);
        if (sh.error()) {
            cmd.error('Error linking library launch directory: ' + lnerr.stderr);
            return 1;
        }

        cmd.log('TIBET development dependency linked.');

        cmd.log('project initialized successfully.');
        cmd.info(
            'Use `tibet lint` to check for coding standard violations\n' +
            'Use `tibet test` to test your application\'s core features\n' +
            'Use `tibet build --minify` to build production packages for' +
            ' deployment\n' +
            'Use `tibet start` to run your application.');
    };

    //  ---

    //  If we're being asked to initialize but node_modules already exists we
    //  need to check to see whether we need to require a 'force' or not...
    if (sh.test('-e', CLI.MODULE_FILE)) {

        //  If tibet directory is in place it's not unlinked by npm so we want
        //  to request a specific '--force' flag before we reinitialize.
        if (sh.test('-e', CLI.joinPaths(CLI.MODULE_FILE, 'tibet'))) {

            if (!this.options.force) {
                this.warn('Project already initialized. ' +
                    'Use --force to re-initialize.');
                return 1;
            }

            this.warn('--force specified...removing and rebuilding dependencies.');
            rmerr = sh.rm('-rf', CLI.MODULE_FILE);
            if (sh.error()) {
                this.error('Error removing ' + CLI.MODULE_FILE +
                    ' directory: ' + rmerr.stderr);
                return 1;
            }
            rmerr = sh.rm('-rf', CLI.NPM_LOCK_FILE);
            if (sh.error()) {
                this.error('Error removing ' + CLI.NPM_LOCK_FILE +
                    ' file: ' + rmerr.stderr);
                return 1;
            }
        } else {
            //  node_modules exists but not tibet package...npm unlinked
            //  it...probably during a npm 5+ install of a new package.
            //  fall through and let the command continue without a force.
        }
    }

    dna = this.getcfg('tibet.dna');
    if (CLI.notEmpty(dna)) {
        dna = dna.slice(dna.lastIndexOf('/') + 1);
        cmd.info('Initializing \'' + this.getcfg('npm.name') +
            '\' project with \'' + dna + '\' dna...');
    } else {
        cmd.info('Initializing project...');
    }

    cmd.log('installing project dependencies via `npm install`...');

    //  ---
    //  version capture (do this first)
    //  ---

    if (this.options.freeze) {
        //  NOTE this is looking for the TIBET library package.json, not an
        //  application/project one so we root from __dirname and climb up.
        pkgpath = CLI.joinPaths(__dirname, '..', '..', '..', CLI.NPM_FILE);
        if (sh.test('-e', pkgpath)) {
            try {
                data = require(pkgpath);
            } catch (e) {
                cmd.error('Invalid library ' + CLI.NPM_FILE + ': ' + e.message);
                return 1;
            }
            version = data.version;
        } else {
            cmd.error('Unable to find library ' + CLI.NPM_FILE +
                ' at ' + pkgpath);
            return 1;
        }
    }

    //  ---
    //  cleanse package.json
    //  ---

    //  For performance reasons and to avoid potential issues with #10343 we
    //  remove any references to the library in package.json. If we're using
    //  the freeze flag they'll be re-injected _after_ npm install.
    try {
        pkgpath = CLI.joinPaths(CLI.expandPath('~'), CLI.NPM_FILE);
        data = require(pkgpath);
    } catch (e) {
        cmd.error('Invalid project ' + CLI.NPM_FILE + ': ' + e.message);
        return 1;
    }

    try {
        delete data.dependencies.tibet;
        delete data.devDependencies.tibet;
    } catch (e) {
        void 0;
    }

    str = CLI.beautify(JSON.stringify(data));
    new sh.ShellString(str).to(pkgpath);


    //  ---
    //  npm install...etc.
    //  ---

    child.exec('npm install', function(err, stdout, stderr) {

        if (err) {
            cmd.error('Failed to initialize: ' + stderr);
            throw new Error();
        }

        if (cmd.options.freeze) {

            cmd.log('installing TIBET version ' + version +
                ' via `cp -R`.');

            //  Locate the library path, and normalize to lowercase to match
            //  standard npm expectations.
            libbase = CLI.joinPaths(__dirname, '..', '..', '..');
            libbase = libbase.replace(/\/TIBET$/, '/tibet');

            npmbase = CLI.expandPath('~app_npm');

            //  We already have a global installation, we can just copy that
            //  into place rather than undergoing all the npm overhead again.
            cperr = sh.cp('-Rn', CLI.joinPaths(libbase, '*'), npmbase);
            if (sh.error()) {
                cmd.error('Error cloning ' + libbase + ': ' + cperr.stderr);
                return 1;
            }

            //  Save version into package.json for reference etc.
            data.dependencies.tibet = version;

            str = CLI.beautify(JSON.stringify(data));
            new sh.ShellString(str).to(pkgpath);

            wrapup();

        } else {

            //  We normally rely on link which gives us a dynamic link to
            //  whatever is currently in place as the global install of TIBET.
            cmd.log('linking TIBET into project via `npm link tibet`.');

            child.exec('npm link tibet', function(linkerr, linkstdout, linkstderr) {

                if (linkerr) {
                    cmd.error('Failed to initialize: ' + linkstderr);
                    cmd.warn(
                        '`git clone` TIBET, `npm link .` it, and retry.');
                    throw new Error();
                }

                wrapup();
            });
        }
    });

    return 0;
};


/**
 * A special-case process run when initially installing TIBET. This command
 * implements the work-arounds necessary to have a global install that has
 * devDependencies when using npm.
 */
Cmd.prototype.initTIBET = function() {
    var path,
        sh,
        cwd,
        cmd,
        script,
        result,
        npmdir,
        initFile,
        rmpath;

    sh = require('shelljs');
    path = require('path');

    cmd = this;

    cmd.info('Initializing TIBET installation...');

    //  Capture current directory so we can move without losing our place.
    cwd = process.cwd();
    cmd.debug('cwd: ' + cwd);

    try {
        //  Get the global npm installation location for TIBET
        //  cd "$(npm root -g)/tibet"
        script = 'npm root -global';
        result = sh.exec(script, {silent: true});
        if (sh.error()) {
            cmd.error('Error determining global npm location:\n' +
                result.stderr);
            return 1;
        }

        npmdir = CLI.joinPaths(result.stdout.trim(), 'tibet');
        cmd.debug('npmdir: ' + npmdir);
        result = sh.test('-d', npmdir);
        if (result) {
            cmd.info('Found TIBET in: ' + npmdir);
        } else {
            cmd.error('Unable to locate TIBET installation.');
            return 1;
        }

        //  Test for "have we done this already" indicator
        initFile = CLI.joinPaths(npmdir, '.tibet_initialized');
        if (!this.options.force) {
            result = sh.test('-e', initFile);
            if (result) {
                cmd.info('TIBET installation already initialized.');
                return 0;
            }
        }

        process.chdir(npmdir);

        //  Remove any nested git repository references which might be
        //  lying about due to how some dependencies "manage" their repo
        //  rm -rf ./node_modules/*/.git/
        rmpath = CLI.joinPaths(npmdir, 'node_modules', '*', '.git');
        cmd.debug('rmpath: ' + rmpath);

        cmd.info('Preparing for initialization...');

        result = sh.rm('-rf', rmpath);
        if (sh.error()) {
            cmd.error('Error preparing for dependency installation:\n' +
                result.stderr);
            return 1;
        }

        //  NOTE: we're not setting npm user here. If for any reason the next
        //  step fails it's typically because the user has global installs set
        //  such that they require root access. That's a config they should be
        //  encouraged to change rather than us forcing root access.

        //  Now run an 'npm install' to force devDependencies to install
        //  npm install
        script = 'npm install';
        cmd.info('Installing dependencies. This may take a moment...');
        result = sh.exec(script, {silent: true});
        if (sh.error()) {
            cmd.error('Error installing dependencies:\n' + result.stderr);
            return 1;
        }

        //  "touch" a .initialized file to show we've done this
        new sh.ShellString(Date.now().toString()).to(initFile);

        cmd.info('TIBET initialization complete.');

    } finally {
        process.chdir(cwd);
        cmd.debug('cwd: ' + process.cwd());
    }
};


module.exports = Cmd;

}());

