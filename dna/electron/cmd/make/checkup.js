(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        make.log('checking app...');

        make.chain('check_lint', 'check_package', 'check_tests').then(
            resolve, reject);
    };

}());
