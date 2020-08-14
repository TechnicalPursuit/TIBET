//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @overview An auxiliary support file for TIBET-based Electron applications
 *     that contains code that can be called from the TIBET application, but
 *     contains sandboxed NodeJS. This allows the TIBET application to invoke
 *     NodeJS code without calling it directly.
 */
//  ========================================================================

/* eslint-disable one-var */

const {remote, contextBridge} = require('electron');

//  ---
//  Common TIBET utilities that will be made available inside of TIBET under
//  the TP.extern.electron_lib_utils object.
//  ---

const lib_preload = require('./TIBET-INF/tibet/etc/electron/preload_lib.js');
contextBridge.exposeInMainWorld('preload_lib_utils', lib_preload());

//  ---
//  Other app-level utils. We recommend putting other application-level
//  utilities on this object. These will be made available inside of TIBET under
//  the TP.extern.electron_app_utils object.
//  ---

//  NB: Do *NOT* remove this object definition.
const app_preload = {};
contextBridge.exposeInMainWorld('preload_app_utils', app_preload);

//  A sample utility that will close the current window. This can be safely
//  removed if not required (and probably should be since the default now for
//  TIBET Electron apps is to turn off the 'remote' object - if you leave this
//  code in, you need to set 'enableRemoteModule' to true in electron.js).
app_preload.closeCurrentWindow = function() {
    let currentWindow;

    currentWindow = remote.BrowserWindow.getFocusedWindow();
    currentWindow.close();
};

/* eslint-enable one-var */
