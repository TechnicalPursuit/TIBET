(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        make.log('verifying package(s)...');

        make.helpers.package_check(make, {
            pkg: '~lib_cfg/TIBET.xml',
            config: 'developer'
        }).then(
        function(output) {
            if (output) {
                make.info('' + output);
            }
            resolve();
        }).catch(reject);
    };

}());
