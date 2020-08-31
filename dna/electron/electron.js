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
    autoUpdater = require('electron-updater').autoUpdater,
    sh = require('shelljs'),
    minimist = require('minimist'),
    chokidar = require('chokidar'),
    path = require('path'),

    CLI = require('./TIBET-INF/tibet/src/tibet/cli/_cli'),
    Logger = require('./TIBET-INF/tibet/etc/common/tibet_logger'),
    Package = require('./TIBET-INF/tibet/etc/common/tibet_package.js'),

    app = electron.app,                     //  Module to control application
                                            //  life.
    ipcMain = electron.ipcMain,             //  Module to communicate with
                                            //  renderer processes over IPC.
    dialog = electron.dialog,               //  Module to create dialogs.
    Menu = electron.Menu,                   //  Module to manage menus.
    BrowserWindow = electron.BrowserWindow, //  Module to create browser window.
    Notification = electron.Notification,   //  Module to create notifications.
    PARSE_OPTIONS = CLI.PARSE_OPTIONS;

//  Keep a global reference of the window object, if you don't, the window will
//  be closed automatically when the JavaScript object is garbage collected.
let configure,
    createWindow,
    setupAppMenu,
    setupWatcherCfg,
    activateWatcher,
    mainWindow,
    mainContents,
    logger,
    options,
    pkg,
    json,
    scraping,
    watchcfg,
    watchRoot,
    include;

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
    pkg.setcfg({electron: json.electron || {}});

    logger.verbose(CLI.beautify(JSON.stringify(pkg.getcfg('electron'))));

    scraping = pkg.getcfg('electron.scraping');
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
        defaultProfile,
        electronOpts;

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
    profile = pkg.getcfg('electron.boot.profile');
    if (!profile) {
        pkg.setcfg('electron.boot.profile', defaultProfile);
        logger.warn('No boot.profile. Forcing boot.profile ' + defaultProfile);
    }

    //  and load the index.html of the app.
    fileUrl = 'file://' + __dirname + '/index.html';

    //  Loop over params and add them to the URL
    paramStr = '';
    electronOpts = pkg.getcfg('electron');
    Object.keys(electronOpts).forEach(function(item) {
        let key;

        //  Strip leading 'electron.' so we have the "pure config name".
        key = item.replace('electron.', '');

        //  Only boot.* params go on the TIBET URL we launch from.
        if (key.indexOf('boot.') !== 0) {
            return;
        }

        if (electronOpts[item] === true) {
            paramStr += key + '&';
        } else {
            paramStr += key + '=' + electronOpts[item] + '&';
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

    //  Grab the browser window's web contents which we use a lot below.
    mainContents = mainWindow.webContents;

    logger.verbose('Launching ' + fileUrl);

    mainWindow.loadURL(fileUrl);

    //  NOTE this is a TIBET-specific if block. The `tibet electron` command
    //  will pass --devtools along so this flag is set, otherwise it's likely
    //  not there.
    if (process.argv.indexOf('--devtools') !== -1) {
        //  Open the DevTools.
        mainContents.openDevTools();
    }

    //  If we're configured for scraping, then remove 'x-frame-options' headers
    //  from network responses that this window is managing.
    if (scraping) {
        //  It is important when performing tasks like scraping web pages, to
        //  ignore the 'x-frame-options' header and allow access to iframe
        //  content.
        mainContents.session.webRequest.onHeadersReceived(
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
    mainContents.on('console-message',
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
    mainContents.on('will-prevent-unload',
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
                        mainContents.send(
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

setupWatcherCfg = function() {

    var escaper,
        exclude,
        pattern;

    //  Expand out the path we'll be watching. This should almost always
    //  be the application root.
    watchRoot = path.resolve(pkg.expandPath(
        pkg.getcfg('electron.watch.root') || '~app'));

    logger.debug('Electron FileWatch interface rooted at: ' + watchRoot);

    //  Helper function for escaping regex metacharacters. NOTE
    //  that we need to take "ignore format" things like path/*
    //  and make it path/.* or the regex will fail. Also note we special
    //  case ~ to allow virtual path matches.
    escaper = function(str) {
        return str.replace(
            /\*/g, '.*').replace(
            /\./g, '\\.').replace(
            /\~/g, '\\~').replace(
            /\//g, '\\/');
    };

    include = pkg.getcfg('uri.watch.include');

    if (typeof include === 'string') {
        try {
            include = JSON.parse(include);
        } catch (e) {
            logger.error('Invalid uri.watch.include value: ' +
                e.message);
        }
    }

    if (CLI.notEmpty(include)) {
        //  Build list of 'files', 'directories', etc. But keep in mind
        //  this is a file-based system so don't retain virtual paths.
        include = include.map(function(item) {
            //  item will often be a virtual path or file ref. we want
            //  to use the full path, or whatever value is given.
            return path.resolve(pkg.expandPath(item));
        });
    } else {
        //  Watch everything under the watch root
        include = watchRoot;
    }

    //  Build a pattern we can use to test against ignore files.
    exclude = pkg.getcfg('uri.watch.exclude');

    if (typeof exclude === 'string') {
        try {
            exclude = JSON.parse(exclude);
        } catch (e) {
            logger.error('Invalid uri.watch.exclude value: ' +
                e.message);
        }
    }

    if (exclude) {
        pattern = exclude.reduce(function(str, item) {
            var fullpath;

            fullpath = pkg.expandPath(item);
            return str ?
                str + '|' + escaper(fullpath) :
                escaper(fullpath);
        }, '');

        pattern += '|\\.git|\\.svn|node_modules|[\\/\\\\]\\..';

        try {
            pattern = new RegExp(pattern);
        } catch (e) {
            return logger.error('Error creating RegExp: ' +
                e.message);
        }
    } else {
        pattern = /\.git|\.svn|node_modules|[\/\\]\../;
    }

    watchcfg = {
        ignored: pattern,
        cwd: watchRoot,
        ignoreInitial: true,
        ignorePermissionErrors: true,
        persistent: true
    };
};

//  ---

activateWatcher = function() {

    var watcher;

    watcher = chokidar.watch(include, watchcfg);

    //  The primary change handler function.
    watcher.on('change', function(file) {
        var ignoredFilesList,
            ignoreIndex,
            fullpath,
            tibetpath,
            extname,
            procs,
            shouldSignal,
            i,
            len,
            result,
            entry,
            sigName;

        //  Files marked 'nowatch' from the "client side" are placed in an
        //  internal list we use as part of the overall ignore filtering.
        //  Check that list here before assuming we should process change.
        ignoredFilesList = pkg.getcfg('uri.$$ignored_changes_list');
        if (ignoredFilesList) {
            ignoreIndex = ignoredFilesList.indexOf(file);

            if (ignoreIndex !== -1) {
                ignoredFilesList.splice(ignoreIndex, 1);
                return;
            }
        }

        fullpath = CLI.joinPaths(watchRoot, file);
        tibetpath = CLI.getVirtualPath(fullpath);
        extname = path.extname(fullpath);
        extname = extname.charAt(0) === '.' ? extname.slice(1) : extname;

        logger.debug('Processing file change to ' + tibetpath);

        //  Perform any extension-specific processing for the file.
        //  TODO: Scott - Fix me and make processors real :-)
        if (procs) {

            logger.debug('Running processors for ' + extname);

            //  Proc can preventDefault by returning non-true. If any
            //  processor prevents default then we don't signal.
            len = procs.length;
            for (i = 0; i < len; i++) {
                try {
                    result = procs[i](fullpath);
                } catch (e) {
                    logger.error('Error running processor: ' +
                        e.message);
                }

                if (result === false) {
                    shouldSignal = false;
                }
            }
        }

        //  If any processor prevented signaling log it and bail early.
        if (shouldSignal === false) {
            logger.debug('Notification prevented for ' + extname);
            return;
        }

        sigName = pkg.getcfg('electron.watch.event',
                                'TP.sig.ElectronFileChange');
        entry = {
            path: tibetpath,
            event: 'fileChange',
            details: {},
            signalName: sigName
        };

        mainContents.send('TP.sig.MessageReceived', entry);
    });
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
            setupWatcherCfg();
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

//  ---
//  Auto updater configuration and event handlers
//  ---

//  We do *not* auto download and install by default.
autoUpdater.autoDownload = false;

//  ---

/**
 * Event emitted when the auto updater is checking for an available update.
 */
autoUpdater.on('checking-for-update', function(event) {
    mainContents.send('TP.sig.CheckingForUpdate', event);
});

//  ---

/**
 * Event emitted when the auto updater has an error.
 */
autoUpdater.on('error', function(event) {
    mainContents.send('TP.sig.UpdateError', event);
});

//  ---

/**
 * Event emitted when the auto updater has an update available.
 */
autoUpdater.on('update-available', function(event) {
    mainContents.send('TP.sig.UpdateAvailable', event);
});

//  ---

/**
 * Event emitted when the auto updater has no update available.
 */
autoUpdater.on('update-not-available', function(event) {
    mainContents.send('TP.sig.UpdateNotAvailable', event);
});

//  ---

/**
 * Event emitted when the auto updater has the latest update downloaded.
 */
autoUpdater.on('update-downloaded', function(event) {
    mainContents.send('TP.sig.UpdateDownloaded', event);
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

//  ---

/**
 * Event emitted when TIBET wants to show a native notification.
 */
ipcMain.handle('TP.sig.ShowNativeNotification',
    function(event, notificationConfig) {
        var notifier;

        notifier = new Notification(
                    {
                        title: notificationConfig.title,
                        body: notificationConfig.body
                    });

        notifier.show();
    });

//  ---

/**
 * Event emitted when TIBET wants to show a native dialog.
 */
ipcMain.handle('TP.sig.ShowNativeDialog',
    function(event, dialogConfig) {
        var choice;

        choice = dialog.showMessageBoxSync(
                    mainWindow,
                    {
                        type: dialogConfig.type,
                        title: dialogConfig.title,
                        message: dialogConfig.message,
                        defaultId: dialogConfig.defaultId,
                        cancelId: dialogConfig.cancelId,
                        buttons: dialogConfig.buttons
                    });

        return choice;
    });

//  ---

/**
 * Event emitted when TIBET wants to show a native error dialog.
 */
ipcMain.handle('TP.sig.ShowNativeErrorDialog',
    function(event, dialogConfig) {
        dialog.showErrorBox(dialogConfig.title, dialogConfig.message);
    });

//  ---

/**
 * Event emitted when TIBET wants to tweak the update menu item in the App menu.
 */
ipcMain.handle('TP.sig.ChangeUpdaterMenuItem',
    function(event, menuItemInfo) {
        let menu,
            menuItem;

        menu = Menu.getApplicationMenu();
        menuItem = menu.getMenuItemById('updater');

        menuItem.label = menuItemInfo.label;
        menuItem.enabled = menuItemInfo.enabled;
    });

//  ---

/**
 * Event emitted when TIBET wants to check to see if updates are available.
 */
ipcMain.handle('TP.sig.CheckForUpdates',
    function(event, payload) {
        //  check to see if there are any available updates using autoUpdater.
        autoUpdater.checkForUpdates();
    });

//  ---

/**
 * Event emitted when TIBET wants to download the latest application version.
 */
ipcMain.handle('TP.sig.DownloadUpdate',
    function(event, payload) {
        autoUpdater.downloadUpdate();
    });

//  ---

/**
 * Event emitted when TIBET wants to install the latest version and restart the
 * application.
 */
ipcMain.handle('TP.sig.InstallUpdateAndRestart',
    function(event, payload) {
        autoUpdater.quitAndInstall();
    });

//  ---

/**
 * Event emitted when TIBET has determined that the app has started and is
 * ready.
 */
ipcMain.handle('TP.sig.AppDidStart',
    function(event, payload) {

        if (pkg.getcfg('electron.updater.onstart') === true) {
            autoUpdater.checkForUpdates();
        }

    });

//  ---

/**
 * Event emitted when
 */
ipcMain.handle('TP.sig.ActivateWatcher',
    function(event, payload) {
        activateWatcher();
    });

//  ---

/**
 * Event emitted when
 */
ipcMain.handle('TP.sig.DeactivateWatcher',
    function(event, payload) {
        logger.debug('TODO: Deactivate the watcher here.');
    });

}());
