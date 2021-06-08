(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var options,
            config,
            profile;

        make.log('linking build targets...');

        //  Parse command line for package and compression information.
        options = make.blend(make.cfg('cli.make.package.parse_options'),
            make.cfg('cli.make.compression.parse_options'));
        options = make.reparse(options);

        //  Check command line, or use value of build.profile
        config = options.config;
        if (!config) {
            profile = make.cfg('build.profile', 'main@base');
            config = profile.split('@')[1];
        }

        //  Build both a development and deployment variation.
        make.helpers.linkup_app(make, {
            config: config
        }).then(resolve, reject);
    };

}());
