(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var result;

        make.log('starting mocha...');

        result = make.nodecli.exec('mocha', '--ui bdd', '--reporter spec',
                './test/mocha/cli_test.js');

        if (result.code !== 0) {
            reject();
            return;
        }

        resolve();
    };

}());
