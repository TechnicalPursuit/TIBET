(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        make.log('building TIBET loader...');

        if (!make.sh.test('-d', './lib/src')) {
            make.sh.mkdir('./lib/src');
        }

        make.task('_rollup_loader')().then(resolve, reject);
    };

}());
