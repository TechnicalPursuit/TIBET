(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        make.log('building TIBET workers...');

        if (!make.sh.test('-d', make.CLI.joinPaths('.', 'lib', 'src'))) {
            make.sh.mkdir(
                make.CLI.joinPaths('.', 'lib', 'src'));
        }

        make.chain('_rollup_worker', '_rollup_service_worker').then(resolve, reject);
    };

}());
