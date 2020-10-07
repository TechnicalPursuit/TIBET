(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var targets;

        make.log('building TIBET packages...');

        if (!make.sh.test('-d', make.CLI.joinPaths('.', 'lib', 'src'))) {
            make.sh.mkdir(
                make.CLI.joinPaths('.', 'lib', 'src'));
        }

        targets = [
            'check_package',
            'build_boot',
            'build_resources',
            '_rollup_base',
            '_rollup_baseui',
            '_rollup_full',
            '_rollup_developer',
            '_rollup_contributor',
            'build_docs'
        ];

        //  If we're going to clean just do it once via the clean target and
        //  then clear the flag so individual lint, rollup, etc. don't clean.
        if (make.getArgument('clean')) {
            targets.unshift('clean');
            make.options.clean = false;
        }

        //  Let commands know we're doing a build.
        make.options.building = true;

        make.chain(targets).then(resolve, reject);
    };

}());
