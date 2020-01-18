(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var options;

        //  Reparse to capture any zip/brotli configuration flags.
        options = make.reparse(make.cfg('make.compression.parse_options'));

        make.helpers.rollup_lib(make, {
            config: 'service_worker'
        }).then(function() {
            return make.helpers.rollup_lib(make, {
                config: 'service_worker',
                minify: true,
                zip: false,     //  can't load gzip for service workers
                brotli: false   //  can't load brotli for service workers
            });
        }).then(resolve, reject);
    };

}());
