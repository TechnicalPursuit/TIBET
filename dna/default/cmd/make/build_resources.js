(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var config,
            options,
            profile,
            pkg,

            info;

        make.log('processing resources...');

        //  Parse command line for package parameters to get config value.
        options = make.reparse(make.cfg('cli.make.package.parse_options'));

        //  Check command line, or use value of build.profile
        profile = make.cfg('build.profile', 'main@base');

        pkg = options.package;
        if (!pkg) {
            pkg = '~app_cfg/' + profile.split('@')[0] + '.xml';
        }

        //  Check command line, or use value of build.profile
        config = options.config;
        if (!config) {
            config = profile.split('@')[1];
        }

        info = {
            pkg: pkg,
            config: config
        };

        make.helpers.resource_build(make, info).then(function() {
            resolve();
        }, reject);
    };

}());
