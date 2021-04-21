//  ============================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ============================================================================

/**
 * @overview Electron-specific configuration settings. This file is loaded by
 *     the electron.js file and CLI (as needed) but _NOT_ by the client code
 *     (tibet_loader.js). Content here consists of all Electron-related flags.
 */

(function(root) {
    'use strict';

    var Config;

    //  ---
    //  baseline
    //  ---

    /**
     * A configuration function that expects to be passed the setcfg call to
     * invoke. This will normally be TP.sys.setcfg for electron settings.
     */
    Config = function(setcfg) {

        //  The background color to use for windows.
        setcfg('electron.bgcolor', '#171717');

        //  Whether or not to load the Lama extension into DevTools
        setcfg('electron.enableLamaExt', false);

        //  Whether or not we should be in 'developing developer' mode.
        setcfg('electron.developingDevelopr', false);

        //  whether or not to exit when the last window has closed.
        setcfg('electron.exit_on_last_window_close', true);

        //  ---
        //  BOOT
        //  ---

        //  Whether or not to use a login-based startup sequence.
        setcfg('electron.boot.use_login', false);

        //  ---
        //  UPDATER
        //  ---

        //  Whether or not to check for updates when the app first starts.
        setcfg('electron.updater.onstart', false);

        //  ---
        //  WATCHER
        //  ---

        //  top-level dir used in the main Electron process to determine where
        //  to set cwd for the watcher. This should almost always be left as
        //  ~app to ensure the watcher's set up to cover all app resources. Use
        //  uri.watch.include and uri.watch.exclude to include and exclude any
        //  specific subdirectories or files below the watch.root. NOTE that
        //  uri.source.* parameters are shared main/renderer so they're in
        //  tibet_cfg rather than this Electron-only config file.
        setcfg('electron.watch.root', '~app');

        //  the event to send over into TIBET when a watch target has changed.
        setcfg('electron.watch.event', 'fileChange');

        //  ---
        //  LOGGING
        //  ---

        setcfg('electron.log.transports', ['file']);
        setcfg('electron.log.color', true);
        setcfg('electron.log.count', 5);
        setcfg('electron.log.file', '~app_log/electron-{{env}}.log');
        setcfg('electron.log.format', 'dev');
        setcfg('electron.log.level', 'info');
        setcfg('electron.log.size', 5242880); // 5MB
    };

    module.exports = Config;

}(this));
