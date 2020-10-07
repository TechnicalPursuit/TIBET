(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var targets;

        make.log('removing build artifacts...');

        targets = [
            'clean_docs',
            'clean_logs',
            'clean_lint',
            'clean_build'
        ];

        make.chain(targets).then(resolve, reject);
    };

}());
