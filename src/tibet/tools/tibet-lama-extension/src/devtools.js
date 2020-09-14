/**
 */

/* global chrome:false */
/* eslint indent:0, one-var:0 */
(function() {

'use strict';


/**
 */
const isInstrumented = function(aWindow) {

    if (!aWindow) {
        return false;
    }

    return aWindow.$$topWindow !== undefined;
};


/**
 */
const instrumentWindow = function(aWindow) {

    if (!aWindow) {
        console.error('missing window parameter');
        return;
    }

    //  Already instrumented.
    if (aWindow.$$topWindow) {
        console.log('ignoring instrumented window');
        return;
    }

    console.log('instrumenting window');

    aWindow.$$topWindow = aWindow;
    TP.boot.initializeCanvas(aWindow);
};

/**
 */
const panelDidCreate = function(extensionPanel, info) {
    var panelWindow,
        data,
        port;

    console.log('created panel: ' + info.title);

    //  TODO:   one port to devtools? If so we need to filter messages by panel
    //  ID or some other filter to avoid messaging all 5 panels. Also, we don't
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

        if (isInstrumented(panelWin)) {
            return;
        }

        panelWindow = instrumentWindow(panelWin);

//  TODO: do we need this data flush thing for sidebars?

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

        //  Set content to actually trigger TIBET-enhanced rendering.
        const win = TP.wrap(panelWin);
        win.getDocument().getBody().setContent(info.content);

        return;
    });
};


/**
 */
const sidebarDidCreate = function(sidebarPanel, info) {
    var panelWindow,
        data,
        port,
        blank;

    data = [];
    port = chrome.runtime.connect({name: 'devtools'});

    console.log('created sidebar: ' + info.title);

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
    sidebarPanel.onShown.addListener((panelWin) => {
        if (isInstrumented(panelWin)) {
            return;
        }

        panelWindow = instrumentWindow(panelWin);

        //  Set content to actually trigger TIBET-enhanced rendering.
        const win = TP.wrap(panelWin);
        win.getDocument().getBody().setContent(info.content);
    });

    //  We have to set page content at least once to initialize the panel. If we
    //  don't do this we never seem to get the onShown event notification.
    //  NOTE there's no callback, returned promise, etc. for this operation.
    blank = TP.sys.getcfg('devtools.blank_page');
    sidebarPanel.setPage(blank);
};


/**
 */
const createExtensionUI = function() {
    var panels,
        sidebars,
        blank;

    blank = TP.sys.getcfg('devtools.blank_page');

    panels = TP.sys.getcfg('devtools.panels');
    sidebars = TP.sys.getcfg('devtools.sidebars');

    panels.forEach(function(info) {
        if (info.disabled) {
            return;
        }
        chrome.devtools.panels.create(
            info.title, info.icon, blank, (pane) => {
                panelDidCreate(pane, info);
            });
    });

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


/**
 */
window.addEventListener('load',
function() {

    console.log('running devtools.js load');

    document.body.addEventListener(
        'TIBETAppDidStart',
        function(evt) {

            console.log('got to TIBETAppDidStart in devtools');

            createExtensionUI();
        });
},
false);

}());
