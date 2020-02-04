(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var targets,
            options;

        make.log('building TIBET packages...');

        if (!make.sh.test('-d', make.CLI.joinPaths('.', 'lib', 'src'))) {
            make.sh.mkdir(
                make.CLI.joinPaths('.', 'lib', 'src'));
        }

        targets = ['_rollup_loader',
            '_rollup_hook',
            '_rollup_login',
            '_rollup_worker',
            'check_package',
            'build_resources',
            '_rollup_base',
            '_rollup_baseui',
            '_rollup_full',
            '_rollup_developer',
            '_rollup_contributor'
        ];

        options = make.reparse({boolean: 'clean'});

        if (options.clean) {
            targets.push('clean_docs');
        }
        targets.push('build_docs');

        make.chain(targets).then(resolve, reject);
    };

}());
