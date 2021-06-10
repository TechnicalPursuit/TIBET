/**
 * @overview Plugin which manages integration with Chrome DevTools.
 */

/* eslint-disable no-console */

(function(root) {

    'use strict';

    /**
     * Runs any app menu logic defined for the Electron app.
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

            ipcMain,
            BrowserWindow,

            extensionPath,

            bootPkg,

            enableLamaExtMode,

            inDeveloperMode,
            inDevelopingDeveloperMode,
            isDevToolsOpen,
            isDevToolsOnDevToolsOpen,

            shouldReload,

            openDevToolPanels,
            closeDevToolPanels,

            launchDevTools,

            devToolsWindow,
            devToolsContents,

            devToolsOnDevToolsWindow,
            devToolsOnDevToolsContents;

        pkg = options.pkg;
        app = options.app;
        logger = options.logger;

        //  NOTE this plugin loads prior to the logger so our best option here
        //  is to use the prelog function to queue logging output.
        meta = {
            type: 'plugin',
            name: 'appmenu'
        };

        logger.system('loading appmenu', meta);

        //  ---
        //  Requires
        //  ---

        CLI = require('../TIBET-INF/tibet/src/tibet/cli/_cli');

        electron = require('electron');

        //  Module to communicate with renderer processes over IPC.
        ipcMain = electron.ipcMain;

        //  Module to create browser window.
        BrowserWindow = electron.BrowserWindow;

        //  ---

        extensionPath = './TIBET-INF/tibet/src/tibet/tools/tibet-lama-extension';

        bootPkg = options.bootPkg;

        inDeveloperMode = /development/.test(bootPkg);

        if (inDeveloperMode) {
            enableLamaExtMode = pkg.getcfg(
                            'electron.enableLamaExt', false);
            inDevelopingDeveloperMode = pkg.getcfg(
                            'electron.developingDeveloper', false);
        } else {
            enableLamaExtMode = false;
            inDevelopingDeveloperMode = false;
        }

        isDevToolsOpen = false;
        isDevToolsOnDevToolsOpen = false;

        shouldReload = false;

        //  ---

        /**
         * Opens the Chrome Devtools on the main window (the window with the id
         *      stored in 'options.id' slot).
         * @param {Boolean} devToolsOnDevTools Whether or not to open another
         *      instance of Chrome Devtools on the Devtools panel itself. Very
         *      useful for debugging Devtools extensions ;-).
         * @param {Function} cb A function that should be executed after the
         *     Devtools panel is fully open.
         */
         openDevToolPanels = async function(devToolsOnDevTools, cb) {

            var mainContents,
                dtOpenHandler,
                dtCloseHandler,

                windowsParams,
                windowInfo;

            mainContents = BrowserWindow.fromId(options.mainid).webContents;

            if (devToolsOnDevTools) {
                if (isDevToolsOnDevToolsOpen) {
                    return;
                }
            } else {
                if (isDevToolsOpen) {
                    return;
                }
            }

            if (inDeveloperMode && enableLamaExtMode) {
                if (inDevelopingDeveloperMode) {
                    await mainContents.session.clearCache();
                }

                await mainContents.session.loadExtension(
                    CLI.joinPaths(process.cwd(), extensionPath),
                    {
                        allowFileAccess: true
                    });
            }

            isDevToolsOpen = true;

            windowsParams = pkg.getcfg('profile.windows.devtools', null, true);
            if (windowsParams) {
                windowInfo = windowsParams.profile.windows.devtools;
            } else {
                windowInfo = {};
            }

            devToolsWindow = new BrowserWindow({
                    x: windowInfo.left || null,
                    y: windowInfo.top || null,
                    width: windowInfo.width || 1024,
                    height: windowInfo.height || 768
                });

            devToolsWindow.name = 'devtools';

            devToolsWindow.on('moved', function(event) {
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

            devToolsWindow.on('resized', function(event) {
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

            devToolsContents = devToolsWindow.webContents;
            mainContents.setDevToolsWebContents(devToolsContents);

            mainContents.on(
                'devtools-opened',
                dtOpenHandler = function() {

                    let dtOnDtOpenHandler,
                        dtOnDtCloseHandler,

                        dtOnDtWindowsParams,
                        dtOnDtWindowInfo;

                    mainContents.removeListener(
                        'devtools-opened',
                        dtOpenHandler);

                    if (devToolsOnDevTools) {

                        isDevToolsOnDevToolsOpen = true;

                        dtOnDtWindowsParams = pkg.getcfg(
                            'profile.windows.devtoolsondevtools', null, true);
                        if (dtOnDtWindowsParams) {
                            dtOnDtWindowInfo = dtOnDtWindowsParams.
                                                    profile.
                                                    windows.
                                                    devtoolsondevtools;
                        } else {
                            dtOnDtWindowInfo = {};
                        }

                        devToolsOnDevToolsWindow = new BrowserWindow({
                                x: dtOnDtWindowInfo.left || null,
                                y: dtOnDtWindowInfo.top || null,
                                width: dtOnDtWindowInfo.width || 1024,
                                height: dtOnDtWindowInfo.height || 768
                            });

                        devToolsOnDevToolsWindow.name = 'devtoolsondevtools';

                        devToolsOnDevToolsWindow.on('moved', function(event) {
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

                        devToolsOnDevToolsWindow.on('resized', function(event) {
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

                        devToolsOnDevToolsContents =
                            devToolsOnDevToolsWindow.webContents;

                        devToolsContents.setDevToolsWebContents(
                                        devToolsOnDevToolsContents);

                        dtOnDtOpenHandler = function() {
                            devToolsContents.removeListener(
                                'devtools-opened',
                                dtOnDtOpenHandler);

                            if (CLI.isFunction(cb)) {
                                cb();
                            }
                        };
                        devToolsContents.on('devtools-opened',
                                            dtOnDtOpenHandler);

                        dtOnDtCloseHandler = function() {
                            devToolsContents.removeListener(
                                'devtools-closed',
                                dtOnDtCloseHandler);

                            isDevToolsOnDevToolsOpen = false;
                        };
                        devToolsContents.on('devtools-closed',
                                            dtOnDtCloseHandler);

                        devToolsContents.openDevTools({mode: 'detach'});
                    } else {
                        if (CLI.isFunction(cb)) {
                            cb();
                        }
                    }
                });

            mainContents.on(
                'devtools-closed',
                dtCloseHandler = function() {

                    mainContents.removeListener(
                        'devtools-closed',
                        dtCloseHandler);

                    if (isDevToolsOnDevToolsOpen) {
                        devToolsContents.closeDevTools();
                        devToolsOnDevToolsWindow.close();
                    }

                    isDevToolsOpen = false;
            });

            mainContents.openDevTools({mode: 'detach'});
        };

        //  ---

        /**
         * Closes the Chrome Devtools on the main window (the window with the id
         *      stored in 'options.id' slot). Note that if another Devtools
         *      panel was opened on this Devtools panel, it will be closed as
         *      well.
         * @param {Function} cb A function that should be executed after the (or
         *      both) Devtools panel(s) is/are fully closed.
         */
        closeDevToolPanels = function(cb) {

            var mainContents,
                closeHandler;

            mainContents = BrowserWindow.fromId(options.mainid).webContents;

            //  If the 'dev tools on dev tools' contents is real, then we should
            //  close the main 'dev tools' content, and then close it.
            if (devToolsOnDevToolsContents) {

                //  Close the main 'dev tools' content
                mainContents.closeDevTools();
                devToolsWindow.close();

                //  Set up and register a 'close' handler with the 'dev tools on
                //  dev tools' content.
                closeHandler = function() {
                    devToolsContents.removeListener(
                        'devtools-closed',
                        closeHandler);

                    isDevToolsOpen = false;
                    isDevToolsOnDevToolsOpen = false;

                    if (CLI.isFunction(cb)) {
                        cb();
                    }
                };

                devToolsContents.on('devtools-closed', closeHandler);

                //  Close the 'dev tools on dev tools' content
                devToolsContents.closeDevTools();
                devToolsOnDevToolsWindow.close();

            } else {

                //  Set up and register a 'close' handler with the main 'dev
                //  tools' content.
                closeHandler = function() {
                    mainContents.removeListener(
                        'devtools-closed',
                        closeHandler);

                    if (isDevToolsOnDevToolsOpen) {
                        devToolsContents.closeDevTools();
                        devToolsOnDevToolsWindow.close();
                    }

                    isDevToolsOpen = false;
                    isDevToolsOnDevToolsOpen = false;

                    if (CLI.isFunction(cb)) {
                        cb();
                    }
                };

                mainContents.on('devtools-closed', closeHandler);

                //  Close the main 'dev tools' content
                mainContents.closeDevTools();
                devToolsWindow.close();
            }
        };

        //  ---

        /**
         * Launches the Chrome Devtools on the main window (the window with the
         *      id stored in 'options.id' slot).
         * @param {Boolean} devToolsOnDevTools Whether or not to open another
         *      instance of Chrome Devtools on the Devtools panel itself. Very
         *      useful for debugging Devtools extensions ;-).
         */
        launchDevTools = function(devToolsOnDevTools) {

            var shouldOpenDevOnDev;

            shouldOpenDevOnDev = devToolsOnDevTools &&
                                    inDevelopingDeveloperMode;

            if (shouldOpenDevOnDev && isDevToolsOnDevToolsOpen) {
                return;
            }

            if (!shouldOpenDevOnDev && isDevToolsOpen) {
                return;
            }

            if (shouldReload === true) {
                openDevToolPanels(
                    false,
                    function() {
                        shouldReload = false;

                        console.log('Reloading devtools.');

                        closeDevToolPanels(
                            function() {
                                openDevToolPanels(shouldOpenDevOnDev);
                                shouldReload = true;
                            });
                    });
            } else {
                openDevToolPanels(shouldOpenDevOnDev);
            }
        };

        //  ---
        //  Devtools event handlers.
        //  ---

        /**
         * Event emitted by TIBET when it wants to show the Lama Devtools
         * extension.
         */
        ipcMain.handle('TP.sig.ShowLamaExtension',
            function(event, payload) {
                launchDevTools(true);
            });

        //  ---

        /**
         * Event emitted by TIBET when it wants to focus the Devtools DOM
         * inspect on the element at the supplied coordinates.
         */
        ipcMain.handle('TP.sig.FocusRendererElement',
            function(event, elementCoords) {
                var focusElement;

                focusElement = function() {
                    var mainContents,

                        x,
                        y;

                    mainContents = BrowserWindow.fromId(
                                                options.mainid).webContents;

                    x = parseInt(elementCoords.elementX, 10);
                    y = parseInt(elementCoords.elementY, 10);

                    mainContents.inspectElement(x, y);
                };

                if (!isDevToolsOpen) {
                    openDevToolPanels(false, focusElement);
                } else {
                    focusElement();
                }
            });

        //  ---

        /**
         * Event emitted by TIBET when it wants to load a TIBET project into a
         * separate window.
         * TODO: This method should share/reuse logic that is already written
         * for robustness and clarity.
         */
        ipcMain.handle('TP.sig.LoadTIBETProject',
            function(event, payload) {

                var appdir,
                    projectWindow,
                    projectURL;

                appdir = pkg.expandPath('~app');

                //  Create the project's browser window.
                projectWindow = new BrowserWindow({
                    width: 1024,
                    height: 768,
                    webPreferences: {
                        preload: CLI.joinPaths(appdir, './preload.js'),
                        webSecurity: true,
                        nodeIntegration: false,
                        enableRemoteModule: false,
                        contextIsolation: true
                    }
                });

                projectURL = payload.homeURL;

                logger.verbose('Launching ' + projectURL);

                projectWindow.loadURL(projectURL);
            });

        //  ---

        /**
         * Event emitted by TIBET when it wants to launch a debugger on the
         * main process.
         */
        ipcMain.handle('TP.sig.ToggleMainDebugger',
            function(event, payload) {
                //  TODO: Launch page with 'chrome://inspect/#devices' link.
            });

        //  ---
        //  Application event handlers
        //  ---

        /**
         * Event emitted when the user wants to show the devtools panel.
         */
        app.on('TIBET-Show-Devtools',
                function() {
                    //  Open the DevTools without the Lama.
                    launchDevTools(false);
                });

        /**
         * Event emitted when the user wants to show the devtools panel with the
         * Lama loaded.
         */
        app.on('TIBET-Show-Devtools-On-Devtools',
                function() {
                    //  Open the DevTools with the Lama.
                    launchDevTools(true);
                });

        //  ---
        //  Command line arguments
        //  ---

        app.on('TIBET-Main-Loaded',
            function(event) {
                //  NOTE this is a TIBET-specific if block. The `tibet electron`
                //  command will pass --devtools along so this flag is set,
                //  otherwise it's likely not there.
                if (process.argv.indexOf('--devtools') !== -1) {
                    //  Open the DevTools without the Lama.
                    launchDevTools(false);
                }
            });
    };

}(this));
