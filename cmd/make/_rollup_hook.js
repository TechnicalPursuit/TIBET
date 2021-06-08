(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var options;

        //  Blend standard CLI flags and reparse to get command options.
        options = make.reparse(make.cfg('cli.make.compression.parse_options'));

        make.helpers.rollup_lib(make, {
            config: 'hook',
            minify: false,
            zip: options.zip,
            brotli: options.brotli
        }).then(function() {
            return make.helpers.rollup_lib(make, {
                config: 'hook',
                minify: true,
                zip: options.zip,
                brotli: options.brotli
            });
        }).then(resolve, reject);
    };

}());
