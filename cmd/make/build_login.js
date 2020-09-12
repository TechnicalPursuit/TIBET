(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        make.log('building TIBET login...');

        if (!make.sh.test('-d', make.CLI.joinPaths('.', 'lib', 'src'))) {
            make.sh.mkdir(
                make.CLI.joinPaths('.', 'lib', 'src'));
        }

        make.task('_rollup_login')().then(resolve, reject);
    };

}());
