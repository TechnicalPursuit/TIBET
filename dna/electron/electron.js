//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The main electron application file for a TIBET-based project.
 *     This file handles command line argument and package configuration to
 *     support and manage the Electron main process. The Electron renderer
 *     process ends up running the TIBET client (including Sherpa et. al.).
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

    app = electron.app, // Module to control application life.
    dialog = electron.dialog, // Module to create dialog.
    BrowserWindow = electron.BrowserWindow, // Module to create browser window.
    PARSE_OPTIONS = CLI.PARSE_OPTIONS;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let configure,
    createWindow,
    mainWindow,
    logger,
    options,
    pkg,
    json,
    electronOpts;

//  ---
//  Main Functions
//  ---

configure = function() {

    //  Slice off first "arg" since it's the Electron executable.
    options = minimist(process.argv.slice(1), PARSE_OPTIONS) || {_: []};
    pkg = new Package(options);

    //  Support logging using standard TIBET logging infrastructure.
    options.scheme = process.env.TIBET_CLI_SCHEME ||
        pkg.getcfg('cli.color.scheme') || 'ttychalk';
    options.theme = process.env.TIBET_CLI_THEME ||
        pkg.getcfg('cli.color.theme') || 'default';

    //  Note these are globals so we can share across routines.
    logger = new Logger(options);

    //  Load JSON to acquire any params for the file URL we'll try to launch.
    json = require('./tibet.json');
    electronOpts = json.electron || {};
};

/**
 * Primary function used to launch Electron. Marshals command line arguments as
 * well as any tibet.json "electron" options to configure the main window and
 * load the targeted URI.
 */
createWindow = function() {
    let builddir,
        fileUrl,
        paramStr,
        profile;

    if (!pkg) {
        configure();
    }

    //  Verify build directory and add a development profile if not found.
    builddir = pkg.expandPath('~app_build');
    if (!sh.test('-d', builddir)) {

        //  Can't load a production profile...nothing's built.
        logger.warn('No build directory. Must use a development boot.profile.');
        logger.warn('Run `tibet build` to create your app\'s production build.');

        //  Don't replace existing...but ensure development as a base default.
        profile = electronOpts['boot.profile'];
        if (!profile) {
            electronOpts['boot.profile'] = 'development@developer';
            logger.warn('No boot.profile. Forcing boot.profile ' +
                electronOpts['boot.profile']);
        }
    }

    // and load the index.html of the app.
    fileUrl = 'file://' + __dirname + '/index.html';

    //  Loop over params and add them to the URL
    paramStr = '';
    Object.keys(electronOpts).forEach(function(item) {
        paramStr += item + '=' + electronOpts[item] + '&';
    });

    if (paramStr.length > 0) {
        fileUrl += '#?' + paramStr.slice(0, -1);
    }

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            preload: CLI.joinPaths(__dirname, './preload.js')
        }
    });

    mainWindow.loadURL(fileUrl);

    // NOTE this is a TIBET-specific if block. The `tibet electron` command will
    // pass --devtools along so this flag is set, otherwise it's likely not there.
    if (process.argv.indexOf('--devtools') !== -1) {
        // Open the DevTools.
        mainWindow.webContents.openDevTools();
    }

    //  Log client console to main console...
    mainWindow.webContents.on('console-message',
    function(event, level, message, line, sourceId) {
        //  Use process.stdout here to avoid extra newlines in output stream.
        if (options.verbose) {
            process.stdout.write(message);
        }
    });

    mainWindow.webContents.on('will-prevent-unload',
    function(event) {

        var choice,
            leave;

        choice = dialog.showMessageBoxSync(
                mainWindow,
                {
                    type: 'question',
                    buttons: ['Yes', 'No'],
                    title: 'Confirm',
                    message: 'Are you sure you want to quit?',
                    defaultId: 0,
                    cancelId: 1
                });

        leave = choice === 0;
        if (leave) {
            event.preventDefault();
        }
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
};


//  ---
//  Event Handlers
//  ---

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

/**
 * This method will be called when Electron has finished initialization and is
 * ready to create browser windows. Some APIs can only be used after this event
 * occurs.
 */
app.on('ready', createWindow);


/**
 * Quit when all windows are closed.
 */
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


/**
 *
 */
app.on('activate', function() {

    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

}());
