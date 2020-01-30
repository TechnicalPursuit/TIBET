/* eslint-disable no-global-assign, no-unused-vars, no-console */
(function() {
    'use strict';

    var interval;

    /**
     */
    onmessage = function(evt) {
        console.log('received message in worker_ping.js');

        if (evt.data === 'pong' && interval) {
            clearInterval(interval);
        }

        postMessage('received ' + evt.data);
    };

    interval = setInterval(function() {
        postMessage('ping (reply with pong to ack)');
    }, 5000);

}());
