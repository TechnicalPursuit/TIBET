(function() {
    'use strict';

    module.exports = function(doc, req) {

        //  Only mail-related changes.
        if (doc.type !== 'mail') {
            return false;
        }

        // Only 'new' ones
        if (doc.status !== 'new') {
            return false;
        }

        return true; // passed!
    };

}());
