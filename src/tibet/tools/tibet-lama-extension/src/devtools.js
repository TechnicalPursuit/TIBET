//  ========================================================================
/**
 * @copyright Copyright (C) 2020, Technical Pursuit Inc. (TPI) All Rights
 *     Reserved.
 */
//  ========================================================================

/**
 * @overview Logic for the "devtools page" portion of the extension. This file
 *     primarily responsible for initial panel creation and rendering. The panel
 *     and sidebar configuration is read from the TIBET config system so that
 *     this file rarely if ever needs to be altered. Instead you create a custom
 *     tag for the root of each panel and describe it in your tibet.json file.
 * @copyright Copyright (C) 2020 Technical Pursuit Inc. All rights reserved.
 */


/* global chrome:false */
/* eslint indent:0, consistent-this:0, one-var: 0 */

(function() {

'use strict';

let port;

const log = function(...args) {
    console.log('TIBET Lama (devtools.js) -', ...args);
};

//  ---
//  postMessage Plumbing
//  ---

const createCommChannel = function() {

    //  Hack into the background.js page and connect the console ;)
    chrome.extension.getBackgroundPage().setConsoleHook(console);

    port = chrome.runtime.connect({name: 'tibet_devtools'});

    /**
     * Listen for inbound messages from the app and dispatch them to the
     * local window so code in devtools can see and respond to them.
     * @param {Object} msg The message in object form (may be a string).
     */
    port.onMessage.addListener(function(msg) {
        log('message from app: ', msg);

        //  Post to our window ;) Why? Because we can't actually talk to
        //  code in the window... but code in the window can watch the
        //  window for messages and filter based on the 'type'.
        window.postMessage({type: 'TO_DEVTOOLS', payload: msg}, '*');
    });


    /**
     * Listen for messages to our window. Some of these will be from
     * ourselves (per port.onMessage above) but we filter those.
     * @param {MessageEvent} event The message-specific event.
     */
    window.addEventListener('message', function(event) {

        //  Source has to be the local window. This ensures we're only going
        //  to process messages going from our window to the app window.
        if (event.source !== window) {
            return;
        }

        if (event.data && event.data.type &&
                event.data.type === 'FROM_DEVTOOLS') {

            log('message to app: ', event.data.payload);

            //  Send message from devtools to the app side by posting it to
            //  our end of the channel. NOTE we only send the payload.
            port.postMessage(event.data.payload);
        }

    }, false);

};


//  ---
//  Window Functions
//  ---

/**
 * Verifies whether we've already instrumented the window with TIBET hooks.
 * @param {Window} aWindow The window instance to check for instrumentation.
 * @returns {Boolean} true if the window is instrumented.
 */
const isInstrumented = function(aWindow) {
    var instrumented;

    if (!aWindow) {
        return false;
    }

    //  Be careful of cross-origin errors (particularly tricky when trying move
    //  panels between top and bottom).
    try {
        instrumented = aWindow.$$topWindow !== undefined;
    } catch (e) {
        return false;
    }

    return instrumented;
};


/**
 * Instruments a window instance with TIBET infrastructure. The resulting window
 * can then be used as a standardd TIBET canvas.
 * @param {Window} aWindow The window instance to instrument.
 * @returns {Window} The window instance or undefined if instrumentation failed.
 */
const instrumentWindow = function(aWindow) {

    if (!aWindow) {
        log('missing window parameter');
        return;
    }

    //  Be careful of cross-origin errors (particularly tricky when trying move
    //  panels between top and bottom).
    try {
        if (aWindow.$$topWindow) {
            log('ignoring instrumented window');
            return;
        }

        log('instrumenting window');

        aWindow.$$topWindow = aWindow;
        TP.boot.initializeCanvas(aWindow);

        return aWindow;

    } catch (e) {
        log('ignoring cross-origin window');

        //  Be sure to return undefined, not the window, to indicate failure.
        return;
    }
};


//  ---
//  Panel Functions
//  ---

/**
 * Invoked as the standard callback for all panel 'create' calls in the
 * createExtensionUI method. This function instruments the new panel with
 * infrastructure so it operates as a valid TIBET display surface.
 * @param {ExtensionPanel} extensionPanel The instance of extension panel
 *     created by the invoking method.
 * @param {Object} info A TIBET panel panel descriptor as such as:
 * {
 *   "title": "TIBET Lama",
 *   "icon": "./TIBET-INF/boot/media/app_logo.png",
 *   "content": "<tibetlama:lama/>"
 * }
 */
const panelDidCreate = function(extensionPanel, info) {
    var panelWindow;

    log('created panel ' + info.title);

    //  Add listener for onShown and use that to capture and instrument the
    //  window. NOTE that the extensionPanel passed to the panelDidCreate method
    //  is NOT a window but for TIBET operation we need the window handle.
    extensionPanel.onShown.addListener((panelWin) => {

        log('showing panel ' + info.title);

        if (isInstrumented(panelWin)) {
            TP.signal(TP.gid(panelWin),
                'PanelShow', TP.hc(info), TP.sig.RESPONDER_FIRING);
            return;
        }

        panelWindow = instrumentWindow(panelWin);

        //  If no window is returned it's because instrumentation failed.
        //  (usually due to cross-origin issue). One reason is that moving
        //  panels between top and bottom appears to trigger a glitch.
        if (!panelWindow) {
            return;
        }

        //  Set content to actually trigger TIBET-enhanced rendering.
        const win = TP.wrap(panelWin);
        win.getDocument().getBody().setContent(info.content);

        TP.signal(TP.gid(panelWin),
            'PanelShow', TP.hc(info), TP.sig.RESPONDER_FIRING);

        return;
    });

    extensionPanel.onHidden.addListener((panelWin) => {
        log('hiding panel ' + info.title);
        if (isInstrumented(panelWin)) {
            TP.signal(
                TP.gid(panelWin), 'PanelHide', TP.hc(info), TP.sig.RESPONDER_FIRING);
        }
    });
};


//  ---
//  Sidebar Functions
//  ---

/**
 * Invoked as the standard callback for all createSidebarPane calls in the
 * createExtensionUI method. This function instruments the new panel with
 * infrastructure so it operates as a valid TIBET display surface.
 * @param {ExtensionSidebarPane} sidebarPane The instance of sidebar pane
 *     created by the invoking method.
 * @param {Object} info A TIBET sidebar panel descriptor as such as:
 * {
 *   "title": "TIBET",
 *   "panel": "elements",
 *   "content": "<tibetlama:elements/>"
 * }
 */
const sidebarDidCreate = function(sidebarPane, info) {
    var panelWindow,
        blank;

    log('created sidebar ' + info.title);

    //  Instrument with window ref etc. etc. and render initial content.
    //  NOTE that this must be done in the onShown handler during the first
    //  display operation for the pane. The window is not real until then.
    sidebarPane.onShown.addListener((panelWin) => {

        log('showing sidebar ' + info.title);

        if (isInstrumented(panelWin)) {
            TP.signal(TP.gid(panelWin),
                'SidebarShow', TP.hc(info), TP.sig.RESPONDER_FIRING);
            return;
        }

        panelWindow = instrumentWindow(panelWin);

        //  If no window is returned it's because instrumentation failed.
        //  (usually due to cross-origin issue). One reason is that moving
        //  panels between top and bottom appears to trigger a glitch.
        if (!panelWindow) {
            return;
        }

        //  Set content to actually trigger TIBET-enhanced rendering.
        const win = TP.wrap(panelWin);
        win.getDocument().getBody().setContent(info.content);

        TP.signal(TP.gid(panelWin),
            'SidebarShow', TP.hc(info), TP.sig.RESPONDER_FIRING);

        return;
    });

    sidebarPane.onHidden.addListener((panelWin) => {
        log('hiding sidebar ' + info.title);
        if (isInstrumented(panelWin)) {
            TP.signal(TP.gid(panelWin),
                'SidebarHide', TP.hc(info), TP.sig.RESPONDER_FIRING);
        }
    });

    //  We have to set page content at least once to initialize the panel. If we
    //  don't do this we never seem to get the onShown event notification.
    //  NOTE there's no callback, returned promise, etc. for this operation.
    blank = TP.sys.getcfg('devtools.blank_page');
    sidebarPane.setPage(blank);
};


//  ---
//  UI Construction
//  ---

/**
 * Creates panels and sidebars based on configuration data from tibet.json.
 *
 * Each panel should be described the 'devtools.panels' key using the format:
 * {
 *   "title": "TIBET Lama",
 *   "icon": "./TIBET-INF/boot/media/app_logo.png",
 *   "content": "<tibetlama:lama/>"
 * }
 *
 * Each sidebar should be described the 'devtools.sidebars' key as follows:
 * {
 *   "title": "TIBET",
 *   "panel": "elements",
 *   "content": "<tibetlama:elements/>"
 * }
 *
 * NOTE that panels/sidebars with a '"disabled": true' value will be ignored.
 */
const createExtensionUI = function() {
    var blank,
        panels,
        sidebars;

    blank = TP.sys.getcfg('devtools.blank_page');

    //  Build a panel for each configured info block from config. Note that each
    //  panel is initialized with a blank template to avoid cross-origin issues.
    //  Upon load the panel's "content" tag will be injected via panelDidCreate.

    panels = TP.sys.getcfg('devtools.panels');

    panels.forEach(function(info) {
        if (info.disabled) {
            return;
        }
        chrome.devtools.panels.create(
            info.title, info.icon, blank, (pane) => {
                panelDidCreate(pane, info);
            });
    });

    //  Build a panel for each configured info block from config. Note that each
    //  panel is initialized with a blank template to avoid cross-origin issues.
    //  Upon load the panel's "content" tag will be injected via panelDidCreate.

    sidebars = TP.sys.getcfg('devtools.sidebars');

    sidebars.forEach(function(info) {
        if (info.disabled) {
            return;
        }
        chrome.devtools.panels[info.panel].createSidebarPane(info.title,
            (pane) => {
                sidebarDidCreate(pane, info);
            });
    });
};


//  ---
//  Main Handler
//  ---

/**
 * Loads the top-level panels and sidebars upon notification of AppDidStart.
 */
window.addEventListener('load',
function() {
    document.body.addEventListener(
        'TIBETAppDidStart',
        function(evt) {
            log('TIBETAppDidStart');

            createExtensionUI();

            createCommChannel();
        });
},
false);

}());

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
