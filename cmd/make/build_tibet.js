(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        make.log('building TIBET packages...');

        if (!make.sh.test('-d', './lib/src')) {
            make.sh.mkdir('./lib/src');
        }

        make.chain('_rollup_loader',
            '_rollup_hook',
            '_rollup_login',
            'check_package',
            'build_resources',
            '_rollup_base',
            '_rollup_full',
            '_rollup_developer',
            '_rollup_contributor',
            'build_docs').then(resolve, reject);
    };

}());
