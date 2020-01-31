(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        make.log('building TIBET hook file...');

        if (!make.sh.test('-d', make.path.join('.', 'lib', 'src'))) {
            make.sh.mkdir(
                make.path.join('.', 'lib', 'src'));
        }

        make.task('_rollup_hook')().then(resolve, reject);
    };

}());
