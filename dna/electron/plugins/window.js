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

        //  Module to communicate with renderer processes over IPC.
        ipcMain = electron.ipcMain;

        //  ---

        createAppWindow = async function() {
            var appdir,

                useLogin,
                parallel,

                launchUrl,

                windowsParams,
                windowsKeys,
                i,

                windowInfo,
                newWindow,

                //  splashRoot,
                //  splashUrl,
                paramStr,
                electronOpts;

            appdir = pkg.expandPath('~app');

            //  ---

            useLogin = pkg.getcfg('electron.boot.use_login');
            parallel = pkg.getcfg('electron.boot.parallel');

            launchUrl = 'file://' + appdir + '/';
            //  splashRoot = launchUrl;

            if (useLogin) {
                if (!parallel) {
                    logger.warn(
                        'No boot.parallel or is set to false. TIBET ' +
                        'ElectronJS applications require this to be set to' +
                        ' true. Forcing boot.parallel to true');
                    pkg.setcfg('electron.boot.parallel', true);
                }

                launchUrl += 'index_login_parallel.html';
            } else {
                launchUrl += 'index.html';
            }

            //  ---

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
                launchUrl += '#?' + paramStr.slice(0, -1);
            }

            //  ---

            windowsParams = pkg.getcfg('profile.windows', null, true);
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

            if (windowsKeys.indexOf('main') === -1) {
                windowsParams.main = {};
                windowsKeys.push('main');
            }

            for (i = 0; i < windowsKeys.length; i++) {
                windowInfo = windowsParams[windowsKeys[i]];

                //  If the window is 'devtools' or 'devtoolsondevtools', then we
                //  special case them and don't open windows for them.
                if (windowsKeys[i] === 'devtools' ||
                    windowsKeys[i] === 'devtoolsondevtools') {
                    continue;
                }

                //  Create the browser window.
                newWindow = new BrowserWindow({
                    x: windowInfo.left || null,
                    y: windowInfo.top || null,
                    width: windowInfo.width || 1024,
                    height: windowInfo.height || 768,
                    backgroundColor: pkg.getcfg('electron.bgcolor', '#171717'),
                    webPreferences: {
                        preload: CLI.joinPaths(appdir, './preload.js'),
                        webSecurity: options.scraping ? false : true,
                        nodeIntegration: false,
                        enableRemoteModule: false,
                        contextIsolation: true,
                        worldSafeExecuteJavaScript: true
                    }
                });

                newWindow.name = windowsKeys[i];

                if (newWindow.name === 'main') {
                    mainWindow = newWindow;

                    //  Grab the browser window's web contents which we use a
                    //  lot below.
                    mainContents = mainWindow.webContents;
                    options.mainid = mainWindow.id;
                }

                /* eslint-disable no-loop-func */
                newWindow.on('moved', function(event) {
                    var movedWin,
                        winBounds;

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

                newWindow.on('resized', function(event) {
                    var movedWin,
                        winBounds;

                    movedWin = event.sender;
                    winBounds = movedWin.getBounds();

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
            if (pkg.getcfg('electron.exitOnAllClosed') === true) {
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

    };

}(this));
