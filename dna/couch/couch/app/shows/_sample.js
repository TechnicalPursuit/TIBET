(function() {
    'use strict';

    module.exports = function(doc, req) {
        if (doc) {
            return 'Hello from ' + doc._id + '!';
        } else {
            return 'Hello, world!';
        }
    };

}());
