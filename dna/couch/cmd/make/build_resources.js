(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var config,
            options,
            pkg;

        make.log('processing resources...');

        //  Parse command line for package parameters to get config value.
        options = make.reparse(make.cfg('make.package.parse_options'));

        //  Check command line, task options, or just default to base.
        pkg = options.package || this.options.package || '~app_cfg/main.xml';
        config = options.config || this.options.config || 'base';

        make.helpers.resource_build(make, {
            pkg: pkg,
            config: config
        }).then(resolve, reject);
    };

}());
