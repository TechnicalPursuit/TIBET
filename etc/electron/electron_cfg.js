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

        setcfg('electron.updater.download', false);
        setcfg('electron.updater.onstart', false);

        //  top-level dir used in the main Electron process to determine where
        //  to set cwd for the watcher. This should almost always be left as
        //  ~app to ensure the watcher's set up to cover all app resources. Use
        //  uri.watch.include and uri.watch.exclude to include and exclude any
        //  specific subdirectories or files below the watch.root. NOTE that
        //  uri.source.* parameters are shared client/server so they're in
        //  tibet_cfg rather than this TDS-only config file.
        setcfg('electron.watch.root', '~app');

        setcfg('electron.watch.heartbeat', 10000);   //  aka sse-heartbeat
        setcfg('electron.watch.retry', 3000);        //  aka sse.retry cfg
    };

    module.exports = Config;

}(this));
