(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var date,
            ts,
            options;

        //  Reparse to capture any zip/brotli configuration flags.
        options = make.reparse(make.cfg('make.compression.parse_options'));

        date = new Date();
        ts = '' + date.getUTCFullYear() +
            ('0' + (date.getUTCMonth() + 1)).slice(-2) +
            ('0' + date.getUTCDate()).slice(-2);

        make.helpers.transform(make, {
            source: '~lib_boot/tibet_loader_pre_template.js',
            target: '~lib_boot/tibet_loader_pre.js',
            data: {version: ts}
        }).then(function() {
            return make.helpers.rollup_lib(make, {
                config: 'loader',
                minify: false,
                zip: options.zip,
                brotli: options.brotli
            });
        }).then(function() {
            return make.helpers.rollup_lib(make, {
                config: 'loader',
                minify: true,
                zip: options.zip,
                brotli: options.brotli
            });
        }).then(resolve, reject);
    };

}());
