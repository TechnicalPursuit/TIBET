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

const {remote} = require('electron');

let currentWindow;

currentWindow = remote.BrowserWindow.getFocusedWindow();

//  A utility that will close the current window.
window.closeCurrentWindow = function() {
    currentWindow.close();
};
