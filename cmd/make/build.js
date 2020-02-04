(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var fullpath,
            options,
            config;

        make.log('building tibet...');

        //  If --release was specified then we want to force certain options for
        //  downstream rollup processing.
        options = make.reparse({boolean: ['release']});

        if (options.release) {
            config = make.cfg('make.compression.parse_options');
            config.default.zip = true;
            config.default.brotli = true;
        }

        fullpath = make.CLI.joinPaths(make.CLI.expandPath('~'), 'lib', 'src');
        if (!make.sh.test('-d', fullpath)) {
            make.sh.mkdir(fullpath);
        }

        make.chain('_rollup_service_worker',
                    '_rollup_loader',
                    'sync_dna_styles',
                    'sync_service_workers',
                    '_lint',
                    'clean',
                    'build_tibet'
        ).then(resolve, reject);
    };

}());
