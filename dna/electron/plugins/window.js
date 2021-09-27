/**
 * @overview Plugin which sets up the app window used by Electron apps.
 */

/* eslint-disable no-console */

(function(root) {

    'use strict';

    /**
     * Runs any app window logic defined for the Electron app.
     * @param {Object} options Configuration options shared across Electron
     *     modules.
     * @returns {Function} A function which will configure/activate the plugin.
     */
    module.exports = function(options) {
        var pkg,
            app,
            logger,

            meta,

            CLI,
            electron,

            BrowserWindow,
            dialog,
            Notification,
            ipcMain,

            mainWindow,
            mainContents,

            createAppWindow,

            appReadyToQuit;

        pkg = options.pkg;
        app = options.app;
        logger = options.logger;

        //  NOTE this plugin loads prior to the logger so our best option here
        //  is to use the prelog function to queue logging output.
        meta = {
            type: 'plugin',
            name: 'window'
        };

        logger.system('loading window', meta);

        //  ---
        //  Requires
        //  ---

        CLI = require('../TIBET-INF/tibet/src/tibet/cli/_cli');

        electron = require('electron');

        //  Module to create browser window.
        BrowserWindow = electron.BrowserWindow;

        //  Module to create dialogs.
        dialog = electron.dialog;

        //  Module to create notifications.
        Notification = electron.Notification;

        //  Module to communicate with renderer processes over IPC.
        ipcMain = electron.ipcMain;

        //  ---

        /**
         * Creates the main application window.
         */
        createAppWindow = async function() {
            var appdir,

                useLogin,
                parallel,

                launchUrl,

                file,
                json,

                windowsParams,
                windowsKeys,
                i,

                windowInfo,
                newWindow,

                //  splashRoot,
                //  splashUrl,
                paramStr,
                bootOpts;

            appdir = pkg.expandPath('~app');

            //  ---

            useLogin = pkg.getcfg('boot.use_login', false);
            parallel = pkg.getcfg('boot.parallel', true);

            //  Specifying a 'file://' URL will tell TIBET that we're launching
            //  from a File URL (well, we are all about offline, aren't we? ;-))
            launchUrl = 'file://' + appdir + '/';
            //  splashRoot = launchUrl;

            if (useLogin) {
                if (!parallel) {
                    logger.warn(
                        'No boot.parallel or is set to false. TIBET ' +
                        'ElectronJS applications require this to be set to' +
                        ' true. Forcing boot.parallel to true');
                    pkg.setcfg('boot.parallel', true);
                }

                launchUrl += 'index_login_parallel.html';
            } else {
                launchUrl += 'index.html';
            }

            //  ---

            //  Loop over params and add them to the launch URL.
            paramStr = '';
            bootOpts = options.boot;

            Object.keys(bootOpts).forEach(function(item) {
                let key,
                    val;

                val = bootOpts[item];

                if (CLI.notValid(val)) {
                    return;
                }

                key = 'boot.' + item;

                if (val === true) {
                    paramStr += key + '&';
                } else {
                    paramStr += key + '=' + val + '&';
                }
            });

            //  Finalize the assembly of the launch URL.
            if (paramStr.length > 0) {
                launchUrl += '#?' + paramStr.slice(0, -1);
            }

            //  ---

            //  Grab the profile from the profile file.
            file = CLI.expandPath('~profile_file');
            try {
                json = require(file);
            } catch (e) {
                json = {};
            }

            if (!json) {
                json = {};
            }

            //  Grab any parameters for windows specified in the profile. These
            //  will be things like window coordinates from the user's last
            //  session so that we can be nice and restore them back to where
            //  they were.
            windowsParams = json;
            if (!windowsParams ||
                !windowsParams.profile ||
                !windowsParams.profile.windows) {
                windowsParams = {
                                    main: {}
                                };

            } else {
                windowsParams = windowsParams.profile.windows;
            }

            windowsKeys = Object.keys(windowsParams);

            //  Make sure that we have a key for the 'main' window.
            if (windowsKeys.indexOf('main') === -1) {
                windowsParams.main = {};
                windowsKeys.push('main');
            }

            //  Iterate over all of the window keys that we found (each
            //  representing a window) and create a window for each one.
            for (i = 0; i < windowsKeys.length; i++) {
                windowInfo = windowsParams[windowsKeys[i]];

                //  If the window is 'devtools' or 'devtoolsondevtools', then we
                //  special case them and don't open windows for them.
                if (windowsKeys[i] === 'devtools' ||
                    windowsKeys[i] === 'devtoolsondevtools') {
                    continue;
                }

                //  Create a browser window.
                newWindow = new BrowserWindow({
                    x: windowInfo.left || null,
                    y: windowInfo.top || null,
                    width: windowInfo.width || 1024,
                    height: windowInfo.height || 768,
                    minWidth: 750,
                    minHeight: 750,
                    backgroundColor: pkg.getcfg('electron.bgcolor', '#171717'),
                    webPreferences: {
                        preload: CLI.joinPaths(appdir, './preload.js'),
                        webSecurity: true,
                        nodeIntegration: false,
                        enableRemoteModule: false,
                        contextIsolation: true,
                        worldSafeExecuteJavaScript: true
                    }
                });

                //  Set the new window's 'name' slot to the key so that we can
                //  find it again when we need to save.
                newWindow.name = windowsKeys[i];

                //  If the window is 'main', then we grab it's 'webContents' for
                //  ease of reference and store it's 'id' on the 'options'
                //  object so that other plugins can find it.
                if (newWindow.name === 'main') {
                    mainWindow = newWindow;

                    //  Grab the browser window's web contents which we use a
                    //  lot below.
                    mainContents = mainWindow.webContents;
                    options.mainid = mainWindow.id;
                }

                /**
                 * Event emitted when the window is moved.
                 */
                /* eslint-disable no-loop-func */
                newWindow.on('moved', function(event) {
                    var movedWin,
                        winBounds;

                    //  Grab the window boundary and signal TIBET with that
                    //  information.
                    movedWin = event.sender;
                    winBounds = movedWin.getBounds();

                    mainContents.send('TP.sig.WindowMoved',
                        {
                            name: movedWin.name,
                            top: winBounds.y,
                            left: winBounds.x,
                            width: winBounds.width,
                            height: winBounds.height
                        });
                });

                /**
                 * Event emitted when the window is resized.
                 */
                newWindow.on('resized', function(event) {
                    var movedWin,
                        winBounds;

                    movedWin = event.sender;
                    winBounds = movedWin.getBounds();

                    //  Grab the window boundary and signal TIBET with that
                    //  information.
                    mainContents.send('TP.sig.WindowResized',
                        {
                            name: movedWin.name,
                            top: winBounds.y,
                            left: winBounds.x,
                            width: winBounds.width,
                            height: winBounds.height
                        });
                });
                /* eslint-enable no-loop-func */
            }

            /*
            splashUrl = CLI.joinPaths(splashRoot,
                pkg.getcfg('electron.splash') || 'splash.html');
            logger.system('Launching ' + splashUrl);

            await mainWindow.loadUrl(splashUrl);
            logger.system('Loaded ' + splashUrl);
            */


            //  ---

            logger.system('Launching ' + launchUrl);

            //  ---

            //  Load the application using the launch URL and then emit a main
            //  process event that the TIBET application has loaded.
            mainWindow.loadURL(launchUrl).then(
                function() {
                    app.emit('TIBET-Main-Loaded');
                }).catch(
                function(e) {
                    console.log(e);
                });

            //  ---

            //  If we're configured for scraping, then remove 'x-frame-options'
            //  headers from network responses that this window is managing.
            if (options.scraping) {
                //  It is important when performing tasks like scraping web
                //  pages, to ignore the 'x-frame-options' header and allow
                //  access to iframe content.
                mainContents.session.webRequest.onHeadersReceived(
                    function(details, callback) {
                        var entries;

                        //  Filter out the 'x-frame-options' header.
                        entries =
                            Object.entries(details.responseHeaders).filter(
                                function(header) {
                                    return !/x-frame-options/i.test(header[0]);
                                });

                        callback({
                            responseHeaders: Object.fromEntries(entries)
                        });
                });
            }

            //  ---
            //  Main window event handlers
            //  ---

            /**
             * Event emitted when the renderer process logs a message to the
             * console.
             */
            mainContents.on('console-message',
            function(event, level, message, line, sourceId) {
                //  Use process.stdout here to avoid extra newlines in output
                //  stream.
                if (options.verbose) {
                    //  Log client console to main console.
                    process.stdout.write(message);
                }
            });

            //  ---

            /**
             * Event emitted when the window is closed.
             */
            mainWindow.on('closed',
                function() {
                    //  Dereference the window object, usually you would store
                    //  windows in an array if your app supports multi windows,
                    //  this is the time when you should delete the
                    //  corresponding element.
                mainWindow = null;
            });

            //  ---

            /**
             * Event emitted when the user clicks an external link. This will
             * open the link in the user's default browser.
             */
            mainContents.on('new-window',
            function(event, url) {
                event.preventDefault();
                electron.shell.openExternal(url);
            });

        };

        //  ---
        //  Application event handlers
        //  ---

        /**
         * Event emitted when Electron has finished initialization and is ready
         * to create browser windows, etc.. Some APIs can only be used after
         * this event occurs.
         */
        app.on('ready',
                function() {
                    createAppWindow();

                    logger.system('Application Started');
                });

        //  ---

        /**
         * Event emitted when the user launches the app, clicks on the Mac OS X
         * dock or Windows taskbar or tries to relaunch when already running.
         */
        app.on('activate', function() {
            //  On OS X it's common to re-create a window in the app when the
            //  dock icon is clicked and there are no other windows open.
            if (mainWindow === null) {
                createAppWindow();
            }
        });

        //  ---

        /**
         * Event emitted when all windows are closed.
         */
        app.on('window-all-closed', function() {
            //  If the app is configure to exit when all windows are closed,
            //  then go ahead and do that.
            if (pkg.getcfg('electron.exit_on_last_window_close') === true) {
                app.quit();
            }
        });

        /**
         * Tell TIBET that the application is exiting, before all of the windows
         * have been closed.
         */

        //  We set this flag to false and then let TIBET tell us to 'really
        //  quit'. This allows the signals inside of TIBET to follow their
        //  normal procedure and allows shutdown to be prevented if desired.
        appReadyToQuit = false;

        app.on('before-quit', function(event) {
            if (!appReadyToQuit) {
                event.preventDefault();
                mainContents.send('TP.sig.ApplicationWillExit');
            }
        });

        /**
         * Clean up when the application is closing, after all of the windows
         * have been closed.
         */
        app.on('quit', function(event) {
            mainContents.send('TP.sig.ApplicationDidExit');
        });

        //  ---
        //  Other window/dialog event handlers.
        //  ---

        /**
         * Event emitted by TIBET when it is really ready to exit.
         */
        ipcMain.handle('TP.sig.CompleteExit',
            function(event) {
                //  Flip the flag to really allow the app to quit and then call
                //  'quit' manually.
                appReadyToQuit = true;
                app.quit();
            });

        /**
         * Event emitted by TIBET when it wants to show a native notification.
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
         * Event emitted by TIBET when it wants to show a native dialog.
         */
        ipcMain.handle('TP.sig.ShowNativeDialog',
            async function(event, dialogConfig) {
                var dialogResult;

                //  dialogResult will be a POJO containing the following:
                //  {Number} response
                //  {Boolean} checkboxChecked
                dialogResult = await dialog.showMessageBox(
                            mainWindow,
                            {
                                type: dialogConfig.type,
                                title: dialogConfig.title,
                                message: dialogConfig.message,
                                defaultId: dialogConfig.defaultId,
                                cancelId: dialogConfig.cancelId,
                                buttons: dialogConfig.buttons
                            });

                return dialogResult;
            });

        //  ---

        /**
         * Event emitted by TIBET when it wants to show a native error dialog.
         */
        ipcMain.handle('TP.sig.ShowNativeErrorDialog',
            function(event, dialogConfig) {
                //  No return value here.
                dialog.showErrorBox(dialogConfig.title, dialogConfig.message);
            });

        //  ---

        /**
         * Event emitted by TIBET when it wants to show a native open dialog.
         */
        ipcMain.handle('TP.sig.ShowNativeOpenDialog',
            async function(event, dialogConfig) {
                var dialogResult;

                //  dialogResult will be a POJO containing the following:
                //  {Boolean} canceled
                //  {String} filePath
                dialogResult = await dialog.showOpenDialog(
                            mainWindow,
                            {
                                title: dialogConfig.title,
                                defaultPath: dialogConfig.defaultPath,
                                buttonLabel: dialogConfig.buttonLabel,
                                filters: dialogConfig.filters,
                                properties: dialogConfig.properties
                            });

                return dialogResult;
            });

        //  ---

        /**
         * Event emitted by TIBET when it wants to show a native save dialog.
         */
        ipcMain.handle('TP.sig.ShowNativeSaveDialog',
            async function(event, dialogConfig) {
                var dialogResult;

                //  dialogResult will be a POJO containing the following:
                //  {Boolean} canceled
                //  {String} filePath
                dialogResult = await dialog.showSaveDialog(
                            mainWindow,
                            {
                                title: dialogConfig.title,
                                defaultPath: dialogConfig.defaultPath,
                                buttonLabel: dialogConfig.buttonLabel,
                                filters: dialogConfig.filters,
                                properties: dialogConfig.properties
                            });

                return dialogResult;
            });

    };

}(this));
