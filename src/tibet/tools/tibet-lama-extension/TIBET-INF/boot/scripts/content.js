/**
 * @overview Logic for the "inspected page" portion of the extension. This file
 *     is injected into the main app window so it can communicate with DevTools.
 *     Since both the main app and devtools Lama components are TIBET-enabled
 *     the goal is to create a signaling channel between two TIBET endpoints.
 * @copyright Copyright (C) 2020 Technical Pursuit Inc. All rights reserved.
 */


/* global chrome:false */
/* eslint indent:0, consistent-this:0, one-var: 0 */

(function() {

'use strict';

/**
 */
const log = function(...args) {
    console.log('TIBET Lama (content.js) -', ...args);
};


/**
 */
window.addEventListener('load',
function() {

    log('running window load handler');

    /**
     */
    document.body.addEventListener('TIBETAppDidStart', function(evt) {
        var port;

        log('TIBETAppDidStart');

        //  Create a message port from devtools to our window.
        port = chrome.runtime.connect({name: 'contentscript'});


        /**
         * Listen for inbound messages from devtools and dispatch them to the
         * local window so code in the window can see and respond to them.
         * @param {Object} msg The message in object form (may be a string).
         */
        port.onMessage.addListener(function(msg) {
            log('message from devtools: ', msg);

            //  Post to our window ;) Why? Because we can't actually talk to
            //  code in the window... but code in the window can watch the
            //  window for messages and filter based on the 'type'.
            window.postMessage({type: 'TO_APP', payload: msg}, '*');
        });


        /**
         * Listen for messages to our window. Some of these will be from
         * ourselves (per port.onMessage above) but we filter those.
         * @param {MessageEvent} event The message-specific event.
         */
        window.addEventListener('message', function(event) {

            //  Source has to be the local window. This ensures we're only going
            //  to process messages going from our window toward devtools.
            if (event.source !== window) {
                return;
            }

            if (event.data && event.data.type &&
                    event.data.type === 'FROM_APP') {

                log('message to devtools: ', event.data.payload);

                //  Send message from app to the devtools side by posting it to
                //  our end of the channel. NOTE we only send the payload.
                port.postMessage(event.data.payload);
            }

        }, false);
    });

}, false);

}());
