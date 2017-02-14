(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        make.log('building app...');

        make.chain('clean',
            'checkup',
            'build_resources',
            '_rollup'
        ).then(resolve, reject);
    };

}());
