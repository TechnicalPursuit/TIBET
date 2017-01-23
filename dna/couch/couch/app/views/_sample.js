/* global emit */
(function() {
    'use strict';

    module.exports = {
        map: function(doc) {
            if (doc.foo) {
                emit(doc._id, doc.foo);
            }
        }
        /*
        , reduce: function(keys, values, rereduce) {
            return sum(values);
        }
        */
    };

}());
