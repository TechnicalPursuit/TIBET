(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var fullpath,
            options,
            targets,
            config;

        make.log('building tibet...');

        targets = [
            '_lint',
            'sync_dna_styles',
            'build_workers',
            'sync_service_workers',
            'build_tibet'
        ];

        //  If --release was specified then we want to force certain options for
        //  downstream rollup processing.
        options = make.reparse({boolean: ['release']});

        //  If we're going to clean just do it once via the clean target and
        //  then clear the flag so individual lint, rollup, etc. don't clean.
        if (make.getArgument('clean')) {
            targets.unshift('clean');
            make.options.clean = false;
        }

        //  If we're building for a release then before we clean/lint/etc. run
        //  the test harness and make sure we update config with release
        //  compression rules.
        if (options.release) {
            //  We want '_test' to come *just before* 'build_tibet' - it's
            //  pretty time consuming. '_test' does require the boot system to
            //  be built though, so we do that here as well (even though
            //  build_tibet will do it again - but that's ok, it's cached :-)).
            targets.splice(targets.indexOf('build_tibet'), 0,
                            'build_boot', '_test');

            config = make.cfg('cli.make.compression.parse_options');
            config.default.minify = true;
            config.default.zip = true;
            config.default.brotli = true;
        }

        fullpath = make.CLI.joinPaths(make.CLI.expandPath('~lib_build'));
        if (!make.sh.test('-d', fullpath)) {
            make.sh.mkdir(fullpath);
        }

        //  Let commands know we're doing a build.
        make.options.building = true;

        make.chain(targets).then(resolve, reject);
    };

}());
