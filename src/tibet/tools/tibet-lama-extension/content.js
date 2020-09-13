/* global chrome:false
*/

window.addEventListener('load',
    function() {

        console.log('running content_script.js load');

        document.body.addEventListener(
            'TIBETAppDidStart',
            function(evt) {
                var port;

                console.log('got to TIBETAppDidStart in content_script');

                port = chrome.runtime.connect({name: 'contentscript'});

                port.onMessage.addListener(function(msg) {
                    console.log('Received message from background script', msg);
                    window.postMessage({type: 'TO_APP', payload: msg}, '*');
                });

                window.addEventListener('message', function(event) {

                    //  We only accept messages from ourselves
                    if (event.source !== window) {
                        return;
                    }

                    //  If this event came to the developer tools from the
                    //  inspected page, then forward it on to the developer
                    //  tools.
                    if (event.data.type && event.data.type === 'FROM_APP') {
                        console.log('FROM APP: ' + event.data.payload);
                        port.postMessage(event.data.payload);
                    }

                }, false);
            });
    },
    false);

