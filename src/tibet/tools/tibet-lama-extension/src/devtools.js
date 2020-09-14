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
        console.error('missing window parameter');
        return;
    }

    //  Be careful of cross-origin errors (particularly tricky when trying move
    //  panels between top and bottom).
    try {
        if (aWindow.$$topWindow) {
            console.log('ignoring instrumented window');
            return;
        }

        console.log('instrumenting window');

        aWindow.$$topWindow = aWindow;
        TP.boot.initializeCanvas(aWindow);

        return aWindow;

    } catch (e) {
        console.log('ignoring cross-origin window');

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
    var panelWindow,
        data,
        port;

    console.log('created panel: ' + info.title);

    //  TODO:   one port to devtools? If so we need to filter messages by panel
    //  ID or some other filter to avoid messaging all panels. Also, we don't
    //  want the same "data buffer" so we should check up on that.
    data = [];
    port = chrome.runtime.connect({name: 'devtools'});

    port.onMessage.addListener((msg) => {
        //  Write information to the panel, if exists.
        //  If we don't have a panel reference (yet), queue the data.
        if (panelWindow) {
            panelWindow.toPanel(msg);
        } else {
            data.push(msg);
        }
    });

    //  Add listener for onShown and use that to capture and instrument the
    //  window. NOTE that the extensionPanel passed to the panelDidCreate method
    //  is NOT a window but for TIBET operation we need the window handle.
    extensionPanel.onShown.addListener((panelWin) => {
        var msg;

        console.log('showing panel: ' + info.title);

        if (isInstrumented(panelWin)) {
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

        //  TODO:   clean this up

        //  Flush any queued data to the panel.
        msg = data.shift();
        while (msg) {
            panelWin.toPanel(msg);
            msg = data.shift();
        }

        //  Define a method that will route messages from the panel back
        //  into the port (that is connected to the background page).
        extensionPanel.fromPanel = function(aMsg) {
            port.postMessage(aMsg);
        };

        return;
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
        data,
        port,
        blank;

    console.log('created sidebar: ' + info.title);

    //  TODO:   one port to devtools? If so we need to filter messages by panel
    //  ID or some other filter to avoid messaging all panels. Also, we don't
    //  want the same "data buffer" so we should check up on that.
    data = [];
    port = chrome.runtime.connect({name: 'devtools'});

    port.onMessage.addListener((msg) => {
        //  Write information to the panel, if exists.
        //  If we don't have a panel reference (yet), queue the data.
        if (panelWindow) {
            panelWindow.toPanel(msg);
        } else {
            data.push(msg);
        }
    });

    //  Instrument with window ref etc. etc. and render initial content.
    //  NOTE that this must be done in the onShown handler during the first
    //  display operation for the pane. The window is not real until then.
    sidebarPane.onShown.addListener((panelWin) => {
        var msg;

        console.log('showing sidebar: ' + info.title);

        if (isInstrumented(panelWin)) {
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

        //  TODO:   clean this up

        //  Flush any queued data to the panel.
        msg = data.shift();
        while (msg) {
            panelWin.toPanel(msg);
            msg = data.shift();
        }

        //  Define a method that will route messages from the panel back
        //  into the port (that is connected to the background page).
        sidebarPane.fromPanel = function(aMsg) {
            port.postMessage(aMsg);
        };
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
            console.log('devtools TIBETAppDidStart');
            createExtensionUI();
        });
},
false);

}());
