(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var targets;

        make.log('removing build artifacts...');

        targets = [
            'clean_cache',
            'clean_docs',
            'clean_lint',
            'clean_build'
        ];

        make.chain(targets).then(resolve, reject);
    };

}());
