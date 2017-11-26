(function() {
    'use strict';

    module.exports = function(make, resolve, reject) {
        var proc;

        make.defineTaskOptions('_test', {timeout: 1000 * 60 * 15});

        make.log('running unit tests...');

        proc = make.spawn('tibet test');
        proc.on('exit', function(code) {
            code === 0 ? resolve() : reject();
        });
    };
}());
