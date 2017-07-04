(function() {
    'use strict';

    module.exports = {
        index: function(doc) {
            var ret;

            ret = new Document();
            ret.add(doc.subject);

            return ret;
        }
    };
}());
