(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var fullpath,
            options,
            targets,
            config;

        make.log('building app...');

        //  If --release was specified then we want to force certain options for
        //  downstream rollup processing.
        options = make.reparse({boolean: ['release']});

        if (options.release) {
            config = make.cfg('cli.make.compression.parse_options');
            config.default.minify = true;
            config.default.zip = true;
            config.default.brotli = true;
        }

        fullpath = make.CLI.joinPaths(make.CLI.expandPath('~app_build'));
        if (!make.sh.test('-d', fullpath)) {
            make.sh.mkdir(fullpath);
        }

        targets = [
            '_lint',
            'check_package',
            'build_resources',
            '_rollup',
            '_linkup',
            'build_docs'
        ];

        if (options.release) {
            targets.push('build_electron');
        }

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

    module.exports.options = {
        timeout: 1000 * 60 * 10
    };

}());
