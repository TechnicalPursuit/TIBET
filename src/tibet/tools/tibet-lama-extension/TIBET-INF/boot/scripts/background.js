/**
 * @overview Logic for the devtools "background" page of the extension. This
 *     file simply connects the two ends of our port.onMessage pipeline between
 *     devtools (devtools.js) logic and inspected window (content.js) logic.
 * @copyright Copyright (C) 2020 Technical Pursuit Inc. All rights reserved.
 */

/* global chrome:false */
/* eslint indent:0, consistent-this:0, one-var: 0 */

(function(root) {

'use strict';

var devtoolsPorts,
    contentScriptPorts,

    consoleHook;

devtoolsPorts = [];
contentScriptPorts = [];

consoleHook = root.console;

root.setConsoleHook = function(aHook) {
    consoleHook = aHook;
};

/**
 *
 */
chrome.runtime.onConnect.addListener(function(port) {

    //  NOTE: we create a closure'd logging routine that captures the console
    //  instance from 'root' (which is updated in devtools.js) so that we can
    //  actually see console output from the background page.
    const log = function(...args) {
        consoleHook.log('TIBET Lama (background.js) -', ...args);
    };

    log('onConnect');

    //  Wire up the 'devtools' side of the connection.
    //  These are messages from DevTools toward the inspected window.
    if (port.name === 'tibet_devtools') {

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
    if (port.name === 'tibet_inspected') {

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
            log('relaying message to devtools: ', msg);

            //  Post the message to all of the devtools pages.
            devtoolsPorts.forEach(function(devToolsPort) {
                devToolsPort.postMessage(msg);
            });
        });

        return;
    }
});

}(this));
