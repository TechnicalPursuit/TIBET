/* global chrome:false
*/

var panelDidCreate;

panelDidCreate = function(extensionPanel) {

    var currentPanelWin,
        data,
        port,

        shownHandler;

    data = [];
    port = chrome.runtime.connect({name: 'devtools'});

    port.onMessage.addListener(function(msg) {
        //  Write information to the panel, if exists.
        //  If we don't have a panel reference (yet), queue the data.
        if (currentPanelWin) {
            currentPanelWin.toPanel(msg);
        } else {
            data.push(msg);
        }
    });

    extensionPanel.onShown.addListener(
        shownHandler = function(panelWindow) {
            var msg;

            extensionPanel.onShown.removeListener(shownHandler);

            currentPanelWin = panelWindow;

            //  If there is no $$topWindow reference, that means that we haven't
            //  initialized this panel yet.
            if (!panelWindow.$$topWindow) {

                console.log('instrumenting panel');

                panelWindow.$$topWindow = panelWindow;
                TP.boot.initializeCanvas(panelWindow);
            }

            //  Set the UICanvas to be the panel.
            TP.sys.setUICanvas(TP.wrap(panelWindow).getLocalID());

            //  Flush any queued data to the panel.
            msg = data.shift();
            while (msg) {
                currentPanelWin.toPanel(msg);
                msg = data.shift();
            }

            //  Define a method that will route messages from the panel back
            //  into the port (that is connected to the background page).
            currentPanelWin.fromPanel = function(aMsg) {
                port.postMessage(aMsg);
            };

            return;
        });
};

window.addEventListener('load',
    function() {

        console.log('running devtools.js load');

        document.body.addEventListener(
            'TIBETAppDidStart',
            function(evt) {

                console.log('got to TIBETAppDidStart in devtools');

                chrome.devtools.panels.create(
                    'TIBET-Lama',       //  title for the panel tab
                    '',                 //  path to an icon
                    //  path to page for injecting into the tab's area
                    '../../../src/panels/main_panel/main_panel.xhtml',
                    panelDidCreate
                );
            });
    },
    false);
