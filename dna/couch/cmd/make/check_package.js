(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var config,
            options,
            profile,
            pkg;

        make.log('verifying packages...');

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

        make.helpers.package_check(make, {
            pkg: pkg,
            config: config
        }).then(resolve, reject);
    };

}());
