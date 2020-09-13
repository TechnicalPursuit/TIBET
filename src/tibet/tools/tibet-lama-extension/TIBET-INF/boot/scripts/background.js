/* global chrome:false
   consoleFoo:true
*/

//  ----------------------------------------------------------------------------
//  DevTools Connections
//  ----------------------------------------------------------------------------

var devtoolsPorts,
    contentScriptPorts;

devtoolsPorts = [];
contentScriptPorts = [];

consoleFoo = console;

chrome.runtime.onConnect.addListener(function(port) {

    //  Wire up the 'devtools' side of the connection.
    if (port.name === 'devtools') {

        devtoolsPorts.push(port);

        //  Remove port when destroyed (eg when devtools instance is closed)
        port.onDisconnect.addListener(function() {
            var i;

            i = devtoolsPorts.indexOf(port);
            if (i !== -1) {
                devtoolsPorts.splice(i, 1);
            }
        });

        port.onMessage.addListener(function(msg) {

            //  Received message from devtools.
            consoleFoo.log('Received message from devtools page', msg);

            //  Post the message to all of the content script pages.
            contentScriptPorts.forEach(function(contentScriptPort) {
                contentScriptPort.postMessage(msg);
            });
        });

        return;
    }

    //  Wire up the 'content script' side of the connection.
    if (port.name === 'contentscript') {

        contentScriptPorts.push(port);

        //  Remove port when destroyed (eg when devtools instance is closed)
        port.onDisconnect.addListener(function() {
            var i;

            i = contentScriptPorts.indexOf(port);
            if (i !== -1) {
                contentScriptPorts.splice(i, 1);
            }
        });

        port.onMessage.addListener(function(msg) {

            //  Received message from a content script.
            consoleFoo.log('Received message from contents script', msg);

            //  Post the message to all of the devtools pages.
            devtoolsPorts.forEach(function(devToolsPort) {
                devToolsPort.postMessage(msg);
            });
        });

        return;
    }
});

