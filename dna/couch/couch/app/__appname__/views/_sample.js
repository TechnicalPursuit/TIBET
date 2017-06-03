/* global emit */
(function() {
    'use strict';

    module.exports = {
        map: function(doc) {
            if (doc.type) {
                emit(doc.type);
            }
        },
        reduce: '_count'
    };

}());
