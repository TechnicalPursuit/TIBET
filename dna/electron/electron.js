//  ========================================================================
/**
 * @overview The main Electron application file for a TIBET-based project.
 *     This file handles command line argument and package configuration to
 *     support and manage the Electron main process. The Electron renderer
 *     process ends up running the TIBET client.
 */
//  ========================================================================

/* eslint indent:0 no-console:0 */

(function() {

'use strict';

const electron = require('electron'),
    sh = require('shelljs'),
    minimist = require('minimist'),

    CLI = require('./TIBET-INF/tibet/src/tibet/cli/_cli'),
    Logger = require('./TIBET-INF/tibet/etc/common/tibet_logger'),
    Package = require('./TIBET-INF/tibet/etc/common/tibet_package.js'),

    app = electron.app,                     //  Module to control application
    ipcMain = electron.ipcMain,             //  Module to communicate with
                                            //  renderer processes over IPC.
    PARSE_OPTIONS = CLI.PARSE_OPTIONS;

//  Keep a global reference of the window object, if you don't, the window will
//  be closed automatically when the JavaScript object is garbage collected.
var loadPlugins,
    configure,
    pkg,
    logger;

//  ---
//  Main Functions
//  ---

loadPlugins = function(rootpath, plugins, options) {

    plugins.forEach(function(plugin) {
        var fullpath,
            meta;

        meta = {
            comp: 'Electron',
            type: 'plugin',
            name: plugin
        };

        fullpath = CLI.joinPaths(rootpath, plugin);

        //  Skip directories
        if (sh.test('-d', fullpath)) {
            return;
        }

        //  Once logger is set we can start asking for contextual loggers.
        if (logger) {
            //  options.logger = logger.getContextualLogger(meta);
            //  logger.system('loading plugins', meta);
        }

        try {
            require(fullpath)(options);
        } catch (e) {
            if (logger) {
                logger.error(e.message, meta);
            } else {
                console.error(e.message);
                console.error(e.stack);
            }

            throw e;
        }
    });
};

//  ---

/**
 * Primary function used to launch Electron. Marshals command line
 * arguments as well as any tibet.json "electron" options to configure
 * the main window and load the targeted URI.
 */
configure = function() {

    var argv,
        opts,
        plugins,
        json,

        profile,
        profileDefined,

        builddir,
        hasBuildDir,

        bootPkg,
        bootCfg,

        inDeveloperMode,

        scraping;

    //  Slice off first "arg" since it's the Electron executable.
    argv = minimist(process.argv.slice(1), PARSE_OPTIONS) || {_: []};
    pkg = new Package(argv);

    //  ---

    //  Shared options which allow modules to essentially share values like the
    //  logger, authentication handler, etc.
    opts = {
        pkg: pkg,
        app: app,
        argv: argv,
        debug: argv.debug,
        verbose: argv.verbose,
        level: argv.level,
        color: argv.color,
        lama: argv.lama
    };

    //  Support logging using standard TIBET logging infrastructure.
    opts.scheme = process.env.TIBET_CLI_SCHEME ||
        pkg.getcfg('cli.color.scheme') || 'ttychalk';
    opts.theme = process.env.TIBET_CLI_THEME ||
        pkg.getcfg('cli.color.theme') || 'default';

    //  ---

    //  Load JSON to acquire any params for the file URL we'll try to launch.
    json = require('./tibet.json');
    pkg.setcfg({electron: json.electron || {}});

    //  ---

    //  Note these are globals so we can share across routines.
    logger = new Logger(opts);
    opts.logger = logger;

    //  ---

    logger.verbose(CLI.beautify(JSON.stringify(pkg.getcfg('electron'))));

    //  ---

    //  Grab the profile specified in the 'tibet.json' file.
    profile = pkg.getcfg('electron.boot.profile');
    profileDefined = CLI.notEmpty(profile);

    //  Verify build directory
    builddir = pkg.expandPath('~app_build');
    hasBuildDir = sh.test('-d', builddir);

    //  If there was no build directory we can't load a production profile...
    //  nothing's built.
    if (!hasBuildDir) {

        logger.warn(
            'No build directory; built application package not available.');
        logger.warn(
            'Run `tibet build` to create your app\'s production package.');

        if (!profileDefined) {
            logger.warn(
                'No boot.profile set. Defaulting to \'development\'.');

            //  No build directory and no defined profile - set the profile to
            //  be 'development'.
            profile = 'development';
        }

    } else {

        if (!profileDefined) {
            logger.warn(
                'No boot.profile set. Defaulting to \'main@base\'.');

            //  Found build directory but no defined profile - set the profile
            //  to be 'main@base'.
            profile = 'main@base';
        }
    }

    if (!profileDefined) {
        pkg.setcfg('electron.boot.profile', profile);
    }

    //  ---

    bootPkg = profile.split('@')[0];
    bootCfg = profile.split('@')[1];

    //  ---

    inDeveloperMode = /development/.test(bootPkg);
    if (inDeveloperMode) {
        if (bootCfg !== 'developer') {
            if (!opts.lama) {
                logger.warn(
                    'Loading a \'development\' boot.profile.\nTo use the' +
                    ' Lama specify \'--lama\'.');
            } else {
                //  The user specified '--lama', but they don't have a bootCfg
                //  that supports that. So we force set it and reparse.
                logger.warn(
                    'Loading a \'development\' boot.profile with \'--lama\'.\n' +
                    'Changing boot profile to: \`development@developer\`.');

                profile = 'development@developer';
                pkg.setcfg('electron.boot.profile', profile);

                bootPkg = profile.split('@')[0];
                bootCfg = profile.split('@')[1];
            }
        }
    }

    //  ---

    logger.system('Using boot profile: ' + profile);

    opts.bootPkg = bootPkg;
    opts.bootCfg = bootCfg;

    //  ---

    scraping = pkg.getcfg('electron.scraping');
    if (!scraping) {
        scraping = false;
    }
    opts.scraping = scraping;

    /*
     * If we're scraping, add a command line switch (to command line of the
     * embedded Chrome engine) to bypass Chrome's site isolation testing.
     */
    if (scraping) {
        app.commandLine.appendSwitch('disable-site-isolation-trials');
    }

    //  ---

    //  Should always be a preload plugin we can load/run ourselves.
    require(CLI.joinPaths(__dirname, 'plugins', 'preload'))(opts);

    plugins = pkg.getcfg('electron.plugins.core');
    if (CLI.notEmpty(plugins)) {
        //  Trigger loading of all the individual plugins in the list.
        loadPlugins(CLI.joinPaths(__dirname, 'plugins'), plugins, opts);
    }
};

//  ---
//  Configure the environment
//  ---

configure();

//  ---
//  Set main process configuration
//  ---

/*
 * Set this flag to true for forward compatibility (and to quiet log messages).
 */
app.allowRendererProcessReuse = true;

//  ---
//  Main process event handlers
//  ---

/**
 * Event emitted when code running in Electron's NodeJS process has thrown an
 * exception that has not been caught and has bubbled all of the way up to the
 * event loop.
 */
process.on('uncaughtException', function(err) {
    var str,
        code;

    code = -1;

    switch (typeof err) {
        case 'object':
            str = err.message + ' (' + err.line + ')';
            code = err.code;
            break;
        default:
            str = err;
            break;
    }

    console.error(str);
    if (app) {
        app.exit(code);
    } else {
        /* eslint-disable no-process-exit */
        process.exit(code);
        /* eslint-enable no-process-exit */
    }
});

//  ---
//  Event handlers defined for use by TIBET
//  NB: These use the new-as-of-Electron-6 'invoke/handle' mechanism where
//  'invoke' returns a Promise.
//  ---

/**
 * Event emitted when TIBET wants the application version.
 */
ipcMain.handle('TP.sig.getAppVersion',
    function() {
        return app.getVersion();
    });

}());
