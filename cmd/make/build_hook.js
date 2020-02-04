(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        make.log('building TIBET hook file...');

        if (!make.sh.test('-d', make.CLI.joinPaths('.', 'lib', 'src'))) {
            make.sh.mkdir(
                make.CLI.joinPaths('.', 'lib', 'src'));
        }

        make.task('_rollup_hook')().then(resolve, reject);
    };

}());
