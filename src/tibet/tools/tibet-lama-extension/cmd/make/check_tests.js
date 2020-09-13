(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var result;

        make.log('running unit tests...');

        result = make.sh.exec('tibet test');
        if (result.code !== 0) {
            reject();
            return;
        }

        resolve();
    };

}());
