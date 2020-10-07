(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var targets;

        make.log('building TIBET bootfiles...');

        if (!make.sh.test('-d', make.CLI.joinPaths('.', 'lib', 'src'))) {
            make.sh.mkdir(
                make.CLI.joinPaths('.', 'lib', 'src'));
        }

        targets = [
            '_rollup_loader',
            '_rollup_login',
            '_rollup_worker',
            '_rollup_service_worker',
            '_rollup_hook'
        ];

        make.chain(targets).then(resolve, reject);
    };

}());
