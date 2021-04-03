/**
 * @overview Plugin which sets up the app menu used by Electron apps.
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
        var app,
            logger,

            meta,

            electron,

            BrowserWindow,
            Menu,
            ipcMain,

            setupAppMenu;

        app = options.app;
        logger = options.logger;

        //  NOTE this plugin loads prior to the logger so our best option here
        //  is to use the prelog function to queue logging output.
        meta = {
            type: 'plugin',
            name: 'menu'
        };

        logger.system('loading menu', meta);

        //  ---
        //  Requires
        //  ---

        electron = require('electron');

        //  Module to create browser window.
        BrowserWindow = electron.BrowserWindow;

        //  Module to manage menus.
        Menu = electron.Menu;

        //  Module to communicate with renderer processes over IPC.
        ipcMain = electron.ipcMain;

        //  ---

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
                            label: 'Version ' + app.getVersion(),
                            enabled: false
                        },
                        {
                            id: 'updater',
                            label: 'Check for updates',
                            enabled: false,
                            click: () => {
                                var mainContents;

                                mainContents = BrowserWindow.fromId(
                                                    options.mainid).webContents;

                                mainContents.send(
                                    'TP.sig.CheckForUpdate', false);
                            }
                        },
                        {
                            id: 'devtools',
                            label: 'Launch DevTools',
                            accelerator: 'CommandOrControl+Alt+i',
                            click: () => {
                                app.emit('TIBET-Show-Devtools');
                            }
                        },
                        {
                            id: 'lama',
                            label: 'Launch Devtools on Devtools',
                            accelerator: 'CommandOrControl+Alt+Shift+i',
                            click: () => {
                                app.emit('TIBET-Show-Devtools-On-Devtools');
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
                },
                {
                    label: 'Edit',
                    submenu: [
                        {
                            label: 'Undo',
                            accelerator: 'CmdOrCtrl+Z',
                            selector: 'undo:'
                        },
                        {
                            label: 'Redo',
                            accelerator: 'Shift+CmdOrCtrl+Z',
                            selector: 'redo:'
                        },
                        {
                            type: 'separator'
                        },
                        {
                            label: 'Cut',
                            accelerator: 'CmdOrCtrl+X',
                            selector: 'cut:'
                        },
                        {
                            label: 'Copy',
                            accelerator: 'CmdOrCtrl+C',
                            selector: 'copy:'
                        },
                        {
                            label: 'Paste',
                            accelerator: 'CmdOrCtrl+V',
                            selector: 'paste:'
                        },
                        {
                            label: 'Select All',
                            accelerator: 'CmdOrCtrl+A',
                            selector: 'selectAll:'
                        }
                    ]
                }
            ];

            menu = Menu.buildFromTemplate(appMenuTemplate);
            Menu.setApplicationMenu(menu);
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
                    setupAppMenu();
                });

        //  ---
        //  Other menu event handlers.
        //  ---

        /**
         * Event emitted when TIBET wants to tweak the update menu item in the
         * App menu.
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

    };

}(this));
