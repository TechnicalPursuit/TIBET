/* global emit, sum */
(function() {
    'use strict';

    module.exports = {
        map: function(doc) {
            if (doc.type) {
                emit(doc.type, 1);
            }
        },
        reduce: function(keys, values, rereduce) {
            return sum(values);
        }
    };

}());
