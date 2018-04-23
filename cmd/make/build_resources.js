(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        make.log('processing resources...');

        make.helpers.resource_build(make, {
            pkg: '~lib_cfg/TIBET.xml',
            config: 'contributor'
        }).then(
        function(output) {
            if (output) {
                make.info('' + output);
            }
            resolve();
        }).catch(reject);
    };

}());
