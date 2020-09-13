(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var options,
            config;

        make.log('building app...');

        //  If --release was specified then we want to force certain options for
        //  downstream rollup processing.
        options = make.reparse({boolean: ['release']});

        if (options.release) {
            config = make.cfg('make.compression.parse_options');
            config.default.zip = true;
            config.default.brotli = true;
        }

        make.chain('clean',
            'build_docs',
            'build_resources',
            '_rollup',
            '_linkup'
        ).then(resolve, reject);
    };

}());
