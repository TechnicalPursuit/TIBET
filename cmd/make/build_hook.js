(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        make.log('building TIBET hook file...');

        if (!make.sh.test('-d', './lib/src')) {
            make.sh.mkdir('./lib/src');
        }

        make.task('_rollup_hook')().then(resolve, reject);
    };

}());
