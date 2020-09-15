/**
 * @overview Logic for the devtools "background" page of the extension. This
 *     file simply connects the two ends of our port.onMessage pipeline between
 *     devtools (devtools.js) logic and inspected window (content.js) logic.
 * @copyright Copyright (C) 2020 Technical Pursuit Inc. All rights reserved.
 */

/* global chrome:false consoleHook:true */
/* eslint indent:0, consistent-this:0, one-var: 0 */

//  NOTE NOTE NOTE this MUST be outside the IFFE to work correctly.
consoleHook = console;

(function() {

'use strict';

var devtoolsPorts,
    contentScriptPorts;

devtoolsPorts = [];
contentScriptPorts = [];


/**
 *
 */
const log = function(...args) {
    //  NOTE: use consoleHook because we'll remap it from devtools.js when the
    //  window has loaded to a console you can actually see ;).
    consoleHook.log('TIBET Lama (background.js) -', ...args);
};


/**
 *
 */
chrome.runtime.onConnect.addListener(function(port) {

     log('onConnect');

    //  Wire up the 'devtools' side of the connection.
    //  These are messages from DevTools toward the inspected window.
    if (port.name === 'devtools') {

        devtoolsPorts.push(port);

        /**
         * Remove port when destroyed (eg when devtools instance is closed)
         */
        port.onDisconnect.addListener(function() {
            var i;

            i = devtoolsPorts.indexOf(port);
            if (i !== -1) {
                devtoolsPorts.splice(i, 1);
            }
        });

        /**
         *
         */
        port.onMessage.addListener(function(msg) {

            //  Received message from devtools.
            log('relaying message from devtools: ', msg);

            //  Post the message to all of the content script pages.
            contentScriptPorts.forEach(function(contentScriptPort) {
                contentScriptPort.postMessage(msg);
            });
        });

        return;
    }

    //  Wire up the 'content script' side of the connection.
    //  These are messages from the inspected window toward DevTools.
    if (port.name === 'contentscript') {

        contentScriptPorts.push(port);

        /**
         * Remove port when destroyed (eg when devtools instance is closed)
         */
        port.onDisconnect.addListener(function() {
            var i;

            i = contentScriptPorts.indexOf(port);
            if (i !== -1) {
                contentScriptPorts.splice(i, 1);
            }
        });

        /**
         *
         */
        port.onMessage.addListener(function(msg) {

            //  Received message from a content script.
            log('relaying message from app: ', msg);

            //  Post the message to all of the devtools pages.
            devtoolsPorts.forEach(function(devToolsPort) {
                devToolsPort.postMessage(msg);
            });
        });

        return;
    }
});

}());
