(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        make.log('building TIBET loader...');

        if (!make.sh.test('-d', make.path.join('.', 'lib', 'src'))) {
            make.sh.mkdir(
                make.path.join('.', 'lib', 'src'));
        }

        make.task('_rollup_loader')().then(resolve, reject);
    };

}());
