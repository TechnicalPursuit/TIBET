/* eslint-disable no-cond-assign */
/* global start, send, getRow, toJSON */
(function() {
    'use strict';

    module.exports = function(head, req) {
        var row;

        // specify our headers
        start({
            headers: {
                'Content-Type': 'text/html'
            }
        });

        // send the respond, line by line
        send('<html><body><table>');
        send('<tr><th>ID</th><th>Key</th><th>Value</th></tr>');

        while (row = getRow()) {
            send(''.concat(
                '<tr>',
                '<td>' + toJSON(row.id) + '</td>',
                '<td>' + toJSON(row.key) + '</td>',
                '<td>' + toJSON(row.value) + '</td>',
                '</tr>'
            ));
        }

        send('</table></body></html>');
    };

}());
