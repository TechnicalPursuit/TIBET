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

        //  If we're building for a release and the 'bumpversion' option is
        //  *not* false, then we add a flag to the info to bump the patch part
        //  of the app's version.
        if (options.release) {
            if (options.bumpversion === undefined ||
                options.bumpversion === true) {
                info.bumppatch = true;
            }
        }

        make.helpers.resource_build(make, info).then(resolve, reject);
    };

}());
