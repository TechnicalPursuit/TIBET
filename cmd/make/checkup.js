(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        make.chain('_lint', '_test').then(resolve, reject);
    };

}());
