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
        var pkg,
            app,
            logger,

            meta,

            CLI,
            electron,

            BrowserWindow,
            Menu,
            ipcMain,

            menuTemplateSlotNames,
            menuTemplateFromMenu,
            menuTemplateFromAppMenu,

            getDescriptorForId,
            getDescriptorIndexForId,

            setupAppMenu;

        pkg = options.pkg;
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

        CLI = require('../TIBET-INF/tibet/src/tibet/cli/_cli');
        electron = require('electron');

        //  Module to create browser window.
        BrowserWindow = electron.BrowserWindow;

        //  Module to manage menus.
        Menu = electron.Menu;

        //  Module to communicate with renderer processes over IPC.
        ipcMain = electron.ipcMain;

        //  ---

        /**
         * An Array of slot names that will be manipulated when the menu is
         * serialized/deserialized.
         */
        menuTemplateSlotNames = [
            'accelerator',
            'acceleratorWorksWhenHidden',
            'checked',
            'enabled',
            'eventInfo',    //  TIBET-specific
            'icon',
            'id',
            'label',
            'registerAccelerator',
            'role',
            'sharingItem',
            'sublabel',
            'tooltip',
            'type',
            'visible'
        ];

        //  ---

        /**
         * Generates a menu template from the supplied item.
         * @param {Object} item The menu item (which could contain a submenu)
         *     that a menu template should be generated from.
         * @returns {Object} The menu template generated from the supplied item.
         */
        menuTemplateFromMenu = function(item) {
            var submenu,
                items,
                i,

                menuItem,
                templateItem;

            //  The submenu starts as a blank Array that we'll add items to.
            submenu = [];

            items = item.items;
            for (i = 0; i < items.length; i++) {

                menuItem = items[i];
                templateItem = {};

                //  Copy over all of the slot names as defined above from the
                //  menu item structure to the template.
                /* eslint-disable no-loop-func */
                menuTemplateSlotNames.forEach(
                    function(aSlotName) {
                        var val;

                        val = menuItem[aSlotName];
                        if (val) {
                            templateItem[aSlotName] = val;
                        }
                    });
                /* eslint-enable no-loop-func */

                //  If there is no role, then set up a 'click' handler that will
                //  dispatch events, either into the main process side or the
                //  TIBET side, depending on the entry prefix.
                if (!menuItem.role) {
                    templateItem.click =
                        function(targetItem, browserWindow, event) {
                            var eventName,
                                eventArgs,

                                mainContents;

                            //  If the menu item had mapped eventInfo, then
                            //  process it.
                            if (targetItem.eventInfo) {

                                //  eventInfo: ['main/APP.{{appname}}.ShowDevtools']
                                //  eventInfo: ['TIBET/TP.sig.CheckForUpdate',
                                //                  false]

                                eventName = targetItem.eventInfo[0];
                                eventArgs = targetItem.eventInfo.slice(1);

                                if (eventName.startsWith('main')) {
                                    //  Make sure to slice off the slash
                                    eventName = eventName.slice(5);
                                    eventArgs.unshift(eventName);

                                    //  Emit the event on the 'main side'.
                                    app.emit.apply(app, eventArgs);
                                } else if (eventName.startsWith('TIBET')) {

                                    //  Make sure to slice off the slash
                                    eventName = eventName.slice(6);
                                    eventArgs.unshift(eventName);

                                    mainContents = BrowserWindow.fromId(
                                                    options.mainid).webContents;

                                    //  Send the event over to TIBET.
                                    mainContents.send.apply(mainContents,
                                                            eventArgs);
                                }
                            }
                        };
                }

                //  If the menu item has a submenu, recursively call ourself to
                //  continue building.
                if (menuItem.submenu) {
                    templateItem.submenu = menuTemplateFromMenu(
                                                menuItem.submenu);
                }

                //  Add the built item into the current submenu.
                submenu.push(templateItem);
            }

            return submenu;
        };

        //  ---

        /**
         * Generates a menu template from the current application menu.
         * @returns {Object} The menu template describing the current
         *     application menu.
         */
        menuTemplateFromAppMenu = function() {
            var mainMenu,
                mainMenuTemplate,
                i,
                item,

                menuTemplate;

            mainMenu = Menu.getApplicationMenu();

            mainMenuTemplate = [];

            for (i = 0; i < mainMenu.items.length; i++) {
                item = mainMenu.items[i];
                menuTemplate = menuTemplateFromMenu(item.submenu);
                mainMenuTemplate.push({
                    label: item.label,
                    id: item.id,
                    submenu: menuTemplate
                });
            }

            return mainMenuTemplate;
        };

        //  ---

        /**
         * Gets a 'menu descriptor' (i.e. part of a menu template) within the
         * supplied menu template that matches the supplied id.
         * @param {Object} menuTemplate The menu template to begin searching for
         *     the menu descriptor with the supplied id.
         * @param {String} id The id of the menu descriptor to return.
         * @returns {Object|undefined} The menu descriptor with an id matching
         *     the supplied id.
         */
        getDescriptorForId = function(menuTemplate, id) {

            var i,
                val;

            for (i = 0; i < menuTemplate.length; i++) {
                if (menuTemplate[i].id === id) {
                    return menuTemplate[i];
                }
                if (menuTemplate[i].submenu) {
                    val = getDescriptorForId(menuTemplate[i].submenu, id);
                    if (val) {
                        return val;
                    }
                }
            }
        };

        //  ---

        /**
         * Gets the index for a particular 'menu descriptor' (i.e. part of a menu
         * template) within the supplied menu template that matches the supplied
         * id. Note that this index will be *relative* to its containing menu,
         * not to the overall menu.
         * @param {Object} menuTemplate The menu template to begin searching for
         *     the menu descriptor with the supplied id.
         * @param {String} id The id of the menu descriptor to return.
         * @returns {Array} An array with 2 items: The menu descriptor containing
         *     the item with the id and the index of the item with that id within
         *     that descriptor.
         */
        getDescriptorIndexForId = function(menuTemplate, id) {

            var i,
                val;

            for (i = 0; i < menuTemplate.length; i++) {
                if (menuTemplate[i].id === id) {
                    return [menuTemplate, i];
                }
                if (menuTemplate[i].submenu) {
                    val = getDescriptorForId(menuTemplate[i].submenu, id);
                    if (val) {
                        return [menuTemplate, i];
                    }
                }
            }
        };

        //  ---

        /**
         * Sets up the app menu.
         */
        setupAppMenu = function() {

            var appMenuTemplate,
                menu;

            appMenuTemplate = pkg.getcfg('electron.menu', null, true);

            //  If an app menu wasn't defined in config, warn the user but
            //  provide enough of a menu for the app to at least be usable.
            if (CLI.isEmpty(appMenuTemplate)) {
                logger.warn('Unable to locate menu description in config.' +
                            ' Loading default menu.');
                appMenuTemplate = [
                    {
                        label: app.getName(),
                        id: 'about',
                        submenu: [
                            {
                                role: 'about'
                            },
                            {
                                label: 'Version ' + app.getVersion(),
                                enabled: false
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
                        id: 'edit',
                        submenu: [
                            {
                                label: 'Undo',
                                accelerator: 'CmdOrCtrl+Z',
                                role: 'undo'
                            },
                            {
                                label: 'Redo',
                                accelerator: 'Shift+CmdOrCtrl+Z',
                                role: 'redo'
                            },
                            {
                                type: 'separator'
                            },
                            {
                                label: 'Cut',
                                accelerator: 'CmdOrCtrl+X',
                                role: 'cut'
                            },
                            {
                                label: 'Copy',
                                accelerator: 'CmdOrCtrl+C',
                                role: 'copy'
                            },
                            {
                                label: 'Paste',
                                accelerator: 'CmdOrCtrl+V',
                                role: 'paste'
                            },
                            {
                                label: 'Select All',
                                accelerator: 'CmdOrCtrl+A',
                                role: 'selectAll'
                            }
                        ]
                    }
                ];
            }

            //  Build the application menu and set it.
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
         * Event emitted when TIBET wants to add a menu item.
         */
        ipcMain.on('TP.sig.AddMenuItem',
            function(event, menuItemInfo) {
                var appMenuTemplate,

                    parentMenu,

                    newAppMenu;

                if (!menuItemInfo.parentId) {
                    logger.warn('Adding menu item operation is missing id');
                    return;
                }

                //  Grab the application menu template.
                appMenuTemplate = menuTemplateFromAppMenu();

                //  If the parentId is 'main', then we use the top-level of the
                //  data structure.
                if (menuItemInfo.parentId === 'main') {
                    parentMenu = appMenuTemplate;
                } else {
                    //  Otherwise, we need to look for the menu item with the
                    //  parentId.
                    parentMenu = getDescriptorForId(appMenuTemplate,
                                                    menuItemInfo.parentId);
                    if (!parentMenu) {
                        logger.warn('Unable to locate menu: ',
                                        menuItemInfo.parentId);
                        return;
                    }

                    //  Grab the submenu of what we found.
                    parentMenu = parentMenu.submenu;

                    if (!parentMenu) {
                        logger.warn('The menu named: ',
                                        menuItemInfo.parentId +
                                            ' has no submenu');
                        return;
                    }
                }

                //  Push on the new menu content.
                parentMenu.push(menuItemInfo);

                //  Rebuild the application menu and set it.
                newAppMenu = Menu.buildFromTemplate(appMenuTemplate);
                Menu.setApplicationMenu(newAppMenu);
            });

        //  ---

        /**
         * Event emitted when TIBET wants to delete a menu item.
         */
        ipcMain.on('TP.sig.RemoveMenuItem',
            function(event, menuItemInfo) {

                var appMenuTemplate,

                    menuItem,

                    newAppMenu;

                if (!menuItemInfo.id) {
                    logger.warn('Removing menu item operation is missing id');
                    return;
                }

                //  Grab the application menu template.
                appMenuTemplate = menuTemplateFromAppMenu();

                //  Look for the menu item with the supplied id.
                menuItem = getDescriptorIndexForId(appMenuTemplate,
                                                    menuItemInfo.id);
                if (!menuItem) {
                    logger.warn('Unable to locate menu item: ', menuItemInfo.id);
                    return;
                }

                //  Remove the menu item from its parent menu in the structure.
                menuItem[0].splice(menuItem[1], 1);

                //  Rebuild the application menu and set it.
                newAppMenu = Menu.buildFromTemplate(appMenuTemplate);
                Menu.setApplicationMenu(newAppMenu);
            });

        //  ---

        /**
         * Event emitted when TIBET wants to change some part of the state of a
         * menu item.
         */
        ipcMain.on('TP.sig.UpdateMenuItem',
            function(event, menuItemInfo) {
                var appMenuTemplate,

                    menuItem,

                    keys,
                    i,

                    newAppMenu;

                if (!menuItemInfo.id) {
                    logger.warn('Updating menu item operation is missing id');
                    return;
                }

                //  Grab the application menu template.
                appMenuTemplate = menuTemplateFromAppMenu();

                //  Look for the menu item with the supplied id.
                menuItem = getDescriptorForId(appMenuTemplate, menuItemInfo.id);
                if (!menuItem) {
                    logger.warn('Unable to locate menu item: ', menuItemInfo.id);
                    return;
                }

                //  Iterate over all of the keys in the supplied info and set
                //  the menu item's properties to those values.
                keys = Object.keys(menuItemInfo);
                for (i = 0; i < keys.length; i++) {
                    menuItem[keys[i]] = menuItemInfo[keys[i]];
                }

                //  Rebuild the application menu and set it.
                newAppMenu = Menu.buildFromTemplate(appMenuTemplate);
                Menu.setApplicationMenu(newAppMenu);
            });

    };

}(this));
