(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var config,
            options,
            pkg,

            info;

        make.log('processing resources...');

        //  Parse command line for package parameters to get config value.
        options = make.reparse(make.cfg('make.package.parse_options'));

        //  Check command line, task options, or just default to base.
        pkg = options.package || this.options.package || '~app_cfg/main.xml';
        config = options.config || this.options.config || 'base';

        info = {
            pkg: pkg,
            config: config
        };

        make.helpers.resource_build(make, info).then(function() {
            make.helpers.update_packaging_profile(make, info);
            resolve();
        }, reject);
    };

}());
