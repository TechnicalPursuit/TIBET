(function() {
    'use strict';

    module.exports = function(newDoc, oldDoc, userCtx, secObj) {
        if (newDoc.address === undefined) {
            throw new Error({
                forbidden: 'Document must have an address.'
            });
        }
    };

}());
