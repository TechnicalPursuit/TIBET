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

            path,
            CLI,
            electron,

            BrowserWindow,
            ipcMain,
            chokidar,

            include,
            watchcfg,

            setupWatcherCfg,

            watcher,

            activateWatcher,
            deactivateWatcher;

        pkg = options.pkg;
        app = options.app;
        logger = options.logger;

        //  NOTE this plugin loads prior to the logger so our best option here
        //  is to use the prelog function to queue logging output.
        meta = {
            type: 'plugin',
            name: 'watcher'
        };

        logger.system('loading watcher', meta);

        //  ---
        //  Requires
        //  ---

        path = require('path');
        CLI = require('../TIBET-INF/tibet/src/tibet/cli/_cli');
        electron = require('electron');

        //  Module to create browser window.
        BrowserWindow = electron.BrowserWindow;

        //  Module to communicate with renderer processes over IPC.
        ipcMain = electron.ipcMain;

        chokidar = require('chokidar');

        //  ---

        setupWatcherCfg = function() {

            var watchroot,
                escaper,
                exclude,
                pattern;

            //  Expand out the path we'll be watching. This should almost always
            //  be the application root.
            watchroot = path.resolve(pkg.expandPath(
                pkg.getcfg('electron.watch.root') || '~app'));

            logger.debug('Electron FileWatch interface rooted at: ' + watchroot);

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
                include = watchroot;
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
                cwd: watchroot,
                ignoreInitial: true,
                ignorePermissionErrors: true,
                persistent: true
            };
        };

        //  ---

        activateWatcher = function() {

            var mainContents;

            watcher = chokidar.watch(include, watchcfg);

            mainContents = BrowserWindow.fromId(options.mainid).webContents;

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
                    eventName;

                //  Files marked 'nowatch' from the "client side" are placed in
                //  an internal list we use as part of the overall ignore
                //  filtering.
                //  Check that list here before assuming we should process
                //  change.
                ignoredFilesList = pkg.getcfg('uri.$$ignored_changes_list');
                if (ignoredFilesList) {
                    ignoreIndex = ignoredFilesList.indexOf(file);

                    if (ignoreIndex !== -1) {
                        ignoredFilesList.splice(ignoreIndex, 1);
                        return;
                    }
                }

                fullpath = CLI.joinPaths(watchcfg.cwd, file);
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

                eventName = pkg.getcfg('electron.watch.event');

                entry = {
                    path: tibetpath,
                    event: eventName,
                    details: {}
                };

                mainContents.send('TP.sig.MessageReceived', entry);
            });
        };

        //  ---

        deactivateWatcher = async function() {

            //  Close chokidar - this is an asynchronous method.
            await watcher.close();
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
                    setupWatcherCfg();
                });

        //  ---
        //  Other watcher event handlers.
        //  ---

        /**
         * Event emitted when the watcher should be activated.
         */
        ipcMain.handle('TP.sig.ActivateWatcher',
            function(event, payload) {
                activateWatcher();
            });

        //  ---

        /**
         * Event emitted when the watcher should be deactivated.
         */
        ipcMain.handle('TP.sig.DeactivateWatcher',
            function(event, payload) {
                deactivateWatcher();
            });

    };

}(this));
