(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var options;

        //  Blend standard CLI flags and reparse to get command options.
        options = make.reparse(make.cfg('make.compression.parse_options'));

        make.helpers.rollup_lib(make, {
            config: 'full',
            headers: true,
            minify: false,
            zip: options.zip,
            brotli: options.brotli
        }).then(function() {
            if (options.minify) {
                return make.helpers.rollup_lib(make, {
                    config: 'full',
                    headers: true,
                    minify: true,
                    zip: options.zip,
                    brotli: options.brotli
                });
            }
        }).then(resolve, reject);
    };

}());
