(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var result;

        make.log('checking for lint...');

        result = make.sh.exec('tibet lint');
        if (result.code !== 0) {
            reject();
            return;
        }

        resolve();
    };

}());
