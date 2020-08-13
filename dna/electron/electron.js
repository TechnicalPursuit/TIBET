//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview The main Electron application file for a TIBET-based project.
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

    app = electron.app,                     //  Module to control application
                                            //  life.
    dialog = electron.dialog,               //  Module to create dialog.
    Menu = electron.Menu,                   //  Module to manage menus.
    BrowserWindow = electron.BrowserWindow, //  Module to create browser window.
    PARSE_OPTIONS = CLI.PARSE_OPTIONS;

//  Keep a global reference of the window object, if you don't, the window will
//  be closed automatically when the JavaScript object is garbage collected.
let configure,
    createWindow,
    setupAppMenu,
    mainWindow,
    logger,
    options,
    pkg,
    json,
    electronOpts,
    scraping;

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

    scraping = electronOpts.scraping;
    if (!scraping) {
        scraping = false;
    }
};

//  ---

/**
 * Primary function used to launch Electron. Marshals command line arguments as
 * well as any tibet.json "electron" options to configure the main window and
 * load the targeted URI.
 */
createWindow = function() {
    let builddir,
        fileUrl,
        paramStr,
        profile,
        defaultProfile;

    //  Verify build directory and add a development profile if not found.
    builddir = pkg.expandPath('~app_build');
    if (!sh.test('-d', builddir)) {

        //  Can't load a production profile...nothing's built.
        logger.warn('No build directory. Must use a development boot.profile.');
        logger.warn('Run `tibet build` to create your app\'s production build.');

        //  No build directory - set the default to be development@developer.
        defaultProfile = 'development@developer';
    } else {
        //  Found build directory - set the default to be main@base.
        defaultProfile = 'main@base';
    }

    //  Don't replace existing...but ensure default profile as a base default.
    profile = electronOpts['boot.profile'];
    if (!profile) {
        electronOpts['boot.profile'] = defaultProfile;
        logger.warn('No boot.profile. Forcing boot.profile ' + defaultProfile);
    }

    //  and load the index.html of the app.
    fileUrl = 'file://' + __dirname + '/index.html';

    //  Loop over params and add them to the URL
    paramStr = '';
    Object.keys(electronOpts).forEach(function(item) {
        if (electronOpts[item] === true) {
            paramStr += item + '&';
        } else {
            paramStr += item + '=' + electronOpts[item] + '&';
        }
    });

    if (paramStr.length > 0) {
        fileUrl += '#?' + paramStr.slice(0, -1);
    }

    //  Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            preload: CLI.joinPaths(__dirname, './preload.js'),
            webSecurity: scraping ? false : true,
            nodeIntegration: false,
            enableRemoteModule: false,
            contextIsolation: true
        }
    });

    mainWindow.loadURL(fileUrl);

    //  NOTE this is a TIBET-specific if block. The `tibet electron` command
    //  will pass --devtools along so this flag is set, otherwise it's likely
    //  not there.
    if (process.argv.indexOf('--devtools') !== -1) {
        //  Open the DevTools.
        mainWindow.webContents.openDevTools();
    }

    //  If we're configured for scraping, then remove 'x-frame-options' headers
    //  from network responses that this window is managing.
    if (scraping) {
        //  It is important when performing tasks like scraping web pages, to
        //  ignore the 'x-frame-options' header and allow access to iframe
        //  content.
        mainWindow.webContents.session.webRequest.onHeadersReceived(
            function(details, callback) {
                var entries;

                //  Filter out the 'x-frame-options' header.
                entries = Object.entries(details.responseHeaders).filter(
                            function(header) {
                                return !/x-frame-options/i.test(header[0]);
                            });

                callback({
                    responseHeaders: Object.fromEntries(entries)
                });
        });
    }

    //  Log client console to main console...
    mainWindow.webContents.on('console-message',
    function(event, level, message, line, sourceId) {
        //  Use process.stdout here to avoid extra newlines in output stream.
        if (options.verbose) {
            process.stdout.write(message);
        }
    });

    //  Main window event handlers

    //  Event emitted when the user tries to quit or close the main window
    //  running TIBET. Note that the code in TIBET has a special case for the
    //  'onbeforeunload' event handler for Electron that always returns a value
    //  that causes this event to be thrown.
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

    //  Emitted when the window is closed.
    mainWindow.on('closed',
        function() {
            //  Dereference the window object, usually you would store windows
            //  in an array if your app supports multi windows, this is the time
            //  when you should delete the corresponding element.
        mainWindow = null;
    });
};

//  ---

/**
 * Function to set up the App menu.
 */

setupAppMenu = function() {

    var appMenuTemplate,
        menu;

    appMenuTemplate = [
        {
            label: app.getName(),
            submenu: [
                {
                    role: 'about'
                },
                {
                    label: 'Version ' + app.getVersion(), enabled: false
                },
                {
                    id: 'updater',
                    label: 'Check for updates',
                    enabled: false,
                    click: () => {
                        mainWindow.webContents.send(
                            'TP.sig.CheckForUpdate', false);
                    }
                },
                {
                    type: 'separator'
                },
                {
                    role: 'services'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'hide'
                },
                {
                    role: 'hideothers'
                },
                {
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'quit'
                }
            ]
        }
    ];

    menu = Menu.buildFromTemplate(appMenuTemplate);
    Menu.setApplicationMenu(menu);
};

//  ---

/*
 * Configure the environment
 */
configure();

//  ---
//  Set main process configuration
//  ---

/*
 * Set this flag to true for forward compatibility (and to quiet log messages).
 */
app.allowRendererProcessReuse = true;

/*
 * If we're scraping, add a command line switch (to command line of the embedded
 * Chrome engine) to bypass Chrome's site isolation testing.
 */
if (scraping) {
    app.commandLine.appendSwitch('disable-site-isolation-trials');
}


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
//  Application object event handlers
//  ---

/**
 * Event emitted when Electron has finished initialization and is ready to
 * create browser windows. Some APIs can only be used after this event occurs.
 */
app.on('ready',
        function() {
            createWindow();
            setupAppMenu();
        });


//  ---

/**
 * Event emitted when all windows are closed.
 */
app.on('window-all-closed', function() {
    //  On OS X it is common for applications and their menu bar
    //  to stay active until the user quits explicitly with Cmd + Q.
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


//  ---

/**
 * Event emitted when the user launches the app, clicks on the Mac OS X dock or
 * Windows taskbar or tries to relaunch when already running.
 */
app.on('activate', function() {
    //  On OS X it's common to re-create a window in the app when the
    //  dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

}());
