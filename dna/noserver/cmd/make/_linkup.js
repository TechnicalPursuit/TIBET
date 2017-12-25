(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var options,
            config;

        make.log('linking build targets...');

        //  Parse command line for package and compression information.
        options = make.blend(make.cfg('make.package.parse_options'),
            make.cfg('make.compression.parse_options'));
        options = make.reparse(options);

        //  Check command line, task options, or just default to base.
        config = options.config || this.options.config || 'base';

        //  Build both a development and deployment variation.
        make.helpers.linkup_app(make, {
            config: config
        }).then(resolve, reject);
    };

}());
