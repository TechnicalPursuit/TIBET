/* eslint indent:0 */
(function(root) {

'use strict';

root.onerror = function(msg, url, line, column, errorObj) {
    var str;

    str = msg || 'Error';
    str += ' in file: ' + url + ' line: ' + line + ' column: ' + column;

    if (errorObj) {
        str += '\nSTACK:\n' + errorObj.stack;
    }

    console.error(str);
};
}(this));
