(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var dir,
            options,
            config;

        make.log('rolling up assets...');

        //  Make sure build directory exists.
        dir = make.CLI.expandPath('~app_build');
        if (!make.sh.test('-d', dir)) {
            make.sh.mkdir(dir);
        }

        //  Parse command line for package and compression information.
        options = make.blend(make.cfg('make.package.parse_options'),
            make.cfg('make.compression.parse_options'));
        options = make.reparse(options);

        //  Check command line, task options, or just default to base.
        config = options.config || this.options.config || 'base';

        //  Build both a development and deployment variation.
        make.helpers.rollup_app(make, {
            config: config,
            headers: true,
            minify: false,
            zip: options.zip,
            brotli: options.brotli
        }).then(function() {
            if (options.minify) {
                return make.helpers.rollup_app(make, {
                    config: config,
                    headers: true,
                    minify: true,
                    zip: options.zip,
                    brotli: options.brotli
                });
            }
        }).then(resolve, reject);
    };

}());
